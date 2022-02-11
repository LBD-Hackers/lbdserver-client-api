/// <reference types="node" />
import AccessService from "./access-service";
import DataService from "./data-service";
import LBDService from "./LbdService";
import LbdDistribution from './LbdDistribution';
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
export default class LbdDataset {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LBDService;
    projectId: string;
    url: string;
    distributions: LbdDistribution[];
    data: object[];
    private session;
    constructor(session: BrowserSession | NodeSession, url: string);
    checkExistence(): Promise<boolean>;
    init(): Promise<void>;
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
    getDistributions(): Promise<any[]>;
    deleteDistribution(distributionId: File[]): Promise<void>;
}
//# sourceMappingURL=LbdDataset.d.ts.map