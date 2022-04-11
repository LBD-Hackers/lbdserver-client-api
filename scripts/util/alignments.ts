import {v4} from 'uuid'
import { LbdDistribution, LbdProject, LbdService, LbdConcept, LBDS } from "../../src";
import { QueryEngine } from "@comunica/query-sparql";


async function lbdReferences(distribution: LbdDistribution, project: LbdProject): Promise<void> {
    const myEngine = new QueryEngine()
    const query = `prefix bot: <https://w3id.org/bot#> select ?element where { ?element a bot:Element }`;

    const bindingsStream = await myEngine.queryBindings(query, {
        sources: [distribution.url],
        fetch: distribution.fetch,
      })
    const elements = await bindingsStream.toArray().then(results => results.map(item => item.get('element').value))
    await conceptInsertionBulkLD(elements, distribution, project)
    return
}

async function subjectObjectReferences(distribution: LbdDistribution, project: LbdProject): Promise<void> {
const myEngine = new QueryEngine()
const query = `select ?s ?o where { ?s ?p ?o }`;

const bindingsStream = await myEngine.queryBindings(query, {
    sources: [distribution.url],
    fetch: distribution.fetch,
  })
const elements = await bindingsStream.toArray().then(results => results.map(item => [item.get('s').value, item.get('s').value])).then(l => l.flat())
await conceptInsertionBulkLD(elements, distribution, project)
return
}

async function glTFReferences(distribution: LbdDistribution, project: LbdProject):  Promise<void> {
await distribution.get()
const gltfData = await distribution.data.json()
const elements = []
gltfData.nodes.forEach(item => {
    // ONLY IDENTIFIERS LONGER THAN 8 CHARACTERS!
    if (item.name.length > 8) {
        elements.push(item.name)
    }
})
await conceptInsertionBulk(elements, distribution, project)
}

// bulk creation of references
async function conceptInsertionBulk(elements, distribution, project) {
let insertion = `INSERT DATA {`
for (const element of elements) {
    const conceptId = v4()
    const referenceId = v4()
    const identifierId = v4()
    insertion += `
    <#${conceptId}> a <${LBDS.Concept}>; 
        <${LBDS.hasReference}> <#${referenceId}> . 
    <#${referenceId}> <${LBDS.inDataset}> <${distribution.dataset.url}> ;
        <${LBDS.hasIdentifier}> <#${identifierId}> .
    <#${identifierId}> <${LBDS.value}> "${element}" ;
    <${LBDS.inDistribution}> <${distribution.url}> .
    ` ;
}
insertion += '}'

const refreg = project.getReferenceRegistry() + "data"
await project.dataService.sparqlUpdate(refreg, insertion)
}

// bulk creation of references
async function conceptInsertionBulkLD(elements, distribution, project) {
    let insertion = `INSERT DATA {`
    for (const element of elements) {
        const conceptId = v4()
        const referenceId = v4()
        const identifierId = v4()
        insertion += `
        <#${conceptId}> a <${LBDS.Concept}>; 
            <${LBDS.hasReference}> <#${referenceId}> . 
        <#${referenceId}> <${LBDS.inDataset}> <${distribution.dataset.url}> ;
            <${LBDS.hasIdentifier}> <#${identifierId}> .
        <#${identifierId}> <https://w3id.org/lbdserver#value> <${element}> ;
        <${LBDS.inDistribution}> <${distribution.url}> .
        ` ;
    }
    insertion += '}'
    
    const refreg = project.getReferenceRegistry() + "data"
    await project.dataService.sparqlUpdate(refreg, insertion)
    }

export {
    lbdReferences, subjectObjectReferences, glTFReferences
}