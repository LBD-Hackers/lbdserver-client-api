"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LbdProject = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _LbdConcept = require("./LbdConcept");

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdDataset = require("./LbdDataset");

var _lbds = _interopRequireDefault(require("./helpers/vocab/lbds"));

var _BaseDefinitions = require("./helpers/BaseDefinitions");

var _LbdService = require("./LbdService");

var _functions = require("./helpers/functions");

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _utils = require("./helpers/utils");

var _querySparql = require("@comunica/query-sparql");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LbdProject {
  // include queryEngine to allow caching of querydata etc.

  /**
   * 
   * @param session an (authenticated) Solid session
   * @param accessPoint The main accesspoint of the project. This is an aggregator containing the different partial projects of the LBDserver instance
   */
  constructor(session, accessPoint) {
    if (!accessPoint.endsWith("/")) accessPoint += "/";
    this.session = session;
    this.fetch = session.fetch;
    this.accessPoint = accessPoint;
    this.localProject = accessPoint + "local/";
    this.projectId = accessPoint.split("/")[accessPoint.split("/").length - 2];
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
    this.lbdService = new _LbdService.LbdService(session);
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


    await this.createRegistryContainer("datasets/", makePublic, _lbds.default.hasDatasetRegistry);
    const referenceContainerUrl = await this.createRegistryContainer("references/", makePublic, _lbds.default.hasReferenceRegistry);
    await this.createRegistryContainer("services/", makePublic, _lbds.default.hasServiceRegistry);

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

    const referenceMeta = new _LbdDataset.LbdDataset(this.session, referenceContainerUrl);
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
        <${this.accessPoint}> <${_lbds.default.aggregates}> <${part}> .
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
    return await (0, _utils.getQueryResult)(this.accessPoint, _lbds.default.aggregates, this.fetch, false);
  }
  /**
   * @description Find the partial project provided by this stakeholder
   * @param webId The webID of the stakeholder whom's partial project you want to find
   * @returns The URL of the partial project
   */


  async findPartialProject(webId) {
    const repo = await this.lbdService.getProjectRegistry(webId); // console.log('repo', repo)

    const partialProjectOfStakeholder = repo + this.projectId + "/local/";
    return partialProjectOfStakeholder; // console.log('partialProjectOfStakeholder', partialProjectOfStakeholder)
    // const status = await this.fetch(partialProjectOfStakeholder, {
    //   method: "HEAD",
    // }).then((res) => res.status);
    // if (status === 200) {
    //   return partialProjectOfStakeholder;
    // } else {
    //   throw new Error(
    //     `UNAUTHORIZED: This repository does not exist or you don't have the required access rights`
    //   );
    // }
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
    const datasetRegistry = subject[_lbds.default.hasDatasetRegistry][0]["@id"];
    const datasetUrl = datasetRegistry + id + "/";
    const theDataset = new _LbdDataset.LbdDataset(this.session, datasetUrl);
    await theDataset.create(options, makePublic);
    return theDataset;
  }
  /**
   * @description Delete a dataset by URL
   * @param datasetUrl The URL of the dataset 
   */


  async deleteDataset(datasetUrl) {
    if (!datasetUrl.endsWith("/")) datasetUrl += "/";
    const ds = new _LbdDataset.LbdDataset(this.session, datasetUrl);
    await ds.delete();
  }
  /**
   * @description delete a dataset by its ID
   * @param datasetId The GUID of the dataset to be deleted
   */


  async deleteDatasetById(datasetId) {
    const subject = (0, _functions.extract)(this.data, this.localProject);
    const datasetRegistry = subject[_lbds.default.hasDatasetRegistry][0]["@id"];
    const datasetUrl = datasetRegistry + datasetId + "/";
    const ds = new _LbdDataset.LbdDataset(this.session, datasetUrl);
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
      sources.push(subject[_lbds.default.hasDatasetRegistry][0]["@id"]);
    } else {
      const partials = await this.findAllPartialProjects();

      for (const p of partials) {
        const dsReg = await (0, _utils.getQueryResult)(p, _lbds.default.hasDatasetRegistry, this.fetch, true);
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


  async addConcept(id) {
    const subject = (0, _functions.extract)(this.data, this.localProject);
    const referenceRegistry = subject[_lbds.default.hasReferenceRegistry][0]["@id"];
    const ref = new _LbdConcept.LbdConcept(this.session, referenceRegistry);
    await ref.create(id);
    return ref;
  }

  getReferenceRegistry() {
    const subject = (0, _functions.extract)(this.data, this.localProject);
    return subject[_lbds.default.hasReferenceRegistry][0]["@id"];
  }

  getDatasetRegistry() {
    const subject = (0, _functions.extract)(this.data, this.localProject);
    return subject[_lbds.default.hasDatasetRegistry][0]["@id"];
  }

  async getAllReferenceRegistries() {
    const partials = await this.findAllPartialProjects();
    const registries = [];

    for (const partial of partials) {
      const reg = await (0, _utils.getQueryResult)(partial, _lbds.default.hasReferenceRegistry, this.fetch, true);
      registries.push(reg + "data");
    }

    return registries;
  }
  /**
   * @description delete a concept by ID
   * @param url the URL of the concept to be deleted
   */


  async deleteConcept(url) {
    const parts = url.split("/");
    const id = parts.pop();
    const referenceRegistry = parts.join("/");
    const ref = new _LbdConcept.LbdConcept(this.session, referenceRegistry);
    await ref.delete();
  }
  /**
   * @description Find the main concept by one of its representations: an identifier and a dataset
   * @param identifier the Identifier of the representation
   * @param dataset the dataset where the representation resides
   * @param distribution (optional) the distribution of the representation
   * @returns 
   */


  async getConceptByIdentifier(identifier, dataset, distribution, options) {
    let myEngine;

    if (options && options.queryEngine) {
      myEngine = options.queryEngine;
    } else {
      myEngine = new _querySparql.QueryEngine();
    } // find all the reference registries of the aggregated partial projects


    const partials = await this.findAllPartialProjects();
    let sources = [];

    for (const p of partials) {
      const referenceRegistry = await (0, _utils.getQueryResult)(p, _lbds.default.hasReferenceRegistry, this.fetch, true);
      sources.push(referenceRegistry + "data");
    }

    let id;
    if (identifier.startsWith("http")) id = `<${identifier}>`;else id = `"${identifier}"`;
    const q = `SELECT ?concept WHERE {
      ?concept <${_lbds.default.hasReference}> ?ref .
      ?ref <${_lbds.default.inDataset}> <${dataset}> ;
        <${_lbds.default.hasIdentifier}> ?idUrl .
      ?idUrl <http://schema.org/value> ${id} .
  } LIMIT 1`;
    const results = await myEngine.queryBindings(q, {
      sources,
      fetch: this.fetch
    }).then(r => r.toArray());

    if (results.length > 0) {
      const raw = results[0].get('concept').value;
      const theConcept = await this.getConcept(raw);
      return theConcept;
    } else {
      return undefined;
    } //     const aliases = {}
    //     asJson["results"].bindings.forEach(item => {
    //       const alias = item["alias"].value
    //       const distribution = item["dist"].value
    //       const dataset = item["dataset"].value
    //       const identifier = item["identifier"].value
    //       if (!Object.keys(aliases).includes(alias)) {
    //         aliases[alias] = []
    //       }
    // -    })

  }
  /**
  * @description Find the main concept by one of its representations: an identifier and a dataset
  * @param identifier the Identifier of the representation
  * @param dataset the dataset where the representation resides
  * @param distribution (optional) the distribution of the representation
  * @returns 
  */


  async getConceptByIdentifierOld(identifier, dataset, distribution, options) {
    let myEngine;

    if (options && options.queryEngine) {
      myEngine = options.queryEngine;
    } else {
      myEngine = new _querySparql.QueryEngine();
    } // find all the reference registries of the aggregated partial projects


    const partials = await this.findAllPartialProjects();
    let sources = [];

    for (const p of partials) {
      const referenceRegistry = await (0, _utils.getQueryResult)(p, _lbds.default.hasReferenceRegistry, this.fetch, true);
      const rq = `SELECT ?downloadURL ?dist WHERE {<${referenceRegistry}> <${_vocabCommonRdf.DCAT.distribution}> ?dist . ?dist <${_vocabCommonRdf.DCAT.downloadURL}> ?downloadURL . OPTIONAL {?dist <${_vocabCommonRdf.DCAT.accessURL}> ?accessURL .}}`;
      const bindingsStream = await myEngine.queryBindings(rq, {
        sources: [referenceRegistry],
        fetch: this.fetch
      });
      const results = await bindingsStream.toArray().then(res => res.map(item => {
        return {
          downloadURL: item.get("downloadURL").value,
          accessURL: item.get("accessURL") && item.get("accessURL").value
        };
      }));
      sources = [...sources, ...results];
    }

    const downloadURLs = sources.map(item => item.downloadURL);
    let id;
    if (identifier.startsWith("http")) id = `<${identifier}>`;else id = `"${identifier}"`;
    const q = `SELECT ?concept ?alias WHERE {
        ?concept <${_lbds.default.hasReference}> ?ref .
        ?ref <${_lbds.default.inDataset}> <${dataset}> ;
          <${_lbds.default.hasIdentifier}> ?idUrl .
        ?idUrl <http://schema.org/value> ${id} .
        OPTIONAL {?concept <${_vocabCommonRdf.OWL.sameAs}> ?alias}
    }`;
    const aliases = new Set();
    await myEngine.queryBindings(q, {
      sources: downloadURLs,
      fetch: this.fetch
    }).then(r => r.toArray()).then(bindings => bindings.forEach(bi => {
      aliases.add(bi.get("concept").value);
      if (bi.get("alias")) aliases.add(bi.get("alias").value);
    }));
    const concept = {
      aliases: [],
      references: []
    };

    for (let v of aliases.values()) {
      concept.aliases.push(v);
      const idQ = `SELECT ?dataset ?dist ?identifier WHERE {
            <${v}> <${_lbds.default.hasReference}> ?ref .
            ?ref <${_lbds.default.inDataset}> ?dataset ;
              <${_lbds.default.hasIdentifier}> ?idUrl .
            ?idUrl <http://schema.org/value> ?identifier ;
              <${_lbds.default.inDistribution}> ?dist .
          }`;
      const bindings = await myEngine.queryBindings(idQ, {
        sources: downloadURLs,
        fetch: this.fetch
      }).then(response => response.toArray());
      bindings.map(b => {
        concept.references.push({
          dataset: b.get("dataset").value,
          distribution: b.get("dist").value,
          identifier: b.get("identifier").value
        });
      });
    }

    const subject = (0, _functions.extract)(this.data, this.localProject);
    const referenceRegistry = subject[_lbds.default.hasReferenceRegistry][0]["@id"];
    const theConcept = new _LbdConcept.LbdConcept(this.session, referenceRegistry);
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
  }

  async getConcept(url, options) {
    let myEngine;

    if (options && options.queryEngine) {
      myEngine = options.queryEngine;
    } else {
      myEngine = new _querySparql.QueryEngine();
    }

    const concept = {
      aliases: [],
      references: []
    }; // find all the aliases

    const conceptRegistry = url.split('#')[0] + '';
    const q_alias = `SELECT ?alias
    WHERE {
      <${url}> <${_vocabCommonRdf.OWL.sameAs}> ?alias
    }`;
    const aliases = new Set();
    aliases.add(url);
    const bindingsStream0 = await myEngine.queryBindings(q_alias, {
      sources: [conceptRegistry],
      fetch: this.fetch
    });
    await bindingsStream0.toArray().then(res => res.forEach(b => {
      aliases.add(b.get('alias').value);
    }));
    concept.aliases = Array.from(aliases);

    for (const alias of concept.aliases) {
      const reg = alias.split('#')[0];
      const q1 = `SELECT ?dataset ?distribution ?id
      WHERE {
        <${alias}> a <${_lbds.default.Concept}> ;
        <${_lbds.default.hasReference}> ?ref .
        ?ref <${_lbds.default.hasIdentifier}> ?identifier ;
           <${_lbds.default.inDataset}> ?dataset .
        ?identifier <${_lbds.default.inDistribution}> ?distribution ;
            <http://schema.org/value> ?id .  
      }`;
      const bindingsStream = await myEngine.queryBindings(q1, {
        sources: [reg],
        fetch: this.fetch
      });
      await bindingsStream.toArray().then(res => res.forEach(b => {
        concept.references.push({
          dataset: b.get("dataset").value,
          distribution: b.get("distribution").value,
          identifier: b.get("id").value
        });
      }));
    }

    const theConcept = new _LbdConcept.LbdConcept(this.session, conceptRegistry);
    theConcept.init(concept);
    return theConcept;
  } /////////////////////////////////////////////////////////
  /////////////////////// QUERY ///////////////////////////
  /////////////////////////////////////////////////////////

  /**
   * @description a direct query on project resources
   * @param q The SPARQL query (string)
   * @param sources The sources (array)
   * @param asStream Whether to be consumed as a stream or not (default: false)
   * @returns 
   */


  async directQuery(q, sources, options) {
    const registries = await this.getAllReferenceRegistries();
    const results = await (0, _functions.query)(q, {
      sources,
      fetch: this.fetch,
      registries,
      ...options
    });
    return results;
  } // /**
  //  * @description A query where datasets take the 
  //  * @param q 
  //  * @param datasets 
  //  * @param asStream 
  //  */
  // public async indirectQuery(q: string, datasets: string[], asStream: boolean = false) {
  // }


}

exports.LbdProject = LbdProject;
//# sourceMappingURL=LbdProject.js.map