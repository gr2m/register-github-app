import { request as octokitRequest } from "@octokit/request";
import test from "ava";
import { MockAgent } from "undici";

import registerGitHubApp from "../index.js";

const MOCK_API_RESPONSE = {
  id: "<id>",
  slug: "<slug>",
  node_id: "<node_id>",
  owner: "<owner>",
  name: "<name>",
  description: "<description>",
  external_url: "<external_url>",
  html_url: "<html_url>",
  created_at: "<created_at>",
  updated_at: "<updated_at>",
  permissions: "<permissions>",
  events: "<events>",
  client_id: "<client_id>",
  client_secret: "<client_secret>",
  webhook_secret: "<webhook_secret>",
  pem: "<pem>",
};

test.serial("README minimal example", async (t) => {
  const mockCode = 123;
  const mockAgent = new MockAgent();
  function mockFetch(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  const mockRequest = octokitRequest.defaults({
    request: {
      fetch: mockFetch,
    },
  });

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.github.com");
  mockPool
    .intercept({
      method: "post",
      path: `/app-manifests/${mockCode}/conversions`,
    })
    .reply(200, MOCK_API_RESPONSE, {
      headers: {
        "content-type": "application/json",
      },
    });

  try {
    let retrieveRedirectPageHtml;
    const mockLog = async (message) => {
      try {
        console.log({ message, match: /^Open /.test(message) });
        if (/^Open /.test(message)) {
          // test landing page
          const url = message.substr("Open ".length);
          t.snapshot(await getNormalizedHtml(url), "landing page html");

          // test ?code redirect
          retrieveRedirectPageHtml = getNormalizedHtml(
            `${url}/?code=${mockCode}`
          );
          t.snapshot(await retrieveRedirectPageHtml, "redirect page html");

          return;
        }

        t.fail(`unrecognized message: ${message}`);
      } catch (error) {
        // TODO: if an assertion fails, the error is not logged by Ava, instead the test just times out
        console.log(error);
      }
    };

    const credentials = await registerGitHubApp(undefined, {
      log: mockLog,
      request: mockRequest,
    });
    t.snapshot(credentials, "credentials");

    // wait until redirect page html is retrieved
    await retrieveRedirectPageHtml;
  } catch (error) {
    t.fail(error);
  }
});

test.serial("README all features", async (t) => {
  const mockCode = 123;
  const mockAgent = new MockAgent();
  function mockFetch(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  const mockRequest = octokitRequest.defaults({
    request: {
      fetch: mockFetch,
    },
  });

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.github.com");
  mockPool
    .intercept({
      method: "post",
      path: `/app-manifests/${mockCode}/conversions`,
    })
    .reply(200, MOCK_API_RESPONSE, {
      headers: {
        "content-type": "application/json",
      },
    });

  try {
    let retrieveRedirectPageHtml;
    const mockLog = async (message) => {
      try {
        if (/^Open /.test(message)) {
          // test landing page
          const url = message.substr("Open ".length);
          t.snapshot(await getNormalizedHtml(url), "landing page html");

          // test ?code redirect
          retrieveRedirectPageHtml = getNormalizedHtml(
            `${url}/?code=${mockCode}`
          );
          t.snapshot(await retrieveRedirectPageHtml, "redirect page html");

          return;
        }

        t.fail(`unrecognized message: ${message}`);
      } catch (error) {
        // TODO: if an assertion fails, the error is not logged by Ava, instead the test just times out
        console.log(error);
      }
    };

    const credentials = await registerGitHubApp(
      {
        org: "my-org",
        name: "test-app",
        description: "my description",
        homepageUrl: "https://my-app.com",
        installSetupUrl: "https://my-app.com/setup",
        oauthCallbackUrl: "https://my-app.com/oauth",
        oauthOnInstall: true,
        public: true,
        setupOnUpdate: true,
        webhookUrl: "https://my-app.com/oauth",
        webhookActive: true,
        events: ["issues"],
        permissions: {
          issues: "write",
        },
      },
      {
        log: mockLog,
        request: mockRequest,
      }
    );
    t.snapshot(credentials, "credentials");

    // wait until redirect page html is retrieved
    await retrieveRedirectPageHtml;
  } catch (error) {
    t.fail(error.message);
  }
});

async function getNormalizedHtml(url) {
  const response = await fetch(url);
  const html = await response.text();

  return html
    .replace(/localhost:\d+/g, "localhost:<port normalized>")
    .replace(/"app-\w+"/g, "app-<random string>");
}
