"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _lbd = _interopRequireDefault(require("./helpers/vocab/lbd"));

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LbdConcept {
  constructor(session, registry) {
    this.aliases = [];
    this.session = session;
    this.fetch = session.fetch;
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
    this.registry = registry;
    this.references = [];
  }
  /**
   * create this concept on a project (in a Pod) - asynchronous
   */


  async create() {
    const id = (0, _uuid.v4)();
    const distribution = this.registry + 'data';
    const url = distribution + "#" + id;
    const q0 = `INSERT DATA {<${url}> a <${_lbd.default.Concept}> }`;
    await this.dataService.sparqlUpdate(distribution, q0);
    this.aliases.push(url);
    this.initialized = true;
  }
  /**
   * @description initialise an already existing concept in your application
   * @param data {aliases: string[], references: {dataset, distribution, identifier}[]
   */


  init(data) {
    this.aliases = data.aliases;
    this.references = data.references;
    this.initialized = true;
  }
  /**
   * @description delete this concept from the reference registry
   */


  async delete() {
    if (!this.initialized) throw new Error("Please initialize the Concept first using this.initialize() or this.create()");
    const distribution = this.registry + 'data';

    for (const alias of this.aliases) {
      if (alias.includes(this.registry)) {
        const q0 = `DELETE {
          <${alias}> ?p ?o .
        } WHERE {
          <${alias}> ?p ?o .
        }`;
        await this.dataService.sparqlUpdate(distribution, q0);
      }
    }
  }
  /**
   * @description Add a reference to this concept
   * @param identifier the identifier
   * @param dataset the dataset that contains this reference
   * @param distribution the distribution that contains this reference
   * @returns 
   */


  async addReference(identifier, dataset, distribution) {
    try {
      if (!this.initialized) throw new Error("Please initialize the Concept first using this.initialize() or this.create()");
      const registry = this.registry;
      const referenceId = (0, _uuid.v4)();
      const regdist = registry + "data";
      const referenceUrl = regdist + "#" + referenceId;
      const identifierId = (0, _uuid.v4)();
      const identifierUrl = regdist + "#" + identifierId; // const idLiteral = this.getIdentifierType(identifier)

      for (const alias of this.aliases) {
        if (alias.includes(registry)) {
          const q0 = `INSERT DATA {
            <${alias}> <${_lbd.default.hasReference}> <${referenceUrl}> .
            <${referenceUrl}> <${_lbd.default.inDataset}> <${dataset}> ;
              <${_lbd.default.hasIdentifier}> <${identifierUrl}> .
            <${identifierUrl}> <http://schema.org/value> "${identifier}" ;
            <${_lbd.default.inDistribution}> <${distribution}> .
         }`;
          await this.dataService.sparqlUpdate(regdist, q0);
        }
      }

      this.references.push({
        dataset,
        distribution,
        identifier
      });
      return referenceUrl;
    } catch (error) {
      console.log('error', error);
    }
  }
  /**
   * @description Delete a reference for this concept
   * @param referenceUrl the URL of the reference to delete
   */


  async deleteReference(referenceUrl) {
    const regdist = this.registry + "data";
    const q0 = `DELETE {
      ?a ?b <${referenceUrl}> .
      <${referenceUrl}> ?p ?o ; ?q ?x.
      ?x ?y ?z.
    } WHERE {
      ?a ?b <${referenceUrl}> .
      <${referenceUrl}> ?p ?o ; ?q ?x.
      ?x ?y ?z.
    }`;
    await this.dataService.sparqlUpdate(regdist, q0); // const q1 = `DELETE {<${this.url}> <${LBD.hasReference}> <${referenceUrl}> .}`
    // await this.dataService.sparqlUpdate(regdist, q1)
  }

  getIdentifierType(identifier) {
    function isInt(n) {
      return n % 1 === 0;
    }

    if (typeof identifier === "string" && identifier.startsWith("http")) {
      return `"${identifier}"^^<${_vocabCommonRdf.XSD.anyURI}>`;
    } else {
      if (typeof identifier === "number") {
        if (isInt(identifier)) {
          return `"${identifier}"^^<${_vocabCommonRdf.XSD.integer}>`;
        } else {
          return {
            formatted: `"${identifier}"^^<${_vocabCommonRdf.XSD.float}>`
          };
        }
      } else {
        return `"${identifier}"^^<${_vocabCommonRdf.XSD.string}>`;
      }
    }
  }

}

exports.default = LbdConcept;
//# sourceMappingURL=LbdConcept.js.map