import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const req=createRequire(import.meta.url),{chromium}=req('playwright'),H=req('handlebars');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
H.registerHelper('eq',(a,b)=>a===b);
const template=H.compile(fs.readFileSync(path.join(root,'templates/actor/character-sheet.hbs'),'utf8'));
const server=http.createServer(async(q,r)=>{if(q.url==='/render'){let body='';for await(const c of q)body+=c;r.setHeader('Content-Type','text/html; charset=utf-8');r.end(template(JSON.parse(body)));return;}if(q.url==='/'){r.end('<html><body><form class="gahla sheet actor window-content"></form></body></html>');return;}const p=path.resolve(root,'.'+new URL(q.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){r.writeHead(403).end();return;}try{r.setHeader('Content-Type',p.endsWith('.mjs')?'text/javascript':p.endsWith('.css')?'text/css':'text/html');r.end(fs.readFileSync(p));}catch{r.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await page.addStyleTag({path:path.join(root,'styles/gahla.css')});
 await page.addStyleTag({content:'body{margin:0;background:#121313;font-family:Arial;color:#e8dfcb}form.window-content{box-sizing:border-box;margin:16px auto;width:min(1160px,calc(100vw - 32px));height:calc(100vh - 32px);overflow:auto}*{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}'});
 await page.evaluate(async()=>{
  const f=await import('/dev-tests/helpers/automation-fixtures.mjs');f.install();foundry.applications.sheets={ActorSheetV2:foundry.applications.api.ApplicationV2,ItemSheetV2:foundry.applications.api.ApplicationV2};
  const {ALL_TALENTS}=await import('/module/content.mjs');
  const items=['Mocna Skóra','Nadludzka Siła','Celny Cios','Pierwsza Pomoc'].map(name=>{const def=ALL_TALENTS.find(t=>t.name===name);return f.talent(name,1,def?.system??def??{});});
  window.a=f.actor(items);a.name='JANUSZEX';a.img='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#232323"/><path d="M18 15L40 6 62 15 58 51 40 72 22 51Z" fill="#8e7a4d"/><path d="M27 25H53V33H27ZM37 37H43V57H37Z" fill="#232323"/></svg>');a.items.get=id=>a.items.find(i=>i.id===id);
  Object.assign(a.system,{species:'tauros',archetype:'wojownik',lifePath:'Święty Topór',level:1,creation:{completed:true},fate:{personal:2},stats:{sf:43,zr:35,per:32,er:28,um:22,og:31,wia:38,zyw:15,bgl:45},derived:{tier:1,speedBase:8,defense:55,physicalResistance:43,magicalResistance:28,spiritualResistance:38,mentalResistance:31,thresholdBonus:0,armor:{}}});a.system.combat.wounds.value=2;a.system.combat.aura={value:3,max:3};
  const {GahlaActorSheet}=await import('/module/sheets.mjs');window.app=new GahlaActorSheet();app.actor=a;app.document=a;app.isEditable=true;app.element=document.querySelector('form');
  window.SheetClass=GahlaActorSheet;window.renderSheet=async()=>{a.system.derived.tier=a.system.level>=8?4:a.system.level>=5?3:a.system.level>=2?2:1;const ctx=await app._prepareContext({});const html=await(await fetch('/render',{method:'POST',body:JSON.stringify(ctx)})).text();app.element.innerHTML=html;await app._onRender(ctx,{});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));};await renderSheet();
  if(document.querySelectorAll('.gahla-threshold-card').length!==3)throw Error('Three thresholds missing');
  if(document.querySelector('.physical .gahla-threshold-values').textContent.replace(/\s/g,'')!=='2RANY353RANY50')throw Error('Incorrect threshold display');
  if(document.querySelectorAll('.gahla-tools-menu.gm').length!==1)throw Error('GM menu missing');
  if(document.querySelector('.gahla-tools-menu [data-mode="spell"]'))throw Error('Warrior magic shortcut');
  document.querySelector('[data-gahla-tab="talents"]').click();document.querySelector('[data-talent-filter="active"]').click();
  if([...document.querySelectorAll('[data-sheet-talent]')].filter(c=>!c.hidden).length!==2)throw Error('Active filter incorrect');
  await renderSheet();if(app.element.dataset.activeTab!=='talents')throw Error('Tab reset');
  document.querySelector('[data-gahla-tab="character"]').click();
  game.user.isGM=false;await renderSheet();if(document.querySelector('.gahla-tools-menu.gm'))throw Error('GM menu visible to player');
  game.actors=[a];const {executeTool}=await import('/module/session-tools.mjs');let blocked=false;try{await executeTool('audit',a.uuid);}catch{blocked=true;}if(!blocked)throw Error('Player executed GM audit');
  a.items.push(f.talent('Umiejętności Magiczne'));await renderSheet();if(!document.querySelector('.gahla-tools-menu [data-mode="spell"]'))throw Error('Bridge magic shortcut missing');a.items.pop();game.user.isGM=true;await renderSheet();
 });
 for(const [width,height]of [[1920,1080],[1366,768],[900,768],[700,900]]){
  await page.setViewportSize({width,height});await page.evaluate(async()=>{await renderSheet();app.element.scrollTop=150;const before=app.element.scrollTop;a.system.combat.wounds.value++;await renderSheet();if(Math.abs(app.element.scrollTop-before)>2)throw Error('Scroll reset');app.element.scrollTop=0;});
  const metrics=await page.evaluate(()=>{const e=document.querySelector('form');return {width:e.clientWidth,scroll:e.scrollWidth,font:getComputedStyle(document.querySelector('.gahla-threshold-values b')).fontSize};});if(metrics.scroll>metrics.width+2)throw Error('Horizontal overflow '+JSON.stringify(metrics));if(parseFloat(metrics.font)<26)throw Error('Threshold font too small');
  await page.screenshot({path:path.join(root,'..',`sheet118-${width}.png`)});
 }
 await page.setViewportSize({width:1366,height:768});
 await page.evaluate(async()=>{a.system.level=2;await renderSheet();document.querySelector('[data-gahla-tab="development"]').click();document.querySelector('.gahla-level-progression').scrollIntoView();if(!document.querySelector('.gahla-level-progression').textContent.includes('+1 SZ'))throw Error('Next level preview missing');app.render=async()=>{await renderSheet();return app;};const plus=document.querySelector('[data-action="changeLevel"][data-delta="1"]');await SheetClass.DEFAULT_OPTIONS.actions.changeLevel.call(app,null,plus);if(a.system.level!==3)throw Error('Level button failed');document.querySelector('.gahla-level-progression').scrollIntoView();});
 await page.screenshot({path:path.join(root,'..','sheet118-development.png')});
 await page.evaluate(async()=>{const f=await import('/dev-tests/helpers/automation-fixtures.mjs');a.items.push(f.talent('Szkolenie Mnicha',1,{monkWeaponType:null}));await renderSheet();app.element.scrollTop=0;if(!document.querySelector('[data-action="chooseMonk"]'))throw Error('Missing monk selection warning');});
 await page.screenshot({path:path.join(root,'..','sheet118-monk.png')});
 await page.evaluate(()=>{document.querySelector('[data-gahla-tab="talents"]').click();document.querySelector('[data-talent-filter="all"]').click();document.querySelector('[data-tab="talents"]').scrollIntoView();const button=document.querySelector('[data-action="useActiveTalent"]');const transfer=new DataTransfer();button.dispatchEvent(new DragEvent('dragstart',{dataTransfer:transfer}));const payload=JSON.parse(transfer.getData('text/plain'));if(payload.type!=='GahlaTool'||payload.action!=='talent'||!payload.itemId)throw Error('Talent hotbar payload');});await page.screenshot({path:path.join(root,'..','sheet118-talents.png')});
 if(errors.length)throw Error(errors.join(';'));console.log('PASS sheet118: real template/context/listeners; thresholds, filters, tab/scroll preservation, GM visibility and execution guard, magic bridge, talent hotbar, 4 viewports. Foundry document lifecycle mocked.');
}finally{await browser?.close();server.close();}
