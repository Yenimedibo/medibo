import assert from "node:assert/strict";
import { request } from "node:http";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createPreviewServer } from "./server.mjs";

async function withServer(run) {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const get = (path, method = "GET") => new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port, path, method }, res => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", chunk => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on("error", reject);
    req.end();
  });
  try { await run(get); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test("standalone HTTP server survives malformed GET/HEAD targets", async () => {
  await withServer(async get => {
    for (const path of ["//[", "http://["]) {
      for (const method of ["GET", "HEAD"]) {
        const result = await get(path, method);
        assert.equal(result.status, 400);
        assert.equal(result.headers["x-robots-tag"], "noindex, nofollow");
        assert.equal(result.headers.location, undefined);
        assert.equal(result.body, method === "HEAD" ? "" : "Bad request.");
      }
    }
    const healthy = await get("/courses");
    assert.equal(healthy.status, 200);
    assert.match(healthy.body, /noindex, nofollow/);
  });
});

test("standalone HTTP handoffs preserve live features, course and all downloads", async () => {
  const manifest = JSON.parse(await readFile(process.env.MEDIBO_DOWNLOAD_MANIFEST, "utf8"));
  const paths = new Set(["/talk-to-ai", "/courses/talk-to-ai/", "/workbench", "/workbench/", "/privacy", "/privacy/"]);
  for (const entry of manifest.entries) {
    paths.add(entry.path);
    paths.add(entry.observed_final_path);
  }
  await withServer(async get => {
    for (const path of paths) {
      for (const method of ["GET", "HEAD"]) {
        const result = await get(`${path}?fixture=synthetic`, method);
        assert.equal(result.status, 307, path);
        assert.equal(result.headers.location, `https://bourkia.com${path}?fixture=synthetic`);
        assert.equal(result.headers["x-robots-tag"], "noindex, nofollow");
      }
    }
    for (const path of ["/workbench", "/privacy"]) {
      const result = await get(path, "POST");
      assert.equal(result.status, 405);
    }
  });
});
