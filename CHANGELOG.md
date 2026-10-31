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
