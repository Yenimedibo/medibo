/** Fail-closed, idempotent targeted changes for PR #5's existing checkout. */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
export function replaceExactlyOnce(content, before, after, label) {
  if (content.includes(after)) return { content, changed: false };
  const parts = content.split(before);
  if (parts.length !== 2) throw new Error(`${label}: expected exactly one matching upstream section, found ${parts.length - 1}; reconcile branch changes before patching`);
  return { content: parts.join(after), changed: true };
}
export async function applyMapEnhancements(baseDir = root) {
  const planned = [];
  const check = async (file, operations) => {
    const path = resolve(baseDir, file);
    let content = await readFile(path, 'utf8');
    let updated = false;
    for (const [before, after, label] of operations) {
      const result = replaceExactlyOnce(content, before, after, label);
      content = result.content;
      updated ||= result.changed;
    }
    planned.push({ file, path, content, updated });
  };
  // Preflight ALL source files before writing ANY changes.
  await check('server/timelineData.mjs', [
    ["// Medibo Timeline Map — schema-aligned, read-only Sheets adapter.",
      "import { centuryPeriod } from './centuryPeriod.mjs';\n\n// Medibo Timeline Map — schema-aligned, read-only Sheets adapter.",
      'century helper import'],
    ["period: safeText(field(record, ['Historical Period']) || 'Unclassified', 200),",
      "period: safeText(field(record, ['Historical Period']) || centuryPeriod(validStart), 200),",
      'century-based period fallback'],
  ]);
  await check('src/pages/TimelineMap.tsx', [
    ["  const toggleLayer = (id: string) => {",
      "  const selectMappedEvent = (id: string) => {\n    setSelectedId(id);\n    window.requestAnimationFrame(() => {\n      document.getElementById(`event-${id}`)?.scrollIntoView({\n        block: 'nearest',\n        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',\n      });\n    });\n  };\n  const toggleLayer = (id: string) => {",
      'map select and scroll handler'],
    ['<svg className="timeline-map-svg" viewBox="0 0 900 440" role="img" aria-labelledby="map-title map-description">',
      '<svg className="timeline-map-svg" viewBox="0 0 900 440" role="group" aria-labelledby="map-title map-description">',
      'interactive map SVG accessible tree'],
    ['<p className="timeline-filter-note">Filters remain available when the record is empty. A missing location is never inferred from a region label.</p>',
      '<p className="timeline-filter-note">When no researched historical period is assigned, records are grouped by century. Century groupings are chronological, not claims of shared political or cultural systems. A missing location is never inferred from a region label.</p>',
      'century period meaning made explicit'],
    ["if ((event.target as Element).closest('.timeline-map-controls, .timeline-map-marker')) return;",
      "if ((event.target as Element).closest('.timeline-map-controls, .timeline-map-marker, .timeline-event-geometry')) return;",
      'disable map drag capture on selectable shapes'],
    ["<path key={`geometry-${event.id}`} className=\"timeline-event-geometry\" d={path(geometry as never) ?? ''} />",
      `<path\n                       key={\`geometry-\${event.id}\`}\n                       className={\`timeline-event-geometry\${selectedId === event.id ? ' is-selected' : ''}\`}\n                       d={path(geometry as never) ?? ''}\n                       role="button"\n                       tabIndex={0}\n                       aria-label={\`Open details for mapped feature: \${event.title}, \${yearLabel(event)}\`}\n                       aria-pressed={selectedId === event.id}\n                       onClick={() => selectMappedEvent(event.id)}\n                       onKeyDown={(e) => {\n                         if (e.key === 'Enter' || e.key === ' ') {\n                           e.preventDefault();\n                           selectMappedEvent(event.id);\n                         }\n                       }}\n                       data-testid={\`shape-event-\${event.id}\`}\n                     />`,
      'keyboard-accessible route/area map selection'],
    ["onClick={() => setSelectedId(event.id)}\n                    data-testid={`marker-event-${event.id}`}",
      "onClick={() => selectMappedEvent(event.id)}\n                    data-testid={`marker-event-${event.id}`}",
      'point selection scrolls to details'],
  ]);
  await check('src/pages/TimelineMap.css', [[
    '.timeline-event-geometry { fill: #9c3b2322; stroke: var(--tm-red); stroke-width: 2.2; vector-effect: non-scaling-stroke; }',
    `.timeline-event-geometry { fill: #9c3b2322; stroke: var(--tm-red); stroke-width: 2.2; vector-effect: non-scaling-stroke; cursor: pointer; }\n.timeline-event-geometry.is-selected { stroke-width: 3.5; }\n.timeline-event-geometry:focus-visible { stroke: var(--tm-blue); stroke-width: 4; stroke-dasharray: 8 4; outline: none; }`,
    'interactive route/area feature styling',
  ]]);
  await check('server/timelineData.test.mjs', [
    ["assert.equal(event.linkedMapFeatureId, 'FEATURE-TEST-1');\n  assert.equal(event.period, 'Unclassified');",
      "assert.equal(event.linkedMapFeatureId, 'FEATURE-TEST-1');\n  assert.equal(event.period, '14th century CE');",
      'documented schema period expectation'],
    ["test('period is not inferred from Record Type when the documented event sheet has no period column', () => {\n  const event = parse([row({ 'Record Type': 'Continuity' })])[0];\n  assert.equal(event.period, 'Unclassified');",
      "test('century period derives from year, not the Record Type field', () => {\n  const event = parse([row({ 'Record Type': 'Continuity' })])[0];\n  assert.equal(event.period, '14th century CE');",
      'record type is not a historical period'],
  ]);
  await check('package.json', [
    ['node --test compatibility.test.mjs server.test.mjs',
      'node --test compatibility.test.mjs compatibility.release.test.mjs server.test.mjs',
      'register local production-routing regressions'],
    ['server/timelineData.test.mjs src/lib/access.test.mjs',
      'server/timelineData.test.mjs server/centuryPeriod.test.mjs server/timelinePeriod.contract.test.mjs src/lib/access.test.mjs',
      'register new period/data contract tests'],
    ['src/lib/access.test.mjs src/lib/authRouting.test.mjs',
      'src/lib/access.test.mjs src/lib/authRouting.test.mjs src/lib/legacyNavigation.test.mjs src/pages/TimelineMap.interaction.test.mjs',
      'register browser handoff URL and interactive map regressions'],
  ]);
  for (const item of planned) if (item.updated) await writeFile(item.path, item.content);
  return planned.map(({ file, updated }) => ({ file, updated }));
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  try {
    for (const { file, updated } of await applyMapEnhancements(root)) {
      process.stdout.write(`${updated ? 'updated' : 'unchanged'} ${file}\n`);
    }
  } catch (error) {
    process.stderr.write(`No changes committed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
