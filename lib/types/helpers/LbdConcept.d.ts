import AccessService from "./access-service";
import DataService from "./data-service";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
export default class LbdConcept {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    datasetUrl: string;
    registry: string;
    id: string;
    concept: string;
    distribution: string;
    private session;
    url: string;
    constructor(session: BrowserSession | NodeSession, registry: any, id?: string);
    create(): Promise<void>;
    delete(): Promise<void>;
    addReference(identifier: string, dataset: string, distribution?: string): Promise<string>;
    deleteReference(referenceUrl: any): Promise<void>;
    addAlias(): Promise<void>;
    private getIdentifierType;
}
//# sourceMappingURL=LbdConcept.d.ts.map