"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LbdAggregator = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _LbdConcept = require("./LbdConcept");

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

class LbdAggregator {
  /**
   * 
   * @param session an (authenticated) Solid session
   * @param url The main url of the project. This is an aggregator containing the different partial projects of the LBDserver instance
   */
  constructor(session, url) {
    if (!url.endsWith("/")) url += "/";
    this.session = session;
    this.fetch = session.fetch;
    this.url = url;
    this.projectId = url.split("/")[url.split("/").length - 2];
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
    this.lbdService = new _LbdService.LbdService(session);
  }
  /**
   * @description Checks whether a project with this access point already exists
   * @returns Boolean: true = the project exists / false = the project doesn't exist
   */


  async checkExistence() {
    const status = await this.fetch(this.url, {
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
    const data = await this.fetch(this.localPartialProject, {
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
    const local = this.url + "local/";
    existingPartialProjects.push(local); // create global access point

    await this.dataService.createContainer(this.url, makePublic);
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

    let q = `INSERT DATA {<${this.url}> <${_vocabCommonRdf.DCTERMS.creator}> "${this.session.info.webId}"; a <${_vocabCommonRdf.DCAT.Catalog}>, <${_lbds.default.PartialProject}> .}`;
    let dcatQ = `INSERT DATA {<${this.url}> <${_vocabCommonRdf.DCTERMS.creator}> "${this.session.info.webId}" ;
    a <${_vocabCommonRdf.DCAT.Catalog}>, <${_lbds.default.Project}> ;
    <${_vocabCommonRdf.DCAT.dataset}> <${local}> .  
  }`;
    await this.dataService.sparqlUpdate(local, q);
    await this.dataService.sparqlUpdate(this.url, dcatQ); // create optional metadata (e.g. label etc.)

    if (Object.keys(options).length > 0) {
      let q0 = `INSERT DATA { `;

      for (const key of Object.keys(options)) {
        q0 += `<${this.url}> <${key}> "${options[key]}" .`;
      }

      q0 += "}";
      await this.dataService.sparqlUpdate(this.url, q0);
    }

    const referenceMeta = new _LbdDataset.LbdDataset(this.session, referenceContainerUrl);
    await referenceMeta.create();
    await referenceMeta.addDistribution(Buffer.from(""), "text/turtle", {}, "data", makePublic);
    await this.init();
  }
  /**
   * 
   * @param satelliteURL The url (endpoint) of the satellite
   * @param conformsTo The standard to which the query part of the satellite conforms
   * @returns 
   */


  async addSatellite(satelliteURL, conformsTo) {
    try {
      let standard;
      if (!satelliteURL.endsWith("/")) satelliteURL += "/";
      if (conformsTo.startsWith("http")) standard = conformsTo;else {
        switch (conformsTo.toLowerCase()) {
          case "sparql":
            standard = "https://www.w3.org/TR/sparql11-query/";
            break;

          default:
            throw new Error('Could not determine standard');
        }
      }
      const serviceId = (0, _uuid.v4)();
      const q = `INSERT DATA {
        <${this.localPartialProject}> <${_vocabCommonRdf.DCAT.service}> <#${serviceId}> .
        <#${serviceId}> a <${_vocabCommonRdf.DCAT.DataService}> ;
          <${_vocabCommonRdf.DCAT.endpointURL}> <${satelliteURL}> ;
          <${_vocabCommonRdf.DCTERMS.conformsTo}> <${standard}> .
      }`;
      await this.dataService.sparqlUpdate(this.localPartialProject, q);
      return satelliteURL;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  async getSatellites(conformsTo, options) {
    try {
      let queryEngine, partialProjects, standard;
      options && options.queryEngine ? queryEngine = options.queryEngine : queryEngine = new _querySparql.QueryEngine();
      options && options.partialProjects ? partialProjects = options.partialProjects : partialProjects = [this.localPartialProject];
      if (conformsTo.startsWith("http")) standard = conformsTo;else {
        switch (conformsTo) {
          case "sparql":
            standard = "https://www.w3.org/TR/sparql11-query/";
            break;

          default:
            throw new Error('Could not determine standard');
        }
      }
      const q = `select ?project ?url where {
      ?project <${_vocabCommonRdf.DCAT.service}> ?sat .
      ?sat a <${_vocabCommonRdf.DCAT.DataService}> ;
        <${_vocabCommonRdf.DCAT.endpointURL}> ?url ;
        <${_vocabCommonRdf.DCTERMS.conformsTo}> <${standard}> .
    }`;
      const result = await queryEngine.queryBindings(q, {
        sources: partialProjects,
        fetch: this.fetch
      }).then(r => r.toArray());

      if (result) {
        const r = {};
        result.forEach(i => {
          r[i.get('project').value] = i.get('url').value;
        });
        return r;
      } else {
        return;
      }
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }
  /**
   * @description Add a partial project to a Pod-specific access point
   * @param part Partial project to add to a Pod-specific access point
   */


  async addPartialProject(part) {
    const q0 = `INSERT DATA {
        <${this.url}> <${_vocabCommonRdf.DCAT.dataset}> <${part}> .
        }`;
    await this.dataService.sparqlUpdate(this.url, q0);
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
    await this.accessService.setResourceAccess(this.url, accessRights, _BaseDefinitions.ResourceType.CONTAINER, webId);
  }
  /**
   * @description delete an LBDserver project (locally)
   */


  async delete() {
    await this.dataService.deleteContainer(this.url, true);
  }
  /**
   * @description find all the partial projects from the indicated project access point
   */


  async findAllPartialProjects(queryEngine = new _querySparql.QueryEngine()) {
    const res = await (0, _utils.getQueryResult)(this.url, _vocabCommonRdf.DCAT.dataset, this.fetch, false, queryEngine);
    return res;
  }
  /**
   * @description Find the partial project provided by this stakeholder
   * @param webId The webID of the stakeholder whom's partial project you want to find
   * @returns The URL of the partial project
   */


  async findPartialProject(webId, queryEngine = new _querySparql.QueryEngine()) {
    const repo = await this.lbdService.getProjectRegistry(webId, queryEngine); // console.log('repo', repo)

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
    const containerUrl = this.localPartialProject + containerName;
    await this.dataService.createContainer(containerUrl, makePublic);
    const type = property.replace("#has", "#");
    const q = `INSERT DATA {
      <${containerUrl}> a <${_vocabCommonRdf.DCAT.Catalog}> , <${_vocabCommonRdf.DCAT.Dataset}> , <${type}> .
    }`;
    await this.dataService.sparqlUpdate(containerUrl, q);
    const q0 = `INSERT DATA {
        <${this.localPartialProject}> <${property}> <${containerUrl}> ;
          <${_vocabCommonRdf.DCAT.dataset}> <${containerUrl}>.
      }`;
    await this.dataService.sparqlUpdate(this.localPartialProject, q0);
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
    const subject = (0, _functions.extract)(this.data, this.localPartialProject);
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
    const subject = (0, _functions.extract)(this.data, this.localPartialProject);
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
    let queryEngine;
    options && options.queryEngine ? queryEngine = options.queryEngine : queryEngine = new _querySparql.QueryEngine();
    const subject = (0, _functions.extract)(this.data, this.localPartialProject);
    const sources = [];

    if (options && options.local) {
      sources.push(subject[_lbds.default.hasDatasetRegistry][0]["@id"]);
    } else {
      const partials = await this.findAllPartialProjects();

      for (const p of partials) {
        const dsReg = await (0, _utils.getQueryResult)(p, _lbds.default.hasDatasetRegistry, this.fetch, true, queryEngine);
        sources.push(dsReg);
      }
    }

    let q;

    if (!options || !options.query) {
      q = `SELECT ?dataset WHERE {?registry <${_vocabCommonRdf.LDP.contains}> ?dataset}`;
    } else {
      q = options.query;
    }

    const results = await queryEngine.query(q, {
      sources,
      fetch: this.fetch
    });
    const {
      data
    } = await queryEngine.resultToString(results, "application/sparql-results+json");

    if (options && options.invalidateCache) {
      queryEngine.invalidateHttpCache();
    }

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
    const subject = (0, _functions.extract)(this.data, this.localPartialProject);
    const referenceRegistry = subject[_lbds.default.hasReferenceRegistry][0]["@id"];
    const ref = new _LbdConcept.LbdConcept(this.session, referenceRegistry);
    await ref.create(id);
    return ref;
  }

  getReferenceRegistry() {
    const subject = (0, _functions.extract)(this.data, this.localPartialProject);
    return subject[_lbds.default.hasReferenceRegistry][0]["@id"];
  }

  getDatasetRegistry() {
    const subject = (0, _functions.extract)(this.data, this.localPartialProject);
    return subject[_lbds.default.hasDatasetRegistry][0]["@id"];
  }

  async getAllReferenceRegistries(queryEngine = new _querySparql.QueryEngine()) {
    const partials = await this.findAllPartialProjects(queryEngine);
    const registries = [];

    for (const partial of partials) {
      const reg = await (0, _utils.getQueryResult)(partial, _lbds.default.hasReferenceRegistry, this.fetch, true, queryEngine);
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


    const partials = await this.findAllPartialProjects(); // const satellites = await this.getSatellites('sparql', {queryEngine: myEngine, partialProjects: partials})
    // let sources = Object.keys(satellites).map(key => satellites[key]);

    let sources = [];
    const satellites = await this.getSatellites("sparql", {
      queryEngine: myEngine,
      partialProjects: partials
    });

    for (const p of partials) {
      // if (!Object.keys(satellites).includes(p)) {
      const referenceRegistry = await (0, _utils.getQueryResult)(p, _lbds.default.hasReferenceRegistry, this.fetch, true);
      sources.push(referenceRegistry + "data"); // }
    }

    let id;
    if (identifier.startsWith("http")) id = `<${identifier}>`;else id = `"${identifier}"`;
    const q = `SELECT ?concept ?dist WHERE {
      ?concept <${_lbds.default.hasReference}> ?ref .
      ?ref <${_lbds.default.inDataset}> <${dataset}> ;
        <${_lbds.default.hasIdentifier}> ?idUrl .
      ?idUrl <${_lbds.default.inDistribution}> ?dist ;
      <${_lbds.default.value}> ${id} .
  } LIMIT 1`;
    const results = await myEngine.queryBindings(q, {
      sources,
      fetch: this.fetch
    }).then(r => r.toArray());

    if (options && options.invalidateCache) {
      myEngine.invalidateHttpCache();
    }

    if (results.length > 0) {
      const raw = results[0].get('concept').value;
      let invalidateCache;
      if (options && options.invalidateCache) invalidateCache = options.invalidateCache;
      const theConcept = await this.getConcept(raw, {
        queryEngine: myEngine,
        invalidateCache,
        sources
      });
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

  async getConcept(url, options) {
    let myEngine, sources;

    if (options && options.queryEngine) {
      myEngine = options.queryEngine;
    } else {
      myEngine = new _querySparql.QueryEngine();
    }

    const conceptRegistry = url.split('#')[0] + '';

    if (options && options.sources) {
      sources = options.sources;
    } else {
      sources = [conceptRegistry];
    }

    const concept = {
      aliases: [],
      references: []
    }; // find all the aliases

    const q_alias = `SELECT ?alias
    WHERE {
      <${url}> <${_vocabCommonRdf.OWL.sameAs}> ?alias
    }`;
    const aliases = new Set();
    aliases.add(url);
    const bindingsStream0 = await myEngine.queryBindings(q_alias, {
      sources,
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
            <https://w3id.org/lbdserver#value> ?id .  
      }`;

      if (options && options.sources) {
        sources = options.sources;
      } else {
        sources = [reg];
      }

      const bindingsStream = await myEngine.queryBindings(q1, {
        sources: sources,
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
    if (options && options.invalidateCache) myEngine.invalidateHttpCache();
    return theConcept;
  }

  async getConceptsByIdentifier(identifiers, sources, options) {
    let queryEngine;

    if (options && options.queryEngine) {
      queryEngine = options.queryEngine;
    } else {
      queryEngine = new _querySparql.QueryEngine();
    }

    let q3 = `SELECT ?concept ?ds ?dist ?identifier ?alias WHERE {
      ?concept <${_lbds.default.hasReference}> ?ref1 .
      ?ref1 <${_lbds.default.inDataset}> ?ds ;
      <${_lbds.default.hasIdentifier}> ?d1 .
      ?d1 <${_lbds.default.value}> ?identifier ;
      <${_lbds.default.inDistribution}> ?dist .
  
      OPTIONAL {?concept <${_vocabCommonRdf.OWL.sameAs}> ?alias}            
      `;
    identifiers.forEach(b => {
      let identifier;

      if (b.identifier.startsWith("http")) {
        identifier = `<${b.identifier}>`;
      } else {
        identifier = `"${b.identifier}"`;
      }

      q3 += `{{
            ?concept <${_lbds.default.hasReference}> ?ref .
            ?ref <${_lbds.default.inDataset}> <${b.dataset}> ;
            <${_lbds.default.hasIdentifier}> ?d .
            ?d <${_lbds.default.value}> ${identifier} ;
            <${_lbds.default.inDistribution}> <${b.distribution}> .

      } UNION {
        ?concept <http://www.w3.org/2002/07/owl#sameAs> ?alias .
        ?alias <${_lbds.default.hasReference}> ?ref1 .
        ?ref1 <${_lbds.default.inDataset}> ?ds ;
        <${_lbds.default.hasIdentifier}> ?d1 .
        ?d1 <${_lbds.default.value}> ?identifier ;
        <${_lbds.default.inDistribution}> ?dist .
      }
            } UNION `;
    });
    q3 = q3.substring(0, q3.length - 6);
    q3 += `}`;
    const sparqlSources = [];
    const nonSparqlSources = [];

    for (const source of sources) {
      if (typeof source == "object" && source.type == "sparql") {
        sparqlSources.push(source);
      } else {
        nonSparqlSources.push(source);
      }
    }

    const aliases = {}; // const concepts = []

    const results = {};

    for (const source of sparqlSources) {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      var urlencoded = new URLSearchParams();
      urlencoded.append("query", q3);
      const options = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
      };
      const res = await this.fetch(source.value, options).then(i => i.json());

      for (const d of res["results"].bindings) {
        // concepts.push(d.concept)
        if (!results[d.concept]) {
          results[d.concept.value] = [d];
        } else {
          results[d.concept.value].push(d);
        }

        if (d.alias) {
          if (!aliases[d.alias]) {
            aliases[d.concept.value] = [d.alias.value];
          } else {
            aliases[d.concept.value].push(d.alias.value);
          }
        }
      }
    }

    if (nonSparqlSources.length > 0) {
      const r = await queryEngine.query(q3, {
        sources: nonSparqlSources
      });
      const {
        data
      } = await queryEngine.resultToString(r, "application/sparql-results+json");
      const res = await (0, _utils.parseStream)(data);

      for (const d of res["results"].bindings) {
        // concepts.push(d.concept)
        if (!results[d.concept]) {
          results[d.concept.value] = [d];
        } else {
          results[d.concept.value].push(d);
        }

        if (d.alias) {
          if (!aliases[d.alias.value]) {
            aliases[d.concept.value] = [d.alias.value];
          } else {
            aliases[d.concept.value].push(d.alias.value);
          }
        }
      }
    }

    for (const concept of Object.keys(aliases)) {
      // if the alias has not been queried for yet
      let aliasQuery = `SELECT ?concept ?ds ?dist ?identifier WHERE {`;

      for (const alias of aliases[concept]) {
        aliasQuery += `{<${alias}> <${_lbds.default.hasReference}> ?ref1 .
        ?concept <${_lbds.default.hasReference}> ?ref1 .
        ?ref1 <${_lbds.default.inDataset}> ?ds ;
        <${_lbds.default.hasIdentifier}> ?d1 .
        ?d1 <${_lbds.default.value}> ?identifier ;
        <${_lbds.default.inDistribution}> ?dist .
      } UNION `;
      }

      aliasQuery = aliasQuery.substring(0, aliasQuery.length - 6);
      aliasQuery += `}`;

      for (const source of sparqlSources) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        var urlencoded = new URLSearchParams();
        urlencoded.append("query", aliasQuery);
        const options = {
          method: "POST",
          headers: myHeaders,
          body: urlencoded,
          redirect: "follow"
        };
        const res = await this.fetch(source.value, options).then(i => i.json());

        for (const d of res["results"].bindings) {
          results[concept].push(d);
        }
      }

      if (nonSparqlSources.length > 0) {
        const r = await queryEngine.query(aliasQuery, {
          sources: nonSparqlSources
        });
        const {
          data
        } = await queryEngine.resultToString(r, "application/sparql-results+json");
        const res = await (0, _utils.parseStream)(data);

        for (const d of res["results"].bindings) {
          results[concept].push(d);
        }
      }
    }

    const allConcepts = [];

    for (const item of Object.keys(results)) {
      const myRes = results[item];
      const registry = item.split('#')[0];
      const c = new _LbdConcept.LbdConcept(this.session, registry);
      const aliases = [];
      const references = [];
      myRes.forEach(i => {
        aliases.push(i.concept);
        references.push({
          identifier: i.identifier.value,
          distribution: i.dist.value,
          dataset: i.ds.value
        });
      });
      await c.init({
        aliases,
        references
      });
      allConcepts.push(c);
    }

    return allConcepts;
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
    let queryEngine;
    options && options.queryEngine ? queryEngine = options.queryEngine : queryEngine = new _querySparql.QueryEngine();
    const newOptions = {
      sources,
      fetch: this.fetch,
      ...options,
      queryEngine
    };

    if (options && options.onlySparqlEndpoints) {} else {
      const registries = await this.getAllReferenceRegistries();
      newOptions["registries"] = registries;
    } // console.log('newOptions', newOptions)


    const results = await (0, _functions.query)(q, newOptions);
    return results;
  }

  async queryAll(q, options) {
    let queryEngine;
    options && options.queryEngine ? queryEngine = options.queryEngine : queryEngine = new _querySparql.QueryEngine();
    const partialProjects = await this.findAllPartialProjects(queryEngine);
    const sources = await this.getSatellites("sparql", {
      queryEngine,
      partialProjects
    }).then(res => Object.keys(res).map(i => {
      return {
        type: "sparql",
        value: res[i]
      };
    }));
    const newOptions = {
      sources,
      fetch: this.fetch,
      ...options,
      queryEngine
    };
    const results = await (0, _functions.query)(q, newOptions);
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

exports.LbdAggregator = LbdAggregator;
//# sourceMappingURL=LbdAggregator.js.map