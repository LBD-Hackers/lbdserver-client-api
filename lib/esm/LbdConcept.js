"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LbdConcept = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _lbds = _interopRequireDefault(require("./helpers/vocab/lbds"));

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _LbdProject = require("./LbdProject");

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


  async create(id) {
    if (!id) {
      id = (0, _uuid.v4)();
    }

    const distribution = this.registry + 'data';
    const url = distribution + "#" + id;
    const q0 = `INSERT DATA {<${url}> a <${_lbds.default.Concept}> }`;
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

    if (data.references) {
      this.references = data.references;
    } else {
      this.references = [];
    }

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

  async addAlias(url, registry) {
    const proj = new _LbdProject.LbdProject(this.session, this.registry.replace("local/references/", ""));
    const theOtherConcept = await proj.getConcept(url);

    for (const alias of this.aliases) {
      if (alias.includes(registry)) {
        let q0 = `INSERT DATA {
          <${alias}> <${_vocabCommonRdf.OWL.sameAs}> <${url}> .
          `;

        for (const ref of theOtherConcept.references) {
          if (ref["identifier"].startsWith("http")) {
            for (const locRef of this.references) {
              if (locRef["identifier"].startsWith("http")) {
                q0 += `<${ref["identifier"]}> <${_vocabCommonRdf.OWL.sameAs}> <${locRef["identifier"]}> .
                <${locRef["identifier"]}> <${_vocabCommonRdf.OWL.sameAs}> <${ref["identifier"]}> .`;
              }
            }
          }
        }

        q0 += "}";
        await this.dataService.sparqlUpdate(registry + "data", q0);
      }
    }

    this.aliases.push(url);
    return;
  } // public async alignLocalAliases(url) {
  //   const registry = this.registry
  //   for (const alias  of this.aliases) {
  //     if (alias.includes(registry)) {
  //       const q0 = `INSERT DATA {
  //         <${alias}> <${OWL.sameAs}> <${url}> .
  //      }`
  //      await this.dataService.sparqlUpdate(this.registry + "data", q0)
  //     }
  //   }
  //   this.aliases.push(url)
  //   return
  // }

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
      const regdist = registry;
      const referenceUrl = regdist + "#" + referenceId;
      const identifierId = (0, _uuid.v4)();
      const identifierUrl = regdist + "#" + identifierId; // const idLiteral = this.getIdentifierType(identifier)

      for (const alias of this.aliases) {
        if (alias.includes(registry)) {
          let id, alignment;
          alignment = "";

          if (identifier.startsWith("http")) {
            id = `<${identifier}>`;

            for (const ref of this.references) {
              if (ref["identifier"].startsWith("http")) {
                alignment += `${id} <${_vocabCommonRdf.OWL.sameAs}> <${ref["identifier"]}> .
                <${ref["identifier"]}> <${_vocabCommonRdf.OWL.sameAs}> ${id} .`;
              }
            }
          } else {
            id = `"${identifier}"`;
          }

          let q0 = `INSERT DATA {
            <${alias}> <${_lbds.default.hasReference}> <${referenceUrl}> .
            <${referenceUrl}> <${_lbds.default.inDataset}> <${dataset}> ;
              <${_lbds.default.hasIdentifier}> <${identifierUrl}> .
            <${identifierUrl}> <https://w3id.org/lbdserver#value> ${id} ;
            <${_lbds.default.inDistribution}> <${distribution}> .
            `;

          if (alignment) {
            q0 += alignment;
          }

          q0 += "}";
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

exports.LbdConcept = LbdConcept;
//# sourceMappingURL=LbdConcept.js.map