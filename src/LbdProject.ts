import AccessService from "./helpers/access-service";
import DataService from "./helpers/data-service";
import LbdConcept from "./LbdConcept";
import {
  newEngine,
  IQueryResultBindings,
  ActorInitSparql,
} from "@comunica/actor-init-sparql";
import LbdDataset from "./LbdDataset";
import LBD from "./helpers/vocab/lbds";
import { AccessRights, ResourceType } from "./helpers/BaseDefinitions";
import LBDService from "./LbdService";
import { extract, query } from "./helpers/functions";
import { v4 } from "uuid";
import { ACL, DCAT, DCTERMS, FOAF, OWL } from "@inrupt/vocab-common-rdf";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
import { LDP } from "@inrupt/vocab-common-rdf";
import { getQueryResult, parseStream } from "./helpers/utils";

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
  public localProject: string;

  /**
   * 
   * @param session an (authenticated) Solid session
   * @param accessPoint The main accesspoint of the project. This is an aggregator containing the different partial projects of the LBDserver instance
   * @param verbose optional parameter for logging purposes
   */
  constructor(
    session: BrowserSession | NodeSession,
    accessPoint: string,
    verbose: boolean = false
  ) {
    if (!accessPoint.endsWith("/")) accessPoint += "/";
    this.session = session;
    this.fetch = session.fetch;
    this.accessPoint = accessPoint;
    this.localProject = accessPoint + "local/";
    this.verbose = verbose;
    this.projectId = accessPoint.split("/")[accessPoint.split("/").length - 2];
    this.accessService = new AccessService(session.fetch);
    this.dataService = new DataService(session.fetch);
    this.lbdService = new LBDService(session);
  }

  /**
   * @description Checks whether a project with this access point already exists
   * @returns Boolean: true = the project exists / false = the project doesn't exist
   */
  public async checkExistence() {
    const status = await this.fetch(this.accessPoint, { method: "HEAD" }).then(
      (result) => result.status
    );
    if (status === 200) {
      return true;
    } else {
      return false;
    }
  }

  /** 
   * @description Initialize the project in your application. In short, this adds project metadata to your LbdProject instance
   */
  public async init() {
    const data = await this.fetch(this.localProject, {
      headers: { Accept: "application/ld+json" },
    }).then((i) => i.json());
    this.data = data;
    return data;
  }


  /**
   * @description Create an LBDserver project on your Pod
   * @param existingPartialProjects optional: if the project is already initialized on other stakeholder pods. Adds the existing partial projects to the Pod-specific access point
   * @param options Metadata for the project. To be in format {[predicate]: value}
   * @param makePublic access rights: true = public; false = only the creator
   */
  public async create(
    existingPartialProjects: string[] = [],
    options: object = {},
    makePublic: boolean = false
  ) {
    const local = this.accessPoint + "local/";
    existingPartialProjects.push(local);

    // create global access point
    await this.dataService.createContainer(this.accessPoint, makePublic);
    await this.dataService.createContainer(local, makePublic);
    if (makePublic) {
      let aclDefault = `INSERT {?rule <${ACL.default}> <${local}>} WHERE {?rule a <${ACL.Authorization}> ; <${ACL.agentClass}> <${FOAF.Agent}>}`;
      await this.dataService.sparqlUpdate(local + ".acl", aclDefault);
    }

    // create different registries
    await this.createRegistryContainer(
      "datasets/",
      makePublic,
      LBD.hasDatasetRegistry
    );
    const referenceContainerUrl = await this.createRegistryContainer(
      "references/",
      makePublic,
      LBD.hasReferenceRegistry
    );
    await this.createRegistryContainer(
      "services/",
      makePublic,
      LBD.hasServiceRegistry
    );

    for (const part of existingPartialProjects) {
      await this.addPartialProject(part);
    }

    let q = `INSERT DATA {<${this.accessPoint}> <${DCTERMS.creator}> "${this.session.info.webId}" . }`;
    await this.dataService.sparqlUpdate(local, q);
    await this.dataService.sparqlUpdate(this.accessPoint, q);

    // create optional metadata (e.g. label etc.)
    if (Object.keys(options).length > 0) {
      let q0 = `INSERT DATA { `;
      for (const key of Object.keys(options)) {
        q0 += `<${this.accessPoint}> <${key}> "${options[key]}" .`;
      }
      q0 += "}";
      await this.dataService.sparqlUpdate(this.accessPoint, q0);
    }

    const referenceMeta = new LbdDataset(this.session, referenceContainerUrl);
    await referenceMeta.create();
    await referenceMeta.addDistribution(
      Buffer.from(""),
      "text/turtle",
      {},
      "data",
      makePublic
    );
    await this.init();
  }

  /**
   * @description Add a partial project to a Pod-specific access point
   * @param part Partial project to add to a Pod-specific access point
   */
  public async addPartialProject(part: string) {
    const q0 = `INSERT DATA {
        <${this.accessPoint}> <${LBD.aggregates}> <${part}> .
        }`;
    await this.dataService.sparqlUpdate(this.accessPoint, q0);
  }

  /**
   * @description Add a stakeholder to an LBDserver project
   * @param webId The WebID/card of the stakeholder
   * @param accessRights the access rights this stakeholder should have.
   */
  public async addStakeholder(
    webId: string,
    accessRights: AccessRights = {
      read: true,
      append: false,
      write: false,
      control: false,
    }
  ) {
    await this.accessService.setResourceAccess(
      this.accessPoint,
      accessRights,
      ResourceType.CONTAINER,
      webId
    );
  }

  /**
   * @description delete an LBDserver project (locally)
   */
  public async delete() {
    await this.dataService.deleteContainer(this.accessPoint, true);
  }

  /**
   * @description find all the partial projects from the indicated project access point
   */
  public async findAllPartialProjects() {
    return await getQueryResult(
      this.accessPoint,
      LBD.aggregates,
      this.fetch,
      false
    );
  }

  /**
   * @description Find the partial project provided by this stakeholder
   * @param webId The webID of the stakeholder whom's partial project you want to find
   * @returns The URL of the partial project
   */
  public async findPartialProject(webId: string) {
    const repo = await this.lbdService.getProjectRegistry(webId);
    // console.log('repo', repo)
    const partialProjectOfStakeholder = repo + this.projectId + "/local/";
    return partialProjectOfStakeholder
    // console.log('partialProjectOfStakeholder', partialProjectOfStakeholder)
    // const status = await this.fetch(partialProjectOfStakeholder, {
    //   method: "HEAD",
    // }).then((res) => res.status);
    // if (status === 200) {
    //   return partialProjectOfStakeholder;
    // } else {
    //   throw new Error(
    //     `UNAUTHORIZED: This repository does not exist or you don't have the required access rights`
    //   );
    // }
  }

  /**
   * @description Add this stakeholder's partial project corresponding with this project (same GUID)
   * @param webId The webID of the stakeholder whom's partial project you want to add
   * @returns the URL of the partial project
   */
  public async addPartialProjectByStakeholder(webId: string) {
    const partialProjectUrl = await this.findPartialProject(webId);
    await this.addPartialProject(partialProjectUrl);
    return partialProjectUrl;
  }

  private async createRegistryContainer(containerName, makePublic, property) {
    if (!containerName.endsWith("/")) containerName += "/";

    const containerUrl = this.localProject + containerName;
    await this.dataService.createContainer(containerUrl, makePublic);
    const q0 = `INSERT DATA {
        <${this.localProject}> <${property}> <${containerUrl}> .
      }`;
    await this.dataService.sparqlUpdate(this.localProject, q0);
    return containerUrl;
  }

  /////////////////////////////////////////////////////////
  /////////////////////// DATASETS ////////////////////////
  /////////////////////////////////////////////////////////

  /**
   * @description Add a dataset to the project
   * @param makePublic initial access rights for the dataset
   * @param id optional id for the dataset - a GUID is created by default
   * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
   * @returns
   */
  public async addDataset(
    options: object = {},
    makePublic: boolean = false,
    id: string = v4()
  ): Promise<LbdDataset> {
    const subject = extract(this.data, this.localProject);
    const datasetRegistry = subject[LBD.hasDatasetRegistry][0]["@id"];
    const datasetUrl = datasetRegistry + id + "/";
    const theDataset = new LbdDataset(this.session, datasetUrl);
    await theDataset.create(options, makePublic);
    return theDataset;
  }

  /**
   * @description Delete a dataset by URL
   * @param datasetUrl The URL of the dataset 
   */
  public async deleteDataset(datasetUrl: string) {
    if (!datasetUrl.endsWith("/")) datasetUrl += "/";
    const ds = new LbdDataset(this.session, datasetUrl);
    await ds.delete();
  }

  /**
   * @description delete a dataset by its ID
   * @param datasetId The GUID of the dataset to be deleted
   */
  public async deleteDatasetById(datasetId: string) {
    const subject = extract(this.data, this.localProject);
    const datasetRegistry = subject[LBD.hasDatasetRegistry][0]["@id"];
    const datasetUrl = datasetRegistry + datasetId + "/";
    const ds = new LbdDataset(this.session, datasetUrl);
    await ds.delete();
  }

  /**
   * @description Get all datasets within this project
   * @param options {query: query to override, asStream: consume the results as a stream, local: query only the local project}
   * @returns 
   */
  public async getAllDatasetUrls(options?: {
    query: string;
    asStream: boolean;
    local: boolean;
  }) {
    const myEngine = newEngine();
    const subject = extract(this.data, this.localProject);
    const sources = [];
    if (options && options.local) {
      sources.push(subject[LBD.hasDatasetRegistry][0]["@id"]);
    } else {
      const partials = await this.findAllPartialProjects();
      for (const p of partials) {
        const dsReg = await getQueryResult(
          p,
          LBD.hasDatasetRegistry,
          this.fetch,
          true
        );
        sources.push(dsReg);
      }
    }
    let q;
    if (!options || !options.query) {
      q = `SELECT ?dataset WHERE {?registry <${LDP.contains}> ?dataset}`;
    } else {
      q = options.query;
    }

    const results = await myEngine.query(q, { sources, fetch: this.fetch });
    const { data } = await myEngine.resultToString(
      results,
      "application/sparql-results+json"
    );
    if (options && options.asStream) {
      return data;
    } else {
      const parsed = await parseStream(data);
      return parsed["results"].bindings.map((i) => i["dataset"].value);
    }
  }

  /////////////////////////////////////////////////////////
  ////////////////////// REFERENCES////////////////////////
  /////////////////////////////////////////////////////////

  /**
   * @description Add a concept to the local project registry
   * @returns an LBDconcept Instance
   */
  public async addConcept(id?): Promise<LbdConcept> {
    const subject = extract(this.data, this.localProject);
    const referenceRegistry = subject[LBD.hasReferenceRegistry][0]["@id"];
    const ref = new LbdConcept(this.session, referenceRegistry);
    await ref.create(id);
    return ref;
  }

  public getReferenceRegistry() {
    const subject = extract(this.data, this.localProject);
    return subject[LBD.hasReferenceRegistry][0]["@id"];
  }

  private async getAllReferenceRegistries() {
    const partials = await this.findAllPartialProjects()
    const registries = []

    for (const partial of partials) {
      const reg = await getQueryResult(partial, LBD.hasReferenceRegistry, this.fetch, true)
      registries.push(reg + "data")
    }

    return registries
  }

  /**
   * @description delete a concept by ID
   * @param url the URL of the concept to be deleted
   */
  public async deleteConcept(url: string) {
    const parts = url.split("/");
    const id = parts.pop();
    const referenceRegistry = parts.join("/");
    const ref = new LbdConcept(this.session, referenceRegistry);
    await ref.delete();
  }

  /**
   * @description Find the main concept by one of its representations: an identifier and a dataset
   * @param identifier the Identifier of the representation
   * @param dataset the dataset where the representation resides
   * @param distribution (optional) the distribution of the representation
   * @returns 
   */
  public async getConceptByIdentifier(
    identifier: string,
    dataset: string,
    distribution?: string
  ) {
    const myEngine = newEngine();

    // find all the reference registries of the aggregated partial projects
    const partials = await this.findAllPartialProjects();
    let sources = [];
    for (const p of partials) {
      const referenceRegistry = await getQueryResult(
        p,
        LBD.hasReferenceRegistry,
        this.fetch,
        true
      );
      const rq = `SELECT ?downloadURL ?dist WHERE {<${referenceRegistry}> <${DCAT.distribution}> ?dist . ?dist <${DCAT.downloadURL}> ?downloadURL . OPTIONAL {?dist <${DCAT.accessURL}> ?accessURL .}}`;
      const results = await myEngine
        .query(rq, { sources: [referenceRegistry], fetch: this.fetch })
        .then((r: IQueryResultBindings) => r.bindings())
        .then((b) =>
          b.map((bi) => {
            return {
              downloadURL: bi.get("?downloadURL"),
              accessURL: bi.get("?accessURL"),
            };
          })
        );
      sources = [...sources, ...results];
    }

    const downloadURLs = sources.map((item) => item.downloadURL.id);
    const q = `SELECT ?concept ?alias WHERE {
      ?concept <${LBD.hasReference}> ?ref .
      ?ref <${LBD.inDataset}> <${dataset}> ;
        <${LBD.hasIdentifier}> ?idUrl .
      ?idUrl <http://schema.org/value> "${identifier}" .
      OPTIONAL {?concept <${OWL.sameAs}> ?alias}
  }`;

    const aliases = new Set<any>();
    await myEngine
      .query(q, { sources: downloadURLs, fetch: this.fetch })
      .then((r: IQueryResultBindings) => r.bindings())
      .then((b) =>
        b.forEach((bi) => {
          aliases.add(bi.get("?concept").value)
          if (bi.get("?alias")) aliases.add(bi.get("?alias"));
        })
      );

      const concept = {
        aliases: [],
        references: [] 
      }

      for (let v of aliases.values()) {
        concept.aliases.push(v)
        const idQ = `SELECT ?dataset ?dist ?identifier WHERE {
          <${v}> <${LBD.hasReference}> ?ref .
          ?ref <${LBD.inDataset}> ?dataset ;
            <${LBD.hasIdentifier}> ?idUrl .
          ?idUrl <http://schema.org/value> ?identifier ;
            <${LBD.inDistribution}> ?dist .
        }`
        const bindings = await myEngine.query(idQ, {sources: downloadURLs, fetch: this.fetch})
          .then((response: IQueryResultBindings) => response.bindings())
        bindings.map(b => {
          concept.references.push({
            dataset: b.get("?dataset").value,
            distribution: b.get("?dist").value,
            identifier: b.get("?identifier").value
          })
      })
    }

    const subject = extract(this.data, this.localProject);
    const referenceRegistry = subject[LBD.hasReferenceRegistry][0]["@id"];
    const theConcept = new LbdConcept(this.session, referenceRegistry)
    theConcept.init(concept)
    return theConcept
    //     const aliases = {}
    //     asJson["results"].bindings.forEach(item => {
    //       const alias = item["alias"].value
    //       const distribution = item["dist"].value
    //       const dataset = item["dataset"].value
    //       const identifier = item["identifier"].value

    //       if (!Object.keys(aliases).includes(alias)) {
    //         aliases[alias] = []
    //       }
    // -    })
  }

  /////////////////////////////////////////////////////////
  /////////////////////// QUERY ///////////////////////////
  /////////////////////////////////////////////////////////

  /**
   * @description a direct query on project resources
   * @param q The SPARQL query (string)
   * @param sources The sources (array)
   * @param asStream Whether to be consumed as a stream or not (default: false)
   * @returns 
   */
  public async directQuery(q: string, sources: string[], asStream: boolean = false) {
    const registries = await this.getAllReferenceRegistries()
    const results = await query(q, {sources, fetch: this.fetch, asStream, registries})
    return results
  }


  // /**
  //  * @description A query where datasets take the 
  //  * @param q 
  //  * @param datasets 
  //  * @param asStream 
  //  */
  // public async indirectQuery(q: string, datasets: string[], asStream: boolean = false) {

  // }
}
