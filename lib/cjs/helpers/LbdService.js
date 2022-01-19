"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

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
  function LBDService(fetch) {
    var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, LBDService);

    _defineProperty(this, "verbose", false);

    this.fetch = fetch;
    this.verbose = verbose;
    this.accessService = new _accessService["default"](fetch);
    this.dataService = new _dataService["default"](fetch);
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
    key: "getProjectRegistry",
    value: function () {
      var _getProjectRegistry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(stakeholder) {
        var myEngine, q, location;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                myEngine = (0, _actorInitSparql.newEngine)();
                q = "select ?loc where {<".concat(stakeholder, "> <").concat(_lbd["default"].hasProjectRegistry, "> ?loc}");
                _context2.next = 4;
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
                location = _context2.sent;

                if (!(location && location.length > 0)) {
                  _context2.next = 9;
                  break;
                }

                return _context2.abrupt("return", location[0]);

              case 9:
                return _context2.abrupt("return", undefined);

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getProjectRegistry(_x2) {
        return _getProjectRegistry.apply(this, arguments);
      }

      return getProjectRegistry;
    }()
  }, {
    key: "createProjectRegistry",
    value: function () {
      var _createProjectRegistry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(stakeholder, url) {
        var publiclyAccessible,
            q0,
            q1,
            accessRights,
            actor,
            _args3 = arguments;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                publiclyAccessible = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : true;
                _context3.prev = 1;
                q0 = "INSERT DATA {\n          <".concat(stakeholder, "> <").concat(_lbd["default"].hasProjectRegistry, "> <").concat(url, "> .\n        }");
                _context3.next = 5;
                return this.dataService.sparqlUpdate(stakeholder, q0);

              case 5:
                // create the LBD registry (container / Aggregator)
                q1 = "INSERT DATA {\n        <".concat(url, "> a <").concat(_lbd["default"].Aggregator, "> .\n      }"); // the updates immediately creates the container

                _context3.next = 8;
                return this.dataService.sparqlUpdate(url, q1);

              case 8:
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

                _context3.next = 11;
                return this.accessService.setResourceAccess(url, accessRights, _BaseDefinitions.ResourceType.CONTAINER, actor);

              case 11:
                return _context3.abrupt("return", url);

              case 14:
                _context3.prev = 14;
                _context3.t0 = _context3["catch"](1);
                console.log("error", _context3.t0);
                throw _context3.t0;

              case 18:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[1, 14]]);
      }));

      function createProjectRegistry(_x3, _x4) {
        return _createProjectRegistry.apply(this, arguments);
      }

      return createProjectRegistry;
    }()
  }, {
    key: "removeProjectRegistry",
    value: function () {
      var _removeProjectRegistry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(stakeholder, url) {
        var q0;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                q0 = "DELETE {<".concat(stakeholder, "> <").concat(_lbd["default"].hasProjectRegistry, "> <").concat(url, "> .}\n      WHERE {<").concat(stakeholder, "> <").concat(_lbd["default"].hasProjectRegistry, "> ?reg .}\n      ");
                _context4.next = 4;
                return this.dataService.sparqlUpdate(stakeholder, q0);

              case 4:
                _context4.next = 6;
                return this.dataService.deleteContainer(url, true);

              case 6:
                _context4.next = 12;
                break;

              case 8:
                _context4.prev = 8;
                _context4.t0 = _context4["catch"](0);
                console.log("error", _context4.t0);
                throw _context4.t0;

              case 12:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[0, 8]]);
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