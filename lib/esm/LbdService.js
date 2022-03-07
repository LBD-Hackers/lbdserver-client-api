"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _functions = require("./helpers/functions");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _lbd = _interopRequireDefault(require("./helpers/vocab/lbd"));

var _BaseDefinitions = require("./helpers/BaseDefinitions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LBDService {
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
  } /////////////////////////////////////////////////////////
  ////////////////////// PREPARATION //////////////////////
  /////////////////////////////////////////////////////////

  /**
   * @description This function checks if the card (webId) contains a lbds:hasProjectRegistry pointer
   * @param webId the webId/card to check
   * @returns boolean - false: the WebID doesn't have a project registry yet / true: a project registry is mentioned in the card
   */


  async validateWebId(webId) {
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
    const data = await this.fetch(aggregator, {
      headers: {
        Accept: "application/ld+json"
      }
    }).then(t => t.json());

    const myProjects = (0, _functions.extract)(data, aggregator)[_vocabCommonRdf.LDP.contains].map(i => i["@id"]);

    return myProjects;
  }
  /**
   * @description Find the LBDserver project registry of a specific stakeholder by their WebID.
   * @param stakeholder The WebID of the stakeholder from whom the project registry should be retrieved
   * @returns URL of project registry
   */


  async getProjectRegistry(stakeholder) {
    const myEngine = (0, _actorInitSparql.newEngine)();
    const q = `select ?loc where {<${stakeholder}> <${_lbd.default.hasProjectRegistry}> ?loc}`;
    const location = await myEngine.query(q, {
      sources: [stakeholder],
      fetch: this.fetch
    }).then(res => res.bindings()).then(bind => bind.map(i => i.get("?loc").value)).catch(err => {
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


  async getInbox(stakeholder) {
    const myEngine = (0, _actorInitSparql.newEngine)();
    const q = `select ?inbox where {<${stakeholder}> <${_vocabCommonRdf.LDP.inbox}> ?inbox}`;
    const inbox = await myEngine.query(q, {
      sources: [stakeholder],
      fetch: this.fetch
    }).then(res => res.bindings()).then(bind => bind.map(i => i.get("?inbox").value)).catch(err => {
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
          <${stakeholder}> <${_lbd.default.hasProjectRegistry}> <${url}> .
        }`;
      await this.dataService.sparqlUpdate(stakeholder, q0); // create the LBD registry (container / Aggregator)

      const q1 = `INSERT DATA {
        <${url}> a <${_lbd.default.Aggregator}> .
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
      const q0 = `DELETE {<${this.session.info.webId}> <${_lbd.default.hasProjectRegistry}> <${url}> .}
      WHERE {<${this.session.info.webId}> <${_lbd.default.hasProjectRegistry}> ?reg .}`;
      await this.dataService.sparqlUpdate(this.session.info.webId, q0);
      await this.dataService.deleteContainer(url, true);
    } catch (error) {
      console.log(`error`, error);
      throw error;
    }
  }

}

exports.default = LBDService;
//# sourceMappingURL=LbdService.js.map