/// <reference types="node" />
import AccessService from "./helpers/access-service";
import DataService from "./helpers/data-service";
import LbdService from "./LbdService";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
export default class LbdDistribution {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LbdService;
    url: string;
    data: any;
    private dataset;
    private session;
    /**
     *
     * @param session an (authenticated) Solid session
     * @param dataset the LbdDataset to which this distribution belongs
     * @param id (optional) identifier of the distribution (default: GUID)
     */
    constructor(session: BrowserSession | NodeSession, dataset: any, id?: string);
    /**
     * Check the existence of this distribution
     */
    checkExistence(): Promise<boolean>;
    /**
     * @description Get the distribution's content
     * @param options Fetch options
     */
    get(options?: object): Promise<void>;
    /**
     * @description Get the content type of the distribution
     * @returns contenttype of the distribution
     */
    getContentType(): any;
    /**
     * @description Update the metadata of the distribution (i.e. its dataset) with a SPARQL query
     * @param query the SPARQL update
     */
    updateMetadata(query: any): Promise<void>;
    /**
     * @description Add a new dcat:accessURL to the distribution
     * @param accessUrl Access URL of the distribution (e.g. for a satellite service)
     */
    addAccessUrl(accessUrl: any): Promise<void>;
    /**
     * @description Create this distribution on a Pod
     * @param file The file/content of the distribution
     * @param options Additional metadata to add to the distribution. form:  {[predicate]: value}
     * @param mimetype optional: the content type of the distribution. If not provided, it will be guessed. If the guess fails, the content type will be text/plain
     * @param makePublic access rights
     */
    create(file: File | Buffer, options?: object, mimetype?: string, makePublic?: boolean): Promise<void>;
    /**
     * Delete this distribution
     */
    delete(): Promise<void>;
}
//# sourceMappingURL=LbdDistribution.d.ts.map