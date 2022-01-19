"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Consolid = void 0;

var _LbdService = _interopRequireDefault(require("./helpers/LbdService"));

var _LbdProject = _interopRequireDefault(require("./helpers/LbdProject"));

var _LbdDataset = _interopRequireDefault(require("./helpers/LbdDataset"));

var _LbdDistribution = _interopRequireDefault(require("./helpers/LbdDistribution"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
var Consolid;
exports.Consolid = Consolid;

(function (_Consolid) {
  var LBDService = _Consolid.LBDService = _LbdService["default"];
  var LbdProject = _Consolid.LbdProject = _LbdProject["default"];
  var LbdDataset = _Consolid.LbdDataset = _LbdDataset["default"];
  var LbdDistribution = _Consolid.LbdDistribution = _LbdDistribution["default"];
})(Consolid || (exports.Consolid = Consolid = {}));
//# sourceMappingURL=index.js.map