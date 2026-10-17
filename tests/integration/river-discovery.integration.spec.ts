import { expect, test } from '@playwright/test';

type RiverSummary = {
  id: string;
  name: string;
};

test.describe('River discovery integration @smoke @integration', () => {
  test('shows API river data in the public UI and opens the matching detail page', async ({
    page,
    request
  }) => {
    const response = await request.get('/api/rivers');
    expect(response.status()).toBe(200);

    const rivers = (await response.json()) as RiverSummary[];
    expect(rivers.length).toBeGreaterThan(0);

    const selectedRiver = rivers[0];
    expect(selectedRiver.id).toEqual(expect.any(String));
    expect(selectedRiver.name).toEqual(expect.any(String));

    await page.goto('/explore');
    await page.getByPlaceholder('Search rivers...').fill(selectedRiver.name);

    await expect(
      page.getByRole('heading', { level: 4, name: selectedRiver.name, exact: true })
    ).toBeVisible();

    await page.getByRole('button', { name: 'View Details' }).click();

    await expect(page).toHaveURL(new RegExp(`/river/${selectedRiver.id}$`));
    await expect(
      page.getByRole('heading', { level: 1, name: selectedRiver.name, exact: true })
    ).toBeVisible();
  });
});
