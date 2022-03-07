"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LBDserver = void 0;

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _LbdProject = _interopRequireDefault(require("./LbdProject"));

var _LbdDataset = _interopRequireDefault(require("./LbdDataset"));

var _LbdDistribution = _interopRequireDefault(require("./LbdDistribution"));

var _lbd = _interopRequireDefault(require("./helpers/vocab/lbd"));

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
var LBDserver;
exports.LBDserver = LBDserver;

(function (_LBDserver) {
  var LbdService = _LBDserver.LbdService = _LbdService["default"];
  var LbdProject = _LBDserver.LbdProject = _LbdProject["default"];
  var LbdDataset = _LBDserver.LbdDataset = _LbdDataset["default"];
  var LbdDistribution = _LBDserver.LbdDistribution = _LbdDistribution["default"];
  var vocabulary = _LBDserver.vocabulary = {
    LBD: _lbd["default"]
  };
})(LBDserver || (exports.LBDserver = LBDserver = {}));
//# sourceMappingURL=index.js.map