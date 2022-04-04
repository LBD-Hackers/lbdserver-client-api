"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LbdDistribution = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdService = require("./LbdService");

var _functions = require("./helpers/functions");

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _mimeTypes = _interopRequireDefault(require("mime-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var LbdDistribution = /*#__PURE__*/function () {
  /**
   * 
   * @param session an (authenticated) Solid session
   * @param dataset the LbdDataset to which this distribution belongs
   * @param id (optional) identifier of the distribution (default: GUID)
   */
  function LbdDistribution(session, dataset) {
    var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, _uuid.v4)();

    _classCallCheck(this, LbdDistribution);

    this.dataset = dataset;
    this.fetch = session.fetch;
    this.url = dataset.url + id;
    this.accessService = new _accessService["default"](session.fetch);
    this.dataService = new _dataService["default"](session.fetch);
    this.lbdService = new _LbdService.LbdService(session);
  }
  /**
   * Check the existence of this distribution
   */


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
    /**
     * @description Get the distribution's content
     * @param options Fetch options
     */

  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
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

      function get() {
        return _get.apply(this, arguments);
      }

      return get;
    }()
    /**
     * @description Get the content type of the distribution
     * @returns contenttype of the distribution
     */

  }, {
    key: "getContentType",
    value: function getContentType() {
      var metadata = (0, _functions.extract)(this.dataset.data, this.url)[_vocabCommonRdf.DCAT.mediaType].map(function (i) {
        return i["@id"];
      })[0];

      return metadata;
    }
    /**
     * @description Update the metadata of the distribution (i.e. its dataset) with a SPARQL query
     * @param query the SPARQL update
     */

  }, {
    key: "updateMetadata",
    value: function () {
      var _updateMetadata = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(query) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.dataService.sparqlUpdate(this.dataset.url, query);

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function updateMetadata(_x) {
        return _updateMetadata.apply(this, arguments);
      }

      return updateMetadata;
    }()
    /**
     * @description Add a new dcat:accessURL to the distribution
     * @param accessUrl Access URL of the distribution (e.g. for a satellite service)
     */

  }, {
    key: "addAccessUrl",
    value: function () {
      var _addAccessUrl = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(accessUrl) {
        var q0;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                q0 = "INSERT DATA {<".concat(this.url, "> <").concat(_vocabCommonRdf.DCAT.accessURL, "> <").concat(accessUrl, ">}");
                _context4.next = 3;
                return this.updateMetadata(q0);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function addAccessUrl(_x2) {
        return _addAccessUrl.apply(this, arguments);
      }

      return addAccessUrl;
    }()
    /**
     * @description Create this distribution on a Pod
     * @param file The file/content of the distribution
     * @param options Additional metadata to add to the distribution. form:  {[predicate]: value}
     * @param mimetype optional: the content type of the distribution. If not provided, it will be guessed. If the guess fails, the content type will be text/plain
     * @param makePublic access rights
     */

  }, {
    key: "create",
    value: function () {
      var _create = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(file) {
        var options,
            mimetype,
            makePublic,
            q,
            q0,
            _i,
            _Object$keys,
            key,
            _args5 = arguments;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                options = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {};
                mimetype = _args5.length > 2 ? _args5[2] : undefined;
                makePublic = _args5.length > 3 ? _args5[3] : undefined;

                if (!mimetype) {
                  try {
                    mimetype = _mimeTypes["default"].lookup(file["name"]);
                    if (!mimetype) mimetype = "text/plain";
                  } catch (error) {
                    mimetype = "text/plain";
                  }
                }

                _context5.next = 6;
                return this.dataService.writeFileToPod(file, this.url, makePublic, mimetype);

              case 6:
                //workaround to allow inherited access rights
                if (makePublic === undefined) {
                  this.dataService.deleteFile(this.url + ".acl");
                }

                q = "INSERT DATA {\n        <".concat(this.dataset.url, "> <").concat(_vocabCommonRdf.DCAT.distribution, "> <").concat(this.url, "> .\n        <").concat(this.url, "> a <").concat(_vocabCommonRdf.DCAT.Distribution, "> ;\n            <").concat(_vocabCommonRdf.DCAT.mediaType, "> <https://www.iana.org/assignments/media-types/").concat(mimetype, "> ;\n            <").concat(_vocabCommonRdf.DCAT.downloadURL, "> <").concat(this.url, "> .\n      }");
                _context5.next = 10;
                return this.dataService.sparqlUpdate(this.dataset.url, q);

              case 10:
                if (!(Object.keys(options).length > 0)) {
                  _context5.next = 16;
                  break;
                }

                q0 = "INSERT DATA { ";

                for (_i = 0, _Object$keys = Object.keys(options); _i < _Object$keys.length; _i++) {
                  key = _Object$keys[_i];
                  q0 += "<".concat(this.dataset.url, "> <").concat(key, "> \"").concat(options[key], "\" .");
                }

                q0 += "}";
                _context5.next = 16;
                return this.dataService.sparqlUpdate(this.dataset.url, q0);

              case 16:
                this.dataset.init();

              case 17:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function create(_x3) {
        return _create.apply(this, arguments);
      }

      return create;
    }()
    /**
     * Delete this distribution
     */

  }, {
    key: "delete",
    value: function () {
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var myEngine, q0, q1;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                myEngine = (0, _actorInitSparql.newEngine)();
                _context6.next = 3;
                return this.dataService.deleteFile(this.url);

              case 3:
                // also update dataset
                q0 = "DELETE {\n      <".concat(this.url, "> ?p ?o .\n    } WHERE {\n      <").concat(this.url, "> ?p ?o .\n    }");
                _context6.next = 6;
                return myEngine.query(q0, {
                  sources: [this.dataset.url],
                  fetch: this.fetch
                });

              case 6:
                q1 = "DELETE {\n      ?s ?p <".concat(this.url, "> .\n    } WHERE {\n      ?s ?p <").concat(this.url, "> .\n    }");
                _context6.next = 9;
                return myEngine.query(q1, {
                  sources: [this.dataset.url],
                  fetch: this.fetch
                });

              case 9:
                return _context6.abrupt("return");

              case 10:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _delete() {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }()
  }]);

  return LbdDistribution;
}();

exports.LbdDistribution = LbdDistribution;
//# sourceMappingURL=LbdDistribution.js.map