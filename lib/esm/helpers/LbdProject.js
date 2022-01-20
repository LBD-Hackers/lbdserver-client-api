"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _LbdConcept = _interopRequireDefault(require("./LbdConcept"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdDataset = _interopRequireDefault(require("./LbdDataset"));

var _lbd = _interopRequireDefault(require("./vocab/lbd"));

var _BaseDefinitions = require("./BaseDefinitions");

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _jsonldRemote = require("jsonld-remote");

var _uuid = require("uuid");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class LbdProject {
  constructor(fetch, accessPoint) {
    var verbose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _defineProperty(this, "verbose", false);

    if (!accessPoint.endsWith("/")) accessPoint += "/";
    this.fetch = fetch;
    this.accessPoint = accessPoint;
    this.localProject = accessPoint + "local/";
    this.verbose = verbose;
    this.projectId = accessPoint.split('/')[accessPoint.split("/").length - 2];
    this.accessService = new _accessService.default(fetch);
    this.dataService = new _dataService.default(fetch);
    this.lbdService = new _LbdService.default(fetch);
    this.queryEngine = (0, _actorInitSparql.newEngine)();
  }

  checkExistence() {
    var _this = this;

    return _asyncToGenerator(function* () {
      var status = yield _this.fetch(_this.accessPoint, {
        method: "HEAD"
      }).then(result => result.status);

      if (status === 200) {
        return true;
      } else {
        return false;
      }
    })();
  }

  init() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var data = yield _this2.fetch(_this2.localProject, {
        headers: {
          "Accept": "application/ld+json"
        }
      }).then(i => i.json());
      _this2.data = data;
      return data;
    })();
  } // initialise a project


  create() {
    var _arguments = arguments,
        _this3 = this;

    return _asyncToGenerator(function* () {
      var makePublic = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : false;
      var existingPartialProjects = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : [];
      var local = _this3.accessPoint + 'local/';
      existingPartialProjects.push(local); // create global access point

      yield _this3.dataService.createContainer(_this3.accessPoint, makePublic);
      yield _this3.dataService.createContainer(local, makePublic); // create different registries

      yield _this3.createRegistryContainer("datasets/", makePublic, _lbd.default.hasDatasetRegistry);
      yield _this3.createRegistryContainer("references/", makePublic, _lbd.default.hasReferenceRegistry);
      yield _this3.createRegistryContainer("services/", makePublic, _lbd.default.hasServiceRegistry);

      for (var part of existingPartialProjects) {
        yield _this3.addPartialProject(part);
      }

      yield _this3.init();
    })();
  }

  addPartialProject(part) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      var q0 = "INSERT DATA {\n        <".concat(_this4.accessPoint, "> <").concat(_lbd.default.aggregates, "> <").concat(part, "> .\n        }");
      yield _this4.dataService.sparqlUpdate(_this4.accessPoint, q0);
    })();
  }

  addStakeholder(webId) {
    var _arguments2 = arguments,
        _this5 = this;

    return _asyncToGenerator(function* () {
      var accessRights = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : {
        read: true,
        append: false,
        write: false,
        control: false
      };
      yield _this5.accessService.setResourceAccess(_this5.accessPoint, accessRights, _BaseDefinitions.ResourceType.CONTAINER, webId);
    })();
  }

  delete() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      yield _this6.dataService.deleteContainer(_this6.accessPoint, true);
    })();
  }

  findAllPartialProjects() {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      var projects = yield _this7.queryEngine.query("SELECT ?proj WHERE {<".concat(_this7.accessPoint, "> <").concat(_lbd.default.aggregates, "> ?proj}"), {
        sources: [_this7.accessPoint],
        fetch: _this7.fetch
      }).then(i => i.bindings()).then(i => i.map(r => r.get('?proj').value));
      return projects;
    })();
  }

  findPartialProject(webId) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      var repo = yield _this8.lbdService.getProjectRegistry(webId);
      var partialProjectOfStakeholder = repo + _this8.projectId + '/local/';
      var status = yield _this8.fetch(partialProjectOfStakeholder, {
        method: "HEAD"
      }).then(res => res.status);

      if (status === 200) {
        return partialProjectOfStakeholder;
      } else {
        throw new Error("UNAUTHORIZED: This repository does not exist or you don't have the required access rights");
      }
    })();
  }

  addPartialProjectByStakeholder(webId) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      var partialProjectUrl = yield _this9.findPartialProject(webId);
      yield _this9.addPartialProject(partialProjectUrl);
      return partialProjectUrl;
    })();
  }

  createRegistryContainer(containerName, makePublic, property) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      if (!containerName.endsWith('/')) containerName += "/";
      var containerUrl = _this10.localProject + containerName;
      yield _this10.dataService.createContainer(containerUrl, makePublic);
      var q0 = "INSERT DATA {\n        <".concat(_this10.localProject, "> <").concat(property, "> <").concat(containerUrl, "> .\n      }");
      yield _this10.dataService.sparqlUpdate(_this10.localProject, q0);
    })();
  } /////////////////////////////////////////////////////////
  /////////////////////// DATASETS ////////////////////////
  /////////////////////////////////////////////////////////

  /**
   * 
   * @param makePublic 
   * @param id
   * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
   * @returns 
   */


  addDataset() {
    var _arguments3 = arguments,
        _this11 = this;

    return _asyncToGenerator(function* () {
      var options = _arguments3.length > 0 && _arguments3[0] !== undefined ? _arguments3[0] : {};
      var makePublic = _arguments3.length > 1 && _arguments3[1] !== undefined ? _arguments3[1] : false;
      var id = _arguments3.length > 2 && _arguments3[2] !== undefined ? _arguments3[2] : (0, _uuid.v4)();
      var subject = (0, _jsonldRemote.extract)(_this11.data, _this11.localProject);
      var datasetRegistry = subject[_lbd.default.hasDatasetRegistry][0]["@id"];
      var datasetUrl = datasetRegistry + id + "/";
      var theDataset = new _LbdDataset.default(_this11.fetch, datasetUrl);
      yield theDataset.create(options, makePublic);
      return theDataset;
    })();
  }

  deleteDataset(datasetUrl) {
    var _this12 = this;

    return _asyncToGenerator(function* () {
      if (!datasetUrl.endsWith('/')) datasetUrl += "/";
      var ds = new _LbdDataset.default(_this12.fetch, datasetUrl);
      yield ds.delete();
    })();
  }

  deleteDatasetById(datasetId) {
    var _this13 = this;

    return _asyncToGenerator(function* () {
      var subject = (0, _jsonldRemote.extract)(_this13.data, _this13.localProject);
      var datasetRegistry = subject[_lbd.default.hasDatasetRegistry][0]["@id"];
      var datasetUrl = datasetRegistry + datasetId + "/";
      var ds = new _LbdDataset.default(_this13.fetch, datasetUrl);
      yield ds.delete();
    })();
  } /////////////////////////////////////////////////////////
  ////////////////////// REFERENCES////////////////////////
  /////////////////////////////////////////////////////////
  // get all references related to a specific abstract Concept


  addConcept() {
    var _this14 = this;

    return _asyncToGenerator(function* () {
      var subject = (0, _jsonldRemote.extract)(_this14.data, _this14.localProject);
      var referenceRegistry = subject[_lbd.default.hasReferenceRegistry][0]["@id"];
      var ref = new _LbdConcept.default(_this14.fetch, referenceRegistry);
      yield ref.create();
      return ref;
    })();
  }

  deleteConcept(url) {
    var _this15 = this;

    return _asyncToGenerator(function* () {
      var parts = url.split("/");
      var id = parts.pop();
      var referenceRegistry = parts.join("/");
      console.log('id, referenceRegistry', id, referenceRegistry);
      var ref = new _LbdConcept.default(_this15.fetch, referenceRegistry, id);
      yield ref.delete();
    })();
  } // register an alias for an existing concept


  addAlias() {
    return _asyncToGenerator(function* () {})();
  } // get the abstract Concept related to a dataset/distribution + id


  getConcept() {
    return _asyncToGenerator(function* () {})();
  } /////////////////////////////////////////////////////////
  /////////////////////// QUERY ////////////////////////
  /////////////////////////////////////////////////////////


  queryProject() {// if there is a satellite
    // if there is no satellite

    return _asyncToGenerator(function* () {})();
  }

}

exports.default = LbdProject;
//# sourceMappingURL=LbdProject.js.map