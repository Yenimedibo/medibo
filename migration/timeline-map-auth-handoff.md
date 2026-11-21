# The Timeline Map and project access — review handoff

Code commit: `d489f34fe7f9e01e3ed0c304a84796e9b986cbb8`

Branch: `feature/timeline-map-auth`

Base: `cc01cc0b2ed0b193f16283742a5a501ec035be9c` (`presentation/editorial-project-slides`)
Status: draft PR #5 open, unmerged

Draft PR: https://github.com/Yenimedibo/medibo/pull/5

## 1. What I inspected

- VERIFIED — Read repository governance, manifests, existing presentation, server/compatibility routing, course and episode links, download inventory, package manager/lockfile, and current test contracts before making changes.
- VERIFIED — The accepted feature branch starts from the latest local PR #4 head. The separate GitHub source branch, CI change, existing Replit artifact, and production site were not modified.
- VERIFIED — Used synthetic spreadsheet rows and fresh isolated browser contexts only. No private Google workbook values or actual browser/user records were read. The Google Sheets integration card was dismissed, so no integration connection was attempted.
- UNKNOWN — The repository is not a complete original source export. Production-side Workbench, course internals, privacy implementation, user records and spreadsheet contents were not inspected as part of this task.

## 2. What changed / why

- VERIFIED — Added a mobile-first interactive map using bundled Natural Earth 110m geography, d3-geo projection and no external map tiles. It supports pan/zoom, year range 500–2026, region/event type/period filters, linked records, details, source links, confidence/verification labels, and list-only incomplete geography.
- VERIFIED — The basemap is labeled as modern reference outlines, not historical borders. Only date-valid records with verified coordinates or verified geometry can create map features; disputed polygons, invalid coordinates, and undated records do not get markers.
- VERIFIED — Added server-side read-only access to `Map Events`, `Master Timeline`, and `Sources and Methodology`, with 60-second caching/refresh, approval/publication filtering, a server-enforced editor-ID allowlist, and truthful disconnected/error/no-approved-data states. No demo history was added.
- VERIFIED — Added real Clerk sign-in/create-account UI with Google and email/password options, server enforcement for the local Courses landing, Timeline Map/API, and Workbench handoff, safe return targets, free account creation, and public account-help/privacy links. Phone OTP is not offered.
- VERIFIED — Course entry and Reality 101 shell routes preserve allowed legacy hashes before the client sign-in flow. The existing production course, media, downloads, Workbench and privacy destinations are still live-origin handoffs; no internals or production data were copied or changed.
- VERIFIED — No analytics, app database, cloud storage for entries, AI submission, course/Workbench/privacy rewrite, or CI workflow was added. Clerk telemetry is disabled.

## 3. Files / sections affected

- VERIFIED — `site/preview-shell/src/pages/TimelineMap.{tsx,css}`, `src/lib/timeline.ts`, `server/timelineData.mjs`, and its synthetic-data tests implement map rendering, validation, filtering and Sheets read logic.
- VERIFIED — `src/App.tsx`, `src/components/{AuthPages,ProjectAccessLink,LiveDestination,Shell}`, `src/lib/access*`, `server/previewApp.mjs`, `server/clerkProxyMiddleware.mjs`, `server.mjs`, `compatibility.mjs`, and the Vite/standalone tests implement auth, handoffs and routing.
- VERIFIED — `site/preview-shell/package.json` and `pnpm-lock.yaml` add the required server/auth/map dependencies; `site/preview-shell/README.md`, `CHANGELOG.md`, and this handoff record the setup and limits.
- VERIFIED — Original course, Workbench, privacy, media, downloads, storage namespaces, current production configuration, other artifacts and CI branch were not edited.

## 4. Risks or uncertainties

- UNKNOWN — No actual Sheets connection was made. Confirm the workbook headers and sharing before relying on the adapter. If not already configured, add `GOOGLE_SERVICE_ACCOUNT_JSON` through Replit Secrets using a read-only service account, share the workbook with that account as Viewer, and set `MEDIBO_EDITOR_USER_IDS` through Replit Secrets for authorized Clerk user IDs. Never paste the credential into chat or repository files.
- UNKNOWN — No successful sign-in, account creation, Google provider callback, persistent session, or post-login browser session was exercised. The visible Google/email choices are the Clerk UI, not evidence that provider settings are complete. Enable/configure Google in the managed Clerk settings before claiming it works.
- VERIFIED — `/courses`, `/timeline-map`, `/api/timeline-map`, and `/workbench` are server-protected. Course and Reality 101 direct entry uses a noindex shell plus the real client Clerk flow to retain hash routes; the shell contains no course or episode content. This cannot restrict direct access to the existing public production course, episodes or downloads without changing bourkia.com.
- VERIFIED — The disconnected response intentionally contains no events. The map has no historical claims to validate until approved data is connected. Natural Earth geography is a modern reference basemap, not a historical-boundary dataset.
- VERIFIED — The existing Replit `artifacts/medibo: web` workflow still serves the separate current artifact. This branch was exercised on an isolated local Vite/standalone preview; it has not been installed into or substituted for the registered artifact preview.
- UNKNOWN — Exact parity, deployed auth/provider operation, live synchronization, exhaustive download payload integrity, cross-browser/assistive-technology conformance, and production readiness remain unverified.

## 5. Validation performed

- VERIFIED — At the source tree recorded by code commit `d489f34fe7f9e01e3ed0c304a84796e9b986cbb8`: `pnpm typecheck`, `pnpm build`, `pnpm test:contracts` (**18 passed, 0 failed**) and `git diff --check` passed. The build produced the Vite client and server-backed preview.
- VERIFIED — Contract tests covered malformed target 400 handling, protected routes/API, all 45 observed download paths/aliases, approved/public and editor-only row filtering, draft/rejected isolation, missing credentials, invalid or approximate geography, synthetic year/location edits, and allowlisted return targets.
- VERIFIED — Fresh isolated Chromium checks at 390px confirmed public Home/noindex/no horizontal overflow; project click opens the Clerk dialog with Google/email options and public help/privacy; mobile menu Enter/Escape restores toggle focus; direct course `#dar/04` and Reality `#episode-2` preserve the intended return target; reduced-motion emulation uses non-smooth scrolling.
- VERIFIED — A temporary, untracked synthetic map harness confirmed a verified marker/details/source link, omitted marker for an undated record, keyboard zoom, region filtering, and a simulated sheet refresh changing the event from year 1200 to 1412 and moving its marker. The harness was removed before commit. No application browser errors were observed.
- VERIFIED — Standalone HTTP checks returned public Home/account-help, sign-in redirects for protected local pages, 401 for the unauthenticated map API, direct 307 handoffs for observed downloads/privacy, and the noindex shell for course/Reality entry routes. Redirects were not followed to production.
- UNKNOWN — No actual Google Sheets request or successful Clerk sign-in was performed; the above tests use synthetic rows and a signed-out browser. No published preview, merge or deployment was started.

## 6. Recommended next reviewer / stop

- PROPOSED — Claude reviews server/auth boundaries, spreadsheet status semantics and data minimization. Gemini reviews phone layout, map controls and accessible interaction. ChatGPT reconciles feedback against the existing branch protections; the owner decides whether provider/workbook setup is approved.
- VERIFIED — Draft PR #5 targets `presentation/editorial-project-slides`, the exact base of this branch. Targeting the older `implementation/portable-website-shell` branch would include the unmerged PR #4 presentation commits in the diff.
- VERIFIED — No production deployment is recommended. Keep this as private staging; do not merge, publish, change access/domain/DNS, or modify bourkia.com.
