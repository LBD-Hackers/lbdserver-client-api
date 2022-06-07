import fetch from 'cross-fetch';
import { createDpopHeader, generateDpopKeyPair, buildAuthenticatedFetch, getWebidFromTokenPayload} from '@inrupt/solid-client-authn-core';
import {v4} from 'uuid' 

export default async function generateSession(options: any, webId: string) {
    try {
        let {email, password, name, idp} = options
        if (!idp.endsWith("/")) idp += '/'
        const response = await fetch(`${idp}idp/credentials/`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });
    
        const {id, secret}= await response.json();
        const tokenUrl = `${idp}.oidc/token`;
        const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;
        const dpopKey = await generateDpopKeyPair();

        const r = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                // The header needs to be in base64 encoding.
                authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
                'content-type': 'application/x-www-form-urlencoded',
                dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
            },
            body: 'grant_type=client_credentials&scope=webid',
        });
        const {access_token} = await r.json();
        const authFetch = await buildAuthenticatedFetch(fetch, access_token, { dpopKey });
        return {fetch: authFetch, info: {webId, isLoggedIn: true}}

    } catch (error) {
        console.log('error', error)
        throw error
    }
}