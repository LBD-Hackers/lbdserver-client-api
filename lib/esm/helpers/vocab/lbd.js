"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const _NAMESPACE = "https://lbdserver.org/vocabulary#";
const PREFIX = "lbd";

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