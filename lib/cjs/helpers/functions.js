"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extract = extract;
exports.query = query;
exports.streamToString = streamToString;

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var QueryEngine = require('@comunica/query-sparql').QueryEngine;

var N3 = require('n3');

var DataFactory = N3.DataFactory;
var namedNode = DataFactory.namedNode,
    literal = DataFactory.literal,
    defaultGraph = DataFactory.defaultGraph,
    quad = DataFactory.quad,
    variable = DataFactory.variable;

var _require = require("sparqlalgebrajs"),
    translate = _require.translate,
    toSparql = _require.toSparql;

function extract(jsonld, uri) {
  return Object.assign.apply(Object, [{}].concat(_toConsumableArray(jsonld.filter(function (i) {
    return i["@id"] === uri;
  }))));
}

var prefixes = "\nprefix owl: <http://www.w3.org/2002/07/owl#> \nprefix beo: <http://pi.pauwel.be/voc/buildingelement#>\nprefix props: <http://example.org/props#> \nprefix lbds: <https://w3id.org/lbdserver#>\nprefix schema: <http://schema.org/>\n";

function inference(myEngine, _ref) {
  var registries = _ref.registries,
      fetch = _ref.fetch,
      store = _ref.store;
  return new Promise( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
      var q, quadStream;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              q = prefixes + "\n      CONSTRUCT {\n       ?s1 owl:sameAs ?s2 .\n       ?s2 owl:sameAs ?s1 .\n      } WHERE {\n          ?concept1 lbds:hasReference/lbds:hasIdentifier/<http://schema.org/value> ?s1 .\n          ?concept2 lbds:hasReference/lbds:hasIdentifier/<http://schema.org/value> ?s2 .\n          ?concept1 owl:sameAs ?concept2 .\n      }";
              _context.next = 3;
              return myEngine.queryQuads(q, {
                sources: registries,
                fetch: fetch
              });

            case 3:
              quadStream = _context.sent;
              quadStream.on('data', function (res) {
                var subject = res.subject.id.replaceAll('"', '');
                var object = res.object.id.replaceAll('"', '');

                if (subject.startsWith("http") && object.startsWith("http")) {
                  var _q = quad(namedNode(subject), namedNode(res.predicate.value), namedNode(object), defaultGraph());

                  store.addQuad(_q);
                }
              });
              quadStream.on('error', function (err) {
                reject(err);
              });
              quadStream.on('end', function () {
                resolve();
              });

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  }());
}

function streamToString(stream) {
  var chunks = [];
  return new Promise(function (resolve, reject) {
    stream.on('data', function (chunk) {
      return chunks.push(Buffer.from(chunk));
    });
    stream.on('error', function (err) {
      return reject(err);
    });
    stream.on('end', function () {
      return resolve(Buffer.concat(chunks).toString('utf8'));
    });
  });
}

function query(_x3, _x4) {
  return _query.apply(this, arguments);
}

function _query() {
  _query = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(q, options) {
    var sources, fetch, store, registries, asStream, _yield$mutateQuery, query, variables, newQ, myEngine, result, _yield$myEngine$resul, data;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            sources = options.sources, fetch = options.fetch, store = options.store, registries = options.registries, asStream = options.asStream;
            _context2.next = 3;
            return mutateQuery(q);

          case 3:
            _yield$mutateQuery = _context2.sent;
            query = _yield$mutateQuery.query;
            variables = _yield$mutateQuery.variables;
            //   const vars = variables.map((v: any) => v.value)
            console.log('sources', sources);
            console.log('registries', registries);
            console.log('query', query);
            newQ = prefixes + "Select * where {?s1 owl:sameAs ?s2} ";
            myEngine = new QueryEngine();
            if (!store) store = new N3.Store();
            _context2.next = 14;
            return inference(myEngine, {
              registries: registries,
              fetch: fetch,
              store: store
            });

          case 14:
            _context2.next = 16;
            return myEngine.query(query, {
              sources: [].concat(_toConsumableArray(sources), [store]),
              fetch: fetch
            });

          case 16:
            result = _context2.sent;
            _context2.next = 19;
            return myEngine.resultToString(result, 'application/sparql-results+json');

          case 19:
            _yield$myEngine$resul = _context2.sent;
            data = _yield$myEngine$resul.data;

            if (!asStream) {
              _context2.next = 25;
              break;
            }

            return _context2.abrupt("return", data);

          case 25:
            _context2.t0 = JSON;
            _context2.next = 28;
            return streamToString(data);

          case 28:
            _context2.t1 = _context2.sent;
            return _context2.abrupt("return", _context2.t0.parse.call(_context2.t0, _context2.t1));

          case 30:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _query.apply(this, arguments);
}

function findLowerLevel(obj, variables) {
  if (!variables) variables = obj.variables;

  if (obj.type === "bgp") {
    return {
      bgp: obj,
      variables: variables
    };
  } else {
    return findLowerLevel(obj.input, variables);
  }
}

function mutateQuery(_x5) {
  return _mutateQuery.apply(this, arguments);
}

function _mutateQuery() {
  _mutateQuery = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(query) {
    var translation, _findLowerLevel, bgp, variables, usedVariables, aliasNumber, aliases, _iterator, _step, pattern, _i, _Object$keys, item, newVName, newV, q;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            translation = translate(query);
            _findLowerLevel = findLowerLevel(translation, translation.variables), bgp = _findLowerLevel.bgp, variables = _findLowerLevel.variables;
            usedVariables = new Set();
            aliasNumber = 1;
            aliases = {};
            _iterator = _createForOfIteratorHelper(bgp.patterns);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                pattern = _step.value;

                for (_i = 0, _Object$keys = Object.keys(pattern); _i < _Object$keys.length; _i++) {
                  item = _Object$keys[_i];

                  if (pattern[item].termType === "Variable") {
                    if (usedVariables.has(pattern[item])) {
                      newVName = "".concat(pattern[item].value, "_alias").concat(aliasNumber);
                      if (!aliases[pattern[item].value]) aliases[pattern[item].value] = [];
                      aliases[pattern[item].value].push(newVName);
                      aliasNumber += 1;
                      newV = {
                        termType: "Variable",
                        value: newVName
                      };
                      pattern[item] = newV;
                    }

                    usedVariables.add(pattern[item]);
                  }
                }
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            Object.keys(aliases).forEach(function (item) {
              aliases[item].forEach(function (alias) {
                var newPattern = quad(variable(item), namedNode("http://www.w3.org/2002/07/owl#sameAs"), variable(alias), defaultGraph());
                bgp.patterns.push(newPattern);
              });
            });
            q = {
              type: "project",
              input: {
                type: "bgp",
                patterns: bgp.patterns
              },
              variables: Array.from(usedVariables)
            };
            return _context3.abrupt("return", {
              query: toSparql(q),
              variables: Array.from(usedVariables)
            });

          case 10:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _mutateQuery.apply(this, arguments);
}
//# sourceMappingURL=functions.js.map