"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _solidClient = require("@inrupt/solid-client");

var _accessService = _interopRequireDefault(require("./access-service"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class DataService {
  constructor(fetch) {
    var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _defineProperty(this, "verbose", false);

    this.fetch = fetch;
    this.verbose = verbose;
    this.accessService = new _accessService.default(fetch);
  }
  /**
   * FILES
   */
  // Upload File to the targetFileURL.
  // If the targetFileURL exists, overwrite the file.
  // If the targetFileURL does not exist, create the file at the location.


  writeFileToPod(file, targetFileURL) {
    var _arguments = arguments,
        _this = this;

    return _asyncToGenerator(function* () {
      var makePublic = _arguments.length > 2 && _arguments[2] !== undefined ? _arguments[2] : false;
      var contentType = _arguments.length > 3 ? _arguments[3] : undefined;
      var requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": contentType
        },
        body: file,
        redirect: "follow"
      };
      yield _this.fetch(targetFileURL, requestOptions); // const savedFile = await overwriteFile(
      //   targetFileURL,                            // URL for the file.
      //   file,                                     // File
      //   { contentType, fetch: this.fetch }        // mimetype if known, fetch from the authenticated session
      // );
      // this.verbose && console.log(`File saved at ${getSourceUrl(savedFile)}`);

      if (makePublic) {
        yield _this.accessService.makeFilePublic(targetFileURL);
      } // return savedFile;

    })();
  }

  getFile(fileURL) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      _this2.verbose && console.log("Getting file ".concat(fileURL, "..."));
      return (0, _solidClient.getFile)(fileURL, // File in Pod to Read
      {
        fetch: _this2.fetch
      } // fetch from authenticated session
      );
    })();
  }

  deleteFile(fileURL) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      _this3.verbose && console.log("Deleting file ".concat(fileURL, "..."));
      return (0, _solidClient.deleteFile)(fileURL, // File in Pod to Read
      {
        fetch: _this3.fetch
      } // fetch from authenticated session
      );
    })();
  }
  /**
   * SPARQL
   */


  sparqlUpdate(fileUrl, query) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      var requestOptions = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/sparql-update"
        },
        body: query,
        redirect: "follow"
      };
      return yield _this4.fetch(fileUrl, requestOptions);
    })();
  }
  /**
   * CONTAINERS
   */


  deleteContainer(containerURL) {
    var _arguments2 = arguments,
        _this5 = this;

    return _asyncToGenerator(function* () {
      var includeSubContainers = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : true;

      // If deleting subcontainers, we need to first get these
      if (includeSubContainers) {
        console.log("Deleting container ".concat(containerURL, " including its subfolders..."));
        var dataset = yield (0, _solidClient.getSolidDataset)(containerURL, {
          fetch: _this5.fetch
        });
        var containerResources = yield (0, _solidClient.getContainedResourceUrlAll)(dataset); // Delete resources (containers and files)

        for (var resource of containerResources) {
          if ((0, _solidClient.isContainer)(resource)) {
            yield _this5.deleteContainer(resource, true);
          } else {
            yield _this5.deleteFile(resource);
          }
        }
      }

      console.log("Deleting container ".concat(containerURL, "..."));
      return (0, _solidClient.deleteContainer)(containerURL, {
        fetch: _this5.fetch
      });
    })();
  }

  createContainer(containerURL) {
    var _arguments3 = arguments,
        _this6 = this;

    return _asyncToGenerator(function* () {
      var makePublic = _arguments3.length > 1 && _arguments3[1] !== undefined ? _arguments3[1] : false;
      _this6.verbose && console.log("Creating container ".concat(containerURL, "..."));
      var datasetWithAcl = yield (0, _solidClient.createContainerAt)(containerURL, // File in Pod to Read
      {
        fetch: _this6.fetch
      } // fetch from authenticated session
      );

      if (makePublic) {
        yield _this6.accessService.makePublic(containerURL);
      }

      return datasetWithAcl;
    })();
  }

}

exports.default = DataService;
//# sourceMappingURL=data-service.js.map