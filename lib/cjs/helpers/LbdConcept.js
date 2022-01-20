"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var LbdConcept = /*#__PURE__*/function () {
  // include queryEngine to allow caching of querydata etc.
  function LbdConcept(fetch, registry) {
    var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, _uuid.v4)();

    _classCallCheck(this, LbdConcept);

    this.registry = registry;
    this.id = id;
    this.url = this.registry + this.id;
    this.fetch = fetch;
    this.accessService = new _accessService["default"](fetch);
    this.dataService = new _dataService["default"](fetch);
    this.queryEngine = (0, _actorInitSparql.newEngine)();
  }

  _createClass(LbdConcept, [{
    key: "create",
    value: function () {
      var _create = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var q0;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                q0 = "INSERT DATA {<".concat(this.url, "> a <").concat(_lbd["default"].Concept, "> }");
                _context.next = 3;
                return this.dataService.sparqlUpdate(this.registry, q0);

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function create() {
        return _create.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: "delete",
    value: function () {
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var q0;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                q0 = "DELETE {\n      <".concat(this.url, "> ?p ?o .\n    } WHERE {\n      <").concat(this.url, "> ?p ?o .\n    }");
                _context2.next = 3;
                return this.dataService.sparqlUpdate(this.registry, q0);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _delete() {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }()
  }, {
    key: "addReference",
    value: function () {
      var _addReference = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(identifier, dataset, distribution) {
        var referenceId, referenceUrl, identifierId, identifierUrl, _this$getIdentifierTy, formatted, identifierType, q0, q1;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                referenceId = (0, _uuid.v4)();
                referenceUrl = this.registry + referenceId;
                identifierId = (0, _uuid.v4)();
                identifierUrl = this.registry + identifierId;
                _this$getIdentifierTy = this.getIdentifierType(identifier), formatted = _this$getIdentifierTy.formatted, identifierType = _this$getIdentifierTy.identifierType;
                q0 = "INSERT DATA {\n      <".concat(this.url, "> <").concat(_lbd["default"].hasReference, "> <").concat(referenceUrl, "> .\n      <").concat(referenceUrl, "> <").concat(_lbd["default"].inDataset, "> <").concat(dataset, "> ;\n        <").concat(_lbd["default"].hasIdentifier, "> <").concat(identifierUrl, "> .\n      <").concat(identifierUrl, "> a <").concat(identifierType, "> ;\n        <").concat(_lbd["default"].identifier, "> ").concat(formatted, " .\n   }");

                if (distribution) {
                  q1 = "INSERT DATA {\n        <".concat(identifierUrl, "> <").concat(_lbd["default"].inDistribution, "> <").concat(distribution, "> ;\n      }");
                }

                _context3.next = 9;
                return this.dataService.sparqlUpdate(this.registry, q0);

              case 9:
                _context3.next = 11;
                return this.dataService.sparqlUpdate(this.registry, q0);

              case 11:
                return _context3.abrupt("return", referenceUrl);

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function addReference(_x, _x2, _x3) {
        return _addReference.apply(this, arguments);
      }

      return addReference;
    }()
  }, {
    key: "deleteReference",
    value: function () {
      var _deleteReference = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(referenceUrl) {
        var q0, q1;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                q0 = "DELETE {\n      ?a ?b <".concat(referenceUrl, "> .\n      <").concat(referenceUrl, "> ?p ?o ; ?q ?x.\n      ?x ?y ?z.\n    } WHERE {\n      ?a ?b <").concat(referenceUrl, "> .\n      <").concat(referenceUrl, "> ?p ?o ; ?q ?x.\n      ?x ?y ?z.\n    }");
                console.log('q0', q0);
                _context4.next = 4;
                return this.dataService.sparqlUpdate(this.registry, q0);

              case 4:
                q1 = "DELETE {<".concat(this.url, "> <").concat(_lbd["default"].hasReference, "> <").concat(referenceUrl, "> .}");
                _context4.next = 7;
                return this.dataService.sparqlUpdate(this.registry, q1);

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function deleteReference(_x4) {
        return _deleteReference.apply(this, arguments);
      }

      return deleteReference;
    }()
  }, {
    key: "addAlias",
    value: function () {
      var _addAlias = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function addAlias() {
        return _addAlias.apply(this, arguments);
      }

      return addAlias;
    }()
  }, {
    key: "getIdentifierType",
    value: function getIdentifierType(identifier) {
      function isInt(n) {
        return n % 1 === 0;
      }

      if (typeof identifier === "string" && identifier.startsWith("http")) {
        return {
          formatted: "<".concat(identifier, ">"),
          identifierType: _lbd["default"].URIBasedIdentifier
        };
      } else {
        if (typeof identifier === "number") {
          if (isInt(identifier)) {
            return {
              formatted: "\"".concat(identifier, "\"^^<").concat(_vocabCommonRdf.XSD.integer, ">"),
              identifierType: _lbd["default"].StringBasedIdentifier
            };
          } else {
            return {
              formatted: "\"".concat(identifier, "\"^^<").concat(_vocabCommonRdf.XSD["float"], ">"),
              identifierType: _lbd["default"].StringBasedIdentifier
            };
          }
        } else {
          return {
            formatted: "\"".concat(identifier, "\"^^<").concat(_vocabCommonRdf.XSD.string, ">"),
            identifierType: _lbd["default"].StringBasedIdentifier
          };
        }
      }
    }
  }]);

  return LbdConcept;
}();

exports["default"] = LbdConcept;
//# sourceMappingURL=LbdConcept.js.map