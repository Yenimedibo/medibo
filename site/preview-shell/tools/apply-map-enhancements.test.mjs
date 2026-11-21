import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import { applyMapEnhancements, replaceExactlyOnce } from './apply-map-enhancements.mjs';

const files = {
  'server/timelineData.mjs': `// Medibo Timeline Map — schema-aligned, read-only Sheets adapter.\nconst row = {\nperiod: safeText(field(record, ['Historical Period']) || 'Unclassified', 200),\n};\n`,
  'server/timelineData.test.mjs': "assert.equal(event.linkedMapFeatureId, 'FEATURE-TEST-1');\n  assert.equal(event.period, 'Unclassified');\ntest('period is not inferred from Record Type when the documented event sheet has no period column', () => {\n  const event = parse([row({ 'Record Type': 'Continuity' })])[0];\n  assert.equal(event.period, 'Unclassified');\n});\n",
  'src/pages/TimelineMap.tsx': `<svg className="timeline-map-svg" viewBox="0 0 900 440" role="img" aria-labelledby="map-title map-description">\n<p className="timeline-filter-note">Filters remain available when the record is empty. A missing location is never inferred from a region label.</p>\n  const toggleLayer = (id: string) => {\n    return id;\n  };\n    if ((event.target as Element).closest('.timeline-map-controls, .timeline-map-marker')) return;\n    <path key={\`geometry-\${event.id}\`} className="timeline-event-geometry" d={path(geometry as never) ?? ''} />\n    onClick={() => setSelectedId(event.id)}\n                    data-testid={\`marker-event-\${event.id}\`}\n`,
  'src/pages/TimelineMap.css': '.timeline-event-geometry { fill: #9c3b2322; stroke: var(--tm-red); stroke-width: 2.2; vector-effect: non-scaling-stroke; }\n',
  'package.json': '{"scripts":{"test:contracts":"node --test compatibility.test.mjs server.test.mjs vite.test.mjs server/timelineData.test.mjs src/lib/access.test.mjs src/lib/authRouting.test.mjs"}}',
};
async function makeFixture() {
  const dir = await mkdtemp(join(tmpdir(), 'medibo-map-patch-'));
  for (const [p, content] of Object.entries(files)) {
    await mkdir(join(dir, p.split('/').slice(0, -1).join('/')), { recursive: true });
    await writeFile(join(dir, p), content);
  }
  return dir;
}

test('patch applies exact changes, prevents drag capture of shapes, and is idempotent', async () => {
  const dir = await makeFixture();
  try {
    const first = await applyMapEnhancements(dir);
    assert.equal(first.length, 5);
    assert.ok(first.every(x => x.updated));
    const adapter = await readFile(join(dir, 'server/timelineData.mjs'), 'utf8');
    const map = await readFile(join(dir, 'src/pages/TimelineMap.tsx'), 'utf8');
    assert.match(adapter, /centuryPeriod\(validStart\)/);
    assert.match(map, /role="button"/);
    assert.match(map, /tabIndex=\{0\}/);
    assert.match(map, /e.key === 'Enter' \|\| e.key === ' '/);
    assert.match(map, /\.timeline-map-marker, \.timeline-event-geometry/);
    assert.match(map, /selectMappedEvent\(event\.id\)/);
    assert.match(map, /role="group"/);
    assert.match(map, /Century groupings are chronological/);
    const fragment = map.match(/<path\n[\s\S]*?data-testid=\{`shape-event-\$\{event\.id\}`\}\n\s*\/>/)?.[0];
    assert.ok(fragment, 'SVG path JSX fragment must exist');
    const ts = (() => {
      try { return require('typescript'); }
      catch { return require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }
    })();
    const node = ts.createSourceFile('feature.tsx', `const element = (${fragment});`, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
    assert.deepEqual(node.parseDiagnostics.map(e => ts.flattenDiagnosticMessageText(e.messageText, ' ')), []);
    const second = await applyMapEnhancements(dir);
    assert.ok(second.every(x => !x.updated));
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('fails before writing any file if an upstream section has changed', async () => {
  const dir = await makeFixture();
  try {
    await writeFile(join(dir, 'src/pages/TimelineMap.css'), '/* upstream changed */');
    await assert.rejects(() => applyMapEnhancements(dir), /reconcile branch changes before patching/);
    assert.equal(await readFile(join(dir, 'server/timelineData.mjs'), 'utf8'), files['server/timelineData.mjs']);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('refuses ambiguous upstream content instead of replacing multiple occurrences', () => {
  assert.throws(() => replaceExactlyOnce('foo foo', 'foo', 'bar', 'ambiguous'), /expected exactly one/);
});
