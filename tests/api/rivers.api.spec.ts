import { expect, test } from '@playwright/test';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type River = {
  id: unknown;
  name: unknown;
  description: unknown;
  difficulty: unknown;
  length: unknown;
  floatTime: unknown;
  startLocationId: unknown;
  endLocationId: unknown;
  imageUrl: unknown;
  createdAt: unknown;
};

function expectNullableString(value: unknown): void {
  expect(value === null || typeof value === 'string').toBe(true);
}

function expectNullableDecimal(value: unknown): void {
  expect(value === null || typeof value === 'string' || typeof value === 'number').toBe(true);
  if (value !== null) {
    expect(Number.isFinite(Number(value))).toBe(true);
    expect(Number(value)).toBeGreaterThanOrEqual(0);
  }
}

function expectRiverContract(river: River): void {
  expect(river.id).toEqual(expect.any(String));
  expect(river.id).toMatch(uuidPattern);
  expect(river.name).toEqual(expect.any(String));
  expect((river.name as string).trim().length).toBeGreaterThan(0);

  expectNullableString(river.description);
  expect([null, 'beginner', 'intermediate', 'advanced']).toContain(river.difficulty);
  expectNullableDecimal(river.length);
  expectNullableDecimal(river.floatTime);
  expectNullableString(river.imageUrl);

  for (const locationId of [river.startLocationId, river.endLocationId]) {
    expect(locationId === null || (typeof locationId === 'string' && uuidPattern.test(locationId))).toBe(
      true
    );
  }

  expect(river.createdAt === null || typeof river.createdAt === 'string').toBe(true);
  if (typeof river.createdAt === 'string') {
    expect(Number.isNaN(Date.parse(river.createdAt))).toBe(false);
  }
}

test.describe('Rivers API @smoke @api', () => {
  test('returns a non-empty collection matching the river contract', async ({ request }) => {
    const response = await request.get('/api/rivers');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const rivers: unknown = await response.json();
    expect(Array.isArray(rivers)).toBe(true);
    expect((rivers as River[]).length).toBeGreaterThan(0);

    for (const river of rivers as River[]) {
      expectRiverContract(river);
    }
  });

  test('returns a river by an ID discovered from the collection', async ({ request }) => {
    const collectionResponse = await request.get('/api/rivers');
    expect(collectionResponse.status()).toBe(200);

    const rivers = (await collectionResponse.json()) as River[];
    expect(rivers.length).toBeGreaterThan(0);

    const selectedRiver = rivers[0];
    const detailResponse = await request.get(`/api/rivers/${selectedRiver.id}`);

    expect(detailResponse.status()).toBe(200);
    expect(detailResponse.headers()['content-type']).toContain('application/json');

    const river = (await detailResponse.json()) as River;
    expectRiverContract(river);
    expect(river.id).toBe(selectedRiver.id);
  });

  test('returns 404 for an unknown valid river ID', async ({ request }) => {
    const response = await request.get('/api/rivers/00000000-0000-4000-8000-000000000000');

    expect(response.status()).toBe(404);
    expect(response.headers()['content-type']).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ message: 'River not found' });
  });
});
