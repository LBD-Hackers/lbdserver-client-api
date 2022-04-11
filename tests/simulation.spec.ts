import { Session } from "@inrupt/solid-client-authn-node";
import * as path from "path";
import { createReadStream, readFileSync } from "fs";
import * as FileAPI from "file-api";
import c from "../configuration";
import { AccessRights } from "../src/helpers/BaseDefinitions";
import {
  getPublicAccess,
  getSolidDatasetWithAcl,
  getAgentAccess,
} from "@inrupt/solid-client";
import { v4 } from "uuid";
import { DCTERMS, LDP, RDF, RDFS, VOID } from "@inrupt/vocab-common-rdf";
import fs from "fs";
import mime from "mime-types";
import LBD from "../src/helpers/vocab/lbds";
import {
  IQueryResultBindings,
  IQueryResultBoolean,
  newEngine,
} from "@comunica/actor-init-sparql";
import { extract } from "../src/helpers/functions";
import {LbdConcept, LbdProject, LbdService, LbdDataset, LbdDistribution} from '../src/index'

const configuration = { ...c };
const projectId = configuration.projectId;
const uploadedDatasets = {}
const uploadedConcepts = {}


beforeAll(() => {
  jest.setTimeout(600000)
});

for (const [index, stakeholder] of configuration.stakeholders.entries()) {
  var session = new Session();
  const me = stakeholder.webId;
  let lbd;
  let project;

  describe("Preparation: configure stakeholder pods to run LBDserver projects", () => {
    test(`${me} can log in`, async () => {
      await session.login(stakeholder.credentials);
      lbd = new LbdService(session);
      expect(session.info.isLoggedIn).toBe(true);
    });

    test(`Can create public LBD project Repository for ${me}`, async () => {
      const url = me.replace("/profile/card#me", "/lbd/");
      const lbdRes = await lbd.createProjectRegistry();
      const dataset = await getSolidDatasetWithAcl(url, {
        fetch: session.fetch,
      });

      //check public access
      const publicAccess = await getPublicAccess(dataset);

      //check private access
      const privateAccess = await getAgentAccess(dataset, me);

      expect(lbdRes).toBe(url);
      expect(publicAccess).toMatchObject({
        read: true,
        append: false,
        write: false,
        control: false,
      });
      expect(privateAccess).toMatchObject({
        read: true,
        append: true,
        write: true,
        control: true,
      });
    });

    test(`Can use Pod of ${me} as LBD project repository`, async () => {
      const lbdRes = await lbd.validateWebId(me);
      expect(lbdRes).toBe(true);
    });

    test(`Can find the LBD project registry of ${me}`, async () => {
      const lbdRes = await lbd.getProjectRegistry(me);
      expect(typeof lbdRes).toBe("string");
    });
  });

  describe("Can create project", () => {
    test(`can create Project in LBD project registry of ${me}`, async () => {
      const repo = await lbd.getProjectRegistry(me);
      project = new LbdProject(session, repo + projectId);
      await project.create(undefined, undefined, true);
      const status = await session
        .fetch(project.accessPoint, { method: "HEAD" })
        .then((res) => res.status);
      expect(status).toBe(200);
    });

    test(`Can give other stakeholders access to aggregator and partial project in Pod of ${me}`, async () => {
      const repo = await lbd.getProjectRegistry(me);
      const aggregatorUrl = repo + projectId + "/";

      const accessRights = {
        read: true,
        append: false,
        write: false,
        control: false,
      };

      for (const stakeholder of configuration.stakeholders) {
        if (stakeholder.webId != me) {
          await project.addStakeholder(stakeholder.webId, accessRights);
          const dataset = await getSolidDatasetWithAcl(aggregatorUrl, {
            fetch: session.fetch,
          });
          const access = await getAgentAccess(dataset, stakeholder.webId);
          expect(access).toMatchObject(accessRights);
        }
      }
    });

    test(`can add the partial projects of other stakeholders to the project access point of ${me}`, async () => {
      const added = [];
      for (const stakeholder of configuration.stakeholders) {
        const partialProjectUrl = await project.addPartialProjectByStakeholder(
          stakeholder.webId
        );
        added.push(partialProjectUrl);
      }

      const all = await project.findAllPartialProjects();
      for (const item of added) {
        expect(all.includes(item)).toBe(true);
      }
    });

    test(`can add datasets and distributions to the partial project of ${me}`, async () => {
      for (const [i, file] of stakeholder.data.entries()) {
        const dataset = await project.addDataset(
          file.metadata,
          undefined,
          undefined
        );
        let fileToUpload;
        if (file.path) {
          fileToUpload = fs.readFileSync(file.path);
        }
        const distribution = await dataset.addDistribution(
          fileToUpload,
          file.contentType,
          undefined,
          undefined
        );

        configuration.stakeholders[index].data[i]["dataset"] = dataset.url;
        configuration.stakeholders[index].data[i]["distribution"] =
          distribution.url;

        uploadedDatasets[file.path] = {dataset: dataset.url, distribution: distribution.url}
        expect(dataset.data).not.toBe(undefined);
        expect(distribution.url).not.toBe(undefined);
      }
    });

    test("can create concepts and references", async () => {
      const concepts = {};

      for (const [i, item] of stakeholder.data.entries()) {
        if (item.align) {
          for (const key of Object.keys(item.align)) {
            let concept;
            if (!Object.keys(concepts).includes(key)) {
              concept = await project.addConcept();
              concepts[key] = {};
              concepts[key]["aliases"] = concept.aliases;
              concepts[key]["references"] = [];
            } else {
              concept = new LbdConcept(session, project.getReferenceRegistry());
              await concept.init({
                aliases: concepts[key].aliases,
                references: concepts[key].references,
              });
            }

            for (const ref of item.align[key].identifiers) {
              await concept.addReference(
                ref,
                item["dataset"],
                item["distribution"]
              );
            }

            if (uploadedConcepts[key]) {
              concept.aliases.forEach(alias => {
                uploadedConcepts[key].add(alias)
              })
            } else {
              uploadedConcepts[key] = new Set([...concept.aliases])
            }

          }
        }
      }
      // validation
      // expect(concept.aliases.length > 0).toBe(true)
    });
  });
}

for (const [index, stakeholder] of configuration.stakeholders.entries()) {
  var session = new Session();
  const me = stakeholder.webId;
  let lbd;
  let project;

  describe("Interact with existing projects", () => {
    test(`${me} can log in`, async () => {
      await session.login(stakeholder.credentials);
      lbd = new LbdService(session);
      expect(session.info.isLoggedIn).toBe(true);
    });

    test(`can init existing project`, async () => {
      const repo = await lbd.getProjectRegistry(me);
      project = new LbdProject(session, repo + projectId);
      await project.init()
      expect(project.data).not.toBe(undefined)
    });

    test(`can align concepts`, async () => {
      for (const [i, item] of stakeholder.data.entries()) {
        if (item.align) {
          for (const key of Object.keys(item.align)) {
                // find the concept locally
                const concept = await project.getConceptByIdentifier(item.align[key].identifiers[0], uploadedDatasets[item.path].dataset, uploadedDatasets[item.path].distribution)
                console.log('item.path', item.path)
                console.log('concept.references', concept.references)
                
                for (const alias of uploadedConcepts[key]) {
                  if (!concept.aliases.includes(alias)) {
                    await concept.addAlias(alias, project.getReferenceRegistry())
                  }
                }
                for (const alias of uploadedConcepts[key]) {
                  expect(concept.aliases.includes(alias))
                }
              }
            }
          }
      })
  })
}


describe(`ongoing project tests`, () => {
  const stakeholder = configuration.stakeholders[0]
  var session = new Session();
  const me = stakeholder.webId;
  let lbd;
  let project;

  test(`${me} can log in`, async () => {
    await session.login(stakeholder.credentials);
    lbd = new LbdService(session);
    expect(session.info.isLoggedIn).toBe(true);
  });

  test(`can init existing project`, async () => {
    const repo = await lbd.getProjectRegistry(me);
    project = new LbdProject(session, repo + projectId);
    await project.init()
    expect(project.data).not.toBe(undefined)
  });


  test('can get concept', async () => {
    const theConcept = await project.getConcept("http://localhost:5000/office2/lbd/test/local/references/data#fc8f6a6c-b3a8-4679-af1c-91c6ad906e1d")
    console.log('theConcept', theConcept)
  })

  // test("can query the project", async () => {
  //   const sources = []
  //   configuration.stakeholders.forEach(st => {
  //     st.data.forEach(data => {
  //       if (data.contentType === "text/turtle") {
  //         sources.push(uploadedDatasets[data.path].distribution)
  //       }
  //     })
  //   })

  //   const p = `
  //   prefix beo: <https://pi.pauwel.be/voc/buildingelement#>
  //   prefix dot: <https://w3id.org/dot#>
  //   prefix props: <http://example.org/props/>
  //   `
  
  //   const q = p + `SELECT ?element WHERE {?element dot:hasDamage ?dam ; a beo:Wall . }`

  //   const results = await project.directQuery(q, sources)

  //   expect(results.results.bindings.length > 0).toBe(true)
  // })
})