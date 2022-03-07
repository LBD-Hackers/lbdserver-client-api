import MyLbdService from "./LbdService"
import MyLbdProject from "./LbdProject"
import MyLbdDataset from "./LbdDataset";
import MyLbdDistribution from "./LbdDistribution";
import LBD from "./helpers/vocab/lbd";
// export class Consolid{

//     public fetch;
//     public verbose: boolean = false;
//     public icddService: ICDDService;

//     constructor(fetch: any, verbose: boolean = false){
//         this.fetch = fetch;
//         this.verbose = verbose;
//         this.icddService = new ICDDService(fetch, verbose);
//     }

//     initICDD(rootURL: string, icddName: string, makePublic: boolean = true){
//         return this.icddService.initICDD(rootURL, icddName, makePublic)
//     }

// }

export namespace LBDserver {
    export const LbdService = MyLbdService;
    export const LbdProject = MyLbdProject;
    export const LbdDataset = MyLbdDataset;
    export const LbdDistribution = MyLbdDistribution;
    export const vocabulary = {LBD}
}