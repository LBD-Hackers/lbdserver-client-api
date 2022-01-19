"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResourceType = exports.Mimetype = exports.AccessRights = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AccessRights = /*#__PURE__*/_createClass(function AccessRights() {
  _classCallCheck(this, AccessRights);

  _defineProperty(this, "read", false);

  _defineProperty(this, "append", false);

  _defineProperty(this, "write", false);

  _defineProperty(this, "control", false);
});

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