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

export default class LbdConcept {
  public fetch;
  public accessService: AccessService;
  public dataService: DataService;
  public datasetUrl: string;
  public registry: string;
  public id: string;
  public concept: string;
  public distribution: string; 

  private session: BrowserSession | NodeSession
  public url: string;

  constructor(session: BrowserSession | NodeSession, registry, id: string = v4()) {
    this.registry = registry;
    this.distribution = registry + "data"
    this.id = id;
    this.url = this.distribution + "#" + this.id
    this.session = session
    this.fetch = session.fetch;
    this.accessService = new AccessService(session.fetch);
    this.dataService = new DataService(session.fetch);
  }

  public async create() {
    const q0 = `INSERT DATA {<${this.url}> a <${LBD.Concept}> }`
    await this.dataService.sparqlUpdate(this.distribution, q0)
  }

  public async delete() {
    const q0 = `DELETE {
      <${this.url}> ?p ?o .
    } WHERE {
      <${this.url}> ?p ?o .
    }`
    await this.dataService.sparqlUpdate(this.distribution, q0)
  }

  public async addReference(identifier: string, dataset: string, distribution?: string) {
    const referenceId = v4()
    const referenceUrl = this.distribution + "#" + referenceId
    const identifierId = v4()
    const identifierUrl = this.distribution + "#" + identifierId

    const {formatted, identifierType} = this.getIdentifierType(identifier)

    const q0 = `INSERT DATA {
      <${this.url}> <${LBD.hasReference}> <${referenceUrl}> .
      <${referenceUrl}> <${LBD.inDataset}> <${dataset}> ;
        <${LBD.hasIdentifier}> <${identifierUrl}> .
      <${identifierUrl}> a <${identifierType}> ;
        <${LBD.identifier}> ${formatted} .
   }`
    
    if (distribution) {
      const q1 = `INSERT DATA {
        <${identifierUrl}> <${LBD.inDistribution}> <${distribution}> ;
      }`
    }

    await this.dataService.sparqlUpdate(this.distribution, q0)
    await this.dataService.sparqlUpdate(this.distribution, q0)

    return referenceUrl
  }

  public async deleteReference(referenceUrl) {
    const q0 = `DELETE {
      ?a ?b <${referenceUrl}> .
      <${referenceUrl}> ?p ?o ; ?q ?x.
      ?x ?y ?z.
    } WHERE {
      ?a ?b <${referenceUrl}> .
      <${referenceUrl}> ?p ?o ; ?q ?x.
      ?x ?y ?z.
    }`
    console.log('q0', q0);
    await this.dataService.sparqlUpdate(this.distribution, q0)

    const q1 = `DELETE {<${this.url}> <${LBD.hasReference}> <${referenceUrl}> .}`
    await this.dataService.sparqlUpdate(this.distribution, q1)
  }

  public async addAlias() {

  }

  private getIdentifierType(identifier: string | number) {
    function isInt(n) {
      return n % 1 === 0;
   }

    if (typeof identifier === "string" && identifier.startsWith("http")) {
      return {formatted: `<${identifier}>`, identifierType: LBD.URIBasedIdentifier}
    } else {
      if (typeof identifier === "number") {
        if (isInt(identifier)) {
          return {formatted: `"${identifier}"^^<${XSD.integer}>`, identifierType: LBD.StringBasedIdentifier}
        } else {
          return {formatted: `"${identifier}"^^<${XSD.float}>`, identifierType: LBD.StringBasedIdentifier}
        }
      } else {
        return {formatted: `"${identifier}"^^<${XSD.string}>`, identifierType: LBD.StringBasedIdentifier}
      }
    }
  }

}

