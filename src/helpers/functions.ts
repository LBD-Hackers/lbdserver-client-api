import {QueryEngine} from '@comunica/query-sparql'
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad, variable } = DataFactory;
const {translate, toSparql} = require("sparqlalgebrajs")

function extract(jsonld: object[], uri: string) {
  return Object.assign({}, ...jsonld.filter((i) => i["@id"] === uri));
}

const prefixes = `
prefix owl: <http://www.w3.org/2002/07/owl#> 
prefix beo: <http://pi.pauwel.be/voc/buildingelement#>
prefix props: <http://example.org/props#> 
prefix lbds: <https://w3id.org/lbdserver#>
prefix schema: <http://schema.org/>
`

function inference(myEngine, { registries, fetch, store }): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const start = new Date()
      const q = prefixes + `
      CONSTRUCT {
       ?s1 owl:sameAs ?s2 .
       ?s2 owl:sameAs ?s1 .
      } WHERE {
          {?concept1 lbds:hasReference/lbds:hasIdentifier/<https://w3id.org/lbdserver#value> ?s1 .
          ?concept2 lbds:hasReference/lbds:hasIdentifier/<https://w3id.org/lbdserver#value> ?s2 .
          ?concept1 owl:sameAs ?concept2 .} UNION {
            ?concept1 lbds:hasReference/lbds:hasIdentifier/<https://w3id.org/lbdserver#value> ?s1, ?s2 .
          }
          FILTER(isIRI(?s1) && isIRI(?s2))
          FILTER(?s1 != ?s2)
      }`
      const quadStream = await myEngine.queryQuads(q, {
          sources: registries,
          fetch
      });

      quadStream.on('data', (res) => {
        // console.log('res.subject, res.object.id', res.subject.id, res.object.id)
            const q = quad(
                namedNode(res.subject.id),
                namedNode(res.predicate.value),
                namedNode(res.object.id),
                defaultGraph()
            )
            store.addQuad(q)
          

      });

      quadStream.on('error', (err) => {
        reject(err)
    });

      quadStream.on('end', () => {
        const duration = new Date().getTime() - start.getTime()
        console.log('duration inference', duration)
          resolve()
      })
  })
}

function streamToString (stream): Promise<string> {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk))
      return
    });
    stream.on('error', (err) => {
      console.log('error', err);
      reject(err)
    });
    stream.on('end', () => {
      console.log('end')
      if (chunks.length > 0) {resolve(Buffer.concat(chunks).toString('utf8'))}
      else {
        reject("could not find length")
      }
    });
  })

}

async function query(q, options) {
      let { sources, fetch, store, asStream} = options
      const {query, variables } = await mutateQuery(q)
      console.log('query', query)
      // const newQ = prefixes + "Select * where {?s1 owl:sameAs ?s2} "
      let queryEngine = new QueryEngine();
      // if (!store) store = new N3.Store();
      
      // await inference(myEngine, { registries, fetch, store })
      const s: any = [...sources]
      const result = await queryEngine.query(query, { sources: s , fetch })
      const { data } = await queryEngine.resultToString(result);
      if (asStream) {
          return data
      } else {
          return JSON.parse(await streamToString(data))
      }
}

function findLowerLevel(obj, variables) {
  if (!variables) variables = obj.variables
  if (obj.type === "bgp") {
      return {bgp: obj, variables}
  } else {
      return findLowerLevel(obj.input, variables)
  }
}

async function mutateQuery(query) {
  const translation = translate(query);
  const {bgp, variables} = findLowerLevel(translation, translation.variables)
  const usedVariables = new Set()
  let aliasNumber = 1
  let aliases = {}
  for (const pattern of bgp.patterns) {
      for (const item of Object.keys(pattern)) {
       if (pattern[item].termType === "Variable") {
          if (usedVariables.has(pattern[item])) {
              const newVName = `${pattern[item].value}_alias${aliasNumber}`
              if (!aliases[pattern[item].value]) aliases[pattern[item].value] = []

              aliases[pattern[item].value].push(newVName)
              aliasNumber += 1
              const newV = {termType: "Variable", value: newVName}
              pattern[item] = newV
          }
          usedVariables.add(pattern[item])
       }
         
      }
  }
  Object.keys(aliases).forEach(item => {
      aliases[item].forEach(alias => {
          const newPattern = quad(
              variable(item),
              namedNode("http://www.w3.org/2002/07/owl#sameAs"),
              variable(alias),
              defaultGraph()
          )
          bgp.patterns.push(newPattern)
      })
  })
  const q = {type: "project", input: {type: "bgp", patterns: bgp.patterns}, variables: Array.from(usedVariables)}
  return {query: toSparql(q), variables: Array.from(usedVariables)}
}


export { extract, streamToString, query };
