"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeChecksumMd5 = computeChecksumMd5;

var SparkMD5 = _interopRequireWildcard(require("spark-md5"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
//# sourceMappingURL=utils.js.map