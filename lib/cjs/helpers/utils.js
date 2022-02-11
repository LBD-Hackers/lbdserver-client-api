"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeChecksumMd5 = computeChecksumMd5;
exports.getQueryResult = getQueryResult;
exports.parseStream = parseStream;

var SparkMD5 = _interopRequireWildcard(require("spark-md5"));

var _actorInitSparql = require("@comunica/actor-init-sparql");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function computeChecksumMd5(file) {
  return new Promise(function (resolve, reject) {
    var chunkSize = 5242880; // Read in chunks of 5MB

    var spark = new SparkMD5.ArrayBuffer();
    var fileReader = new FileReader();
    var cursor = 0; // current cursor in file

    fileReader.onerror = function () {
      reject('MD5 computation failed - error reading the file');
    }; // read chunk starting at `cursor` into memory


    function processChunk(chunk_start) {
      var chunk_end = Math.min(file.size, chunk_start + chunkSize);
      fileReader.readAsArrayBuffer(file.slice(chunk_start, chunk_end));
    } // when it's available in memory, process it
    // If using TS >= 3.6, you can use `FileReaderProgressEvent` type instead 
    // of `any` for `e` variable, otherwise stick with `any`
    // See https://github.com/Microsoft/TypeScript/issues/25510


    fileReader.onload = function (e) {
      spark.append(e.target.result); // Accumulate chunk to md5 computation

      cursor += chunkSize; // Move past this chunk

      if (cursor < file.size) {
        // Enqueue next chunk to be accumulated
        processChunk(cursor);
      } else {
        // Computation ended, last chunk has been processed. Return as Promise value.
        // This returns the base64 encoded md5 hash, which is what
        // Rails ActiveStorage or cloud services expect
        // resolve(btoa(spark.end(true)));
        // If you prefer the hexdigest form (looking like
        // '7cf530335b8547945f1a48880bc421b2'), replace the above line with:
        resolve(spark.end());
      }
    };

    processChunk(0);
  });
}

function parseStream(stream) {
  var chunks = [];
  return new Promise(function (resolve, reject) {
    stream.on("data", function (chunk) {
      return chunks.push(Buffer.from(chunk));
    });
    stream.on("error", function (err) {
      return reject(err);
    });
    stream.on("end", function () {
      resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    });
  });
}

function getQueryResult(_x, _x2, _x3) {
  return _getQueryResult.apply(this, arguments);
}

function _getQueryResult() {
  _getQueryResult = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(source, property, fetch) {
    var single,
        myEngine,
        q,
        bindings,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            single = _args.length > 3 && _args[3] !== undefined ? _args[3] : false;
            myEngine = (0, _actorInitSparql.newEngine)();
            q = "SELECT ?res WHERE {<".concat(source, "> <").concat(property, "> ?res}");
            _context.next = 5;
            return myEngine.query(q, {
              sources: [source],
              fetch: fetch
            }).then(function (i) {
              return i.bindings();
            });

          case 5:
            bindings = _context.sent;

            if (!single) {
              _context.next = 10;
              break;
            }

            return _context.abrupt("return", bindings[0].get("?res").value);

          case 10:
            return _context.abrupt("return", bindings.map(function (i) {
              return i.get("?res").value;
            }));

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getQueryResult.apply(this, arguments);
}
//# sourceMappingURL=utils.js.map