import assert from 'node:assert/strict';
import {install,actor,talent,NS,messages} from './helpers/automation-fixtures.mjs';
import {spiritAttack119} from '../module/talent-spirit119.mjs';
import {sequenceResult119,sequenceDiscount119} from '../module/talent-values119.mjs';
install();globalThis.Actor=class{};globalThis.Item=class{};
const {GahlaActor}=await import('../module/documents.mjs');
function make(items=[]){const a=new GahlaActor(),base=actor(items);delete base.usesHP;Object.assign(a,base);a.system.fate={personal:0};a.system.stats={sf:40,zr:40,per:50,zyw:9,bgl:90};a.system.derived={...a.system.derived,defense:0,armor:{body:0},physicalResistance:0};a.system.combat.aura.value=0;a.system.npc.singleHitWoundCap=0;a.system.options={};return a;}
const w={id:'w',uuid:'Item.w',name:'Pięść',type:'weapon',system:{profileId:'unarmed',delay:3,traits:['Lekka'],hands:1,damage:'3k10',damageType:'physical',penetration:0,equipped:true}};
const a=make([talent('Duchowa Pięść',2)]),d=make();a.items.push(w);game.combat.combatants=[];const random=Math.random;Math.random=()=>.55;
let calls=0;foundry.applications.api.DialogV2.input=async()=>{calls++;return {element:'fire'};};
const hit=await a.rollAttack(d,w,{promptModifier:false,declaredDefense:{kind:'none'}});assert.equal(calls,1);assert.deepEqual(hit.spirit,{element:'fire',dice:1});assert.deepEqual(messages.at(-1).flags[NS].attack.spirit,hit.spirit);
let damage=await a.rollDamageAgainst(d,w,{...hit,location:'body'},{skipAuraPrompt:true});assert.equal(damage.dice,4);
await a.rollAttack(d,w,{free:true,promptModifier:false,declaredDefense:{kind:'none'},declaredSpirit:hit.spirit});assert.equal(calls,1,'Fate keeps element chosen before original roll');
a.items[0].system.level=4;const p=spiritAttack119(a,w,'ice');assert.equal(p.dice,2);damage=await a.rollDamageAgainst(d,w,{success:true,location:'body',spirit:p},{skipAuraPrompt:true});assert.equal(damage.dice,5);
assert.equal(spiritAttack119(a,{system:{profileId:'sword'}},'fire'),null);assert.throws(()=>spiritAttack119(a,w,'invalid'));
for(const tier of [1,2,3,4]){const m=make([talent('Mistrz Sekwencji',tier)]);const next={complete:false};let r=sequenceResult119(m,{index:1,length:2},next,{success:true,bonus:true});assert.equal(r.points,[0,1,1,2][tier-1]);m.flags[NS]={sequence:next};r=sequenceResult119(m,{index:2,length:2},{complete:true},{success:true,bonus:true});assert.equal(r.points,0);assert.equal(r.state.discount,tier>=3?2:1);m.flags[NS].sequence119=r.state;assert.equal(sequenceDiscount119(m,{}),tier>=3?2:1);r=sequenceResult119(m,{index:4,length:4},{complete:true},{success:true,bonus:false},{promote:true});assert.equal(r.state.discount,tier>=3?4:2);assert.equal(r.result.bonus,tier===4);}
const seqActor=make([talent('Mistrz Sekwencji',2)]);seqActor.items.push(w);const maneuver={uuid:'Item.m',name:'Manewr',system:{maneuverOverlayVersion:2,maneuverDamageDiceDelta:0,maneuverDelayDelta:0,maneuverHitMod:0,maneuverPenetrationBonus:0}};
Math.random=()=>.265;const first=await seqActor.rollAttack(d,w,{maneuver,sequence:{index:1,length:2},declaredDefense:{kind:'none'},promptModifier:false});assert.equal(first.bonusPoints,3);assert(seqActor.flags[NS].sequence.bonus119);const saved=messages.at(-1).flags[NS].attack;
Math.random=()=>.555;await seqActor.rollAttack(d,w,{maneuver,sequence:{index:1,length:2},sequence119Previous:saved.sequence119Previous,free:true,declaredDefense:{kind:'none'},promptModifier:false});assert.equal(seqActor.flags[NS].sequence.bonus119,false,'Replacing first bonus by ordinary hit returns sequence first-bonus eligibility');
Math.random=random;console.log('PASS 119 actual Spirit attack and damage, pre-roll element persistence/reroll, natural classification; sequence discounts, first bonus and T4 promotion.');
