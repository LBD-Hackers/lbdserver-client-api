/// <reference types="node" />
import AccessService from "./access-service";
import DataService from "./data-service";
import { ActorInitSparql } from "@comunica/actor-init-sparql";
import LBDService from "./LbdService";
export default class LbdDistribution {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LBDService;
    datasetUrl: string;
    queryEngine: ActorInitSparql;
    url: string;
    data: any;
    constructor(fetch: any, url: any);
    checkExistence(): Promise<boolean>;
    init(options?: object): Promise<void>;
    updateMetadata(query: any): Promise<void>;
    addAccessUrl(accessUrl: any): Promise<void>;
    create(file: File | Buffer, options?: object, mimetype?: string, makePublic?: boolean): Promise<void>;
    delete(): Promise<void>;
}
//# sourceMappingURL=LbdDistribution.d.ts.map