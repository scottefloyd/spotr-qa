import { expect, test } from '@playwright/test';

test.describe('Spotr homepage', () => {
  test('@smoke loads the public homepage', async ({ page }) => {
    const response = await page.goto('/');

    expect(response, 'The homepage should return a document response').not.toBeNull();
    expect(response?.status(), 'The homepage should return a successful status').toBeLessThan(400);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Solve the Shuttle, Together' })
    ).toBeVisible();
  });
});
