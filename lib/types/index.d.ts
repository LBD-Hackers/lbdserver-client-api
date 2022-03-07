import MyLbdService from "./LbdService";
import MyLbdProject from "./LbdProject";
import MyLbdDataset from "./LbdDataset";
import MyLbdDistribution from "./LbdDistribution";
export declare namespace LBDserver {
    const LbdService: typeof MyLbdService;
    const LbdProject: typeof MyLbdProject;
    const LbdDataset: typeof MyLbdDataset;
    const LbdDistribution: typeof MyLbdDistribution;
    const vocabulary: {
        LBD: {
            PREFIX: string;
            NAMESPACE: string;
            PREFIX_AND_NAMESPACE: {
                lbds: string;
            };
            NS: (localName: string) => string;
            Aggregator: string;
            Project: string;
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
            ProjectInvite: string;
        };
    };
}
//# sourceMappingURL=index.d.ts.map