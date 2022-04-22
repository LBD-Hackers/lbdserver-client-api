import { Session } from "@inrupt/solid-client-authn-node";
import { QueryEngine } from "@comunica/query-sparql";

const credentials = {
    "refreshToken" : "YCk7qiF0EZhIbuuClZHDryHw4OUytQuAs0QjqvstSor",
    "clientId"     : "YENAhQ2yLwMBszTj5ZU8P",
    "clientSecret" : "qguqTatbY2O88vprKMokASd2yGTltkJO6K9et42T_0My_WwD9xYnxR0YiYFPYni7T6z8tDb5mwAcOO1esCXUOg",
    "oidcIssuer"   : "http://localhost:5000/",
  }
const session = new Session()

async function run() {
    await session.login(credentials)
    const satellites = await findSatellite(session.info.webId, session, 'sparql')
}

async function findSatellite(webId, session, supports) {
    const pod = webId.replace('profile/card#me', '')
    let endpoint = pod + 'satellites.json'

    // takes longer, but more flexible
    // endpoint = await getSatellitesDocument(pod, session)

    const satellites = await session.fetch(endpoint).then(res => res.json())
    const satellite = satellites.filter(item => item.query.filter(s => s.supports.includes(supports)))
    console.log('satellite', satellite)
    return satellites.query
}

async function getSatellitesDocument(root, session) {
    const myEngine = new QueryEngine();
    const q = `SELECT ?item WHERE {
        ?s <https://w3id.org/lbdserver#hasSatelliteRegistry> ?item . } LIMIT 1`;
    const results = await myEngine
      .queryBindings(q, { sources: [root], fetch: session.fetch })
      .then((b) => b.toArray());
    myEngine.invalidateHttpCache();
    if (results.length > 0) {
        const document = results.map((i) => i.get("item").value)[0];
        return document
    } else {
        throw new Error("Could not find satellite configuration for the indicated root container")
    }
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