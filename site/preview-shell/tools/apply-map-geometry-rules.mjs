/** Idempotent, fail-closed installer for PR #5; no production writes or deployment. */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const THIS_FILE=fileURLToPath(import.meta.url);
const IMPORT="import { geometryMatchesFeatureType } from './mapGeometryRules.mjs';\n";
const HEADER='// Medibo Timeline Map — schema-aligned, read-only Sheets adapter.\n';
const BEFORE="    if (geometry.type === 'Point' || geometry.type === 'MultiPoint') return {};";
const AFTER='    if (!geometryMatchesFeatureType(type, geometry)) return {};';
const SCRIPT_BEFORE='server/timelineData.test.mjs';
const SCRIPT_AFTER='server/timelineData.test.mjs server/mapGeometryRules.test.mjs server/mapGeometry.contract.test.mjs';

function exactlyOnce(contents, needle, path) {
  const n=contents.split(needle).length-1;
  if(n!==1)throw new Error(`Preflight failed ${path}: expected one matching snippet, found ${n}; inspect latest PR head and stop.`);
}

export async function applyAtRoot(root) {
  const adapterPath=join(root,'server/timelineData.mjs');
  const manifestPath=join(root,'package.json');
  const geometryPath=join(root,'server/mapGeometryRules.mjs');
  const unitPath=join(root,'server/mapGeometryRules.test.mjs');
  const contractPath=join(root,'server/mapGeometry.contract.test.mjs');
  const originalAdapter=await readFile(adapterPath,'utf8');
  const originalManifest=await readFile(manifestPath,'utf8');
  // All file existence and syntax checks happen BEFORE writing any file.
  await Promise.all([geometryPath,unitPath,contractPath].map(path=>readFile(path,'utf8')));
  const pkg=JSON.parse(originalManifest);
  if(typeof pkg.scripts?.['test:contracts']!=='string')throw new Error('Package contract-test script not found.');
  let adapter=originalAdapter;
  if(!adapter.includes(AFTER)) {
    exactlyOnce(adapter,HEADER,adapterPath);
    exactlyOnce(adapter,BEFORE,adapterPath);
    if(adapter.includes(IMPORT))throw new Error('Import exists without updated geometry guard; review code manually.');
    adapter=adapter.replace(HEADER,HEADER+IMPORT).replace(BEFORE,AFTER);
  } else if(!adapter.includes(IMPORT))throw new Error('Geometry guard exists but import is missing.');
  let manifest=originalManifest;
  const script=pkg.scripts['test:contracts'];
  if(!script.includes('server/mapGeometryRules.test.mjs')) {
    exactlyOnce(script,SCRIPT_BEFORE,manifestPath);
    pkg.scripts['test:contracts']=script.replace(SCRIPT_BEFORE,SCRIPT_AFTER);
    manifest=JSON.stringify(pkg,null,2)+'\n';
  } else if(!script.includes('server/mapGeometry.contract.test.mjs')) {
    throw new Error('Geometry unit test was present without contract test; review package script.');
  }
  // Source preflight success: only the two vetted project files may change.
  if(adapter!==originalAdapter)await writeFile(adapterPath,adapter);
  if(manifest!==originalManifest)await writeFile(manifestPath,manifest);
  return { changed:adapter!==originalAdapter||manifest!==originalManifest,
    files:[...(adapter!==originalAdapter?[adapterPath]:[]),...(manifest!==originalManifest?[manifestPath]:[])]};
}
if(process.argv[1]&&resolve(process.argv[1])===THIS_FILE){
  const root=resolve(dirname(THIS_FILE),'..');
  applyAtRoot(root).then(r=>process.stdout.write(`${r.changed?'Applied':'Already applied'}: ${r.files.length} modified files\n`)).catch(e=>{
    process.stderr.write(`${e.message}\n`);process.exitCode=1;
  });
}
