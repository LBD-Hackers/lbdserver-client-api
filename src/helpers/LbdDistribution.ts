import AccessService from "./access-service";
import DataService from "./data-service";
import { newEngine, IQueryResultBindings, ActorInitSparql } from "@comunica/actor-init-sparql";

import LBD from "./vocab/lbd";
import { AccessRights, ResourceType } from "./BaseDefinitions";
import LBDService from "./LbdService";
import {extract} from "./functions"
import {v4} from "uuid"
import { DCAT, DCTERMS, RDFS } from "@inrupt/vocab-common-rdf";
import mime from "mime-types"
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession} from "@inrupt/solid-client-authn-node";
import LbdDataset from "./LbdDataset";

export default class LbdDistribution {
  public fetch;
  public accessService: AccessService;
  public dataService: DataService;
  public lbdService: LBDService;
  public url: string;
  public data: any;

  private dataset: LbdDataset

  private session:  BrowserSession | NodeSession

  constructor(session: BrowserSession | NodeSession, dataset, id: string = v4()) {
    this.dataset = dataset
    this.fetch = session.fetch;
    this.url = dataset.url + id
  
    this.accessService = new AccessService(session.fetch);
    this.dataService = new DataService(session.fetch);
    this.lbdService = new LBDService(session);
  }

  public async checkExistence() {
    const status = await this.fetch(this.url, {method: "HEAD"}).then(result => result.status)
    if (status === 200) {
      return true
    } else {
      return false
    }
  }

  public async get(options: object = {}) {
      this.data = await this.fetch(this.url, options)
  }
  
  public getContentType() {
    const metadata = extract(this.dataset.data, this.url)[DCTERMS.format].map(i => i["@id"])[0]
    return metadata

  } 

  public async updateMetadata(query) {
    await this.dataService.sparqlUpdate(this.dataset.url, query)
  }

  public async addAccessUrl(accessUrl) {
    const q0 = `INSERT DATA {<${this.url}> <${DCAT.accessURL}> <${accessUrl}>}`
    await this.updateMetadata(q0)
  }

  public async create(
    file: File | Buffer,
    options: object = {},
    mimetype?: string,
    makePublic?: boolean,
  ) {
      if (!mimetype) {
          try {
              mimetype = mime.lookup(file["name"])
              if (!mimetype) mimetype = "text/plain"
          } catch (error) {
              mimetype = "text/plain"
          }
      }
          
    await this.dataService.writeFileToPod(file, this.url, makePublic, mimetype)
      //workaround to allow inherited access rights
      if (makePublic === undefined) {
        this.dataService.deleteFile(this.url + ".acl")
      }

      const q = `INSERT DATA {
        <${this.dataset.url}> <${DCAT.distribution}> <${this.url}> .
        <${this.url}> a <${DCAT.Distribution}> ;
            <${DCTERMS.format}> <https://www.iana.org/assignments/media-types/${mimetype}> ;
            <${DCAT.downloadURL}> <${this.url}> .
      }`
      await this.dataService.sparqlUpdate(this.dataset.url, q)
    if (Object.keys(options).length > 0) {
        let q0 = `INSERT DATA { `
        for (const key of Object.keys(options)) {
          q0 += `<${this.dataset.url}> <${key}> "${options[key]}" .`
        }    
        q0 += "}"
        await this.dataService.sparqlUpdate(this.dataset.url, q0)
      }

    this.dataset.init()
  }

  public async delete() {
    const myEngine = newEngine()
    await this.dataService.deleteFile(this.url)
    // also update dataset
    const q0 = `DELETE {
      <${this.url}> ?p ?o .
    } WHERE {
      <${this.url}> ?p ?o .
    }`
    await myEngine.query(q0, {sources: [this.dataset.url], fetch: this.fetch})

    const q1 = `DELETE {
      ?s ?p <${this.url}> .
    } WHERE {
      ?s ?p <${this.url}> .
    }`
    await myEngine.query(q1, {sources: [this.dataset.url], fetch: this.fetch})

    return
  }
}

