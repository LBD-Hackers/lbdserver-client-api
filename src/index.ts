import {LbdService} from "./LbdService"
import {LbdProject} from "./LbdProject"
import {LbdDataset} from "./LbdDataset";
import {LbdDistribution} from "./LbdDistribution";
import {LbdConcept} from './LbdConcept'
import LBDS from "./helpers/vocab/lbds";

export namespace LBDserver {
    LbdService;
    LbdProject;
    LbdDataset;
    LbdConcept;
    LbdDistribution;
    LBDS
}