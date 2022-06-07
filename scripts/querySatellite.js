// import { QueryEngine } from "@comunica/query-sparql";
// import { toSparql, translate } from "sparqlalgebrajs";

const {QueryEngine} = require('@comunica/query-sparql')
const {toSparql, translate}  = require('sparqlalgebrajs')
const prefixes = "PREFIX beo: <https://pi.pauwel.be/voc/buildingelement#> "


async function run() {

    const sparql = "INSERT DATA { <ex:s2> <ex:p2> <ex:o2> }"

    const sparql2 = "INSERT DATA { graph <https://pod.werbrouck.me/dc/lbd/caadchair/local/> {<ex:s2> <ex:p2> <ex:o2> }}"

    const sources = []
    const path = "https://sparql.werbrouck.me/dc/caadchair/sparql"
    

    const engine = new QueryEngine()
    const translated = translate(sparql, {quads: true})
    translated.insert.forEach(item => item.graph = {
            "termType": "NamedNode",
            "value": "https://pod.werbrouck.me/dc/lbd/caadchair/local/"
        }
    )
    console.log('translated', JSON.stringify(translated, undefined, 4))
    const newQ = toSparql(translated)
    
    const res = await fetch(path, {method: "PATCH", body: newQ, headers: {"Content-Type": "application/sparql-update"}})
    // const t2 = translate(sparql2, {quads: true})
    
    // console.log('translated', JSON.stringify(t2, undefined, 4))

    // try {

    //     // get the project

    //     const rootList = identifier.path.split('/lbd/')
    //     const projectname = rootList[rootList.length - 1].split('/')[0]
    //     const root = rootList[0] + '/lbd/' + projectname + "/local/"
   
    //     const satelliteQuery = `select ?url where {
    //       <${root}> <http://www.w3.org/ns/dcat#service> ?sat .
    //       ?sat a <http://www.w3.org/ns/dcat#DataService> ;
    //         <http://www.w3.org/ns/dcat#endpointURL> ?url ;
    //         <http://purl.org/dc/terms/conformsTo> <https://www.w3.org/TR/sparql11-query/> .
    //     }`
  
    //     // query for sparql compliant endpoint
    //     const endpointResults = await engine.queryBindings(satelliteQuery, { sources: [root], baseIRI: root})
    //     const bindings = await endpointResults.toArray();
 
    //     bindings.forEach((item: any) => {
    //       sources.push(item.get('url').value + "/sparql")
    //     })
  
    //   } catch (error: any) {
    //     console.log(`Could not find SPARQL satellite. Are you updating an LBDserver project? ERROR: ${error.message}`)
    //   }
   
      // Run the query through Comunica  

        // const query = await engine.queryVoid(sparql, { sources: ["https://pod.werbrouck.me/dc/lbd/caadchair/local/"], destination: "https://sparql.werbrouck.me/dc/caadchair/sparql"})
      
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