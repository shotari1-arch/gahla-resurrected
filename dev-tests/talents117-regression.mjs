import assert from 'node:assert/strict';
import {actor,talent,install,NS,applyPatch,messages} from './helpers/automation-fixtures.mjs';
import {effectiveThresholds,holyFlameIgnoresResistance} from '../module/canonical-rules.mjs';
import {modified,resourceState,conditionLevel} from '../module/effects-engine.mjs';
import {activateTalent,expireRound} from '../module/automation-runtime.mjs';
import {talentErrors} from '../module/automation-rules.mjs';
import {ALL_TALENTS} from '../module/content.mjs';
install();globalThis.Actor=class{};globalThis.Item=class{};
const {GahlaActor}=await import('../module/documents.mjs');
function make(items=[]){const a=new GahlaActor(),base=actor(items);delete base.usesHP;Object.assign(a,base);a.system.stats={sf:40,zr:40,zyw:15,wia:70};a.system.fate={personal:0};a.system.derived={tier:1,physicalResistance:43,magicalResistance:22,spiritualResistance:37,mentalResistance:50,thresholdBonus:2,armor:{body:0},flatMelee:0};a.system.options={};return a;}
const a=make([talent('Mocna Skóra')]);for(const tier of [1,2,3,4]){a.system.derived.tier=tier;const t=effectiveThresholds(a);assert.equal(t.one,30+2+4+tier);assert.equal(t.two,45+2+4+tier);assert.equal(effectiveThresholds(a,'magical').one,34);assert.equal(a.system.derived.physicalResistance,43);}
for(const level of [1,2,3,4]){a.items=[talent('Naturalna Obrona',level)];assert.equal(effectiveThresholds(a).one,36+2*level);assert.equal(effectiveThresholds(a,'spiritual').one,35);}
const hybrid=talent('Zmiennokształtny',4);a.items=[talent('Mocna Skóra'),talent('Naturalna Obrona',4),hybrid];a.system.phase='beast';a.system.conditions=['fatigued','bleeding'];a.system.derived.tier=4;
const before=effectiveThresholds(a);assert.equal(before.resistanceBonus,4);await activateTalent(a,hybrid.id);const during=effectiveThresholds(a);assert.equal(during.resistanceBonus,8);assert.equal(during.bonus,before.bonus);assert.equal(during.baseI,before.baseI);assert.equal(during.one,before.one+4);assert.equal(conditionLevel(a,'fatigued'),0);assert.equal(conditionLevel(a,'bleeding'),0);assert.equal(modified(a,40,'test'),40);
game.combat.round=2;await expireRound(a,game.combat);assert.equal(effectiveThresholds(a).resistanceBonus,8);game.combat.round=3;await expireRound(a,game.combat);assert.equal(effectiveThresholds(a).resistanceBonus,4);assert(conditionLevel(a,'fatigued'));assert(conditionLevel(a,'bleeding'));
game.user.isGM=false;await assert.rejects(()=>activateTalent(a,hybrid.id),/użyć/);game.user.isGM=true;
// Natural defense resource resets only on a new round, and full Resistance is the test target.
a.system.conditions=[];a.flags[NS].automation.temporary=[];const natural=a.items.find(i=>i.name==='Naturalna Obrona');foundry.applications.api.DialogV2.input=async()=>({modifier:0});const oldRandom=Math.random;Math.random=()=>.715;
const r=await activateTalent(a,natural.id);assert.equal(r.target,43);assert.equal(r.effectiveRoll,27);assert.equal(resourceState(a,natural).remaining,0);await assert.rejects(()=>activateTalent(a,natural.id));game.combat.round++;assert.equal(resourceState(a,natural).remaining,1);
// Only the Spirit resistance contribution is bypassed, with explicit GM designation.
const priest=make([talent('Święty Płomień')]),victim=make([talent('Mocna Skóra')]);victim.flags[NS]={creatureOfDarkness:true};const fire={name:'Cud Ognia',system:{damage:'1k10+30',damageType:'spiritual',element:'Ogień',penetration:0,traits:[]}};
assert(holyFlameIgnoresResistance(priest,victim,fire,{isSpell:true}));const spiritual=effectiveThresholds(victim,'spiritual',{ignoreResistanceBonus:true});assert.equal(spiritual.passive,0);assert.equal(spiritual.one,32);assert.equal(spiritual.baseII,47);
for(const [isSpell,element,type,deity,dark]of [[false,'Ogień','spiritual','Gida',true],[true,'Woda','spiritual','Gida',true],[true,'Ogień','magical','Gida',true],[true,'Ogień','spiritual','Eruel',true],[true,'Ogień','spiritual','Gida',false]]){priest.system.deity=deity;victim.flags[NS].creatureOfDarkness=dark;assert(!holyFlameIgnoresResistance(priest,victim,{system:{element,damageType:type}},{isSpell}));}
priest.system.deity='Gida';victim.flags[NS].creatureOfDarkness=true;Math.random=()=>.05;
const holy=await priest.rollDamageAgainst(victim,fire,{location:'body',success:true},{isSpell:true,skipAuraPrompt:true});assert.equal(holy.damage,31);assert.equal(holy.wounds,1);
fire.system.damage='1k10+31';const holy2=await priest.rollDamageAgainst(victim,fire,{location:'body',success:true},{isSpell:true,skipAuraPrompt:true});assert.equal(holy2.damage,32);assert.equal(holy2.wounds,2);victim.flags[NS].creatureOfDarkness=false;const plain=await priest.rollDamageAgainst(victim,fire,{location:'body',success:true},{isSpell:true,skipAuraPrompt:true});assert.equal(plain.damage,32);assert.equal(plain.wounds,1);
// Old flat fields and HP resistances cannot silently subtract rolled damage.
victim.type='standard';victim.system.derived.spiritualFlatDR=99;const hp=await priest.rollDamageAgainst(victim,fire,{location:'body',success:true},{isSpell:true,skipAuraPrompt:true});assert.equal(hp.damage,32);
for(const name of ['Wybraniec Boży','Święty Wojownik','Błogosławiony'])assert(talentErrors(priest,ALL_TALENTS.find(t=>t.name===name),1,{purchase:true}).some(e=>e.includes('Special Feature')));
for(const level of [1,2,3,4]){const accurate=make([talent('Celny Cios',level)]);assert.equal(modified(accurate,0,'hit',{kind:'attack',ranged:false}),5*level);assert.equal(modified(accurate,0,'hit',{kind:'attack',ranged:true}),0);}
const canceled=make([talent('Naturalna Obrona',4)]);canceled.rollTest=async()=>null;await activateTalent(canceled,canceled.items[0].id);assert.equal(resourceState(canceled,canceled.items[0]).remaining,1);canceled.rollTest=async()=>{throw Error('Roll failed');};await assert.rejects(()=>activateTalent(canceled,canceled.items[0].id));assert.equal(resourceState(canceled,canceled.items[0]).remaining,1);
Math.random=oldRandom;console.log('117: all threshold talent ranks/types, Hybrid duration/GM/penalties, Natural Defense round use/full resistance/cancellation, Holy Flame isolation, HP and legacy flat fields, Celny Cios ranks: PASS');
