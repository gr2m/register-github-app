// @ts-check

import { createServer } from "node:http";

import { request as octokitRequest } from "@octokit/request";

const DEFAULT_MANIFEST = {
  homepageUrl: "https://github.com",
};
const DEFAULT_META_OPTIONS = {
  githubUrl: "https://github.com",
  githubApiUrl: "https://api.github.com",
  log: console.log.bind(console),
};

/**
 * @param {import('./index.d.ts').Manifest} manifest
 * @param {import('./index.d.ts').MetaOptions} metaOptions
 * @returns {Promise<import('./index.d.ts').AppCredentials>}
 */
export default async function registerGitHubApp(
  manifest = DEFAULT_MANIFEST,
  metaOptions = DEFAULT_META_OPTIONS,
) {
  // defaults
  manifest.homepageUrl ||= manifest.org
    ? `https://github.com/${manifest.org}`
    : "https://github.com";
  manifest.name ||= `app-${randomString()}`;
  manifest.public ||= false;
  manifest.webhookActive ||= Boolean(manifest.webhookUrl);
  manifest.setupOnUpdate ||= false;
  manifest.oauthOnInstall ||= false;

  metaOptions.githubUrl ||= DEFAULT_META_OPTIONS.githubUrl;
  metaOptions.githubApiUrl ||= DEFAULT_META_OPTIONS.githubApiUrl;

  const log = metaOptions.log || DEFAULT_META_OPTIONS.log;

  const manifestRequest = (metaOptions.request || octokitRequest).defaults({
    baseUrl: metaOptions.githubApiUrl,
    method: "POST",
    url: "/app-manifests/{code}/conversions",
  });

  return new Promise((resolve, reject) => {
    // start the server at an available port
    const server = createServer();

    server.listen(metaOptions.port || 0);

    const port =
      metaOptions.port ||
      // @ts-expect-error - I have yet to see a usecase when `server.address()` can be a string
      server.address().port;

    log(`Open http://localhost:${port}`);

    server.on("error", (error) => {
      reject(new Error("A server error occured", { cause: error }));
      server.close();
    });

    // Listen to the request event
    server.on("request", async (request, response) => {
      const url = new URL(
        // @ts-expect-error - we can assume that request.url is always a string here
        request.url,
        `http://localhost:${port}`,
      );

      const code = url.searchParams.get("code");
      if (code) {
        const { data: appCredentials } = await manifestRequest({
          code,
        });

        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(`
          <meta charset="utf-8">
          <h1>GitHub App registered successfully</h1>
          <p>
            Your new app can be installed at <a href="${appCredentials.html_url}">${appCredentials.html_url}</a>. You can close this browser now.
          </p>
        `);

        resolve({
          id: appCredentials.id,
          privateKey: appCredentials.pem,
          webhookSecret: appCredentials.webhook_secret || "",
          clientId: appCredentials.client_id,
          clientSecret: appCredentials.client_secret,
        });

        server.close();
        return;
      }

      const registerUrl = manifest.org
        ? `${metaOptions.githubUrl}/organizations/${manifest.org}/settings/apps/new`
        : `${metaOptions.githubUrl}/settings/apps/new`;

      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(`
        <meta charset="utf-8">
        <h1>Registering GitHub App "${manifest.name}"</h1>
        <form action="${registerUrl}" method="post">
          <input type="hidden" name="manifest" id="manifest">
          <input type="submit" value="Submit" id="submit">
        </form>

        <p>
          You will be redirected automatically …
        </p>

        <script>
        const input = document.getElementById("manifest")
        input.value = \`${JSON.stringify({
          name: manifest.name,
          url: manifest.homepageUrl,
          redirect_url: `http://localhost:${port}`,
          public: manifest.public,
        })}\`

        document.getElementById("submit").click()
        </script>
      `);
    });
  });
}

function randomString() {
  return Math.random().toString(36).substring(2, 9);
}
