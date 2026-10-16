# Production apex domain timeout

## Summary

`https://riverspotr.com` did not return a response during Phase 1 verification, while `https://www.riverspotr.com` returned the application successfully.

## Observation

- Observed: October 16, 2026
- Environment: Production
- Request: Read-only HTTPS navigation to `/`
- Expected: The apex domain redirects to, or serves, the production application.
- Actual: The request timed out after 30 seconds. The `www` host returned HTTP 200.

## Impact

Users following the advertised apex URL may be unable to reach Spotr. The automation framework temporarily uses the working `www` host as its default `BASE_URL`.

## Follow-up

Confirm the apex-domain forwarding and DNS configuration, then retest from multiple networks before closing this report.
