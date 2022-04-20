// import configuration from "../configuration_DC-chair";



import { Session } from "@inrupt/solid-client-authn-node";
import { LbdDistribution, LbdProject, LbdService, LbdConcept, LbdDataset, LBDS } from "../src";
import * as fs from 'fs'
import { determineLBDpropsLevel } from "./util/functions";
import * as path from 'path'
import { v4 } from 'uuid'
import { lbdReferences, subjectObjectReferences, glTFReferences } from './util/alignments'
import { QueryEngine } from "@comunica/query-sparql";
import { OWL, RDFS } from "@inrupt/vocab-common-rdf";

const modelPath = "C:/Users/Administrator/Desktop/blender/CAAD/"
const projectId = "caadchair"
const credentials = {
    "refreshToken": "096O9hEg-1eNtepl592OBpol9zWL1YIfZxAf8bAcdjO",
    "clientId": "45TsowT-QWAr09MMIp2vE",
    "clientSecret": "zgII_aY-osJ_5FnItzgiSvWr7XVo9jzYf2g8u0cty3_bzBNUeRFTiYwwaNXv5U31Aqf489xZCygyHmu_PI8haw",
    "oidcIssuer": "http://localhost:5000/",
}

console.log("\n")
console.log('Creating project with ID: ', projectId)
console.log("\n")

async function run() {
    const session = new Session()
    await session.login(credentials)

    // check if Pod can be used for LBDserver projects
    const myService = new LbdService(session)
    const valid = await myService.validateWebId()

    let projectRegistry
    if (!valid) {
        projectRegistry = await myService.createProjectRegistry()
    } else {
        projectRegistry = await myService.getProjectRegistry()
    }

    // create the project
    const project = new LbdProject(session, projectRegistry + projectId)

    // OVERWRITE THE PROJECT IF EXISTING!
    const exists = await project.checkExistence()
    if (exists) {
        await project.delete()
    }

    await project.create(undefined, undefined, true)

    const files = fs.readdirSync(modelPath)
    for (const file of files) {
        const metadata = {
            [RDFS.label]: file
        }

        const dataset = await project.addDataset(
            metadata,
            undefined,
            undefined
          );
          const p = modelPath + file
          const fileToUpload = fs.readFileSync(path.resolve(p));
          const distribution = await dataset.addDistribution(
            fileToUpload,
            "model/gltf+json",
            undefined,
            undefined
          );
    }
}

const start = new Date()
run()
    .then(() => {
        const end = new Date()
        const duration = end.getTime() - start.getTime()
        console.log('duration', duration)
        process.exit(0)
    })
    .catch(err => {
        console.log('err', err)
        process.exit(1)
    })