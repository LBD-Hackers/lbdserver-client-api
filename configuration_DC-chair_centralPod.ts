import { v4 } from "uuid";
import { RDFS } from "@inrupt/vocab-common-rdf";
const configuration = {
  // projectId: v4(),
  projectId: 'dc',
  stakeholders: [
    {
      webId: "http://localhost:1000/profile/card#me",
      satellite: "http://localhost:1002/dc/",
      credentials: {
        "refreshToken" : "nvNxzsWS5LgPqKX1GZjin7yxEo3L8yCoMc2DoMUXtLm",
        "clientId"     : "jj1eqsEt2mNNYYXvAhk2S",
        "clientSecret" : "eSYPNoqgVRnNJOdqc62g4TqfhIkaXxq8UBED7d9Vq5Yr6JmTnDN1GHfKU94aKo20MGZl0aQob80X2KzHoc3jHQ",
        "oidcIssuer"   : "http://localhost:1000/",
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
        }
      ],
    }
  ],
};

export default configuration;
