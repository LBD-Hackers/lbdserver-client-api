"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _functions = require("./functions");

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _LbdDistribution = _interopRequireDefault(require("./LbdDistribution"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var LbdDataset = /*#__PURE__*/function () {
  function LbdDataset(session, url) {
    _classCallCheck(this, LbdDataset);

    this.session = session;
    this.fetch = session.fetch;
    this.url = url;
    this.accessService = new _accessService["default"](session.fetch);
    this.dataService = new _dataService["default"](session.fetch);
    this.lbdService = new _LbdService["default"](session);
  }

  _createClass(LbdDataset, [{
    key: "checkExistence",
    value: function () {
      var _checkExistence = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var status;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.fetch(this.url, {
                  method: "HEAD"
                }).then(function (result) {
                  return result.status;
                });

              case 2:
                status = _context.sent;

                if (!(status === 200)) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt("return", true);

              case 7:
                return _context.abrupt("return", false);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function checkExistence() {
        return _checkExistence.apply(this, arguments);
      }

      return checkExistence;
    }()
  }, {
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.fetch(this.url, {
                  headers: {
                    "Accept": "application/ld+json"
                  }
                }).then(function (i) {
                  return i.json();
                });

              case 2:
                this.data = _context2.sent;
                _context2.next = 5;
                return this.getDistributions();

              case 5:
                this.distributions = _context2.sent;

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
    /**
     * 
     * @param makePublic 
     * @param id
     * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
     * @returns 
     */

  }, {
    key: "create",
    value: function () {
      var _create = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var options,
            makePublic,
            datasetUrl,
            status,
            aclDefault,
            q,
            q0,
            _i,
            _Object$keys,
            key,
            _args3 = arguments;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                options = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {};
                makePublic = _args3.length > 1 ? _args3[1] : undefined;
                datasetUrl = this.url;
                _context3.next = 5;
                return this.fetch(datasetUrl, {
                  method: "HEAD"
                }).then(function (res) {
                  return res.status;
                });

              case 5:
                status = _context3.sent;

                if (!(status !== 200)) {
                  _context3.next = 14;
                  break;
                }

                _context3.next = 9;
                return this.dataService.createContainer(datasetUrl, makePublic);

              case 9:
                if (!makePublic) {
                  _context3.next = 13;
                  break;
                }

                aclDefault = "INSERT {?rule <".concat(_vocabCommonRdf.ACL["default"], "> <").concat(datasetUrl, ">} WHERE {?rule a <").concat(_vocabCommonRdf.ACL.Authorization, "> ; <").concat(_vocabCommonRdf.ACL.agentClass, "> <").concat(_vocabCommonRdf.FOAF.Agent, ">}");
                _context3.next = 13;
                return this.dataService.sparqlUpdate(datasetUrl + ".acl", aclDefault);

              case 13:
                if (makePublic === undefined) {
                  this.dataService.deleteFile(datasetUrl + ".acl");
                }

              case 14:
                q = "INSERT DATA {<".concat(datasetUrl, "> a <").concat(_vocabCommonRdf.DCAT.Dataset, "> ; <").concat(_vocabCommonRdf.DCTERMS.creator, "> <").concat(this.session.info.webId, ">. }");
                _context3.next = 17;
                return this.dataService.sparqlUpdate(datasetUrl, q);

              case 17:
                if (!(Object.keys(options).length > 0)) {
                  _context3.next = 23;
                  break;
                }

                q0 = "INSERT DATA { ";

                for (_i = 0, _Object$keys = Object.keys(options); _i < _Object$keys.length; _i++) {
                  key = _Object$keys[_i];
                  q0 += "<".concat(datasetUrl, "> <").concat(key, "> \"").concat(options[key], "\" .");
                }

                q0 += "}";
                _context3.next = 23;
                return this.dataService.sparqlUpdate(datasetUrl, q0);

              case 23:
                _context3.next = 25;
                return this.init();

              case 25:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function create() {
        return _create.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: "delete",
    value: function () {
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.dataService.deleteContainer(this.url, true);

              case 2:
                return _context4.abrupt("return");

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _delete() {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }()
  }, {
    key: "update",
    value: function () {
      var _update = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(query) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.dataService.sparqlUpdate(this.url, query);

              case 2:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function update(_x) {
        return _update.apply(this, arguments);
      }

      return update;
    }() /////////////////////////////////////////////////////////
    //////////////////// DISTRIBUTIONS///////////////////////
    /////////////////////////////////////////////////////////

  }, {
    key: "addDistribution",
    value: function () {
      var _addDistribution = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(distribution, mimetype) {
        var options,
            distributionId,
            makePublic,
            distributionUrl,
            dist,
            _args6 = arguments;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                options = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : {};
                distributionId = _args6.length > 3 && _args6[3] !== undefined ? _args6[3] : (0, _uuid.v4)();
                makePublic = _args6.length > 4 && _args6[4] !== undefined ? _args6[4] : false;
                distributionUrl = this.url + distributionId;
                dist = new _LbdDistribution["default"](this.session, distributionUrl, this);
                _context6.next = 7;
                return dist.create(distribution, {}, mimetype, makePublic);

              case 7:
                _context6.next = 9;
                return dist.init();

              case 9:
                return _context6.abrupt("return", dist);

              case 10:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function addDistribution(_x2, _x3) {
        return _addDistribution.apply(this, arguments);
      }

      return addDistribution;
    }()
  }, {
    key: "getDistributions",
    value: function getDistributions() {
      var dataset = (0, _functions.extract)(this.data, this.url);

      if (dataset[_vocabCommonRdf.DCAT.distribution]) {
        var distributionUrls = dataset[_vocabCommonRdf.DCAT.distribution].map(function (i) {
          return i["@id"];
        });

        var distributions = [];

        var _iterator = _createForOfIteratorHelper(distributionUrls),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var url = _step.value;
            var dist = new _LbdDistribution["default"](this.session, url, this);
            distributions.push(dist);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return distributions;
      } else return [];
    }
  }, {
    key: "deleteDistribution",
    value: function () {
      var _deleteDistribution = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(distributionId) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function deleteDistribution(_x4) {
        return _deleteDistribution.apply(this, arguments);
      }

      return deleteDistribution;
    }()
  }]);

  return LbdDataset;
}();

exports["default"] = LbdDataset;
//# sourceMappingURL=LbdDataset.js.map