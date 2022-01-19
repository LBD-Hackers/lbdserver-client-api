import AccessService from "./access-service";
import DataService from "./data-service";
import { ActorInitSparql } from "@comunica/actor-init-sparql";
import LbdDataset from "./LbdDataset";
import { AccessRights } from "./BaseDefinitions";
import LBDService from "./LbdService";
export default class LbdProject {
    fetch: any;
    verbose: boolean;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LBDService;
    projectId: string;
    accessPoint: string;
    data: object[];
    queryEngine: ActorInitSparql;
    localProject: string;
    constructor(fetch: any, accessPoint: string, verbose?: boolean);
    checkExistence(): Promise<boolean>;
    init(): Promise<any>;
    create(makePublic?: boolean, existingPartialProjects?: string[]): Promise<void>;
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
    addDistribution(datasetURL: string, distribution: File[]): Promise<void>;
    deleteDistribution(datasetURL: string, distribution: File[]): Promise<void>;
    updateDistribution(datasetURL: string, distribution: File[]): Promise<void>;
    queryDistribution(datasetURL: string, distribution: File[]): Promise<void>;
    getReferences(): Promise<void>;
    deleteReference(): Promise<void>;
    addReference(): Promise<void>;
    addConcept(): Promise<void>;
    addAlias(): Promise<void>;
    getConcept(): Promise<void>;
    addService(): Promise<void>;
    deleteService(): Promise<void>;
    getAllServices(): Promise<void>;
}
//# sourceMappingURL=LbdProject.d.ts.map