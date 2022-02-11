import AccessService from "./access-service";
import DataService from "./data-service";
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
    create(): Promise<void>;
    initialize(data: {
        aliases: string[];
        references: {
            dataset: string;
            distribution: string;
            identifier: string;
        }[];
    }): Promise<void>;
    delete(): Promise<void>;
    addReference(identifier: string, dataset: string, distribution: string): Promise<string>;
    deleteReference(referenceUrl: any): Promise<void>;
    private getIdentifierType;
}
//# sourceMappingURL=LbdConcept.d.ts.map