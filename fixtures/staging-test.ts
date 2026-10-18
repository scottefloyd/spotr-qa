import { expect, test as base } from '@playwright/test';
import { loadEnvironment, requireStaging } from '../utils/environment';

const environment = loadEnvironment();

export const test = base.extend({});

test.beforeEach(() => {
  requireStaging(environment);
});

export { expect };
