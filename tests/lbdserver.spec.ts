import { Consolid } from "../src";
import { Session } from "@inrupt/solid-client-authn-node";
import * as path from "path";
import { ICDDService } from "../src/helpers/icdd-service";
import { createReadStream, readFileSync } from "fs";
import * as FileAPI from "file-api";
import { loginCredentials } from "../credentials";
import LBDService from "../src/helpers/LbdService";
import LbdProject from "../src/helpers/LbdProject";
import { AccessRights } from "../src/helpers/BaseDefinitions";
import {
  getPublicAccess,
  getSolidDatasetWithAcl,
  getAgentAccess,
} from "@inrupt/solid-client";
import {v4} from 'uuid'
import { LDP, RDF, RDFS } from "@inrupt/vocab-common-rdf";
import LbdDataset from "../src/helpers/LbdDataset";
import LbdDistribution from "../src/helpers/LbdDistribution";
import fs from "fs"
import mime from "mime-types"

const testFilePath = path.join(__dirname, "./artifacts/model.gltf");
const mimetype = mime.lookup(testFilePath)
const testBuffer = fs.readFileSync(testFilePath)
// const testFile = new File(["test"], "myFile")

// const testFile = new FileAPI.File({
//     name: "abc-song.txt",   // required
//     type: "text/plain",     // optional
//     buffer: new Buffer("abcdefg,hijklmnop, qrs, tuv, double-u, x, y and z")
// });

// const testFile = new File(["foo"], "foo.txt", {
//     type: "text/plain",
// });

// See readme for how to retrieve this!

let session: Session;
let lbd: LBDService;
let me: string;
let projectId: string = v4()
let theOtherOne: string
let project: LbdProject;
let dataset: LbdDataset;
let distribution: LbdDistribution;

beforeAll(async () => {
  theOtherOne = "http://localhost:5000/arch/profile/card#me"
  // projectId = "8bb70cea-f694-4ce1-ba5b-f92531574ee7"
  session = new Session();
  await session.login(loginCredentials);
  if (!session.info.isLoggedIn)
    console.error(
      "Please get login credentials with npx @inrupt/generate-oidc-token before running tests!"
    );
  lbd = new Consolid.LBDService(session.fetch);
  me = session.info.webId;
});

describe("Auth", () => {
  /////////////////////////////////////////////////////////
  ////////////////////// PREPARATION //////////////////////
  /////////////////////////////////////////////////////////
  test("is loggedin", () => {
    expect(session.info.isLoggedIn).toBe(true);
  });

  test("can create public LBD project Repository in Pod", async () => {
    const url = me.replace("/profile/card#me", "/lbd/");
    const lbdRes = await lbd.createProjectRegistry(me, url, true);
    const dataset = await getSolidDatasetWithAcl(url, { fetch: session.fetch });

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

  test("can use Pod as LBD project repository", async () => {
    const lbdRes = await lbd.validateWebId(me);
    expect(lbdRes).toBe(true);
  });

  test("can find the LBD project registry", async () => {
    const lbdRes = await lbd.getProjectRegistry(me);
    expect(typeof lbdRes).toBe("string");
  });


  /////////////////////////////////////////////////////////
  /////////////////////// PROJECTS ////////////////////////
  /////////////////////////////////////////////////////////
  
  test("can create Project in LBD project registry", async () => {
    const repo = await lbd.getProjectRegistry(me)
    project = new LbdProject(session.fetch, repo + projectId)
    await project.create()
    const status = await session.fetch(project.accessPoint, {method: "HEAD"}).then(res => res.status)
    expect(status).toBe(200)
  });

  test("can give stakeholder access to project", async () => {
    const repo = await lbd.getProjectRegistry(me)
    const projectUrl = repo + projectId + "/"
    await project.addStakeholder(theOtherOne)

    const dataset = await getSolidDatasetWithAcl(projectUrl, { fetch: session.fetch });
    const access = await getAgentAccess(dataset, theOtherOne);
    expect(access).toMatchObject({
        read: true,
        append: false,
        write: false,
        control: false,
      });
  })


  // TO RUN THIS TEST, SET A PROJECT ID YOU KNOW THIS STAKEHOLDER HAS IN THEIR PROJECT REPOSITORY

  // test("can add partial project of stakeholder to project aggregator", async () => {
  //   const repo = await lbd.getProjectRegistry(me)
  //   const projectUrl = repo + projectId + "/"

  //   const project = new LbdProject(session.fetch, repo + projectId)

  //   const partial = await project.addPartialProjectByStakeholder(theOtherOne)
  //   const partials = await project.findAllPartialProjects()
  //   console.log(`partials`, partials)
  //   expect(partials).toContain(partial)
  // })

  /////////////////////////////////////////////////////////
  ///////////// DATASETS & DISTRIBUTIONS///////////////////
  /////////////////////////////////////////////////////////
  test("can add dataset to partial project", async () => {
    dataset = await project.addDataset({[RDFS.label]: "theLabel"}, true)
    expect(dataset.data).not.toBe(undefined);
  })
  
  test("can add distribution to dataset", async () => {
    distribution = await dataset.addDistribution(testBuffer)   
    expect(distribution.data).not.toBe(undefined);
  })

  /////////////////////////////////////////////////////////
  /////////////////////// CLEANUP /////////////////////////
  /////////////////////////////////////////////////////////
  test("can delete distribution", async () => {
    const durl = distribution.url
    const statusBefore = await session.fetch(durl).then(res => res.status)

    await distribution.delete()
    const statusAfter = await session.fetch(durl).then(res => res.status)
    expect(statusBefore).toBe(200)
    expect(statusAfter).toBe(404)
 })

  test('can delete dataset', async() => {
    const durl = dataset.url
    const statusBefore = await session.fetch(durl).then(res => res.status)

    await dataset.delete()
    const statusAfter = await session.fetch(durl).then(res => res.status)
    expect(statusBefore).toBe(200)
    expect(statusAfter).toBe(404)
  })

  test("can delete complete project", async () => {
    const projectUrl = project.accessPoint
    const statusBefore = await session.fetch(projectUrl).then(res => res.status)

    await project.delete()
    const statusAfter = await session.fetch(projectUrl).then(res => res.status)
    expect(statusBefore).toBe(200)
    expect(statusAfter).toBe(404)
  })

  test("can delete LBD project Repository from Pod", async () => {
    const url = me.replace("/profile/card#me", "/lbd/");
    const statusBefore = await session.fetch(url).then(res => res.status)

    const lbdRes = await lbd.removeProjectRegistry(me, url);
    const statusAfter = await session.fetch(url).then(res => res.status)
    expect(statusBefore).toBe(200)
    expect(statusAfter).toBe(404)
  });

});

