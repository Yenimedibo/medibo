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
    const home = await get("/");
    assert.equal(home.status, 200);
    assert.match(home.body, /noindex, nofollow/);
  });
});

test("course-entry shells preserve hash handling and all 45 download handoffs", async () => {
  const manifest = JSON.parse(await readFile(process.env.MEDIBO_DOWNLOAD_MANIFEST, "utf8"));
  const paths = new Set();
  for (const entry of manifest.entries) {
    paths.add(entry.path);
    paths.add(entry.observed_final_path);
  }
  await withServer(async get => {
    for (const path of ["/talk-to-ai", "/talk-to-ai/", "/courses/talk-to-ai", "/courses/talk-to-ai/", "/reality-101"]) {
      const result = await get(path);
      assert.equal(result.status, 200, path);
      assert.equal(result.headers["x-robots-tag"], "noindex, nofollow");
      assert.match(result.headers["content-type"], /text\/html/);
    }
    for (const path of paths) {
      for (const method of ["GET", "HEAD"]) {
        const result = await get(`${path}?fixture=synthetic`, method);
        assert.equal(result.status, 307, path);
        assert.equal(result.headers.location, `https://bourkia.com${path}?fixture=synthetic`);
        assert.equal(result.headers["x-robots-tag"], "noindex, nofollow");
      }
    }
    for (const path of ["/workbench", "/workbench/", "/privacy", "/privacy/"]) {
      const result = await get(path, "POST");
      assert.equal(result.status, 405);
    }
  });
});

test("project entries fail closed behind the real auth provider", async () => {
  await withServer(async get => {
    for (const path of ["/courses", "/timeline-map", "/workbench"]) {
      const result = await get(path);
      assert.ok([307, 503].includes(result.status), `${path} returned ${result.status}`);
      assert.equal(result.headers["x-robots-tag"], "noindex, nofollow");
      if (result.status === 307) assert.match(result.headers.location, /^\/sign-in\?returnTo=/);
    }
    const mapApi = await get("/api/timeline-map");
    assert.ok([401, 503].includes(mapApi.status));
    assert.equal(mapApi.headers["x-robots-tag"], "noindex, nofollow");
  });
});
