import assert from 'node:assert/strict';
import {actor,install,NS,applyPatch} from './helpers/automation-fixtures.mjs';
install();globalThis.Actor=class{};globalThis.Item=class{};
const {GahlaActor}=await import('../module/documents.mjs');
const {requestDefense,receiveDefenseMessage,chooseDefense,defenseOwner}=await import('../module/defense-declarations.mjs');
const gm={id:'gm',isGM:true,active:true},owner={id:'p',isGM:false,active:true,name:'Owner'};
game.users=[gm];game.users.get=id=>game.users.find(u=>u.id===id);game.user=gm;
const a=new GahlaActor(),f=actor();delete f.usesHP;Object.assign(a,f);a.system.fate={personal:0};a.system.stats.bgl=70;a.system.derived.defense=0;
const d=actor();d.system.derived.defense=0;d.testUserPermission=u=>u.id==='p';
const w={id:'w',uuid:'Item.w',name:'Sword',type:'weapon',system:{delay:4,traits:[],hands:1,damage:'3k10',equipped:true}};a.items=[w];
globalThis.fromUuid=async id=>[a,d,w].find(x=>x.uuid===id);
const events=[];let rng=0,n=0;const random=Math.random;Math.random=()=>{rng++;events.push('rng');return .5;};
ChatMessage.create=async data=>{const m={...data,id:'m'+(++n),author:game.user,async update(p){applyPatch(this,p);}};game.messages.set(m.id,m);if(data.flags?.[NS]?.attack)events.push('attack-card');return m;};
d.trackerReaction=async cost=>{events.push('defense-cost:'+cost);d.system.combat.reactionLeft--;return {ok:true};};
game.combat.combatants=[{id:'c',actor:a}];game.combat.spendSegments=async()=>{events.push('attack-cost');return true;};game.combat.advanceGahlaTurn=async()=>{};
let confirm;foundry.applications.api.DialogV2.input=async()=>{events.push('dialog');return new Promise(r=>{confirm=r;});};
const pending=a.rollAttack(d,w,{promptModifier:false});
for(let i=0;i<20&&!confirm;i++)await new Promise(r=>setTimeout(r,0));
assert.equal(rng,0);assert.equal(game.messages.size,0);assert.deepEqual(events,['dialog']);
confirm({kind:'dodge',segments:2});const hit=await pending;
assert(events.indexOf('defense-cost:2')<events.indexOf('rng'));
assert(events.indexOf('attack-cost')<events.indexOf('rng'));assert(events.indexOf('rng')<events.indexOf('attack-card'));
const card=Array.from(game.messages.values()).find(m=>m.flags?.[NS]?.attack);
assert.equal(card.flags[NS].attack.declaredDefense.defenseBonus,10);assert(!card.content.includes('gahla-auto-dodge'));assert(!card.content.includes('gahla-auto-parry'));
const firstRng=rng;foundry.applications.api.DialogV2.input=async()=>null;
assert.equal(await a.rollAttack(d,w,{promptModifier:false}),null);assert.equal(rng,firstRng);
// Reroll preserves the prior declaration and never charges a second defense.
const previousCosts=events.filter(e=>e.startsWith('defense-cost')).length;
await a.rollAttack(d,w,{promptModifier:false,free:true,declaredDefense:card.flags[NS].attack.declaredDefense});
assert.equal(events.filter(e=>e.startsWith('defense-cost')).length,previousCosts);
// Real parry entry point is paid before its own RNG, and before attack RNG.
d.system.combat.reactionLeft=1;d.mainWeapon=w;d.rollParry=async()=>{events.push('parry');return {success:true};};
foundry.applications.api.DialogV2.input=async()=>({kind:'parry'});
await a.rollAttack(d,w,{promptModifier:false});
const last=Array.from(game.messages.values()).at(-1);assert(last.flags[NS].attack.stopped);assert(!last.content.includes('gahla-auto-damage'));
// Remote handoff: only the chosen owner may answer; no RNG in either envelope.
game.users.push(owner);assert.equal(defenseOwner(d).id,'p');
const beforeRemote=rng;const remote=requestDefense(a,d);await new Promise(r=>setTimeout(r,0));
const req=Array.from(game.messages.values()).at(-1),payload=req.flags[NS].defenseRequest;
assert.equal(payload.recipient,'p');assert.equal(rng,beforeRemote);assert(!JSON.stringify(payload).includes('targetNumber'));assert(!Object.hasOwn(payload,'roll'));
let finished=false;remote.then(()=>{finished=true;});
await receiveDefenseMessage({author:gm,flags:{[NS]:{defenseResponse:{requestId:req.id,nonce:payload.nonce,decision:{kind:'none',defenseBonus:0}}}}});assert(!finished);
game.user=owner;foundry.applications.api.DialogV2.input=async()=>({kind:'none'});
await receiveDefenseMessage(req);const response=Array.from(game.messages.values()).at(-1);assert.equal(response.author.id,'p');
const count=game.messages.size;await receiveDefenseMessage(req);assert.equal(game.messages.size,count,'Duplicate delivery does not prompt/pay twice');
game.user=gm;await receiveDefenseMessage(response);assert.equal((await remote).kind,'none');assert.equal(req.flags[NS].defenseRequest.status,'complete');assert.equal(rng,beforeRemote);
// Invalid Unik, ranged parry and exhausted reactions cannot be charged.
d.system.combat.reactionLeft=1;let dialogs=0;foundry.applications.api.DialogV2.input=async()=>++dialogs===1?{kind:'dodge',segments:99}:{kind:'none'};
assert.equal((await chooseDefense(d,a)).kind,'none');
dialogs=0;foundry.applications.api.DialogV2.input=async()=>++dialogs===1?{kind:'parry'}:{kind:'none'};
assert.equal((await chooseDefense(d,a,{ranged:true})).kind,'none');
// Exercise real trackerReaction and real parry RNG, including deferred chat.
a.system.combat.reactionLeft=1;a.system.combat.reservedSZ=0;
game.combat.syncCombatantFromActor=async()=>{};
foundry.applications.api.DialogV2.input=async()=>({modifier:0});
const cardsBeforeParry=game.messages.size;
Math.random=()=>{assert.equal(a.system.combat.reservedSZ,2,'Parry must be paid before its RNG');return .5;};
const parry=await a.rollParry(d,{deferChat:true});assert(parry.chatData);assert.equal(game.messages.size,cardsBeforeParry);assert.equal(a.system.combat.reactionLeft,0);
// A fresh actor outside combat has zero segments: prepare a real trial pool.
game.combat=null;a.system.derived.speedBase=8;a.system.combat.currentSegments=0;a.system.combat.reservedSZ=0;a.system.combat.reactionLeft=0;
foundry.applications.api.DialogV2.input=async options=>{assert(options.content.includes('value="dodge"'));return {kind:'dodge',segments:2};};
const trial=await chooseDefense(a,d);assert.equal(trial.defenseBonus,10);assert.equal(a.system.combat.reservedSZ,2);assert.equal(a.system.combat.reactionLeft,0);
foundry.applications.api.DialogV2.input=async options=>{assert(!options.content.includes('value="dodge"'));return {kind:'none'};};
await chooseDefense(a,d);assert.equal(a.system.combat.reservedSZ,2,'No silent refill on repeated trial');
let trialStep=0;foundry.applications.api.DialogV2.input=async()=>++trialStep===1?{kind:'refresh'}:{kind:'dodge',segments:1};await chooseDefense(a,d);assert.equal(a.system.combat.reservedSZ,1);
Math.random=random;
console.log('Pre-roll defense: deferred RNG, costs, cancel, Unik, parry, reroll, remote owner/authentication, duplicate delivery: PASS');
