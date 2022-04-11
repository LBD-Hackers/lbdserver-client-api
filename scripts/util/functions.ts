import {QueryEngine} from '@comunica/query-sparql'
import {streamToString} from '../../src/helpers/functions'

async function determineLBDpropsLevel(source, session) {
  const myEngine = new QueryEngine();

  let q, bindings, results;
  q = `
  prefix ldp: <http://www.w3.org/ns/ldp#>
  prefix dcat: <http://www.w3.org/ns/dcat#>
  prefix schema: <http://schema.org/> 
  prefix props: <https://w3id.org/props#>

  select ?element ?thing
  where 
  { ?element props:globalIdIfcRoot_attribute_simple ?thing .
  } LIMIT 1`;

  results = await myEngine.queryBindings(q, {
    sources: [source],
    fetch: session.fetch,
  })  

  bindings = await results.toArray();

  if (bindings.length == 0) {
    q = `
    prefix ldp: <http://www.w3.org/ns/ldp#>
    prefix dcat: <http://www.w3.org/ns/dcat#>
    prefix schema: <http://schema.org/> 
    prefix props: <https://w3id.org/props#>
  
    select ?element ?thing
    where 
    { ?element props:globalIdIfcRoot ?thing . ?thing schema:value ?id .
    } LIMIT 1`;

    results = await myEngine.queryBindings(q, {
      sources: [source],
      fetch: session.fetch,
    })
    
    bindings = await results.toArray();

    if (bindings.length > 0) {
      return 2;
    } else {
      throw Error("could not determine props level");
    }
  } else {
    return 1;
  }
}

export {
  determineLBDpropsLevel
}