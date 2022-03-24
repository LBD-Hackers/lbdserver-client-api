function extract(jsonld: object[], uri: string) {
    return Object.assign({}, ...jsonld.filter(i => i["@id"] === uri))
  }

  function streamToString (stream): Promise<string> {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
  }

export {extract, streamToString}