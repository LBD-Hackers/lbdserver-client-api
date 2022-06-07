import fetch from 'node-fetch';
import { createDpopHeader, generateDpopKeyPair } from '@inrupt/solid-client-authn-core';
import {v4} from 'uuid' 

async function generateToken({email, password, idp}) {
    const response = await fetch(`${idp}/idp/credentials/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, name: v4() }),
    });

    const {id, secret}= await response.json();

    const tokenUrl = `${idp}/.oidc/token`;
    const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;

    const r = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            // The header needs to be in base64 encoding.
            authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
            // dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
        },
        body: 'grant_type=client_credentials&scope=webid',
    });
    const {access_token} = await r.json();
    return access_token
}

const email = "office1@example.org"
const password = "test123"
const idp = "http://localhost:1000"
const start = new Date()

generateToken({email, password, idp}).then((token) => {
    const end = new Date()
    const duration = end.getTime() - start.getTime()
    console.log(token)
    console.log(duration)
})