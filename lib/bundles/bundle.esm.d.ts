/// <reference types="node" />
import * as _inrupt_solid_client from '@inrupt/solid-client';
import * as _inrupt_solid_client_dist_interfaces from '@inrupt/solid-client/dist/interfaces';
import { QueryEngine } from '@comunica/query-sparql';

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

declare class LbdService {
    fetch: any;
    verbose: boolean;
    accessService: AccessService;
    dataService: DataService;
    private session;
    private store;
    /**
     *
     * @param session an (authenticated) session
     * @param verbose optional parameter for logging purposes
     */
    constructor(session: any, verbose?: boolean);
    initialiseSatellite(endpoint: any, repository: any): Promise<void>;
    /**
     * @description This function checks if the card (webId) contains a lbds:hasProjectRegistry pointer
     * @param webId the webId/card to check
     * @returns boolean - false: the WebID doesn't have a project registry yet / true: a project registry is mentioned in the card
     */
    validateWebId(webId?: string): Promise<boolean>;
    /**
     * @description This function retrieves the LBDserver projects from a project aggregator (e.g. a project registry or public aggregator)
     * @param aggregator an LBDS aggregator, aggregating projects with lbds:aggregates
     * @returns Array of LBDserver project access points (URL).
     */
    getAllProjects(aggregator: string): Promise<any>;
    constructTree(root: string, queryEngine?: QueryEngine, recursiveArray?: any[], alreadyFetched?: any[], notExists?: any[]): Promise<any[]>;
    private getLDPContent;
    /**
     * @description Find the LBDserver project registry of a specific stakeholder by their WebID.
     * @param stakeholder The WebID of the stakeholder from whom the project registry should be retrieved
     * @returns URL of project registry
     */
    getProjectRegistry(stakeholder?: string, queryEngine?: QueryEngine): Promise<string | undefined>;
    /**
     * @description This function retrieves the LDP inbox from a particular WebID
     * @param stakeholder The WebID of the stakeholder from whom the LDP inbox should be retrieved
     * @returns The inbox URL
     */
    getInbox(stakeholder: string, queryEngine?: QueryEngine): Promise<string | undefined>;
    /**
     * @description Create an LBDserver project registry
     * @param url Where the project registry should be created
     * @param publiclyAccessible Access rights for the project registry
     * @returns the URL of the LBDserver Project Registry
     */
    createProjectRegistry(url?: string, publiclyAccessible?: boolean): Promise<string>;
    /**
     * @description delete a project registry at a particular location
     * @param stakeholder The stakeholder (the authenticated agent)
     * @param url The URL of the project registry
     */
    removeProjectRegistry(url: string): Promise<void>;
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
    constructor(session: any, registry: string);
    /**
     * create this concept on a project (in a Pod) - asynchronous
     */
    create(id?: any): Promise<void>;
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
    addAlias(url: any, registry: any): Promise<void>;
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

declare class LbdDistribution {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LbdService;
    url: string;
    data: any;
    dataset: LbdDataset;
    contentType: string;
    session: any;
    /**
     *
     * @param session an (authenticated) Solid session
     * @param dataset the LbdDataset to which this distribution belongs
     * @param id (optional) identifier of the distribution (default: GUID)
     */
    constructor(session: any, dataset: any, id?: string);
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
    getContentType(queryEngine?: QueryEngine): Promise<string>;
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

declare class LbdDataset {
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

declare class LbdProject {
    fetch: any;
    accessService: AccessService;
    dataService: DataService;
    lbdService: LbdService;
    projectId: string;
    accessPoint: string;
    data: object[];
    session: any;
    localProject: string;
    /**
     *
     * @param session an (authenticated) Solid session
     * @param accessPoint The main accesspoint of the project. This is an aggregator containing the different partial projects of the LBDserver instance
     */
    constructor(session: any, accessPoint: string);
    /**
     * @description Checks whether a project with this access point already exists
     * @returns Boolean: true = the project exists / false = the project doesn't exist
     */
    checkExistence(): Promise<boolean>;
    /**
     * @description Initialize the project in your application. In short, this adds project metadata to your LbdProject instance
     */
    init(): Promise<any>;
    /**
     * @description Create an LBDserver project on your Pod
     * @param existingPartialProjects optional: if the project is already initialized on other stakeholder pods. Adds the existing partial projects to the Pod-specific access point
     * @param options Metadata for the project. To be in format {[predicate]: value}
     * @param makePublic access rights: true = public; false = only the creator
     */
    create(existingPartialProjects?: string[], options?: object, makePublic?: boolean): Promise<void>;
    getRdfEndpoints(queryEngine?: QueryEngine): Promise<string[]>;
    getDatasetsByContentType(contentTypes: string[], queryEngine?: QueryEngine): Promise<object[]>;
    /**
     *
     * @param satelliteURL The url (endpoint) of the satellite
     * @param conformsTo The standard to which the query part of the satellite conforms
     * @returns
     */
    addSatellite(satelliteURL: string, conformsTo: string): Promise<string>;
    getSatellites(conformsTo: string, options?: {
        queryEngine?: QueryEngine;
        partialProjects?: string[];
    }): Promise<{}>;
    /**
     * @description Add a partial project to a Pod-specific access point
     * @param part Partial project to add to a Pod-specific access point
     */
    addPartialProject(part: string): Promise<void>;
    /**
     * @description Add a stakeholder to an LBDserver project
     * @param webId The WebID/card of the stakeholder
     * @param accessRights the access rights this stakeholder should have.
     */
    addStakeholder(webId: string, accessRights?: AccessRights): Promise<void>;
    /**
     * @description delete an LBDserver project (locally)
     */
    delete(): Promise<void>;
    /**
     * @description find all the partial projects from the indicated project access point
     */
    getAllPartialProjects(queryEngine?: QueryEngine): Promise<any>;
    /**
     * @description Find the partial project provided by this stakeholder
     * @param webId The webID of the stakeholder whom's partial project you want to find
     * @returns The URL of the partial project
     */
    getPartialProject(webId: string, queryEngine?: QueryEngine): Promise<string>;
    /**
     * @description Add this stakeholder's partial project corresponding with this project (same GUID)
     * @param webId The webID of the stakeholder whom's partial project you want to add
     * @returns the URL of the partial project
     */
    addPartialProjectByStakeholder(webId: string): Promise<string>;
    private createRegistryContainer;
    /**
     * @description Add a dataset to the project
     * @param makePublic initial access rights for the dataset
     * @param id optional id for the dataset - a GUID is created by default
     * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
     * @returns
     */
    addDataset(options?: object, makePublic?: boolean, id?: string): Promise<LbdDataset>;
    /**
     * @description Delete a dataset by URL
     * @param datasetUrl The URL of the dataset
     */
    deleteDataset(datasetUrl: string): Promise<void>;
    /**
     * @description delete a dataset by its ID
     * @param datasetId The GUID of the dataset to be deleted
     */
    deleteDatasetById(datasetId: string): Promise<void>;
    /**
     * @description Get all datasets within this project
     * @param options {query: query to override, asStream: consume the results as a stream, local: query only the local project}
     * @returns
     */
    getAllDatasetUrls(options?: {
        query?: string;
        asStream?: boolean;
        local?: boolean;
        queryEngine?: QueryEngine;
        invalidateCache?: boolean;
    }): Promise<any>;
    /**
     * @description Add a concept to the local project registry
     * @returns an LBDconcept Instance
     */
    addConcept(id?: any): Promise<LbdConcept>;
    getReferenceRegistry(): any;
    getDatasetRegistry(): any;
    getAllReferenceRegistries(queryEngine?: QueryEngine): Promise<string[]>;
    /**
     * @description delete a concept by ID
     * @param url the URL of the concept to be deleted
     */
    deleteConcept(url: string): Promise<void>;
    /**
     * @description Find the main concept by one of its representations: an identifier and a dataset
     * @param identifier the Identifier of the representation
     * @param dataset the dataset where the representation resides
     * @param distribution (optional) the distribution of the representation
     * @returns
     */
    getConceptByIdentifier(identifier: string, dataset: string, distribution?: string, options?: {
        queryEngine?: QueryEngine;
        invalidateCache?: boolean;
    }): Promise<LbdConcept>;
    getConcept(url: string, options?: {
        queryEngine?: QueryEngine;
        invalidateCache?: boolean;
        sources?: string[];
    }): Promise<LbdConcept>;
    getConceptsByIdentifier(identifiers: {
        identifier: string;
        dataset?: string;
        distribution?: string;
    }[], options?: {
        queryEngine?: QueryEngine;
    }): Promise<any[]>;
    /**
     * @description a direct query on project resources
     * @param q The SPARQL query (string)
     * @param sources The sources (array)
     * @param asStream Whether to be consumed as a stream or not (default: false)
     * @returns
     */
    directQuery(q: string, sources: any, options?: {
        asStream?: boolean;
        queryEngine?: QueryEngine;
    }): Promise<any>;
    queryAll(q: string, options?: {
        asStream?: boolean;
        queryEngine?: QueryEngine;
    }): Promise<any>;
}

declare function _NS(localName: string): string;
declare const LBDS: {
    PREFIX: string;
    NAMESPACE: string;
    PREFIX_AND_NAMESPACE: {
        lbds: string;
    };
    NS: typeof _NS;
    Aggregator: string;
    Project: string;
    PartialProject: string;
    Concept: string;
    StringBasedIdentifier: string;
    URIBasedIdentifier: string;
    hasReference: string;
    inDataset: string;
    inDistribution: string;
    hasIdentifier: string;
    value: string;
    aggregates: string;
    hasProjectRegistry: string;
    hasDatasetRegistry: string;
    hasReferenceRegistry: string;
    hasServiceRegistry: string;
    hasSatellite: string;
    ProjectInvite: string;
};
//# sourceMappingURL=lbds.d.ts.map

export { LBDS, LbdConcept, LbdDataset, LbdDistribution, LbdProject, LbdService };
