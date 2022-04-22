import configuration from "../configuration_duplex";

import { Session } from "@inrupt/solid-client-authn-node";
import { LbdDistribution, LbdProject, LbdService, LbdConcept, LbdDataset, LBDS } from "../src";
import * as fs from 'fs'
import { determineLBDpropsLevel } from "./util/functions";
import * as path from 'path'
import {v4} from 'uuid'
import {lbdReferences, subjectObjectReferences, glTFReferences} from './util/alignments'
import { QueryEngine } from "@comunica/query-sparql";
import { OWL } from "@inrupt/vocab-common-rdf";

const projectId = configuration.projectId
console.log("\n")
console.log('Creating project with ID: ', projectId)
console.log("\n")

async function initialize(credentials) {
        // log in
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
        const myProject = new LbdProject(session, projectRegistry + projectId)

        // OVERWRITE THE PROJECT IF EXISTING!
        const exists = await myProject.checkExistence()
        if (exists) {
            await myProject.delete()
        }

        await myProject.create(undefined, undefined, true)

        const accessRights = {
            read: true,
            append: false,
            write: false,
            control: false,
        };
    
        for (const st of configuration.stakeholders) {
            if (st.webId != session.info.webId) {
                await myProject.addStakeholder(st.webId, accessRights);
            }
        }

        
        return myProject
}

async function createIdentifiers(distribution: LbdDistribution, project: LbdProject, extractionType: string) {
    let identifiers
    switch (extractionType) {
        case "ifc-lbd":
            distributions.push(distribution.url)
            await lbdReferences(distribution, project)
            break;
        case "subject-object":
            distributions.push(distribution.url)
            await subjectObjectReferences(distribution, project)
            break;
        case "gltf":
            await glTFReferences(distribution, project)
            break;
        default:
            break;
    }
}

async function findTuples(mainTtlDist: LbdDistribution) {

    const myEngine = new QueryEngine()

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

        // let q
        // if (referenceRegistryGlTF === referenceRegistryTtl) { // lbd and gltf resources are in the same Pod

        // } else { // lbd and gltf resources are not in the same Pod

            // bulk alias adding
            if (ttlConcept && glTFConcept) {
                for (const ttlAlias of ttlConcept.aliases) {
                    for (const gltfAlias of glTFConcept.aliases) {
                        q_ttl += `<${ttlAlias}> <${OWL.sameAs}> <${gltfAlias}> . \n`
                        q_gltf += `<${gltfAlias}> <${OWL.sameAs}> <${ttlAlias}> . \n`
                    }
                }
            }

            // for (const al of lbdConcept.aliases) {
            //     glTFConcept.addAlias(al)
            // }
            
        // }
        // find concept in lbdReferenceRegistry
        // find concept in 
    }
    q_ttl += `}`
    q_gltf += `}`
    await ttlProject.dataService.sparqlUpdate(referenceRegistryTtl, q_ttl)
    await glTFProject.dataService.sparqlUpdate(referenceRegistryGlTF, q_gltf)
    console.log('done')
    // cleanup if in same registry?

    // const q1 = `SELECT ?identifier WHERE {
    //     ?reference <${LBDS.inDataset}> <${ttlDataset.url}> ;
    //     <${LBDS.hasIdentifier}>/<https://w3id.org/lbdserver#value> ?identifier .
    // }`
    // const bindingsStream = await myEngine.query(q1, {sources: [referenceRegistryTtl], fetch: ttlProject.fetch})
    // bindingsStream.on('data', (binding) => {
    //     const id = binding.get('identifier').value

    //     // an identifier has been found in the reference registry
    //     const 
    // });


    // const myEngine = new QueryEngine()
    // const referenceRegistry = project.getReferenceRegistry() + 'data'
    // const q1 = `SELECT ?identifier WHERE {
    //     ?reference <${LBDS.inDataset}> <${ttlDataset}> ;
    //     <${LBDS.hasIdentifier}>/<https://w3id.org/lbdserver#value> ?identifier .
    // }`
    // const results = await myEngine.query(q1, {sources: [referenceRegistry], fetch: project.fetch})

    // const ttlProject = ttl

    // const projects = distributions.map(item => {
    //     const split = item.split("/")
    //     split.length = 6
    //     return split.join("/") + "/"
    // }

    // find referenced elements in lbd project distribution

    // for each referenced element, find its original IFC id => this is the main align function: separate here

    // once the ID tuplets have been found, find their concept by identifier and add the other one as an alias
}

const distributions = []
async function run() {
    const datasetsToAlign = {}

    const partialProjects: {partial: LbdProject, stakeholder: any}[] = []

    // initialize all the partial projects
    for (const stakeholder of configuration.stakeholders) {
        const partial = await initialize(stakeholder.credentials)
        partialProjects.push({partial, stakeholder})
    }

    for (const project of partialProjects) {
        // add the partial projects to each project's access point
        for (const item of partialProjects) {
            if (project.partial.localProject !== item.partial.localProject) {
                await item.partial.addPartialProject(project.partial.localProject)
            }
        }

        // add the datasets per project
        for (const file of project.stakeholder.data) {
            console.log(`adding file ${file.path} as dataset to partial project of ${project.partial.session.info.webId}`)
            const dataset = await project.partial.addDataset(
              file.metadata,
              undefined,
              undefined
            );
            let fileToUpload;
            if (file.path) {
              fileToUpload = fs.readFileSync(path.resolve(file.path));
            }

            console.log('adding distribution...')
            const distribution = await dataset.addDistribution(
              fileToUpload,
              file.contentType,
              undefined,
              undefined
            );

            console.log('creating identifiers...')
            await createIdentifiers(distribution, project.partial, file.extract)
            if (file.autoAlignmentId) {
                if (datasetsToAlign[file.autoAlignmentId]) {
                    datasetsToAlign[file.autoAlignmentId][file.extract] = dataset
                } else {
                    datasetsToAlign[file.autoAlignmentId] = {[file.extract]: dataset}
                }
            }
          }
    }

    //alignments
    for (const group of Object.keys(datasetsToAlign)) {
        console.log('aligning group', group)
        await autoAlignLbdAndGltf(datasetsToAlign[group]["ifc-lbd"], datasetsToAlign[group]["gltf"])
    }
}


const start = new Date()
run()
    .then(() => {
        const end = new Date()
        const duration = end.getTime() - start.getTime()
        console.log('distributions', distributions)
        console.log('duration', duration)
        process.exit(0)
    })
    .catch(err => {
        console.log('err', err)
        process.exit(1)
    })