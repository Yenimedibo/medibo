# The Timeline Map and project access — review handoff

Code commit: `e2cc114fdfefe3f74748b2d57bcc4421c7aaf972`

Branch: `feature/timeline-map-auth`

Base: `cc01cc0b2ed0b193f16283742a5a501ec035be9c` (`presentation/editorial-project-slides`)
Status: draft PR #5 open, unmerged

Draft PR: https://github.com/Yenimedibo/medibo/pull/5

## 1. What I inspected

- VERIFIED — Read repository governance, manifests, existing presentation, server/compatibility routing, course and episode links, download inventory, package manager/lockfile, and current test contracts before making changes.
- VERIFIED — The accepted feature branch starts from the latest local PR #4 head. The separate GitHub source branch, CI change, existing Replit artifact, and production site were not modified.
- VERIFIED — Compared the supplied correction ZIP (SHA-256 `91bc263dd42cb3a6992faea09e3f1a7d5f905fd2098838ee7c4b954c524b621f`) against the current adapter and its schema handoff. The package reports prior authorized Drive inspection of the real headers; this Replit session did not independently access the workbook.
- VERIFIED — Used synthetic spreadsheet rows and a fresh signed-out local browser only. No private Google workbook values or actual browser/user records were read. No Google Sheets runtime request was made.
- UNKNOWN — The repository is not a complete original source export. Production-side Workbench, course internals, privacy implementation, user records and spreadsheet contents were not inspected as part of this task.

## 2. What changed / why

- VERIFIED — Added a mobile-first interactive map using bundled Natural Earth 110m geography, d3-geo projection and no external map tiles. It supports pan/zoom, year range 500–2026, region/event type/period filters, linked records, details, source links, confidence/verification labels, and list-only incomplete geography.
- VERIFIED — Added server-driven visitor layer definitions and independent accessible switches for Historical Events (default on), Climate & Natural Disasters (default off), and Trade Routes & Resources (default off). Layer choices filter the map and chronology together and can all be off; the control list is generated from the sheet response so approved future categories do not require a UI rebuild. Blank defaults fall back to the requested defaults; unknown categories default off.
- VERIFIED — The adapter reads the new `Map Events` fields in AI–AK as Map Layer ID, Layer Subtype, and Linked Map Feature ID. Layer subtype and linked feature metadata are retained with records; source-supported geometry gates remain unchanged.
- VERIFIED — The basemap is labeled as modern reference outlines, not historical borders. Only date-valid records with verified coordinates or verified geometry can create map features; disputed polygons, invalid coordinates, and undated records do not get markers.
- VERIFIED — Extended the bounded read-only reader to `Map Events` (`A1:AK2500`) and `Map Layers` (`A1:Z200`), retaining `Master Timeline` (`A4:D1531`), `Sources` (`A1:D200`), and `Methodology` (`A1:B100`). It keeps the read-only Sheets scope, 60-second cache, server-side editor allowlist, and truthful disconnected/error/empty responses.
- VERIFIED — Public events now require `Evidence Status = Fully checked`, `Review Status = Reviewed`, `Publication Status = Approved`, `Public Event Ready = YES`, plus valid date, title, description, and resolved sources. Sources IDs resolve against the Sources tab; the complete private catalog is not returned. Drafts and unapproved context/methodology are editor-preview only; rejected records are excluded.
- VERIFIED — Public map features additionally require `Map Feature Ready = YES`, `Map Placement Status = Ready`, `Location Accuracy = Exact`, a valid date, and valid coordinates or inline valid GeoJSON. URL/ID geometry is not fetched. Disputed dates are labeled as disputed; approximate/incomplete geography has no marker.
- VERIFIED — The documented Map Events header list has no historical-period field. The adapter does not infer one from `Record Type`; it returns `Unclassified`. The existing period filter therefore has no populated historical categories until an owner-approved schema mapping is provided.
- VERIFIED — Timeline details now display date precision and location name; editor-only annual context/methodology and Methodology `Rule` text are labeled and rendered instead of being silently dropped.
- VERIFIED — Added real Clerk sign-in/create-account UI with Google and email/password options, server enforcement for the local Courses landing, Timeline Map/API, and Workbench handoff, safe return targets, free account creation, and public account-help/privacy links. Phone OTP is not offered.
- VERIFIED — Course entry and Reality 101 shell routes preserve allowed legacy hashes before the client sign-in flow. The existing production course, media, downloads, Workbench and privacy destinations are still live-origin handoffs; no internals or production data were copied or changed.
- VERIFIED — No analytics, app database, cloud storage for entries, AI submission, course/Workbench/privacy rewrite, or CI workflow was added. Clerk telemetry is disabled.

## 3. Files / sections affected

- VERIFIED — `site/preview-shell/server/timelineData.mjs` and `server/timelineData.test.mjs` implement the schema-aligned reader, layer/default parsing, public/editor filtering, source lookup, field validation, and synthetic integration tests.
- VERIFIED — `site/preview-shell/src/pages/TimelineMap.{tsx,css}` and `src/lib/timeline.ts` render dynamic layer switches, apply selected layers to map/list/filter data, and retain the existing date/location precision and editor-only methodology behavior.
- VERIFIED — `src/App.tsx`, `src/components/{AuthPages,ProjectAccessLink,LiveDestination,Shell}`, `src/lib/access*`, `server/previewApp.mjs`, `server/clerkProxyMiddleware.mjs`, `server.mjs`, `compatibility.mjs`, and the Vite/standalone tests implement auth, handoffs and routing.
- VERIFIED — `site/preview-shell/package.json` and `pnpm-lock.yaml` add the required server/auth/map dependencies; `site/preview-shell/README.md`, `CHANGELOG.md`, and this handoff record the setup and limits.
- VERIFIED — Original course, Workbench, privacy, media, downloads, storage namespaces, current production configuration, other artifacts and CI branch were not edited.

## 4. Risks or uncertainties

- UNKNOWN — No actual Sheets connection was made. The current code expects common layer ID/name/default headers and accepts aliases; confirm the actual `Map Layers` column labels, approval semantics, and bounded ranges against the workbook when service-account access returns. Configure `GOOGLE_SERVICE_ACCOUNT_JSON` through Replit Secrets using a read-only service account, share the workbook as Viewer, and set `MEDIBO_EDITOR_USER_IDS` through Replit Secrets for authorized Clerk user IDs. Never paste credentials into chat or repository files.
- UNKNOWN — The workbook may exceed the bounded ranges `Map Events A1:AK2500`, `Map Layers A1:Z200`, `Master Timeline A4:D1531`, `Sources A1:D200`, or `Methodology A1:B100`. Confirm bounds before relying on complete coverage.
- VERIFIED — The documented Map Events schema has no dedicated historical-period column; records remain `Unclassified` rather than using `Record Type` as an unverified substitute.
- UNKNOWN — No successful sign-in, account creation, Google provider callback, persistent session, or post-login browser session was exercised. The visible Google/email choices are the Clerk UI, not evidence that provider settings are complete. Enable/configure Google in the managed Clerk settings before claiming it works.
- VERIFIED — `/courses`, `/timeline-map`, `/api/timeline-map`, and `/workbench` are server-protected. Course and Reality 101 direct entry uses a noindex shell plus the real client Clerk flow to retain hash routes; the shell contains no course or episode content. This cannot restrict direct access to the existing public production course, episodes or downloads without changing bourkia.com.
- VERIFIED — The disconnected response intentionally contains no events. The map has no historical claims to validate until approved data is connected. Natural Earth geography is a modern reference basemap, not a historical-boundary dataset.
- VERIFIED — The existing Replit `artifacts/medibo: web` workflow still serves the separate current artifact. This branch was exercised on an isolated local Vite/standalone preview; it has not been installed into or substituted for the registered artifact preview.
- UNKNOWN — Exact parity, deployed auth/provider operation, live synchronization, exhaustive download payload integrity, cross-browser/assistive-technology conformance, and production readiness remain unverified.

## 5. Validation performed

- VERIFIED — At code commit `e2cc114fdfefe3f74748b2d57bcc4421c7aaf972`, `pnpm typecheck`, `pnpm build`, `pnpm test:contracts` (**28 passed, 0 failed**) and `git diff --check` passed. The Vite build transformed 143 modules.
- VERIFIED — The Timeline Map test suite covers the bounded sheet ranges, AI–AK source mapping, exact approval and geography rules, editor-only draft layers/records, source-ID resolution and unsafe URLs, filters across selected layers, changed defaults, all-off behavior, dynamic future categories, missing credentials, geometry validation and remote-geometry non-fetch.
- VERIFIED — Fresh isolated Chromium testing used only synthetic API fixtures and a temporary local component harness: the three defaults rendered as `true/false/false`; independent and combined selections updated map markers and chronology together; Space toggled a focused switch without losing focus; all switches off produced zero visible records and markers; a 390px viewport had 390px document width with no horizontal overflow.
- VERIFIED — A fresh isolated HTTP/browser smoke confirmed Home returns 200 and renders the personal Home shell; `/timeline-map` redirects to sign-in with `returnTo=/timeline-map`; the signed-out map API returns 401; Workbench redirects to sign-in; Privacy handoff and public account-help routes behave as expected. The sign-in DOM displayed Google/email options and the noindex metadata.
- UNKNOWN — The layer browser check did not authenticate, read real user/browser storage, inspect private records, or contact Google Sheets. The earlier sign-in smoke cited above belongs to the prior code commit and is not a newly repeated authentication check. No production redirect was followed.

## 6. Recommended next reviewer / stop

- PROPOSED — Claude reviews server/auth boundaries, spreadsheet status semantics and data minimization. Gemini reviews phone layout, map controls and accessible interaction. ChatGPT reconciles feedback against the existing branch protections; the owner decides whether provider/workbook setup is approved.
- VERIFIED — Draft PR #5 targets `presentation/editorial-project-slides`, the exact base of this branch. Targeting the older `implementation/portable-website-shell` branch would include the unmerged PR #4 presentation commits in the diff.
- VERIFIED — No production deployment is recommended. Keep this as private staging; do not merge, publish, change access/domain/DNS, or modify bourkia.com.
