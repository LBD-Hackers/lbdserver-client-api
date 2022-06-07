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
import generateSession from "./util/generateSession";

const modelPath = "C:/Users/Administrator/Desktop/blender/CAAD/geometry/"
const graphPath = "C:/Users/Administrator/Documents/code/LBDserver-tools/lbdserver-client-api/tests/artifacts/chairCAAD.ttl"
const projectId = "caadchair"
const myEngine = new QueryEngine()

let session


console.log("\n")
console.log('Creating project with ID: ', projectId)
console.log("\n")

async function run() {

const stakeholder = {
    webId: "https://pod.werbrouck.me/dc/profile/card#me",
    satelliteURL: "https://fuseki.werbrouck.me/dc/",
    options: {
      name: "dc_token",
      email: "dc@example.org",
      password: "test123",
      idp: "https://pod.werbrouck.me",
      clientCredentialsTokenStorageLocation: "C:/Users/Administrator/Documents/code/LBDserver-tools/node-api-test/credentials/dc.json"
    }
}
    const session = await generateSession(stakeholder.options, stakeholder.webId)

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
    await project.addSatellite(stakeholder.satelliteURL, "sparql")
    const ttl = await createGraph(graphPath, project)
    const gltfList = await createSeparateDatasets(project)
    await align(gltfList, ttl, project)
}

async function align(gltfList, mainTtl, project: LbdProject) {
    const session = mainTtl.distribution.session
    const propsLevel = await determineLBDpropsLevel(mainTtl.distribution.url, session)
    for (const item of gltfList) {
        const concept = await project.addConcept()
        let identifier = item.identifier
        
        await concept.addReference(item.identifier, item.dataset.url, item.distribution.url)
        console.log(`added ${item.identifier} to concept with id ${concept.aliases[0]}`)

        let q
        if (propsLevel === 1) {
            q = `PREFIX props: <https://w3id.org/props#> 
            SELECT ?element WHERE {
                ?element props:globalIdIfcRoot_attribute_simple "${identifier}" .
            }`
        } else if (propsLevel === 2) {
            q = `PREFIX props: <https://w3id.org/props#> 
            prefix schema: <http://schema.org/> 
            SELECT ?element WHERE {
             ?element props:globalIdIfcRoot ?thing . ?thing schema:value "${identifier}" .
            }`
        } else if (propsLevel === 3) {
            q = `PREFIX props: <https://w3id.org/props#> 
            prefix schema: <http://schema.org/> 
            SELECT ?element WHERE {
                ?element props:globalIdIfcRoot ?thing . ?thing opm:hasPropertyState ?ps . ?ps schema:value "${identifier}"
                }`
        }

        const results = await myEngine.queryBindings(q, {sources: [mainTtl.distribution.url], fetch: mainTtl.distribution.fetch})
        .then(r => r.toArray())
        .then(res => res.map(item => {return item.get('element').value}))
        
        if (results.length === 0) {
            console.log('could not reference identifier', identifier)
        }

        for (const result of results)  {
            await concept.addReference(result, mainTtl.dataset.url, mainTtl.distribution.url)
            console.log(`added ${result} to concept with id ${concept.aliases[0]}`)
        }
    }
}

async function findTuples(mainTtlDist: LbdDistribution) {
    // quick and dirty
    const propsLevel = await determineLBDpropsLevel(mainTtlDist.url, mainTtlDist.session)
    let q
    if (propsLevel === 1) {
        q = `PREFIX props: <https://w3id.org/props#> 
        SELECT ?element ?identifier WHERE {
            ?element props:globalIdIfcRoot_attribute_simple ?identifier
        }`
    } else {
        q = `PREFIX props: <https://w3id.org/props#> 
        prefix schema: <http://schema.org/> 
        SELECT ?element ?identifier WHERE {
         ?element props:globalIdIfcRoot ?thing . ?thing schema:value ?identifier .
        }`
    }

    const bindingsStream = await myEngine.queryBindings(q, {sources: [mainTtlDist.url], fetch: mainTtlDist.fetch})

    const results = await bindingsStream.toArray()
        .then(res => res.map(item => {return {lbd: item.get('element').value, gltf: item.get('identifier').value}}))

    return results
}

async function autoAlignLbdAndGltf(ttlDataset: LbdDataset, glTFDataset: LbdDataset) {
    // initialize the project where the ttlDistribution resides
    const ttlSplit = ttlDataset.url.split("/")
    ttlSplit.length = 6
    const ttlProjectAccessPoint = ttlSplit.join("/") + "/"
    const ttlProject = new LbdProject(ttlDataset.session, ttlProjectAccessPoint)
    await ttlProject.init()
    const mainTtlDist = ttlDataset.getDistributions()[0]
    const referenceRegistryTtl = ttlProject.getReferenceRegistry() + 'data'    

    // initialize the project where the glTFDistribution resides
    const gltfSplit = glTFDataset.url.split("/")
    gltfSplit.length = 6
    const glTfProjectAccessPoint = gltfSplit.join("/") + "/"
    const glTFProject = new LbdProject(glTFDataset.session, glTfProjectAccessPoint)
    await glTFProject.init()
    const referenceRegistryGlTF = glTFProject.getReferenceRegistry() + 'data'

    const tuples = await findTuples(mainTtlDist)
    let q_ttl = `INSERT DATA {`
    let q_gltf = `INSERT DATA {`
    for (const pair of tuples) {
        const ttlConcept = await ttlProject.getConceptByIdentifier(pair.lbd, ttlDataset.url, undefined)
        const glTFConcept = await ttlProject.getConceptByIdentifier(pair.gltf, glTFDataset.url, undefined)

            if (ttlConcept && glTFConcept) {
                for (const ttlAlias of ttlConcept.aliases) {
                    for (const gltfAlias of glTFConcept.aliases) {
                        q_ttl += `<${ttlAlias}> <${OWL.sameAs}> <${gltfAlias}> . \n`
                        q_gltf += `<${gltfAlias}> <${OWL.sameAs}> <${ttlAlias}> . \n`
                    }
                }
            }
    }
    q_ttl += `}`
    q_gltf += `}`
    await ttlProject.dataService.sparqlUpdate(referenceRegistryTtl, q_ttl)
    await glTFProject.dataService.sparqlUpdate(referenceRegistryGlTF, q_gltf)
    console.log('done')
}

async function createSeparateDatasets(project) {
    const all = []
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
        let identifier = file
        identifier = identifier.replace(".gltf", "")
        all.push({dataset, distribution, identifier})
    }
    return all
}

async function createGraph(file, project) {
    const metadata = {
        [RDFS.label]: "semantics"
    }

    const dataset = await project.addDataset(
        metadata,
        undefined,
        undefined
      );
      const fileToUpload = fs.readFileSync(path.resolve(file));
      const distribution = await dataset.addDistribution(
        fileToUpload,
        "text/turtle",
        undefined,
        undefined
      );

      return {distribution, dataset}
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