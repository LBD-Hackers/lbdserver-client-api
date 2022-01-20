"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class LbdConcept {
  // include queryEngine to allow caching of querydata etc.
  constructor(fetch, registry) {
    var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, _uuid.v4)();
    this.registry = registry;
    this.id = id;
    this.url = this.registry + this.id;
    this.fetch = fetch;
    this.accessService = new _accessService.default(fetch);
    this.dataService = new _dataService.default(fetch);
    this.queryEngine = (0, _actorInitSparql.newEngine)();
  }

  create() {
    var _this = this;

    return _asyncToGenerator(function* () {
      var q0 = "INSERT DATA {<".concat(_this.url, "> a <").concat(_lbd.default.Concept, "> }");
      yield _this.dataService.sparqlUpdate(_this.registry, q0);
    })();
  }

  delete() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var q0 = "DELETE {\n      <".concat(_this2.url, "> ?p ?o .\n    } WHERE {\n      <").concat(_this2.url, "> ?p ?o .\n    }");
      yield _this2.dataService.sparqlUpdate(_this2.registry, q0);
    })();
  }

  addReference(identifier, dataset, distribution) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      var referenceId = (0, _uuid.v4)();
      var referenceUrl = _this3.registry + referenceId;
      var identifierId = (0, _uuid.v4)();
      var identifierUrl = _this3.registry + identifierId;

      var {
        formatted,
        identifierType
      } = _this3.getIdentifierType(identifier);

      var q0 = "INSERT DATA {\n      <".concat(_this3.url, "> <").concat(_lbd.default.hasReference, "> <").concat(referenceUrl, "> .\n      <").concat(referenceUrl, "> <").concat(_lbd.default.inDataset, "> <").concat(dataset, "> ;\n        <").concat(_lbd.default.hasIdentifier, "> <").concat(identifierUrl, "> .\n      <").concat(identifierUrl, "> a <").concat(identifierType, "> ;\n        <").concat(_lbd.default.identifier, "> ").concat(formatted, " .\n   }");

      if (distribution) {
        var q1 = "INSERT DATA {\n        <".concat(identifierUrl, "> <").concat(_lbd.default.inDistribution, "> <").concat(distribution, "> ;\n      }");
      }

      yield _this3.dataService.sparqlUpdate(_this3.registry, q0);
      yield _this3.dataService.sparqlUpdate(_this3.registry, q0);
      return referenceUrl;
    })();
  }

  deleteReference(referenceUrl) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      var q0 = "DELETE {\n      ?a ?b <".concat(referenceUrl, "> .\n      <").concat(referenceUrl, "> ?p ?o ; ?q ?x.\n      ?x ?y ?z.\n    } WHERE {\n      ?a ?b <").concat(referenceUrl, "> .\n      <").concat(referenceUrl, "> ?p ?o ; ?q ?x.\n      ?x ?y ?z.\n    }");
      console.log('q0', q0);
      yield _this4.dataService.sparqlUpdate(_this4.registry, q0);
      var q1 = "DELETE {<".concat(_this4.url, "> <").concat(_lbd.default.hasReference, "> <").concat(referenceUrl, "> .}");
      yield _this4.dataService.sparqlUpdate(_this4.registry, q1);
    })();
  }

  addAlias() {
    return _asyncToGenerator(function* () {})();
  }

  getIdentifierType(identifier) {
    function isInt(n) {
      return n % 1 === 0;
    }

    if (typeof identifier === "string" && identifier.startsWith("http")) {
      return {
        formatted: "<".concat(identifier, ">"),
        identifierType: _lbd.default.URIBasedIdentifier
      };
    } else {
      if (typeof identifier === "number") {
        if (isInt(identifier)) {
          return {
            formatted: "\"".concat(identifier, "\"^^<").concat(_vocabCommonRdf.XSD.integer, ">"),
            identifierType: _lbd.default.StringBasedIdentifier
          };
        } else {
          return {
            formatted: "\"".concat(identifier, "\"^^<").concat(_vocabCommonRdf.XSD.float, ">"),
            identifierType: _lbd.default.StringBasedIdentifier
          };
        }
      } else {
        return {
          formatted: "\"".concat(identifier, "\"^^<").concat(_vocabCommonRdf.XSD.string, ">"),
          identifierType: _lbd.default.StringBasedIdentifier
        };
      }
    }
  }

}

exports.default = LbdConcept;
//# sourceMappingURL=LbdConcept.js.map