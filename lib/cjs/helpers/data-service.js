"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _solidClient = require("@inrupt/solid-client");

var _accessService = _interopRequireDefault(require("./access-service"));

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

var DataService = /*#__PURE__*/function () {
  function DataService(fetch) {
    var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, DataService);

    _defineProperty(this, "verbose", false);

    this.fetch = fetch;
    this.verbose = verbose;
    this.accessService = new _accessService["default"](fetch);
  }
  /**
   * FILES
   */
  // Upload File to the targetFileURL.
  // If the targetFileURL exists, overwrite the file.
  // If the targetFileURL does not exist, create the file at the location.


  _createClass(DataService, [{
    key: "writeFileToPod",
    value: function () {
      var _writeFileToPod = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(file, targetFileURL) {
        var makePublic,
            contentType,
            requestOptions,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                makePublic = _args.length > 2 && _args[2] !== undefined ? _args[2] : false;
                contentType = _args.length > 3 ? _args[3] : undefined;
                requestOptions = {
                  method: "PUT",
                  headers: {
                    "Content-Type": contentType
                  },
                  body: file,
                  redirect: "follow"
                };
                _context.next = 5;
                return this.fetch(targetFileURL, requestOptions);

              case 5:
                if (!makePublic) {
                  _context.next = 8;
                  break;
                }

                _context.next = 8;
                return this.accessService.makeFilePublic(targetFileURL);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function writeFileToPod(_x, _x2) {
        return _writeFileToPod.apply(this, arguments);
      }

      return writeFileToPod;
    }()
  }, {
    key: "getFile",
    value: function () {
      var _getFile2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(fileURL) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.verbose && console.log("Getting file ".concat(fileURL, "..."));
                return _context2.abrupt("return", (0, _solidClient.getFile)(fileURL, // File in Pod to Read
                {
                  fetch: this.fetch
                } // fetch from authenticated session
                ));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getFile(_x3) {
        return _getFile2.apply(this, arguments);
      }

      return getFile;
    }()
  }, {
    key: "deleteFile",
    value: function () {
      var _deleteFile2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(fileURL) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.verbose && console.log("Deleting file ".concat(fileURL, "..."));
                return _context3.abrupt("return", (0, _solidClient.deleteFile)(fileURL, // File in Pod to Read
                {
                  fetch: this.fetch
                } // fetch from authenticated session
                ));

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function deleteFile(_x4) {
        return _deleteFile2.apply(this, arguments);
      }

      return deleteFile;
    }()
    /**
     * SPARQL
     */

  }, {
    key: "sparqlUpdate",
    value: function () {
      var _sparqlUpdate = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(fileUrl, query) {
        var requestOptions;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                requestOptions = {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/sparql-update"
                  },
                  body: query,
                  redirect: "follow"
                };
                _context4.next = 3;
                return this.fetch(fileUrl, requestOptions);

              case 3:
                return _context4.abrupt("return", _context4.sent);

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function sparqlUpdate(_x5, _x6) {
        return _sparqlUpdate.apply(this, arguments);
      }

      return sparqlUpdate;
    }()
    /**
     * CONTAINERS
     */

  }, {
    key: "deleteContainer",
    value: function () {
      var _deleteContainer2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(containerURL) {
        var includeSubContainers,
            dataset,
            containerResources,
            _iterator,
            _step,
            resource,
            _args5 = arguments;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                includeSubContainers = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : true;

                if (!includeSubContainers) {
                  _context5.next = 31;
                  break;
                }

                console.log("Deleting container ".concat(containerURL, " including its subfolders..."));
                _context5.next = 5;
                return (0, _solidClient.getSolidDataset)(containerURL, {
                  fetch: this.fetch
                });

              case 5:
                dataset = _context5.sent;
                _context5.next = 8;
                return (0, _solidClient.getContainedResourceUrlAll)(dataset);

              case 8:
                containerResources = _context5.sent;
                // Delete resources (containers and files)
                _iterator = _createForOfIteratorHelper(containerResources);
                _context5.prev = 10;

                _iterator.s();

              case 12:
                if ((_step = _iterator.n()).done) {
                  _context5.next = 23;
                  break;
                }

                resource = _step.value;

                if (!(0, _solidClient.isContainer)(resource)) {
                  _context5.next = 19;
                  break;
                }

                _context5.next = 17;
                return this.deleteContainer(resource, true);

              case 17:
                _context5.next = 21;
                break;

              case 19:
                _context5.next = 21;
                return this.deleteFile(resource);

              case 21:
                _context5.next = 12;
                break;

              case 23:
                _context5.next = 28;
                break;

              case 25:
                _context5.prev = 25;
                _context5.t0 = _context5["catch"](10);

                _iterator.e(_context5.t0);

              case 28:
                _context5.prev = 28;

                _iterator.f();

                return _context5.finish(28);

              case 31:
                console.log("Deleting container ".concat(containerURL, "..."));
                return _context5.abrupt("return", (0, _solidClient.deleteContainer)(containerURL, {
                  fetch: this.fetch
                }));

              case 33:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[10, 25, 28, 31]]);
      }));

      function deleteContainer(_x7) {
        return _deleteContainer2.apply(this, arguments);
      }

      return deleteContainer;
    }()
  }, {
    key: "createContainer",
    value: function () {
      var _createContainer = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(containerURL) {
        var makePublic,
            datasetWithAcl,
            _args6 = arguments;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                makePublic = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : false;
                this.verbose && console.log("Creating container ".concat(containerURL, "..."));
                _context6.next = 4;
                return (0, _solidClient.createContainerAt)(containerURL, // File in Pod to Read
                {
                  fetch: this.fetch
                } // fetch from authenticated session
                );

              case 4:
                datasetWithAcl = _context6.sent;

                if (!makePublic) {
                  _context6.next = 8;
                  break;
                }

                _context6.next = 8;
                return this.accessService.makePublic(containerURL);

              case 8:
                return _context6.abrupt("return", datasetWithAcl);

              case 9:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function createContainer(_x8) {
        return _createContainer.apply(this, arguments);
      }

      return createContainer;
    }()
  }]);

  return DataService;
}();

exports["default"] = DataService;
//# sourceMappingURL=data-service.js.map