import { Session } from "@inrupt/solid-client-authn-node";
import { QueryEngine } from "@comunica/query-sparql";

const credentials = {
    "refreshToken" : "YCk7qiF0EZhIbuuClZHDryHw4OUytQuAs0QjqvstSor",
    "clientId"     : "YENAhQ2yLwMBszTj5ZU8P",
    "clientSecret" : "qguqTatbY2O88vprKMokASd2yGTltkJO6K9et42T_0My_WwD9xYnxR0YiYFPYni7T6z8tDb5mwAcOO1esCXUOg",
    "oidcIssuer"   : "http://localhost:5000/",
  }
const session = new Session()
const prefixes = "PREFIX beo: <https://pi.pauwel.be/voc/buildingelement#> "
async function run() {
    await session.login(credentials)
    const query = prefixes + `select * where {?s a beo:Wall}`
    const endpoint = "http://localhost:5002/ds/sparql"
    const queryEngine = new QueryEngine()
    const results = await queryEngine.queryBindings(query, {sources: [endpoint], fetch: session.fetch})
    .then(res => res.toArray())
    
    console.log('results.length', results.length)
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