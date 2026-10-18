export type TestEnvironment = 'production' | 'staging';

export type EnvironmentConfig = {
  name: TestEnvironment;
  baseURL: string;
  isProduction: boolean;
};

const productionHosts = new Set(['riverspotr.com', 'www.riverspotr.com']);
const defaultProductionURL = 'https://www.riverspotr.com';

function parseEnvironment(value: string | undefined): TestEnvironment {
  const environment = value?.trim().toLowerCase() || 'production';

  if (environment !== 'production' && environment !== 'staging') {
    throw new Error(`TEST_ENV must be "production" or "staging"; received "${environment}".`);
  }

  return environment;
}

function parseBaseURL(value: string): URL {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`BASE_URL must be an absolute URL; received "${value}".`);
  }

  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) {
    throw new Error('BASE_URL must use HTTPS unless it targets localhost.');
  }

  return url;
}

export function loadEnvironment(env: NodeJS.ProcessEnv = process.env): EnvironmentConfig {
  const name = parseEnvironment(env.TEST_ENV);
  const configuredBaseURL = env.BASE_URL?.trim();

  if (name === 'staging' && !configuredBaseURL) {
    throw new Error('BASE_URL is required when TEST_ENV=staging.');
  }

  const url = parseBaseURL(configuredBaseURL || defaultProductionURL);

  if (name === 'staging' && productionHosts.has(url.hostname.toLowerCase())) {
    throw new Error(`Refusing to treat the production host "${url.hostname}" as staging.`);
  }

  return {
    name,
    baseURL: url.toString().replace(/\/$/, ''),
    isProduction: productionHosts.has(url.hostname.toLowerCase())
  };
}

export function requireStaging(config: EnvironmentConfig = loadEnvironment()): void {
  if (config.name !== 'staging' || config.isProduction) {
    throw new Error(
      'This test can modify data and requires TEST_ENV=staging with a non-production BASE_URL.'
    );
  }
}
