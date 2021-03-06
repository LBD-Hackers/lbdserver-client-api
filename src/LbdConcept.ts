import AccessService from "./helpers/access-service";
import DataService from "./helpers/data-service";

import LBD from "./helpers/vocab/lbds";
import { AccessRights, ResourceType } from "./helpers/BaseDefinitions";
import {LbdService} from "./LbdService";
import {extract} from "./helpers/functions"
import {v4} from "uuid"
import { DCAT, DCTERMS, OWL, RDFS, XSD } from "@inrupt/vocab-common-rdf";
import mime from "mime-types"
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession} from "@inrupt/solid-client-authn-node";
import {LbdProject} from "./LbdProject";
import { getQueryResult } from "./helpers/utils";

export class LbdConcept {
  public fetch;
  public accessService: AccessService;
  public dataService: DataService;
  private session: BrowserSession | NodeSession
  public references: object[]
  public aliases: string[]
  public registry: string
  public initialized: boolean

  constructor(session: BrowserSession | NodeSession, registry: string) {
    this.aliases = []
    this.session = session
    this.fetch = session.fetch;
    this.accessService = new AccessService(session.fetch);
    this.dataService = new DataService(session.fetch);
    this.registry = registry
    this.references = []
  }

  /**
   * create this concept on a project (in a Pod) - asynchronous
   */
  public async create(id?) {
    if (!id) {
      id = v4()
    }
    const distribution = this.registry + 'data'
    const url = distribution + "#" + id
    const q0 = `INSERT DATA {<${url}> a <${LBD.Concept}> }`
    await this.dataService.sparqlUpdate(distribution, q0)
    this.aliases.push(url)
    this.initialized = true
  }

  /**
   * @description initialise an already existing concept in your application
   * @param data {aliases: string[], references: {dataset, distribution, identifier}[]
   */
  public init(data: {aliases: string[], references: {dataset: string, distribution: string, identifier: string}[]}) {
    this.aliases = data.aliases
    if (data.references) {
      this.references = data.references
    } else {
      this.references = []
    }
    this.initialized = true
  }

  /**
   * @description delete this concept from the reference registry
   */
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

  public async addAlias(url, registry) {
    const proj = new LbdProject(this.session, this.registry.replace("local/references/", ""))
    const theOtherConcept = await proj.getConcept(url)

    for (const alias  of this.aliases) {
      if (alias.includes(registry)) {

        let q0 = `INSERT DATA {
          <${alias}> <${OWL.sameAs}> <${url}> .
          `
        for (const ref of theOtherConcept.references) {
          if (ref["identifier"].startsWith("http")) {
            for (const locRef of this.references) {
              if (locRef["identifier"].startsWith("http")) {
                q0 += `<${ref["identifier"]}> <${OWL.sameAs}> <${locRef["identifier"]}> .
                <${locRef["identifier"]}> <${OWL.sameAs}> <${ref["identifier"]}> .`
              }
            }
          }
        }
      q0 += "}"
       await this.dataService.sparqlUpdate(registry + "data", q0)

      }
    }

    this.aliases.push(url)
    return
  }

  // public async alignLocalAliases(url) {
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
  
          let id, alignment
          alignment = ""
          if (identifier.startsWith("http")) {
            id = `<${identifier}>`
            for (const ref of this.references) {
              if (ref["identifier"].startsWith("http")) {
                alignment += `${id} <${OWL.sameAs}> <${ref["identifier"]}> .
                <${ref["identifier"]}> <${OWL.sameAs}> ${id} .`
              }
            }

          }
          else {
            id = `"${identifier}"`;
          }


          let q0 = `INSERT DATA {
            <${alias}> <${LBD.hasReference}> <${referenceUrl}> .
            <${referenceUrl}> <${LBD.inDataset}> <${dataset}> ;
              <${LBD.hasIdentifier}> <${identifierUrl}> .
            <${identifierUrl}> <https://w3id.org/lbdserver#value> ${id} ;
            <${LBD.inDistribution}> <${distribution}> .
            `
         if (alignment) {
           q0 += alignment
         }
         q0 += "}"

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

  /**
   * @description Delete a reference for this concept
   * @param referenceUrl the URL of the reference to delete
   */
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

