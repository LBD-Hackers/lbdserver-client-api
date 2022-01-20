import MyLbdService from "./helpers/LbdService"
import MyLbdProject from "./helpers/LbdProject"
import MyLbdDataset from "./helpers/LbdDataset";
import MyLbdDistribution from "./helpers/LbdDistribution";
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
}