# Production recovery inventory — Medibo / TALK TO AI

Audit date: 2026-10-29. Public origin: https://bourkia.com. Repository baseline: 1cce07d37030ed96cb9793ae7c416b67e657c1a3.

## Scope and evidence rules

- VERIFIED = directly observed in public responses, rendered DOM/screenshots, public client assets, or the repository. A control's existence is not proof its click path passed a test.
- INFERRED = strongly suggested by observed code/behavior, not independently established end-to-end.
- PROPOSED = reconstruction recommendation, not an implementation or accepted architecture decision.
- UNKNOWN = inaccessible or not validated in this audit.
- VERIFIED: Only public read requests, isolated headless-browser renders, and static inspection were used. No account login, production data mutation, DNS/deployment action, form submission, or rebuild occurred. Temporary browser profiles were separate from the owner's browser.
- VERIFIED: Sources include [home](https://bourkia.com/), [course entry](https://bourkia.com/talk-to-ai), [course app](https://bourkia.com/courses/talk-to-ai/), [Workbench](https://bourkia.com/workbench), [privacy](https://bourkia.com/privacy), [robots](https://bourkia.com/robots.txt), [sitemap](https://bourkia.com/sitemap.xml), and public client assets listed below. This is a point-in-time inventory, not continuous monitoring.
- VERIFIED: 61 unique same-origin page/asset endpoints were checked with HEAD after redirects; all returned 200. 45 were course download endpoints. See public-link-checks.csv. HEAD availability is not file-integrity, playback, ZIP-content, or accessibility validation.

## 1. Production feature inventory

- VERIFIED: Homepage has brand/header navigation; personal introduction hero; bilingual free-course promotion; selected projects; Research Workbench promotion; journal previews; Reality 101 series introduction; two native video players; planned digital-shelf workbook; public biography; footer/privacy link.
- VERIFIED: Header links are Work, Videos, Workbench, Free AI course, Journal, About, Shop and Meet Mehdi. Homepage section links use fragments, not separate pages.
- VERIFIED: Forgotten Pages and Field Archive say coming soon. Three journal entries are explicitly not published. The Question Book is a planned release, explicitly unavailable to buy/download, with no release list or checkout. These are placeholders, not broken published page links.
- VERIFIED: Homepage course CTAs lead to /talk-to-ai and the two course PDFs. The course is described as free without payment/enrollment.
- VERIFIED: /talk-to-ai provides separate English and Darija edition cards, studio entry links, PDFs, ZIPs and individual resources. It describes 24 lessons, six workshops and seven stages.
- VERIFIED: A separate static course app uses HTML/CSS/ES modules and client-side hash routes. Public app.js, data.js, render.js, studio.js, studio-data.js and workflow.js are retrievable.
- INFERRED: Main site pages use a generated React/Next-compatible frontend: /_next assets and vinext markers are observable. Original framework version, build configuration, source tree and hosting setup are UNKNOWN; generated filenames are not a portable build specification.

## 2. Route/page inventory

| Status | Public route | Observed role/behavior |
|---|---|---|
| VERIFIED | / | Main homepage; anchors #top, #work, #episodes, #journal, #about, #shop, #main-content |
| VERIFIED | /talk-to-ai | Bilingual course/download entry, canonical URL present |
| VERIFIED | /workbench | Browser research workspace; UI tabs rather than separate observed page routes |
| VERIFIED | /privacy | Privacy/storage text and original-origin Workbench backup link |
| VERIFIED | /courses/talk-to-ai | Direct HTTP 307 to /courses/talk-to-ai/ |
| VERIFIED | /courses/talk-to-ai/index.html | Direct HTTP 307 to /courses/talk-to-ai/; browser rendered #en/01 successfully through this entry |
| VERIFIED | /courses/talk-to-ai/#LANG/home | Course overview; LANG en or dar |
| VERIFIED | /courses/talk-to-ai/#LANG/01 … 24 | Foundation lesson routes |
| VERIFIED | #LANG/studio | Six-lab index; #LANG/practice is an alias in public app route dispatch |
| VERIFIED | #LANG/lab-research, lab-files, lab-data, lab-creative, lab-content, lab-automation | Practical lab routes |
| VERIFIED | #LANG/resources, sources | Downloads and dated reference/source list |
| VERIFIED | #LANG/prompts, quickrefs, glossary, agents, advanced, paths, capstone | Additional resource pages |
| VERIFIED | #LANG/workflow-check | Local brief builder and deterministic support-workflow simulator |
| VERIFIED | Unknown hash route | Public route dispatch renders Page not found and overview link |
| VERIFIED | /courses/talk-to-ai/downloads/*.html | Checked links resolve to extensionless HTML paths; preserve aliases/redirects during parity work |

- VERIFIED: Public app.js reads location.hash, selects dar only when the language segment is dar, otherwise en; default route is home. It updates document language to ary and direction to rtl for Darija, and en/ltr for English. Language switch links retain the current route. Hash changes re-render, scroll to top and focus the main region.
- VERIFIED: Raw course HTTP HTML is a small app shell; rendered content differs because JavaScript renders the selected hash route. This is not evidence of a second conflicting course page.
- UNKNOWN: Undisclosed routes, admin paths, private pages and server-side routing configuration. No separate route called test was observed in the inspected course dispatch; workflow-check and lesson self-checks are present.

## 3. Content inventory

- VERIFIED: Seven bilingual modules contain 24 bilingual lesson records. Each lesson has goal, explanation, importance, example, bad version, better/copyable prompt, exercise, worked answer, checklist, takeaway and free/phone guidance. Lesson data lists 15 minutes; rendered UI labels 15–25 minutes with practice.

| Status | ID | Module | English title | Darija title |
|---|---|---|---|---|
| VERIFIED | 01 | 1 | What AI is actually doing | شنو كيدير AI بالضبط؟ |
| VERIFIED | 02 | 1 | Tokens, context and memory | Tokens، السياق والذاكرة |
| VERIFIED | 03 | 1 | Your first useful conversation | أول محادثة مفيدة |
| VERIFIED | 04 | 1 | Why confident mistakes happen | علاش AI كيقدر يغلط بثقة؟ |
| VERIFIED | 05 | 2 | The anatomy of a useful prompt | كيفاش تبني prompt مفيد |
| VERIFIED | 06 | 2 | Give the right context | عطي السياق المناسب |
| VERIFIED | 07 | 2 | Examples, roles and formats | الأمثلة، الأدوار وشكل الجواب |
| VERIFIED | 08 | 2 | Iteration beats the perfect prompt | التعديل أحسن من البحث على prompt مثالي |
| VERIFIED | 09 | 3 | Fact, opinion and inference | الحقيقة، الرأي والاستنتاج |
| VERIFIED | 10 | 3 | Sources and fact-checking | المصادر والتحقق |
| VERIFIED | 11 | 3 | Audit a flawed answer | راجع جواب فيه أخطاء مقصودة |
| VERIFIED | 12 | 3 | Privacy, consent and accountability | الخصوصية، الموافقة والمسؤولية |
| VERIFIED | 13 | 4 | Text, images, audio and video | النص، الصورة، الصوت والفيديو |
| VERIFIED | 14 | 4 | Plugins, connectors and permissions | Plugins، الربط والصلاحيات |
| VERIFIED | 15 | 4 | Work with documents | الخدمة بالوثائق |
| VERIFIED | 16 | 4 | Work with data and spreadsheets | المعطيات والجداول |
| VERIFIED | 17 | 4 | Choose a useful toolkit | اختار الأدوات اللي محتاج |
| VERIFIED | 18 | 5 | Build a reusable business brief | وجد business brief تعاود تستعملو |
| VERIFIED | 19 | 5 | From one source to useful work | من مصدر واحد لخدمة مفيدة |
| VERIFIED | 20 | 6 | Design an advertising experiment | صمم تجربة إشهارية |
| VERIFIED | 21 | 6 | Measure what happened | قيس شنو وقع فعلا |
| VERIFIED | 22 | 7 | Configure a recurring assistant | وجد مساعد لمهمة كتعاود |
| VERIFIED | 23 | 7 | Build a controlled workflow | بني workflow مراقب |
| VERIFIED | 24 | 7 | Define and supervise an agent | حدد agent وراقب خدمتو |

- VERIFIED: Six labs: research/evidence/decision; conflicting files/RAG/structured output; campaign/order reconciliation; editable Canva design system; multi-tool content handoff; bounded rental-enquiry agent. They contain filled editable briefs, tool runbooks, worked results, harder cases, acceptance checks and related lesson links. Sample business records are explicitly fictional.
- VERIFIED: Resource pages include prompt library, glossary, quick references, three agent projects, beyond prompting, free/optional tool paths and capstone. The sources list has 23 dated references; product/plan statements are time-sensitive, not independently fact-checked by this inventory.
- VERIFIED: EN and Darija content was observed in rendered route extraction, both resource pages and public data.js; this does not establish perfect translation parity across every paragraph.
- UNKNOWN: Exact unpublished content, editorial history, original authoring files and complete semantic parity among online text, PDFs and ZIP editions.

## 4. Interaction inventory

| Status | Surface | Observed control / public client logic | Validation limit |
|---|---|---|---|
| VERIFIED | Lessons | Module details navigation, previous/next, complete button, progress indicator | DOM and source inspected; completion not clicked |
| VERIFIED | Prompts | Copy button calls navigator.clipboard.writeText; selection/manual-copy fallback and toast | Handler inspected; clipboard permission/device result untested |
| VERIFIED | Lesson exercise | Attempt textarea saves on input to language+lesson local-storage key | Handler inspected; no user notes entered |
| VERIFIED | Reset progress | Confirmation; clears completion marks, retains notes | Handler inspected; reset not invoked |
| VERIFIED | Studio/labs | Editable fields refresh complete prompt; reset sample; TXT brief download via Blob; expandable runbook/worked result | Visible content and source inspected; downloads not generated in browser |
| VERIFIED | workflow-check | Brief builder, manually selected support topic, approved-policy selector, run/clear simulation, session log and review decisions | No real AI/API/account action in inspected module |
| VERIFIED | Simulator rules | Missing ID/message error; duplicate ID skipped; limit after 20 accepted items; non-hours/missing policy escalated; valid hours request pending review | Public workflow.js logic inspected, not runtime-tested |
| VERIFIED | Workbench | Guide, claims, hypotheses, evidence, gates, decisions tabs; worked examples, new entry/saved records, labels, save-on-device and Export JSON | Default claims view rendered; other tabs not clicked |
| VERIFIED | Videos | Two native controls/playsInline/preload-metadata video elements, poster images and fallback MP4 links | Endpoint headers checked; full playback not tested |

### Mobile/responsive observations

- VERIFIED: Isolated Chromium rendered a lesson at 390×844. Mobile screenshots at 390×844 were visually inspected for home, English studio and Workbench.
- VERIFIED: Home navigation wraps across rows; hero text/CTA fit the captured viewport. Studio uses a Lessons menu button, language controls and single-column content/cards. Workbench has a horizontally scrollable tab strip; the captured strip shows a scrollbar and partially visible tabs.
- VERIFIED: Course CSS contains an 850px breakpoint; studio CSS a 700px breakpoint; main CSS contains 1100/900/680/620/600px and utility breakpoints. Reduced-motion rules exist. Viewport metadata and skip links are present; course menu has aria-expanded/aria-controls, route navigation uses aria-current, and Workbench exposes tab ARIA semantics.
- UNKNOWN: Full-page horizontal overflow at all breakpoints, touch/keyboard behavior, screen-reader usability, zoom, iOS/Android differences and all interactive click paths. Chromium's container emitted system D-Bus warnings; these are not established application runtime failures.

## 5. Download/asset inventory

- VERIFIED: 45 linked course download endpoints returned 200 after redirects: 10 PDF, 24 HTML, 2 XLSX, 4 Markdown, 3 CSV and 2 ZIP. Most responses did not expose Content-Length or Content-Disposition in HEAD. XLSX responses used application/octet-stream; PDFs/ZIPs/CSV/Markdown returned matching MIME families.
- VERIFIED: Per language en/dar: course, labs, companion, workbook and answers PDFs; corresponding five HTML editions; prompts, quickrefs, glossary, agents, advanced, paths and capstone HTML; campaign-tracker XLSX; prompt-library and final-project-template Markdown; talk-to-ai ZIP.
- VERIFIED: Shared CSVs: synthetic-orders.csv, lab-campaigns.csv, lab-orders.csv. ZIP labels promise START-HERE.html/offline learning; ZIP contents were not inspected, so that promise is UNKNOWN at file-content level.
- VERIFIED: Homepage assets include /favicon.svg; /media/reality-101-ep1.mp4 and ep2.mp4; ep1.jpg and ep2.jpg poster images. Standalone course assets include icon.svg, style.css, studio.css and six public ES modules listed above. Main pages reference generated /_next CSS/JS chunks.
- VERIFIED: No public media, PDFs, spreadsheets or ZIP payloads were copied into this repository by the audit. Only URLs, titles, observed metadata and documentation are committed.
- UNKNOWN: File checksums, PDF page counts/fonts/tagged accessibility, XLSX formulas, ZIP membership/offline execution, media licensing/source masters and exact binary parity.
- VERIFIED: No confirmed broken same-origin endpoint among the 61 probes. External source HEAD probes sometimes returned 403 or Google Ads 404; webFetch subsequently retrieved the expected content for those pages, so they are not classified as confirmed broken. Other source HEAD probes and the original-origin Workbench link returned 200. This is availability checking, not endorsement of claims.

## 6. Metadata/SEO inventory

| Status | Page | Observed metadata |
|---|---|---|
| VERIFIED | Home | medibo — Mehdi Bourkia; description; canonical https://bourkia.com; generic OG site/title/description/type; Twitter summary |
| VERIFIED | /talk-to-ai | Specific course title/description and canonical; OG/Twitter still generic site values |
| VERIFIED | /privacy | Privacy & storage title/description; canonical /privacy; generic OG/Twitter |
| VERIFIED | /workbench | Research Workbench title/description; robots noindex, follow; no canonical found in inspected head |
| VERIFIED | Course shell | Course title, description, theme color, viewport; no canonical or OG/Twitter tags found in raw shell; client updates title per route |
| VERIFIED | Offline course HTML | Complete course title/viewport; no canonical found in inspected HTML |

- VERIFIED: No og:image or hreflang declaration was found in the inspected page heads. This is scoped to the pages listed, not every downloadable page.
- VERIFIED: robots.txt allows / and disallows /workbench; it declares sitemap.xml. Sitemap contains home, /talk-to-ai, /courses/talk-to-ai/ and /privacy, not individual hash lessons.
- INFERRED: Hash lessons share the same server document; per-lesson server-side metadata/indexing cannot be assumed. Preserve current routes first; any SEO redesign needs separate review.

## 7. Privacy/storage observations

- VERIFIED: Public privacy text (updated 26 October 2026) says Workbench/course exercises do not send entries to a medibo database or AI service; warns against confidential data/shared browser profiles; states no added advertising trackers/analytics; explains hosting request logs and external-service policies. These are published claims, not an independent server audit.
- VERIFIED: Public course code uses localStorage key talk-to-ai-progress and per-lesson tta-attempt-LANG-ID keys. Progress is shared across language routes, while notes are language-specific. Storage failures display a warning. Studio edits remain in memory until copied/downloaded, not autosaved.
- VERIFIED: Public Workbench client code uses medibo-workbench with claims/hypotheses/evidence/gates/decisions collections; validates record shape; creates medibo-workbench-before-guide-v1 backup before the first update of existing records; uses storage events for cross-tab refresh and navigator.locks when available. Export generates a dated JSON Blob, with recovery handling for unreadable records.
- VERIFIED: Privacy text says no import feature or cross-device synchronization; original chatgpt.site records do not automatically appear at bourkia.com; it links the original Workbench for manual export. Browser data clearing removes local records/backups/notes/progress; course reset removes only completion marks.
- VERIFIED: The public framework runtime also contains sessionStorage navigation-state logic. This alone is not evidence of tracking or server persistence.
- UNKNOWN: Actual owner/user records, backend logs/retention, complete network behavior, server configuration and original Windows Workbench compatibility. No private records were inspected.
- INFERRED: A different Replit preview origin will have separate browser storage. Exact parity on the production origin requires deliberate key/schema compatibility; deployment must never imply automatic migration/import that does not exist.

## 8. Missing source needed for exact parity

- VERIFIED: At the inspected GitHub baseline only the 11 bootstrap governance/manifest files exist. All observed production pages, lesson/lab/resource content, app modules, styles, video/poster assets, downloads, privacy text, Workbench implementation, metadata and routing rules are absent.
- UNKNOWN: Original main-site component source, build/dependency/lock manifests, deployment config, asset masters/licenses, download generators/source-to-output mapping, test fixtures and full content/version history. Public built bundles are not equivalent to those originals.
- PROPOSED: Recover authorized public text/client-module behavior and asset URLs into an explicit migration baseline, retaining provenance and distinguishing observed material from new reconstruction. Do not relabel the proposed bootstrap manifests as recovered live source.

## 9. What can safely be reconstructed from observed behavior

- PROPOSED: Reconstruct the observed homepage sections/placeholders/nav, bilingual course entry, seven modules/24 lessons, six labs, resource routes, privacy copy, download URL contracts and local-only interaction behavior.
- PROPOSED: Preserve EN/Darija route switching, RTL/language attributes, completion/notes semantics, clipboard fallback, simulator boundaries, mobile menu/scrollable tabs, export/recovery warnings and storage namespace/schema compatibility.
- PROPOSED: Preserve existing public file paths and .html/index aliases or explicit redirects; validate recovered assets before using them. Do not fabricate unpublished journal/project/shop pages, real integrations, hidden APIs, checkout, account sync or import features.
- UNKNOWN: Exact original code and pixel parity without original source/asset masters. Any newly authored implementation must be identified as reconstruction and validated against this inventory.

## 10. Recommended reconstruction order

1. PROPOSED: Owner reviews this inventory and resolves parity scope; coordinate with Claude's separate architecture/editorial/QA review without duplicating speculative redesign.
2. PROPOSED: Establish authorized content/asset provenance and download preservation plan; capture exact URLs and existing public text before edits.
3. PROPOSED: Reconstruct homepage/navigation/privacy and course entry with working download delivery; preserve planned/unpublished states.
4. PROPOSED: Implement the existing course hash contract, bilingual/RTL scaffold and all lesson/resource routes, then completion/notes/copy behavior.
5. PROPOSED: Reproduce six studios and the explicitly local rules simulator; no external account actions or AI calls implied.
6. PROPOSED: Reconstruct Workbench with export/recovery and storage compatibility safeguards; test only synthetic data in isolated profiles.
7. PROPOSED: Validate online/offline content and binary downloads, desktop/mobile/touch/keyboard/accessibility, route redirects, link health and metadata against the baseline.
8. PROPOSED: Human review and an approved implementation task precede further changes. This audit does not recommend production deployment; no replacement app has been built or validated.

## Handoff (COLLABORATION.md)

1. VERIFIED — Inspected public pages, raw heads/client assets, rendered hash lesson/mobile views, robots/sitemap, endpoint headers and current GitHub baseline.
2. VERIFIED — Changed documentation only: this inventory, link-check evidence and CHANGELOG.md. PROPOSED reconstruction order is not an implementation approval.
3. VERIFIED — Affected files: audit/production-site-inventory.md, audit/public-link-checks.csv, CHANGELOG.md.
4. UNKNOWN — Exact hidden/build/server/binary behavior and exhaustive interaction/accessibility parity remain unverified.
5. VERIFIED — Validation scope and limits are recorded above and in the CSV; no production write/deploy/DNS action was taken.
6. PROPOSED — Human owner reviews scope next; Claude's independent review should consume this evidence, with Gemini later checking UX/content parity. Stop here for review.
