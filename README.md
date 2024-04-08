# `register-github-app`

> Register a GitHub App using the manifest flow

## Usage

### Minimal

```js
import registerGitHubApp from "register-github-app";
const appCredentials = await registerGitHubApp();
console.log(appCredentials);
```

### Write credentials into a `.env` file.

```js
import fs from "node:fs/promises";
import crypto from "node:crypto";

import registerGitHubApp from "register-github-app";

// register app and retrieve credentials
const appCredentials = await registerGitHubApp({
  // name of your app
  name: "my-github-app",
  // Homepage of your app, e.g. your app's repository or your org/user account
  url: "https://github.com/monatheoctocat/monas-github-app",
  // object of permissions for new installations
  permissions: {
    issues: "write",
  },
  // List of events for new installations
  events: ["issues"],
});

// convert private key to pkcs8 format (recommended for better cross plattform support)
const privateKeyPKCS8 = String(
  crypto.createPrivateKey(appCredentials.privateKey).export({
    type: "pkcs8",
    format: "pem",
  }),
);
const singleLinePrivateKey = privateKeyPKCS8.trim().replace(/\n/g, "\\n");

// write credentials into `.env` file
await fs.writeFile(
  ".env",
  `GITHUB_APP_ID=${appCredentials.id}
GITHUB_APP_PRIVATE_KEY="${singleLinePrivateKey}"
GITHUB_APP_WEBHOOK_SECRET=${appCredentials.webhookSecret}
GITHUB_APP_CLIENT_ID=${appCredentials.clientId}
GITHUB_APP_SECRET=${appCredentials.clientSecret}
`,
);
```

### Register an app on an organization

```js
import registerGitHubApp from "register-github-app";

// register app and retrieve credentials
const appCredentials = await registerGitHubApp({
  org: "my-organization-login",
  // name of your app
  name: "my-github-app",
  // object of permissions for new installations
  permissions: {
    issues: "write",
  },
  // List of events for new installations
  events: ["issues"],
});
```

## How it works

Registering a GitHub App using the manifest flow is an alternative to manually register a GitHub App on a user account or an organization. Here is what the `register-github-app` does

1. Starts a server on a random available port.
2. When opened in browser, it generates an HTML form with an input named `manifest` which value is set to a JSON string with the app manifest settings, and submits the form to github.com
3. On github.com, the user will be prompted to sign in or enter [sudo mode](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/sudo-mode).
4. Once authenticated, the user has to confirm the GitHub App name. It must be globally unique.
5. Once confirmed, the browser redirects to server started in the first step with a one-time code
6. The app credentials are retrieved using the one-time code, the server is stopped, and the credentials are returned

## Resources

- [Registering a GitHub App from a manifest](https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest)

## License

[ISC](license)
