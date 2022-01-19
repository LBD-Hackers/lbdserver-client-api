"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _NAMESPACE = "https://lbdserver.org/vocabulary#";
var PREFIX = "lbd";

function _NS(localName) {
  return _NAMESPACE + localName;
}

var LBD = {
  PREFIX: PREFIX,
  NAMESPACE: _NAMESPACE,
  PREFIX_AND_NAMESPACE: _defineProperty({}, PREFIX, _NAMESPACE),
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
exports["default"] = _default;
//# sourceMappingURL=lbd.js.map