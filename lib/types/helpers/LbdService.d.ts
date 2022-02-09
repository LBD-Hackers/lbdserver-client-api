import AccessService from "./access-service";
import DataService from "./data-service";
import { Session as BrowserSession } from "@inrupt/solid-client-authn-browser";
import { Session as NodeSession } from "@inrupt/solid-client-authn-node";
export default class LBDService {
    fetch: any;
    verbose: boolean;
    accessService: AccessService;
    dataService: DataService;
    private session;
    constructor(session: BrowserSession | NodeSession, verbose?: boolean);
    validateWebId(webId: string): Promise<boolean>;
    getAllProjects(aggregator: any): Promise<any>;
    getProjectRegistry(stakeholder: string): Promise<string | undefined>;
    createProjectRegistry(stakeholder: string, url: string, publiclyAccessible?: boolean): Promise<string>;
    removeProjectRegistry(stakeholder: string, url: string): Promise<void>;
}
//# sourceMappingURL=LbdService.d.ts.map