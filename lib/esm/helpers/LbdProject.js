"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdDataset = _interopRequireDefault(require("./LbdDataset"));

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _BaseDefinitions = require("./BaseDefinitions");

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _jsonldRemote = require("jsonld-remote");

var _uuid = require("uuid");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LbdProject {
  verbose = false;

  constructor(fetch, accessPoint, verbose = false) {
    if (!accessPoint.endsWith("/")) accessPoint += "/";
    this.fetch = fetch;
    this.accessPoint = accessPoint;
    this.localProject = accessPoint + "local/";
    this.verbose = verbose;
    this.projectId = accessPoint.split('/')[accessPoint.split("/").length - 2];
    this.accessService = new _accessService.default(fetch);
    this.dataService = new _dataService.default(fetch);
    this.lbdService = new _LbdService.default(fetch);
    this.queryEngine = (0, _actorInitSparql.newEngine)();
  }

  async checkExistence() {
    const status = await this.fetch(this.accessPoint, {
      method: "HEAD"
    }).then(result => result.status);

    if (status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async init() {
    const data = await this.fetch(this.localProject, {
      headers: {
        "Accept": "application/ld+json"
      }
    }).then(i => i.json());
    this.data = data;
    return data;
  } // initialise a project


  async create(makePublic = false, existingPartialProjects = []) {
    const local = this.accessPoint + 'local/';
    existingPartialProjects.push(local); // create global access point

    await this.dataService.createContainer(this.accessPoint, makePublic);
    await this.dataService.createContainer(local, makePublic); // create different registries

    await this.createRegistryContainer("datasets/", makePublic, _lbd.default.hasDatasetRegistry);
    await this.createRegistryContainer("references/", makePublic, _lbd.default.hasReferenceRegistry);
    await this.createRegistryContainer("services/", makePublic, _lbd.default.hasServiceRegistry);

    for (const part of existingPartialProjects) {
      await this.addPartialProject(part);
    }

    await this.init();
  }

  async addPartialProject(part) {
    const q0 = `INSERT DATA {
        <${this.accessPoint}> <${_lbd.default.aggregates}> <${part}> .
        }`;
    await this.dataService.sparqlUpdate(this.accessPoint, q0);
  }

  async addStakeholder(webId, accessRights = {
    read: true,
    append: false,
    write: false,
    control: false
  }) {
    await this.accessService.setResourceAccess(this.accessPoint, accessRights, _BaseDefinitions.ResourceType.CONTAINER, webId);
  }

  async delete() {
    await this.dataService.deleteContainer(this.accessPoint, true);
  }

  async findAllPartialProjects() {
    const projects = await this.queryEngine.query(`SELECT ?proj WHERE {<${this.accessPoint}> <${_lbd.default.aggregates}> ?proj}`, {
      sources: [this.accessPoint],
      fetch: this.fetch
    }).then(i => i.bindings()).then(i => i.map(r => r.get('?proj').value));
    return projects;
  }

  async findPartialProject(webId) {
    const repo = await this.lbdService.getProjectRegistry(webId);
    const partialProjectOfStakeholder = repo + this.projectId + '/local/';
    const status = await this.fetch(partialProjectOfStakeholder, {
      method: "HEAD"
    }).then(res => res.status);

    if (status === 200) {
      return partialProjectOfStakeholder;
    } else {
      throw new Error(`UNAUTHORIZED: This repository does not exist or you don't have the required access rights`);
    }
  }

  async addPartialProjectByStakeholder(webId) {
    const partialProjectUrl = await this.findPartialProject(webId);
    await this.addPartialProject(partialProjectUrl);
    return partialProjectUrl;
  }

  async createRegistryContainer(containerName, makePublic, property) {
    if (!containerName.endsWith('/')) containerName += "/";
    const containerUrl = this.localProject + containerName;
    await this.dataService.createContainer(containerUrl, makePublic);
    const q0 = `INSERT DATA {
        <${this.localProject}> <${property}> <${containerUrl}> .
      }`;
    await this.dataService.sparqlUpdate(this.localProject, q0);
  } /////////////////////////////////////////////////////////
  /////////////////////// DATASETS ////////////////////////
  /////////////////////////////////////////////////////////

  /**
   * 
   * @param makePublic 
   * @param id
   * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
   * @returns 
   */


  async addDataset(options = {}, makePublic = false, id = (0, _uuid.v4)()) {
    const subject = (0, _jsonldRemote.extract)(this.data, this.localProject);
    const datasetRegistry = subject[_lbd.default.hasDatasetRegistry][0]["@id"];
    const datasetUrl = datasetRegistry + id + "/";
    const theDataset = new _LbdDataset.default(this.fetch, datasetUrl);
    await theDataset.create(options, makePublic);
    return theDataset;
  }

  async deleteDataset(datasetUrl) {
    if (!datasetUrl.endsWith('/')) datasetUrl += "/";
    const ds = new _LbdDataset.default(this.fetch, datasetUrl);
    await ds.delete();
  }

  async deleteDatasetById(datasetId) {
    const subject = (0, _jsonldRemote.extract)(this.data, this.localProject);
    const datasetRegistry = subject[_lbd.default.hasDatasetRegistry][0]["@id"];
    const datasetUrl = datasetRegistry + datasetId + "/";
    const ds = new _LbdDataset.default(this.fetch, datasetUrl);
    await ds.delete();
  } /////////////////////////////////////////////////////////
  //////////////////// DISTRIBUTIONS///////////////////////
  /////////////////////////////////////////////////////////


  async addDistribution(datasetURL, distribution) {}

  async deleteDistribution(datasetURL, distribution) {}

  async updateDistribution(datasetURL, distribution) {}

  async queryDistribution(datasetURL, distribution) {} /////////////////////////////////////////////////////////
  ////////////////////// REFERENCES////////////////////////
  /////////////////////////////////////////////////////////
  // get all references related to a specific abstract Concept


  async getReferences() {}

  async deleteReference() {} // register a reference for an existing abstract concept


  async addReference() {} // register an abstract concept


  async addConcept() {} // register an alias for an existing concept


  async addAlias() {} // get the abstract Concept related to a dataset/distribution + id


  async getConcept() {} /////////////////////////////////////////////////////////
  /////////////////////// SERVICES ////////////////////////
  /////////////////////////////////////////////////////////
  // register a service in the Service Registry


  async addService() {} // delete a service from the Service Registry


  async deleteService() {} // get all services from a Service Registry


  async getAllServices() {}

}

exports.default = LbdProject;
//# sourceMappingURL=LbdProject.js.map