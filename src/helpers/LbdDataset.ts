import AccessService from "./access-service";
import DataService from "./data-service";
import { newEngine, IQueryResultBindings, ActorInitSparql } from "@comunica/actor-init-sparql";

import LBD from "./vocab/lbd";
import { AccessRights, ResourceType } from "./BaseDefinitions";
import LBDService from "./LbdService";
import {extract} from "./functions"
import {v4} from "uuid"
import { ACL, DCAT, DCTERMS, FOAF, RDFS } from "@inrupt/vocab-common-rdf";
import LbdDistribution from './LbdDistribution'
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession} from "@inrupt/solid-client-authn-node";

export default class LbdDataset {
  public fetch;
  public accessService: AccessService;
  public dataService: DataService;
  public lbdService: LBDService;
  public projectId: string;
  public url: string;
  public distributions: LbdDistribution[]
  public data: object[];
  private session: BrowserSession | NodeSession

  constructor(session: BrowserSession | NodeSession, url: string) {
    this.session = session
    this.fetch = session.fetch;
    this.url = url
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

  public async init() {
    this.data = await this.fetch(this.url, {headers: {"Accept": "application/ld+json"}}).then(i => i.json())
    this.distributions = await this.getDistributions()
  }

  /**
   * 
   * @param makePublic 
   * @param id
   * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
   * @returns 
   */
  public async create(
    options: object = {},
    makePublic?: boolean,
  ) {
    const datasetUrl = this.url

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

    let q = `INSERT DATA {<${datasetUrl}> a <${DCAT.Dataset}> ; <${DCTERMS.creator}> <${this.session.info.webId}>. }`

    await this.dataService.sparqlUpdate(datasetUrl, q)
    
    if (Object.keys(options).length > 0) {
      let q0 = `INSERT DATA { `
      for (const key of Object.keys(options)) {
        q0 += `<${datasetUrl}> <${key}> "${options[key]}" .`
      }    
      q0 += "}"
      await this.dataService.sparqlUpdate(datasetUrl, q0)
    }
    await this.init()
  }

  public async delete() {
    await this.dataService.deleteContainer(this.url, true)
    return
  }

  public async update(query) {
      await this.dataService.sparqlUpdate(this.url, query)
  }

  /////////////////////////////////////////////////////////
  //////////////////// DISTRIBUTIONS///////////////////////
  /////////////////////////////////////////////////////////
  public async addDistribution(distribution: File | Buffer, mimetype? ,options: object = {}, distributionId: string = v4(), makePublic: boolean = false) {      
    const distributionUrl = this.url + distributionId    
    const dist = new LbdDistribution(this.session, distributionUrl, this)
    await dist.create(distribution, {}, mimetype, makePublic)
    await dist.init()
    return dist
  }

  public async getDistributions() {
      const dataset = extract(this.data, this.url)
      if (dataset[DCAT.distribution]) {
        const distributionUrls = dataset[DCAT.distribution].map(i => i["@id"])
        console.log('distributionUrls', distributionUrls)
        const distributions = []
        for (const url of distributionUrls) {
          const dist = new LbdDistribution(this.session, url, this)
          distributions.push(dist)
        }
        return distributions
      } else return []
  }

  public async deleteDistribution(distributionId: File[]) {

  }

}

