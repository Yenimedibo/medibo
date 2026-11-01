# Personal portfolio presentation — separate draft-review handoff

## 1. What I inspected

VERIFIED — Governance (README, constitution, collaboration protocol, changelog),
site manifest, current Home/Shell/Courses/Reality/styles, existing feature-handoff
components, runtime tests and observed download inventory.

VERIFIED — PR #2 was still draft/open at
`3adc7c6fe47f96e7230c61f4f0f369be56f91575`; a remote fetch confirmed it before
creating `presentation/editorial-project-slides`. PR #3's CI work remains separate;
no CI commit was cherry-picked or workflow altered here.

VERIFIED — Public copy was fetched read-only from `https://bourkia.com/` on
2026-11-01. It supplied the approved biography, Reality 101 series introduction,
episode titles/descriptions/durations, exact Workbench privacy wording and two PDF
destinations. No private conversations, user records or Workbench document was opened.
This is reconstruction using approved public copy, not an original source export.

## 2. What changed / why

VERIFIED — Code commit `c7a9d7d962cac800e768271ef4a996922445fc48` implements the
owner's clarified visitor-facing scope, retaining the current Home as its starting
point and preserving its introduction's meaning.

VERIFIED — Final source commit `f0343b3e8b3470e45786e58239b7dcccf5e71846` removes
only “Still being worked through. Nothing to show yet.” after browser review.
No control, route, style, metadata or other source changed after the browser pass.

- Existing personal introduction retained, followed by the public approved bio and
  the goals of learning deeply, building useful things and following reality.
  No invented biography, achievements or personal-history claims.
- Four substantial, manually controlled editorial slides: Learn/Courses,
  Question/Reality 101, Build/Workbench and Explore/an unnamed investigation.
  Labelled native selectors and previous/next buttons; Left/Right/Home/End support,
  active selector focus, hidden inactive panels, polite position announcement,
  horizontal touch gesture with vertical-direction discrimination, no autoplay.
  Boundary controls use `aria-disabled` rather than removing the focused control.
- Seven Home anchors retained uniquely: `top`, `main-content`, `work`, `episodes`,
  `journal`, `shop`, `about`. Journal targets the existing introduction; shop targets
  the actual Courses area of the deck and explicitly reveals Courses on hash entry.
- Courses remains data-driven with only TALK TO AI visible. Actual existing course,
  English PDF and Darija PDF links are surfaced; no fictional future offerings.
  New courses can be added to the listing without restructuring Home.
- Reality 101 uses the original series wording, two episode titles, descriptions and
  public durations. Original MP4/JPEG URLs and native player controls/playsInline/
  preload-none/no-autoplay attributes remain unchanged.
- Workbench's public claim uses the exact wording: “Your entries stay in this
  browser.” Existing native live-origin Workbench/privacy/course destinations and
  client-router fallback components remain, not replacement feature explanations.
- The unfinished investigation remains unnamed with no book/release announcement or
  purchase/download/signup CTA, including accessible labels and metadata.
- Restrained typography/spacing/hierarchy follows the existing paper/ink presentation,
  without external fonts/assets or new dependencies. Reduced-motion override remains.
- Public footer/metadata/not-found/course compatibility commentary removed; technical
  limitations stay here. Route-specific client titles/descriptions/OG updated.
  HTML/robots continue to request noindex; no canonical/production eligibility claim.

## 3. Files / sections affected

Portable `site/preview-shell/`: `index.html`, `src/components/Shell.tsx`,
new `src/components/Slides.tsx`, `src/index.css`, and
`src/pages/{Home,Courses,Reality,NotFound}.tsx`.
Authored files are mirrored to the existing `artifacts/medibo` development preview.
Documentation: `CHANGELOG.md` and this handoff.

VERIFIED — Package/lock/runtime/server/compatibility tests, `App.tsx`,
Workbench/Privacy/LiveDestination, live URL/asset constants and robots remain
byte-identical to the base. No storage keys, lesson/course internals, media files,
download payloads, original privacy behavior or EN/Darija hash routing modified.
No accounts, analytics, cloud persistence, sync or AI entry submissions added.

## 4. Risks / uncertainties

VERIFIED — **Staging only, not a production replacement.** Original course,
Workbench/operator guide and privacy implementations remain live-origin dependencies;
they were not reconstructed, migrated or newly inspected. Fixed-origin self-redirect
risk on the production origin remains outside this presentation patch.

UNKNOWN — Complete parity, offline independence, full download payload integrity,
production storage compatibility, physical-device/Safari/assistive-technology
conformance, captions and full video playback remain unestablished.

VERIFIED — Client-side metadata is not static per-route/pre-rendered SEO metadata.
Noindex is retained but is not authentication. The separately unmerged CI PR's
historical passing run does not test this new presentation.

## 5. Newly performed validation

VERIFIED — All results below concern the presentation revision, not historical
browser/CI reports:

- Portable `pnpm typecheck`, `pnpm build` (TypeScript + Vite, 50 modules), and
  `pnpm test:contracts`: **10 passed, 0 failed**, newly run with this code.
- Replit artifact typecheck passed; managed development workflow restarted cleanly
  after the coherent source change. No published deployment started.
- Fresh running Vite HTTP probe at final source commit
  `f0343b3e8b3470e45786e58239b7dcccf5e71846`: **157 requests passed**. Malformed
  GET/HEAD return 400; three shell pages 200 with noindex; live feature/course/all
  45 observed download endpoints and final aliases retain exact 307/query handoffs.
  Redirects were not followed; no payload/body integrity claim.
- All 18 authored source/HTML/public/server/compatibility files match between
  portable code commit and Replit preview. Thirteen protected runtime/config/feature
  files match the approved feature base byte-for-byte.
- Current desktop Home screenshot captured and visually checked; source/body builds
  cleanly with the retained introduction and navigation.

### Fresh isolated browser pass — exact evidence boundary

VERIFIED — The tester exercised code `c7a9d7d962cac800e768271ef4a996922445fc48`,
not earlier UI/CI revisions, and reported these concrete passes:

- Desktop and 390×844 Home render without horizontal overflow; Courses/Reality
  desktop have no overflow; Home/Courses/Reality robots metadata is noindex/nofollow.
- Manual selectors, Next, ArrowRight/ArrowLeft/Home/End, Enter and Space change
  slides correctly. First/last boundary activation does not wrap and retains focus.
  Skip link, selectors, menu toggle and boundary controls show visible focus.
  Inactive panels have display none/zero dimensions and their links cannot be tabbed.
  No autoplay during the observed 2.2-second idle period; source contains no timer.
- Seven anchors present; #shop scrolls to the deck and reveals Courses. Horizontal
  touch swipe advances slide 1→2 at 390px; vertical gesture scrolls without advancing.
- Mobile Menu opens; Escape closes and restores toggle focus; skip Enter focuses main.
  Courses/Reality/wordmark navigation works; Reality/Home route focus lands on main.
- Exactly one actual course; course/two PDF hrefs match approved production URLs.
  Darija PDF label has lang ar-MA, dir rtl and computed RTL direction.
- Original two video src/poster URLs, controls, playsInline, preload none,
  autoplay false and initially paused states confirmed. Posters allowed to load;
  this is not a new full-playback or captions test.
- Actual reduced-motion emulation at 390px matches reduce; no running animations or
  nonzero CSS transitions detected. No observed application runtime errors.
- Workbench/privacy clicks attempt the exact live URLs and are intercepted/aborted
  before production documents load. Expected ERR_FAILED from interception is not
  an application bug; no actual browser data inspected.
- Scan of Home content/attributes/metadata found no book/internal title/release/
  purchase/signup/staging/compatibility framing. Explore has no CTA.

VERIFIED — The browser report's overall verdict was **failure** because it flagged
the unfinished-project sentence and the visible “Explore — unnamed investigation”
label as public filler. The sentence was removed in `f0343b3`; exact deletion,
fresh build/tests/HTTP mirror checks and final source capture confirm the fix.
The unnamed label/Untitled teaser are deliberately retained because the owner's
explicit requirement permits an understated unnamed investigation. This is a
documented review reconciliation, not a claim the original tester returned success.
No second full browser pass was run for the one-line copy deletion.

VERIFIED — After that copy-only correction, portable build/typecheck and all ten
regressions passed again; the 157-request running-preview probe passed at `f0343b3`.
Final screenshots captured from that source: `home-desktop-final.jpg` (1440px),
`home-390-final.jpg` (390px), `courses-final.jpg`, `reality-101-final.jpg`.
These are fresh full-page captures, visually reviewed with no browser errors.
Tester observation IDs, if needed in this session: desktop `y815al`, mobile `ti4atv`,
Courses `86wuxf`, Reality `ybjjvu`, mobile deck `u9skit`; these predate the copy fix.

Evidence location in this Replit workspace: ignored
`generated-artifacts/medibo-presentation/`; read-only HTTP probe
`.local/medibo-presentation-http.mjs`. Screenshots are review assets, not Git binaries.

## 6. Recommended next reviewer / stop

PROPOSED — Gemini reviews hierarchy, phone usability and presentation; Claude reviews
accessibility/editorial fidelity and controls; ChatGPT reconciles continuity and
protected contracts. The owner approves the biography and final visitor presentation.

Open a separate draft PR targeting `implementation/portable-website-shell`, keeping
PR #2 and CI PR #3 untouched. Do not merge/publish/deploy/change access or domains.
Production deployment recommended: **NO**. bourkia.com remains untouched.
