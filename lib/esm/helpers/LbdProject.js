"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _LbdConcept = _interopRequireDefault(require("./LbdConcept"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdDataset = _interopRequireDefault(require("./LbdDataset"));

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _BaseDefinitions = require("./BaseDefinitions");

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _functions = require("./functions");

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LbdProject {
  verbose = false;

  constructor(session, accessPoint, verbose = false) {
    if (!accessPoint.endsWith("/")) accessPoint += "/";
    this.session = session;
    this.fetch = session.fetch;
    this.accessPoint = accessPoint;
    this.localProject = accessPoint + "local/";
    this.verbose = verbose;
    this.projectId = accessPoint.split('/')[accessPoint.split("/").length - 2];
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
    this.lbdService = new _LbdService.default(session);
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


  async create(existingPartialProjects = [], options = {}, makePublic = false) {
    const local = this.accessPoint + 'local/';
    existingPartialProjects.push(local); // create global access point

    await this.dataService.createContainer(this.accessPoint, makePublic);
    await this.dataService.createContainer(local, makePublic);

    if (makePublic) {
      let aclDefault = `INSERT {?rule <${_vocabCommonRdf.ACL.default}> <${local}>} WHERE {?rule a <${_vocabCommonRdf.ACL.Authorization}> ; <${_vocabCommonRdf.ACL.agentClass}> <${_vocabCommonRdf.FOAF.Agent}>}`;
      await this.dataService.sparqlUpdate(local + '.acl', aclDefault);
    } // create different registries


    await this.createRegistryContainer("datasets/", makePublic, _lbd.default.hasDatasetRegistry);
    const referenceContainerUrl = await this.createRegistryContainer("references/", makePublic, _lbd.default.hasReferenceRegistry);
    await this.createRegistryContainer("services/", makePublic, _lbd.default.hasServiceRegistry);

    for (const part of existingPartialProjects) {
      await this.addPartialProject(part);
    }

    let q = `INSERT DATA {<${this.accessPoint}> <${_vocabCommonRdf.DCTERMS.creator}> "${this.session.info.webId}" . }`;
    await this.dataService.sparqlUpdate(local, q);
    await this.dataService.sparqlUpdate(this.accessPoint, q); // create optional metadata (e.g. label etc.)

    if (Object.keys(options).length > 0) {
      let q0 = `INSERT DATA { `;

      for (const key of Object.keys(options)) {
        q0 += `<${this.accessPoint}> <${key}> "${options[key]}" .`;
      }

      q0 += "}";
      await this.dataService.sparqlUpdate(this.accessPoint, q0);
    }

    const referenceMeta = new _LbdDataset.default(this.session, referenceContainerUrl);
    await referenceMeta.create();
    await referenceMeta.addDistribution(Buffer.from(""), "text/turtle", {}, "data", makePublic);
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
    const myEngine = (0, _actorInitSparql.newEngine)();
    const projects = await myEngine.query(`SELECT ?proj WHERE {<${this.accessPoint}> <${_lbd.default.aggregates}> ?proj}`, {
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
    return containerUrl;
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
    const subject = (0, _functions.extract)(this.data, this.localProject);
    const datasetRegistry = subject[_lbd.default.hasDatasetRegistry][0]["@id"];
    const datasetUrl = datasetRegistry + id + "/";
    const theDataset = new _LbdDataset.default(this.session, datasetUrl);
    await theDataset.create(options, makePublic);
    return theDataset;
  }

  async deleteDataset(datasetUrl) {
    if (!datasetUrl.endsWith('/')) datasetUrl += "/";
    const ds = new _LbdDataset.default(this.session, datasetUrl);
    await ds.delete();
  }

  async deleteDatasetById(datasetId) {
    const subject = (0, _functions.extract)(this.data, this.localProject);
    const datasetRegistry = subject[_lbd.default.hasDatasetRegistry][0]["@id"];
    const datasetUrl = datasetRegistry + datasetId + "/";
    const ds = new _LbdDataset.default(this.session, datasetUrl);
    await ds.delete();
  }

  async getAllPartialProjects() {
    const myEngine = (0, _actorInitSparql.newEngine)();
    const q = `SELECT ?partial WHERE {<${this.accessPoint}> <${_lbd.default.aggregates}> ?partial}`;
    const results = await myEngine.query(q, {
      sources: [this.accessPoint],
      fetch: this.fetch
    });
    const {
      data
    } = await myEngine.resultToString(results, 'application/sparql-results+json');
    const asJson = await (0, _utils.parseStream)(data);
    const partials = asJson["results"].bindings.map(item => item["partial"].value);
    console.log('partials', partials);
    return partials;
  }

  async getSingleQueryResult(source, property) {
    const myEngine = (0, _actorInitSparql.newEngine)();
    const q = `SELECT ?res WHERE {<${source}> <${property}> ?res}`;
    const bindings = await myEngine.query(q, {
      sources: [source],
      fetch: this.fetch
    }).then(i => i.bindings());
    return bindings[0].get("?res").value;
  }

  async getAllDatasetUrls(options) {
    const myEngine = (0, _actorInitSparql.newEngine)();
    const subject = (0, _functions.extract)(this.data, this.localProject);
    const sources = [];

    if (options && options.local) {
      sources.push(subject[_lbd.default.hasDatasetRegistry][0]["@id"]);
    } else {
      const partials = await this.getAllPartialProjects();

      for (const p of partials) {
        const dsReg = await this.getSingleQueryResult(p, _lbd.default.hasDatasetRegistry);
        sources.push(dsReg);
      }
    }

    let q;

    if (!options || !options.query) {
      q = `SELECT ?dataset WHERE {?registry <${_vocabCommonRdf.LDP.contains}> ?dataset}`;
    } else {
      q = options.query;
    }

    const results = await myEngine.query(q, {
      sources,
      fetch: this.fetch
    });
    const {
      data
    } = await myEngine.resultToString(results, 'application/sparql-results+json');

    if (options && options.asStream) {
      return data;
    } else {
      const parsed = await (0, _utils.parseStream)(data);
      return parsed["results"].bindings.map(i => i["dataset"].value);
    }
  } /////////////////////////////////////////////////////////
  ////////////////////// REFERENCES////////////////////////
  /////////////////////////////////////////////////////////
  // get all references related to a specific abstract Concept


  async addConcept() {
    const subject = (0, _functions.extract)(this.data, this.localProject);
    const referenceRegistry = subject[_lbd.default.hasReferenceRegistry][0]["@id"];
    const ref = new _LbdConcept.default(this.session, referenceRegistry);
    await ref.create();
    return ref;
  }

  async deleteConcept(url) {
    const parts = url.split("/");
    const id = parts.pop();
    const referenceRegistry = parts.join("/");
    console.log('id, referenceRegistry', id, referenceRegistry);
    const ref = new _LbdConcept.default(this.session, referenceRegistry, id);
    await ref.delete();
  } // register an alias for an existing concept


  async addAlias() {} // get the abstract Concept related to a dataset/distribution + id


  async getConcept() {} /////////////////////////////////////////////////////////
  /////////////////////// QUERY ////////////////////////
  /////////////////////////////////////////////////////////


  async queryProject() {// if there is a satellite
    // if there is no satellite
  }

}

exports.default = LbdProject;
//# sourceMappingURL=LbdProject.js.map