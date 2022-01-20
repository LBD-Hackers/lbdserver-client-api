"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _solidClient = require("@inrupt/solid-client");

var _BaseDefinitions = require("./BaseDefinitions");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AccessService {
  constructor(fetch) {
    var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _defineProperty(this, "verbose", false);

    this.fetch = fetch;
    this.verbose = verbose;
  } // Make a resource public


  makePublic(resourceURL) {
    var _this = this;

    return _asyncToGenerator(function* () {
      // I would by default not grant the public appending rights...
      var accessRights = {
        read: true,
        append: false,
        write: false,
        control: false
      };
      return _this.setResourceAccess(resourceURL, accessRights, _BaseDefinitions.ResourceType.CONTAINER);
    })();
  }

  makeFilePublic(resourceURL) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var accessRights = {
        read: true,
        append: true,
        write: false,
        control: false
      };
      return _this2.setResourceAccess(resourceURL, accessRights, _BaseDefinitions.ResourceType.FILE);
    })();
  }

  setResourceAccess(resourceURL, accessRights, type, userWebID) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      // Get resource with ACL
      var resourceWithAcl;

      if (type == _BaseDefinitions.ResourceType.DATASET || type == _BaseDefinitions.ResourceType.CONTAINER) {
        resourceWithAcl = yield (0, _solidClient.getSolidDatasetWithAcl)(resourceURL, {
          fetch: _this3.fetch
        });
      }

      if (type == _BaseDefinitions.ResourceType.FILE) {
        resourceWithAcl = yield (0, _solidClient.getFileWithAcl)(resourceURL, {
          fetch: _this3.fetch
        });
      } // Get resource ACL


      var resourceAcl = yield _this3.getResourceAcl(resourceWithAcl); // Update ACL access

      var updatedAcl; // If no user webID provided, set the public access

      if (!userWebID || userWebID == undefined) {
        updatedAcl = (0, _solidClient.setPublicResourceAccess)(resourceAcl, accessRights);
      } // If user webID provided, set the access for that particular user
      else {
        updatedAcl = (0, _solidClient.setAgentResourceAccess)(resourceAcl, userWebID, accessRights);
      } // Save ACL


      var newAccess = yield (0, _solidClient.saveAclFor)(resourceWithAcl, updatedAcl, {
        fetch: _this3.fetch
      });
      _this3.verbose && _this3.logAccessInfo(accessRights, resourceURL);
      return newAccess;
    })();
  } // Obtain the SolidDataset's own ACL, if available,
  // or initialise a new one, if possible:


  getResourceAcl(datasetWithAcl) {
    return _asyncToGenerator(function* () {
      var resourceAcl;

      if (!(0, _solidClient.hasResourceAcl)(datasetWithAcl)) {
        if (!(0, _solidClient.hasAccessibleAcl)(datasetWithAcl)) {
          throw new Error("The current user does not have permission to change access rights to this Resource.");
        }

        if (!(0, _solidClient.hasFallbackAcl)(datasetWithAcl)) {
          throw new Error("The current user does not have permission to see who currently has access to this Resource."); // Alternatively, initialise a new empty ACL as follows,
          // but be aware that if you do not give someone Control access,
          // **nobody will ever be able to change Access permissions in the future**:
          // resourceAcl = createAcl(myDatasetWithAcl);
        }

        resourceAcl = (0, _solidClient.createAclFromFallbackAcl)(datasetWithAcl);
      } else {
        resourceAcl = (0, _solidClient.getResourceAcl)(datasetWithAcl);
      }

      return resourceAcl;
    })();
  }

  logAccessInfo(access, resource) {
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

}

exports.default = AccessService;
//# sourceMappingURL=access-service.js.map