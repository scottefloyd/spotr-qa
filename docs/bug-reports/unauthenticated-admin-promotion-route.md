# Potential unauthenticated admin-promotion route

## Status

Source-review finding. Dynamic reproduction was intentionally not attempted against production because the operation changes privileges and data.

## Severity

Critical / P0

## Evidence

During source review on October 16, 2026, `server/routes.ts` registered:

```text
POST /api/admin/make-admin-by-id
```

The handler accepts `userId` and calls the admin-promotion storage method without the authentication middleware or an administrator-role check used by the neighboring admin routes.

Temporary endpoints that echo authentication data or return request/session debug data were also registered publicly. Even when intended for diagnosis, these expand the production attack surface and can expose sensitive metadata.

## Risk

If the reviewed route is deployed and reachable, an unauthenticated caller who knows or obtains a user ID may be able to grant administrator privileges. Administrator access includes application review and route-management capabilities.

## Expected behavior

- No public endpoint can grant or modify roles.
- Privileged changes require a valid authenticated administrator and server-side authorization.
- Temporary debug endpoints are disabled or removed in production.
- Privilege changes are audited and covered by negative authorization tests.

## Recommended remediation

1. Disable or remove the setup route immediately.
2. Review production logs and user-role history for unexpected promotions.
3. Apply the same authentication and `isAdmin` authorization checks used by other admin handlers if a promotion endpoint is still required.
4. Remove public auth-debug and authorization-echo endpoints from production builds.
5. Add an API authorization matrix covering anonymous, paddler, driver, and administrator identities.
6. Validate the fix in staging; do not probe the mutating route in production.

## Verification plan

In staging, confirm anonymous and non-admin requests receive `401` or `403`, no role changes occur, an authorized admin can perform the intended operation, and an audit record identifies the requester and target user.
