import AccessService from "./access-service";
import DataService from "./data-service";
import { newEngine, IQueryResultBindings, ActorInitSparql } from "@comunica/actor-init-sparql";

import LBD from "./vocab/lbd";
import { AccessRights, ResourceType } from "./BaseDefinitions";
import LBDService from "./LbdService";
import {extract} from "./functions"
import {v4} from "uuid"
import { DCAT, DCTERMS, RDFS, XSD } from "@inrupt/vocab-common-rdf";
import mime from "mime-types"
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession} from "@inrupt/solid-client-authn-node";
import LbdProject from "./LbdProject";
import { getQueryResult } from "./utils";

export default class LbdConcept {
  public fetch;
  public accessService: AccessService;
  public dataService: DataService;
  private session: BrowserSession | NodeSession
  public references: object[]
  public aliases: string[]
  public registry: string
  public initialized: boolean

  constructor(session: BrowserSession | NodeSession, registry) {
    this.aliases = []
    this.session = session
    this.fetch = session.fetch;
    this.accessService = new AccessService(session.fetch);
    this.dataService = new DataService(session.fetch);
    this.registry = registry
    this.references = []
  }

  public async create() {
    const id = v4()
    const distribution = this.registry + 'data'
    const url = distribution + "#" + id
    const q0 = `INSERT DATA {<${url}> a <${LBD.Concept}> }`
    await this.dataService.sparqlUpdate(distribution, q0)
    this.aliases.push(url)
    this.initialized = true
  }

  public async initialize(data: {aliases: string[], references: {dataset: string, distribution: string, identifier: string}[]}) {
    this.aliases = data.aliases
    this.references = data.references
    this.initialized = true
  }

  public async delete() {
    if (!this.initialized) throw new Error("Please initialize the Concept first using this.initialize() or this.create()")
    const distribution = this.registry + 'data'
    for (const alias  of this.aliases) {
      if (alias.includes(this.registry)) {
        const q0 = `DELETE {
          <${alias}> ?p ?o .
        } WHERE {
          <${alias}> ?p ?o .
        }`
        await this.dataService.sparqlUpdate(distribution, q0)
      }
    }

  }

  public async addReference(identifier: string, dataset: string, distribution: string) {
    try {
      if (!this.initialized) throw new Error("Please initialize the Concept first using this.initialize() or this.create()")
      const registry = this.registry
      const referenceId = v4()
      const regdist = registry + "data"
      const referenceUrl = regdist + "#" + referenceId
      const identifierId = v4()
      const identifierUrl = regdist + "#" + identifierId
  
      // const idLiteral = this.getIdentifierType(identifier)
      for (const alias  of this.aliases) {
        if (alias.includes(registry)) {
  
          const q0 = `INSERT DATA {
            <${alias}> <${LBD.hasReference}> <${referenceUrl}> .
            <${referenceUrl}> <${LBD.inDataset}> <${dataset}> ;
              <${LBD.hasIdentifier}> <${identifierUrl}> .
            <${identifierUrl}> <http://schema.org/value> "${identifier}" ;
            <${LBD.inDistribution}> <${distribution}> .
         }`
         await this.dataService.sparqlUpdate(regdist, q0)
        }
      }
      
      this.references.push({
        dataset,
        distribution,
        identifier
      })
      return referenceUrl
    } catch (error) {
      console.log('error', error)
    }


  }

  public async deleteReference(referenceUrl) {
    const regdist = this.registry + "data"
    const q0 = `DELETE {
      ?a ?b <${referenceUrl}> .
      <${referenceUrl}> ?p ?o ; ?q ?x.
      ?x ?y ?z.
    } WHERE {
      ?a ?b <${referenceUrl}> .
      <${referenceUrl}> ?p ?o ; ?q ?x.
      ?x ?y ?z.
    }`
    await this.dataService.sparqlUpdate(regdist, q0)

    // const q1 = `DELETE {<${this.url}> <${LBD.hasReference}> <${referenceUrl}> .}`
    // await this.dataService.sparqlUpdate(regdist, q1)
  }

  private getIdentifierType(identifier: string | number) {
    function isInt(n) {
      return n % 1 === 0;
   }

    if (typeof identifier === "string" && identifier.startsWith("http")) {
      return `"${identifier}"^^<${XSD.anyURI}>`
    } else {
      if (typeof identifier === "number") {
        if (isInt(identifier)) {
          return `"${identifier}"^^<${XSD.integer}>`
        } else {
          return {formatted: `"${identifier}"^^<${XSD.float}>`}
        }
      } else {
        return `"${identifier}"^^<${XSD.string}>`
      }
    }
  }
}

