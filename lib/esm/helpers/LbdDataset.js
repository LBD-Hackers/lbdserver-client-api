"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _jsonldRemote = require("jsonld-remote");

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _LbdDistribution = _interopRequireDefault(require("./LbdDistribution"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class LbdDataset {
  // include queryEngine to allow caching of querydata etc.
  constructor(fetch, url) {
    this.fetch = fetch;
    this.url = url;
    this.accessService = new _accessService.default(fetch);
    this.dataService = new _dataService.default(fetch);
    this.lbdService = new _LbdService.default(fetch);
    this.queryEngine = (0, _actorInitSparql.newEngine)();
  }

  checkExistence() {
    var _this = this;

    return _asyncToGenerator(function* () {
      var status = yield _this.fetch(_this.url, {
        method: "HEAD"
      }).then(result => result.status);

      if (status === 200) {
        return true;
      } else {
        return false;
      }
    })();
  }

  init() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var data = yield _this2.fetch(_this2.url, {
        headers: {
          "Accept": "application/ld+json"
        }
      }).then(i => i.json());
      _this2.data = data;
      return data;
    })();
  }
  /**
   * 
   * @param makePublic 
   * @param id
   * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
   * @returns 
   */


  create() {
    var _arguments = arguments,
        _this3 = this;

    return _asyncToGenerator(function* () {
      var options = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
      var makePublic = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : false;
      var datasetUrl = _this3.url;
      yield _this3.dataService.createContainer(datasetUrl, makePublic);

      if (Object.keys(options).length > 0) {
        var q0 = "INSERT DATA { ";

        for (var key of Object.keys(options)) {
          q0 += "<".concat(datasetUrl, "> <").concat(key, "> \"").concat(options[key], "\" .");
        }

        q0 += "}";
        yield _this3.dataService.sparqlUpdate(datasetUrl, q0);
      }

      yield _this3.init();
    })();
  }

  delete() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _this4.dataService.deleteContainer(_this4.url, true);
      return;
    })();
  }

  update(query) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      yield _this5.dataService.sparqlUpdate(_this5.url, query);
    })();
  } /////////////////////////////////////////////////////////
  //////////////////// DISTRIBUTIONS///////////////////////
  /////////////////////////////////////////////////////////


  addDistribution(distribution, mimetype) {
    var _arguments2 = arguments,
        _this6 = this;

    return _asyncToGenerator(function* () {
      var options = _arguments2.length > 2 && _arguments2[2] !== undefined ? _arguments2[2] : {};
      var distributionId = _arguments2.length > 3 && _arguments2[3] !== undefined ? _arguments2[3] : (0, _uuid.v4)();
      var makePublic = _arguments2.length > 4 && _arguments2[4] !== undefined ? _arguments2[4] : false;
      var distributionUrl = _this6.url + distributionId;
      var dist = new _LbdDistribution.default(_this6.fetch, distributionUrl);
      yield dist.create(distribution, {}, mimetype, makePublic);
      yield dist.init();
      return dist;
    })();
  }

  getDistributionUrls() {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      var current = yield _this7.fetch(_this7.url, {
        headers: {
          "Accept": "application/ld+json"
        }
      }).then(res => res.json());
      var dataset = (0, _jsonldRemote.extract)(current, _this7.url);

      var distributions = dataset[_vocabCommonRdf.DCAT.distribution].map(i => i["@id"]);

      return distributions;
    })();
  }

  deleteDistribution(distributionId) {
    return _asyncToGenerator(function* () {})();
  }

}

exports.default = LbdDataset;
//# sourceMappingURL=LbdDataset.js.map