import fs from 'node:fs';
import assert from 'node:assert/strict';
import {actor,install,NS,applyPatch,messages} from './helpers/automation-fixtures.mjs';
globalThis.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL("../data/lingering-wounds.json",import.meta.url),"utf8"))});
install();globalThis.Actor=class{};globalThis.Item=class{};globalThis.CONFIG={statusEffects:{}};
const {GahlaActor,GahlaItem}=await import('../module/documents.mjs');
function make(){const a=new GahlaActor(),fixture=actor();delete fixture.usesHP;Object.assign(a,fixture);delete a.toggleCondition;a.system.stats.zyw=10;a.system.options={lingeringWounds:true};a.items.get=id=>a.items.find(i=>i.id===id);a.updateEmbeddedDocuments=async(type,docs)=>{for(const doc of docs){const i=a.items.get(doc._id);applyPatch(i,doc);}};a.createEmbeddedDocuments=async(type,docs)=>{const out=docs.map(d=>({...d,statuses:new Set(d.statuses),async delete(){a.effects.splice(a.effects.indexOf(this),1);}}));a.effects.push(...out);return out;};return a;}
const a=make();a.system.combat.wounds={value:9,max:10};const random=Math.random;Math.random=()=>0.295;
let r=await a.applyDamage(10,{wounds:1});assert.equal(r.totalWounds,10);assert.equal(r.lingeringScore,undefined);assert(a.system.combat.deadly);
r=await a.applyDamage(10,{wounds:1,successType:'bonus'});assert.equal(r.totalWounds,11);assert.equal(r.lingeringScore,50);
r=await a.applyDamage(10,{wounds:4,successType:'crit'});assert.equal(r.totalWounds,15);assert.equal(r.lingeringScore,100);
r=await a.applyDamage(10,{wounds:1});assert.equal(r.totalWounds,16);assert.equal(r.lingeringScore,90);
const armor={id:'ar',type:'armor',system:{equipped:true,armor:3,locations:{body:3}}};a.items.push(armor);a.system.combat.aura={value:3,max:9};assert.equal(await a.spendAura(1),false);await a.longRest();assert.equal(a.system.combat.aura.value,3);armor.system.equipped=false;assert.equal(a.system.combat.aura.value,3);assert(await a.spendAura(1));assert.equal(a.system.combat.aura.value,2);await a.longRest();assert.equal(a.system.combat.aura.value,9);
const mage=make();mage.system.derived.speedBase=9;mage.system.combat.currentSegments=9;mage.system.stats.wia=70;const sp=new GahlaItem();Object.assign(sp,{id:'spell',uuid:'Item.spell',name:'Długi cud',type:'spell',parent:mage,system:{prepared:true,school:'Kapłan',delay:20,minDelay:7,spellCost:19,aspects:[],damage:'',builderState:''},flags:{}});mage.items.push(sp);
let rolls=0;mage.rollTest=async()=>{rolls++;return {success:true,roll:40,bonus:false,criticalSuccess:false};};foundry.applications.api.DialogV2.confirm=async()=>true;
const c={id:'combatant',actor:mage};game.combat={id:'test',round:1,combatants:[c],syncCombatantFromActor:async()=>{},advanceGahlaTurn:async()=>{}};
let cast=await sp.roll({promptModifier:false});assert(cast.queued);assert.equal(rolls,0);assert.equal(mage.system.combat.longDebt,11);await mage.trackerStartRound();assert.equal(rolls,0);assert.equal(mage.system.combat.longDebt,2);await mage.trackerStartRound();assert.equal(rolls,0);assert(mage.system.combat.longReady);assert.equal(mage.system.combat.currentSegments,7);await mage.resolveLongAction();assert.equal(rolls,1);assert(mage.system.combat.done);await mage.resolveLongAction();assert.equal(rolls,1);
mage.system.combat.longDebt=12;mage.system.combat.done=false;mage.system.combat.currentSegments=0;await mage.toggleCondition('shocked',true);assert.equal(mage.system.combat.longDebt,0);assert.equal(mage.flags[NS].pendingSpell,null);assert(mage.system.combat.done);
Math.random=random;console.log('Canonical actor integration: cumulative wounds/LW first overflow, Aura/rest, deferred spell roll and Shock: PASS');

