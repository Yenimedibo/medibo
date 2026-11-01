import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { productionHandoff, handoffMiddleware } from "./compatibility.mjs";

test("courses index cannot shadow the live course subtree", () => {
  for (const path of ["/", "/courses", "/courses/", "/reality-101"]) {
    assert.equal(productionHandoff(path), null, path);
  }
  for (const path of ["/talk-to-ai", "/courses/talk-to-ai", "/courses/talk-to-ai/", "/courses/talk-to-ai/index.html"]) {
    assert.equal(productionHandoff(path), `https://bourkia.com${path}`);
  }
  assert.equal(productionHandoff("/courses/talk-to-ai-else"), null);
});

test("Workbench and Privacy preserve direct live entry, query and trailing slash", () => {
  for (const path of ["/workbench", "/workbench/", "/privacy", "/privacy/"]) {
    assert.equal(productionHandoff(`${path}?fixture=synthetic`), `https://bourkia.com${path}?fixture=synthetic`);
  }
  for (const path of ["/workbench-other", "/privacy-other"]) {
    assert.equal(productionHandoff(path), null);
  }
});

test("malformed targets produce a graceful 400 without falling through", () => {
  for (const url of ["//[", "http://["]) {
    for (const method of ["GET", "HEAD"]) {
      let status, headers, body, fellThrough = false;
      const res = {
        writeHead(code, values) { status = code; headers = values; },
        end(value) { body = value; },
      };
      assert.doesNotThrow(() => handoffMiddleware({ url, method }, res, () => { fellThrough = true; }));
      assert.equal(status, 400);
      assert.equal(headers["X-Robots-Tag"], "noindex, nofollow");
      assert.equal(headers["Cache-Control"], "no-store");
      assert.equal(headers.Location, undefined);
      assert.equal(fellThrough, false);
      assert.equal(body, method === "HEAD" ? undefined : "Bad request.");
    }
  }
});

test("all 45 observed download paths and final aliases hand off unchanged", async () => {
  const manifestPath = process.env.MEDIBO_DOWNLOAD_MANIFEST;
  assert.ok(manifestPath, "Set MEDIBO_DOWNLOAD_MANIFEST to the observed inventory.");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.entries.length, 45);
  for (const entry of manifest.entries) {
    for (const path of [entry.path, entry.observed_final_path]) {
      assert.equal(productionHandoff(path), `https://bourkia.com${path}`);
    }
  }
});

test("query is preserved and destination origin is fixed", () => {
  assert.equal(
    productionHandoff("/courses/talk-to-ai/index.html?lang=dar"),
    "https://bourkia.com/courses/talk-to-ai/index.html?lang=dar",
  );
  assert.equal(productionHandoff("//outside.example/escape"), null);
  assert.equal(productionHandoff("/media/reality-101-ep1.mp4"), "https://bourkia.com/media/reality-101-ep1.mp4");
});

test("handoff rejects mutations and omits fragments from Location", () => {
  const response = () => ({
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    writeHead(status, headers) { this.status = status; Object.assign(this.headers, headers); },
    end() { this.ended = true; },
  });
  const denied = response();
  handoffMiddleware({ method: "POST", url: "/talk-to-ai" }, denied, () => assert.fail());
  assert.equal(denied.status, 405);
  const allowed = response();
  handoffMiddleware({ method: "GET", url: "/courses/talk-to-ai/index.html" }, allowed, () => assert.fail());
  assert.equal(allowed.status, 307);
  assert.equal(allowed.headers.Location, "https://bourkia.com/courses/talk-to-ai/index.html");
  assert.equal(allowed.headers.Location.includes("#"), false);
});
