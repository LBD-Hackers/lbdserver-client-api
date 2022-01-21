import AccessService from "./access-service";
import DataService from "./data-service";
import { newEngine, IQueryResultBindings, ActorInitSparql } from "@comunica/actor-init-sparql";

import LBD from "./vocab/lbd";
import { AccessRights, ResourceType } from "./BaseDefinitions";
import LBDService from "./LbdService";
import {extract} from "jsonld-remote"
import {v4} from "uuid"
import { DCAT, RDFS } from "@inrupt/vocab-common-rdf";
import LbdDistribution from './LbdDistribution'

export default class LbdDataset {
  public fetch;
  public accessService: AccessService;
  public dataService: DataService;
  public lbdService: LBDService;
  public projectId: string;
  public url: string;

  public data: object[];

  // include queryEngine to allow caching of querydata etc.
  public queryEngine: ActorInitSparql;

  constructor(fetch: any, url) {

    this.fetch = fetch;
    this.url = url
    this.accessService = new AccessService(fetch);
    this.dataService = new DataService(fetch);
    this.lbdService = new LBDService(fetch);
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

  public async init() {
    const data = await this.fetch(this.url, {headers: {"Accept": "application/ld+json"}}).then(i => i.json())
    this.data = data
    return data
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
    makePublic: boolean = false,
  ) {
    const datasetUrl = this.url

    const status = await this.fetch(datasetUrl, {method: "HEAD"}).then(res => res.status)
    if (status !== 200) {
      await this.dataService.createContainer(datasetUrl, makePublic)
    }
    
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
    const dist = new LbdDistribution(this.fetch, distributionUrl)
    await dist.create(distribution, {}, mimetype, makePublic)
    await dist.init()
    return dist
  }

  public async getDistributionUrls() {
      const current = await this.fetch(this.url, {headers: {"Accept": "application/ld+json"}}).then(res => res.json())
      const dataset = extract(current, this.url)
      const distributions = dataset[DCAT.distribution].map(i => i["@id"])
      return distributions
  }

  public async deleteDistribution(distributionId: File[]) {

  }

}

