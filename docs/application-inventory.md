# Spotr application inventory

## Purpose

This inventory records behavior observed during Phase 2 discovery so future tests are based on the application that exists, not assumed features.

## Evidence reviewed

- Production UI at `https://www.riverspotr.com`
- Read-only production API requests on October 16, 2026
- `scottefloyd/spotr` source at the repository's current default branch on October 16, 2026

The application source and deployed environment can drift. A test should confirm a behavior before treating this document as a permanent contract.

## Architecture observed

- React and TypeScript client with Wouter routing and TanStack Query
- Express and TypeScript API
- PostgreSQL accessed through Drizzle ORM
- Supabase email/password authentication using bearer tokens
- External mapping, geocoding, email, SMS, and payment-related dependencies

## User roles

| Role | Primary capabilities |
| --- | --- |
| Visitor | View the landing page, explore rivers and predefined routes, and open public river/route details |
| Paddler | Manage a profile, post shuttle requests, make offers, watch rivers, manage notifications, and view history |
| Driver/operator | Apply as an operator and manage driver inventory, availability, location, and trip responses after approval |
| Administrator | Review applications and manage river/route content |

## UI route inventory

### Public

- `/` landing page
- `/auth` email/password sign-in, sign-up, email confirmation, and password-reset request
- `/explore`
- `/river/:id`
- `/route/:id`
- `/route-browser`
- `/route-plotter`
- `/driver-application` (view is public; submission requires authentication)

### Authenticated

- `/profile`
- `/shuttles`, `/shuttles/new`, and `/shuttles/:id`
- `/notifications`
- `/history`
- `/driver`
- `/admin`
- `/river-mapper`

Unauthenticated navigation to protected client routes is intended to redirect to `/auth` and retain a post-auth destination.

## API inventory

### Confirmed public reads

| Endpoint | Production observation |
| --- | --- |
| `GET /api/rivers` | `200`; array containing 8 rivers |
| `GET /api/predefined-routes` | `200`; array containing 11 routes |
| `GET /api/rivers/:id` | Public by source review; valid and invalid IDs need contract tests |
| `GET /api/locations` | Public by source review |
| `GET /api/locations/search?q=` | Public by source review |
| `GET /api/outfitters` | Public by source review |

### Confirmed authentication boundaries

| Endpoint | Unauthenticated production observation |
| --- | --- |
| `GET /api/auth/user` | `401` with `{"message":"Unauthorized"}` |
| `GET /api/shuttle-requests` | `401` with `{"message":"Unauthorized"}` |

### Stateful domains requiring staging

- Profiles and authentication lifecycle
- Shuttle requests and offers
- River watches and notification preferences
- Trip creation, assignment, acceptance, decline, and status transitions
- Driver applications, inventory, availability, online status, and location
- Ratings and notifications
- Admin approval and route management
- File upload and river-photo management

## Core shuttle lifecycle

1. An authenticated paddler posts an open shuttle request.
2. River watchers and nearby request owners may be notified.
3. A different user can make one offer on an open request.
4. The poster can accept or decline; the offerer can withdraw.
5. Accepting an offer marks the request matched and exposes contact details only to the appropriate users.
6. The request owner can later complete, cancel, or reopen supported states.

This lifecycle combines authorization, privacy, state transitions, database writes, and asynchronous notifications, making it the highest-value staging workflow.

## Discovery constraints

- No accounts were created and no production data was changed.
- Authenticated roles were not exercised because isolated test users are not yet available.
- Notification delivery and third-party mapping behavior were not invoked.
- Source-review security concerns were not dynamically exploited in production.
