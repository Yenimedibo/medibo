import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const tsx = await readFile(new URL('./TimelineMap.tsx', import.meta.url), 'utf8');
const css = await readFile(new URL('./TimelineMap.css', import.meta.url), 'utf8');

test('TimelineMap TSX syntax is valid after geometry interaction changes', () => {
  const source = ts.createSourceFile('TimelineMap.tsx',tsx,ts.ScriptTarget.ES2022,true,ts.ScriptKind.TSX);
  assert.deepEqual(source.parseDiagnostics.map(x=>ts.flattenDiagnosticMessageText(x.messageText,' ')),[]);
});
test('verified routes and areas are clickable and keyboard selectable', () => {
  assert.match(tsx,/data-testid=\{`shape-event-\$\{event\.id\}`\}/);
  assert.match(tsx,/role="button"/);
  assert.match(tsx,/tabIndex=\{0\}/);
  assert.match(tsx,/e\.key === 'Enter' \|\| e\.key === ' '/);
  assert.match(tsx,/aria-pressed=\{selectedId === event\.id\}/);
  assert.match(tsx,/selectMappedEvent\(event\.id\)/);
  assert.match(tsx,/getElementById\(`event-\$\{id\}`\)/);
  assert.match(tsx,/\.timeline-map-marker, \.timeline-event-geometry/);
});
test('map paths show a visible keyboard focus state', () => {
  assert.match(css,/\.timeline-event-geometry:focus-visible/);
  assert.match(css,/\.timeline-event-geometry\.is-selected/);
});
