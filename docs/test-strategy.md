# Spotr risk-based test strategy

## Objective

Provide fast evidence that Spotr's most important user journeys are available, authorized correctly, and preserve user data and privacy. The framework should demonstrate deliberate test-layer selection rather than reproducing every scenario through the browser.

## Environment policy

| Environment | Allowed coverage |
| --- | --- |
| Production | Idempotent, read-only availability, public content, navigation, and unauthenticated authorization checks |
| Staging | Full E2E, API, integration, boundary, negative, role, notification, and destructive lifecycle tests |
| Local/test database | Schema validation, exhaustive edge cases, failure injection, and data cleanup experiments |

Production tests must not create accounts, submit forms, send notifications, upload files, change status, or depend on mutable record counts.

## Risk assessment

Priority combines user/business impact, likelihood, security/privacy exposure, and difficulty of detecting a failure manually.

| Priority | Area | Principal risks | Planned evidence |
| --- | --- | --- | --- |
| P0 | Authorization and admin controls | Privilege escalation, unauthenticated mutation, role bypass | Source review, unauthenticated API tests, paddler/driver/admin authorization matrix in staging |
| P0 | Contact-data privacy | Email or phone disclosed before a shuttle offer is accepted | API integration tests using owner, offerer, unrelated user, and anonymous contexts |
| P1 | Shuttle request/offer lifecycle | Invalid transitions, duplicate offers, wrong-owner updates, lost matches | API state-transition tests plus one critical E2E journey |
| P1 | Authentication/session lifecycle | Failed redirect restoration, stale sessions, incorrect `401` handling, account lockout gaps | API and browser tests using dedicated accounts and saved Playwright storage state |
| P1 | Notifications | Missed, duplicate, or incorrect-recipient email/SMS/in-app notifications | Staging integration tests with fake providers or captured delivery sinks |
| P1 | Trip and driver workflows | Incorrect assignment/status, unverified drivers accepting work, pricing/inventory errors | Role-based API tests and focused E2E coverage |
| P2 | River and route discovery | Empty/broken content, inaccurate details, invalid-ID handling, search problems | Production-safe API contracts and UI/API integration tests |
| P2 | Date, time, and location handling | Time-zone date shifts, invalid coordinates, route calculation errors | Boundary tests around DST, UTC dates, coordinates, and external-service errors |
| P2 | Cross-browser/responsive UI | Navigation or forms fail outside Chromium or on small viewports | Critical smoke coverage in three engines; targeted mobile projects later |
| P3 | Visual polish and secondary content | Layout regressions or stale copy | Exploratory testing and selective visual comparisons after UI stabilizes |

## Test layers

### API tests

Use Playwright's request context for status, schema, validation, authorization, and state-transition coverage. API tests should own most positive, negative, and boundary combinations because they are faster and more diagnostic than browser tests.

### Integration tests

Verify boundaries where failures are especially costly:

- Public river API data is represented correctly in the UI.
- Accepted shuttle offers update request state and contact-data visibility.
- Authentication tokens resolve to the correct application user and role.
- New requests select the correct notification recipients without duplicates.

### End-to-end tests

Reserve browser journeys for a small set of user-critical outcomes:

- Visitor discovers a river and route.
- Paddler signs in, posts a request, and sees it on the board.
- Another paddler offers; the owner accepts; both see the matched state.
- Approved driver receives and responds to an eligible trip.
- Administrator reviews an application without exposing admin actions to other roles.

### Exploratory and manual testing

Use charters for usability, ambiguous state transitions, mobile behavior, accessibility, third-party failures, and notification content. Record reproducible defects with environment, evidence, impact, and expected behavior.

## Test data and identities

Staging should provide seeded, resettable identities:

- `paddler_a` — request owner
- `paddler_b` — offerer
- `paddler_c` — unrelated user for privacy/authorization checks
- `driver_pending`
- `driver_approved`
- `admin`

Data should include rivers and routes with stable IDs plus open, matched, completed, and cancelled requests. Tests must create unique data per run and clean it through a supported API or database reset—not shared production records.

Authentication state should be created in a staging-only setup project and saved as Playwright storage state. Secrets and state files must remain ignored by Git.

## Non-functional coverage

- Accessibility: semantic landmarks, names, keyboard navigation, focus order, dialog focus, and automated axe scans when added
- Performance: smoke-level navigation and API response budgets, avoiding brittle hard thresholds in shared CI
- Reliability: retry only in CI, preserve traces/reports, and investigate flaky tests instead of masking them
- Security: authentication, authorization, input validation, sensitive-data exposure, file upload constraints, and debug-route removal
- Compatibility: Chromium, Firefox, and WebKit for smoke; representative mobile viewports for prioritized journeys

## Release gates

A candidate is not ready when:

- Any P0 test fails.
- The production-safe smoke suite fails in a supported browser.
- A critical P1 journey fails without an accepted risk.
- A migration or API change lacks rollback and data-integrity evidence.
- Test evidence indicates cross-user data access or sensitive-data disclosure.

P2/P3 failures require triage based on reach, workaround, and regression risk.

## Implementation sequence

1. Add production-safe contracts for `GET /api/rivers`, including schema and invalid-ID behavior.
2. Add a UI/API integration check for public river content.
3. Establish a staging environment, seeded identities, and a reset strategy.
4. Build an authorization matrix at the API layer before automating stateful browser flows.
5. Automate the shuttle request/offer lifecycle as the first staging vertical slice.
6. Add notification, driver, admin, accessibility, and mobile coverage based on measured risk.

## Entry requirements for stateful automation

- Isolated staging database and Supabase project
- Dedicated test identities for each role
- Agreed reset/cleanup mechanism
- Safe email/SMS capture or fake provider
- Stable environment URL and CI secrets
- Resolution or explicit acceptance of the P0 security finding in `docs/bug-reports/`

## Exit criteria for Phase 2

- Application surfaces and environment constraints are documented.
- Risks are prioritized and mapped to appropriate test layers.
- Initial manual cases are reviewable.
- Security findings are recorded without changing production data.
- The next automation milestone is small, safe, and evidence-based.
