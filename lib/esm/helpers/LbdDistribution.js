"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _mimeTypes = _interopRequireDefault(require("mime-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class LbdDistribution {
  // include queryEngine to allow caching of querydata etc.
  constructor(fetch, url) {
    var datasetUrl = url.split('/');
    datasetUrl.pop();
    var ds = datasetUrl.join("/") + '/';
    this.fetch = fetch;
    this.url = url;
    this.datasetUrl = ds;
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
    var _arguments = arguments,
        _this2 = this;

    return _asyncToGenerator(function* () {
      var options = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
      _this2.data = yield _this2.fetch(_this2.url, options);
    })();
  }

  updateMetadata(query) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      yield _this3.dataService.sparqlUpdate(_this3.datasetUrl, query);
    })();
  }

  addAccessUrl(accessUrl) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      var q0 = "INSERT DATA {<".concat(_this4.url, "> <").concat(_vocabCommonRdf.DCAT.accessURL, "> <").concat(accessUrl, ">}");
      yield _this4.updateMetadata(q0);
    })();
  }

  create(file) {
    var _arguments2 = arguments,
        _this5 = this;

    return _asyncToGenerator(function* () {
      var options = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : {};
      var mimetype = _arguments2.length > 2 ? _arguments2[2] : undefined;
      var makePublic = _arguments2.length > 3 && _arguments2[3] !== undefined ? _arguments2[3] : false;

      if (!mimetype) {
        try {
          mimetype = _mimeTypes.default.lookup(file["name"]);
          if (!mimetype) mimetype = "text/plain";
        } catch (error) {
          mimetype = "text/plain";
        }
      }

      yield _this5.dataService.writeFileToPod(file, _this5.url, makePublic, mimetype);
      var q = "INSERT DATA {\n        <".concat(_this5.datasetUrl, "> <").concat(_vocabCommonRdf.DCAT.distribution, "> <").concat(_this5.url, "> .\n        <").concat(_this5.url, "> a <").concat(_vocabCommonRdf.DCAT.Distribution, "> ;\n            <").concat(_vocabCommonRdf.DCTERMS.format, "> <https://www.iana.org/assignments/media-types/").concat(mimetype, "> ;\n            <").concat(_vocabCommonRdf.DCAT.downloadURL, "> <").concat(_this5.url, "> .\n      }");
      yield _this5.queryEngine.query(q, {
        sources: [_this5.datasetUrl],
        fetch: _this5.fetch
      });

      if (Object.keys(options).length > 0) {
        var q0 = "INSERT DATA { ";

        for (var key of Object.keys(options)) {
          q0 += "<".concat(_this5.datasetUrl, "> <").concat(key, "> \"").concat(options[key], "\" .");
        }

        q0 += "}";
        yield _this5.dataService.sparqlUpdate(_this5.datasetUrl, q0);
      }
    })();
  }

  delete() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      yield _this6.dataService.deleteFile(_this6.url); // also update dataset

      var q0 = "DELETE {\n      <".concat(_this6.url, "> ?p ?o .\n    } WHERE {\n      <").concat(_this6.url, "> ?p ?o .\n    }");
      yield _this6.queryEngine.query(q0, {
        sources: [_this6.datasetUrl],
        fetch: _this6.fetch
      });
      var q1 = "DELETE {\n      ?s ?p <".concat(_this6.url, "> .\n    } WHERE {\n      ?s ?p <").concat(_this6.url, "> .\n    }");
      yield _this6.queryEngine.query(q1, {
        sources: [_this6.datasetUrl],
        fetch: _this6.fetch
      });
      return;
    })();
  }

}

exports.default = LbdDistribution;
//# sourceMappingURL=LbdDistribution.js.map