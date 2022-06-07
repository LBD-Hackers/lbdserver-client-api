"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LbdDistribution = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _LbdService = require("./LbdService");

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _mimeTypes = _interopRequireDefault(require("mime-types"));

var _querySparql = require("@comunica/query-sparql");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LbdDistribution {
  /**
   * 
   * @param session an (authenticated) Solid session
   * @param dataset the LbdDataset to which this distribution belongs
   * @param id (optional) identifier of the distribution (default: GUID)
   */
  constructor(session, dataset, id = (0, _uuid.v4)()) {
    this.dataset = dataset;
    this.session = session;
    this.fetch = session.fetch;
    this.url = dataset.url + id;
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
    this.lbdService = new _LbdService.LbdService(session);
  }
  /**
   * Check the existence of this distribution
   */


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
  /**
   * @description Get the distribution's content
   * @param options Fetch options
   */


  async get(options = {}) {
    this.data = await this.fetch(this.url, options);
  }
  /**
   * @description Get the content type of the distribution
   * @returns contenttype of the distribution
   */


  async getContentType(queryEngine = new _querySparql.QueryEngine()) {
    if (this.contentType) return this.contentType;else {
      const q = `select ?ct where {<${this.url}> <${_vocabCommonRdf.DCAT.mediaType}> ?ct}`;
      const res = await queryEngine.queryBindings(q, {
        sources: [this.url],
        fetch: this.fetch
      }).then(i => i.toArray()).then(i => {
        return i.map(item => {
          const ct = item.get('ct').value;
          return ct;
        });
      });

      if (res.length > 0) {
        this.contentType = res[0];
        return this.contentType;
      } else {
        return;
      }
    }
  }
  /**
   * @description Update the metadata of the distribution (i.e. its dataset) with a SPARQL query
   * @param query the SPARQL update
   */


  async updateMetadata(query) {
    await this.dataService.sparqlUpdate(this.dataset.url, query);
  }
  /**
   * @description Add a new dcat:accessURL to the distribution
   * @param accessUrl Access URL of the distribution (e.g. for a satellite service)
   */


  async addAccessUrl(accessUrl) {
    const q0 = `INSERT DATA {<${this.url}> <${_vocabCommonRdf.DCAT.accessURL}> <${accessUrl}>}`;
    await this.updateMetadata(q0);
  }
  /**
   * @description Create this distribution on a Pod
   * @param file The file/content of the distribution
   * @param options Additional metadata to add to the distribution. form:  {[predicate]: value}
   * @param mimetype optional: the content type of the distribution. If not provided, it will be guessed. If the guess fails, the content type will be text/plain
   * @param makePublic access rights
   */


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
            <${_vocabCommonRdf.DCAT.mediaType}> <https://www.iana.org/assignments/media-types/${mimetype}> ;
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
  /**
   * Delete this distribution
   */


  async delete() {
    const myEngine = new _querySparql.QueryEngine();
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

exports.LbdDistribution = LbdDistribution;
//# sourceMappingURL=LbdDistribution.js.map