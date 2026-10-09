import assert from 'node:assert/strict';
import {actor,talent,install,applyPatch,NS} from './helpers/automation-fixtures.mjs';
import {ALL_TALENTS,WEAPONS,SHIELDS} from '../module/content.mjs';
import {canonicalTalentName} from '../module/canon-names.mjs';
import {canonItemPatch,migrateCanon115} from '../module/canon-migration.mjs';
import {bodyRuneCost,bodyRuneLimit,runeMasterBonus,runecraftTarget,spellCriticalFailureStart,reloadCost,aimBonus,controlledSequence,sequenceNext} from '../module/canon-mechanics.mjs';
import {computeArmorLocations,computeIgnoreLowAtLocation,shieldLocationLimit} from '../module/armor-rules.mjs';
import {talentAllowedForSpecial,minimumTalentTier,archetypeKeysForTalent} from '../module/talent-eligibility.mjs';
import {itemSnapshot,undoPurchase} from '../module/development-ledger.mjs';
install();
const a=actor([talent('Runotwórstwo',3),talent('Mistrz Run',3)]);a.system.stats={zyw:10,sf:41,zr:42,um:43,wia:44};a.system.archetype='polmag';
assert.equal(runecraftTarget(a),73);assert.equal(runecraftTarget(a,true),83);
for(const cost of [0,1,2,5]){a.items=a.items.filter(i=>i.type==='talent');if(cost)a.items.push({type:'rune',name:'Runa',system:{bodyRune:true,bodyRuneCost:cost}});assert.equal(bodyRuneCost(a),cost);assert.equal(runeMasterBonus(a),cost*5);assert.equal(spellCriticalFailureStart(a,'um'),96-cost);assert.equal(spellCriticalFailureStart(a,'wia'),96);}
assert.equal(bodyRuneLimit(a),5);a.system.stats.zyw=11;assert.equal(bodyRuneLimit(a),6,'16/3 rounds UP');a.system.archetype='kaplan';assert.equal(spellCriticalFailureStart(a,'um'),96);
const mr=ALL_TALENTS.find(t=>t.name==='Mistrz Run');assert.equal(minimumTalentTier(mr),3);assert(!talentAllowedForSpecial(mr,a));a.system.lifePath='Znawca Run';assert(talentAllowedForSpecial(mr,a));
const cs=ALL_TALENTS.find(t=>t.name==='Kontrolowana Sekwencja');assert.deepEqual([...archetypeKeysForTalent(cs)],['lowca']);assert.equal(minimumTalentTier(cs),3);
for(let tier=0;tier<=4;tier++){
 const warrior=actor(tier?[talent('Mistrz Tarczy',tier)]:[]);assert.equal(shieldLocationLimit(warrior),[1,2,3,4,4][tier]);
 for(const definition of SHIELDS){const shield=structuredClone(definition);shield.system.equipped=true;shield.system.shieldLocations=['body','head','leftArm','rightArm'];shield.parent=warrior;
  const armor=computeArmorLocations([shield],warrior);assert.equal(Object.values(armor).filter(v=>v>0).length,[1,2,3,4,4][tier]);assert.equal(armor.body,definition.system.armor);assert.equal(armor.leftLeg,0);
  assert.equal(computeIgnoreLowAtLocation([shield],'body',warrior),definition.system.ignoreLow+(tier===4?1:0));assert.equal(computeIgnoreLowAtLocation([shield],'leftLeg',warrior),0);
 }
}
const bow=WEAPONS.find(w=>w.name==='Krótki Łuk'),ranger=actor([talent('Przycelowanie'),talent('Sokole Oko',3),talent('Wielostrzał',3)]);
const ranged=WEAPONS.filter(w=>w.system.isRanged);assert.deepEqual(ranged.map(w=>[w.system.damage,w.system.delay,w.system.reload,w.system.penetration,w.system.runSlots]),[['3k10',2,4,0,2],['4k10',2,5,1,2],['3k10',2,6,1,1],['6k10',2,8,2,2],['10k10',2,10,2,2]]);
assert.equal(reloadCost(ranger,bow,2),6);assert.throws(()=>reloadCost(ranger,bow,3));ranger.items.find(i=>i.name==='Wielostrzał').system.level=4;assert.equal(reloadCost(ranger,bow,3),8);
ranger.items.push(talent('Szybkie Przeładowanie',4));assert.equal(reloadCost(ranger,bow),1);ranger.system.conditions=['hasted'];assert.equal(reloadCost(ranger,bow),1);ranger.system.conditions=['slowed'];assert.equal(reloadCost(ranger,bow,2),3);
assert.deepEqual([0,1,2,3,4].map(n=>aimBonus(ranger,n).dice),[0,0,2,2,3]);assert.equal(aimBonus(ranger,4).hit,60);ranger.items=ranger.items.filter(i=>i.name!=='Sokole Oko');assert.deepEqual(aimBonus(ranger,4),{hit:20,dice:2,segments:4});
ranger.items.push(talent('Kontrolowana Sekwencja',4));assert.throws(()=>sequenceNext(ranger,{index:4,length:4,finisher:'armor'}));assert.throws(()=>controlledSequence(ranger,{index:1,length:4,ignoreCalled:true}));
for(let index=1;index<=4;index++){const seq={index,length:4,ignoreCalled:index===2,finisher:index===4?'wound':''};const next=sequenceNext(ranger,seq);await ranger.setFlag(NS,'sequence',next);if(index===2)assert.throws(()=>sequenceNext(ranger,{index:3,length:4,ignoreCalled:true}));if(index===4)assert.equal(controlledSequence(ranger,seq).extraWound,1);}
assert(controlledSequence(ranger,{index:4,length:4,finisher:'armor'}).ignoreArmor);
const legacy=talent('John Cena',1);legacy.flags={};legacy.system.requirements='Łotr';legacy.uuid='Item.keep';legacy.update=async p=>applyPatch(legacy,p);game.items=[legacy];game.actors=[ranger];const before=ranger.items.length;for(const i of ranger.items)i.update=async p=>applyPatch(i,p);
await migrateCanon115();assert.equal(legacy.name,'Krok Widma');assert.equal(legacy.uuid,'Item.keep');assert.equal(legacy.system.requirements,'Łowca');assert.equal(canonItemPatch(legacy),null);await migrateCanon115();assert.equal(ranger.items.length,before);assert.equal(canonicalTalentName('Mistrz Bloku'),'Mistrz Bloku');assert.equal(canonicalTalentName('Mistrz Bloków'),'Garda Weterana');
const buyer=actor(),bought=talent('Unik Specjalny',1);bought.flags={};bought.system.requirements='Łotr';bought.update=async p=>applyPatch(bought,p);bought.delete=async()=>buyer.items.splice(buyer.items.indexOf(bought),1);buyer.items.push(bought);buyer.system.xp=450;
buyer.flags[NS]={development:{schema:1,opening:500,entries:[{id:'purchase',kind:'purchase',label:'Unik Specjalny',delta:-50,undo:{before:{},after:{},items:[{id:bought.id,before:null,after:itemSnapshot(bought)}]}}]}};game.actors=[buyer];await migrateCanon115();await undoPurchase(buyer,'purchase');assert.equal(buyer.items.length,0);assert.equal(buyer.system.xp,500,'Renaming migration preserves purchase undo');
console.log('Canon 0.11.5: names/idempotent migration, Tier/tree/path, shields T0–T4, runes/CF/ceil, all ranged profiles, reload/aim, one-use ordered Sequence: PASS');
