import configuration from "../configuration";
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
console.log("/n")
console.log('Querying project with ID: ', projectId)

async function run() {
    const session = new Session()
    await session.login(configuration.stakeholders[0].credentials)
    const project = new LbdProject(session, "http://localhost:5000/office2/lbd/test/")
    await project.init()

    const p = `
    prefix beo: <https://pi.pauwel.be/voc/buildingelement#>
    prefix dot: <https://w3id.org/dot#>
    prefix props: <http://example.org/props/>
    prefix bot:   <https://w3id.org/bot#>
    `
    // const query = p + `SELECT ?el1 ?el2 ?uv WHERE {
    //     ?concept <${LBDS.hasReference}>/<${LBDS.hasIdentifier}>/<http://schema.org/value> ?el1 .
    //     ?concept <${LBDS.hasReference}>/<${LBDS.hasIdentifier}>/<http://schema.org/value> ?el2 .
    //     ?el1 dot:hasDamage ?uv .
    //     ?el2 a beo:Wall .
    // }`

    const query = p + `SELECT ?el1 WHERE {
        ?el1 dot:hasDamage ?uv ;
        a beo:Wall .
    }`

    const sources = [
        'http://localhost:5000/office2/lbd/test/local/datasets/34a7eb6d-0454-4d25-827b-ac8d7894bf7b/ee7c8cb5-0de5-48c3-b4fe-0b4b5cff9e9d',
        'http://localhost:5000/office2/lbd/test/local/datasets/7de3a754-560d-4f04-b23f-63e7a4ef0cdf/588b198f-b76d-4a77-9d0e-7f59c2ad6714',
      ]
    const results = await project.directQuery(query, sources)
    console.log('results', JSON.stringify(results, undefined, 4))

}

// autoAlign(["http://localhost:5000/office1/lbd/test/local/datasets/7d07da62-f477-45c7-be5f-f56151276cbb/123456"])

const start = new Date()
console.log('start')
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