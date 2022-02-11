/// <reference types="node" />
import AccessService from "./access-service";
import DataService from "./data-service";
import LBDService from "./LbdService";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
export default class LbdDistribution {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LBDService;
    url: string;
    data: any;
    private dataset;
    private session;
    constructor(session: BrowserSession | NodeSession, dataset: any, id?: string);
    checkExistence(): Promise<boolean>;
    get(options?: object): Promise<void>;
    getContentType(): any;
    updateMetadata(query: any): Promise<void>;
    addAccessUrl(accessUrl: any): Promise<void>;
    create(file: File | Buffer, options?: object, mimetype?: string, makePublic?: boolean): Promise<void>;
    delete(): Promise<void>;
}
//# sourceMappingURL=LbdDistribution.d.ts.map