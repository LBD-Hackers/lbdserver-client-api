import AccessService from "./access-service";
import DataService from "./data-service";
import LbdConcept from './LbdConcept'
import { newEngine, IQueryResultBindings, ActorInitSparql } from "@comunica/actor-init-sparql";
import LbdDataset from "./LbdDataset"
import LBD from "./vocab/lbd";
import { AccessRights, ResourceType } from "./BaseDefinitions";
import LBDService from "./LbdService";
import {extract} from "./functions"
import {v4} from "uuid"
import { ACL, DCTERMS, FOAF } from "@inrupt/vocab-common-rdf";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession} from "@inrupt/solid-client-authn-node";
import { LDP } from "@inrupt/vocab-common-rdf";
import { parseStream } from "./utils";

export default class LbdProject {
  public fetch;
  public verbose: boolean = false;
  public accessService: AccessService;
  public dataService: DataService;
  public lbdService: LBDService;
  public projectId: string;
  public accessPoint: string;
  public data: object[];
  
  private session: BrowserSession | NodeSession;

  // include queryEngine to allow caching of querydata etc.
  public queryEngine: ActorInitSparql;
  public localProject: string;

  constructor(session: BrowserSession | NodeSession, accessPoint: string, verbose: boolean = false) {
    if (!accessPoint.endsWith("/")) accessPoint += "/"
    this.session = session
    this.fetch = session.fetch;
    this.accessPoint = accessPoint;
    this.localProject = accessPoint + "local/"
    this.verbose = verbose;
    this.projectId = accessPoint.split('/')[accessPoint.split("/").length  - 2];
    this.accessService = new AccessService(session.fetch);
    this.dataService = new DataService(session.fetch);
    this.lbdService = new LBDService(session);
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
    existingPartialProjects: string[] = [],
    options: object = {},
    makePublic: boolean = false,
  ) {
    const local = this.accessPoint + 'local/'
    existingPartialProjects.push(local)

    // create global access point
    await this.dataService.createContainer(this.accessPoint, makePublic)
    await this.dataService.createContainer(local, makePublic)
    if (makePublic) {
      let aclDefault = `INSERT {?rule <${ACL.default}> <${local}>} WHERE {?rule a <${ACL.Authorization}> ; <${ACL.agentClass}> <${FOAF.Agent}>}`
      await this.dataService.sparqlUpdate(local + '.acl', aclDefault)
    }

    // create different registries
    await this.createRegistryContainer("datasets/", makePublic, LBD.hasDatasetRegistry)
    const referenceContainerUrl = await this.createRegistryContainer("references/", makePublic, LBD.hasReferenceRegistry)
    await this.createRegistryContainer("services/", makePublic, LBD.hasServiceRegistry)

    for (const part of existingPartialProjects) {
        await this.addPartialProject(part)
    }

    let q = `INSERT DATA {<${this.accessPoint}> <${DCTERMS.creator}> "${this.session.info.webId}" . }`
    await this.dataService.sparqlUpdate(local, q)
    await this.dataService.sparqlUpdate(this.accessPoint, q)

    // create optional metadata (e.g. label etc.)
    if (Object.keys(options).length > 0) {
      let q0 = `INSERT DATA { `
      for (const key of Object.keys(options)) {
        q0 += `<${this.accessPoint}> <${key}> "${options[key]}" .`
      }    
      q0 += "}"
      await this.dataService.sparqlUpdate(this.accessPoint, q0)
    }



    const referenceMeta = new LbdDataset(this.session, referenceContainerUrl)
    await referenceMeta.create()
    await referenceMeta.addDistribution(Buffer.from(""), "text/turtle", {}, "data", makePublic)
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
    const myEngine = newEngine()
    const projects = await myEngine.query(`SELECT ?proj WHERE {<${this.accessPoint}> <${LBD.aggregates}> ?proj}`, {sources: [this.accessPoint], fetch: this.fetch}).then((i: any) => i.bindings()).then(i => i.map(r => r.get('?proj').value))
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
    return containerUrl
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
    const theDataset = new LbdDataset(this.session, datasetUrl)
    await theDataset.create(options, makePublic)
    return theDataset
  }

  public async deleteDataset(
    datasetUrl: string
  ) {
    if (!datasetUrl.endsWith('/')) datasetUrl += "/"
    const ds = new LbdDataset(this.session, datasetUrl)
    await ds.delete()
  }

  public async deleteDatasetById(
    datasetId: string
  ) {
    const subject = extract(this.data, this.localProject)
    const datasetRegistry = subject[LBD.hasDatasetRegistry][0]["@id"]
    const datasetUrl = datasetRegistry + datasetId + "/"
    const ds = new LbdDataset(this.session, datasetUrl)
    await ds.delete()
  }

  private async getAllPartialProjects() {
    const myEngine = newEngine()
    const q = `SELECT ?partial WHERE {<${this.accessPoint}> <${LBD.aggregates}> ?partial}`
    const results = await myEngine.query(q, {sources: [this.accessPoint], fetch: this.fetch})
    const { data } = await myEngine.resultToString(results,'application/sparql-results+json');
    const asJson = await parseStream(data)
    const partials = asJson["results"].bindings.map(item => item["partial"].value)
    console.log('partials', partials)
    return partials
  }

  private async getSingleQueryResult(source, property) {
    const myEngine = newEngine()
    const q = `SELECT ?res WHERE {<${source}> <${property}> ?res}`
    const bindings = await myEngine.query(q, {sources: [source], fetch: this.fetch}).then((i: IQueryResultBindings) => i.bindings())
    return bindings[0].get("?res").value
  }

  public async getAllDatasetUrls(options?: {query: string, asStream: boolean, local: boolean}) {
    const myEngine = newEngine()
    const subject = extract(this.data, this.localProject)
    const sources = []
    if (options && options.local) {
      sources.push(subject[LBD.hasDatasetRegistry][0]["@id"])
    } else {
      const partials = await this.getAllPartialProjects()
      for (const p of partials) {
        const dsReg = await this.getSingleQueryResult(p, LBD.hasDatasetRegistry)
        sources.push(dsReg)
      }
    }
    let q
    if (!options || !options.query) {
      q = `SELECT ?dataset WHERE {?registry <${LDP.contains}> ?dataset}`
    } else {
      q = options.query
    }

    const results = await myEngine.query(q, {sources, fetch: this.fetch})
    const { data } = await myEngine.resultToString(results,'application/sparql-results+json');
    if (options && options.asStream) {
      return data
    } else {
      const parsed = await parseStream(data);
      return parsed["results"].bindings.map(i => i["dataset"].value)
    }
  }

  /////////////////////////////////////////////////////////
  ////////////////////// REFERENCES////////////////////////
  /////////////////////////////////////////////////////////

  // get all references related to a specific abstract Concept
  public async addConcept(): Promise<LbdConcept> {
    const subject = extract(this.data, this.localProject)
    const referenceRegistry = subject[LBD.hasReferenceRegistry][0]["@id"]
    const ref = new LbdConcept(this.session, referenceRegistry)
    await ref.create()
    return ref
  }

  public async deleteConcept(url: string) {
    const parts = url.split("/")
    const id = parts.pop()
    const referenceRegistry = parts.join("/")
    console.log('id, referenceRegistry', id, referenceRegistry);
    const ref = new LbdConcept(this.session, referenceRegistry, id)
    await ref.delete()
  }


  // register an alias for an existing concept
  public async addAlias() {}

  // get the abstract Concept related to a dataset/distribution + id
  public async getConcept() {}

  /////////////////////////////////////////////////////////
  /////////////////////// QUERY ////////////////////////
  /////////////////////////////////////////////////////////
  public async queryProject() {
    // if there is a satellite

    // if there is no satellite
  }


  

}

