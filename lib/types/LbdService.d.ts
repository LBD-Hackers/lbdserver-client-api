import AccessService from "./helpers/access-service";
import DataService from "./helpers/data-service";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
export default class LbdService {
    fetch: any;
    verbose: boolean;
    accessService: AccessService;
    dataService: DataService;
    private session;
    private store;
    /**
     *
     * @param session an (authenticated) session
     * @param verbose optional parameter for logging purposes
     */
    constructor(session: BrowserSession | NodeSession, verbose?: boolean);
    query(q: string, { sources, registries, asStream }: {
        sources: any;
        registries: any;
        asStream: any;
    }): Promise<any>;
    private findLowerLevel;
    private inference;
    private mutateQuery;
    /**
     * @description This function checks if the card (webId) contains a lbds:hasProjectRegistry pointer
     * @param webId the webId/card to check
     * @returns boolean - false: the WebID doesn't have a project registry yet / true: a project registry is mentioned in the card
     */
    validateWebId(webId: string): Promise<boolean>;
    /**
     * @description This function retrieves the LBDserver projects from a project aggregator (e.g. a project registry or public aggregator)
     * @param aggregator an LBDS aggregator, aggregating projects with lbds:aggregates
     * @returns Array of LBDserver project access points (URL).
     */
    getAllProjects(aggregator: any): Promise<any>;
    /**
     * @description Find the LBDserver project registry of a specific stakeholder by their WebID.
     * @param stakeholder The WebID of the stakeholder from whom the project registry should be retrieved
     * @returns URL of project registry
     */
    getProjectRegistry(stakeholder: string): Promise<string | undefined>;
    /**
     * @description This function retrieves the LDP inbox from a particular WebID
     * @param stakeholder The WebID of the stakeholder from whom the LDP inbox should be retrieved
     * @returns The inbox URL
     */
    getInbox(stakeholder: string): Promise<string | undefined>;
    /**
     * @description Create an LBDserver project registry
     * @param url Where the project registry should be created
     * @param publiclyAccessible Access rights for the project registry
     * @returns the URL of the LBDserver Project Registry
     */
    createProjectRegistry(url?: string, publiclyAccessible?: boolean): Promise<string>;
    /**
     * @description delete a project registry at a particular location
     * @param stakeholder The stakeholder (the authenticated agent)
     * @param url The URL of the project registry
     */
    removeProjectRegistry(url: string): Promise<void>;
}
//# sourceMappingURL=LbdService.d.ts.map