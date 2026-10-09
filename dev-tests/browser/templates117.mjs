import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url),H=req('handlebars'),{chromium}=req('playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
H.registerHelper('array',(...args)=>args.slice(0,-1));H.registerHelper('or',(a,b)=>Boolean(a||b));H.registerHelper('and',(a,b)=>Boolean(a&&b));H.registerHelper('json',JSON.stringify);
for(const [name,fn]of Object.entries({eq:(a,b)=>a===b,checked:v=>v?'checked':'',multiply:(a,b)=>Number(a)*Number(b),join:(a,sep)=>(a??[]).join(sep)}))H.registerHelper(name,fn);
const files=fs.readdirSync(path.join(root,'templates'),{recursive:true}).filter(p=>p.endsWith('.hbs'));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{const page=await browser.newPage();for(const file of files){const source=fs.readFileSync(path.join(root,'templates',file),'utf8');H.precompile(source);const html=H.compile(source)({});const result=await page.evaluate(html=>{const t=document.createElement('template');t.innerHTML=html;return {elements:t.content.children.length,looseText:[...t.content.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).length};},html);assert.equal(result.elements,1,file+' single Application part root');assert.equal(result.looseText,0,file+' loose text');}
 await page.addStyleTag({path:path.join(root,'styles/gahla.css')});const rules=await page.evaluate(()=>document.styleSheets[0].cssRules.length);assert(rules>100);console.log(`PASS ${files.length} Handlebars templates compile and render one HTML root; CSS loads ${rules} top-level rules in Edge. This checks parser acceptance, not every conditional branch or full CSS conformance.`);
}finally{await browser.close();}
