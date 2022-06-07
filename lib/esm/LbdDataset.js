"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LbdDataset = void 0;

var _accessService = _interopRequireDefault(require("./helpers/access-service"));

var _dataService = _interopRequireDefault(require("./helpers/data-service"));

var _LbdService = require("./LbdService");

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _LbdDistribution = require("./LbdDistribution");

var _querySparql = require("@comunica/query-sparql");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LbdDataset {
  constructor(session, url) {
    this.session = session;
    this.fetch = session.fetch;
    this.url = url;
    this.accessService = new _accessService.default(session.fetch);
    this.dataService = new _dataService.default(session.fetch);
    this.lbdService = new _LbdService.LbdService(session);
  }
  /**
   * 
   * @returns boolean: this dataset exists or not
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
   * @description create this dataset within the active project
   * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
   * @param makePublic initial access rights for the dataset (boolean)
   */


  async create(options = {}, makePublic) {
    const datasetUrl = this.url;
    const datasetArr = this.url.split('/');
    const datasetId = datasetArr[datasetArr.length - 2];
    const status = await this.fetch(datasetUrl, {
      method: "HEAD"
    }).then(res => res.status);

    if (status !== 200) {
      await this.dataService.createContainer(datasetUrl, makePublic); //workaround to allow inherited access rights

      if (makePublic) {
        let aclDefault = `INSERT {?rule <${_vocabCommonRdf.ACL.default}> <${datasetUrl}>} WHERE {?rule a <${_vocabCommonRdf.ACL.Authorization}> ; <${_vocabCommonRdf.ACL.agentClass}> <${_vocabCommonRdf.FOAF.Agent}>}`;
        await this.dataService.sparqlUpdate(datasetUrl + ".acl", aclDefault);
      }

      if (makePublic === undefined) {
        this.dataService.deleteFile(datasetUrl + ".acl");
      }
    }

    let q = `INSERT DATA {<${datasetUrl}> a <${_vocabCommonRdf.DCAT.Dataset}> ; <${_vocabCommonRdf.DCTERMS.creator}> <${this.session.info.webId}> ; <${_vocabCommonRdf.DCTERMS.identifier}> "${datasetId}". }`;
    await this.dataService.sparqlUpdate(datasetUrl, q);
    datasetArr.pop();
    datasetArr.pop();
    const datasetRegistry = datasetArr.join("/") + "/";
    let q0 = `INSERT DATA {<${datasetRegistry}> <${_vocabCommonRdf.DCAT.dataset}> <${datasetUrl}> . }`;
    await this.dataService.sparqlUpdate(datasetRegistry, q0);

    if (Object.keys(options).length > 0) {
      let q0 = `INSERT DATA { `;

      for (const key of Object.keys(options)) {
        if (Array.isArray(options[key])) {
          options[key].forEach(item => {
            let t;

            if (item.startsWith("http")) {
              t = `<${item}>`;
            } else {
              t = `"${item}"`;
            }

            q0 += `<${datasetUrl}> <${key}> ${t} .`;
          });
        } else {
          let t;

          if (options[key].startsWith("http")) {
            t = `<${options[key]}>`;
          } else {
            t = `"${options[key]}"`;
          }

          q0 += `<${datasetUrl}> <${key}> ${t} .`;
        }
      }

      q0 += "}";
      await this.dataService.sparqlUpdate(datasetUrl, q0);
    }
  }
  /**
   * @description delete this dataset
   * @returns void
   */


  async delete() {
    await this.dataService.deleteContainer(this.url, true);
    return;
  }
  /**
   * @description Update the dataset with SPARQL (dangerous - watch out!)
   * @param query The SPARQL query with which to update the dataset
   */


  async update(query) {
    await this.dataService.sparqlUpdate(this.url, query);
  } /////////////////////////////////////////////////////////
  //////////////////// DISTRIBUTIONS///////////////////////
  /////////////////////////////////////////////////////////

  /**
   * @description create a distribution for this dataset
   * @param distribution The file to upload as a dump of the dataset
   * @param mimetype The mimetype of the distribution (if omitted it is guessed)
   * @param options options (currently not implemented)
   * @param distributionId the ID of the distribution - normally UUID, but can be overridden
   * @param makePublic initial access rights for the dataset (boolean)
   * @returns the distribution object
   */


  async addDistribution(distribution, mimetype, options = {}, distributionId = (0, _uuid.v4)(), makePublic = false) {
    const dist = new _LbdDistribution.LbdDistribution(this.session, this, distributionId);
    await dist.create(distribution, {}, mimetype, makePublic);
    return dist;
  }
  /**
   * @description get an Array of distribution URLs of this dataset
   * @returns an Array of distribution URLs
   */


  async getDistributions(queryEngine = new _querySparql.QueryEngine()) {
    if (this.distributions) {
      return this.distributions;
    } else {
      const q = `select ?dist where {?ds <${_vocabCommonRdf.DCAT.distribution}> ?dist}`;
      const res = await queryEngine.queryBindings(q, {
        sources: [this.url],
        fetch: this.fetch
      }).then(i => i.toArray()).then(i => {
        return i.map(item => {
          const url = item.get('dist').value;
          const id = url.split('/')[url.split('/').length - 1];
          const dist = new _LbdDistribution.LbdDistribution(this.session, this, id);
          return dist;
        });
      });
      this.distributions = res;
      return res;
    }
  }

}

exports.LbdDataset = LbdDataset;
//# sourceMappingURL=LbdDataset.js.map