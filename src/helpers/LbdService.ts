import AccessService from "./access-service";
import { urlJoin } from "url-join-ts";
import DataService from "./data-service";
import { computeChecksumMd5 } from "./utils";
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
import { extract } from "./functions";
import { RDF, SCHEMA_INRUPT, DCAT, LDP, AS, XSD, FOAF, DCTERMS } from "@inrupt/vocab-common-rdf";
import LBD from "./vocab/lbd";
import { AccessRights, ResourceType } from "./BaseDefinitions";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
import { v4 } from "uuid";


export default class LBDService {
  public fetch;
  public verbose: boolean = false;
  public accessService: AccessService;
  public dataService: DataService;
  private session: BrowserSession | NodeSession;


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
  }

  /////////////////////////////////////////////////////////
  ////////////////////// PREPARATION //////////////////////
  /////////////////////////////////////////////////////////
  /**
   * @description This function checks if the card (webId) contains a lbds:hasProjectRegistry pointer
   * @param webId the webId/card to check
   * @returns boolean - false: the WebID doesn't have a project registry yet / true: a project registry is mentioned in the card
   */
  public async validateWebId(webId: string) {
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
    stakeholder: string
  ): Promise<string | undefined> {
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
