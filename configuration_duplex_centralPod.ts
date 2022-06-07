import { v4 } from "uuid";
import { RDFS } from "@inrupt/vocab-common-rdf";
const configuration = {
  projectId: v4(),
  // projectId: 'duplex',
  stakeholders: [
    {
      webId: "http://localhost:1000/profile/card#me",
      satellite: "http://localhost:1002/",
      credentials: {
        "refreshToken" : "cTaluCDV21XEshobHXROrJATthPB534ZRdKMrFNZEK_",
        "clientId"     : "DZr9HMyLLFwWCYL9sKBYY",
        "clientSecret" : "vN22NpcmjquhaXcLhoKN6wIUFEOIzYetw4vUvpBCRV_UQB9p3yJRjsyBpcsv4BGLtn108JXAmOwE4M77B_8TbQ",
        "oidcIssuer"   : "http://localhost:1000/"
      },
      data: [
        {
          path: "./tests/artifacts/duplex.gltf",
          metadata: {
            [RDFS.label]: "geometry",
            [RDFS.comment]: "This is the geometry of the duplex project",
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
        {
          path: "./tests/artifacts/duplex.ttl",
          metadata: {
            [RDFS.label]: "semantics",
            [RDFS.comment]: "This is the semantics of the duplex project",
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
        {
          path: "./tests/artifacts/properties.ttl",
          metadata: {
            [RDFS.label]: "thermal properties",
            [RDFS.comment]: "The thermal semantics of the project",
          },
          contentType: "text/turtle",
          extract: "subject-object",
          align: {
            "0ac53fb9-babd-4a7c-a2fa-c8cd698d70ff": {
              identifiers: [
                "http://localhost:5000/office2/instances#wallInstance1",
              ],
            },
          },
        }
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
    }
  ],
};

export default configuration;
