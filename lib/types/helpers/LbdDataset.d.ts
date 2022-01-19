/// <reference types="node" />
import AccessService from "./access-service";
import DataService from "./data-service";
import { ActorInitSparql } from "@comunica/actor-init-sparql";
import LBDService from "./LbdService";
import LbdDistribution from './LbdDistribution';
export default class LbdDataset {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LBDService;
    projectId: string;
    url: string;
    data: object[];
    queryEngine: ActorInitSparql;
    constructor(fetch: any, url: any);
    checkExistence(): Promise<boolean>;
    init(): Promise<any>;
    /**
     *
     * @param makePublic
     * @param id
     * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
     * @returns
     */
    create(options?: object, makePublic?: boolean): Promise<void>;
    delete(): Promise<void>;
    update(query: any): Promise<void>;
    addDistribution(distribution: File | Buffer, mimetype?: any, options?: object, distributionId?: string, makePublic?: boolean): Promise<LbdDistribution>;
    getDistributionUrls(): Promise<any>;
    deleteDistribution(distributionId: File[]): Promise<void>;
}
//# sourceMappingURL=LbdDataset.d.ts.map