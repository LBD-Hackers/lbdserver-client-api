import AccessService from "./access-service";
import DataService from "./data-service";
import { newEngine, IQueryResultBindings, ActorInitSparql } from "@comunica/actor-init-sparql";

import LBD from "./vocab/lbd";
import { AccessRights, ResourceType } from "./BaseDefinitions";
import LBDService from "./LbdService";
import {extract} from "jsonld-remote"
import {v4} from "uuid"
import { DCAT, DCTERMS, RDFS, XSD } from "@inrupt/vocab-common-rdf";
import mime from "mime-types"

export default class LbdConcept {
  public fetch;
  public accessService: AccessService;
  public dataService: DataService;
  public datasetUrl: string;
  public registry: string;
  public id: string;
  public concept: string;

  // include queryEngine to allow caching of querydata etc.
  public queryEngine: ActorInitSparql;
  public url: string;

  constructor(fetch: any, registry, id: string = v4()) {
    this.registry = registry;
    this.id = id;
    this.url = this.registry + this.id
    this.fetch = fetch;
    this.accessService = new AccessService(fetch);
    this.dataService = new DataService(fetch);
    this.queryEngine = newEngine();
  }

  public async create() {
    const q0 = `INSERT DATA {<${this.url}> a <${LBD.Concept}> }`
    await this.dataService.sparqlUpdate(this.registry, q0)
  }

  public async delete() {
    const q0 = `DELETE {
      <${this.url}> ?p ?o .
    } WHERE {
      <${this.url}> ?p ?o .
    }`
    await this.dataService.sparqlUpdate(this.registry, q0)
  }

  public async addReference(identifier: string, dataset: string, distribution?: string) {
    const referenceId = v4()
    const referenceUrl = this.registry + referenceId
    const identifierId = v4()
    const identifierUrl = this.registry + identifierId

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

    await this.dataService.sparqlUpdate(this.registry, q0)
    await this.dataService.sparqlUpdate(this.registry, q0)

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
    await this.dataService.sparqlUpdate(this.registry, q0)

    const q1 = `DELETE {<${this.url}> <${LBD.hasReference}> <${referenceUrl}> .}`
    await this.dataService.sparqlUpdate(this.registry, q1)
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

