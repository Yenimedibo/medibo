# First-parity contracts and approval gate

## Status and authority
- VERIFIED — These contracts transcribe observed production behavior from [audit a6055e3](../audit/production-site-inventory.md) and the owner's preservation instruction. They are not proof that reconstruction exists or passes tests.
- VERIFIED — GitHub remains the controlled migration source; bourkia.com is production authority until the gate and explicit human approval. No actual user browser data is to be copied into GitHub, fixtures, previews or reports.
- UNKNOWN — Original source/build/deployment configuration, media masters and complete binary parity remain unknown unless actually recovered.

## Route and language contracts
- VERIFIED — Preserve /, /talk-to-ai, /privacy, /workbench and the course app at /courses/talk-to-ai/. Preserve existing course entry /courses/talk-to-ai/index.html and /courses/talk-to-ai aliases/redirect behavior.
- VERIFIED — Preserve #en/ROUTE and #dar/ROUTE: home; 01–24; studio; practice alias; lab-research, lab-files, lab-data, lab-creative, lab-content, lab-automation; resources; sources; prompts; quickrefs; glossary; agents; advanced; paths; capstone; workflow-check. Language switch retains the route. Darija uses ary/rtl; English en/ltr.
- VERIFIED — Keep current homepage fragments #top, #work, #episodes, #journal, #about, #shop and #main-content as compatibility targets until an explicitly approved transition. A URL fragment is not sent to the server; a path-only server redirect cannot distinguish #episodes from #work. No redirects or navigation changes are implemented in this PR.
- VERIFIED — Preserve every requested download path and observed final path in [downloads.observed.json](../content/downloads.observed.json), including extensionless HTML aliases. The .html requested URLs remain contracts even when they redirect.

## Storage and privacy contracts
| Classification | Contract | Preservation requirement |
|---|---|---|
| VERIFIED | talk-to-ai-progress | Completion key; preserve compatible values and cross-language progress behavior; never silently reset |
| VERIFIED | tta-attempt-LANG-ID | Language-specific notes; LANG en/dar and lesson IDs 01–24; preserve existing values |
| VERIFIED | medibo-workbench | Browser-local Workbench collections/record compatibility; no destructive schema rewrite |
| VERIFIED | medibo-workbench-before-guide-v1 | Observed pre-guide backup namespace; preserve existing backup and first-update backup semantics |
| VERIFIED | Export/recovery | Preserve JSON export and readable recovery path; no overwrite of unreadable records |
| VERIFIED | Origin isolation | Records belong to site+browser, not an account; previews/new origins do not inherit production data |

- VERIFIED — Preserve published privacy promises unless implementation changes are explicitly approved: browser-local records/notes/progress, no medibo database/AI submission of entries, shared-device/confidential-data warning, temporary studio edits not autosaved, reset removes completion marks only, no added tracking/analytics, hosting-log/external-service caveats, no automatic import/cross-device sync/account connections. The audit records published promises and source observations, not a server audit.
- PROPOSED — Test compatibility using synthetic valid, legacy, unreadable, storage-unavailable and multi-tab fixtures in an isolated browser profile. Never test against the owner's records. Preserve existing data and require owner approval before any incompatible migration.

## Media and content contracts
- VERIFIED — Preserve the 7-stage / 24-foundation-lesson / 6-applied-lab EN+Darija structure. No lesson content or Darija rewrite is included here.
- VERIFIED — Preserve /media/reality-101-ep1.mp4 and /media/reality-101-ep2.mp4 and the current public media URLs. Do not edit video files or invent new media.

## Future gate — not passed
All following items are PROPOSED acceptance checks for a later approved reconstruction; current pass status is UNKNOWN.
1. Trace reconstructed text/behavior/assets to public observation, recovered authorized material or explicitly new owner-approved work; retain unknowns.
2. Route/navigation/hash/RTL parity; links and aliases preserved. No route deletion or misleading unpublished-project CTA.
3. Download availability AND payload integrity/format/content/online-offline parity AND actual download behavior tested separately. HEAD 200 alone is insufficient.
4. Lesson navigation/copy/clipboard fallback/notes/completion/reset, lab editing/TXT export and local simulator tested with synthetic inputs.
5. Workbench save, schema/backup compatibility, export/recovery and privacy promises validated without real user data.
6. Desktop/mobile, touch/keyboard, accessibility and metadata checks documented with remaining limits.
7. Independent review, explicit human parity acceptance, then human-approved merge. Becoming canonical or deploying requires explicit owner decisions; merge does not authorize deployment.
