# Initial prioritized test cases

These cases are design artifacts from Phase 2 discovery. `PROD-RO` cases are safe for read-only production execution. `STAGE` cases require isolated staging data and accounts.

| ID | Env | Priority | Scenario | Expected result |
| --- | --- | --- | --- | --- |
| PUB-001 | PROD-RO | P1 | Open the homepage in each supported browser | Successful document response and visible primary heading |
| PUB-002 | PROD-RO | P2 | Request the public rivers collection | `200`, JSON array, and each river satisfies the agreed schema |
| PUB-003 | PROD-RO | P2 | Open a valid public river from API data | River detail loads and identifies the selected river |
| PUB-004 | PROD-RO | P2 | Request an unknown river ID | Stable `404` contract without server details or stack traces |
| AUTH-001 | PROD-RO | P0 | Request a protected resource without credentials | `401`; no protected data is returned |
| AUTH-002 | STAGE | P1 | Open a protected UI route while signed out, then sign in | User returns to the intended route with one valid session |
| AUTH-003 | STAGE | P0 | Access admin API/UI as visitor, paddler, pending driver, and approved driver | All non-admin identities receive `401` or `403` and no admin data |
| SHUT-001 | STAGE | P1 | Post a valid shuttle request | One open request is created for the authenticated owner |
| SHUT-002 | STAGE | P1 | Submit missing, malformed, past-date, and boundary request data | Validation rejects invalid data with `400`; no record is created |
| SHUT-003 | STAGE | P0 | Offer on a request as owner, unrelated user, and duplicate offerer | Owner and duplicates are rejected; one valid non-owner offer succeeds |
| SHUT-004 | STAGE | P0 | View a pending offer as owner, offerer, and unrelated user | Contact data is redacted until acceptance and never visible to unrelated users |
| SHUT-005 | STAGE | P1 | Accept an offer as the request owner | Offer becomes accepted, request becomes matched, and both parties receive correct access |
| SHUT-006 | STAGE | P0 | Accept/decline another user's offer as an unrelated user | `403`; offer and request states remain unchanged |
| NOTIF-001 | STAGE | P1 | Post a request matching river watches and adjacent trips | Correct recipients get one notification each; excluded users get none |
| DRIVER-001 | STAGE | P1 | Attempt driver-only actions before and after approval | Pending/non-driver identities are blocked; approved driver succeeds |
| ADMIN-001 | STAGE | P0 | Approve an operator application as admin | Application and user role transition atomically with an audit trail |
| DATE-001 | STAGE | P2 | Create/view trips around DST and UTC-midnight boundaries | Calendar date remains the user-selected date in supported US time zones |

Detailed preconditions, data, and cleanup steps should be added when staging identities and reset mechanics are defined.
