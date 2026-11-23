import assert from "node:assert/strict";
import { request } from "node:http";
import test from "node:test";
import { createServer, preview } from "vite";
import { compatibilityPlugin } from "./compatibility.mjs";
import { createPreviewApp } from "./server/previewApp.mjs";

for (const mode of ["development", "built preview"]) {
  test(`Vite ${mode} handles malformed targets before Connect parsing`, async () => {
    const config = {
      configFile: false,
      plugins: [compatibilityPlugin(), {
        name: "test-authenticated-app",
        configureServer(viteServer) {
          viteServer.middlewares.use(createPreviewApp({ fallthrough: true }));
        },
        configurePreviewServer(viteServer) {
          viteServer.middlewares.use(createPreviewApp({ fallthrough: true }));
        },
      }],
      server: { host: "127.0.0.1", port: 0 },
      preview: { host: "127.0.0.1", port: 0 },
      build: { outDir: "dist/public" },
      logLevel: "silent",
    };
    const server = mode === "development" ? await createServer(config) : await preview(config);
    if (mode === "development") await server.listen();
    const httpServer = server.httpServer;
    const port = httpServer.address().port;
    const get = path => new Promise((resolve, reject) => {
      const req = request({ host: "127.0.0.1", port, path }, res => {
        res.resume();
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers }));
      });
      req.on("error", reject);
      req.end();
    });
    try {
      for (const path of ["//[", "http://["]) assert.equal((await get(path)).status, 400);
      const workbench = await get("/workbench");
      assert.ok([307, 503].includes(workbench.status));
      if (workbench.status === 307) assert.match(workbench.headers.location, /^\/sign-in\?returnTo=/);
      const course = await get("/talk-to-ai");
      assert.equal(course.status, 200);
      assert.equal(course.headers["x-robots-tag"], "noindex, nofollow");
      assert.equal((await get("/courses/talk-to-ai/")).status, 200);
      assert.equal((await get("/reality-101")).status, 200);
      for (const path of ["/privacy"]) {
        const result = await get(path);
        assert.equal(result.status, 307);
        assert.equal(result.headers.location, `https://bourkia.com${path}`);
      }
      assert.equal((await get("/")).status, 200);
    } finally {
      if (mode === "development") await server.close();
      else await server.close();
    }
  });
}
