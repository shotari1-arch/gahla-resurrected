import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(dir),results=[];
for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.mjs')&&n!=='run-regressions.mjs').sort()){
  const run=spawnSync(process.execPath,[path.join(dir,name)],{cwd:root,encoding:'utf8'});
  results.push({name,passed:run.status===0});console.log(`${run.status===0?'PASS':'FAIL'} ${name}`);
  if(run.status!==0)console.error(run.stdout,run.stderr);
}
const failed=results.filter(r=>!r.passed);console.log(`${results.length-failed.length}/${results.length} PASS`);process.exitCode=failed.length?1:0;
