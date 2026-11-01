# 2026-11-01 — Separate preview-shell CI proposal

- VERIFIED — CI-only branch `ci/preview-shell-checks` starts from PR #2 branch head `3adc7c6fe47f96e7230c61f4f0f369be56f91575`. Workflow commit: `043a4a8aa86efbb1dab58d00555de6f1e51a4d0a`.
- VERIFIED — Added ordinary pull-request verification with read-only repository permissions, immutable action pins, no persisted checkout credentials, no supplied secrets, no deployment and no repository-writing steps.
- VERIFIED — Uses the existing tested Node 24.22.1 and project-pinned pnpm 10.11.0; frozen install, typecheck, build, and all ten existing contract/regression tests passed locally. Package/lockfile checksums unchanged. Workflow passed actionlint 1.7.12, YAML/policy assertions and Bash syntax checks.
- VERIFIED — All action SHAs were checked against their official release/tag API records before committing; pnpm's annotated tag was peeled to its commit. See [CI handoff](migration/preview-shell-ci-handoff.md).
- VERIFIED — Separate draft PR #3 targets the implementation branch. [GitHub-hosted run](https://github.com/Yenimedibo/medibo/actions/runs/41257164955) succeeded at head `639f6a95c20cd7eaec15d811d03c196f4d76752d`: exact runtime/pnpm setup, frozen install, typecheck, build and all ten tests passed. This following documentation-only update records that result; final-head check status remains visible on the PR.
- VERIFIED — Runtime source, dependencies, course/Workbench internals, downloads, media, browser storage and privacy promises unchanged. PR #2 is not replaced or merged; no production/deployment/access/domain changes.

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
