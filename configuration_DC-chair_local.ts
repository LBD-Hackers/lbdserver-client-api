import { v4 } from "uuid";
import { RDFS } from "@inrupt/vocab-common-rdf";
const configuration = {
  projectId: v4(),
  // projectId: 'dc',
  stakeholders: [
    {
      webId: "http://localhost:5000/dc/profile/card#me",
      // satellite: "https://fuseki.digitaldesigntechniques.be/dc/",
      options: {
        name: "dc_token",
        email: "dc@example.org",
        password: "test123",
        idp: "https://pod.werbrouck.me",
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
        }
      ],
    },

    {
            webId: "https://pod.digitaldesigntechniques.be/bauko/profile/card#me",
      satellite: "https://fuseki.digitaldesigntechniques.be/bauko/",
      options: {
        name: "bauko_token",
        email: "bauko@example.org",
        password: "test123",
        idp: "https://pod.digitaldesigntechniques.be",
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
