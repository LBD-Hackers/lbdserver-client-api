import AccessService from "./helpers/access-service";
import DataService from "./helpers/data-service";

import LBD from "./helpers/vocab/lbds";
import { AccessRights, ResourceType } from "./helpers/BaseDefinitions";
import {LbdService} from "./LbdService";
import {extract} from "./helpers/functions"
import {v4} from "uuid"
import { ACL, DCAT, DCTERMS, FOAF, RDFS } from "@inrupt/vocab-common-rdf";
import {LbdDistribution} from './LbdDistribution'
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession} from "@inrupt/solid-client-authn-node";
import { QueryEngine } from "@comunica/query-sparql";

export class LbdDataset {
  public fetch;
  public accessService: AccessService;
  public dataService: DataService;
  public lbdService: LbdService;
  public projectId: string;
  public url: string;
  public distributions: LbdDistribution[]
  public data: object[];
  public session: any

  constructor(session: any, url: string) {
    this.session = session
    this.fetch = session.fetch;
    this.url = url
    this.accessService = new AccessService(session.fetch);
    this.dataService = new DataService(session.fetch);
    this.lbdService = new LbdService(session);
  }

  /**
   * 
   * @returns boolean: this dataset exists or not
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
   * @description create this dataset within the active project
   * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
   * @param makePublic initial access rights for the dataset (boolean)
   */
  public async create(
    options: object = {},
    makePublic?: boolean,
  ) {
    const datasetUrl = this.url
    const datasetArr = this.url.split('/')
    const datasetId = datasetArr[datasetArr.length - 2]
    const status = await this.fetch(datasetUrl, {method: "HEAD"}).then(res => res.status)
    if (status !== 200) {
      await this.dataService.createContainer(datasetUrl, makePublic)

      //workaround to allow inherited access rights

      if (makePublic) {
        let aclDefault = `INSERT {?rule <${ACL.default}> <${datasetUrl}>} WHERE {?rule a <${ACL.Authorization}> ; <${ACL.agentClass}> <${FOAF.Agent}>}`
        await this.dataService.sparqlUpdate(datasetUrl + ".acl", aclDefault)
      }

      if (makePublic === undefined) {
        this.dataService.deleteFile(datasetUrl + ".acl")
      }
    }

    let q = `INSERT DATA {<${datasetUrl}> a <${DCAT.Dataset}> ; <${DCTERMS.creator}> <${this.session.info.webId}> ; <${DCTERMS.identifier}> "${datasetId}". }`

    await this.dataService.sparqlUpdate(datasetUrl, q)

    datasetArr.pop()
    datasetArr.pop()
    const datasetRegistry = datasetArr.join("/") + "/"
    let q0 = `INSERT DATA {<${datasetRegistry}> <${DCAT.dataset}> <${datasetUrl}> . }`

    await this.dataService.sparqlUpdate(datasetRegistry, q0)

    
    if (Object.keys(options).length > 0) {
      let q0 = `INSERT DATA { `
      for (const key of Object.keys(options)) {
        if (Array.isArray(options[key])) {
          options[key].forEach((item :string) => {
            let t
            if (item.startsWith("http")) {
              t = `<${item}>`
            } else {
              t = `"${item}"`
            }
            q0 += `<${datasetUrl}> <${key}> ${t} .`
          })
        } else {
          let t
          if (options[key].startsWith("http")) {
            t = `<${options[key]}>`
          } else {
            t = `"${options[key]}"`
          }
          q0 += `<${datasetUrl}> <${key}> ${t} .`
        }
      }    
      q0 += "}"
      await this.dataService.sparqlUpdate(datasetUrl, q0)
    }
  }

  /**
   * @description delete this dataset
   * @returns void
   */
  public async delete() {
    await this.dataService.deleteContainer(this.url, true)
    return
  }

  /**
   * @description Update the dataset with SPARQL (dangerous - watch out!)
   * @param query The SPARQL query with which to update the dataset
   */
  public async update(query) {
      await this.dataService.sparqlUpdate(this.url, query)
  }

  /////////////////////////////////////////////////////////
  //////////////////// DISTRIBUTIONS///////////////////////
  /////////////////////////////////////////////////////////
  /**
   * @description create a distribution for this dataset
   * @param distribution The file to upload as a dump of the dataset
   * @param mimetype The mimetype of the distribution (if omitted it is guessed)
   * @param options options (currently not implemented)
   * @param distributionId the ID of the distribution - normally UUID, but can be overridden
   * @param makePublic initial access rights for the dataset (boolean)
   * @returns the distribution object
   */
  public async addDistribution(distribution: File | Buffer, mimetype? ,options: object = {}, distributionId: string = v4(), makePublic: boolean = false) {      
    const dist = new LbdDistribution(this.session, this, distributionId)
    await dist.create(distribution, {}, mimetype, makePublic)
    return dist
  }

  /**
   * @description get an Array of distribution URLs of this dataset
   * @returns an Array of distribution URLs
   */
  public async getDistributions(queryEngine = new QueryEngine()) {
      if (this.distributions) {
        return this.distributions
      }
      else {
        const q = `select ?dist where {?ds <${DCAT.distribution}> ?dist}`
        const res: LbdDistribution[] = await queryEngine.queryBindings(q, {sources: [this.url], fetch: this.fetch})
        .then(i => i.toArray())
        .then(i => {
          return i.map(item => {
            const url = item.get('dist').value
            const id = url.split('/')[url.split('/').length - 1]
            const dist = new LbdDistribution(this.session, this, id)
            return dist
          })
        })
        this.distributions = res
        return res
      }      
  }

}

