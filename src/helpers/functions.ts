function extract(jsonld: object[], uri: string) {
    return Object.assign({}, ...jsonld.filter(i => i["@id"] === uri))
  }

export {extract}