# Medibo portable preview shell

VERIFIED — Newly authored preview implementation, not a recovered original source export. Production remains https://bourkia.com. Do not deploy this package as a production replacement.

## Run without Replit

Node.js 22.12 or later and pnpm 10:

```sh
cd site/preview-shell
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The standalone preview defaults to port 4173; set `PORT` to override. For development use `pnpm dev`. No account, database, API key, Replit SDK or platform environment variable is required.

## Boundary

- VERIFIED — `/`, `/courses` and `/reality-101` are shell pages. Workbench and Privacy are live-origin handoffs, not explanatory replacement pages.
- VERIFIED — The course card opens the existing `https://bourkia.com/talk-to-ai`. The existing course path/subtree and media paths receive read-only 307 handoffs, never a SPA fallback. All 45 observed download requested/final paths are covered by this subtree rule. Browser fragments are not supplied to HTTP; handoffs omit a new fragment so the browser retains the incoming one.
- VERIFIED — Workbench and Privacy use native absolute links throughout navigation/Home/footer. Direct `/workbench` and `/privacy` requests (including trailing slash) receive 307 handoffs with query preserved; client-router fallback uses the same live destination with query/hash preserved. Production documents are not fetched or proxied by this package. Preview-origin storage is never read, written, cleared, exported, imported or synchronized.
- VERIFIED — Malformed URL targets return 400 without falling through. Vite development/built-preview guards run before Connect's request-target parser; the standalone server uses the same handoff middleware.
- VERIFIED — Existing course/Workbench implementation, languages, RTL, storage and download payloads are not copied or altered. They remain external production dependencies. No server proxy sees their payloads.
- VERIFIED — Existing episode video/poster URLs are used directly, with native playback controls and no autoplay.
- VERIFIED — HTML robots metadata, robots.txt and the standalone server's X-Robots-Tag mark this preview noindex/nofollow. This is not access control. Do not use it to store private data.
- UNKNOWN — Full portable parity and offline independence are not achieved. Course, Workbench, privacy text and media depend on the live production origin. Hosting provider request logging is outside this frontend.
- VERIFIED — This package is INELIGIBLE for production-origin cutover: fixed-origin handoffs would redirect to themselves there, and the original feature implementations are absent. No production/indexable mode or self-origin deployment guard is introduced. Noindex remains mandatory but is not access control or a deployment safeguard.
- VERIFIED — Route-specific titles/descriptions/OG are set after JavaScript runs. Static per-page/pre-rendered metadata and a canonical remain absent.

## Checks

```sh
pnpm typecheck
pnpm build
pnpm test:contracts
```

The contract unit tests use observed URL metadata only, not private browser records or payloads. Run the built preview using `pnpm start`; a static host must reproduce the compatibility handoffs and SPA page fallback. Do not upload `dist/` blindly to a host that would shadow the course subtree.
