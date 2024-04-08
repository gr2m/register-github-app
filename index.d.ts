import { request } from "@octokit/request";

export default function registerGitHubApp(
  manifest?: Manifest,
  metaOptions?: MetaOptions
): Promise<AppCredentials>;

export type Manifest = {
  /** Organization login. If not set, the app will be registered on the user's account */
  org?: string;

  /** The name of the GitHub App. Defaults to `app-{random string}` */
  name?: string;

  /** The description of the GitHub App. */
  description?: string;

  /** Whether to allow the app to be installed on other accounts. Defaults to false */
  public?: boolean;

  /**
   * The homepage of your GitHub App. If `org` is set, `homepageUrl` will default to `https://github.com/{org}`, otherwise to `https://github.com`
   */
  homepageUrl?: string;

  /** Webhooks URL, required if `webhooksActive` is set to `true` */
  webhookUrl?: string;

  /** enable or disable webhooks. if `webhooksUrl` is set, `webhooksActive` defaults to `false`, otherwise to `true` */
  webhookActive?: boolean;

  /** URL for OAuth Callback */
  oauthCallbackUrl?: string;

  /** URL to redirect a user to after they install the app */
  installSetupUrl?: string;

  /** Whether to redirect a user to `installSetupUrl` when an installation is updated by a user. Defaults to false. */
  setupOnUpdate?: boolean;

  /** Whether to redirect a user to an OAuth flow after the app is installed. This requires `oauthCallbackUrl` to be set. The redirect URL will retrieve an both a `code` and `installation_id` query parameter */
  oauthOnInstall?: boolean;

  /**
   * List of events that the app will subscribe to on new installations. Note: added events after an install must be approved by user.
   * @see https://docs.github.com/en/webhooks/webhook-events-and-payloads
   */
  events?: string[];

  /**
   * Permissions that the app will get on new installations. Note: added permissions after an install must be approved by user.
   */
  permissions?: Record<string, string>;
};

export type MetaOptions = {
  /** Port number for local server. Defaults to a random available port number */
  port?: number;

  /** GitHub website URL. Defaults to `https://github.com` */
  githubUrl?: string;

  /** GitHub API base URL. Defaults to `https://api.github.com` */
  githubApiUrl?: string;

  /** message to be used for logging. Defaults to `console.log` */
  log?: Console["log"];

  /** custom `octokit.request` method */
  request?: typeof request;
};

export type AppCredentials = {
  /** App Database ID */
  id: number;

  /** App Private key */
  privateKey: string;

  /** Webhook Secret */
  webhookSecret: string;

  /** Client ID */
  clientId: string;

  /** Client Secret */
  clientSecret: string;
};
