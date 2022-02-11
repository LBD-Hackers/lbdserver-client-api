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
  constructor(session, url, dataset) {
    this.dataset = dataset;
    this.fetch = session.fetch;
    this.url = url;
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
    this.lbdService = new _LbdService.default(session);
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
    this.data = await this.fetch(this.url, options); // this.contentType = await this.getContentType()
  }

  async getContentType() {
    const myEngine = (0, _actorInitSparql.newEngine)();
    const q0 = `SELECT ?ct where {?id <${_vocabCommonRdf.DCTERMS.format}> ?ct}`;
    const ct = await myEngine.query(q0, {
      sources: [this.dataset.url],
      fetch: this.fetch
    }).then(res => res.bindings());

    if (ct.length > 0) {
      const value = ct[0].get('?ct').value;
      this.contentType = value;
      return value;
    } else {
      throw new Error(`"Could not find contentType in dataset ${this.dataset.url}`);
    }
  }

  async updateMetadata(query) {
    await this.dataService.sparqlUpdate(this.dataset.url, query);
  }

  async addAccessUrl(accessUrl) {
    const q0 = `INSERT DATA {<${this.url}> <${_vocabCommonRdf.DCAT.accessURL}> <${accessUrl}>}`;
    await this.updateMetadata(q0);
  }

  async create(file, options = {}, mimetype, makePublic) {
    if (!mimetype) {
      try {
        mimetype = _mimeTypes.default.lookup(file["name"]);
        if (!mimetype) mimetype = "text/plain";
      } catch (error) {
        mimetype = "text/plain";
      }
    }

    await this.dataService.writeFileToPod(file, this.url, makePublic, mimetype); //workaround to allow inherited access rights

    if (makePublic === undefined) {
      this.dataService.deleteFile(this.url + ".acl");
    }

    const q = `INSERT DATA {
        <${this.dataset.url}> <${_vocabCommonRdf.DCAT.distribution}> <${this.url}> .
        <${this.url}> a <${_vocabCommonRdf.DCAT.Distribution}> ;
            <${_vocabCommonRdf.DCTERMS.format}> <https://www.iana.org/assignments/media-types/${mimetype}> ;
            <${_vocabCommonRdf.DCAT.downloadURL}> <${this.url}> .
      }`;
    await this.dataService.sparqlUpdate(this.dataset.url, q);

    if (Object.keys(options).length > 0) {
      let q0 = `INSERT DATA { `;

      for (const key of Object.keys(options)) {
        q0 += `<${this.dataset.url}> <${key}> "${options[key]}" .`;
      }

      q0 += "}";
      await this.dataService.sparqlUpdate(this.dataset.url, q0);
    }
  }

  async delete() {
    const myEngine = (0, _actorInitSparql.newEngine)();
    await this.dataService.deleteFile(this.url); // also update dataset

    const q0 = `DELETE {
      <${this.url}> ?p ?o .
    } WHERE {
      <${this.url}> ?p ?o .
    }`;
    await myEngine.query(q0, {
      sources: [this.dataset.url],
      fetch: this.fetch
    });
    const q1 = `DELETE {
      ?s ?p <${this.url}> .
    } WHERE {
      ?s ?p <${this.url}> .
    }`;
    await myEngine.query(q1, {
      sources: [this.dataset.url],
      fetch: this.fetch
    });
    return;
  }

}

exports.default = LbdDistribution;
//# sourceMappingURL=LbdDistribution.js.map