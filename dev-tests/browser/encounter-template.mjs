import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const html=fs.readFileSync(new URL('../../templates/apps/encounter-builder.hbs',import.meta.url),'utf8');
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage();
 const result=await page.evaluate(html=>{
   // Exercise the browser's HTML fragment parser and ApplicationV2's single-root
   // invariant. This is not a full Handlebars or Foundry integration test.
   const template=document.createElement('template');template.innerHTML=html;
   const root=template.content.firstElementChild;
   const count=template.content.children.length;
   const actions=['deploy','saveTemplate','createActors'].map(a=>root.querySelectorAll('[data-action="'+a+'"]').length);
   const inputs=['startEncounter','monsterName','monsterCount'].map(n=>root.querySelectorAll('[name="'+n+'"]').length);
   // Reproduce the reported defect by moving the toolbar outside the root.
   const toolbar=root.querySelector('.gahla-center-nav');root.before(toolbar);
   return {count,actions,inputs,brokenCount:template.content.children.length};
 },html);
 assert.equal(result.count,1);assert.equal(result.brokenCount,2);
 assert.deepEqual(result.actions,[1,1,1]);assert.deepEqual(result.inputs,[1,1,1]);
 console.log('Browser fragment: one root; all toolbar actions and fields inside it; old two-root defect reproduced: PASS');
}finally{await browser.close();}
