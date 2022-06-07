import { v4 } from "uuid";
import { RDFS } from "@inrupt/vocab-common-rdf";

const configuration = {
  projectId: "igent",
  stakeholders: [
    {
      webId: "https://pod.werbrouck.me/dc/profile/card#me",
      satellite: "https://fuseki.werbrouck.me/dc/",
      options: {
        name: v4(),
        email: "dc@example.org",
        password: "test123",
        idp: "https://pod.werbrouck.me"
      },
      data: [
        {
          path: "./tests/artifacts/iGent.gltf",
          metadata: {
            [RDFS.label]: "geometry",
            [RDFS.comment]: "This is the geometry of the iGent Tower project - architecture",
          },
          contentType: "model/gltf+json",
          extract: "gltf",
          autoAlignmentId: "3154d809-e329-416a-9fce-d0b9415fa4c2"
        },
        {
          path: "./tests/artifacts/iGent.ttl",
          metadata: {
            [RDFS.label]: "geometry",
            [RDFS.comment]: "This is the RDF graph of the iGent Tower project - architecture",
          },
          contentType: "text/turtle",
          extract: "ifc-lbd",
          autoAlignmentId: "3154d809-e329-416a-9fce-d0b9415fa4c2"
        }
      ]
    },
  ],
};

export default configuration;
