import assert from 'node:assert/strict';
import {actor,install,NS,applyPatch} from './helpers/automation-fixtures.mjs';
import {nextGahlaCombatant,bossPauseActive,effectiveSegments} from '../module/tracker-rules.mjs';
install();globalThis.Actor=class{};globalThis.Item=class{};globalThis.Combat=class{async nextRound(){this.round++;return this;}};
foundry.utils.deepClone=structuredClone;globalThis.CSS={escape:s=>s};
const {GahlaActor,GahlaItem}=await import('../module/documents.mjs');
const {GahlaCombat}=await import('../module/combat.mjs');
const {GahlaInitiativeTracker}=await import('../module/tracker.mjs');
const {isOffensiveSpell}=await import('../module/spell-quality.mjs');
const w={id:'w',uuid:'Item.w',name:'Sword',type:'weapon',system:{damage:'3k10',damageType:'physical',delay:3,traits:['lekka'],hands:1,equipped:true}};
function make(name,sz,boss=false){const a=new GahlaActor(),base=actor();delete base.usesHP;Object.assign(a,base);a.name=name;a.type=boss?'boss':'character';a.system.fate={personal:0};a.system.stats={sf:40,zr:40,per:50,bgl:90,zyw:9,wia:90};a.system.derived={...a.system.derived,defense:0,speedBase:sz,armor:{body:0}};a.system.combat={...a.system.combat,currentSegments:sz,trackerBoss:boss,reactionLeft:boss?3:1,reactionMax:boss?3:1};a.items.push(w);return a;}
let boss,A,B,combat;
function reset(){boss=make('Boss',20,true);A=make('A',8);B=make('B',7);const cs=[boss,A,B].map((actor,i)=>({id:'c'+i,actor,name:actor.name,initiative:actor.system.combat.currentSegments}));cs.contents=cs;cs.get=id=>cs.find(c=>c.id===id);combat=new GahlaCombat();Object.assign(combat,{id:'combat',started:true,round:1,turn:0,combatants:cs,turns:cs,async update(p){applyPatch(this,p);return this;},async setInitiative(id,value){cs.get(id).initiative=value;}});game.combat=combat;game.user={id:'gm',isGM:true};game.actors=[boss,A,B];}
const original=Math.random;Math.random=()=>.265;foundry.applications.api.DialogV2.input=async()=>({modifier:0,kind:'none'});
const next=()=>nextGahlaCombatant(combat.combatants)?.actor;
const hit=()=>boss.rollAttack(A,w,{promptModifier:false,declaredDefense:{kind:'none'}});
reset();await hit();assert.equal(boss.system.combat.currentSegments,17);assert(boss.system.combat.justActed);assert.equal(next(),A);assert.equal(combat.turn,1);
const tracker=new GahlaInitiativeTracker();assert.equal((await tracker._prepareContext()).activeName,'A');
const pause=boss.flags[NS].bossPauseId;
await boss.trackerReaction(1);assert.equal(effectiveSegments(boss.system.combat),16);assert.equal(combat.combatants[0].initiative,17);assert.equal(boss.flags[NS].bossPauseId,pause);assert.equal(next(),A);
await boss.rollParry(A);assert.equal(boss.system.combat.reservedSZ,3);assert.equal(boss.flags[NS].bossPauseId,pause);assert.equal(next(),A);
await boss.rollAttack(A,w,{free:true,promptModifier:false,declaredDefense:{kind:'none'}});assert.equal(boss.flags[NS].bossPauseId,pause);assert.equal(next(),A);
await A.trackerAction(3);assert.equal(A.system.combat.currentSegments,5);assert.equal(next(),boss);assert.equal(combat.turn,0);assert.equal((await tracker._prepareContext()).activeName,'Boss');
reset();await boss.trackerReaction(1);await boss.rollParry(A);assert(!boss.system.combat.justActed);assert.equal(next(),boss);await combat.spendSegments(3,'c0');assert(!boss.system.combat.justActed,'Payment alone is not an offensive action');
await hit();const nonce=boss.flags[NS].bossPauseId;await combat.spendSegments(1,'c1');assert(bossPauseActive(combat.combatants[0],combat.combatants),'Raw payment does not release pause');assert.equal(boss.flags[NS].bossPauseId,nonce);
// Player cannot update a GM-owned Boss: acknowledgement remains valid on repeated actions.
reset();await hit();boss.isOwner=false;const savedUpdate=boss.update;boss.update=async()=>{throw Error('Player must not update unowned Boss');};game.user={id:'player',isGM:false};
await A.trackerAction(2);assert.equal(next(),boss);await A.trackerAction(2);assert.equal(next(),boss);
boss.update=savedUpdate;game.user.isGM=true;await hit();assert.equal(next(),B,'A fresh offensive action pauses Boss for the highest remaining non-Boss');
reset();boss.system.combat.justActed=true;boss.isOwner=false;game.user.isGM=false;await A.trackerAction(2);assert.equal(next(),boss,'Legacy justActed flag requires no migration');
// Shared queue ignores illegal candidates and has no deadlock when only Bosses remain.
reset();await hit();combat.combatants[1].defeated=true;assert.equal(next(),B);B.system.combat.longDebt=2;assert.equal(next(),boss);
// Main maneuver, spell, explicit action; reaction spells and support do not trigger pause.
reset();const maneuver=new GahlaItem();Object.assign(maneuver,{type:'maneuver',name:'Maneuver',parent:boss,system:{prepared:true},uuid:'Item.m'});await maneuver.roll({weapon:w,target:A,promptModifier:false});assert.equal(next(),A);
for(const data of [{damage:'1k10'},{damage:'0',builderState:JSON.stringify({hitminus:1})},{damage:'0',builderState:JSON.stringify({extraAspects:{speedPenalty:1}})}]){
 reset();const spell=new GahlaItem();Object.assign(spell,{id:'spell',uuid:'Item.spell',type:'spell',name:'Offensive spell',parent:boss,system:{prepared:true,delay:4,minDelay:4,...data}});await spell.roll({promptModifier:false});assert.equal(next(),A);
}
assert(!isOffensiveSpell({damage:'0'},{haste:true,heal:1}));assert(isOffensiveSpell({damage:'0'},{extraAspects:{blind:1}}));
reset();const support=new GahlaItem();Object.assign(support,{type:'spell',name:'Support',parent:boss,system:{prepared:true,damage:'0',delay:4,minDelay:4,builderState:JSON.stringify({haste:true})}});await support.roll({promptModifier:false});assert(!boss.system.combat.justActed);
reset();const reaction=new GahlaItem();Object.assign(reaction,{type:'spell',name:'Reaction',parent:boss,system:{prepared:true,damage:'1k10',aspects:['Reakcja'],delay:4,minDelay:4}});await reaction.roll({promptModifier:false,asReaction:true});assert(!boss.system.combat.justActed);assert.equal(boss.system.combat.reservedSZ,4);
reset();await boss.trackerAction(3,'n',{bossPauseEligible:true});assert.equal(next(),A);
// Tracker Undo restores both pool and pause/acknowledgement metadata.
const panel=new GahlaInitiativeTracker();panel.element={querySelector:selector=>selector.startsWith('#')?{value:'2'}:selector.includes(':checked')?{value:'n'}:{checked:false}};
await GahlaInitiativeTracker.DEFAULT_OPTIONS.actions.act.call(panel,null,{dataset:{actor:A.uuid}});assert.equal(next(),boss);
await GahlaInitiativeTracker.DEFAULT_OPTIONS.actions.undo.call(panel);assert.equal(next(),A);assert.equal(A.system.combat.currentSegments,8);assert.equal(combat.turn,1);
reset();await hit();await A.trackerAction(10,'l');assert(bossPauseActive(combat.combatants[0],combat.combatants),'Starting a long action is not its completion');assert.equal(next(),B);
await A.update({'system.combat.longDebt':0,'system.combat.longReady':true});await A.resolveLongAction();assert.equal(next(),boss);
reset();await hit();await A.trackerAction(0,'c');assert(bossPauseActive(combat.combatants[0],combat.combatants),'Transfer is not a completed main action');assert.equal(next(),B);
reset();await boss.trackerAction(25,'l',{bossPauseEligible:true});assert(!boss.system.combat.justActed);await boss.update({'system.combat.longDebt':0,'system.combat.longReady':true});await boss.resolveLongAction();assert(boss.system.combat.justActed,'Explicit long offense starts pause only on completion');
Math.random=original;console.log('Boss main action pause, shared queue, dodge/parry/counter/reaction cast, GM/player ownership, repeated actions, legacy flags, support/maneuver/spell, Undo: PASS');

