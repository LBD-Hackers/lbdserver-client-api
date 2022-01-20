"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _BaseDefinitions = require("./BaseDefinitions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class LBDService {
  constructor(fetch) {
    var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _defineProperty(this, "verbose", false);

    this.fetch = fetch;
    this.verbose = verbose;
    this.accessService = new _accessService.default(fetch);
    this.dataService = new _dataService.default(fetch);
  } /////////////////////////////////////////////////////////
  ////////////////////// PREPARATION //////////////////////
  /////////////////////////////////////////////////////////


  validateWebId(webId) {
    var _this = this;

    return _asyncToGenerator(function* () {
      var lbdLoc = yield _this.getProjectRegistry(webId);

      if (lbdLoc && lbdLoc.length > 0) {
        return true;
      }

      return false;
    })();
  }

  getProjectRegistry(stakeholder) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var myEngine = (0, _actorInitSparql.newEngine)();
      var q = "select ?loc where {<".concat(stakeholder, "> <").concat(_lbd.default.hasProjectRegistry, "> ?loc}");
      var location = yield myEngine.query(q, {
        sources: [stakeholder],
        fetch: _this2.fetch
      }).then(res => res.bindings()).then(bind => bind.map(i => i.get("?loc").value)).catch(err => {
        throw err;
      });

      if (location && location.length > 0) {
        return location[0];
      } else {
        return undefined;
      }
    })();
  }

  createProjectRegistry(stakeholder, url) {
    var _arguments = arguments,
        _this3 = this;

    return _asyncToGenerator(function* () {
      var publiclyAccessible = _arguments.length > 2 && _arguments[2] !== undefined ? _arguments[2] : true;

      try {
        var q0 = "INSERT DATA {\n          <".concat(stakeholder, "> <").concat(_lbd.default.hasProjectRegistry, "> <").concat(url, "> .\n        }");
        yield _this3.dataService.sparqlUpdate(stakeholder, q0); // create the LBD registry (container / Aggregator)

        var q1 = "INSERT DATA {\n        <".concat(url, "> a <").concat(_lbd.default.Aggregator, "> .\n      }"); // the updates immediately creates the container

        yield _this3.dataService.sparqlUpdate(url, q1);
        var accessRights;
        var actor;

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

        yield _this3.accessService.setResourceAccess(url, accessRights, _BaseDefinitions.ResourceType.CONTAINER, actor);
        return url;
      } catch (error) {
        console.log("error", error);
        throw error;
      }
    })();
  }

  removeProjectRegistry(stakeholder, url) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      try {
        var q0 = "DELETE {<".concat(stakeholder, "> <").concat(_lbd.default.hasProjectRegistry, "> <").concat(url, "> .}\n      WHERE {<").concat(stakeholder, "> <").concat(_lbd.default.hasProjectRegistry, "> ?reg .}\n      ");
        yield _this4.dataService.sparqlUpdate(stakeholder, q0);
        yield _this4.dataService.deleteContainer(url, true);
      } catch (error) {
        console.log("error", error);
        throw error;
      }
    })();
  }

}

exports.default = LBDService;
//# sourceMappingURL=LbdService.js.map