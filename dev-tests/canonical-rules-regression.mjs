import fs from 'node:fs';
import assert from 'node:assert/strict';
import { actor, talent, install, NS, applyPatch } from './helpers/automation-fixtures.mjs';
import { effectiveThresholds, thresholdWounds, auraAccess, powerSourceProfile, spellDamageType } from '../module/canonical-rules.mjs';
import { evaluateTest, damageFromAttack, lingeringWoundScore, woundCountFromDamage } from '../module/rules.mjs';
import { applyTrackerReaction, applyTrackerAction, startTrackerRound, effectiveSegments, cancelTrackerLong } from '../module/tracker-rules.mjs';
import { calculateActorAbility } from '../module/ability-automation.mjs';
import { qualityChoices } from '../module/spell-quality.mjs';
import { armorContributors } from '../module/armor-rules.mjs';
install();
for(let r=1;r<=5;r++){const result=evaluateTest(r,-20);assert(result.success&&result.criticalSuccess);assert(!result.bonus);}
const weapon={system:{damage:'7k10',damageType:'physical'}};
for(const result of [{bonus:true},{criticalSuccess:true},{bonus:true,criticalSuccess:true}])assert.equal(damageFromAttack({weapon,attackResult:result}).dice,7);
let s={currentSegments:9,reservedSZ:0,reactionLeft:1};s=applyTrackerReaction(s,3).state;assert.equal(s.currentSegments,9);s=applyTrackerAction(s,5).state;assert.equal(s.currentSegments,4);assert.equal(s.reservedSZ,3);assert.equal(effectiveSegments(s),1);assert(!applyTrackerAction(s,2).ok);
s=applyTrackerAction({currentSegments:3,reactionLeft:1},5,'c').state;assert.equal(s.transferSegments,3);assert(s.done);s=startTrackerRound(s,9);const transferred=applyTrackerAction(s,5);assert.equal(transferred.cost,2);assert.equal(transferred.state.transferSegments,0);assert.equal(applyTrackerAction(transferred.state,5).cost,5);
assert(!applyTrackerAction({currentSegments:3,reactionLeft:0},5,'c').ok);
s=applyTrackerAction({currentSegments:9,reactionLeft:1},20,'l').state;assert.equal(s.longDebt,11);assert(!applyTrackerReaction(s,1).ok);assert(!applyTrackerAction(s,2,'c').ok);
s=startTrackerRound(s,9);assert.equal(s.longDebt,2);assert.equal(s.currentSegments,0);s=startTrackerRound(s,9);assert(s.longReady);assert.equal(s.currentSegments,7);assert(!s.done);assert(!applyTrackerAction(s,2).ok);assert(!applyTrackerReaction(s,1).ok);assert(cancelTrackerLong(s).state.done);
const a=actor();a.system.stats.zyw=9;Object.assign(a.system.derived,{thresholdBonus:0,physicalResistance:43,magicalResistance:21,spiritualResistance:59});
assert.deepEqual([effectiveThresholds(a).one,effectiveThresholds(a).two],[22,31]);
for(let life=1;life<=20;life++)for(let bonus=0;bonus<=6;bonus++)for(let passive=0;passive<=9;passive++)for(let d=0;d<200;d++){
 const expected=woundCountFromDamage(Math.max(0,d-passive),life,bonus);
 assert.equal(thresholdWounds(d,{baseI:life*2+bonus,baseII:life*3+bonus,passive}),expected);
}
assert.equal(thresholdWounds(58,effectiveThresholds(a)),5);assert.equal(thresholdWounds(85,effectiveThresholds(a)),6);assert.equal(thresholdWounds(4,effectiveThresholds(a)),0);assert.equal(thresholdWounds(5,effectiveThresholds(a)),1);
a.flags[NS]={modifiers:[{target:'threshold',op:'add',value:1,when:{damageType:'magical'}}]};assert.equal(effectiveThresholds(a,'magical').one,21);assert.equal(effectiveThresholds(a,'physical').one,22);
assert.equal(lingeringWoundScore({roll:30,woundsOverMax:5,successType:'bonus'}),90);assert.equal(lingeringWoundScore({roll:30,woundsOverMax:5,successType:'crit'}),100);
const armor={id:'armor',type:'armor',system:{equipped:true,armor:3,locations:{body:3}}},shield={id:'shield',type:'armor',system:{equipped:true,isShield:true,armor:2,shieldLocation:'body'}};
a.items=[armor,shield];assert(!auraAccess(a).allowed);assert(!auraAccess(a).regenerate);armor.system.equipped=false;assert(auraAccess(a).allowed);a.system.archetype='wojownik';assert(!auraAccess(a).allowed);a.items.push(talent('Duchowa Pięść'));assert(auraAccess(a).allowed);
armor.system.equipped=true;assert.deepEqual(armorContributors([armor,shield],'body'),['armor','shield']);assert.deepEqual(armorContributors([armor,shield],'head'),[]);
const src={system:{sourceTier:4,enchantments:['test','aura','element:fire','quality']}};assert.deepEqual(powerSourceProfile(src,'Ogień'),{test:15,aura:1,dice:1,bonus:1,critical:2,errors:[]});assert.equal(powerSourceProfile(src,'water').dice,0);assert.equal(powerSourceProfile({...src,system:{...src.system,sourceTier:1}}).errors.length,1);
assert.equal(spellDamageType('Kapłan'),'spiritual');assert.equal(spellDamageType('polmag'),'magical');
a.items=[];a.system.archetype='polmag';const st={mode:'spell',spellClass:'Półmag',tier:4,dmg:4,element:1,elName:'light'};assert(!calculateActorAbility(st,a).valid);st.elName='fire';assert(calculateActorAbility(st,a).valid);const q=qualityChoices(st,a,4);assert(q.some(c=>c.key==='dmg'&&c.cost===1));assert(!q.some(c=>c.key==='heal'||c.key==='pen'));assert(qualityChoices({...st,dmg:20},a,4).some(c=>c.key==='dmg'),'Quality may exceed Tier budget.');
console.log('Canonical math: reactions, transfer, long actions, 280000 threshold comparisons, LW, Aura, source and quality: PASS');


const actorTemplate=fs.readFileSync(new URL('../templates/actor/character-sheet.hbs',import.meta.url),'utf8');assert(!/name="system.combat.wounds.value"[^>]*max=/.test(actorTemplate),'Wound input cannot cap accumulated wounds.');
