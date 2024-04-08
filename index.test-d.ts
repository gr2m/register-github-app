import { expectType } from "tsd";
import registerGitHubApp, { AppCredentials } from "./index.js";

export async function smokeTest() {
  const credentials = await registerGitHubApp();
  expectType<AppCredentials>(credentials);
}
