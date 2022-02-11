"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var LbdConcept = /*#__PURE__*/function () {
  function LbdConcept(session, registry) {
    _classCallCheck(this, LbdConcept);

    this.aliases = [];
    this.session = session;
    this.fetch = session.fetch;
    this.accessService = new _accessService["default"](session.fetch);
    this.dataService = new _dataService["default"](session.fetch);
    this.registry = registry;
    this.references = [];
  }

  _createClass(LbdConcept, [{
    key: "create",
    value: function () {
      var _create = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var id, distribution, url, q0;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                id = (0, _uuid.v4)();
                distribution = this.registry + 'data';
                url = distribution + "#" + id;
                q0 = "INSERT DATA {<".concat(url, "> a <").concat(_lbd["default"].Concept, "> }");
                _context.next = 6;
                return this.dataService.sparqlUpdate(distribution, q0);

              case 6:
                this.aliases.push(url);
                this.initialized = true;

              case 8:
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
    key: "initialize",
    value: function () {
      var _initialize = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(data) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.aliases = data.aliases;
                this.references = data.references;
                this.initialized = true;

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function initialize(_x) {
        return _initialize.apply(this, arguments);
      }

      return initialize;
    }()
  }, {
    key: "delete",
    value: function () {
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var distribution, _iterator, _step, alias, q0;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.initialized) {
                  _context3.next = 2;
                  break;
                }

                throw new Error("Please initialize the Concept first using this.initialize() or this.create()");

              case 2:
                distribution = this.registry + 'data';
                _iterator = _createForOfIteratorHelper(this.aliases);
                _context3.prev = 4;

                _iterator.s();

              case 6:
                if ((_step = _iterator.n()).done) {
                  _context3.next = 14;
                  break;
                }

                alias = _step.value;

                if (!alias.includes(this.registry)) {
                  _context3.next = 12;
                  break;
                }

                q0 = "DELETE {\n          <".concat(alias, "> ?p ?o .\n        } WHERE {\n          <").concat(alias, "> ?p ?o .\n        }");
                _context3.next = 12;
                return this.dataService.sparqlUpdate(distribution, q0);

              case 12:
                _context3.next = 6;
                break;

              case 14:
                _context3.next = 19;
                break;

              case 16:
                _context3.prev = 16;
                _context3.t0 = _context3["catch"](4);

                _iterator.e(_context3.t0);

              case 19:
                _context3.prev = 19;

                _iterator.f();

                return _context3.finish(19);

              case 22:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[4, 16, 19, 22]]);
      }));

      function _delete() {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }()
  }, {
    key: "addReference",
    value: function () {
      var _addReference = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(identifier, dataset, distribution) {
        var registry, referenceId, regdist, referenceUrl, identifierId, identifierUrl, idLiteral, _iterator2, _step2, alias, q0;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;

                if (this.initialized) {
                  _context4.next = 3;
                  break;
                }

                throw new Error("Please initialize the Concept first using this.initialize() or this.create()");

              case 3:
                registry = this.registry;
                referenceId = (0, _uuid.v4)();
                regdist = registry + "data";
                referenceUrl = regdist + "#" + referenceId;
                identifierId = (0, _uuid.v4)();
                identifierUrl = regdist + "#" + identifierId;
                idLiteral = this.getIdentifierType(identifier);
                _iterator2 = _createForOfIteratorHelper(this.aliases);
                _context4.prev = 11;

                _iterator2.s();

              case 13:
                if ((_step2 = _iterator2.n()).done) {
                  _context4.next = 21;
                  break;
                }

                alias = _step2.value;

                if (!alias.includes(registry)) {
                  _context4.next = 19;
                  break;
                }

                q0 = "INSERT DATA {\n            <".concat(alias, "> <").concat(_lbd["default"].hasReference, "> <").concat(referenceUrl, "> .\n            <").concat(referenceUrl, "> <").concat(_lbd["default"].inDataset, "> <").concat(dataset, "> ;\n              <").concat(_lbd["default"].hasIdentifier, "> <").concat(identifierUrl, "> .\n            <").concat(identifierUrl, "> <http://schema.org/value> ").concat(idLiteral, " ;\n            <").concat(_lbd["default"].inDistribution, "> <").concat(distribution, "> .\n         }");
                _context4.next = 19;
                return this.dataService.sparqlUpdate(regdist, q0);

              case 19:
                _context4.next = 13;
                break;

              case 21:
                _context4.next = 26;
                break;

              case 23:
                _context4.prev = 23;
                _context4.t0 = _context4["catch"](11);

                _iterator2.e(_context4.t0);

              case 26:
                _context4.prev = 26;

                _iterator2.f();

                return _context4.finish(26);

              case 29:
                this.references.push({
                  dataset: dataset,
                  distribution: distribution,
                  identifier: idLiteral
                });
                return _context4.abrupt("return", referenceUrl);

              case 33:
                _context4.prev = 33;
                _context4.t1 = _context4["catch"](0);
                console.log('error', _context4.t1);

              case 36:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[0, 33], [11, 23, 26, 29]]);
      }));

      function addReference(_x2, _x3, _x4) {
        return _addReference.apply(this, arguments);
      }

      return addReference;
    }()
  }, {
    key: "deleteReference",
    value: function () {
      var _deleteReference = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(referenceUrl) {
        var regdist, q0;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                regdist = this.registry + "data";
                q0 = "DELETE {\n      ?a ?b <".concat(referenceUrl, "> .\n      <").concat(referenceUrl, "> ?p ?o ; ?q ?x.\n      ?x ?y ?z.\n    } WHERE {\n      ?a ?b <").concat(referenceUrl, "> .\n      <").concat(referenceUrl, "> ?p ?o ; ?q ?x.\n      ?x ?y ?z.\n    }");
                console.log('q0', q0);
                _context5.next = 5;
                return this.dataService.sparqlUpdate(regdist, q0);

              case 5:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function deleteReference(_x5) {
        return _deleteReference.apply(this, arguments);
      }

      return deleteReference;
    }()
  }, {
    key: "getIdentifierType",
    value: function getIdentifierType(identifier) {
      function isInt(n) {
        return n % 1 === 0;
      }

      if (typeof identifier === "string" && identifier.startsWith("http")) {
        return "\"".concat(identifier, "\"^^<").concat(_vocabCommonRdf.XSD.anyURI, ">");
      } else {
        if (typeof identifier === "number") {
          if (isInt(identifier)) {
            return "\"".concat(identifier, "\"^^<").concat(_vocabCommonRdf.XSD.integer, ">");
          } else {
            return {
              formatted: "\"".concat(identifier, "\"^^<").concat(_vocabCommonRdf.XSD["float"], ">")
            };
          }
        } else {
          return "\"".concat(identifier, "\"^^<").concat(_vocabCommonRdf.XSD.string, ">");
        }
      }
    }
  }]);

  return LbdConcept;
}();

exports["default"] = LbdConcept;
//# sourceMappingURL=LbdConcept.js.map