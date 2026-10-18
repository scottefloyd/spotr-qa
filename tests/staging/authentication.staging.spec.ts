import { expect, test } from '../../fixtures/staging-test';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.describe('Staging authentication @staging @auth', () => {
  test.beforeAll(() => {
    if (!email || !password) {
      throw new Error(
        'E2E_USER_EMAIL and E2E_USER_PASSWORD are required for staging authentication tests.'
      );
    }
  });

  test('signs in a confirmed paddler account', async ({ page }) => {
    await page.goto('/auth');

    await page.getByLabel('Email').fill(email!);
    await page.getByLabel('Password').fill(password!);

    await Promise.all([
      page.waitForURL((url) => url.pathname === '/'),
      page.getByRole('button', { name: 'Sign In', exact: true }).last().click()
    ]);

    await expect(page.getByText('Welcome back, paddler')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Profile', exact: true })).toBeVisible();
  });
});
