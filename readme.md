# Consolid

## Testing
In order to run tests (`npm run test`) which is also the preferred way of further developing the library (write test and make sure that it passes) you need to first have a local solid community server running, and you need to get credentials that you copy-paste to the `credentials.js` file.

### Run local Solid Community server
* `npm install -g @solid/community-server`
* `community-solid-server`
* [register new account](http://localhost:3000/idp/register/)
* Now you have a new WebId (eg. http://localhost:3000/test/profile/card#me)

### Get session token
This is needed for running the tests.
* `npx @inrupt/generate-oidc-token`
* Choose `My Solid Identity provider is not on the list` and type `http://localhost:3000/`
* Choose `No` ("Has your app been pre-registered by the administrator of the Pod server you are signing in to?)
* Type name of the app (`consolid`)
* Open link in browser (eg. http://localhost:3000/idp/auth?client_id=NFJUCr4Yc0ohwMetVisSB&scope=openid%20offline_access%20webid&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2F&code_challenge=nOIZMSXw0u0OL9GJg7hJMVN09gn05xsM_nxlhfkH6rU&state=7eTv9ZA1rPwx2CH1CrTJqIAVafbc95lZOyxpaZ3_1BM&code_challenge_method=S256&prompt=consent) and login
* You shouls now receive credentials like below

```json
{
  "refreshToken" : "BB",
  "clientId"     : "AA",
  "clientSecret" : "XX",
  "oidcIssuer"   : "http://localhost:3000/",
}
```

## Install
You can install this library with `github:ConSolidProject/lbdserver-client-api`.

## Usage
The library exposes four Classes: 
* LbdService: basic interaction with the Pod (e.g. validate and create LBD project repository)
* LbdProject: basic interaction with LBDserver projects
* LbdDataset: basic interaction with datasets of LBDserver projects
* LbdDistribution: basic interaction with distributions of datasets of LBDserver projects.

## Build and deploy
Building the library is handled with the `npm run build` command. This generates the `lib` folder and its content. We build ESM and UMD bundles that can be directly included in an HTML document. Furthermore, we build a CommonJS and an ESM version.

Bundles are build using the configuration in `rollup.config.js`.