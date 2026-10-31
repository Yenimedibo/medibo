# First portable shell — implementation handoff

## Scope and provenance

- VERIFIED — This is newly authored implementation from merged main e16599a, following the owner's first-implementation task. It is not a recovered original build/source export.
- VERIFIED — [Portable source](../site/preview-shell/README.md) implements Home, Courses index, Reality 101, Workbench entry and an unnamed teaser. Existing course/Workbench internals, 24 lessons, translations, videos and downloadable payloads are not rewritten, copied or regenerated.
- VERIFIED — The Home introduction follows the owner-supplied copy; teaser has no public internal title, book/release framing or purchase/download/signup CTA. No future courses, episodes or research claims are invented.
- PROPOSED — Presentation is ready for independent UX/editorial review; implementation authorization is not approval of the finished design.

## Compatibility boundary

- VERIFIED — `/courses` is a local index; `/talk-to-ai`, `/courses/talk-to-ai` and every child path use explicit 307 handoffs to the fixed `https://bourkia.com` origin. New handoffs exist only in preview/dev servers. Production redirects/configuration are not changed.
- VERIFIED — All 45 requested download paths and observed final aliases are covered unchanged. Browser fragments are not visible to HTTP; Location omits a fragment, retaining the incoming EN/Darija deep link in conforming browsers. Query strings remain intact.
- VERIFIED — Workbench is an entry/preservation shell with an explicit same-tab production link, not a relocated application. Existing production-origin records and backup namespaces remain owned by that app; this shell contains no storage API calls, migrations, account sync, database, analytics or AI submission.
- VERIFIED — Production privacy is linked rather than silently replaced. Hosting request logs remain provider-specific. The preview is noindex, not private authentication.
- VERIFIED — Existing episode MP4/poster URLs are referenced unchanged. Native video controls, no autoplay.
- UNKNOWN — Full self-contained portable parity is not achieved. Course, Workbench, privacy and video dependencies still require production. Do not deploy this as a replacement or claim local copies/data synchronization.

## Legacy homepage fragments

- VERIFIED — `#top` and `#main-content` retain top/skip-link targets; `#about` targets the brief bio; `#work` targets project discovery; `#episodes` points to existing-episode links leading to Reality 101.
- VERIFIED — `#journal` retains a brief project-materials explanation, and `#shop` retains a no-sales compatibility note, not fictitious journal/shop pages. Their original section content is not reproduced in this approved cleaner shell.
- PROPOSED — Review any further legacy-fragment transitions with the owner before changing targets. No server fragment redirects are implemented.

## Validation scope

Recorded validation is scoped to this shell, not a passed production parity gate. The PR contains the final command results and preview/screenshots; HTTP availability never substitutes for payload integrity.

- VERIFIED — Route-contract unit tests cover the separate Courses index, course entries/subtree, all 45 observed downloads and final aliases, fixed destination/query preservation and mutation rejection.
- VERIFIED — Public HEAD probes returned 200 for existing course entry, Workbench, privacy, both MP4s and both JPEG posters. Payload content, complete playback and user-state behavior were not inspected.
- VERIFIED — Standalone pnpm install, TypeScript check and Vite build passed. Four contract unit tests passed. Development HTTP probes confirmed five shell pages (200), course handoffs (307) and every observed download path/final alias. An isolated built-server check confirmed five pages, noindex headers, 404 behavior and a download handoff.
- VERIFIED — Screenshots were visually inspected at 1440px desktop and 390px mobile for Home, and desktop for Courses and Reality 101. No application errors appeared in those capture logs. Earlier development-instrumentation syntax errors predated removal of scaffold dev plugins; the final captures use only React and the compatibility plugin.
- VERIFIED — Static inspection confirmed native links/button semantics, skip link, visible focus, menu aria-expanded/controls, Escape handling, route-focus handling and a reduced-motion rule disabling animation/transitions. This is not a completed runtime keyboard smoke test or assistive-technology audit.
- UNKNOWN — Runtime Tab/Enter/mobile-menu keyboard smoke testing and reduced-motion emulation remain for independent review. No full end-to-end suite or code-review subagent was run for the first build. These validation gaps must not be represented as passed acceptance criteria.
- VERIFIED — Screenshots are supplied alongside the Replit preview, not committed generated binaries. The development preview is temporary and depends on its running workflow; it is not a published deployment.
- UNKNOWN — Complete course interaction/download binary parity, Workbench schema compatibility under a future reimplementation, cross-device/iOS/screen-reader behavior and full accessibility conformance remain outside this task.

## Standard COLLABORATION.md handoff

1. VERIFIED — Inspected merged governance/manifests, approved direction, audit/download inventories and the owner's bounded shell task.
2. VERIFIED — Added the shell and compatibility handoffs because the owner authorized the first implementation; PROPOSED visual treatment awaits review.
3. VERIFIED — Affected portable source under site/preview-shell, README.md, CHANGELOG.md, ignore rules and this handoff. No production asset/payload/source changes.
4. UNKNOWN — Full production portability/parity is not established. Live-origin handoffs are intentional, not migrated internals.
5. VERIFIED — Scoped unit/build/type/HTTP and visual-preview evidence are detailed above and in the PR; no actual user records inspected or migrated. UNKNOWN — runtime keyboard/reduced-motion emulation checks remain.
6. PROPOSED — ChatGPT for continuity, Claude for architecture/editorial/QA and Gemini for UX/design, followed by human sign-off. Production deployment is NOT recommended. Do not merge or deploy automatically.
