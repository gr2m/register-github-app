import registerGitHubApp from "./index.js";

const appCredentials = await registerGitHubApp();

console.log(appCredentials);
