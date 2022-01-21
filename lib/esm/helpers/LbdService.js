"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _BaseDefinitions = require("./BaseDefinitions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LBDService {
  verbose = false;

  constructor(fetch, verbose = false) {
    this.fetch = fetch;
    this.verbose = verbose;
    this.accessService = new _accessService.default(fetch);
    this.dataService = new _dataService.default(fetch);
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

  async createProjectRegistry(stakeholder, url, publiclyAccessible = true) {
    try {
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