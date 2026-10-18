# Staging environment setup

## Goal

Create an isolated Spotr environment where automated tests can safely create users, shuttle requests, offers, notifications, and administrative state without touching production data or contacting real customers.

The QA framework already enforces two safeguards:

- `TEST_ENV=staging` requires an explicit `BASE_URL`.
- A staging run is rejected if `BASE_URL` points to `riverspotr.com` or `www.riverspotr.com`.

State-changing specifications must import `test` and `expect` from `fixtures/staging-test.ts`, which applies the guard before every test.

## Required isolated services

### 1. PostgreSQL

Create a separate Neon project or otherwise independently managed test database. A separate project is preferred over a production branch because it provides a stronger permission and deletion boundary.

- Use a staging-only `DATABASE_URL`.
- Apply the application schema through the existing migration/schema workflow.
- Seed stable rivers and predefined routes with documented test IDs.
- Define a repeatable reset mechanism for mutable tables.
- Never copy production user contact information into staging.

### 2. Supabase Auth

Create a separate Supabase project for staging.

- Configure the staging application URL and permitted redirect URLs.
- Use staging-only `SUPABASE_URL` and `SUPABASE_ANON_KEY` values.
- Create dedicated identities for `paddler_a`, `paddler_b`, `paddler_c`, `driver_pending`, `driver_approved`, and `admin`.
- Use non-personal email addresses controlled by the test team.
- Store passwords only in local `.env` files or GitHub environment secrets.
- Do not place a Supabase service-role key in browser tests or source control.

### 3. Application deployment

Create a separate Render service for the full-stack application, using the same build and start commands as production.

Configure at least:

```text
APP_ENV=staging
DATABASE_URL=<staging database URL>
SUPABASE_URL=<staging Supabase URL>
SUPABASE_ANON_KEY=<staging Supabase anonymous key>
OPENCAGE_API_KEY=<restricted staging key>
GOOGLE_MAPS_API_KEY=<restricted staging key>
```

Any email, SMS, payment, or mapping integration must use a sandbox, fake, or restricted staging configuration. Staging must not send real operational notifications or charge real payment methods.

## QA repository configuration

Create a local `.env` file that is never committed:

```text
TEST_ENV=staging
BASE_URL=https://your-spotr-staging-host.example.com
E2E_USER_EMAIL=<staging identity>
E2E_USER_PASSWORD=<secret>
PADDLER_B_EMAIL=<staging identity>
PADDLER_B_PASSWORD=<secret>
ADMIN_EMAIL=<staging identity>
ADMIN_PASSWORD=<secret>
```

Then verify configuration without executing tests:

```bash
npx playwright test --list
```

## GitHub Actions environment

After the staging deployment is stable, create a protected GitHub environment named `staging`.

Add:

- Secrets: `E2E_USER_EMAIL` and `E2E_USER_PASSWORD`
- Additional secrets for each future staging test identity
- Optional approval protection for state-changing workflow runs

A staging workflow should use `workflow_dispatch` initially. Do not schedule it or run it on every pull request until database reset and test isolation are reliable.

## Reset strategy

Choose one supported approach before writing state-changing tests:

1. Recreate the staging database from a seed snapshot before each suite, or
2. Provide an authenticated test-support reset endpoint enabled only when `APP_ENV=staging`.

The reset must reject production configuration, remove mutable test records, restore role assignments, and preserve only known reference data. Tests should still generate unique names and dates to remain parallel-safe.

## Readiness checklist

- [ ] Staging application has a unique non-production URL.
- [ ] Staging uses an isolated database.
- [ ] Staging uses an isolated Supabase project.
- [ ] Six role-based test identities exist.
- [ ] Email, SMS, and payment integrations cannot affect real users or money.
- [ ] Seed and reset procedures are documented and repeatable.
- [ ] Local staging smoke suite passes with `TEST_ENV=staging`.
- [ ] GitHub `staging` environment contains variables and secrets.
- [ ] A manual CI staging run passes before stateful tests are added to regular CI.
