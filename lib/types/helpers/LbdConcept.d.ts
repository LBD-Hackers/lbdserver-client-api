import AccessService from "./access-service";
import DataService from "./data-service";
import { ActorInitSparql } from "@comunica/actor-init-sparql";
export default class LbdConcept {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    datasetUrl: string;
    registry: string;
    id: string;
    concept: string;
    distribution: string;
    queryEngine: ActorInitSparql;
    url: string;
    constructor(fetch: any, registry: any, id?: string);
    create(): Promise<void>;
    delete(): Promise<void>;
    addReference(identifier: string, dataset: string, distribution?: string): Promise<string>;
    deleteReference(referenceUrl: any): Promise<void>;
    addAlias(): Promise<void>;
    private getIdentifierType;
}
//# sourceMappingURL=LbdConcept.d.ts.map