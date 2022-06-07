import configuration from "../configuration_DC-chair_local";
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
import { streamToString } from "../src/helpers/functions";
const projectId = "reiffTwin"
console.log("/n")
console.log('Querying project with ID: ', projectId)


async function run() {
  const stakeholder = configuration.stakeholders[0]
  const credentials = stakeholder.options
  const session: any = await generateSession(credentials, stakeholder.webId)
  const project = new LbdProject(session, "https://pod.werbrouck.me/dc/lbd/caadchair/")
  await project.init()
  const queryEngine = new QueryEngine()

  const p = `
  prefix beo: <https://pi.pauwel.be/voc/buildingelement#>
  prefix dot: <https://w3id.org/dot#>
  prefix props: <http://example.org/props/>
  prefix bot:   <https://w3id.org/bot#>
  prefix dcat: <http://www.w3.org/ns/dcat#> 
  `
  const sources: any = await project.getRdfEndpoints(queryEngine)

  const q = p + `SELECT ?value  WHERE {
    <http://www.example.com/lbdconversion/space_877107f3-f288-4429-9cc1-6fc76a80a936> bot:containsElement ?value .
  }`

  const ids = await queryEngine.queryBindings(q, {sources}).then(i => i.toArray()).then(i => i.map(item => {return {identifier: item.get('value').value}}))
  const concepts = await project.getConceptsByIdentifier(ids, {queryEngine})
  console.log('concepts', concepts)
// const filepath = "C:/Users/Administrator/OneDrive - UGent/RWTH/reiffTwin/sorted/1_reiff/1_bildarchiv/1961_erweiterung-umbau-steinbach/Übungsraum_Architektur-und-Städtebau_Curdes[dc.type=image dc.date=1961 dc.subject=Arbeitsraum_Reiff].jpg"

//   const metadata = {
//     [RDFS.label]: "test"
// }

// let identifier = "__test__" + v4()

// const dataset = await project.addDataset(
//     metadata,
//     undefined,
//     identifier
//   );

//   const fileToUpload = fs.readFileSync(filepath);
//   const distribution = await dataset.addDistribution(
//     fileToUpload,
//     "image/jpeg",
//     undefined,
//     undefined
//   );

  // const ct = await project.getDatasetsByContentType(["gltf"])

  // let all: any = []
  // try {
  //   const r = await project.directQuery(q, [], {queryEngine})
  //   const ids = r.map(i => {return {identifier: i.s}})
  //   const concepts = await project.getConceptsByIdentifier(ids, {queryEngine})
  // } catch (error) {
  //   console.log('error', error)
  // }

    

  // all = all.flat()
  // console.log('all', all)
  // const res = await project.directQuery(q, sources, {queryEngine, onlySparqlEndpoints: true})
  // console.log('res', res)
  // const results = await project.queryAll(q2, {queryEngine})
  // console.log('results', results)
  // const w = await queryEngine.queryBindings(q, { sources, fetch: session.fetch }).then(r => r.toArray())
  //     .then(i => i.map(item => {
  //         const distribution = item.get('g').value
  //     let dataset = distribution.split('/')
  //     dataset.pop()
  //     dataset = dataset.join('/') + '/'

  //     return { 
  //         identifier: item.get('el1').value,
  //         distribution,
  //         dataset
  //     } }))

  // // const results = await project.directQuery(query, sources, {queryEngine: qe})

  // const concepts = await project.getConceptsByIdentifier(w, sources, {queryEngine: qe})
  // console.log('concepts', concepts )
  // console.log('concepts', concepts.length )
  // const referenceRegistries = await project.getAllReferenceRegistries(qe)

}

function getResults(query, sources, fetch, queryEngine?: QueryEngine) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await queryEngine.query(query, { sources })
      const { data } = await queryEngine.resultToString(res,
        'application/json');
      const e = await streamToString(data)
      const asJSON = JSON.parse(e)
      resolve(asJSON)
    } catch (error) {
      console.log('error', error)
      resolve([])
    }
  })
}

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