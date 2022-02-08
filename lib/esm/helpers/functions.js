"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extract = extract;

function extract(jsonld, uri) {
  return Object.assign({}, ...jsonld.filter(i => i["@id"] === uri));
}
//# sourceMappingURL=functions.js.map