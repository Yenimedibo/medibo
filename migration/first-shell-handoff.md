# First portable shell — current draft-review handoff

## Status and provenance

- VERIFIED — Existing branch: `implementation/portable-website-shell`, draft PR #2. Approved base remains `e16599a5e626c1bd834ab8557707e5db999f29d7`; initial shell was `c7500f2d760634be3820fc1d57f5f18956cf9b78`.
- VERIFIED — Latest tested code: `e92fbb599b7377d865cb845319fe6a51780a3970`. The following documentation-only commit records those results; it does not change tested code.
- VERIFIED — Newly authored Replit shell, not recovered original modules. ChatGPT's separate implementation `2d99c8b` and later coordination package remain unreceived/uninspected here and are NOT combined with this branch.
- VERIFIED — Claude's partial review covered selected handoff/configuration files, not full server/src/governance/rendered behavior. ChatGPT supplied additional source/governance observations and malformed-target reproduction. Replit implemented the owner-authorized fixes and independently ran the scoped checks below. These are distinct evidence sources.

## 1. What was inspected / why

VERIFIED — Existing review branch/source, compatibility middleware, standalone server, Shell/Home/Workbench/Privacy routes, earlier handoff and read-only coordination results. Applied only the agreed bad-request/live-handoff/public-filler fixes; no course or Workbench-internals reconstruction.

## 2. What changed

- VERIFIED — Invalid URL targets (`//[` and `http://[`) now produce plain-text 400, no-store/noindex and no redirect/fallthrough. HEAD has no body. Focused in-memory and real-server regressions cover them.
- VERIFIED — A fresh raw HTTP probe exposed Vite Connect parsing `http://[` before `.use()` middleware and terminating the dev process. The plugin now wraps Connect's entry handler so the same guard runs first. Both actual Vite development and built-preview servers have regression tests; ordinary routes/handoffs remain functional. No third-party package changes.
- VERIFIED — Direct `/workbench`, `/workbench/`, `/privacy`, `/privacy/` GET/HEAD use 307 handoffs, preserving pathname/query. Navigation, Home Workbench project and Privacy footer use native absolute production links, not wouter Links. Existing client-router entry also falls back to `location.replace` at the canonical live feature URL with query/hash. The fallback link wording is only “Continue to …”; no new explanatory/editorial narrative.
- VERIFIED — No storage API, account, sync, analytics, cloud persistence or AI submission introduced. Original live storage/privacy code is untouched. No actual user/browser records inspected, migrated, cleared or read.
- VERIFIED — Removed the visible Journal preview explanation and nothing-for-sale/material-location paragraph. Existing `#journal` now targets the introduction; `#shop` targets the existing Courses row. All seven legacy targets remain unique. These are useful current-content targets, not recreated historical sections.
- VERIFIED — Course entry/subtree/download rules unchanged; all 45 observed requested paths and final aliases still hand off. Existing episode source/poster URLs, Reality/Courses source, live URL constants, robots/index HTML are byte-identical to the initial shell.
- VERIFIED — Noindex retained. Client-side route titles/descriptions/OG exist; static per-page/pre-rendered metadata and canonical remain absent. No indexable/production switch was added.

## 3. Affected components

Portable files under `site/preview-shell`: compatibility middleware/plugin/tests, server page classification and HTTP tests, new Vite regressions, test command, App, Shell, Home, Workbench/Privacy client fallbacks and shared LiveDestination. Documentation: this handoff, preview README and CHANGELOG. Replit preview mirrors these authored code files; workspace-only configuration is not imported upstream. No CI workflow, governance/content manifest, original lesson, media or download payload changed.

## 4. Risks / production ineligibility

- VERIFIED — **Not eligible for production cutover.** Fixed-origin redirects would self-redirect on the production origin; original course/Workbench/privacy implementations and downloads are not local replacements. Two feature redirects do not establish portability. No self-origin deployment guard was added; scope any guard separately. Never deploy this preview as bourkia.com.
- UNKNOWN — Full parity, offline operation, payload hashes/content-disposition/download-button behavior, actual feature runtime behavior, production-origin storage compatibility, full video playback/seek/captions, physical devices, iOS/Safari, screen readers and full accessibility remain unverified.
- VERIFIED — Noindex is appropriate for staging, but not authentication or a safety guard. Provider request logs are outside this frontend.
- PROPOSED — Human/editorial review should approve the cleaner public presentation and legacy-anchor mapping. No new marketing text was drafted to replace removed filler.

## 5. Validation — distinguish new vs historical

### Newly run for this revision

- VERIFIED — `pnpm build` (TypeScript + Vite) passed at `e92fbb599b7377d865cb845319fe6a51780a3970`; Replit artifact typecheck also passed with the revised UI.
- VERIFIED — `pnpm test:contracts`: **10 tests passed**, comprising six compatibility units (including 45 observed downloads/final aliases and malformed GET/HEAD), two standalone HTTP tests and two real Vite development/built-preview tests. Run build first; HTTP page checks need `dist/public`.
- VERIFIED — **157 fresh HTTP requests** against the running Vite service at `e92fbb5` passed: malformed GET/HEAD return 400; three shell pages return 200/noindex metadata; live feature/course/all observed download aliases return exact 307 destinations with synthetic query preservation. No redirect was followed.
- VERIFIED — A **new, separate 28-assertion browser run** at UI code commit `29f86dea86d69dd1204cd3adf62bb867cacd56c4` passed with no captured uncaught JS exceptions. All UI source files are byte-identical at `e92fbb5`; the later middleware-only fix was independently exercised by the HTTP/Vite tests. Do not relabel that browser run as executed at a different commit.
- VERIFIED — New Chromium checks: visible skip-link Tab/Enter; Courses/Reality keyboard routing and main focus; 390px Menu Enter/Space/Tab/Escape/return focus and automatic close on local navigation; no narrow-layout overflow on the three retained shell pages; actual reduced-motion media emulation (computed animation/transition none/0s, auto scroll, zero running animations, retained on reload).
- VERIFIED — Native Workbench nav and Home links plus Privacy footer attempted the exact live destinations. Client-router fallbacks for both paths/trailing variants preserved synthetic query/hash. Browser interception blocked every production document request before load. No live Workbench/privacy document or browser records were accessed.
- VERIFIED — Browser DOM confirmed no removed filler, all seven unique anchors and noindex. Revised desktop screenshot inspected; mobile/menu/focus screenshots recorded. The final 17 authored source/public/HTML/server/handoff files match the portable code commit byte-for-byte.
- VERIFIED — Existing workflow restarted after the middleware fix and served the 157-request probe without an error; no deployment created.

Evidence in the Replit workspace (ignored, not Git binaries): `generated-artifacts/medibo-review-fix-runtime/results.json`, `http-dev-results.json`, revised Home/menu/focus screenshots. Reproduction probes: `.local/medibo-review-fix-check.mjs` and `.local/medibo-review-http.mjs`. Tracked Node tests reproduce compatibility and HTTP regressions without the browser helper.

### Historical — not newly run media evidence

VERIFIED — Earlier `c7500f2` 28-check run included EP1/EP2 metadata and brief playback, preserved in the earlier ignored coordination note. The new 28-check run has DIFFERENT coverage, including live link/fallback checks, and does not repeat video playback. Neither run proves full-duration playback, full original-feature parity or download payload integrity.

UNKNOWN — No tracked CI workflow/reproducible browser job exists. CI is separately reserved for Claude; none added here.

## 6. Review / stop

PROPOSED — ChatGPT reconciles continuity/contracts, Claude independently reviews this bounded correction and owns separately scoped CI, Gemini reviews presentation as needed, and the human owner retains final authority.

Keep PR #2 DRAFT. No merge, publish, deployment, DNS/domain, visibility or access changes. bourkia.com remains untouched.
