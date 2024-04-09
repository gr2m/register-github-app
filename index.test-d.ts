import { expectType } from "tsd";
import { request as octokitRequest } from "@octokit/request";

import registerGitHubApp, { AppCredentials } from "./index.js";

export async function minimalUsageTest() {
  const credentials = await registerGitHubApp();
  expectType<AppCredentials>(credentials);
}

export async function maximumUsageTest() {
  const credentials = await registerGitHubApp(
    {
      org: "my-org",
      name: "test-app",
      description: "my description",
      url: "https://my-app.com",
      setup_url: "https://my-app.com/setup",
      callback_urls: ["https://my-app.com/oauth"],
      request_oauth_on_install: true,
      public: true,
      setup_on_update: true,
      hook_attributes: {
        url: "https://my-app.com/oauth",
        active: true,
      },
      default_events: ["issues"],
      default_permissions: {
        issues: "write",
      },
    },
    {
      log: console.log,
      request: octokitRequest,
      githubApiUrl: "",
      githubUrl: "",
      port: 0,
    },
  );
  expectType<AppCredentials>(credentials);
}
