"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _LbdConcept = _interopRequireDefault(require("./LbdConcept"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdDataset = _interopRequireDefault(require("./LbdDataset"));

var _lbd = _interopRequireDefault(require("./helpers/vocab/lbd"));

var _BaseDefinitions = require("./helpers/BaseDefinitions");

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _functions = require("./helpers/functions");

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _utils = require("./helpers/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LbdProject {
  verbose = false;

  /**
   * 
   * @param session an (authenticated) Solid session
   * @param accessPoint The main accesspoint of the project. This is an aggregator containing the different partial projects of the LBDserver instance
   * @param verbose optional parameter for logging purposes
   */
  constructor(session, accessPoint, verbose = false) {
    if (!accessPoint.endsWith("/")) accessPoint += "/";
    this.session = session;
    this.fetch = session.fetch;
    this.accessPoint = accessPoint;
    this.localProject = accessPoint + "local/";
    this.verbose = verbose;
    this.projectId = accessPoint.split("/")[accessPoint.split("/").length - 2];
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
    this.lbdService = new _LbdService.default(session);
  }
  /**
   * @description Checks whether a project with this access point already exists
   * @returns Boolean: true = the project exists / false = the project doesn't exist
   */


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
  /** 
   * @description Initialize the project in your application. In short, this adds project metadata to your LbdProject instance
   */


  async init() {
    const data = await this.fetch(this.localProject, {
      headers: {
        Accept: "application/ld+json"
      }
    }).then(i => i.json());
    this.data = data;
    return data;
  }
  /**
   * @description Create an LBDserver project on your Pod
   * @param existingPartialProjects optional: if the project is already initialized on other stakeholder pods. Adds the existing partial projects to the Pod-specific access point
   * @param options Metadata for the project. To be in format {[predicate]: value}
   * @param makePublic access rights: true = public; false = only the creator
   */


  async create(existingPartialProjects = [], options = {}, makePublic = false) {
    const local = this.accessPoint + "local/";
    existingPartialProjects.push(local); // create global access point

    await this.dataService.createContainer(this.accessPoint, makePublic);
    await this.dataService.createContainer(local, makePublic);

    if (makePublic) {
      let aclDefault = `INSERT {?rule <${_vocabCommonRdf.ACL.default}> <${local}>} WHERE {?rule a <${_vocabCommonRdf.ACL.Authorization}> ; <${_vocabCommonRdf.ACL.agentClass}> <${_vocabCommonRdf.FOAF.Agent}>}`;
      await this.dataService.sparqlUpdate(local + ".acl", aclDefault);
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
  /**
   * @description Add a partial project to a Pod-specific access point
   * @param part Partial project to add to a Pod-specific access point
   */


  async addPartialProject(part) {
    const q0 = `INSERT DATA {
        <${this.accessPoint}> <${_lbd.default.aggregates}> <${part}> .
        }`;
    await this.dataService.sparqlUpdate(this.accessPoint, q0);
  }
  /**
   * @description Add a stakeholder to an LBDserver project
   * @param webId The WebID/card of the stakeholder
   * @param accessRights the access rights this stakeholder should have.
   */


  async addStakeholder(webId, accessRights = {
    read: true,
    append: false,
    write: false,
    control: false
  }) {
    await this.accessService.setResourceAccess(this.accessPoint, accessRights, _BaseDefinitions.ResourceType.CONTAINER, webId);
  }
  /**
   * @description delete an LBDserver project (locally)
   */


  async delete() {
    await this.dataService.deleteContainer(this.accessPoint, true);
  }
  /**
   * @description find all the partial projects from the indicated project access point
   */


  async findAllPartialProjects() {
    return await (0, _utils.getQueryResult)(this.accessPoint, _lbd.default.aggregates, this.fetch, false);
  }
  /**
   * @description Find the partial project provided by this stakeholder
   * @param webId The webID of the stakeholder whom's partial project you want to find
   * @returns The URL of the partial project
   */


  async findPartialProject(webId) {
    const repo = await this.lbdService.getProjectRegistry(webId);
    const partialProjectOfStakeholder = repo + this.projectId + "/local/";
    const status = await this.fetch(partialProjectOfStakeholder, {
      method: "HEAD"
    }).then(res => res.status);

    if (status === 200) {
      return partialProjectOfStakeholder;
    } else {
      throw new Error(`UNAUTHORIZED: This repository does not exist or you don't have the required access rights`);
    }
  }
  /**
   * @description Add this stakeholder's partial project corresponding with this project (same GUID)
   * @param webId The webID of the stakeholder whom's partial project you want to add
   * @returns the URL of the partial project
   */


  async addPartialProjectByStakeholder(webId) {
    const partialProjectUrl = await this.findPartialProject(webId);
    await this.addPartialProject(partialProjectUrl);
    return partialProjectUrl;
  }

  async createRegistryContainer(containerName, makePublic, property) {
    if (!containerName.endsWith("/")) containerName += "/";
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
   * @description Add a dataset to the project
   * @param makePublic initial access rights for the dataset
   * @param id optional id for the dataset - a GUID is created by default
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
  /**
   * @description Delete a dataset by URL
   * @param datasetUrl The URL of the dataset 
   */


  async deleteDataset(datasetUrl) {
    if (!datasetUrl.endsWith("/")) datasetUrl += "/";
    const ds = new _LbdDataset.default(this.session, datasetUrl);
    await ds.delete();
  }
  /**
   * @description delete a dataset by its ID
   * @param datasetId The GUID of the dataset to be deleted
   */


  async deleteDatasetById(datasetId) {
    const subject = (0, _functions.extract)(this.data, this.localProject);
    const datasetRegistry = subject[_lbd.default.hasDatasetRegistry][0]["@id"];
    const datasetUrl = datasetRegistry + datasetId + "/";
    const ds = new _LbdDataset.default(this.session, datasetUrl);
    await ds.delete();
  }
  /**
   * @description Get all datasets within this project
   * @param options {query: query to override, asStream: consume the results as a stream, local: query only the local project}
   * @returns 
   */


  async getAllDatasetUrls(options) {
    const myEngine = (0, _actorInitSparql.newEngine)();
    const subject = (0, _functions.extract)(this.data, this.localProject);
    const sources = [];

    if (options && options.local) {
      sources.push(subject[_lbd.default.hasDatasetRegistry][0]["@id"]);
    } else {
      const partials = await this.findAllPartialProjects();

      for (const p of partials) {
        const dsReg = await (0, _utils.getQueryResult)(p, _lbd.default.hasDatasetRegistry, this.fetch, true);
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
    } = await myEngine.resultToString(results, "application/sparql-results+json");

    if (options && options.asStream) {
      return data;
    } else {
      const parsed = await (0, _utils.parseStream)(data);
      return parsed["results"].bindings.map(i => i["dataset"].value);
    }
  } /////////////////////////////////////////////////////////
  ////////////////////// REFERENCES////////////////////////
  /////////////////////////////////////////////////////////

  /**
   * @description Add a concept to the local project registry
   * @returns an LBDconcept Instance
   */


  async addConcept() {
    const subject = (0, _functions.extract)(this.data, this.localProject);
    const referenceRegistry = subject[_lbd.default.hasReferenceRegistry][0]["@id"];
    const ref = new _LbdConcept.default(this.session, referenceRegistry);
    await ref.create();
    return ref;
  }
  /**
   * @description delete a concept by ID
   * @param url the URL of the concept to be deleted
   */


  async deleteConcept(url) {
    const parts = url.split("/");
    const id = parts.pop();
    const referenceRegistry = parts.join("/");
    const ref = new _LbdConcept.default(this.session, referenceRegistry);
    await ref.delete();
  }
  /**
   * @description Find the main concept by one of its representations: an identifier and a dataset
   * @param identifier the Identifier of the representation
   * @param dataset the dataset where the representation resides
   * @param distribution (optional) the distribution of the representation
   * @returns 
   */


  async getConceptByIdentifier(identifier, dataset, distribution) {
    const myEngine = (0, _actorInitSparql.newEngine)(); // find all the reference registries of the aggregated partial projects

    const partials = await this.findAllPartialProjects();
    let sources = [];

    for (const p of partials) {
      const referenceRegistry = await (0, _utils.getQueryResult)(p, _lbd.default.hasReferenceRegistry, this.fetch, true);
      const rq = `SELECT ?downloadURL ?dist WHERE {<${referenceRegistry}> <${_vocabCommonRdf.DCAT.distribution}> ?dist . ?dist <${_vocabCommonRdf.DCAT.downloadURL}> ?downloadURL . OPTIONAL {?dist <${_vocabCommonRdf.DCAT.accessURL}> ?accessURL .}}`;
      const results = await myEngine.query(rq, {
        sources: [referenceRegistry],
        fetch: this.fetch
      }).then(r => r.bindings()).then(b => b.map(bi => {
        return {
          downloadURL: bi.get("?downloadURL"),
          accessURL: bi.get("?accessURL")
        };
      }));
      sources = [...sources, ...results];
    }

    const downloadURLs = sources.map(item => item.downloadURL.id);
    const q = `SELECT ?concept ?alias WHERE {
      ?concept <${_lbd.default.hasReference}> ?ref .
      ?ref <${_lbd.default.inDataset}> <${dataset}> ;
        <${_lbd.default.hasIdentifier}> ?idUrl .
      ?idUrl <http://schema.org/value> "${identifier}" .
      OPTIONAL {?concept <${_vocabCommonRdf.OWL.sameAs}> ?alias}
  }`;
    const aliases = new Set();
    await myEngine.query(q, {
      sources: downloadURLs,
      fetch: this.fetch
    }).then(r => r.bindings()).then(b => b.forEach(bi => {
      aliases.add(bi.get("?concept").value);
      if (bi.get("?alias")) aliases.add(bi.get("?alias"));
    }));
    const concept = {
      aliases: [],
      references: []
    };

    for (let v of aliases.values()) {
      concept.aliases.push(v);
      const idQ = `SELECT ?dataset ?dist ?identifier WHERE {
          <${v}> <${_lbd.default.hasReference}> ?ref .
          ?ref <${_lbd.default.inDataset}> ?dataset ;
            <${_lbd.default.hasIdentifier}> ?idUrl .
          ?idUrl <http://schema.org/value> ?identifier ;
            <${_lbd.default.inDistribution}> ?dist .
        }`;
      const bindings = await myEngine.query(idQ, {
        sources: downloadURLs,
        fetch: this.fetch
      }).then(response => response.bindings());
      bindings.map(b => {
        concept.references.push({
          dataset: b.get("?dataset").value,
          distribution: b.get("?dist").value,
          identifier: b.get("?identifier").value
        });
      });
    }

    const subject = (0, _functions.extract)(this.data, this.localProject);
    const referenceRegistry = subject[_lbd.default.hasReferenceRegistry][0]["@id"];
    const theConcept = new _LbdConcept.default(this.session, referenceRegistry);
    theConcept.init(concept);
    return theConcept; //     const aliases = {}
    //     asJson["results"].bindings.forEach(item => {
    //       const alias = item["alias"].value
    //       const distribution = item["dist"].value
    //       const dataset = item["dataset"].value
    //       const identifier = item["identifier"].value
    //       if (!Object.keys(aliases).includes(alias)) {
    //         aliases[alias] = []
    //       }
    // -    })
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