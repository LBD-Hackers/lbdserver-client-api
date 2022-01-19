"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _solidClient = require("@inrupt/solid-client");

var _BaseDefinitions = require("./BaseDefinitions");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AccessService = /*#__PURE__*/function () {
  function AccessService(fetch) {
    var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, AccessService);

    _defineProperty(this, "verbose", false);

    this.fetch = fetch;
    this.verbose = verbose;
  } // Make a resource public


  _createClass(AccessService, [{
    key: "makePublic",
    value: function () {
      var _makePublic = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resourceURL) {
        var accessRights;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // I would by default not grant the public appending rights...
                accessRights = {
                  read: true,
                  append: false,
                  write: false,
                  control: false
                };
                return _context.abrupt("return", this.setResourceAccess(resourceURL, accessRights, _BaseDefinitions.ResourceType.CONTAINER));

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function makePublic(_x) {
        return _makePublic.apply(this, arguments);
      }

      return makePublic;
    }()
  }, {
    key: "makeFilePublic",
    value: function () {
      var _makeFilePublic = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resourceURL) {
        var accessRights;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                accessRights = {
                  read: true,
                  append: true,
                  write: false,
                  control: false
                };
                return _context2.abrupt("return", this.setResourceAccess(resourceURL, accessRights, _BaseDefinitions.ResourceType.FILE));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function makeFilePublic(_x2) {
        return _makeFilePublic.apply(this, arguments);
      }

      return makeFilePublic;
    }()
  }, {
    key: "setResourceAccess",
    value: function () {
      var _setResourceAccess = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resourceURL, accessRights, type, userWebID) {
        var resourceWithAcl, resourceAcl, updatedAcl, newAccess;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(type == _BaseDefinitions.ResourceType.DATASET || type == _BaseDefinitions.ResourceType.CONTAINER)) {
                  _context3.next = 4;
                  break;
                }

                _context3.next = 3;
                return (0, _solidClient.getSolidDatasetWithAcl)(resourceURL, {
                  fetch: this.fetch
                });

              case 3:
                resourceWithAcl = _context3.sent;

              case 4:
                if (!(type == _BaseDefinitions.ResourceType.FILE)) {
                  _context3.next = 8;
                  break;
                }

                _context3.next = 7;
                return (0, _solidClient.getFileWithAcl)(resourceURL, {
                  fetch: this.fetch
                });

              case 7:
                resourceWithAcl = _context3.sent;

              case 8:
                _context3.next = 10;
                return this.getResourceAcl(resourceWithAcl);

              case 10:
                resourceAcl = _context3.sent;

                // If no user webID provided, set the public access
                if (!userWebID || userWebID == undefined) {
                  updatedAcl = (0, _solidClient.setPublicResourceAccess)(resourceAcl, accessRights);
                } // If user webID provided, set the access for that particular user
                else {
                  updatedAcl = (0, _solidClient.setAgentResourceAccess)(resourceAcl, userWebID, accessRights);
                } // Save ACL


                _context3.next = 14;
                return (0, _solidClient.saveAclFor)(resourceWithAcl, updatedAcl, {
                  fetch: this.fetch
                });

              case 14:
                newAccess = _context3.sent;
                this.verbose && this.logAccessInfo(accessRights, resourceURL);
                return _context3.abrupt("return", newAccess);

              case 17:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function setResourceAccess(_x3, _x4, _x5, _x6) {
        return _setResourceAccess.apply(this, arguments);
      }

      return setResourceAccess;
    }() // Obtain the SolidDataset's own ACL, if available,
    // or initialise a new one, if possible:

  }, {
    key: "getResourceAcl",
    value: function () {
      var _getResourceAcl2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(datasetWithAcl) {
        var resourceAcl;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if ((0, _solidClient.hasResourceAcl)(datasetWithAcl)) {
                  _context4.next = 8;
                  break;
                }

                if ((0, _solidClient.hasAccessibleAcl)(datasetWithAcl)) {
                  _context4.next = 3;
                  break;
                }

                throw new Error("The current user does not have permission to change access rights to this Resource.");

              case 3:
                if ((0, _solidClient.hasFallbackAcl)(datasetWithAcl)) {
                  _context4.next = 5;
                  break;
                }

                throw new Error("The current user does not have permission to see who currently has access to this Resource.");

              case 5:
                resourceAcl = (0, _solidClient.createAclFromFallbackAcl)(datasetWithAcl);
                _context4.next = 9;
                break;

              case 8:
                resourceAcl = (0, _solidClient.getResourceAcl)(datasetWithAcl);

              case 9:
                return _context4.abrupt("return", resourceAcl);

              case 10:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function getResourceAcl(_x7) {
        return _getResourceAcl2.apply(this, arguments);
      }

      return getResourceAcl;
    }()
  }, {
    key: "logAccessInfo",
    value: function logAccessInfo(access, resource) {
      var agent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

      if (access === null) {
        console.log("Could not load access details for this Resource.");
      } else {
        if (!agent) console.log("".concat(agent, "'s Access:: "), JSON.stringify(access));else console.log("Public Access:: ", JSON.stringify(access));
        console.log("...", agent, access.read ? 'CAN' : 'CANNOT', "read the Resource", resource);
        console.log("...", agent, access.append ? 'CAN' : 'CANNOT', "add data to the Resource", resource);
        console.log("...", agent, access.write ? 'CAN' : 'CANNOT', "change data in the Resource", resource);

        if ('controlRead' in access) {
          console.log("...", agent, access.controlRead ? 'CAN' : 'CANNOT', "see access to the Resource", resource);
          console.log("...", agent, access.controlWrite ? 'CAN' : 'CANNOT', "change access to the Resource", resource);
        } else {
          console.log("...", agent, access.control ? 'CAN' : 'CANNOT', "change access to the Resource", resource);
        }
      }
    }
  }]);

  return AccessService;
}();

exports["default"] = AccessService;
//# sourceMappingURL=access-service.js.map