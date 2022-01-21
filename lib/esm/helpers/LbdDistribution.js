"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _mimeTypes = _interopRequireDefault(require("mime-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LbdDistribution {
  // include queryEngine to allow caching of querydata etc.
  constructor(fetch, url) {
    let datasetUrl = url.split('/');
    datasetUrl.pop();
    const ds = datasetUrl.join("/") + '/';
    this.fetch = fetch;
    this.url = url;
    this.datasetUrl = ds;
    this.accessService = new _accessService.default(fetch);
    this.dataService = new _dataService.default(fetch);
    this.lbdService = new _LbdService.default(fetch);
    this.queryEngine = (0, _actorInitSparql.newEngine)();
  }

  async checkExistence() {
    const status = await this.fetch(this.url, {
      method: "HEAD"
    }).then(result => result.status);

    if (status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async init(options = {}) {
    this.data = await this.fetch(this.url, options);
  }

  async updateMetadata(query) {
    await this.dataService.sparqlUpdate(this.datasetUrl, query);
  }

  async addAccessUrl(accessUrl) {
    const q0 = `INSERT DATA {<${this.url}> <${_vocabCommonRdf.DCAT.accessURL}> <${accessUrl}>}`;
    await this.updateMetadata(q0);
  }

  async create(file, options = {}, mimetype, makePublic = false) {
    if (!mimetype) {
      try {
        mimetype = _mimeTypes.default.lookup(file["name"]);
        if (!mimetype) mimetype = "text/plain";
      } catch (error) {
        mimetype = "text/plain";
      }
    }

    await this.dataService.writeFileToPod(file, this.url, makePublic, mimetype);
    const q = `INSERT DATA {
        <${this.datasetUrl}> <${_vocabCommonRdf.DCAT.distribution}> <${this.url}> .
        <${this.url}> a <${_vocabCommonRdf.DCAT.Distribution}> ;
            <${_vocabCommonRdf.DCTERMS.format}> <https://www.iana.org/assignments/media-types/${mimetype}> ;
            <${_vocabCommonRdf.DCAT.downloadURL}> <${this.url}> .
      }`;
    await this.queryEngine.query(q, {
      sources: [this.datasetUrl],
      fetch: this.fetch
    });

    if (Object.keys(options).length > 0) {
      let q0 = `INSERT DATA { `;

      for (const key of Object.keys(options)) {
        q0 += `<${this.datasetUrl}> <${key}> "${options[key]}" .`;
      }

      q0 += "}";
      await this.dataService.sparqlUpdate(this.datasetUrl, q0);
    }
  }

  async delete() {
    await this.dataService.deleteFile(this.url); // also update dataset

    const q0 = `DELETE {
      <${this.url}> ?p ?o .
    } WHERE {
      <${this.url}> ?p ?o .
    }`;
    await this.queryEngine.query(q0, {
      sources: [this.datasetUrl],
      fetch: this.fetch
    });
    const q1 = `DELETE {
      ?s ?p <${this.url}> .
    } WHERE {
      ?s ?p <${this.url}> .
    }`;
    await this.queryEngine.query(q1, {
      sources: [this.datasetUrl],
      fetch: this.fetch
    });
    return;
  }

}

exports.default = LbdDistribution;
//# sourceMappingURL=LbdDistribution.js.map