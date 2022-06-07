/// <reference types="node" />
import AccessService from "./helpers/access-service";
import DataService from "./helpers/data-service";
import { LbdService } from "./LbdService";
import { LbdDistribution } from './LbdDistribution';
import { QueryEngine } from "@comunica/query-sparql";
export declare class LbdDataset {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LbdService;
    projectId: string;
    url: string;
    distributions: LbdDistribution[];
    data: object[];
    session: any;
    constructor(session: any, url: string);
    /**
     *
     * @returns boolean: this dataset exists or not
     */
    checkExistence(): Promise<boolean>;
    /**
     * @description create this dataset within the active project
     * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
     * @param makePublic initial access rights for the dataset (boolean)
     */
    create(options?: object, makePublic?: boolean): Promise<void>;
    /**
     * @description delete this dataset
     * @returns void
     */
    delete(): Promise<void>;
    /**
     * @description Update the dataset with SPARQL (dangerous - watch out!)
     * @param query The SPARQL query with which to update the dataset
     */
    update(query: any): Promise<void>;
    /**
     * @description create a distribution for this dataset
     * @param distribution The file to upload as a dump of the dataset
     * @param mimetype The mimetype of the distribution (if omitted it is guessed)
     * @param options options (currently not implemented)
     * @param distributionId the ID of the distribution - normally UUID, but can be overridden
     * @param makePublic initial access rights for the dataset (boolean)
     * @returns the distribution object
     */
    addDistribution(distribution: File | Buffer, mimetype?: any, options?: object, distributionId?: string, makePublic?: boolean): Promise<LbdDistribution>;
    /**
     * @description get an Array of distribution URLs of this dataset
     * @returns an Array of distribution URLs
     */
    getDistributions(queryEngine?: QueryEngine): Promise<LbdDistribution[]>;
}
//# sourceMappingURL=LbdDataset.d.ts.map