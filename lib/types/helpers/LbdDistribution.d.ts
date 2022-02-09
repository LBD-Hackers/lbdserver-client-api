/// <reference types="node" />
import AccessService from "./access-service";
import DataService from "./data-service";
import { ActorInitSparql } from "@comunica/actor-init-sparql";
import LBDService from "./LbdService";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
export default class LbdDistribution {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LBDService;
    datasetUrl: string;
    contentType: string;
    queryEngine: ActorInitSparql;
    url: string;
    data: any;
    private session;
    constructor(session: BrowserSession | NodeSession, url: string);
    checkExistence(): Promise<boolean>;
    init(options?: object): Promise<void>;
    getContentType(): Promise<any>;
    updateMetadata(query: any): Promise<void>;
    addAccessUrl(accessUrl: any): Promise<void>;
    create(file: File | Buffer, options?: object, mimetype?: string, makePublic?: boolean): Promise<void>;
    delete(): Promise<void>;
}
//# sourceMappingURL=LbdDistribution.d.ts.map