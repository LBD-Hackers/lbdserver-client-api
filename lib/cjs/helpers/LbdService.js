"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _functions = require("./functions");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _BaseDefinitions = require("./BaseDefinitions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var LBDService = /*#__PURE__*/function () {
  function LBDService(session) {
    var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, LBDService);

    _defineProperty(this, "verbose", false);

    this.session = session;
    this.fetch = session.fetch;
    this.verbose = verbose;
    this.accessService = new _accessService["default"](session.fetch);
    this.dataService = new _dataService["default"](session.fetch);
  } /////////////////////////////////////////////////////////
  ////////////////////// PREPARATION //////////////////////
  /////////////////////////////////////////////////////////


  _createClass(LBDService, [{
    key: "validateWebId",
    value: function () {
      var _validateWebId = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(webId) {
        var lbdLoc;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.getProjectRegistry(webId);

              case 2:
                lbdLoc = _context.sent;

                if (!(lbdLoc && lbdLoc.length > 0)) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", true);

              case 5:
                return _context.abrupt("return", false);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function validateWebId(_x) {
        return _validateWebId.apply(this, arguments);
      }

      return validateWebId;
    }()
  }, {
    key: "getAllProjects",
    value: function () {
      var _getAllProjects = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(aggregator) {
        var data, myProjects;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.fetch(aggregator, {
                  headers: {
                    Accept: "application/ld+json"
                  }
                }).then(function (t) {
                  return t.json();
                });

              case 2:
                data = _context2.sent;
                myProjects = (0, _functions.extract)(data, aggregator)[_vocabCommonRdf.LDP.contains].map(function (i) {
                  return i["@id"];
                });
                return _context2.abrupt("return", myProjects);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getAllProjects(_x2) {
        return _getAllProjects.apply(this, arguments);
      }

      return getAllProjects;
    }()
  }, {
    key: "getProjectRegistry",
    value: function () {
      var _getProjectRegistry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(stakeholder) {
        var myEngine, q, location;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                myEngine = (0, _actorInitSparql.newEngine)();
                q = "select ?loc where {<".concat(stakeholder, "> <").concat(_lbd["default"].hasProjectRegistry, "> ?loc}");
                _context3.next = 4;
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
                location = _context3.sent;

                if (!(location && location.length > 0)) {
                  _context3.next = 9;
                  break;
                }

                return _context3.abrupt("return", location[0]);

              case 9:
                return _context3.abrupt("return", undefined);

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getProjectRegistry(_x3) {
        return _getProjectRegistry.apply(this, arguments);
      }

      return getProjectRegistry;
    }()
  }, {
    key: "getInbox",
    value: function () {
      var _getInbox = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(stakeholder) {
        var myEngine, q, inbox;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                myEngine = (0, _actorInitSparql.newEngine)();
                q = "select ?inbox where {<".concat(stakeholder, "> <").concat(_vocabCommonRdf.LDP.inbox, "> ?inbox}");
                _context4.next = 4;
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
                inbox = _context4.sent;

                if (!(inbox && inbox.length > 0)) {
                  _context4.next = 9;
                  break;
                }

                return _context4.abrupt("return", inbox[0]);

              case 9:
                return _context4.abrupt("return", undefined);

              case 10:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getInbox(_x4) {
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

  }, {
    key: "createProjectRegistry",
    value: function () {
      var _createProjectRegistry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var url,
            publiclyAccessible,
            stakeholder,
            q0,
            q1,
            accessRights,
            actor,
            _args5 = arguments;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                url = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : undefined;
                publiclyAccessible = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : true;
                _context5.prev = 2;
                stakeholder = this.session.info.webId;
                if (!url) url = stakeholder.replace("/profile/card#me", "/lbd/");
                q0 = "INSERT DATA {\n          <".concat(stakeholder, "> <").concat(_lbd["default"].hasProjectRegistry, "> <").concat(url, "> .\n        }");
                _context5.next = 8;
                return this.dataService.sparqlUpdate(stakeholder, q0);

              case 8:
                // create the LBD registry (container / Aggregator)
                q1 = "INSERT DATA {\n        <".concat(url, "> a <").concat(_lbd["default"].Aggregator, "> .\n      }"); // the updates immediately creates the container

                _context5.next = 11;
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

                _context5.next = 14;
                return this.accessService.setResourceAccess(url, accessRights, _BaseDefinitions.ResourceType.CONTAINER, actor);

              case 14:
                return _context5.abrupt("return", url);

              case 17:
                _context5.prev = 17;
                _context5.t0 = _context5["catch"](2);
                console.log("error", _context5.t0);
                throw _context5.t0;

              case 21:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[2, 17]]);
      }));

      function createProjectRegistry() {
        return _createProjectRegistry.apply(this, arguments);
      }

      return createProjectRegistry;
    }()
  }, {
    key: "removeProjectRegistry",
    value: function () {
      var _removeProjectRegistry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(stakeholder, url) {
        var q0;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.prev = 0;
                q0 = "DELETE {<".concat(stakeholder, "> <").concat(_lbd["default"].hasProjectRegistry, "> <").concat(url, "> .}\n      WHERE {<").concat(stakeholder, "> <").concat(_lbd["default"].hasProjectRegistry, "> ?reg .}\n      ");
                _context6.next = 4;
                return this.dataService.sparqlUpdate(stakeholder, q0);

              case 4:
                _context6.next = 6;
                return this.dataService.deleteContainer(url, true);

              case 6:
                _context6.next = 12;
                break;

              case 8:
                _context6.prev = 8;
                _context6.t0 = _context6["catch"](0);
                console.log("error", _context6.t0);
                throw _context6.t0;

              case 12:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[0, 8]]);
      }));

      function removeProjectRegistry(_x5, _x6) {
        return _removeProjectRegistry.apply(this, arguments);
      }

      return removeProjectRegistry;
    }()
  }]);

  return LBDService;
}();

exports["default"] = LBDService;
//# sourceMappingURL=LbdService.js.map