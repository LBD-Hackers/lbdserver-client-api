"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResourceType = exports.Mimetype = exports.AccessRights = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AccessRights {
  constructor() {
    _defineProperty(this, "read", false);

    _defineProperty(this, "append", false);

    _defineProperty(this, "write", false);

    _defineProperty(this, "control", false);
  }

}

exports.AccessRights = AccessRights;
var ResourceType;
exports.ResourceType = ResourceType;

(function (ResourceType) {
  ResourceType["FILE"] = "file";
  ResourceType["DATASET"] = "dataset";
  ResourceType["CONTAINER"] = "container";
})(ResourceType || (exports.ResourceType = ResourceType = {}));

var Mimetype;
exports.Mimetype = Mimetype;

(function (Mimetype) {
  Mimetype["NTriples"] = "application/n-triples";
  Mimetype["Turtle"] = "text/turtle";
  Mimetype["NQuads"] = "application/n-quads";
  Mimetype["Trig"] = "application/trig";
  Mimetype["SPARQLJSON"] = "application/sparql-results+json";
  Mimetype["JSONLD"] = "application/ld+json";
  Mimetype["DLOG"] = "application/x.datalog";
  Mimetype["Text"] = "text/plain";
})(Mimetype || (exports.Mimetype = Mimetype = {}));
//# sourceMappingURL=BaseDefinitions.js.map