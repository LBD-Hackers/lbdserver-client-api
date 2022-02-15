"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _functions = require("./functions");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _BaseDefinitions = require("./BaseDefinitions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LBDService {
  verbose = false;

  constructor(session, verbose = false) {
    this.session = session;
    this.fetch = session.fetch;
    this.verbose = verbose;
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
  } /////////////////////////////////////////////////////////
  ////////////////////// PREPARATION //////////////////////
  /////////////////////////////////////////////////////////


  async validateWebId(webId) {
    const lbdLoc = await this.getProjectRegistry(webId);

    if (lbdLoc && lbdLoc.length > 0) {
      return true;
    }

    return false;
  }

  async getAllProjects(aggregator) {
    const data = await this.fetch(aggregator, {
      headers: {
        Accept: "application/ld+json"
      }
    }).then(t => t.json());

    const myProjects = (0, _functions.extract)(data, aggregator)[_vocabCommonRdf.LDP.contains].map(i => i["@id"]);

    return myProjects;
  }

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

  async removeProjectRegistry(stakeholder, url) {
    try {
      const q0 = `DELETE {<${stakeholder}> <${_lbd.default.hasProjectRegistry}> <${url}> .}
      WHERE {<${stakeholder}> <${_lbd.default.hasProjectRegistry}> ?reg .}
      `;
      await this.dataService.sparqlUpdate(stakeholder, q0);
      await this.dataService.deleteContainer(url, true);
    } catch (error) {
      console.log(`error`, error);
      throw error;
    }
  }

}

exports.default = LBDService;
//# sourceMappingURL=LbdService.js.map