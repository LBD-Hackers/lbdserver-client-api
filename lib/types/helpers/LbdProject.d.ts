import AccessService from "./access-service";
import DataService from "./data-service";
import LbdConcept from './LbdConcept';
import { ActorInitSparql } from "@comunica/actor-init-sparql";
import LbdDataset from "./LbdDataset";
import { AccessRights } from "./BaseDefinitions";
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
    queryEngine: ActorInitSparql;
    localProject: string;
    constructor(session: BrowserSession | NodeSession, accessPoint: string, verbose?: boolean);
    checkExistence(): Promise<boolean>;
    init(): Promise<any>;
    create(existingPartialProjects?: string[], options?: object, makePublic?: boolean): Promise<void>;
    addPartialProject(part: string): Promise<void>;
    addStakeholder(webId: string, accessRights?: AccessRights): Promise<void>;
    delete(): Promise<void>;
    findAllPartialProjects(): Promise<any>;
    findPartialProject(webId: string): Promise<string>;
    addPartialProjectByStakeholder(webId: string): Promise<string>;
    private createRegistryContainer;
    /**
     *
     * @param makePublic
     * @param id
     * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
     * @returns
     */
    addDataset(options?: object, makePublic?: boolean, id?: string): Promise<LbdDataset>;
    deleteDataset(datasetUrl: string): Promise<void>;
    deleteDatasetById(datasetId: string): Promise<void>;
    addConcept(): Promise<LbdConcept>;
    deleteConcept(url: string): Promise<void>;
    addAlias(): Promise<void>;
    getConcept(): Promise<void>;
    queryProject(): Promise<void>;
}
//# sourceMappingURL=LbdProject.d.ts.map