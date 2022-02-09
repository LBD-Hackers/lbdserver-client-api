import AccessService from "./access-service";
import DataService from "./data-service";
import { newEngine, IQueryResultBindings, ActorInitSparql } from "@comunica/actor-init-sparql";

import LBD from "./vocab/lbd";
import { AccessRights, ResourceType } from "./BaseDefinitions";
import LBDService from "./LbdService";
import {extract} from "jsonld-remote"
import {v4} from "uuid"
import { DCAT, DCTERMS, RDFS } from "@inrupt/vocab-common-rdf";
import mime from "mime-types"
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession} from "@inrupt/solid-client-authn-node";

export default class LbdDistribution {
  public fetch;
  public accessService: AccessService;
  public dataService: DataService;
  public lbdService: LBDService;
  public datasetUrl: string;
  public contentType: string;

  // include queryEngine to allow caching of querydata etc.
  public queryEngine: ActorInitSparql;
  public url: string;
  public data: any;

  private session:  BrowserSession | NodeSession

  constructor(session: BrowserSession | NodeSession, url: string) {
    let datasetUrl = url.split('/')
    datasetUrl.pop()
    const ds = datasetUrl.join("/") + '/'
    
    this.fetch = session.fetch;
    this.url = url
    this.datasetUrl = ds
  
    this.accessService = new AccessService(session.fetch);
    this.dataService = new DataService(session.fetch);
    this.lbdService = new LBDService(session);
    this.queryEngine = newEngine();
  }

  public async checkExistence() {
    const status = await this.fetch(this.url, {method: "HEAD"}).then(result => result.status)
    if (status === 200) {
      return true
    } else {
      return false
    }
  }

  public async init(options: object = {}) {
      this.data = await this.fetch(this.url, options)
      // this.contentType = await this.getContentType()
  }

  public async getContentType() {
    const q0 = `SELECT ?ct where {?id <${DCTERMS.format}> ?ct}`
    const ct = await this.queryEngine.query(q0, {sources: [this.datasetUrl], fetch: this.fetch}).then((res: any) => res.bindings())
    if (ct.length > 0) {
      const value = ct[0].get('?ct').value
      this.contentType = value
      return value
    } else {
      throw new Error(`"Could not find contentType in dataset ${this.datasetUrl}`)
    }
  } 

  public async updateMetadata(query) {
    await this.dataService.sparqlUpdate(this.datasetUrl, query)
  }

  public async addAccessUrl(accessUrl) {
    const q0 = `INSERT DATA {<${this.url}> <${DCAT.accessURL}> <${accessUrl}>}`
    await this.updateMetadata(q0)
  }

  public async create(
    file: File | Buffer,
    options: object = {},
    mimetype?: string,
    makePublic: boolean = false,
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

      const q = `INSERT DATA {
        <${this.datasetUrl}> <${DCAT.distribution}> <${this.url}> .
        <${this.url}> a <${DCAT.Distribution}> ;
            <${DCTERMS.format}> <https://www.iana.org/assignments/media-types/${mimetype}> ;
            <${DCAT.downloadURL}> <${this.url}> .
      }`
      // await this.queryEngine.query(q, {sources: [this.datasetUrl], fetch: this.fetch})
      await this.dataService.sparqlUpdate(this.datasetUrl, q)
    if (Object.keys(options).length > 0) {
        let q0 = `INSERT DATA { `
        for (const key of Object.keys(options)) {
          q0 += `<${this.datasetUrl}> <${key}> "${options[key]}" .`
        }    
        q0 += "}"
        await this.dataService.sparqlUpdate(this.datasetUrl, q0)
      }
  }

  public async delete() {
    await this.dataService.deleteFile(this.url)
    // also update dataset
    const q0 = `DELETE {
      <${this.url}> ?p ?o .
    } WHERE {
      <${this.url}> ?p ?o .
    }`
    await this.queryEngine.query(q0, {sources: [this.datasetUrl], fetch: this.fetch})

    const q1 = `DELETE {
      ?s ?p <${this.url}> .
    } WHERE {
      ?s ?p <${this.url}> .
    }`
    await this.queryEngine.query(q1, {sources: [this.datasetUrl], fetch: this.fetch})

    return
  }
}

