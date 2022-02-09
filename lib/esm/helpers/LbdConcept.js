"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LbdConcept {
  // include queryEngine to allow caching of querydata etc.
  constructor(session, registry, id = (0, _uuid.v4)()) {
    this.registry = registry;
    this.distribution = registry + "data";
    this.id = id;
    this.url = this.distribution + "#" + this.id;
    this.session = session;
    this.fetch = session.fetch;
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
    this.queryEngine = (0, _actorInitSparql.newEngine)();
  }

  async create() {
    const q0 = `INSERT DATA {<${this.url}> a <${_lbd.default.Concept}> }`;
    await this.dataService.sparqlUpdate(this.distribution, q0);
  }

  async delete() {
    const q0 = `DELETE {
      <${this.url}> ?p ?o .
    } WHERE {
      <${this.url}> ?p ?o .
    }`;
    await this.dataService.sparqlUpdate(this.distribution, q0);
  }

  async addReference(identifier, dataset, distribution) {
    const referenceId = (0, _uuid.v4)();
    const referenceUrl = this.distribution + "#" + referenceId;
    const identifierId = (0, _uuid.v4)();
    const identifierUrl = this.distribution + "#" + identifierId;
    const {
      formatted,
      identifierType
    } = this.getIdentifierType(identifier);
    const q0 = `INSERT DATA {
      <${this.url}> <${_lbd.default.hasReference}> <${referenceUrl}> .
      <${referenceUrl}> <${_lbd.default.inDataset}> <${dataset}> ;
        <${_lbd.default.hasIdentifier}> <${identifierUrl}> .
      <${identifierUrl}> a <${identifierType}> ;
        <${_lbd.default.identifier}> ${formatted} .
   }`;

    if (distribution) {
      const q1 = `INSERT DATA {
        <${identifierUrl}> <${_lbd.default.inDistribution}> <${distribution}> ;
      }`;
    }

    await this.dataService.sparqlUpdate(this.distribution, q0);
    await this.dataService.sparqlUpdate(this.distribution, q0);
    return referenceUrl;
  }

  async deleteReference(referenceUrl) {
    const q0 = `DELETE {
      ?a ?b <${referenceUrl}> .
      <${referenceUrl}> ?p ?o ; ?q ?x.
      ?x ?y ?z.
    } WHERE {
      ?a ?b <${referenceUrl}> .
      <${referenceUrl}> ?p ?o ; ?q ?x.
      ?x ?y ?z.
    }`;
    console.log('q0', q0);
    await this.dataService.sparqlUpdate(this.distribution, q0);
    const q1 = `DELETE {<${this.url}> <${_lbd.default.hasReference}> <${referenceUrl}> .}`;
    await this.dataService.sparqlUpdate(this.distribution, q1);
  }

  async addAlias() {}

  getIdentifierType(identifier) {
    function isInt(n) {
      return n % 1 === 0;
    }

    if (typeof identifier === "string" && identifier.startsWith("http")) {
      return {
        formatted: `<${identifier}>`,
        identifierType: _lbd.default.URIBasedIdentifier
      };
    } else {
      if (typeof identifier === "number") {
        if (isInt(identifier)) {
          return {
            formatted: `"${identifier}"^^<${_vocabCommonRdf.XSD.integer}>`,
            identifierType: _lbd.default.StringBasedIdentifier
          };
        } else {
          return {
            formatted: `"${identifier}"^^<${_vocabCommonRdf.XSD.float}>`,
            identifierType: _lbd.default.StringBasedIdentifier
          };
        }
      } else {
        return {
          formatted: `"${identifier}"^^<${_vocabCommonRdf.XSD.string}>`,
          identifierType: _lbd.default.StringBasedIdentifier
        };
      }
    }
  }

}

exports.default = LbdConcept;
//# sourceMappingURL=LbdConcept.js.map