import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyAtRoot } from './apply-map-geometry-rules.mjs';

const HEADER='// Medibo Timeline Map — schema-aligned, read-only Sheets adapter.\n';
const BODY="  if (['territory', 'route', 'area'].includes(type)) {\n    const geometry = parseGeometry(field(record, ['Geometry ID / URL']));\n    if (!geometry) return {};\n    if (geometry.type === 'Point' || geometry.type === 'MultiPoint') return {};\n    return { geometry, locationPrecision: 'verified' };\n  }";
async function fixture(adapter=HEADER+BODY) {
  const root=await mkdtemp(join(tmpdir(),'medibo-geom-'));
  await Promise.all([mkdir(join(root,'server')),mkdir(join(root,'tools'))]);
  for(const name of ['mapGeometryRules.mjs','mapGeometryRules.test.mjs','mapGeometry.contract.test.mjs'])
    await writeFile(join(root,'server',name),'// synthetic fixture');
  await writeFile(join(root,'server/timelineData.mjs'),adapter);
  await writeFile(join(root,'package.json'),JSON.stringify({scripts:{'test:contracts':'node --test server/timelineData.test.mjs src/foo.test.mjs'}},null,2)+'\n');
  return root;
}
test('installer writes only vetted adapter and test script, once', async()=>{
  const root=await fixture();
  try {
    const once=await applyAtRoot(root);assert.equal(once.changed,true);assert.equal(once.files.length,2);
    const adapter=await readFile(join(root,'server/timelineData.mjs'),'utf8');
    assert.match(adapter,/import \{ geometryMatchesFeatureType \}/);
    assert.match(adapter,/if \(!geometryMatchesFeatureType\(type, geometry\)\) return \{\};/);
    const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
    assert.match(pkg.scripts['test:contracts'],/server\/mapGeometryRules\.test\.mjs/);
    assert.match(pkg.scripts['test:contracts'],/server\/mapGeometry\.contract\.test\.mjs/);
    const twice=await applyAtRoot(root);assert.equal(twice.changed,false);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('upstream mismatch fails without changing either file',async()=>{
  const root=await fixture(HEADER+'// changed upstream: not the expected geometry parser');
  try{
    const before=await readFile(join(root,'server/timelineData.mjs'),'utf8');
    await assert.rejects(applyAtRoot(root),/Preflight failed/);
    assert.equal(await readFile(join(root,'server/timelineData.mjs'),'utf8'),before);
    const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
    assert.ok(!pkg.scripts['test:contracts'].includes('mapGeometryRules'));
  }finally{await rm(root,{recursive:true,force:true});}
});
