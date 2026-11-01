import assert from "node:assert/strict";
import { request } from "node:http";
import test from "node:test";
import { createServer, preview } from "vite";
import { compatibilityPlugin } from "./compatibility.mjs";

for (const mode of ["development", "built preview"]) {
  test(`Vite ${mode} handles malformed targets before Connect parsing`, async () => {
    const config = {
      configFile: false,
      plugins: [compatibilityPlugin()],
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
      for (const path of ["/workbench", "/privacy"]) {
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
