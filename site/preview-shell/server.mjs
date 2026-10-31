import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { handoffMiddleware } from "./compatibility.mjs";

const directory = resolve(dirname(fileURLToPath(import.meta.url)), "dist/public");
const knownPages = new Set(["/", "/courses", "/reality-101", "/workbench", "/privacy"]);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

export function createPreviewServer() {
  return createServer((req, res) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    handoffMiddleware(req, res, async () => {
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405, { Allow: "GET, HEAD" });
        res.end();
        return;
      }
      try {
        const url = new URL(req.url || "/", "http://preview.invalid");
        const requested = decodeURIComponent(url.pathname);
        if (requested.includes("\0")) throw new Error("Invalid path");
        const candidate = resolve(directory, `.${requested}`);
        if (candidate !== directory && !candidate.startsWith(directory + sep)) {
          res.writeHead(400);
          res.end("Invalid path");
          return;
        }
        const file = await stat(candidate).catch(() => null);
        const isFile = file?.isFile();
        const body = await readFile(isFile ? candidate : resolve(directory, "index.html"));
        const normalizedPage = requested.replace(/\/$/, "") || "/";
        const status = isFile || knownPages.has(normalizedPage) ? 200 : 404;
        res.writeHead(status, {
          "Content-Type": types[extname(isFile ? candidate : "index.html")] || "application/octet-stream",
        });
        res.end(req.method === "HEAD" ? undefined : body);
      } catch {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Unable to serve this preview request.");
      }
    });
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port.");
  }
  createPreviewServer().listen(port, "0.0.0.0", () => {
    process.stdout.write(`Medibo preview listening on port ${port}\n`);
  });
}
