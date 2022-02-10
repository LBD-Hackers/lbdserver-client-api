"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _LbdConcept = _interopRequireDefault(require("./LbdConcept"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdDataset = _interopRequireDefault(require("./LbdDataset"));

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _BaseDefinitions = require("./BaseDefinitions");

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _functions = require("./functions");

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var LbdProject = /*#__PURE__*/function () {
  function LbdProject(session, accessPoint) {
    var verbose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, LbdProject);

    _defineProperty(this, "verbose", false);

    if (!accessPoint.endsWith("/")) accessPoint += "/";
    this.session = session;
    this.fetch = session.fetch;
    this.accessPoint = accessPoint;
    this.localProject = accessPoint + "local/";
    this.verbose = verbose;
    this.projectId = accessPoint.split('/')[accessPoint.split("/").length - 2];
    this.accessService = new _accessService["default"](session.fetch);
    this.dataService = new _dataService["default"](session.fetch);
    this.lbdService = new _LbdService["default"](session);
    this.queryEngine = (0, _actorInitSparql.newEngine)();
  }

  _createClass(LbdProject, [{
    key: "checkExistence",
    value: function () {
      var _checkExistence = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var status;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.fetch(this.accessPoint, {
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
        var data;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.fetch(this.localProject, {
                  headers: {
                    "Accept": "application/ld+json"
                  }
                }).then(function (i) {
                  return i.json();
                });

              case 2:
                data = _context2.sent;
                this.data = data;
                return _context2.abrupt("return", data);

              case 5:
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
    }() // initialise a project

  }, {
    key: "create",
    value: function () {
      var _create = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var existingPartialProjects,
            options,
            makePublic,
            local,
            referenceContainerUrl,
            _iterator,
            _step,
            part,
            q,
            q0,
            _i,
            _Object$keys,
            key,
            referenceMeta,
            _args3 = arguments;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                existingPartialProjects = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : [];
                options = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {};
                makePublic = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : false;
                local = this.accessPoint + 'local/';
                existingPartialProjects.push(local); // create global access point

                _context3.next = 7;
                return this.dataService.createContainer(this.accessPoint, makePublic);

              case 7:
                _context3.next = 9;
                return this.dataService.createContainer(local, makePublic);

              case 9:
                _context3.next = 11;
                return this.createRegistryContainer("datasets/", makePublic, _lbd["default"].hasDatasetRegistry);

              case 11:
                _context3.next = 13;
                return this.createRegistryContainer("references/", makePublic, _lbd["default"].hasReferenceRegistry);

              case 13:
                referenceContainerUrl = _context3.sent;
                _context3.next = 16;
                return this.createRegistryContainer("services/", makePublic, _lbd["default"].hasServiceRegistry);

              case 16:
                _iterator = _createForOfIteratorHelper(existingPartialProjects);
                _context3.prev = 17;

                _iterator.s();

              case 19:
                if ((_step = _iterator.n()).done) {
                  _context3.next = 25;
                  break;
                }

                part = _step.value;
                _context3.next = 23;
                return this.addPartialProject(part);

              case 23:
                _context3.next = 19;
                break;

              case 25:
                _context3.next = 30;
                break;

              case 27:
                _context3.prev = 27;
                _context3.t0 = _context3["catch"](17);

                _iterator.e(_context3.t0);

              case 30:
                _context3.prev = 30;

                _iterator.f();

                return _context3.finish(30);

              case 33:
                q = "INSERT DATA {<".concat(this.accessPoint, "> <").concat(_vocabCommonRdf.DCTERMS.creator, "> \"").concat(this.session.info.webId, "\" . }");
                _context3.next = 36;
                return this.dataService.sparqlUpdate(local, q);

              case 36:
                _context3.next = 38;
                return this.dataService.sparqlUpdate(this.accessPoint, q);

              case 38:
                if (!(Object.keys(options).length > 0)) {
                  _context3.next = 44;
                  break;
                }

                q0 = "INSERT DATA { ";

                for (_i = 0, _Object$keys = Object.keys(options); _i < _Object$keys.length; _i++) {
                  key = _Object$keys[_i];
                  q0 += "<".concat(this.accessPoint, "> <").concat(key, "> \"").concat(options[key], "\" .");
                }

                q0 += "}";
                _context3.next = 44;
                return this.dataService.sparqlUpdate(this.accessPoint, q0);

              case 44:
                referenceMeta = new _LbdDataset["default"](this.session, referenceContainerUrl);
                _context3.next = 47;
                return referenceMeta.create();

              case 47:
                _context3.next = 49;
                return referenceMeta.addDistribution(Buffer.from(""), "text/turtle", {}, "data", makePublic);

              case 49:
                _context3.next = 51;
                return this.init();

              case 51:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[17, 27, 30, 33]]);
      }));

      function create() {
        return _create.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: "addPartialProject",
    value: function () {
      var _addPartialProject = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(part) {
        var q0;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                q0 = "INSERT DATA {\n        <".concat(this.accessPoint, "> <").concat(_lbd["default"].aggregates, "> <").concat(part, "> .\n        }");
                _context4.next = 3;
                return this.dataService.sparqlUpdate(this.accessPoint, q0);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function addPartialProject(_x) {
        return _addPartialProject.apply(this, arguments);
      }

      return addPartialProject;
    }()
  }, {
    key: "addStakeholder",
    value: function () {
      var _addStakeholder = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(webId) {
        var accessRights,
            _args5 = arguments;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                accessRights = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {
                  read: true,
                  append: false,
                  write: false,
                  control: false
                };
                _context5.next = 3;
                return this.accessService.setResourceAccess(this.accessPoint, accessRights, _BaseDefinitions.ResourceType.CONTAINER, webId);

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function addStakeholder(_x2) {
        return _addStakeholder.apply(this, arguments);
      }

      return addStakeholder;
    }()
  }, {
    key: "delete",
    value: function () {
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.dataService.deleteContainer(this.accessPoint, true);

              case 2:
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
  }, {
    key: "findAllPartialProjects",
    value: function () {
      var _findAllPartialProjects = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var projects;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.queryEngine.query("SELECT ?proj WHERE {<".concat(this.accessPoint, "> <").concat(_lbd["default"].aggregates, "> ?proj}"), {
                  sources: [this.accessPoint],
                  fetch: this.fetch
                }).then(function (i) {
                  return i.bindings();
                }).then(function (i) {
                  return i.map(function (r) {
                    return r.get('?proj').value;
                  });
                });

              case 2:
                projects = _context7.sent;
                return _context7.abrupt("return", projects);

              case 4:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function findAllPartialProjects() {
        return _findAllPartialProjects.apply(this, arguments);
      }

      return findAllPartialProjects;
    }()
  }, {
    key: "findPartialProject",
    value: function () {
      var _findPartialProject = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(webId) {
        var repo, partialProjectOfStakeholder, status;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.lbdService.getProjectRegistry(webId);

              case 2:
                repo = _context8.sent;
                partialProjectOfStakeholder = repo + this.projectId + '/local/';
                _context8.next = 6;
                return this.fetch(partialProjectOfStakeholder, {
                  method: "HEAD"
                }).then(function (res) {
                  return res.status;
                });

              case 6:
                status = _context8.sent;

                if (!(status === 200)) {
                  _context8.next = 11;
                  break;
                }

                return _context8.abrupt("return", partialProjectOfStakeholder);

              case 11:
                throw new Error("UNAUTHORIZED: This repository does not exist or you don't have the required access rights");

              case 12:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function findPartialProject(_x3) {
        return _findPartialProject.apply(this, arguments);
      }

      return findPartialProject;
    }()
  }, {
    key: "addPartialProjectByStakeholder",
    value: function () {
      var _addPartialProjectByStakeholder = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(webId) {
        var partialProjectUrl;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.findPartialProject(webId);

              case 2:
                partialProjectUrl = _context9.sent;
                _context9.next = 5;
                return this.addPartialProject(partialProjectUrl);

              case 5:
                return _context9.abrupt("return", partialProjectUrl);

              case 6:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function addPartialProjectByStakeholder(_x4) {
        return _addPartialProjectByStakeholder.apply(this, arguments);
      }

      return addPartialProjectByStakeholder;
    }()
  }, {
    key: "createRegistryContainer",
    value: function () {
      var _createRegistryContainer = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(containerName, makePublic, property) {
        var containerUrl, q0;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                if (!containerName.endsWith('/')) containerName += "/";
                containerUrl = this.localProject + containerName;
                _context10.next = 4;
                return this.dataService.createContainer(containerUrl, makePublic);

              case 4:
                q0 = "INSERT DATA {\n        <".concat(this.localProject, "> <").concat(property, "> <").concat(containerUrl, "> .\n      }");
                _context10.next = 7;
                return this.dataService.sparqlUpdate(this.localProject, q0);

              case 7:
                return _context10.abrupt("return", containerUrl);

              case 8:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function createRegistryContainer(_x5, _x6, _x7) {
        return _createRegistryContainer.apply(this, arguments);
      }

      return createRegistryContainer;
    }() /////////////////////////////////////////////////////////
    /////////////////////// DATASETS ////////////////////////
    /////////////////////////////////////////////////////////

    /**
     * 
     * @param makePublic 
     * @param id
     * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
     * @returns 
     */

  }, {
    key: "addDataset",
    value: function () {
      var _addDataset = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        var options,
            makePublic,
            id,
            subject,
            datasetRegistry,
            datasetUrl,
            theDataset,
            _args11 = arguments;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                options = _args11.length > 0 && _args11[0] !== undefined ? _args11[0] : {};
                makePublic = _args11.length > 1 && _args11[1] !== undefined ? _args11[1] : false;
                id = _args11.length > 2 && _args11[2] !== undefined ? _args11[2] : (0, _uuid.v4)();
                subject = (0, _functions.extract)(this.data, this.localProject);
                datasetRegistry = subject[_lbd["default"].hasDatasetRegistry][0]["@id"];
                datasetUrl = datasetRegistry + id + "/";
                theDataset = new _LbdDataset["default"](this.session, datasetUrl);
                _context11.next = 9;
                return theDataset.create(options, makePublic);

              case 9:
                return _context11.abrupt("return", theDataset);

              case 10:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function addDataset() {
        return _addDataset.apply(this, arguments);
      }

      return addDataset;
    }()
  }, {
    key: "deleteDataset",
    value: function () {
      var _deleteDataset = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(datasetUrl) {
        var ds;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                if (!datasetUrl.endsWith('/')) datasetUrl += "/";
                ds = new _LbdDataset["default"](this.session, datasetUrl);
                _context12.next = 4;
                return ds["delete"]();

              case 4:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function deleteDataset(_x8) {
        return _deleteDataset.apply(this, arguments);
      }

      return deleteDataset;
    }()
  }, {
    key: "deleteDatasetById",
    value: function () {
      var _deleteDatasetById = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(datasetId) {
        var subject, datasetRegistry, datasetUrl, ds;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                subject = (0, _functions.extract)(this.data, this.localProject);
                datasetRegistry = subject[_lbd["default"].hasDatasetRegistry][0]["@id"];
                datasetUrl = datasetRegistry + datasetId + "/";
                ds = new _LbdDataset["default"](this.session, datasetUrl);
                _context13.next = 6;
                return ds["delete"]();

              case 6:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function deleteDatasetById(_x9) {
        return _deleteDatasetById.apply(this, arguments);
      }

      return deleteDatasetById;
    }()
  }, {
    key: "getAllPartialProjects",
    value: function () {
      var _getAllPartialProjects = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
        var q, results, _yield$this$queryEngi, data, asJson, partials;

        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                q = "SELECT ?partial WHERE {<".concat(this.accessPoint, "> <").concat(_lbd["default"].aggregates, "> ?partial}");
                _context14.next = 3;
                return this.queryEngine.query(q, {
                  sources: [this.accessPoint],
                  fetch: this.fetch
                });

              case 3:
                results = _context14.sent;
                _context14.next = 6;
                return this.queryEngine.resultToString(results, 'application/sparql-results+json');

              case 6:
                _yield$this$queryEngi = _context14.sent;
                data = _yield$this$queryEngi.data;
                _context14.next = 10;
                return (0, _utils.parseStream)(data);

              case 10:
                asJson = _context14.sent;
                partials = asJson["results"].bindings.map(function (item) {
                  return item["partial"].value;
                });
                console.log('partials', partials);
                return _context14.abrupt("return", partials);

              case 14:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function getAllPartialProjects() {
        return _getAllPartialProjects.apply(this, arguments);
      }

      return getAllPartialProjects;
    }()
  }, {
    key: "getSingleQueryResult",
    value: function () {
      var _getSingleQueryResult = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(source, property) {
        var q, bindings;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                q = "SELECT ?res WHERE {<".concat(source, "> <").concat(property, "> ?res}");
                _context15.next = 3;
                return this.queryEngine.query(q, {
                  sources: [source],
                  fetch: this.fetch
                }).then(function (i) {
                  return i.bindings();
                });

              case 3:
                bindings = _context15.sent;
                return _context15.abrupt("return", bindings[0].get("?res").value);

              case 5:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function getSingleQueryResult(_x10, _x11) {
        return _getSingleQueryResult.apply(this, arguments);
      }

      return getSingleQueryResult;
    }()
  }, {
    key: "getAllDatasetUrls",
    value: function () {
      var _getAllDatasetUrls = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(options) {
        var subject, sources, partials, _iterator2, _step2, p, dsReg, q, results, _yield$this$queryEngi2, data, parsed;

        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                subject = (0, _functions.extract)(this.data, this.localProject);
                sources = [];

                if (!(options && options.local)) {
                  _context16.next = 6;
                  break;
                }

                sources.push(subject[_lbd["default"].hasDatasetRegistry][0]["@id"]);
                _context16.next = 29;
                break;

              case 6:
                _context16.next = 8;
                return this.getAllPartialProjects();

              case 8:
                partials = _context16.sent;
                _iterator2 = _createForOfIteratorHelper(partials);
                _context16.prev = 10;

                _iterator2.s();

              case 12:
                if ((_step2 = _iterator2.n()).done) {
                  _context16.next = 21;
                  break;
                }

                p = _step2.value;
                _context16.next = 16;
                return this.getSingleQueryResult(p, _lbd["default"].hasDatasetRegistry);

              case 16:
                dsReg = _context16.sent;
                console.log('dsReg', p, dsReg);
                sources.push(dsReg);

              case 19:
                _context16.next = 12;
                break;

              case 21:
                _context16.next = 26;
                break;

              case 23:
                _context16.prev = 23;
                _context16.t0 = _context16["catch"](10);

                _iterator2.e(_context16.t0);

              case 26:
                _context16.prev = 26;

                _iterator2.f();

                return _context16.finish(26);

              case 29:
                if (!options || !options.query) {
                  q = "SELECT ?dataset WHERE {?registry <".concat(_vocabCommonRdf.LDP.contains, "> ?dataset}");
                } else {
                  q = options.query;
                }

                _context16.next = 32;
                return this.queryEngine.query(q, {
                  sources: sources,
                  fetch: this.fetch
                });

              case 32:
                results = _context16.sent;
                _context16.next = 35;
                return this.queryEngine.resultToString(results, 'application/sparql-results+json');

              case 35:
                _yield$this$queryEngi2 = _context16.sent;
                data = _yield$this$queryEngi2.data;

                if (!(options && options.asStream)) {
                  _context16.next = 41;
                  break;
                }

                return _context16.abrupt("return", data);

              case 41:
                _context16.next = 43;
                return (0, _utils.parseStream)(data);

              case 43:
                parsed = _context16.sent;
                return _context16.abrupt("return", parsed["results"].bindings.map(function (i) {
                  return i["dataset"].value;
                }));

              case 45:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this, [[10, 23, 26, 29]]);
      }));

      function getAllDatasetUrls(_x12) {
        return _getAllDatasetUrls.apply(this, arguments);
      }

      return getAllDatasetUrls;
    }() /////////////////////////////////////////////////////////
    ////////////////////// REFERENCES////////////////////////
    /////////////////////////////////////////////////////////
    // get all references related to a specific abstract Concept

  }, {
    key: "addConcept",
    value: function () {
      var _addConcept = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
        var subject, referenceRegistry, ref;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                subject = (0, _functions.extract)(this.data, this.localProject);
                referenceRegistry = subject[_lbd["default"].hasReferenceRegistry][0]["@id"];
                ref = new _LbdConcept["default"](this.session, referenceRegistry);
                _context17.next = 5;
                return ref.create();

              case 5:
                return _context17.abrupt("return", ref);

              case 6:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function addConcept() {
        return _addConcept.apply(this, arguments);
      }

      return addConcept;
    }()
  }, {
    key: "deleteConcept",
    value: function () {
      var _deleteConcept = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(url) {
        var parts, id, referenceRegistry, ref;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                parts = url.split("/");
                id = parts.pop();
                referenceRegistry = parts.join("/");
                console.log('id, referenceRegistry', id, referenceRegistry);
                ref = new _LbdConcept["default"](this.session, referenceRegistry, id);
                _context18.next = 7;
                return ref["delete"]();

              case 7:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function deleteConcept(_x13) {
        return _deleteConcept.apply(this, arguments);
      }

      return deleteConcept;
    }() // register an alias for an existing concept

  }, {
    key: "addAlias",
    value: function () {
      var _addAlias = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19);
      }));

      function addAlias() {
        return _addAlias.apply(this, arguments);
      }

      return addAlias;
    }() // get the abstract Concept related to a dataset/distribution + id

  }, {
    key: "getConcept",
    value: function () {
      var _getConcept = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20);
      }));

      function getConcept() {
        return _getConcept.apply(this, arguments);
      }

      return getConcept;
    }() /////////////////////////////////////////////////////////
    /////////////////////// QUERY ////////////////////////
    /////////////////////////////////////////////////////////

  }, {
    key: "queryProject",
    value: function () {
      var _queryProject = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21);
      }));

      function queryProject() {
        return _queryProject.apply(this, arguments);
      }

      return queryProject;
    }()
  }]);

  return LbdProject;
}();

exports["default"] = LbdProject;
//# sourceMappingURL=LbdProject.js.map