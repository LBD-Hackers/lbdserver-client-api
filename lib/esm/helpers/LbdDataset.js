"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accessService = _interopRequireDefault(require("./access-service"));

var _dataService = _interopRequireDefault(require("./data-service"));

var _LbdService = _interopRequireDefault(require("./LbdService"));

var _functions = require("./functions");

var _uuid = require("uuid");

var _vocabCommonRdf = require("@inrupt/vocab-common-rdf");

var _LbdDistribution = _interopRequireDefault(require("./LbdDistribution"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LbdDataset {
  constructor(session, url) {
    this.session = session;
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

  async init() {
    this.data = await this.fetch(this.url, {
      headers: {
        "Accept": "application/ld+json"
      }
    }).then(i => i.json());
    this.distributions = await this.getDistributions();
  }
  /**
   * 
   * @param makePublic 
   * @param id
   * @param options Optional - Object containing metadata about the dataset to be created. e.g: {[RDFS.label]: "theLabel"}
   * @returns 
   */


  async create(options = {}, makePublic) {
    const datasetUrl = this.url;
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

    let q = `INSERT DATA {<${datasetUrl}> a <${_vocabCommonRdf.DCAT.Dataset}> ; <${_vocabCommonRdf.DCTERMS.creator}> <${this.session.info.webId}>. }`;
    await this.dataService.sparqlUpdate(datasetUrl, q);

    if (Object.keys(options).length > 0) {
      let q0 = `INSERT DATA { `;

      for (const key of Object.keys(options)) {
        q0 += `<${datasetUrl}> <${key}> "${options[key]}" .`;
      }

      q0 += "}";
      await this.dataService.sparqlUpdate(datasetUrl, q0);
    }

    await this.init();
  }

  async delete() {
    await this.dataService.deleteContainer(this.url, true);
    return;
  }

  async update(query) {
    await this.dataService.sparqlUpdate(this.url, query);
  } /////////////////////////////////////////////////////////
  //////////////////// DISTRIBUTIONS///////////////////////
  /////////////////////////////////////////////////////////


  async addDistribution(distribution, mimetype, options = {}, distributionId = (0, _uuid.v4)(), makePublic = false) {
    const dist = new _LbdDistribution.default(this.session, this, distributionId);
    await dist.create(distribution, {}, mimetype, makePublic);
    return dist;
  }

  getDistributions() {
    const dataset = (0, _functions.extract)(this.data, this.url);

    if (dataset[_vocabCommonRdf.DCAT.distribution]) {
      const distributionUrls = dataset[_vocabCommonRdf.DCAT.distribution].map(i => i["@id"]);

      const distributions = [];

      for (const url of distributionUrls) {
        const id = url.split('/')[url.split('/').length - 1];
        const dist = new _LbdDistribution.default(this.session, this, id);
        distributions.push(dist);
      }

      return distributions;
    } else return [];
  }

  async deleteDistribution(distributionId) {}

}

exports.default = LbdDataset;
//# sourceMappingURL=LbdDataset.js.map