"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LbdService = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _functions = require("./helpers/functions");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _lbds = _interopRequireDefault(require("./helpers/vocab/lbds"));

var _BaseDefinitions = require("./helpers/BaseDefinitions");

var _n = require("n3");

var _querySparql = require("@comunica/query-sparql");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  namedNode,
  literal,
  defaultGraph,
  quad,
  variable
} = _n.DataFactory;

class LbdService {
  verbose = false;

  /**
   * 
   * @param session an (authenticated) session
   * @param verbose optional parameter for logging purposes
   */
  constructor(session, verbose = false) {
    this.session = session;
    this.fetch = session.fetch;
    this.verbose = verbose;
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
    this.store = new _n.Store();
  }

  async initialiseSatellite(endpoint, repository) {} /////////////////////////////////////////////////////////
  ////////////////////// QUERY ////////////////////////////
  /////////////////////////////////////////////////////////
  // public async query(q: string, { sources, registries, asStream, queryEngine }) {
  //   const { query } = this.mutateQuery(q)
  //   const myEngine = new QueryEngine();
  //   await this.inference(myEngine, registries)
  //   const context: any = { sources: [...sources, this.store], fetch }
  //   const result = await myEngine.query(query, context)
  //   const { data } = await myEngine.resultToString(result,
  //     'application/sparql-results+json');
  //   if (asStream) {
  //     return data
  //   } else {
  //     return JSON.parse(await streamToString(data))
  //   }
  // }
  // private findLowerLevel(obj, variables) {
  //   if (!variables) variables = obj.variables
  //   if (obj.type === "bgp") {
  //     return { bgp: obj, variables }
  //   } else {
  //     return this.findLowerLevel(obj.input, variables)
  //   }
  // }
  // private inference(myEngine, registries): Promise<void> {
  //   return new Promise(async (resolve, reject) => {
  //     const q = `
  //     CONSTRUCT {
  //      ?s1 <${OWL.sameAs}> ?s2 .
  //      ?s2 <${OWL.sameAs}> ?s1 .
  //     } WHERE {
  //         ?concept1 <${LBD.hasReference}>/<${LBD.hasIdentifier}>/<https://w3id.org/lbdserver#value> ?s1 .
  //         ?concept2 <${LBD.hasReference}>/<${LBD.hasIdentifier}>/<https://w3id.org/lbdserver#value> ?s2 .
  //         ?concept1 <${OWL.sameAs}> ?concept2 .
  //     }`
  //     const quadStream = await myEngine.queryQuads(q, {
  //       sources: registries,
  //       fetch
  //     });
  //     quadStream.on('data', (res) => {
  //       this.store.addQuad(quad(
  //         namedNode(res.subject.id.replaceAll('"', '')),
  //         namedNode(res.predicate.value),
  //         namedNode(res.object.id.replaceAll('"', '')),
  //         defaultGraph()
  //       ))
  //     });
  //     quadStream.on('end', () => {
  //       resolve()
  //     })
  //   })
  // }
  // private mutateQuery(query) {
  //   const translation = translate(query);
  //   const { bgp, variables } = this.findLowerLevel(translation, translation.variables)
  //   const usedVariables = new Set()
  //   let aliasNumber = 1
  //   let aliases = {}
  //   for (const pattern of bgp.patterns) {
  //     for (const item of Object.keys(pattern)) {
  //       if (pattern[item].termType === "Variable") {
  //         if (usedVariables.has(pattern[item])) {
  //           const newVName = `${pattern[item].value}_alias${aliasNumber}`
  //           if (!aliases[pattern[item].value]) aliases[pattern[item].value] = []
  //           aliases[pattern[item].value].push(newVName)
  //           aliasNumber += 1
  //           const newV = { termType: "Variable", value: newVName }
  //           pattern[item] = newV
  //         }
  //         usedVariables.add(pattern[item])
  //       }
  //     }
  //   }
  //   Object.keys(aliases).forEach(item => {
  //     aliases[item].forEach(alias => {
  //       const newPattern = quad(
  //         variable(item),
  //         namedNode("http://www.w3.org/2002/07/owl#sameAs"),
  //         variable(alias),
  //         defaultGraph()
  //       )
  //       bgp.patterns.push(newPattern)
  //     })
  //   })
  //   const q: any = { type: "project", input: { type: "bgp", patterns: bgp.patterns }, variables: Array.from(usedVariables) }
  //   return { query: toSparql(q), variables: Array.from(usedVariables) }
  // }
  /////////////////////////////////////////////////////////
  ////////////////////// PREPARATION //////////////////////
  /////////////////////////////////////////////////////////

  /**
   * @description This function checks if the card (webId) contains a lbds:hasProjectRegistry pointer
   * @param webId the webId/card to check
   * @returns boolean - false: the WebID doesn't have a project registry yet / true: a project registry is mentioned in the card
   */


  async validateWebId(webId) {
    if (!webId) {
      if (this.session.info.isLoggedIn) {
        webId = this.session.info.webId;
      } else {
        throw new Error('No WebID found');
      }
    }

    const lbdLoc = await this.getProjectRegistry(webId);

    if (lbdLoc && lbdLoc.length > 0) {
      return true;
    }

    return false;
  }
  /**
   * @description This function retrieves the LBDserver projects from a project aggregator (e.g. a project registry or public aggregator)
   * @param aggregator an LBDS aggregator, aggregating projects with lbds:aggregates
   * @returns Array of LBDserver project access points (URL).
   */


  async getAllProjects(aggregator) {
    let myProjects; // shortcut for Pod-based aggregators with aggregation level 1

    if (aggregator.includes("/lbd/")) {
      const data = await this.fetch(aggregator, {
        headers: {
          Accept: "application/ld+json"
        }
      }).then(t => t.json());
      myProjects = (0, _functions.extract)(data, aggregator)[_vocabCommonRdf.LDP.contains].map(i => i["@id"]);
    } else {
      myProjects = await this.constructTree(aggregator);
    }

    return myProjects;
  } // construct the resources in the Pod in a recursive way


  async constructTree(root, queryEngine = new _querySparql.QueryEngine(), recursiveArray = [], alreadyFetched = [], notExists = []) {
    const resources = await this.getLDPContent([root], queryEngine);

    for (const res of resources) {
      recursiveArray.push(res);

      if (res.endsWith("/")) {
        if (!alreadyFetched.includes(res)) {
          const status = await this.fetch(res, {
            method: "HEAD"
          }).then(i => i.status);
          alreadyFetched.push(res);

          if (status === 200) {
            recursiveArray = await this.constructTree(res, queryEngine, recursiveArray, alreadyFetched, notExists);
          } else {
            notExists.push(res);
          }
        }
      }
    }

    const d = recursiveArray.filter(i => !notExists.includes(i));
    return d;
  } // get the content (ldp:contains) of an ldp:Container instance


  async getLDPContent(sources, queryEngine = new _querySparql.QueryEngine()) {
    const q = `SELECT ?child ?parent WHERE {
      ?parent <${_vocabCommonRdf.DCAT.dataset}> ?child .
      FILTER (!CONTAINS(str(?child), "local"))
    }`;
    const results = await queryEngine.queryBindings(q, {
      sources,
      fetch
    }).then(b => b.toArray());
    return results.map(i => i.get("child").value);
  }
  /**
   * @description Find the LBDserver project registry of a specific stakeholder by their WebID.
   * @param stakeholder The WebID of the stakeholder from whom the project registry should be retrieved
   * @returns URL of project registry
   */


  async getProjectRegistry(stakeholder, queryEngine = new _querySparql.QueryEngine()) {
    if (!stakeholder) {
      if (this.session.info.isLoggedIn) {
        stakeholder = this.session.info.webId;
      } else {
        throw new Error('No WebID found');
      }
    }

    const q = `select ?loc where {<${stakeholder}> <${_lbds.default.hasProjectRegistry}> ?loc}`;
    const location = await queryEngine.queryBindings(q, {
      sources: [stakeholder],
      fetch: this.fetch
    }).then(res => res.toArray()).then(bind => bind.map(i => i.get("loc").value)).catch(err => {
      throw err;
    });

    if (location && location.length > 0) {
      return location[0];
    } else {
      return undefined;
    }
  }
  /**
   * @description This function retrieves the LDP inbox from a particular WebID
   * @param stakeholder The WebID of the stakeholder from whom the LDP inbox should be retrieved
   * @returns The inbox URL
   */


  async getInbox(stakeholder, queryEngine = new _querySparql.QueryEngine()) {
    const q = `select ?inbox where {<${stakeholder}> <${_vocabCommonRdf.LDP.inbox}> ?inbox}`;
    const inbox = await queryEngine.queryBindings(q, {
      sources: [stakeholder],
      fetch: this.fetch
    }).then(res => res.toArray()).then(bind => bind.map(i => i.get("inbox").value)).catch(err => {
      throw err;
    });

    if (inbox && inbox.length > 0) {
      return inbox[0];
    } else {
      return undefined;
    }
  } //   public async inviteStakeholder(stakeholder: string, projectId: string) {
  //     const inbox = await this.getInbox(stakeholder);
  //     const id = v4();
  //     const url = inbox + id;
  //     const message = `<>
  //   a <${AS.Announce}> ;
  //   <${AS.actor}> <${this.session.info.webId}> ;
  //   <${AS.object}> <#invite> ;
  //   <${AS.target}> <${stakeholder}> ;
  //   <${AS.updated}> "${new Date().toISOString()}"^^${XSD.dateTime} .
  // <#invite> a ${LBD.ProjectInvite}; 
  //   <${FOAF.primaryTopic}> <#project> .
  // <#project> a <${LBD.Project}> ;
  //     <${DCTERMS.identifier} "${projectId}" .
  //   `;
  //   const options = {
  //     method: "POST",
  //     body: message,
  //   }
  //     // await this.session.fetch()
  //   }

  /**
   * @description Create an LBDserver project registry
   * @param url Where the project registry should be created
   * @param publiclyAccessible Access rights for the project registry
   * @returns the URL of the LBDserver Project Registry
   */


  async createProjectRegistry(url = undefined, publiclyAccessible = true) {
    try {
      const stakeholder = this.session.info.webId;
      if (!url) url = stakeholder.replace("/profile/card#me", "/lbd/");
      const q0 = `INSERT DATA {
          <${stakeholder}> <${_lbds.default.hasProjectRegistry}> <${url}> .
        }`;
      await this.dataService.sparqlUpdate(stakeholder, q0); // create the LBD registry (container / Aggregator)

      const q1 = `INSERT DATA {
        <${url}> a <${_lbds.default.Aggregator}> .
      }`; // the updates immediately creates the container

      await this.dataService.sparqlUpdate(url, q1);
      let accessRights;
      let actor;

      if (publiclyAccessible) {
        accessRights = {
          read: true,
          append: false,
          write: false,
          control: false
        };
      } else {
        accessRights = {
          read: true,
          append: true,
          write: true,
          control: true
        };
        actor = stakeholder;
      }

      await this.accessService.setResourceAccess(url, accessRights, _BaseDefinitions.ResourceType.CONTAINER, actor);
      return url;
    } catch (error) {
      console.log(`error`, error);
      throw error;
    }
  }
  /**
   * @description delete a project registry at a particular location
   * @param stakeholder The stakeholder (the authenticated agent)
   * @param url The URL of the project registry
   */


  async removeProjectRegistry(url) {
    try {
      const q0 = `DELETE {<${this.session.info.webId}> <${_lbds.default.hasProjectRegistry}> <${url}> .}
      WHERE {<${this.session.info.webId}> <${_lbds.default.hasProjectRegistry}> ?reg .}`;
      await this.dataService.sparqlUpdate(this.session.info.webId, q0);
      await this.dataService.deleteContainer(url, true);
    } catch (error) {
      console.log(`error`, error);
      throw error;
    }
  }

}

exports.LbdService = LbdService;
//# sourceMappingURL=LbdService.js.map