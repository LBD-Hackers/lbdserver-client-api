import { QueryEngine } from "@comunica/query-sparql";
import { LBDS } from "./src";

async function doStuff() {
    const qe = new QueryEngine()
    const query = `SELECT *WHERE {
        ?id <https://w3id.org/lbdserver#value> "1q68Y1p2HAlB7Ye_PjDqne" .
        <https://w3id.org/lbdserver#value> "1q68Y1p2HAlB7Ye_PjDqnE"
    }`

    const result = await qe.queryBindings(query, {sources: ["http://localhost:1000/lbd/dc/local/references/data"]})
        .then(i => i.toArray())
        .then(i => {console.log(i); return i.map(item => {return {gltfConcept: item.get('gltf').value}})})
        .then(res => res[0])

        console.log('result', result)

}


doStuff()