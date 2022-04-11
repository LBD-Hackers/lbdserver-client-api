import { v4 } from "uuid";
import { RDFS } from "@inrupt/vocab-common-rdf";
const configuration = {
  // projectId: v4(),
  projectId: 'dc',
  stakeholders: [
    {
      webId: "http://localhost:5000/office1/profile/card#me",
      credentials: {
        "refreshToken" : "GCY0oGj0aQHLtejvvUrEJgWurDmhGICSph63IscbmIG",
        "clientId"     : "rtQTA7SkEBu80vpkU_E51",
        "clientSecret" : "siQFHretXRRcM8CMCS99Wko2MGtzHWNH3T-UNYX8onQ8IFahDyK1PNsdREw1s71cjA90OjotQyNb9hIkmVjVTg",
        "oidcIssuer"   : "http://localhost:5000/",
      },
      data: [
        {
          path: "./tests/artifacts/chairCAAD.gltf",
          metadata: {
            [RDFS.label]: "geometry",
            [RDFS.comment]: "This is the geometry of the DC chair sample project",
          },
          contentType: "model/gltf+json",
          extract: "gltf",
          autoAlignmentId: "3154d809-e329-416a-9fce-d0b9415fa4c2",
          align: {
            "0ac53fb9-babd-4a7c-a2fa-c8cd698d70ff": {
              identifiers: ["2O2Fr$t4X7Zf8NOew3FLKI"],
            },
          },
        },
        // {
        //   path: "./tests/artifacts/damages.ttl",
        //   metadata: {
        //     [RDFS.label]: "damage",
        //     [RDFS.comment]: "These are documented damage descriptions"
        //   },
        //   extract: "subject-object",
        //   contentType: "text/turtle",
        //   align: {
        //     "0ac53fb9-babd-4a7c-a2fa-c8cd698d70ff": {identifiers: ["http://localhost:5000/office1/damages#wall123"]}
        //   }
        // },
        // {
        //   path: "/home/jmauwerb/projects/consolid-official/lbdserver-api/tests/artifacts/crack.jpg",
        //   metadata: {
        //     [RDFS.label]: "damage",
        //     [RDFS.comment]: "a picture of the damage to a wall! :o "
        //   },
        //   contentType: "text/turtle",
        //   align: {
        //    "7593d71f-f654-4967-8963-7e11e0325c4f": {x: 0.2, y: 0.2, w: 0.6, d: 0.5}
        //   }
        // }
      ],
    },

    {
      webId: "http://localhost:5000/office2/profile/card#me",
      credentials: {
        "refreshToken" : "096O9hEg-1eNtepl592OBpol9zWL1YIfZxAf8bAcdjO",
        "clientId"     : "45TsowT-QWAr09MMIp2vE",
        "clientSecret" : "zgII_aY-osJ_5FnItzgiSvWr7XVo9jzYf2g8u0cty3_bzBNUeRFTiYwwaNXv5U31Aqf489xZCygyHmu_PI8haw",
        "oidcIssuer"   : "http://localhost:5000/",
      },
      data: [
        {
          path: "./tests/artifacts/chairCAAD.ttl",
          metadata: {
            [RDFS.label]: "semantics",
            [RDFS.comment]: "These are the semantics of the DC chair sample project",
          },
          contentType: "text/turtle",
          extract: "ifc-lbd",
          autoAlignmentId: "3154d809-e329-416a-9fce-d0b9415fa4c2",
          align: {
            "0ac53fb9-babd-4a7c-a2fa-c8cd698d70ff": {
              identifiers: [
                "http://consolidproject.org/models/duplex/wall_9808fd7f-dc48-478e-9217-628e833d5512",
              ],
            },
          },
        },
        // {
        //   path: "./tests/artifacts/properties.ttl",
        //   metadata: {
        //     [RDFS.label]: "thermal properties",
        //     [RDFS.comment]: "The thermal semantics of the project",
        //   },
        //   contentType: "text/turtle",
        //   extract: "subject-object",
        //   align: {
        //     "0ac53fb9-babd-4a7c-a2fa-c8cd698d70ff": {
        //       identifiers: [
        //         "http://localhost:5000/office2/instances#wallInstance1",
        //       ],
        //     },
        //   },
        // },
      ],
    },
  ],
};

export default configuration;
