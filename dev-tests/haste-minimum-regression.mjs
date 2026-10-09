import assert from 'node:assert/strict';
import {actor,install,talent} from './helpers/automation-fixtures.mjs';
import {modified} from '../module/effects-engine.mjs';
import {calculateActorAbility} from '../module/ability-automation.mjs';
install();globalThis.Actor=class{};globalThis.Item=class{};
const {GahlaActor}=await import('../module/documents.mjs');
const a=new GahlaActor(),fixture=actor();delete fixture.usesHP;Object.assign(a,fixture);
a.system.conditions=['hasted'];a.system.derived.actionDelayMod=modified(a,0,'delay');
assert.equal(modified(a,0,'speed'),3);assert.equal(modified(a,0,'defense'),20);
for(const min of [1,3,4,5,7])assert.equal(modified(a,min,'minimumDelay'),min);
const target=actor();let paid;
game.combat.combatants=[{id:'c',actor:a}];game.combat.spendSegments=async cost=>{paid=cost;return false;};
for(const [delay,traits,hands,expected]of [[3,['Lekka'],1,3],[4,['Lekka'],1,3],[4,[],1,4],[5,[],2,5],[7,[],2,6]]){
 const w={id:'w',name:'Broń',type:'weapon',system:{delay,traits,hands,damage:'3k10',equipped:true}};
 await a.rollAttack(target,w,{declaredDefense:{kind:"none"},promptModifier:false});assert.equal(paid,expected,'Actual attack payment respects weapon minimum');
 const maneuver={name:'Szybki',system:{maneuverOverlayVersion:2,maneuverDelayDelta:-2}};
 await a.rollAttack(target,w,{declaredDefense:{kind:"none"},promptModifier:false,maneuver});assert(paid>=(traits.length?3:hands===2?5:4));
 const m=calculateActorAbility({mode:'maneuver',w_op:delay,w_dmg:3,w_min_op:traits.length?3:hands===2?5:4,fast:1},a);
 assert(m.finalOp>=m.minOp);
}
for(const spellClass of ['Półmag','Kapłan'])for(const tier of [1,2,3,4]){
 a.items=[talent('Biegłość Magiczna',4)];a.system.archetype=spellClass==='Kapłan'?'kaplan':'polmag';
 const s={mode:'spell',spellClass,tier,dmg:1,minusop:10,risks:{}};
 const r=calculateActorAbility(s,a);assert(r.op>=r.minOp);const min=r.minOp;
 a.system.conditions=[];assert.equal(calculateActorAbility(s,a).minOp,min);a.system.conditions=['hasted'];
}
assert.equal(modified(a,2,'reactionCost',{},1),2,'Haste does not invent a reaction discount');
a.system.conditions=['slowed'];assert.equal(modified(a,0,'speed'),-3);assert.equal(modified(a,0,'defense'),-20);assert.equal(modified(a,3,'delay'),4);assert.equal(modified(a,3,'minimumDelay'),3);
a.system.conditions=['hasted','slowed'];assert.equal(modified(a,3,'delay'),3);assert.equal(modified(a,3,'minimumDelay'),3);
console.log('Haste: real attack/maneuver payment, spell and miracle tiers, stacked reductions, unchanged Slow/reactions: PASS');
