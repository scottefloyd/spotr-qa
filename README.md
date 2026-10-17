# Spotr QA Automation

An independently maintained QA automation portfolio for [Spotr](https://www.riverspotr.com), a marketplace connecting paddlers with shuttle drivers. The project uses Playwright and TypeScript to demonstrate maintainable browser, API, and integration testing practices.

## Current scope

Phase 1 provides a production-safe smoke suite. It performs read-only checks only: no accounts are created, no forms are submitted, and no production records are modified. Full end-to-end and destructive coverage will require an isolated staging environment and test data.

The smoke suite verifies the homepage in Chromium, Firefox, and WebKit. A separate API project validates the production-safe public river collection, detail, and not-found contracts once per run. A Chromium integration project confirms that river data returned by the API is discoverable through the public UI and resolves to the matching detail page.

## Project structure

```text
.github/workflows/  CI configuration
docs/bug-reports/   Reproducible defect reports
fixtures/            Shared Playwright fixtures (future coverage)
pages/               Page objects for repeated workflows
tests/api/           REST API tests
tests/e2e/           Browser journeys and smoke tests
tests/integration/   Cross-component tests
utils/               Shared test utilities
```

Empty directories are reserved for planned coverage; abstractions will be added only when real tests require them.

## Prerequisites

- Node.js 22 or newer
- npm

## Local setup

```bash
npm ci
npx playwright install
cp .env.example .env
npm run test:smoke
```

`BASE_URL` controls the target environment without changing test code:

```bash
BASE_URL=https://staging.example.com npm run test:smoke
```

The default is the working production host, `https://www.riverspotr.com`. Production execution must remain read-only. The advertised apex host was unreachable during initial verification; details are recorded in [the defect report](docs/bug-reports/production-apex-domain-timeout.md).

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run the complete suite |
| `npm run test:api` | Run the API project |
| `npm run test:integration` | Run the integration project |
| `npm run test:smoke` | Run tests tagged `@smoke` |
| `npm run test:headed` | Run with visible browsers |
| `npm run test:debug` | Open Playwright Inspector |
| `npm run typecheck` | Validate TypeScript |
| `npm run report` | Open the last HTML report |

On failure, Playwright retains a screenshot and video. A trace is captured on the first retry, balancing diagnostics with local execution cost.

## Continuous integration

GitHub Actions runs the read-only smoke suite on pushes and pull requests targeting `main`. It installs all Playwright browsers and uploads the HTML report for 14 days. CI status is not claimed until the workflow has run successfully in GitHub.

## Testing principles

- Prefer accessible, user-facing locators over implementation details.
- Keep production checks idempotent and read-only.
- Store environment values in configuration and secrets outside source control.
- Add page objects and fixtures when repetition justifies them.
- Treat failures as diagnostic evidence, not merely red builds.

## Next phase

Phase 2 discovery is documented in the [application inventory](docs/application-inventory.md), [risk-based test strategy](docs/test-strategy.md), and [prioritized test cases](docs/test-cases.md). The next automation milestone is production-safe API contract coverage for the public rivers endpoint.
