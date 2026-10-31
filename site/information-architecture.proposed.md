# Website information architecture — proposed specification

## Status and evidence separation
- VERIFIED — The owner supplied the direction below in the documentation/specification task continuing audit a6055e3. This records owner-approved direction, not approval of final route names, detailed design, implementation, merge or deployment.
- PROPOSED — This is a reviewable target IA, deliberately separate from [observed production](../audit/production-site-inventory.md). It does not promote the entire audit to a canonical parity baseline.
- VERIFIED — Existing public routes/downloads/storage/RTL/privacy contracts remain preserved under [first parity](../migration/first-parity-contracts.md). No app pages, redirects, media, lessons or downloads are changed by this document.

## Owner-approved direction (recorded)
| Classification | Area | Required direction |
|---|---|---|
| VERIFIED | Home | Cleaner personal gateway: Mehdi Bourkia / Medibo introduction, brief personal bio, website purpose/goals, elegant project slides/cards and minimal clutter; cards lead to separate project areas |
| VERIFIED | Courses | Dedicated courses area; current course TALK TO AI — From Introduction to Mastery; allow more courses without redesigning Home |
| VERIFIED | Reality 101 | Dedicated Reality 101 — Layers of Uncertainty page with episodes/videos, concise explanation and room for later research/context; existing video files untouched |
| VERIFIED | Workbench | Dedicated page/application; preserve browser-storage behavior and data compatibility |
| VERIFIED | Unnamed teaser | The internally described concept remains publicly unnamed; understated teaser only; not called a book, no release announcement, purchase or download CTA |

## Proposed navigation and candidate routes
- PROPOSED — Primary navigation: Home · Courses · Reality 101 · Workbench. Put Privacy & storage in a persistent footer; language controls remain available in the course app. Home contains the introduction/bio rather than needing another top-level About destination.
- PROPOSED — Candidate destinations: / for Home, /courses for course index, /reality-101 for Reality 101, /workbench unchanged. These new paths are candidates only, not existing verified routes or approved implementations. No public teaser route is proposed.
- PROPOSED — Any candidate /courses index must coexist with, and never shadow, the existing /courses/talk-to-ai/ app, hash entries and download/static-asset subtree.
- PROPOSED — Course index links to existing /talk-to-ai and retains course entry/hash/download URL contracts. Use an extendable course listing rather than placing the whole current course interface on Home; no future courses are invented or announced.
- PROPOSED — Home project cards use concise labels/explanations and link to the separate project areas. A static card layout is acceptable; motion/slides are not mandatory and must preserve accessibility and reduced-motion behavior.
- PROPOSED — Reality 101 page groups the concise explanation and existing episodes; reserve capacity for later approved context without fabricating unpublished research.
- PROPOSED — Teaser copy candidate: “An investigation into the questions that refuse to disappear.” This is conceptual only, not a public name or release promise. Do not use the internal concept name as a public title, call it a book, or add purchase/download CTAs.

## Transition requirements (documentation only)
| Classification | Existing contract | Required transition treatment |
|---|---|---|
| VERIFIED | /talk-to-ai | Keep reachable; candidate /courses is additive, not a replacement |
| VERIFIED | /courses/talk-to-ai/, index.html entry and EN/Darija hashes | Preserve deep links, language/RTL behavior and aliases |
| VERIFIED | All 45 observed download endpoints/final paths | Preserve filenames/URLs/aliases; no regeneration/rename/removal here |
| VERIFIED | /workbench and storage namespaces | Keep page/data compatibility; do not move origin and imply data automatically follows |
| PROPOSED | /#episodes | Keep an anchor/compatibility target and link onward if episodes move to /reality-101; no server-only fragment-specific redirect assumption |
| PROPOSED | /#work, /#about, /#journal, /#shop | Retain useful compatibility targets or explanatory legacy sections pending explicit owner-approved transition; do not silently remove links or fabricate unfinished content |
| PROPOSED | Current digital-shelf/project placeholders | Retain first-parity state until approved IA implementation; eventual unnamed-teaser treatment must not announce a product/book/release or add purchase/download actions |

## Approval boundary and open details
- UNKNOWN — Final route choices, exact card/slide layout, motion, full teaser placement, final copy and transition implementation details. Owner review resolves these before implementation.
- PROPOSED — Validate candidate navigation with Gemini for UX/design and Claude for architecture/editorial/QA; ChatGPT checks continuity against the observed contracts. Do not commission speculative redesign or rebuild through this specification alone.
- VERIFIED — Normal process: branch → validation → PR → independent review → human approval → merge. Publishing/DNS/visibility/storage changes require separate explicit authorization. Stop for review after this documentation PR.
