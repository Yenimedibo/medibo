# Medibo portable preview shell

VERIFIED — Newly authored preview implementation, not a recovered original source export. Production remains https://bourkia.com. Do not deploy this package as a production replacement.

## Run the staging package

Node.js 22.12 or later and pnpm 10:

```sh
cd site/preview-shell
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The standalone preview defaults to port 4173; set `PORT` to override. For development use `pnpm dev`. Clerk's `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `VITE_CLERK_PUBLISHABLE_KEY` are provisioned through Replit's managed authentication setup. Without them, protected pages and APIs fail closed; do not put these values in the repository.

## Google Sheets setup

- `GOOGLE_SERVICE_ACCOUNT_JSON` is the only spreadsheet credential expected by the server. Configure it through Replit Secrets; never commit it, return it from an API, or put it in browser code.
- The service account uses the Google Sheets `spreadsheets.readonly` scope. Share the specified workbook with its service-account email as a Viewer. The correction package supplies the observed four-tab schema and headers; this Replit session did not independently access the workbook, so its ranges and mappings still need confirmation when service-account access is restored.
- `MEDIBO_EDITOR_USER_IDS` is a comma-separated Replit Secret allowlist of Clerk user IDs. It is empty by default, so no editor receives draft preview until the owner configures it.
- The adapter reads bounded ranges from `Map Events`, `Master Timeline`, `Sources`, and `Methodology`. Public events require `Evidence Status = Fully checked`, `Review Status = Reviewed`, `Publication Status = Approved`, and `Public Event Ready = YES`, as well as valid date/title/description/source data. Only references used by an eligible event are returned from the Sources tab.
- A map feature additionally requires `Map Feature Ready = YES`, `Map Placement Status = Ready`, `Location Accuracy = Exact`, a valid date, and valid coordinates or inline GeoJSON. Geometry IDs/URLs are never fetched. Missing or approximate geography stays in the chronology without a marker.
- The documented `Map Events` headers do not contain a historical-period column. The adapter leaves that field as `Unclassified` rather than treating `Record Type` or another unrelated field as a period; provide an owner-approved mapping/schema change before enabling populated period filters.
- The annual `Master Timeline` and `Methodology` tabs do not document row-level public approval fields, so their content is editor-preview only. The server keeps a private in-memory cache for at most 60 seconds. Client refresh is every 60 seconds. Missing credentials produce a disconnected state; access errors produce a separate error state.
- Do not use a Google Sheets OAuth token or service-account JSON in client code, browser storage, logs, test fixtures or commits. Keep test records synthetic.

Google and email/password options were visible in the Replit-managed Development sign-in UI during browser checks. Provider configuration remains an owner-managed Clerk setting; no successful authentication was performed. Phone OTP is not included. Account creation is free within this staging experience; no billing or payment code is present.

## Boundary

- VERIFIED — `/` remains public. `/courses`, `/timeline-map`, their API, and the staging Workbench handoff require a Clerk session in the package server. `/privacy` and `/account-help` remain public.
- VERIFIED — The course entry and Reality 101 routes serve only the noindex app shell so the browser can retain legacy fragments; the real Clerk UI gates the normal staging flow before their client content/redirect. Approved course `#en/...`/`#dar/...` routes and Reality `#episode-1`/`#episode-2` survive sign-in. The original course and episodes remain independently public on bourkia.com, so this staging gate does not restrict direct production links. All 45 observed download paths/final aliases remain direct read-only 307 handoffs; none is gated or copied.
- VERIFIED — Workbench links in the staging shell require sign-in before the fixed-origin live handoff; a signed-in direct staging request still receives the original 307 handoff. Privacy remains a public fixed-origin handoff. Production documents are not fetched or proxied by this package. Preview-origin storage is never read, written, cleared, exported, imported or synchronized.
- VERIFIED — Clerk sessions are validated server-side for protected page requests and Timeline Map API requests. The browser uses Clerk's session cookies; no bearer token or local user database was added. Auth-provider telemetry is disabled.
- VERIFIED — The Timeline Map uses bundled Natural Earth 110m geography without tile requests. It requires a date and explicitly verified coordinates or geometry for a map feature; uncertain or incomplete records remain chronological only. Server filtering excludes draft, pending, private, disputed-review, and rejected records from visitor mode. Editor preview is withheld unless the server-side Clerk ID allowlist permits it.
- VERIFIED — Malformed URL targets return 400 without falling through. Vite development/built-preview guards run before Connect's request-target parser; the standalone server uses the same handoff middleware.
- VERIFIED — Existing course/Workbench implementation, languages, RTL, storage and download payloads are not copied or altered. They remain external production dependencies. No server proxy sees their payloads.
- VERIFIED — Existing episode video/poster URLs are used directly, with native playback controls and no autoplay.
- VERIFIED — HTML robots metadata, robots.txt and the server's X-Robots-Tag mark this preview noindex/nofollow. Noindex is not access control.
- UNKNOWN — Full portable parity and offline independence are not achieved. Course, Workbench, privacy text and media depend on the live production origin. Hosting provider request logging is outside this frontend.
- VERIFIED — This package is INELIGIBLE for production-origin cutover: fixed-origin handoffs would redirect to themselves there, and the original feature implementations are absent. No production/indexable mode or self-origin deployment guard is introduced. Noindex remains mandatory but is not access control or a deployment safeguard.
- VERIFIED — Route-specific titles/descriptions/OG are set after JavaScript runs. Static per-page/pre-rendered metadata and a canonical remain absent.

## Checks

```sh
pnpm typecheck
pnpm build
pnpm test:contracts
```

The contract and map-data tests use observed URL metadata and synthetic rows only, not private browser records or spreadsheet values. `pnpm start` serves the server-backed staging package. A static-only host does not provide its required auth and spreadsheet API, so this package is not eligible for production cutover. Do not upload `dist/` blindly to a host that would shadow the course subtree.
