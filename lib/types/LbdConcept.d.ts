import AccessService from "./helpers/access-service";
import DataService from "./helpers/data-service";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
export default class LbdConcept {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    private session;
    references: object[];
    aliases: string[];
    registry: string;
    initialized: boolean;
    constructor(session: BrowserSession | NodeSession, registry: any);
    /**
     * create this concept on a project (in a Pod) - asynchronous
     */
    create(): Promise<void>;
    /**
     * @description initialise an already existing concept in your application
     * @param data {aliases: string[], references: {dataset, distribution, identifier}[]
     */
    init(data: {
        aliases: string[];
        references: {
            dataset: string;
            distribution: string;
            identifier: string;
        }[];
    }): void;
    /**
     * @description delete this concept from the reference registry
     */
    delete(): Promise<void>;
    /**
     * @description Add a reference to this concept
     * @param identifier the identifier
     * @param dataset the dataset that contains this reference
     * @param distribution the distribution that contains this reference
     * @returns
     */
    addReference(identifier: string, dataset: string, distribution: string): Promise<string>;
    /**
     * @description Delete a reference for this concept
     * @param referenceUrl the URL of the reference to delete
     */
    deleteReference(referenceUrl: any): Promise<void>;
    private getIdentifierType;
}
//# sourceMappingURL=LbdConcept.d.ts.map