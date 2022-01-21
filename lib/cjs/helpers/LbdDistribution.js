"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _mimeTypes = _interopRequireDefault(require("mime-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var LbdDistribution = /*#__PURE__*/function () {
  // include queryEngine to allow caching of querydata etc.
  function LbdDistribution(fetch, url) {
    _classCallCheck(this, LbdDistribution);

    var datasetUrl = url.split('/');
    datasetUrl.pop();
    var ds = datasetUrl.join("/") + '/';
    this.fetch = fetch;
    this.url = url;
    this.datasetUrl = ds;
    this.accessService = new _accessService["default"](fetch);
    this.dataService = new _dataService["default"](fetch);
    this.lbdService = new _LbdService["default"](fetch);
    this.queryEngine = (0, _actorInitSparql.newEngine)();
  }

  _createClass(LbdDistribution, [{
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
        var options,
            _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                options = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};
                _context2.next = 3;
                return this.fetch(this.url, options);

              case 3:
                this.data = _context2.sent;

              case 4:
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
  }, {
    key: "getContentType",
    value: function () {
      var _getContentType = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var q0, ct, value;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                q0 = "SELECT ?ct where {?id <".concat(_vocabCommonRdf.DCTERMS.format, "> ?ct}");
                _context3.next = 3;
                return this.queryEngine.query(q0, {
                  sources: [this.datasetUrl],
                  fetch: this.fetch
                }).then(function (res) {
                  return res.bindings();
                });

              case 3:
                ct = _context3.sent;

                if (!(ct.length > 0)) {
                  _context3.next = 10;
                  break;
                }

                value = ct[0].get('?ct').value;
                this.contentType = value;
                return _context3.abrupt("return", value);

              case 10:
                throw new Error("\"Could not find contentType in dataset ".concat(this.datasetUrl));

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getContentType() {
        return _getContentType.apply(this, arguments);
      }

      return getContentType;
    }()
  }, {
    key: "updateMetadata",
    value: function () {
      var _updateMetadata = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(query) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.dataService.sparqlUpdate(this.datasetUrl, query);

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function updateMetadata(_x) {
        return _updateMetadata.apply(this, arguments);
      }

      return updateMetadata;
    }()
  }, {
    key: "addAccessUrl",
    value: function () {
      var _addAccessUrl = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(accessUrl) {
        var q0;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                q0 = "INSERT DATA {<".concat(this.url, "> <").concat(_vocabCommonRdf.DCAT.accessURL, "> <").concat(accessUrl, ">}");
                _context5.next = 3;
                return this.updateMetadata(q0);

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function addAccessUrl(_x2) {
        return _addAccessUrl.apply(this, arguments);
      }

      return addAccessUrl;
    }()
  }, {
    key: "create",
    value: function () {
      var _create = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(file) {
        var options,
            mimetype,
            makePublic,
            q,
            q0,
            _i,
            _Object$keys,
            key,
            _args6 = arguments;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                options = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : {};
                mimetype = _args6.length > 2 ? _args6[2] : undefined;
                makePublic = _args6.length > 3 && _args6[3] !== undefined ? _args6[3] : false;

                if (!mimetype) {
                  try {
                    mimetype = _mimeTypes["default"].lookup(file["name"]);
                    if (!mimetype) mimetype = "text/plain";
                  } catch (error) {
                    mimetype = "text/plain";
                  }
                }

                _context6.next = 6;
                return this.dataService.writeFileToPod(file, this.url, makePublic, mimetype);

              case 6:
                q = "INSERT DATA {\n        <".concat(this.datasetUrl, "> <").concat(_vocabCommonRdf.DCAT.distribution, "> <").concat(this.url, "> .\n        <").concat(this.url, "> a <").concat(_vocabCommonRdf.DCAT.Distribution, "> ;\n            <").concat(_vocabCommonRdf.DCTERMS.format, "> <https://www.iana.org/assignments/media-types/").concat(mimetype, "> ;\n            <").concat(_vocabCommonRdf.DCAT.downloadURL, "> <").concat(this.url, "> .\n      }");
                _context6.next = 9;
                return this.queryEngine.query(q, {
                  sources: [this.datasetUrl],
                  fetch: this.fetch
                });

              case 9:
                if (!(Object.keys(options).length > 0)) {
                  _context6.next = 15;
                  break;
                }

                q0 = "INSERT DATA { ";

                for (_i = 0, _Object$keys = Object.keys(options); _i < _Object$keys.length; _i++) {
                  key = _Object$keys[_i];
                  q0 += "<".concat(this.datasetUrl, "> <").concat(key, "> \"").concat(options[key], "\" .");
                }

                q0 += "}";
                _context6.next = 15;
                return this.dataService.sparqlUpdate(this.datasetUrl, q0);

              case 15:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function create(_x3) {
        return _create.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: "delete",
    value: function () {
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var q0, q1;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.dataService.deleteFile(this.url);

              case 2:
                // also update dataset
                q0 = "DELETE {\n      <".concat(this.url, "> ?p ?o .\n    } WHERE {\n      <").concat(this.url, "> ?p ?o .\n    }");
                _context7.next = 5;
                return this.queryEngine.query(q0, {
                  sources: [this.datasetUrl],
                  fetch: this.fetch
                });

              case 5:
                q1 = "DELETE {\n      ?s ?p <".concat(this.url, "> .\n    } WHERE {\n      ?s ?p <").concat(this.url, "> .\n    }");
                _context7.next = 8;
                return this.queryEngine.query(q1, {
                  sources: [this.datasetUrl],
                  fetch: this.fetch
                });

              case 8:
                return _context7.abrupt("return");

              case 9:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function _delete() {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }()
  }]);

  return LbdDistribution;
}();

exports["default"] = LbdDistribution;
//# sourceMappingURL=LbdDistribution.js.map