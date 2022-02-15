"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const _NAMESPACE = "https://w3id.org/lbdserver#";
const PREFIX = "lbds";

function _NS(localName) {
  return _NAMESPACE + localName;
}

const LBD = {
  PREFIX: PREFIX,
  NAMESPACE: _NAMESPACE,
  PREFIX_AND_NAMESPACE: {
    [PREFIX]: _NAMESPACE
  },
  NS: _NS,
  Aggregator: _NS("Aggregator"),
  Concept: _NS("Concept"),
  StringBasedIdentifier: _NS("StringBasedIdentifier"),
  URIBasedIdentifier: _NS("URIBasedIdentifier"),
  hasReference: _NS("hasReference"),
  inDataset: _NS("inDataset"),
  inDistribution: _NS("inDistribution"),
  hasIdentifier: _NS("hasIdentifier"),
  identifier: _NS("identifier"),
  aggregates: _NS("aggregates"),
  hasProjectRegistry: _NS("hasProjectRegistry"),
  hasDatasetRegistry: _NS("hasDatasetRegistry"),
  hasReferenceRegistry: _NS("hasReferenceRegistry"),
  hasServiceRegistry: _NS("hasServiceRegistry"),
  hasSatellite: _NS("hasSatellite")
};
var _default = LBD;
exports.default = _default;
//# sourceMappingURL=lbd.js.map