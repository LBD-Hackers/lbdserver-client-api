import AccessService from "./helpers/access-service";
import DataService from "./helpers/data-service";
import LbdConcept from "./LbdConcept";
import LbdDataset from "./LbdDataset";
import { AccessRights } from "./helpers/BaseDefinitions";
import LBDService from "./LbdService";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
export default class LbdProject {
    fetch: any;
    verbose: boolean;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LBDService;
    projectId: string;
    accessPoint: string;
    data: object[];
    private session;
    localProject: string;
    /**
     *
     * @param session an (authenticated) Solid session
     * @param accessPoint The main accesspoint of the project. This is an aggregator containing the different partial projects of the LBDserver instance
     * @param verbose optional parameter for logging purposes
     */
    constructor(session: BrowserSession | NodeSession, accessPoint: string, verbose?: boolean);
    /**
     * @description Checks whether a project with this access point already exists
     * @returns Boolean: true = the project exists / false = the project doesn't exist
     */
    checkExistence(): Promise<boolean>;
    /**
     * @description Initialize the project in your application. In short, this adds project metadata to your LbdProject instance
     */
    init(): Promise<any>;
    /**
     * @description Create an LBDserver project on your Pod
     * @param existingPartialProjects optional: if the project is already initialized on other stakeholder pods. Adds the existing partial projects to the Pod-specific access point
     * @param options Metadata for the project. To be in format {[predicate]: value}
     * @param makePublic access rights: true = public; false = only the creator
     */
    create(existingPartialProjects?: string[], options?: object, makePublic?: boolean): Promise<void>;
    /**
     * @description Add a partial project to a Pod-specific access point
     * @param part Partial project to add to a Pod-specific access point
     */
    addPartialProject(part: string): Promise<void>;
    /**
     * @description Add a stakeholder to an LBDserver project
     * @param webId The WebID/card of the stakeholder
     * @param accessRights the access rights this stakeholder should have.
     */
    addStakeholder(webId: string, accessRights?: AccessRights): Promise<void>;
    /**
     * @description delete an LBDserver project (locally)
     */
    delete(): Promise<void>;
    /**
     * @description find all the partial projects from the indicated project access point
     */
    findAllPartialProjects(): Promise<any>;
    /**
     * @description Find the partial project provided by this stakeholder
     * @param webId The webID of the stakeholder whom's partial project you want to find
     * @returns The URL of the partial project
     */
    findPartialProject(webId: string): Promise<string>;
    /**
     * @description Add this stakeholder's partial project corresponding with this project (same GUID)
     * @param webId The webID of the stakeholder whom's partial project you want to add
     * @returns the URL of the partial project
     */
    addPartialProjectByStakeholder(webId: string): Promise<string>;
    private createRegistryContainer;
    /**
     * @description Add a dataset to the project
     * @param makePublic initial access rights for the dataset
     * @param id optional id for the dataset - a GUID is created by default
     * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
     * @returns
     */
    addDataset(options?: object, makePublic?: boolean, id?: string): Promise<LbdDataset>;
    /**
     * @description Delete a dataset by URL
     * @param datasetUrl The URL of the dataset
     */
    deleteDataset(datasetUrl: string): Promise<void>;
    /**
     * @description delete a dataset by its ID
     * @param datasetId The GUID of the dataset to be deleted
     */
    deleteDatasetById(datasetId: string): Promise<void>;
    /**
     * @description Get all datasets within this project
     * @param options {query: query to override, asStream: consume the results as a stream, local: query only the local project}
     * @returns
     */
    getAllDatasetUrls(options?: {
        query: string;
        asStream: boolean;
        local: boolean;
    }): Promise<any>;
    /**
     * @description Add a concept to the local project registry
     * @returns an LBDconcept Instance
     */
    addConcept(): Promise<LbdConcept>;
    /**
     * @description delete a concept by ID
     * @param url the URL of the concept to be deleted
     */
    deleteConcept(url: string): Promise<void>;
    /**
     * @description Find the main concept by one of its representations: an identifier and a dataset
     * @param identifier the Identifier of the representation
     * @param dataset the dataset where the representation resides
     * @param distribution (optional) the distribution of the representation
     * @returns
     */
    getConceptByIdentifier(identifier: string, dataset: string, distribution?: string): Promise<LbdConcept>;
    addAlias(): Promise<void>;
    getConcept(): Promise<void>;
    queryProject(): Promise<void>;
}
//# sourceMappingURL=LbdProject.d.ts.map