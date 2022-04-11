import AccessService from "./helpers/access-service";
import DataService from "./helpers/data-service";
import { computeChecksumMd5 } from "./helpers/utils";
import { newEngine, IQueryResultBindings } from "@comunica/actor-init-sparql";
// Import from "@inrupt/solid-client"
import {
  createSolidDataset,
  buildThing,
  getSolidDataset,
  createThing,
  setThing,
  setUrl,
  addUrl,
  getThingAll,
  getUrlAll,
  setDatetime,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import { extract, streamToString } from "./helpers/functions";
import { RDF, SCHEMA_INRUPT, DCAT, OWL, LDP, AS, XSD, FOAF, DCTERMS } from "@inrupt/vocab-common-rdf";
import LBD from "./helpers/vocab/lbds";
import { AccessRights, ResourceType } from "./helpers/BaseDefinitions";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
import { translate, toSparql } from 'sparqlalgebrajs'
import { Store, DataFactory } from 'n3'
import { QueryEngine } from "@comunica/query-sparql";

const { namedNode, literal, defaultGraph, quad, variable } = DataFactory;

export class LbdService {
  public fetch;
  public verbose: boolean = false;
  public accessService: AccessService;
  public dataService: DataService;
  private session: BrowserSession | NodeSession;
  private store: Store


  /**
   * 
   * @param session an (authenticated) session
   * @param verbose optional parameter for logging purposes
   */
  constructor(session: BrowserSession | NodeSession, verbose: boolean = false) {
    this.session = session;
    this.fetch = session.fetch;
    this.verbose = verbose;
    this.accessService = new AccessService(session.fetch);
    this.dataService = new DataService(session.fetch);
    this.store = new Store()
  }

  /////////////////////////////////////////////////////////
  ////////////////////// QUERY ////////////////////////////
  /////////////////////////////////////////////////////////

  public async query(q: string, { sources, registries, asStream }) {
    const { query } = this.mutateQuery(q)

    const myEngine = new QueryEngine();

    await this.inference(myEngine, registries)
    const context: any = { sources: [...sources, this.store], fetch }
    const result = await myEngine.query(query, context)
    const { data } = await myEngine.resultToString(result,
      'application/sparql-results+json');
    if (asStream) {
      return data
    } else {
      return JSON.parse(await streamToString(data))
    }
  }

  private findLowerLevel(obj, variables) {
    if (!variables) variables = obj.variables
    if (obj.type === "bgp") {
      return { bgp: obj, variables }
    } else {
      return this.findLowerLevel(obj.input, variables)
    }
  }

  private inference(myEngine, registries): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const q = `
      CONSTRUCT {
       ?s1 <${OWL.sameAs}> ?s2 .
       ?s2 <${OWL.sameAs}> ?s1 .
      } WHERE {
          ?concept1 <${LBD.hasReference}>/<${LBD.hasIdentifier}>/<http://schema.org/value> ?s1 .
          ?concept2 <${LBD.hasReference}>/<${LBD.hasIdentifier}>/<http://schema.org/value> ?s2 .
          ?concept1 <${OWL.sameAs}> ?concept2 .
      }`
      const quadStream = await myEngine.queryQuads(q, {
        sources: registries,
        fetch
      });

      quadStream.on('data', (res) => {
        this.store.addQuad(quad(
          namedNode(res.subject.id.replaceAll('"', '')),
          namedNode(res.predicate.value),
          namedNode(res.object.id.replaceAll('"', '')),
          defaultGraph()
        ))
      });

      quadStream.on('end', () => {
        resolve()
      })
    })
  }

  private mutateQuery(query) {
    const translation = translate(query);
    const { bgp, variables } = this.findLowerLevel(translation, translation.variables)
    const usedVariables = new Set()
    let aliasNumber = 1
    let aliases = {}
    for (const pattern of bgp.patterns) {
      for (const item of Object.keys(pattern)) {
        if (pattern[item].termType === "Variable") {
          if (usedVariables.has(pattern[item])) {
            const newVName = `${pattern[item].value}_alias${aliasNumber}`
            if (!aliases[pattern[item].value]) aliases[pattern[item].value] = []

            aliases[pattern[item].value].push(newVName)
            aliasNumber += 1
            const newV = { termType: "Variable", value: newVName }
            pattern[item] = newV
          }
          usedVariables.add(pattern[item])
        }

      }
    }
    Object.keys(aliases).forEach(item => {
      aliases[item].forEach(alias => {
        const newPattern = quad(
          variable(item),
          namedNode("http://www.w3.org/2002/07/owl#sameAs"),
          variable(alias),
          defaultGraph()
        )
        bgp.patterns.push(newPattern)
      })
    })
    const q: any = { type: "project", input: { type: "bgp", patterns: bgp.patterns }, variables: Array.from(usedVariables) }
    return { query: toSparql(q), variables: Array.from(usedVariables) }
  }


  /////////////////////////////////////////////////////////
  ////////////////////// PREPARATION //////////////////////
  /////////////////////////////////////////////////////////
  /**
   * @description This function checks if the card (webId) contains a lbds:hasProjectRegistry pointer
   * @param webId the webId/card to check
   * @returns boolean - false: the WebID doesn't have a project registry yet / true: a project registry is mentioned in the card
   */
  public async validateWebId(webId?: string) {
    if (!webId) { if (this.session.info.isLoggedIn) { webId = this.session.info.webId } else { throw new Error('No WebID found') } }

    const lbdLoc = await this.getProjectRegistry(webId);
    if (lbdLoc && lbdLoc.length > 0) {
      return true;
    }
    return false;
  }

  /**
   * @description This function retrieves the LBDserver projects from a project aggregator (e.g. a project registry or public aggregator)
   * @param aggregator an LBDS aggregator, aggregating projects with lbds:aggregates
   * @returns Array of LBDserver project access points (URL).
   */
  public async getAllProjects(aggregator) {
    const data = await this.fetch(aggregator, {
      headers: { Accept: "application/ld+json" },
    }).then((t) => t.json());
    const myProjects = extract(data, aggregator)[LDP.contains].map(
      (i) => i["@id"]
    );
    return myProjects;
  }

  /**
   * @description Find the LBDserver project registry of a specific stakeholder by their WebID.
   * @param stakeholder The WebID of the stakeholder from whom the project registry should be retrieved
   * @returns URL of project registry
   */
  public async getProjectRegistry(
    stakeholder?: string
  ): Promise<string | undefined> {
    if (!stakeholder) { if (this.session.info.isLoggedIn) { stakeholder = this.session.info.webId } else { throw new Error('No WebID found') } }
    const myEngine = newEngine();
    const q = `select ?loc where {<${stakeholder}> <${LBD.hasProjectRegistry}> ?loc}`;
    const location = await myEngine
      .query(q, { sources: [stakeholder], fetch: this.fetch })
      .then((res: IQueryResultBindings) => res.bindings())
      .then((bind: any) => bind.map((i) => i.get("?loc").value))
      .catch((err: Error) => {
        throw err;
      });
    if (location && location.length > 0) {
      return location[0];
    } else {
      return undefined;
    }
  }

  /**
   * @description This function retrieves the LDP inbox from a particular WebID
   * @param stakeholder The WebID of the stakeholder from whom the LDP inbox should be retrieved
   * @returns The inbox URL
   */
  public async getInbox(stakeholder: string): Promise<string | undefined> {
    const myEngine = newEngine();
    const q = `select ?inbox where {<${stakeholder}> <${LDP.inbox}> ?inbox}`;
    const inbox = await myEngine
      .query(q, { sources: [stakeholder], fetch: this.fetch })
      .then((res: IQueryResultBindings) => res.bindings())
      .then((bind: any) => bind.map((i) => i.get("?inbox").value))
      .catch((err: Error) => {
        throw err;
      });
    if (inbox && inbox.length > 0) {
      return inbox[0];
    } else {
      return undefined;
    }
  }

  //   public async inviteStakeholder(stakeholder: string, projectId: string) {
  //     const inbox = await this.getInbox(stakeholder);
  //     const id = v4();
  //     const url = inbox + id;
  //     const message = `<>
  //   a <${AS.Announce}> ;
  //   <${AS.actor}> <${this.session.info.webId}> ;
  //   <${AS.object}> <#invite> ;
  //   <${AS.target}> <${stakeholder}> ;
  //   <${AS.updated}> "${new Date().toISOString()}"^^${XSD.dateTime} .

  // <#invite> a ${LBD.ProjectInvite}; 
  //   <${FOAF.primaryTopic}> <#project> .
  // <#project> a <${LBD.Project}> ;
  //     <${DCTERMS.identifier} "${projectId}" .
  //   `;

  //   const options = {
  //     method: "POST",
  //     body: message,
  //   }
  //     // await this.session.fetch()
  //   }

  /**
   * @description Create an LBDserver project registry
   * @param url Where the project registry should be created
   * @param publiclyAccessible Access rights for the project registry
   * @returns the URL of the LBDserver Project Registry
   */
  public async createProjectRegistry(
    url: string = undefined,
    publiclyAccessible: boolean = true
  ): Promise<string> {
    try {
      const stakeholder = this.session.info.webId
      if (!url) url = stakeholder.replace("/profile/card#me", "/lbd/");

      const q0 = `INSERT DATA {
          <${stakeholder}> <${LBD.hasProjectRegistry}> <${url}> .
        }`;
      await this.dataService.sparqlUpdate(stakeholder, q0);

      // create the LBD registry (container / Aggregator)
      const q1 = `INSERT DATA {
        <${url}> a <${LBD.Aggregator}> .
      }`;

      // the updates immediately creates the container
      await this.dataService.sparqlUpdate(url, q1);

      let accessRights: AccessRights;
      let actor: string | undefined;
      if (publiclyAccessible) {
        accessRights = {
          read: true,
          append: false,
          write: false,
          control: false,
        };
      } else {
        accessRights = { read: true, append: true, write: true, control: true };
        actor = stakeholder;
      }
      await this.accessService.setResourceAccess(
        url,
        accessRights,
        ResourceType.CONTAINER,
        actor
      );
      return url;
    } catch (error) {
      console.log(`error`, error);
      throw error;
    }
  }

  /**
   * @description delete a project registry at a particular location
   * @param stakeholder The stakeholder (the authenticated agent)
   * @param url The URL of the project registry
   */
  public async removeProjectRegistry(url: string) {
    try {
      const q0 = `DELETE {<${this.session.info.webId}> <${LBD.hasProjectRegistry}> <${url}> .}
      WHERE {<${this.session.info.webId}> <${LBD.hasProjectRegistry}> ?reg .}`;
      await this.dataService.sparqlUpdate(this.session.info.webId, q0);
      await this.dataService.deleteContainer(url, true);
    } catch (error) {
      console.log(`error`, error);
      throw error;
    }
  }
}
