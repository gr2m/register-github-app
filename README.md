# `register-github-app`

> Register a GitHub App using the manifest flow

## Usage

### Register an app on current user account and write credentials into a `.env` file.

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
  default_permissions: {
    issues: "write",
  },
  // List of events for new installations
  default_events: ["issues"],
});

// convert private key to pkcs8 format (recommended for better cross plattform support)
const privateKeyPKCS8 = String(
  crypto.createPrivateKey(appCredentials.privateKey).export({
    type: "pkcs8",
    format: "pem",
  })
);

// write credentials into `.env` file
await fs.writeFile(
  ".env",
  `GITHUB_APP_ID=${appCredentials.id}
GITHUB_APP_PRIVATE_KEY=${privateKeyPKCS8}
GITHUB_APP_WEBHOOK_SECRET=${appCredentials.webhook_secret}
GITHUB_APP_CLIENT_ID=${appCredentials.client_id}
GITHUB_APP_SECRET=${appCredentials.client_secret}
`
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
  default_permissions: {
    issues: "write",
  },
  // List of events for new installations
  default_events: ["issues"],
});
```

## Resources

- [Registering a GitHub App from a manifest](https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest)

## License

[ISC](license)
