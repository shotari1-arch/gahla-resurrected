import assert from 'node:assert/strict';
import {actor,install,NS,messages} from './helpers/automation-fixtures.mjs';
install();globalThis.Actor=class{};globalThis.Item=class{};
const {GahlaActor}=await import('../module/documents.mjs');
function make(){const a=new GahlaActor(),base=actor();delete base.usesHP;Object.assign(a,base);a.system.fate={personal:0};a.system.stats={sf:40,zr:40,per:50,zyw:9,bgl:90};a.system.derived={...a.system.derived,defense:0,armor:{body:0},physicalResistance:0};a.system.combat.currentSegments=40;a.system.combat.aura.value=0;a.system.npc.singleHitWoundCap=0;a.system.options={};return a;}
const a=make(),d=make(),w={id:'w',uuid:'Item.w',name:'Sword',type:'weapon',system:{delay:3,traits:['lekka'],hands:1,damage:'3k10+7',damageType:'physical',penetration:2,equipped:true}};a.items.push(w);
let paid=0,defenses=0,defensePaid=0;game.combat={id:'c',round:1,started:true,combatants:[{id:'c',actor:a}],spendSegments:async cost=>{paid+=cost;return true;},advanceGahlaTurn:async()=>{}};
foundry.applications.api.DialogV2.input=async()=>{defenses++;return {kind:'dodge',segments:2};};
const updateDefender=d.update.bind(d);d.update=async patch=>{const before=Number(d.system.combat.reservedSZ||0);const result=await updateDefender(patch);defensePaid+=Math.max(0,Number(d.system.combat.reservedSZ||0)-before);return result;};
const original=Math.random;
async function attack(raw,options={}){Math.random=()=>(raw-.5)/100;return a.rollAttack(d,w,{promptModifier:false,declaredDefense:{kind:'none'},...options});}
for(const [raw,options,effective,locationRoll,location]of [[27,{advantage:true},27,72,'body'],[72,{disadvantage:true},72,27,'rightArm'],[72,{advantage:true},27,27,'rightArm']]){
 const r=await attack(raw,options);const stored=messages.at(-1).flags[NS].attack;
 for(const record of [r,stored]){assert.equal(record.rawRoll,raw);assert.equal(record.mirrorRoll,locationRoll);assert.equal(record.effectiveRoll,effective);assert.equal(record.locationRoll,locationRoll);assert.equal(record.location,location);assert.equal(record.roll,effective);}
 assert(messages.at(-1).content.includes('Rzut fizyczny:'));assert.equal(r.bonusPoints,effective===27?2:0);
}
const normal=await attack(27,{advantage:true});const called=await attack(27,{advantage:true,calledShot:true,calledShotLocation:'head'});assert.equal(called.target,normal.target-30);assert.equal(called.location,'head');assert.equal(called.locationRoll,null);assert.equal(called.effectiveRoll,27);
// Full reroll entry point used by Fate and talents: new physical roll, same paid declaration.
const missed=await attack(100,{declaredDefense:null,advantage:true});assert(missed.criticalFailure);assert.equal(defenses,1);assert.equal(defensePaid,2);
const declaration=messages.at(-1).flags[NS].attack.declaredDefense,paidBefore=paid;
const rerolled=await attack(27,{advantage:true,free:true,declaredDefense:declaration});assert.equal(rerolled.rawRoll,27);assert.equal(rerolled.location,'body');assert.equal(rerolled.locationRoll,72);assert.equal(paid,paidBefore);assert.equal(defenses,1);assert.equal(defensePaid,2);
// Execute the actual Fate chat button listener (including spending the Fate point).
let click;globalThis.document={addEventListener:(_event,handler)=>{click=handler;}};
foundry.applications.sheets={ActorSheetV2:class{},ItemSheetV2:class{}};
const {registerChatActions}=await import('../module/sheets.mjs');registerChatActions();
const previous={...messages.at(-1),id:'fate-card'};game.messages.set(previous.id,previous);a.system.fate.personal=1;
globalThis.fromUuid=async uuid=>[a,d,w].find(x=>x.uuid===uuid);
const button={dataset:{action:'gahla-fate-attack',actor:a.uuid,target:d.uuid,weapon:w.uuid,advantage:'true'},closest:()=>({dataset:{messageId:previous.id}})};
Math.random=()=>.715;await click({target:{closest:()=>button}});
const fate=messages.at(-1).flags[NS].attack;assert.equal(a.system.fate.personal,0);assert.equal(fate.rawRoll,72);assert.equal(fate.effectiveRoll,27);assert.equal(fate.locationRoll,27);assert.equal(fate.location,'rightArm');assert.equal(paid,paidBefore);assert.equal(defenses,1);assert.equal(defensePaid,2);
assert.deepEqual(fate.declaredDefense,{...declaration,parryChat:null});
const effectiveCrit=await attack(40,{advantage:true});assert.equal(effectiveCrit.effectiveRoll,4);assert(effectiveCrit.criticalSuccess);assert.equal(effectiveCrit.bonusPoints,4);
const effectiveBonus=await attack(4,{disadvantage:true});assert.equal(effectiveBonus.effectiveRoll,40);assert(!effectiveBonus.criticalSuccess);assert.equal(effectiveBonus.bonusPoints,2);
for(const [raw,points]of [[27,2],[4,4]]){
 const hit=await attack(raw);assert.equal(hit.bonusPoints,points);
 Math.random=()=>.55;
 const damage=await a.rollDamageAgainst(d,w,{...hit,location:'body'},{skipAuraPrompt:true});assert.equal(damage.dice,3,'Quality does not add/multiply damage dice');assert(damage.damage>0);
 const zero=await a.rollDamageAgainst(d,w,{...hit,location:'body'},{skipAuraPrompt:true,auraDiceReduced:3});assert.equal(zero.damage,0);assert.equal(zero.wounds,0);assert.equal(zero.dice,0);
}
d.system.derived.armor.body=8;const zero=await a.rollDamageAgainst(d,w,{success:true,roll:27,location:'body'},{skipAuraPrompt:true});assert.equal(zero.damage,0);assert.equal(zero.wounds,0);
Math.random=original;
console.log('Actual attack flags, chat, called shot, full reroll without double costs, quality 2/4, zero dice with flat + penetration overflow: PASS');


