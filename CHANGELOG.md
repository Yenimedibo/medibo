# 2026-11-21 — Excluded retired timeline layers

- VERIFIED — Code commit `2b9f567df7cf264972da812b5d43c72702b1046b` on `feature/timeline-map-auth` excludes `Retired` layers and their events from both public mode and editor preview. Public mode still admits only `Active` layers; hidden layers may be available only in editor preview.
- VERIFIED — Missing or unrecognized `Layer Status` remains fail-closed for visitor access. Active layers still require the existing per-event approval checks. The actual schema's research notes and other internal layer fields are not returned to visitors.
- VERIFIED — Fresh `pnpm typecheck`, `pnpm build`, and full `pnpm test:contracts` passed (**28 tests, 0 failed**).
- UNKNOWN — Google Sheets synchronization and authorized Clerk login were not tested. No merge, deployment, or production change occurred.

# 2026-11-21 — Matched layer parsing to the actual workbook schema

- VERIFIED — Code commit `7374f9601e258db4f8408a964bd59531dd458e19` on `feature/timeline-map-auth` now reads the owner-supplied `Map Layers` headers: `Layer ID`, `Visitor Label`, `Default Visible`, `Order`, and `Layer Status`, while retaining supported aliases.
- VERIFIED — Public layers require `Layer Status = Active`; `Hidden`, `Retired`, missing, and unrecognized statuses fail closed. Event-level publication checks remain required. Research notes, included topics, supported geography, and publication-rule text are not returned in public layer data.
- VERIFIED — Synthetic tests now use the actual nine-column sheet header, confirm labels and defaults, exclude inactive/unrecognized layers and their events, verify active future categories/events, preserve legacy aliases, and cover independent, combined, and all-off selection.
- VERIFIED — Fresh `pnpm typecheck`, `pnpm build`, and the full `pnpm test:contracts` suite passed (**28 tests, 0 failed**).
- UNKNOWN — No Google Sheets connection or authorized Clerk sign-in was performed. No live sync or authentication success is claimed.
- VERIFIED — Only the existing PR #5 feature branch is in scope; no merge, deployment, production-domain change, or bourkia.com modification occurred.

# 2026-11-21 — Added expandable Timeline Map layers

- VERIFIED — Code commit `e2cc114fdfefe3f74748b2d57bcc4421c7aaf972` on `feature/timeline-map-auth` adds the expandable layer controls to draft PR #5. The separate CI PR, other branches, and production were not changed.
- VERIFIED — Added a server-side read-only `Map Layers` range and extended `Map Events` through column AK for Map Layer ID, Layer Subtype, and Linked Map Feature ID. Definitions and defaults are read from the layer tab; the three requested defaults are used only if their sheet default is blank, and unknown categories default off.
- VERIFIED — Dynamic accessible switches apply the same layer selection to map features, chronology, and filter choices. Synthetic checks cover independent and combined selections, all-off, date/region/type filtering, rejected or draft layer visibility, sheet-default overrides, source-approved shapes, and future categories.
- VERIFIED — Fresh `pnpm typecheck`, `pnpm build`, and `pnpm test:contracts` passed (**28 tests, 0 failed**). A fresh isolated Chromium run with synthetic API fixtures confirmed initial switches, independent/combined toggles, Space-key operation with focus retained, all-off empty map/list, and no horizontal overflow at 390px.
- UNKNOWN — No live Google Sheets connection or actual workbook schema check was performed. The preview still needs the owner-configured `GOOGLE_SERVICE_ACCOUNT_JSON`, Viewer sharing for the service account, and confirmation of the Map Layers header names/ranges. Real Clerk authentication remains untested with authorized accounts.
- VERIFIED — No historical records, coordinates, routes, or resources were fabricated. No merge, publish, deployment, access/domain/DNS change, or bourkia.com modification occurred; no production deployment is recommended.

# 2026-11-21 — Corrected Timeline Map spreadsheet integration

- VERIFIED — Code commit `f94e00c76e222727cd582b5e87a2e4982139efd3` replaces the prior broad-alias adapter/tests on `feature/timeline-map-auth`. Draft PR #5 remains the target; no merge, deploy, publish, DNS/domain/access change, or production edit occurred.
- VERIFIED — Integrated the supplied schema-specific, bounded, read-only reader for `Map Events`, `Master Timeline`, `Sources`, and `Methodology`; enforced the documented evidence/review/publication/readiness fields; resolved source IDs without exposing the source catalog; and kept unapproved context/methodology editor-only.
- VERIFIED — Added safe source reference parsing, stricter inline GeoJSON validation, date/location precision display, editor-only methodology details, and synthetic checks for approval, source links, filters, draft preview, and marker eligibility.
- VERIFIED — The correction package’s listed Map Events headers do not include a historical-period field. The adapter does not infer one from `Record Type`; records stay `Unclassified` until an owner-approved mapping exists.
- VERIFIED — Fresh `pnpm typecheck`, `pnpm build`, and `pnpm test:contracts` passed (**24 tests, 0 failed**). Signed-out HTTP/browser smoke showed public Home, sign-in redirect/return target for Timeline Map, expected API denial, Google/email options, and noindex.
- UNKNOWN — The package handoff reports an earlier authorized Google Drive schema inspection, but this session did not access the workbook or verify service-account sync. Clerk sign-in was not completed with a real authorized test account.
- PROPOSED — Keep PR #5 draft and verify actual sheet bounds/headers and owner-managed authentication settings when available. No production deployment is recommended.

# 2026-11-21 — Private Timeline Map and project access

- VERIFIED — Code commit `d489f34fe7f9e01e3ed0c304a84796e9b986cbb8` is on `feature/timeline-map-auth`, based on PR #4 head `cc01cc0b2ed0b193f16283742a5a501ec035be9c`. Draft PR #5 is open against that same branch. PR #2, the CI branch/PR, PR #4, `main`, the existing Replit artifact and bourkia.com were not changed.
- VERIFIED — Added a Natural Earth 110m reference map, 500–2026 year controls, filters, event/source details, uncertainty labels, and verified-point/shape rendering. The basemap is explicitly identified as modern reference geography, not historical borders. No historical records or locations were invented.
- VERIFIED — Added a read-only server-side Sheets reader for the three named tabs, with explicit approval/publication filtering, an editor-ID allowlist, 60-second refresh, coordinate/geometry validation, and honest disconnected/error/empty states. The spreadsheet was not accessed; the integration was dismissed and no successful sync is claimed.
- VERIFIED — Added Clerk-based Google/email sign-in UI, server-protected project/API routes, safe return-target validation, free account creation, public account help/privacy, and course/Reality hash preservation. Public course/media/downloads on bourkia.com remain public and unchanged.
- VERIFIED — Fresh `pnpm typecheck`, `pnpm build`, and `pnpm test:contracts` passed; **18 tests passed** using synthetic rows. Fresh isolated 390px browser checks covered project sign-in, course/episode hashes, keyboard menu focus, reduced motion, event details, filters, and a synthetic year/location edit that moved the map marker. No browser errors were observed.
- UNKNOWN — No successful provider login, real spreadsheet authorization/sync, owner editor-role setup, full course/Workbench parity, or production deployment has been validated. The registered Replit artifact workflow still serves its existing separate artifact; this branch was tested in an isolated local preview.
- PROPOSED — Keep this staging-only. Review the separate feature branch before any merge; do not deploy, publish, change domains/access, or modify bourkia.com.

# 2026-11-01 — Bounded small-text contrast correction

- VERIFIED — Code commit `d0c61830fd276cebc670c2081bb4559915e80b58` changes only two CSS tokens on the existing presentation branch/PR #4: muted ink `#7d7f86` → `#565963` and rust `#b4472a` → `#9c3b23`. No content, typography, layout, routes or controls changed.
- VERIFIED — WCAG sRGB luminance calculations: muted/paper improves 3.427:1 → 5.990:1; rust/paper is 5.875:1. Twenty-five palette/surface combinations passed 4.5:1, including conservative translucent-header/texture compositing; minimum 4.637:1. Disabled boundary controls are exempt, not misrepresented as enabled text.
- VERIFIED — Fresh typecheck/build and all ten existing regressions passed at that code commit. Four screenshots were refreshed separately under `generated-artifacts/medibo-contrast/`, preserving the earlier evidence files.
- VERIFIED — Protected course/Workbench/privacy/media/runtime/package/CI work is unchanged. Scoped browser smoke evidence belongs to the updated six-part presentation handoff; the original qualified browser report remains qualified. No merge, production, deployment, domain or access changes.

# 2026-11-01 — Visitor-facing portfolio presentation

- VERIFIED — Separate branch `presentation/editorial-project-slides` starts from PR #2 head `3adc7c6fe47f96e7230c61f4f0f369be56f91575`. Main presentation/browser-test commit: `c7a9d7d962cac800e768271ef4a996922445fc48`; final source `f0343b3e8b3470e45786e58239b7dcccf5e71846` only removes one public unfinished-project filler sentence. The separate CI branch/PR is not imported or changed.
- VERIFIED — Kept the existing personal introduction and goals; added the approved public bio, four manually controlled editorial project slides, a scalable single-course listing with existing PDF links, and the public Reality 101 episode titles/descriptions. No new personal claims or future courses invented.
- VERIFIED — Removed visitor-facing staging commentary while retaining noindex; kept the unnamed investigation free of book/release/commercial/signup framing, including labels and metadata.
- VERIFIED — Fresh portable typecheck/build and all ten current contract/regression tests passed. Fresh Vite HTTP probe: 157 requests passed without following redirects; 18 mirrored authored files match the code commit and protected runtime/package/lock/feature-handoff files match the feature base.
- VERIFIED — Fresh isolated browser checks covered manual slide keyboard/touch/boundary focus, inactive panels, anchors, menu/skip/navigation focus, reduced-motion emulation, one course/PDF/RTL links and original native video attributes. Browser test flagged unfinished-project filler, removed in the final one-line source fix; controls did not change. Final build/ten tests/157 HTTP requests and four requested screenshots were newly checked at the final source. Historical CI/browser passes are not reused as new evidence.
- VERIFIED — Live-origin handoffs, privacy/storage implementations, original media URLs, download aliases, EN/Darija/hash/RTL behavior and original feature modules were not rewritten. Browser evidence and limitations are recorded in the separate presentation handoff.

# 2026-11-01 — Bounded draft-review fixes (preview only)

- VERIFIED — Code commit `e92fbb599b7377d865cb845319fe6a51780a3970` includes the review fixes and the Vite-before-Connect guard; original implementation remains on the existing review branch, not main.
- VERIFIED — Malformed `//[` and `http://[` targets return 400; added focused in-memory and real HTTP regressions for standalone, Vite development and Vite built preview. No production configuration changed.
- VERIFIED — Workbench/Privacy direct entry, nav/Home/footer and client-router fallbacks now preserve live destinations. No original course, storage, privacy or media internals edited.
- VERIFIED — Removed Home Journal/shop compatibility filler; retained `#journal` on the existing introduction and `#shop` on the existing Courses row. No replacement editorial narrative added.
- VERIFIED — Standalone typecheck/build and ten automated tests passed. Fresh 28-assertion Chromium run at `29f86dea86d69dd1204cd3adf62bb867cacd56c4` covered revised UI/native handoffs/client fallback/390px/keyboard/reduced motion; UI source is byte-identical at `e92fbb5`. Final live Vite HTTP probe at `e92fbb5`: 157 requests passed. This is separate from the historical 28-check report at `c7500f2`; video playback was not repeated.
- UNKNOWN — Full portability, download payload integrity, production readiness and cross-browser/accessibility conformance remain unestablished. Noindex retained; no CI workflow added (separate Claude scope). See the updated draft handoff.

# Changelog

## 2026-10-31 — First portable website shell (preview only)
- VERIFIED — Added a portable React/Vite shell for personal Home, Courses, Reality 101, Workbench entry and unnamed teaser, starting from merged main e16599a.
- VERIFIED — Kept course/Workbench internals and storage untouched; explicit live-origin entry links and read-only course/download/media path handoffs preserve existing contracts without copying payloads or user records.
- VERIFIED — Added native episode players using unchanged live media URLs, legacy homepage fragment targets, reduced-motion/focus styles and preview noindex safeguards.
- VERIFIED — Added standalone install/build/start instructions, locked dependencies and route/download contract unit tests. Validation scope and limits are recorded in migration/first-shell-handoff.md.
- UNKNOWN — Complete parity, full video playback, download payload integrity and course/Workbench offline independence remain unverified. No production/DNS/visibility/deploy/merge changes.

## 2026-10-31 — Documentation reconciliation and proposed information architecture
- VERIFIED — Reconciled repository role to controlled migration source; bourkia.com remains production authority until parity and human approval.
- VERIFIED — Recorded 7 stages / 24 lessons / 6 labs / EN + Darija and all 45 audit-observed download endpoints, replacing incomplete proposed recovery assumptions; kept availability/integrity/functional evidence separate.
- VERIFIED — Documented route, download alias, RTL, browser-storage and privacy preservation contracts; original source/build configuration remains UNKNOWN.
- PROPOSED — Added owner-directed Home/Courses/Reality 101/Workbench/unnamed-teaser specification and candidate navigation, with no app, redirect, content, media or download changes.
- VERIFIED — Documented branch → validation → PR → independent review → human approval → merge; bootstrap direct-to-main is not a future precedent. No merge/deploy/DNS/visibility change authorized.

## 2026-10-29 — Read-only production recovery inventory
- Added audit/production-site-inventory.md covering public features, routes, content, interactions, downloads, metadata and privacy/storage observations.
- Added audit/public-link-checks.csv with scoped endpoint/header evidence and fallback limitations.
- Classified observations as VERIFIED, INFERRED, PROPOSED or UNKNOWN; no application code reconstructed.
- No production, DNS, deployment or visibility changes. Awaiting human review.

## 2026-10-26 — Migration initialized
- Established portable source-of-truth architecture.
- Production remains on ChatGPT Sites at bourkia.com.
- Added project constitution and multi-AI collaboration rules.
- Added proposed course/download manifests and governance scaffolding.
- No production content changed.
