import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}try{res.setHeader('Content-Type',p.endsWith('.mjs')?'text/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(p));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;const messages=[],errors=[];let seq=0;
try{
 browser=await chromium.launch({headless:true,channel:'msedge'});
 const pages=[await browser.newPage(),await browser.newPage()];
 for(const [index,page]of pages.entries()){
  page.on('pageerror',e=>errors.push(e.message));
  await page.exposeBinding('publish',async(source,data)=>{
   const m={...data,id:'chat'+(++seq),author:{id:index?'owner':'gm'}};messages.push(m);
   for(const p of pages)await p.evaluate(m=>window.deliver(m),m);
   return m.id;
  });
  await page.exposeBinding('patchMessage',async(source,{id,patch})=>{
   for(const p of pages)await p.evaluate(({id,patch})=>{window.patch(game.messages.get(id),patch);},{id,patch});
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/templates/apps/encounter-builder.hbs`);
  await page.evaluate(async index=>{
   document.body.innerHTML='';const fixture=await import('/dev-tests/helpers/automation-fixtures.mjs');fixture.install();window.patch=fixture.applyPatch;
   globalThis.Actor=class{};globalThis.Item=class{};
   const {GahlaActor}=await import('/module/documents.mjs');const defense=await import('/module/defense-declarations.mjs');
   const gm={id:'gm',isGM:true,active:true},owner={id:'owner',isGM:false,active:true,name:'Owner'};game.users=[gm,owner];game.users.get=id=>game.users.find(u=>u.id===id);game.user=index?owner:gm;
   const a=new GahlaActor(),base=fixture.actor();delete base.usesHP;Object.assign(a,base);a.id='a';a.uuid='Actor.a';a.name='Attacker';a.testUserPermission=u=>u.isGM;a.system.fate={personal:0};a.system.stats.bgl=70;
   const d=new GahlaActor(),df=fixture.actor();delete df.usesHP;Object.assign(d,df);d.id='d';d.uuid='Actor.d';d.name='Defender';d.testUserPermission=u=>u.id==='owner';
   const weapon={id:'w',uuid:'Item.w',name:'Sword',type:'weapon',system:{delay:4,traits:[],hands:1,damage:'3k10',equipped:true}};a.items=[weapon];
   globalThis.fromUuid=async id=>[a,d,weapon].find(x=>x.uuid===id);game.actors=[a,d];
   window.rng=0;Math.random=()=>{window.rng++;return .5;};window.costs=[];
   const update=d.update.bind(d);d.update=async patch=>{const before=Number(d.system.combat.reservedSZ||0);const result=await update(patch),paid=Number(d.system.combat.reservedSZ||0)-before;if(paid>0)window.costs.push(paid);return result;};
   game.combat.combatants=[{id:'c',actor:a}];game.combat.spendSegments=async()=>true;game.combat.advanceGahlaTurn=async()=>{};
   foundry.applications.api.DialogV2.input=async options=>new Promise(resolve=>{const form=document.createElement('form');form.id='defense';form.innerHTML=options.content+'<button type="submit">Confirm</button>';form.onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form));form.remove();resolve(data);};document.body.append(form);});
   window.deliver=m=>{m.update=async patch=>window.patchMessage({id:m.id,patch});game.messages.set(m.id,m);void defense.receiveDefenseMessage(m).catch(e=>window.failure=e.message);};
   ChatMessage.create=async data=>game.messages.get(await window.publish(data));
   window.begin=()=>{void a.rollAttack(d,weapon,{promptModifier:false}).then(r=>{window.finished=true;window.hit=r?.roll;}).catch(e=>window.failure=e.message);};
  },index);
 }
 await pages[0].evaluate(()=>window.begin());
 await pages[1].locator('#defense').waitFor();
 assert.equal(await pages[0].evaluate(()=>window.rng),0);
 assert.equal(await pages[1].evaluate(()=>window.rng),0);
 assert.deepEqual(await pages[1].evaluate(()=>window.costs),[]);
 assert.equal(messages.length,1);assert(messages[0].flags['gahla-resurrected'].defenseRequest);assert(!messages[0].flags['gahla-resurrected'].attack);
 await pages[1].locator('select[name="kind"]').selectOption('dodge');
 await pages[1].locator('input[name="segments"]').fill('2');
 await pages[1].locator('button[type="submit"]').click();
 await pages[0].waitForFunction(()=>window.finished||window.failure);
 assert.equal(await pages[0].evaluate(()=>window.failure),undefined);
 assert.deepEqual(await pages[1].evaluate(()=>window.costs),[2]);
 const attack=messages.find(m=>m.flags?.['gahla-resurrected']?.attack)?.flags['gahla-resurrected'].attack;
 assert(attack);assert.equal(attack.declaredDefense.defenseBonus,10);assert.equal(attack.reacted,true);
 assert.equal(await pages[1].evaluate(()=>window.rng),0);assert((await pages[0].evaluate(()=>window.rng))>0);assert.deepEqual(errors,[]);
 const attackHTML=messages.find(m=>m.flags?.['gahla-resurrected']?.attack).content;
 await pages[0].setViewportSize({width:280,height:720});
 await pages[0].setContent('<body style="margin:4px;background:#ded9cd">'+attackHTML+'</body>');
 await pages[0].addStyleTag({content:fs.readFileSync(path.join(root,'styles/gahla.css'),'utf8')});
 const rect=await pages[0].locator('.gahla-defense-summary>div').boundingBox();assert(rect.width>200);assert(rect.height<120);
 await pages[0].screenshot({path:path.join(root,'..','attack-0114-280.png')});
 // Threshold layout is tested with the complete rendered Handlebars template in sheet117.mjs.
 console.log('Two isolated browser clients: owner-only prompt, no pre-declaration k100, one payment, attack revealed after confirmation: PASS');
}finally{if(browser)await browser.close();server.close();}
