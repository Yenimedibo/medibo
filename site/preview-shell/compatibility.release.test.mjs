import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer, request } from 'node:http';
import {
  productionHandoff, legacyPath, resolveLegacyHandoff, handoffMiddleware,
  isCourseEntryPath,
} from './compatibility.mjs';

const originalOrigin = process.env.MEDIBO_SITE_ORIGIN;
test.after(() => {
  if (originalOrigin === undefined) delete process.env.MEDIBO_SITE_ORIGIN;
  else process.env.MEDIBO_SITE_ORIGIN = originalOrigin;
});

async function serveForTest(callback) {
  const srv = createServer((req, res) => handoffMiddleware(req, res, () => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('next');
  }));
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  try {
    const send = (path, host, method = 'GET') => new Promise((resolve, reject) => {
      const req = request({ host: '127.0.0.1', port: srv.address().port, path, method,
        headers: { Host: host } }, res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject);
      req.end();
    });
    await callback(send);
  } finally { await new Promise(r => srv.close(r)); }
}

test('staging legacy paths preserve known production handoffs, query strings and 307 semantics', async () => {
  delete process.env.MEDIBO_SITE_ORIGIN;
  const paths = [
    '/talk-to-ai', '/talk-to-ai/', '/courses/talk-to-ai', '/courses/talk-to-ai/',
    '/courses/talk-to-ai/downloads/course-en.pdf',
    '/courses/talk-to-ai/downloads/course-dar.pdf',
    '/media/reality-101-ep1.mp4', '/media/reality-101-ep2.jpg',
    '/workbench', '/privacy',
  ];
  assert.equal(productionHandoff('/timeline-map'), null);
  assert.equal(isCourseEntryPath('/courses/talk-to-ai/'), true);
  await serveForTest(async get => {
    for (const path of paths) {
      assert.ok(legacyPath(`${path}?source=fixture`));
      const r = await get(`${path}?source=fixture`, 'preview.local');
      assert.equal(r.status, 307, path);
      assert.equal(r.headers.location, `https://bourkia.com${path}?source=fixture`);
      assert.equal(r.headers['x-robots-tag'], 'noindex, nofollow');
      assert.equal(r.headers['cache-control'], 'no-store');
      assert.equal((await get(path, 'preview.local', 'HEAD')).body, '');
    }
  });
});

test('same-origin production rehearsal fails closed, never redirects back to itself', async () => {
  process.env.MEDIBO_SITE_ORIGIN = 'https://bourkia.com';
  await serveForTest(async get => {
    for (const path of ['/workbench', '/privacy/', '/talk-to-ai', '/courses/talk-to-ai/downloads/course-en.pdf', '/media/reality-101-ep2.jpg']) {
      const r = await get(path, 'staging.example.com');
      assert.equal(r.status, 503, path);
      assert.equal(r.headers.location, undefined);
      assert.match(r.body, /legacy feature is not ready/i);
      assert.equal((await get(path, 'staging.example.com', 'HEAD')).body, '');
    }
  });
});

test('Host match blocks a self redirect even with no deployment-mode environment setting', async () => {
  delete process.env.MEDIBO_SITE_ORIGIN;
  await serveForTest(async get => {
    for (const host of ['bourkia.com', 'www.bourkia.com', 'BOURKIA.COM:443', 'bourkia.com.']) {
      const r = await get('/media/reality-101-ep1.mp4', host);
      assert.equal(r.status, 503, host);
      assert.equal(r.headers.location, undefined);
    }
    const fake = await get('/privacy', 'bourkia.com.evil.tld');
    assert.equal(fake.status, 307);
  });
});

test('non-legacy pages, project APIs, malformed URLs, and non-read methods retain safe behavior', async () => {
  delete process.env.MEDIBO_SITE_ORIGIN;
  await serveForTest(async get => {
    for (const path of ['/', '/timeline-map', '/api/timeline-map', '/sign-in', '/reality-101']) {
      assert.equal((await get(path, 'preview.local')).status, 200, path);
    }
    assert.equal((await get('/privacy', 'preview.local', 'POST')).status, 405);
    const malformed = await get('//[', 'preview.local');
    assert.equal(malformed.status, 400);
    assert.equal(malformed.headers['x-robots-tag'], 'noindex, nofollow');
  });
});

test('pure decision function: no redirect chain or loop at current legacy origin', () => {
  assert.deepEqual(resolveLegacyHandoff('/timeline-map', { host: 'bourkia.com' }), { kind: 'pass' });
  assert.equal(resolveLegacyHandoff('/privacy', { siteOrigin: 'https://bourkia.com' }).kind, 'unavailable');
  assert.equal(resolveLegacyHandoff('/privacy', { host: 'preview.local' }).target, 'https://bourkia.com/privacy');
  assert.equal(resolveLegacyHandoff('/privacy', { host: 'sub.bourkia.com' }).kind, 'redirect');
});
