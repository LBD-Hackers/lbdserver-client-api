import AccessService from "./helpers/access-service";
import DataService from "./helpers/data-service";

import LBD from "./helpers/vocab/lbds";
import { AccessRights, ResourceType } from "./helpers/BaseDefinitions";
import {LbdService} from "./LbdService";
import {extract} from "./helpers/functions"
import {v4} from "uuid"
import { DCAT, DCTERMS, RDFS } from "@inrupt/vocab-common-rdf";
import mime from "mime-types"
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession} from "@inrupt/solid-client-authn-node";
import {LbdDataset} from "./LbdDataset";
import { QueryEngine } from "@comunica/query-sparql";

export class LbdDistribution {
  public fetch;
  public accessService: AccessService;
  public dataService: DataService;
  public lbdService: LbdService;
  public url: string;
  public data: any;

  public dataset: LbdDataset
  public contentType: string
  public session:  any

  /**
   * 
   * @param session an (authenticated) Solid session
   * @param dataset the LbdDataset to which this distribution belongs
   * @param id (optional) identifier of the distribution (default: GUID)
   */
  constructor(session: any, dataset, id: string = v4()) {
    this.dataset = dataset
    this.session = session
    this.fetch = session.fetch;
    this.url = dataset.url + id
  
    this.accessService = new AccessService(session.fetch);
    this.dataService = new DataService(session.fetch);
    this.lbdService = new LbdService(session);
  }

  /**
   * Check the existence of this distribution
   */
  public async checkExistence() {
    const status = await this.fetch(this.url, {method: "HEAD"}).then(result => result.status)
    if (status === 200) {
      return true
    } else {
      return false
    }
  }

  /**
   * @description Get the distribution's content
   * @param options Fetch options
   */
  public async get(options: object = {}) {
      this.data = await this.fetch(this.url, options)
  }
  
  /**
   * @description Get the content type of the distribution
   * @returns contenttype of the distribution
   */
  public async getContentType(queryEngine = new QueryEngine()) {
    if (this.contentType) return this.contentType
    else {
      const q = `select ?ct where {<${this.url}> <${DCAT.mediaType}> ?ct}`
      const res: string[] = await queryEngine.queryBindings(q, {sources: [this.url], fetch: this.fetch})
      .then(i => i.toArray())
      .then(i => {
        return i.map(item => {
          const ct = item.get('ct').value
          return ct
        })
      })
      if (res.length > 0) {
        this.contentType = res[0]
        return this.contentType
      } else {
        return
      }
    }   
  } 


  /**
   * @description Update the metadata of the distribution (i.e. its dataset) with a SPARQL query
   * @param query the SPARQL update
   */
  public async updateMetadata(query) {
    await this.dataService.sparqlUpdate(this.dataset.url, query)
  }

  /**
   * @description Add a new dcat:accessURL to the distribution
   * @param accessUrl Access URL of the distribution (e.g. for a satellite service)
   */
  public async addAccessUrl(accessUrl) {
    const q0 = `INSERT DATA {<${this.url}> <${DCAT.accessURL}> <${accessUrl}>}`
    await this.updateMetadata(q0)
  }

  /**
   * @description Create this distribution on a Pod
   * @param file The file/content of the distribution
   * @param options Additional metadata to add to the distribution. form:  {[predicate]: value}
   * @param mimetype optional: the content type of the distribution. If not provided, it will be guessed. If the guess fails, the content type will be text/plain
   * @param makePublic access rights
   */
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
            <${DCAT.mediaType}> <https://www.iana.org/assignments/media-types/${mimetype}> ;
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

  }

  /**
   * Delete this distribution
   */
  public async delete() {
    const myEngine = new QueryEngine()
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

