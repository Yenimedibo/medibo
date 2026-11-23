import { createServer } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { handoffMiddleware, isCourseEntryPath } from "./compatibility.mjs";
import { createPreviewApp } from "./server/previewApp.mjs";

const directory = resolve(dirname(fileURLToPath(import.meta.url)), "dist/public");

export function createPreviewServer() {
  const app = createPreviewApp({ staticDirectory: directory });
  return createServer((req, res) => {
    let appRoute = false;
    try {
      const pathname = new URL(req.url || '/', 'http://preview.invalid').pathname;
      appRoute =
        /^\/workbench\/?$/.test(pathname) ||
        isCourseEntryPath(pathname);
    } catch {
      // Let handoffMiddleware return its established 400 response for malformed targets.
    }
    if (appRoute) {
      app(req, res);
      return;
    }
    handoffMiddleware(req, res, async () => {
      app(req, res);
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
