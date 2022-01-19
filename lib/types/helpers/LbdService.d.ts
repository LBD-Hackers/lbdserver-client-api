import AccessService from "./access-service";
import DataService from "./data-service";
export default class LBDService {
    fetch: any;
    verbose: boolean;
    accessService: AccessService;
    dataService: DataService;
    constructor(fetch: any, verbose?: boolean);
    validateWebId(webId: string): Promise<boolean>;
    getProjectRegistry(stakeholder: string): Promise<string | undefined>;
    createProjectRegistry(stakeholder: string, url: string, publiclyAccessible?: boolean): Promise<string>;
    removeProjectRegistry(stakeholder: string, url: string): Promise<void>;
}
//# sourceMappingURL=LbdService.d.ts.map