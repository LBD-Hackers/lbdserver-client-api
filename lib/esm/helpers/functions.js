"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extract = extract;
exports.query = query;
exports.streamToString = streamToString;

const QueryEngine = require('@comunica/query-sparql').QueryEngine;

const N3 = require('n3');

const {
  DataFactory
} = N3;
const {
  namedNode,
  literal,
  defaultGraph,
  quad,
  variable
} = DataFactory;

const {
  translate,
  toSparql
} = require("sparqlalgebrajs");

function extract(jsonld, uri) {
  return Object.assign({}, ...jsonld.filter(i => i["@id"] === uri));
}

const prefixes = `
prefix owl: <http://www.w3.org/2002/07/owl#> 
prefix beo: <http://pi.pauwel.be/voc/buildingelement#>
prefix props: <http://example.org/props#> 
prefix lbds: <https://w3id.org/lbdserver#>
prefix schema: <http://schema.org/>
`;

function inference(myEngine, {
  registries,
  fetch,
  store
}) {
  return new Promise(async (resolve, reject) => {
    const q = prefixes + `
      CONSTRUCT {
       ?s1 owl:sameAs ?s2 .
       ?s2 owl:sameAs ?s1 .
      } WHERE {
          ?concept1 lbds:hasReference/lbds:hasIdentifier/<http://schema.org/value> ?s1 .
          ?concept2 lbds:hasReference/lbds:hasIdentifier/<http://schema.org/value> ?s2 .
          ?concept1 owl:sameAs ?concept2 .
      }`;
    const quadStream = await myEngine.queryQuads(q, {
      sources: registries,
      fetch
    });
    quadStream.on('data', res => {
      const subject = res.subject.id.replaceAll('"', '');
      const object = res.object.id.replaceAll('"', '');

      if (subject.startsWith("http") && object.startsWith("http")) {
        const q = quad(namedNode(subject), namedNode(res.predicate.value), namedNode(object), defaultGraph());
        store.addQuad(q);
      }
    });
    quadStream.on('error', err => {
      reject(err);
    });
    quadStream.on('end', () => {
      resolve();
    });
  });
}

function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

async function query(q, options) {
  let {
    sources,
    fetch,
    store,
    registries,
    asStream
  } = options;
  const {
    query,
    variables
  } = await mutateQuery(q); //   const vars = variables.map((v: any) => v.value)

  console.log('sources', sources);
  console.log('registries', registries);
  console.log('query', query);
  const newQ = prefixes + "Select * where {?s1 owl:sameAs ?s2} ";
  const myEngine = new QueryEngine();
  if (!store) store = new N3.Store();
  await inference(myEngine, {
    registries,
    fetch,
    store
  });
  const result = await myEngine.query(query, {
    sources: [...sources, store],
    fetch
  });
  const {
    data
  } = await myEngine.resultToString(result, 'application/sparql-results+json');

  if (asStream) {
    return data;
  } else {
    return JSON.parse(await streamToString(data));
  }
}

function findLowerLevel(obj, variables) {
  if (!variables) variables = obj.variables;

  if (obj.type === "bgp") {
    return {
      bgp: obj,
      variables
    };
  } else {
    return findLowerLevel(obj.input, variables);
  }
}

async function mutateQuery(query) {
  const translation = translate(query);
  const {
    bgp,
    variables
  } = findLowerLevel(translation, translation.variables);
  const usedVariables = new Set();
  let aliasNumber = 1;
  let aliases = {};

  for (const pattern of bgp.patterns) {
    for (const item of Object.keys(pattern)) {
      if (pattern[item].termType === "Variable") {
        if (usedVariables.has(pattern[item])) {
          const newVName = `${pattern[item].value}_alias${aliasNumber}`;
          if (!aliases[pattern[item].value]) aliases[pattern[item].value] = [];
          aliases[pattern[item].value].push(newVName);
          aliasNumber += 1;
          const newV = {
            termType: "Variable",
            value: newVName
          };
          pattern[item] = newV;
        }

        usedVariables.add(pattern[item]);
      }
    }
  }

  Object.keys(aliases).forEach(item => {
    aliases[item].forEach(alias => {
      const newPattern = quad(variable(item), namedNode("http://www.w3.org/2002/07/owl#sameAs"), variable(alias), defaultGraph());
      bgp.patterns.push(newPattern);
    });
  });
  const q = {
    type: "project",
    input: {
      type: "bgp",
      patterns: bgp.patterns
    },
    variables: Array.from(usedVariables)
  };
  return {
    query: toSparql(q),
    variables: Array.from(usedVariables)
  };
}
//# sourceMappingURL=functions.js.map