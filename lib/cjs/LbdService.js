"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LbdService = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _functions = require("./helpers/functions");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _lbds = _interopRequireDefault(require("./helpers/vocab/lbds"));

var _BaseDefinitions = require("./helpers/BaseDefinitions");

var _sparqlalgebrajs = require("sparqlalgebrajs");

var _n = require("n3");

var _querySparql = require("@comunica/query-sparql");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var namedNode = _n.DataFactory.namedNode,
    literal = _n.DataFactory.literal,
    defaultGraph = _n.DataFactory.defaultGraph,
    quad = _n.DataFactory.quad,
    variable = _n.DataFactory.variable;

var LbdService = /*#__PURE__*/function () {
  /**
   * 
   * @param session an (authenticated) session
   * @param verbose optional parameter for logging purposes
   */
  function LbdService(session) {
    var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, LbdService);

    _defineProperty(this, "verbose", false);

    this.session = session;
    this.fetch = session.fetch;
    this.verbose = verbose;
    this.accessService = new _accessService["default"](session.fetch);
    this.dataService = new _dataService["default"](session.fetch);
    this.store = new _n.Store();
  } /////////////////////////////////////////////////////////
  ////////////////////// QUERY ////////////////////////////
  /////////////////////////////////////////////////////////


  _createClass(LbdService, [{
    key: "query",
    value: function () {
      var _query = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(q, _ref) {
        var sources, registries, asStream, _this$mutateQuery, query, myEngine, context, result, _yield$myEngine$resul, data;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                sources = _ref.sources, registries = _ref.registries, asStream = _ref.asStream;
                _this$mutateQuery = this.mutateQuery(q), query = _this$mutateQuery.query;
                myEngine = new _querySparql.QueryEngine();
                _context.next = 5;
                return this.inference(myEngine, registries);

              case 5:
                context = {
                  sources: [].concat(_toConsumableArray(sources), [this.store]),
                  fetch: fetch
                };
                _context.next = 8;
                return myEngine.query(query, context);

              case 8:
                result = _context.sent;
                _context.next = 11;
                return myEngine.resultToString(result, 'application/sparql-results+json');

              case 11:
                _yield$myEngine$resul = _context.sent;
                data = _yield$myEngine$resul.data;

                if (!asStream) {
                  _context.next = 17;
                  break;
                }

                return _context.abrupt("return", data);

              case 17:
                _context.t0 = JSON;
                _context.next = 20;
                return (0, _functions.streamToString)(data);

              case 20:
                _context.t1 = _context.sent;
                return _context.abrupt("return", _context.t0.parse.call(_context.t0, _context.t1));

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function query(_x, _x2) {
        return _query.apply(this, arguments);
      }

      return query;
    }()
  }, {
    key: "findLowerLevel",
    value: function findLowerLevel(obj, variables) {
      if (!variables) variables = obj.variables;

      if (obj.type === "bgp") {
        return {
          bgp: obj,
          variables: variables
        };
      } else {
        return this.findLowerLevel(obj.input, variables);
      }
    }
  }, {
    key: "inference",
    value: function inference(myEngine, registries) {
      var _this = this;

      return new Promise( /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
          var q, quadStream;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  q = "\n      CONSTRUCT {\n       ?s1 <".concat(_vocabCommonRdf.OWL.sameAs, "> ?s2 .\n       ?s2 <").concat(_vocabCommonRdf.OWL.sameAs, "> ?s1 .\n      } WHERE {\n          ?concept1 <").concat(_lbds["default"].hasReference, ">/<").concat(_lbds["default"].hasIdentifier, ">/<http://schema.org/value> ?s1 .\n          ?concept2 <").concat(_lbds["default"].hasReference, ">/<").concat(_lbds["default"].hasIdentifier, ">/<http://schema.org/value> ?s2 .\n          ?concept1 <").concat(_vocabCommonRdf.OWL.sameAs, "> ?concept2 .\n      }");
                  _context2.next = 3;
                  return myEngine.queryQuads(q, {
                    sources: registries,
                    fetch: fetch
                  });

                case 3:
                  quadStream = _context2.sent;
                  quadStream.on('data', function (res) {
                    _this.store.addQuad(quad(namedNode(res.subject.id.replaceAll('"', '')), namedNode(res.predicate.value), namedNode(res.object.id.replaceAll('"', '')), defaultGraph()));
                  });
                  quadStream.on('end', function () {
                    resolve();
                  });

                case 6:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        return function (_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "mutateQuery",
    value: function mutateQuery(query) {
      var translation = (0, _sparqlalgebrajs.translate)(query);

      var _this$findLowerLevel = this.findLowerLevel(translation, translation.variables),
          bgp = _this$findLowerLevel.bgp,
          variables = _this$findLowerLevel.variables;

      var usedVariables = new Set();
      var aliasNumber = 1;
      var aliases = {};

      var _iterator = _createForOfIteratorHelper(bgp.patterns),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var pattern = _step.value;

          for (var _i = 0, _Object$keys = Object.keys(pattern); _i < _Object$keys.length; _i++) {
            var item = _Object$keys[_i];

            if (pattern[item].termType === "Variable") {
              if (usedVariables.has(pattern[item])) {
                var newVName = "".concat(pattern[item].value, "_alias").concat(aliasNumber);
                if (!aliases[pattern[item].value]) aliases[pattern[item].value] = [];
                aliases[pattern[item].value].push(newVName);
                aliasNumber += 1;
                var newV = {
                  termType: "Variable",
                  value: newVName
                };
                pattern[item] = newV;
              }

              usedVariables.add(pattern[item]);
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      Object.keys(aliases).forEach(function (item) {
        aliases[item].forEach(function (alias) {
          var newPattern = quad(variable(item), namedNode("http://www.w3.org/2002/07/owl#sameAs"), variable(alias), defaultGraph());
          bgp.patterns.push(newPattern);
        });
      });
      var q = {
        type: "project",
        input: {
          type: "bgp",
          patterns: bgp.patterns
        },
        variables: Array.from(usedVariables)
      };
      return {
        query: (0, _sparqlalgebrajs.toSparql)(q),
        variables: Array.from(usedVariables)
      };
    } /////////////////////////////////////////////////////////
    ////////////////////// PREPARATION //////////////////////
    /////////////////////////////////////////////////////////

    /**
     * @description This function checks if the card (webId) contains a lbds:hasProjectRegistry pointer
     * @param webId the webId/card to check
     * @returns boolean - false: the WebID doesn't have a project registry yet / true: a project registry is mentioned in the card
     */

  }, {
    key: "validateWebId",
    value: function () {
      var _validateWebId = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(webId) {
        var lbdLoc;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.getProjectRegistry(webId);

              case 2:
                lbdLoc = _context3.sent;

                if (!(lbdLoc && lbdLoc.length > 0)) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return", true);

              case 5:
                return _context3.abrupt("return", false);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function validateWebId(_x5) {
        return _validateWebId.apply(this, arguments);
      }

      return validateWebId;
    }()
    /**
     * @description This function retrieves the LBDserver projects from a project aggregator (e.g. a project registry or public aggregator)
     * @param aggregator an LBDS aggregator, aggregating projects with lbds:aggregates
     * @returns Array of LBDserver project access points (URL).
     */

  }, {
    key: "getAllProjects",
    value: function () {
      var _getAllProjects = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(aggregator) {
        var data, myProjects;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.fetch(aggregator, {
                  headers: {
                    Accept: "application/ld+json"
                  }
                }).then(function (t) {
                  return t.json();
                });

              case 2:
                data = _context4.sent;
                myProjects = (0, _functions.extract)(data, aggregator)[_vocabCommonRdf.LDP.contains].map(function (i) {
                  return i["@id"];
                });
                return _context4.abrupt("return", myProjects);

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getAllProjects(_x6) {
        return _getAllProjects.apply(this, arguments);
      }

      return getAllProjects;
    }()
    /**
     * @description Find the LBDserver project registry of a specific stakeholder by their WebID.
     * @param stakeholder The WebID of the stakeholder from whom the project registry should be retrieved
     * @returns URL of project registry
     */

  }, {
    key: "getProjectRegistry",
    value: function () {
      var _getProjectRegistry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(stakeholder) {
        var myEngine, q, location;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                myEngine = (0, _actorInitSparql.newEngine)();
                q = "select ?loc where {<".concat(stakeholder, "> <").concat(_lbds["default"].hasProjectRegistry, "> ?loc}");
                _context5.next = 4;
                return myEngine.query(q, {
                  sources: [stakeholder],
                  fetch: this.fetch
                }).then(function (res) {
                  return res.bindings();
                }).then(function (bind) {
                  return bind.map(function (i) {
                    return i.get("?loc").value;
                  });
                })["catch"](function (err) {
                  throw err;
                });

              case 4:
                location = _context5.sent;

                if (!(location && location.length > 0)) {
                  _context5.next = 9;
                  break;
                }

                return _context5.abrupt("return", location[0]);

              case 9:
                return _context5.abrupt("return", undefined);

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getProjectRegistry(_x7) {
        return _getProjectRegistry.apply(this, arguments);
      }

      return getProjectRegistry;
    }()
    /**
     * @description This function retrieves the LDP inbox from a particular WebID
     * @param stakeholder The WebID of the stakeholder from whom the LDP inbox should be retrieved
     * @returns The inbox URL
     */

  }, {
    key: "getInbox",
    value: function () {
      var _getInbox = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(stakeholder) {
        var myEngine, q, inbox;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                myEngine = (0, _actorInitSparql.newEngine)();
                q = "select ?inbox where {<".concat(stakeholder, "> <").concat(_vocabCommonRdf.LDP.inbox, "> ?inbox}");
                _context6.next = 4;
                return myEngine.query(q, {
                  sources: [stakeholder],
                  fetch: this.fetch
                }).then(function (res) {
                  return res.bindings();
                }).then(function (bind) {
                  return bind.map(function (i) {
                    return i.get("?inbox").value;
                  });
                })["catch"](function (err) {
                  throw err;
                });

              case 4:
                inbox = _context6.sent;

                if (!(inbox && inbox.length > 0)) {
                  _context6.next = 9;
                  break;
                }

                return _context6.abrupt("return", inbox[0]);

              case 9:
                return _context6.abrupt("return", undefined);

              case 10:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getInbox(_x8) {
        return _getInbox.apply(this, arguments);
      }

      return getInbox;
    }() //   public async inviteStakeholder(stakeholder: string, projectId: string) {
    //     const inbox = await this.getInbox(stakeholder);
    //     const id = v4();
    //     const url = inbox + id;
    //     const message = `<>
    //   a <${AS.Announce}> ;
    //   <${AS.actor}> <${this.session.info.webId}> ;
    //   <${AS.object}> <#invite> ;
    //   <${AS.target}> <${stakeholder}> ;
    //   <${AS.updated}> "${new Date().toISOString()}"^^${XSD.dateTime} .
    // <#invite> a ${LBD.ProjectInvite}; 
    //   <${FOAF.primaryTopic}> <#project> .
    // <#project> a <${LBD.Project}> ;
    //     <${DCTERMS.identifier} "${projectId}" .
    //   `;
    //   const options = {
    //     method: "POST",
    //     body: message,
    //   }
    //     // await this.session.fetch()
    //   }

    /**
     * @description Create an LBDserver project registry
     * @param url Where the project registry should be created
     * @param publiclyAccessible Access rights for the project registry
     * @returns the URL of the LBDserver Project Registry
     */

  }, {
    key: "createProjectRegistry",
    value: function () {
      var _createProjectRegistry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var url,
            publiclyAccessible,
            stakeholder,
            q0,
            q1,
            accessRights,
            actor,
            _args7 = arguments;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                url = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : undefined;
                publiclyAccessible = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : true;
                _context7.prev = 2;
                stakeholder = this.session.info.webId;
                if (!url) url = stakeholder.replace("/profile/card#me", "/lbd/");
                q0 = "INSERT DATA {\n          <".concat(stakeholder, "> <").concat(_lbds["default"].hasProjectRegistry, "> <").concat(url, "> .\n        }");
                _context7.next = 8;
                return this.dataService.sparqlUpdate(stakeholder, q0);

              case 8:
                // create the LBD registry (container / Aggregator)
                q1 = "INSERT DATA {\n        <".concat(url, "> a <").concat(_lbds["default"].Aggregator, "> .\n      }"); // the updates immediately creates the container

                _context7.next = 11;
                return this.dataService.sparqlUpdate(url, q1);

              case 11:
                if (publiclyAccessible) {
                  accessRights = {
                    read: true,
                    append: false,
                    write: false,
                    control: false
                  };
                } else {
                  accessRights = {
                    read: true,
                    append: true,
                    write: true,
                    control: true
                  };
                  actor = stakeholder;
                }

                _context7.next = 14;
                return this.accessService.setResourceAccess(url, accessRights, _BaseDefinitions.ResourceType.CONTAINER, actor);

              case 14:
                return _context7.abrupt("return", url);

              case 17:
                _context7.prev = 17;
                _context7.t0 = _context7["catch"](2);
                console.log("error", _context7.t0);
                throw _context7.t0;

              case 21:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[2, 17]]);
      }));

      function createProjectRegistry() {
        return _createProjectRegistry.apply(this, arguments);
      }

      return createProjectRegistry;
    }()
    /**
     * @description delete a project registry at a particular location
     * @param stakeholder The stakeholder (the authenticated agent)
     * @param url The URL of the project registry
     */

  }, {
    key: "removeProjectRegistry",
    value: function () {
      var _removeProjectRegistry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(url) {
        var q0;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.prev = 0;
                q0 = "DELETE {<".concat(this.session.info.webId, "> <").concat(_lbds["default"].hasProjectRegistry, "> <").concat(url, "> .}\n      WHERE {<").concat(this.session.info.webId, "> <").concat(_lbds["default"].hasProjectRegistry, "> ?reg .}");
                _context8.next = 4;
                return this.dataService.sparqlUpdate(this.session.info.webId, q0);

              case 4:
                _context8.next = 6;
                return this.dataService.deleteContainer(url, true);

              case 6:
                _context8.next = 12;
                break;

              case 8:
                _context8.prev = 8;
                _context8.t0 = _context8["catch"](0);
                console.log("error", _context8.t0);
                throw _context8.t0;

              case 12:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[0, 8]]);
      }));

      function removeProjectRegistry(_x9) {
        return _removeProjectRegistry.apply(this, arguments);
      }

      return removeProjectRegistry;
    }()
  }]);

  return LbdService;
}();

exports.LbdService = LbdService;
//# sourceMappingURL=LbdService.js.map