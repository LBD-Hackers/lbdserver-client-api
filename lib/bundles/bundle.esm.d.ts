/// <reference types="node" />
import * as _inrupt_solid_client from '@inrupt/solid-client';
import * as _inrupt_solid_client_dist_interfaces from '@inrupt/solid-client/dist/interfaces';
import { Session } from '@inrupt/solid-client-authn-browser';
import { Session as Session$1 } from '@inrupt/solid-client-authn-node';

declare class AccessRights {
    read: boolean;
    append: boolean;
    write: boolean;
    control: boolean;
}
declare enum ResourceType {
    FILE = "file",
    DATASET = "dataset",
    CONTAINER = "container"
}

declare class AccessService {
    fetch: any;
    verbose: boolean;
    constructor(fetch: any, verbose?: boolean);
    makePublic(resourceURL: string): Promise<Readonly<{
        type: "Dataset";
        graphs: Readonly<Record<string, Readonly<Record<string, Readonly<{
            type: "Subject";
            url: string;
            predicates: Readonly<Record<string, Readonly<Partial<{
                literals: Readonly<Record<string, readonly string[]>>;
                langStrings: Readonly<Record<string, readonly string[]>>;
                namedNodes: readonly string[];
                blankNodes: readonly (`_:${string}` | Readonly<Record<string, Readonly<Partial<any>>>>)[];
            }>>>>;
        }>>>> & {
            default: Readonly<Record<string, Readonly<{
                type: "Subject";
                url: string;
                predicates: Readonly<Record<string, Readonly<Partial<{
                    literals: Readonly<Record<string, readonly string[]>>;
                    langStrings: Readonly<Record<string, readonly string[]>>;
                    namedNodes: readonly string[];
                    blankNodes: readonly (`_:${string}` | Readonly<Record<string, Readonly<Partial<any>>>>)[];
                }>>>>;
            }>>>;
        }>;
    }> & _inrupt_solid_client.WithResourceInfo & {
        internal_accessTo: string;
    }>;
    makeFilePublic(resourceURL: string): Promise<Readonly<{
        type: "Dataset";
        graphs: Readonly<Record<string, Readonly<Record<string, Readonly<{
            type: "Subject";
            url: string;
            predicates: Readonly<Record<string, Readonly<Partial<{
                literals: Readonly<Record<string, readonly string[]>>;
                langStrings: Readonly<Record<string, readonly string[]>>;
                namedNodes: readonly string[];
                blankNodes: readonly (`_:${string}` | Readonly<Record<string, Readonly<Partial<any>>>>)[];
            }>>>>;
        }>>>> & {
            default: Readonly<Record<string, Readonly<{
                type: "Subject";
                url: string;
                predicates: Readonly<Record<string, Readonly<Partial<{
                    literals: Readonly<Record<string, readonly string[]>>;
                    langStrings: Readonly<Record<string, readonly string[]>>;
                    namedNodes: readonly string[];
                    blankNodes: readonly (`_:${string}` | Readonly<Record<string, Readonly<Partial<any>>>>)[];
                }>>>>;
            }>>>;
        }>;
    }> & _inrupt_solid_client.WithResourceInfo & {
        internal_accessTo: string;
    }>;
    setResourceAccess(resourceURL: string, accessRights: AccessRights, type: ResourceType, userWebID?: string): Promise<Readonly<{
        type: "Dataset";
        graphs: Readonly<Record<string, Readonly<Record<string, Readonly<{
            type: "Subject";
            url: string;
            predicates: Readonly<Record<string, Readonly<Partial<{
                literals: Readonly<Record<string, readonly string[]>>;
                langStrings: Readonly<Record<string, readonly string[]>>;
                namedNodes: readonly string[];
                blankNodes: readonly (`_:${string}` | Readonly<Record<string, Readonly<Partial<any>>>>)[];
            }>>>>;
        }>>>> & {
            default: Readonly<Record<string, Readonly<{
                type: "Subject";
                url: string;
                predicates: Readonly<Record<string, Readonly<Partial<{
                    literals: Readonly<Record<string, readonly string[]>>;
                    langStrings: Readonly<Record<string, readonly string[]>>;
                    namedNodes: readonly string[];
                    blankNodes: readonly (`_:${string}` | Readonly<Record<string, Readonly<Partial<any>>>>)[];
                }>>>>;
            }>>>;
        }>;
    }> & _inrupt_solid_client.WithResourceInfo & {
        internal_accessTo: string;
    }>;
    private getResourceAcl;
    private logAccessInfo;
}

declare class DataService {
    fetch: any;
    verbose: boolean;
    accessService: AccessService;
    constructor(fetch: any, verbose?: boolean);
    /**
     * FILES
     */
    writeFileToPod(file: File | Buffer, targetFileURL: string, makePublic: boolean, contentType: string): Promise<void>;
    getFile(fileURL: string): Promise<Blob & _inrupt_solid_client.WithResourceInfo & {
        internal_resourceInfo: {
            aclUrl?: string;
            linkedResources: _inrupt_solid_client_dist_interfaces.LinkedResourceUrlAll;
            permissions?: {
                user: _inrupt_solid_client.Access;
                public: _inrupt_solid_client.Access;
            };
        };
    }>;
    deleteFile(fileURL: string): Promise<void>;
    /**
     * SPARQL
     */
    sparqlUpdate(fileUrl: string, query: string): Promise<any>;
    /**
     * CONTAINERS
     */
    deleteContainer(containerURL: string, includeSubContainers?: boolean): Promise<void>;
    createContainer(containerURL: string, makePublic?: boolean): Promise<Readonly<{
        type: "Dataset";
        graphs: Readonly<Record<string, Readonly<Record<string, Readonly<{
            type: "Subject";
            url: string;
            predicates: Readonly<Record<string, Readonly<Partial<{
                literals: Readonly<Record<string, readonly string[]>>;
                langStrings: Readonly<Record<string, readonly string[]>>;
                namedNodes: readonly string[];
                blankNodes: readonly (`_:${string}` | Readonly<Record<string, Readonly<Partial<any>>>>)[];
            }>>>>;
        }>>>> & {
            default: Readonly<Record<string, Readonly<{
                type: "Subject";
                url: string;
                predicates: Readonly<Record<string, Readonly<Partial<{
                    literals: Readonly<Record<string, readonly string[]>>;
                    langStrings: Readonly<Record<string, readonly string[]>>;
                    namedNodes: readonly string[];
                    blankNodes: readonly (`_:${string}` | Readonly<Record<string, Readonly<Partial<any>>>>)[];
                }>>>>;
            }>>>;
        }>;
    }> & _inrupt_solid_client.WithResourceInfo & {
        internal_resourceInfo: {
            aclUrl?: string;
            linkedResources: _inrupt_solid_client_dist_interfaces.LinkedResourceUrlAll;
            permissions?: {
                user: _inrupt_solid_client.Access;
                public: _inrupt_solid_client.Access;
            };
        };
    }>;
}

declare class LBDService {
    fetch: any;
    verbose: boolean;
    accessService: AccessService;
    dataService: DataService;
    private session;
    constructor(session: Session | Session$1, verbose?: boolean);
    validateWebId(webId: string): Promise<boolean>;
    getAllProjects(aggregator: any): Promise<any>;
    getProjectRegistry(stakeholder: string): Promise<string | undefined>;
    createProjectRegistry(stakeholder: string, url: string, publiclyAccessible?: boolean): Promise<string>;
    removeProjectRegistry(stakeholder: string, url: string): Promise<void>;
}

declare class LbdConcept {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    private session;
    references: object[];
    aliases: string[];
    registry: string;
    initialized: boolean;
    constructor(session: Session | Session$1, registry: any);
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

declare class LbdDistribution {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LBDService;
    datasetUrl: string;
    contentType: string;
    url: string;
    data: any;
    private session;
    constructor(session: Session | Session$1, url: string);
    checkExistence(): Promise<boolean>;
    init(options?: object): Promise<void>;
    getContentType(): Promise<any>;
    updateMetadata(query: any): Promise<void>;
    addAccessUrl(accessUrl: any): Promise<void>;
    create(file: File | Buffer, options?: object, mimetype?: string, makePublic?: boolean): Promise<void>;
    delete(): Promise<void>;
}

declare class LbdDataset {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LBDService;
    projectId: string;
    url: string;
    distributions: string[];
    data: object[];
    private session;
    constructor(session: Session | Session$1, url: string);
    checkExistence(): Promise<boolean>;
    init(): Promise<any>;
    /**
     *
     * @param makePublic
     * @param id
     * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
     * @returns
     */
    create(options?: object, makePublic?: boolean): Promise<void>;
    delete(): Promise<void>;
    update(query: any): Promise<void>;
    addDistribution(distribution: File | Buffer, mimetype?: any, options?: object, distributionId?: string, makePublic?: boolean): Promise<LbdDistribution>;
}

declare class LbdProject {
    fetch: any;
    verbose: boolean;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LBDService;
    projectId: string;
    accessPoint: string;
    data: object[];
    private session;
    localProject: string;
    constructor(session: Session | Session$1, accessPoint: string, verbose?: boolean);
    checkExistence(): Promise<boolean>;
    init(): Promise<any>;
    create(existingPartialProjects?: string[], options?: object, makePublic?: boolean): Promise<void>;
    addPartialProject(part: string): Promise<void>;
    addStakeholder(webId: string, accessRights?: AccessRights): Promise<void>;
    delete(): Promise<void>;
    findAllPartialProjects(): Promise<any>;
    findPartialProject(webId: string): Promise<string>;
    addPartialProjectByStakeholder(webId: string): Promise<string>;
    private createRegistryContainer;
    /**
     *
     * @param makePublic
     * @param id
     * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
     * @returns
     */
    addDataset(options?: object, makePublic?: boolean, id?: string): Promise<LbdDataset>;
    deleteDataset(datasetUrl: string): Promise<void>;
    deleteDatasetById(datasetId: string): Promise<void>;
    getAllDatasetUrls(options?: {
        query: string;
        asStream: boolean;
        local: boolean;
    }): Promise<any>;
    addConcept(): Promise<LbdConcept>;
    deleteConcept(url: string): Promise<void>;
    getConceptByIdentifier(identifier: string, dataset: string, distribution?: string): Promise<LbdConcept>;
    addAlias(): Promise<void>;
    getConcept(): Promise<void>;
    queryProject(): Promise<void>;
}

declare namespace LBDserver {
    const LbdService: typeof LBDService;
    const LbdProject: typeof LbdProject;
    const LbdDataset: typeof LbdDataset;
    const LbdDistribution: typeof LbdDistribution;
    const vocabulary: {
        LBD: {
            PREFIX: string;
            NAMESPACE: string;
            PREFIX_AND_NAMESPACE: {
                lbd: string;
            };
            NS: (localName: string) => string;
            Aggregator: string;
            Concept: string;
            StringBasedIdentifier: string;
            URIBasedIdentifier: string;
            hasReference: string;
            inDataset: string;
            inDistribution: string;
            hasIdentifier: string;
            identifier: string;
            aggregates: string;
            hasProjectRegistry: string;
            hasDatasetRegistry: string;
            hasReferenceRegistry: string;
            hasServiceRegistry: string;
            hasSatellite: string;
        };
    };
}

export { LBDserver };
