/** Preview-only handoffs. No course, media, or user-data payloads are proxied. */
export const PRODUCTION_ORIGIN = "https://bourkia.com";

export function productionHandoff(rawUrl) {
  const url = new URL(rawUrl, "http://preview.invalid");
  const path = url.pathname;
  const isCourse =
    path === "/talk-to-ai" ||
    path === "/talk-to-ai/" ||
    path === "/courses/talk-to-ai" ||
    path.startsWith("/courses/talk-to-ai/");
  const isExistingMedia =
    /^\/media\/reality-101-ep[12]\.(mp4|jpg)$/.test(path);
  return isCourse || isExistingMedia
    ? `${PRODUCTION_ORIGIN}${path}${url.search}`
    : null;
}

export function handoffMiddleware(req, res, next) {
  const target = productionHandoff(req.url || "/");
  if (!target) return next();
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end("Preview handoffs accept read requests only.");
    return;
  }
  // A Location without a fragment preserves the browser's incoming fragment.
  res.writeHead(307, { Location: target });
  res.end();
}

export function compatibilityPlugin() {
  return {
    name: "medibo-preview-contract-handoffs",
    configureServer(server) {
      server.middlewares.use(handoffMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handoffMiddleware);
    },
  };
}
