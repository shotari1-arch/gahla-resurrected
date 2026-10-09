import {fileURLToPath} from 'node:url';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const req=createRequire(import.meta.url);
const {chromium}=req('playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const server=http.createServer((request,response)=>{const p=path.resolve(root,'.'+new URL(request.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}try{response.setHeader('Content-Type',p.endsWith('.mjs')?'text/javascript':'text/html; charset=utf-8');response.end(fs.readFileSync(p));}catch{response.writeHead(404);response.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage();const browserErrors=[];page.on('pageerror',e=>browserErrors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/templates/apps/ability-builder.hbs`);
 const result=await page.evaluate(async()=>{
   // Exercise real DOM listeners with the actual module and template selectors.
   // Handlebars/Foundry rendering is deliberately not mocked as a full VTT test.
   const fixture=await import('/dev-tests/helpers/automation-fixtures.mjs');fixture.install();
   const actor=fixture.actor([fixture.talent('Święty Płomień')]);game.actors=[actor];game.actors.get=id=>game.actors.find(a=>a.id===id);game.user.character=actor;
   const {GahlaAbilityBuilder}=await import('/module/ability-builder.mjs');const app=new GahlaAbilityBuilder({actor});app.element=document.body;
   document.querySelector('#s_class').innerHTML='<option value="Półmag">Półmag</option><option value="Kapłan">Kapłan</option>';
   document.querySelector('#s_tier').innerHTML=[1,2,3,4].map(t=>'<option value="'+t+'">'+t+'</option>').join('');
   for(const input of document.querySelectorAll('input[type="number"]'))input.value='0';
   for(const input of document.querySelectorAll('input[type="checkbox"]'))input.checked=false;
   await app._onRender({},{});
   if(document.querySelectorAll('.gahla-builder-extras').length!==1)throw Error('Missing extension fields');
   await app._onRender({},{});if(document.querySelectorAll('.gahla-builder-extras').length!==1)throw Error('Duplicate extension fields');
   document.querySelector('#s_class').value='Kapłan';document.querySelector('#s_tier').value='4';document.querySelector('#s_dmg').value='0';document.querySelector('#s_range').value='0';
   document.querySelector('#s_element').value='1';document.querySelector('#s_el_name').value='Ogień';
   document.querySelector('#s_element').dispatchEvent(new Event('input',{bubbles:true}));
   const cost=document.querySelector('#c_cost').textContent;if(cost!=='3')throw Error('Live cost should be 3, got '+cost);
   document.querySelector('[data-extra-aspect="heal"]');
   const heal=document.querySelector('#s_heal');heal.value='1';heal.dispatchEvent(new Event('change',{bubbles:true}));
   if(app.draft.heal!==1)throw Error('Draft did not sync');
   const self=document.querySelector('#auto_self');self.checked=true;self.dispatchEvent(new Event('change',{bubbles:true}));
   if(!app.draft.selfTarget)throw Error('Self target not synced');
   const ids=Array.from(document.querySelectorAll('[id]')).map(e=>e.id);if(new Set(ids).size!==ids.length)throw Error('Duplicate HTML IDs');
   const damage=document.querySelector('#s_dmg');damage.value='100';damage.dispatchEvent(new Event('input',{bubbles:true}));
   if(!document.querySelector('[data-action="save"]').disabled||!document.querySelector('.validation-errors'))throw Error('Invalid build not displayed');
   damage.value='0';damage.dispatchEvent(new Event('input',{bubbles:true}));
   if(document.querySelector('[data-action="save"]').disabled)throw Error('Save stayed disabled after correction');
   const {calculateActorAbility}=await import('/module/ability-automation.mjs');const check=calculateActorAbility(app.draft,actor);if(!check.valid)throw Error(check.errors.join('; '));
   return {cost,extraControls:document.querySelectorAll('[data-extra-aspect]').length,validation:document.querySelector('[data-automation-validation]').textContent};
 });console.log(JSON.stringify(result));
 await page.addStyleTag({content:fs.readFileSync(path.join(root,'styles/gahla.css'),'utf8')});
 await page.addStyleTag({content:'body {margin:0;background:#191817;color:#eee;font-family:Arial} .gahla-ability-builder-form {height:calc(100vh - 24px);overflow:auto}'});
 await page.evaluate(()=>{document.body.classList.add('gahla');document.querySelectorAll('.gahla-builder-mode')[1].classList.add('hidden'); const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode())n.textContent=n.textContent.replace(/{{[^]*?}}/g,'');});
 for(const width of [1200,760,480]) {
  await page.setViewportSize({width,height:900});
  const metrics=await page.evaluate(()=>{const root=document.querySelector('.gahla-ability-builder-form');return {width:root.clientWidth,scroll:root.scrollWidth,count:document.querySelectorAll('[data-extra-aspect]').length,summary:document.querySelector('#summary_cost').textContent};});
  if(metrics.scroll>metrics.width+2)console.log(await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,cls:e.className,id:e.id,width:e.getBoundingClientRect().width})).slice(0,20)));
  if(metrics.scroll>metrics.width+2)throw Error('Horizontal overflow: '+JSON.stringify({width,...metrics}));
  if(metrics.count!==24)throw Error('Missing or duplicate extra aspects');
  await page.screenshot({path:path.join(root,'..','creator-'+width+'.png')});
 }
 if(browserErrors.length)throw Error(browserErrors.join('; '));
 console.log('Responsive creator DOM/CSS: 1200, 760, 480 px PASS');
}finally{if(browser)await browser.close();server.close();}

