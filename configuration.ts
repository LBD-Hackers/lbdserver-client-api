import { v4 } from "uuid";
import { RDFS } from "@inrupt/vocab-common-rdf";
const configuration = {
  projectId: v4(),
  stakeholders: [
    {
      webId: "http://localhost:5000/office1/profile/card#me",
      credentials: {
        refreshToken: "y56UWLl9_OXggFwed6yAVwudWFy28k6MhV7jJ9rff3O",
        clientId: "U71mffVRTl3oogQjoB3PP",
        clientSecret:
          "HNhF7f_AjuE8m79BcLbUZcXp6jkQIWc8wNfN4fF6pCtXaWZhCx4dEUFSQ0r8YxfjF7Lhqcm9ZbBIzb5QPHTVZQ",
        oidcIssuer: "http://localhost:5000/",
      },
      data: [
        {
          path: "/home/jmauwerb/projects/consolid-official/lbdserver-api/tests/artifacts/duplex.gltf",
          metadata: {
            [RDFS.label]: "geometry",
            [RDFS.comment]: "This is the geometry of the duplex project",
          },
          contentType: "model/gltf+json",
          align: {
            "0ac53fb9-babd-4a7c-a2fa-c8cd698d70ff": {
              identifiers: ["2O2Fr$t4X7Zf8NOew3FLKI"],
            },
          },
        },
        {
          path: "/home/jmauwerb/projects/consolid-official/lbdserver-api/tests/artifacts/damages.ttl",
          metadata: {
            [RDFS.label]: "damage",
            [RDFS.comment]: "These are documented damage descriptions"
          },
          contentType: "text/turtle",
          align: {
            "0ac53fb9-babd-4a7c-a2fa-c8cd698d70ff": {identifiers: ["http://localhost:5000/office1/damages#wall123"]}
          }
        },
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
        refreshToken: "ERHrn7sKSvco0OsE1wYP4h6wZv681atan99WVt65bmR",
        clientId: "rEg-qFsP-G87gmS5hOGo1",
        clientSecret:
          "mTEVjp0dNHVUVBComnRz_5srVMo1ClgbwXgkb14gitT6UCX2FNroW-9X4YUfdiCqatV6VSnr_DWJnE0_74e2zQ",
        oidcIssuer: "http://localhost:5000/",
      },
      data: [
        {
          path: "/home/jmauwerb/projects/consolid-official/lbdserver-api/tests/artifacts/duplex.ttl",
          metadata: {
            [RDFS.label]: "semantics",
            [RDFS.comment]: "This is the semantics of the duplex project",
          },
          contentType: "text/turtle",
          align: {
            "0ac53fb9-babd-4a7c-a2fa-c8cd698d70ff": {
              identifiers: [
                "http://consolidproject.org/models/duplex/wall_9808fd7f-dc48-478e-9217-628e833d5512",
              ],
            },
          },
        },
        {
          path: "/home/jmauwerb/projects/consolid-official/lbdserver-api/tests/artifacts/properties.ttl",
          metadata: {
            [RDFS.label]: "thermal properties",
            [RDFS.comment]: "The thermal semantics of the project",
          },
          contentType: "text/turtle",
          align: {
            "0ac53fb9-babd-4a7c-a2fa-c8cd698d70ff": {
              identifiers: [
                "http://localhost:5000/office2/instances#wallInstance1",
              ],
            },
          },
        },
      ],
    },
  ],
};

export default configuration;
