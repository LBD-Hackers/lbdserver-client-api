import AccessService from "./access-service";
import DataService from "./data-service";
import { newEngine, IQueryResultBindings, ActorInitSparql } from "@comunica/actor-init-sparql";
import LbdDataset from "./LbdDataset"
import LBD from "./vocab/lbd";
import { AccessRights, ResourceType } from "./BaseDefinitions";
import LBDService from "./LbdService";
import {extract} from "jsonld-remote"
import {v4} from "uuid"

export default class LbdProject {
  public fetch;
  public verbose: boolean = false;
  public accessService: AccessService;
  public dataService: DataService;
  public lbdService: LBDService;
  public projectId: string;
  public accessPoint: string;
  public data: object[];

  // include queryEngine to allow caching of querydata etc.
  public queryEngine: ActorInitSparql;
  public localProject: string;

  constructor(fetch: any, accessPoint: string, verbose: boolean = false) {
    if (!accessPoint.endsWith("/")) accessPoint += "/"

    this.fetch = fetch;
    this.accessPoint = accessPoint;
    this.localProject = accessPoint + "local/"
    this.verbose = verbose;
    this.projectId = accessPoint.split('/')[accessPoint.split("/").length  - 2];
    this.accessService = new AccessService(fetch);
    this.dataService = new DataService(fetch);
    this.lbdService = new LBDService(fetch);
    this.queryEngine = newEngine();
  }

  public async checkExistence() {
    const status = await this.fetch(this.accessPoint, {method: "HEAD"}).then(result => result.status)
    if (status === 200) {
      return true
    } else {
      return false
    }
  }

  public async init() {
    const data = await this.fetch(this.localProject, {headers: {"Accept": "application/ld+json"}}).then(i => i.json())
    this.data = data
    return data
  }

  // initialise a project
  public async create(
    makePublic: boolean = false,
    existingPartialProjects: string[] = []
  ) {
    const local = this.accessPoint + 'local/'
    existingPartialProjects.push(local)

    // create global access point
    await this.dataService.createContainer(this.accessPoint, makePublic)
    await this.dataService.createContainer(local, makePublic)

    // create different registries
    await this.createRegistryContainer("datasets/", makePublic, LBD.hasDatasetRegistry)
    await this.createRegistryContainer("references/", makePublic, LBD.hasReferenceRegistry)
    await this.createRegistryContainer("services/", makePublic, LBD.hasServiceRegistry)

    for (const part of existingPartialProjects) {
        await this.addPartialProject(part)
    }

    await this.init()
  }

  public async addPartialProject(part: string) {
    const q0 = `INSERT DATA {
        <${this.accessPoint}> <${LBD.aggregates}> <${part}> .
        }`
    await this.dataService.sparqlUpdate(this.accessPoint, q0)
  }

  public async addStakeholder(webId: string, accessRights: AccessRights = {read: true, append: false, write: false, control: false}) {
    await this.accessService.setResourceAccess(this.accessPoint, accessRights, ResourceType.CONTAINER, webId)
  }

  public async delete() {
      await this.dataService.deleteContainer(this.accessPoint, true)
  }

  public async findAllPartialProjects() {
    const projects = await this.queryEngine.query(`SELECT ?proj WHERE {<${this.accessPoint}> <${LBD.aggregates}> ?proj}`, {sources: [this.accessPoint], fetch: this.fetch}).then((i: any) => i.bindings()).then(i => i.map(r => r.get('?proj').value))
    return projects
  }

  public async findPartialProject(webId: string) {
    const repo = await this.lbdService.getProjectRegistry(webId)
    const partialProjectOfStakeholder = repo + this.projectId + '/local/'
    const status = await this.fetch(partialProjectOfStakeholder, {method: "HEAD"}).then(res => res.status)
    if (status === 200) {
        return partialProjectOfStakeholder
    } else {
        throw new Error(`UNAUTHORIZED: This repository does not exist or you don't have the required access rights`)
    }
  }

  public async addPartialProjectByStakeholder(webId: string) {
    const partialProjectUrl = await this.findPartialProject(webId)
    await this.addPartialProject(partialProjectUrl)
    return partialProjectUrl
  }

  private async createRegistryContainer(containerName, makePublic, property) {
    if (!containerName.endsWith('/')) containerName += "/"

    const containerUrl = this.localProject + containerName
    await this.dataService.createContainer(containerUrl, makePublic)
    const q0 = `INSERT DATA {
        <${this.localProject}> <${property}> <${containerUrl}> .
      }`;
    await this.dataService.sparqlUpdate(this.localProject, q0)
  }

  /////////////////////////////////////////////////////////
  /////////////////////// DATASETS ////////////////////////
  /////////////////////////////////////////////////////////

  /**
   * 
   * @param makePublic 
   * @param id
   * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
   * @returns 
   */
  public async addDataset(
    options: object = {},
    makePublic: boolean = false,
    id: string = v4()
  ): Promise<LbdDataset> {
    const subject = extract(this.data, this.localProject)
    const datasetRegistry = subject[LBD.hasDatasetRegistry][0]["@id"]
    const datasetUrl = datasetRegistry + id + "/"
    const theDataset = new LbdDataset(this.fetch, datasetUrl)
    await theDataset.create(options, makePublic)
    return theDataset
  }

  public async deleteDataset(
    datasetUrl: string
  ) {
    if (!datasetUrl.endsWith('/')) datasetUrl += "/"
    const ds = new LbdDataset(this.fetch, datasetUrl)
    await ds.delete()
  }

  public async deleteDatasetById(
    datasetId: string
  ) {
    const subject = extract(this.data, this.localProject)
    const datasetRegistry = subject[LBD.hasDatasetRegistry][0]["@id"]
    const datasetUrl = datasetRegistry + datasetId + "/"
    const ds = new LbdDataset(this.fetch, datasetUrl)
    await ds.delete()
  }

  /////////////////////////////////////////////////////////
  //////////////////// DISTRIBUTIONS///////////////////////
  /////////////////////////////////////////////////////////
  public async addDistribution(datasetURL: string, distribution: File[]) {}

  public async deleteDistribution(datasetURL: string, distribution: File[]) {}

  public async updateDistribution(datasetURL: string, distribution: File[]) {}

  public async queryDistribution(datasetURL: string, distribution: File[]) {}

  /////////////////////////////////////////////////////////
  ////////////////////// REFERENCES////////////////////////
  /////////////////////////////////////////////////////////

  // get all references related to a specific abstract Concept
  public async getReferences() {}

  public async deleteReference() {}

  // register a reference for an existing abstract concept
  public async addReference() {}

  // register an abstract concept
  public async addConcept() {}

  // register an alias for an existing concept
  public async addAlias() {}

  // get the abstract Concept related to a dataset/distribution + id
  public async getConcept() {}

  /////////////////////////////////////////////////////////
  /////////////////////// SERVICES ////////////////////////
  /////////////////////////////////////////////////////////

  // register a service in the Service Registry
  public async addService() {}

  // delete a service from the Service Registry
  public async deleteService() {}

  // get all services from a Service Registry
  public async getAllServices() {}
}

