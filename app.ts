import { Session } from "@inrupt/solid-client-authn-node";
import { query } from "./src/helpers/functions";
import configuration  from "./configuration"

async function test() {
    const st = configuration.stakeholders[0]
    const session = new Session()
    await session.login(st.credentials)

    const prefixes = `
    prefix beo: <https://pi.pauwel.be/voc/buildingelement#>
    prefix dot: <https://w3id.org/dot#>
    prefix props: <http://example.org/props/>
    `

    const q = prefixes + `SELECT ?element WHERE {?element a beo:Wall ; dot:hasDamage ?dam }`
    const sources = [
      'http://localhost:5000/office1/lbd/931319e7-96cc-4067-8075-3b508cc6dd3c/local/datasets/eb823781-b0da-47c3-8465-01b222b4e3d1/3aeaf3d1-2b51-4cf3-a435-f7eb0797bd07',
      'http://localhost:5000/office2/lbd/931319e7-96cc-4067-8075-3b508cc6dd3c/local/datasets/efa0557c-66d4-4550-a5fe-8933490bdaa9/2ebcad6c-690f-43bf-9ae0-fdb61669f618',
      'http://localhost:5000/office2/lbd/931319e7-96cc-4067-8075-3b508cc6dd3c/local/datasets/9ecc5825-f83f-436a-85a9-6ea841e6c5f3/01ce6a04-3616-4b62-86f7-827c951bce81'
    ]
    const registries = [
      'http://localhost:5000/office1/lbd/931319e7-96cc-4067-8075-3b508cc6dd3c/local/references/data',
      'http://localhost:5000/office2/lbd/931319e7-96cc-4067-8075-3b508cc6dd3c/local/references/data'
    ]
    const results = await query(q, { sources, fetch: session.fetch, registries})
    console.log('results', JSON.stringify(results, undefined, 2))
    console.log('results.bindings.length', results.results.bindings.length)
    process.exit(0)
}

test()