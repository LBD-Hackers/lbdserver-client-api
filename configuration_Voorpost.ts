import { v4 } from "uuid";
import { RDFS } from "@inrupt/vocab-common-rdf";
const configuration = {
  // projectId: v4(),
  projectId: 'voorpost',
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
          path: "./tests/artifacts/voorpost.gltf",
          metadata: {
            [RDFS.label]: "geometry",
            [RDFS.comment]: "This is the geometry of the Voorpost project",
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
          path: "./tests/artifacts/voorpost.ttl",
          metadata: {
            [RDFS.label]: "semantics",
            [RDFS.comment]: "These are the semantics of the voorpost project",
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
      ],
    }
  ],
};

export default configuration;
