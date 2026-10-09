import assert from 'node:assert/strict';
import {actor,install,NS,applyPatch,messages} from './helpers/automation-fixtures.mjs';
import {handleSpellCondition} from '../module/spell-quality.mjs';
import {expireRound} from '../module/automation-runtime.mjs';
import {conditionLevel} from '../module/effects-engine.mjs';
import {handleDamageCard} from '../module/context-reactions.mjs';
install();globalThis.Actor=class{};globalThis.Item=class{};
const {GahlaActor}=await import('../module/documents.mjs');
function make(){const a=new GahlaActor(),base=actor();delete base.usesHP;Object.assign(a,base);a.system.fate={personal:0};a.system.stats.zyw=9;a.system.derived={...a.system.derived,thresholdBonus:0,physicalResistance:43,magicalResistance:20,spiritualResistance:80,armor:{body:0}};a.system.combat.aura.value=0;a.createEmbeddedDocuments=async(type,docs)=>{for(const d of docs){const e={...d,statuses:new Set(d.statuses),async delete(){a.effects.splice(a.effects.indexOf(this),1);}};a.effects.push(e);}};return a;}
const attacker=make(),defender=make();game.actors=[attacker,defender];const oldRandom=Math.random;Math.random=()=>0.75;
for(const [type,wounds]of [['magical',3],['spiritual',2]]){
 const result=await attacker.rollDamageAgainst(defender,{name:'Czar',system:{damage:'4k10',damageType:type,magical:true}},{success:true,roll:40,location:'body'},{isSpell:true});assert.equal(result.damage,32,'Passive resistance is not subtracted from displayed damage.');assert.equal(result.wounds,wounds);
}
const before=defender.system.combat.wounds.value;const cast={id:'cast',flags:{[NS]:{spellCast:{target:defender.uuid,attacker:attacker.uuid,state:{mode:'spell',state:2,duration:3,element:0}}}}};game.messages.set('cast',cast);
const button={dataset:{action:'gahla-spell-condition',target:defender.uuid,condition:'prone'},closest:()=>({dataset:{messageId:'cast'}})};
await handleSpellCondition(button);assert.equal(defender.effects.length,1);assert.equal(defender.effects[0].duration.units,'rounds');assert.equal(defender.effects[0].duration.value,3);assert.equal(defender.system.combat.wounds.value,before,'Resistance to state never prevents/changes damage.');assert.equal(conditionLevel(defender,'prone'),1);
await assert.rejects(()=>handleSpellCondition(button),/już/);await expireRound(defender,{id:'c1',round:3});assert.equal(defender.effects.length,1);defender.system.conditions=['prone'];await expireRound(defender,{id:'c1',round:4});assert.equal(defender.effects.length,0);assert.equal(conditionLevel(defender,'prone'),0);
const shield={id:'s',name:'Tarcza',type:'armor',system:{equipped:true,isShield:true,shieldLocation:'body',armor:2},async update(p){applyPatch(this,p);}};defender.items.push(shield);defender.applyDamage=async(amount,opts)=>defender.update({'system.combat.wounds.value':defender.system.combat.wounds.value+opts.wounds,[`flags.${NS}.resolvedDamage.${opts.resolutionId}`]:true});
const damage={id:'damage',flags:{[NS]:{damage:{target:defender.uuid,amount:32,wounds:3,location:'body',armorIds:['s'],options:{}}}}};game.messages.set('damage',damage);
const save={dataset:{action:'gahla-save-armor'},closest:()=>({dataset:{messageId:'damage'}})};await handleDamageCard(save);assert.equal(shield.system.armor,1);assert.equal(defender.system.combat.wounds.value,before+2);
await assert.rejects(()=>handleDamageCard({...save,dataset:{action:'gahla-break-armor'}}),/usunięta/);
const other={...damage,id:'no-shield',flags:{[NS]:{damage:{...damage.flags[NS].damage,armorIds:[]}}}};game.messages.set(other.id,other);await assert.rejects(()=>handleDamageCard({...save,closest:()=>({dataset:{messageId:other.id}})}),/pancerza/);
Math.random=oldRandom;console.log('Canonical damage/state integration: type-specific thresholds, no double resistance, duration and armor participation: PASS');
