import assert from 'node:assert/strict';
import {actor,talent,install,NS,hooks,applyPatch,messages} from './helpers/automation-fixtures.mjs';
import {activeRule,modified,conditionLevel,resourceState} from '../module/effects-engine.mjs';
import {activateTalent,expireRound} from '../module/automation-runtime.mjs';
import {effectiveThresholds} from '../module/canonical-rules.mjs';
import {fullForm119,partialForm119,formResistance119} from '../module/form-canon119.mjs';
import {migrate119,migrateItemData119,migrateLedger119} from '../module/migration119.mjs';
import {register118} from '../module/migration118.mjs';
import {ALL_TALENTS} from '../module/content.mjs';
import {auditBuild,talentErrors} from '../module/automation-rules.mjs';
import {archetypeTalentTierForActor,talentUsable119} from '../module/talent-eligibility.mjs';
import {resolveFormBleeding119} from '../module/talent-infusion119.mjs';
install();globalThis.Actor=class{};globalThis.Item=class{};
const {GahlaActor}=await import('../module/documents.mjs');
function make(items=[]){const a=new GahlaActor(),base=actor(items);delete base.usesHP;Object.assign(a,base);a.system.species='therian';a.system.archetype='bestia';a.system.fate={personal:0};a.system.stats={sf:40,zr:40,per:50,bgl:90,zyw:15};a.system.derived={...a.system.derived,physicalResistance:43,thresholdBonus:7,defense:0,armor:{body:0}};a.system.options={};a.system.combat.aura.value=0;return a;}
const hybrid=talent('Bestialska Hybryda',4);hybrid.flags={[NS]:{activity:{id:'hybrid4',minLevel:4,action:'temporary'}}};
const h=make([hybrid]);h.system.phase='beast';assert.equal(activeRule(hybrid),null);await assert.rejects(()=>activateTalent(h,hybrid.id),/aktywacji/);
const hybridDef=ALL_TALENTS.find(t=>t.name===hybrid.name);assert.equal(hybridDef.maxRank,1);assert.equal(hybridDef.rankNeedsDecision,false);assert(talentErrors(h,hybridDef,2,{purchase:true}).length);
const shape=talent('Zmiennokształtny',4),a=make([shape,talent('Naturalna Obrona',4),talent('Mocna Skóra'),talent('Wytrzymały')]);
const rule=activeRule(shape);assert.equal(rule.max,1);assert.equal(rule.reset,'combat');assert.equal(rule.durationRounds,2);assert.equal(rule.requiresFullForm,true);
await assert.rejects(()=>activateTalent(a,shape.id),/pełna forma/);assert.notEqual(a.system.phase,'beast');
a.system.phase='beast';a.system.conditions=['fatigued','bleeding'];const originalConditions=[...a.system.conditions],before=effectiveThresholds(a),segments=a.system.combat.currentSegments;
assert.equal(before.resistanceBonus,4);assert.equal(modified(a,40,'test'),30);
await activateTalent(a,shape.id);const during=effectiveThresholds(a);
assert.equal(during.resistanceBonus,8);assert.equal(during.one,before.one+4);assert.equal(during.two,before.two+4);
for(const key of ['bonus','baseI','baseII'])assert.equal(during[key],before[key],key);
assert.equal(a.system.stats.zyw,15);assert.equal(a.system.derived.physicalResistance,43);assert.equal(a.system.combat.currentSegments,segments,'Free action');
assert.deepEqual(a.system.conditions,originalConditions);assert.equal(conditionLevel(a,'fatigued'),0);assert.equal(conditionLevel(a,'bleeding'),0);assert.equal(modified(a,40,'test'),40);
assert.equal(resourceState(a,shape).remaining,0);await assert.rejects(()=>activateTalent(a,shape.id));
await expireRound(a,{...game.combat,round:2});assert.equal(effectiveThresholds(a).resistanceBonus,8);
await expireRound(a,{...game.combat,round:3});assert.equal(effectiveThresholds(a).resistanceBonus,4);assert.equal(modified(a,40,'test'),30);assert.equal(conditionLevel(a,'bleeding'),1);assert.deepEqual(a.system.conditions,originalConditions);
game.combat.id='c2';await activateTalent(a,shape.id);register118();const change={'system.phase':'human'};for(const hook of hooks.get('preUpdateActor'))hook(a,change);await a.update(change);assert.equal(a.flags[NS].automation.temporary.length,0);a.system.phase='beast';assert.equal(effectiveThresholds(a).resistanceBonus,4,'Reentering does not restore expired T4');assert.equal(conditionLevel(a,'bleeding'),1);
// T1–T3 retain distinct effects. Only T4 enables the temporary activation.
const w={id:'w',uuid:'Item.w',type:'weapon',name:'Pięść',system:{profileId:'unarmed',delay:3,traits:[],damage:'1k10',damageType:'physical',penetration:0}};
const target=make();game.actors=[target];let resistance='';target.rollTest=async stat=>{resistance=stat;return {success:false};};
const random=Math.random;Math.random=()=>.265;
for(const tier of [1,2,3]){shape.system.level=tier;assert.equal(activeRule(shape),null);assert(fullForm119(a));assert.equal(modified(a,0,'attackDice',{unarmed:true,natural:true}),1);assert.equal(modified(a,0,'attackDice',{unarmed:false,natural:false}),0);assert.equal(formResistance119(a,'physicalResistance','prone'),tier>=2);assert.equal(formResistance119(a,'physicalResistance','pushed'),tier>=2);assert.equal(formResistance119(a,'physicalResistance','bleeding'),false);a.system.conditions=[];await a.rollAttack(target,w,{promptModifier:false,declaredDefense:{kind:'none'}});const msg=messages.at(-1);msg.id='attack'+tier;assert.equal(msg.flags[NS].attack.formBleeding119,tier>=3);assert.equal(msg.content.includes('data-action="gahla-form-bleeding119"'),tier>=3);if(tier===3){await resolveFormBleeding119(msg);assert.equal(resistance,'physicalResistance');assert(target.system.conditions.includes('bleeding'));await assert.rejects(()=>resolveFormBleeding119(msg),/rozstrzygnięty/);}}
shape.system.level=2;a.system.conditions=[];Math.random=()=>.715;const resist=await a.rollTest('physicalResistance',{againstCondition:'prone',promptModifier:false});assert.equal(resist.effectiveRoll,27);const ordinary=await a.rollTest('physicalResistance',{promptModifier:false});assert.equal(ordinary.effectiveRoll,72);
Math.random=random;
assert(partialForm119(h));assert(!fullForm119(h));assert.equal(modified(h,0,'attackDice',{unarmed:true}),0);
assert(talentErrors(h,ALL_TALENTS.find(t=>t.name==='Zmiennokształtny'),1).some(e=>e.includes('wykluczają')));
const warrior=ALL_TALENTS.find(t=>t.name==='Szkolenie Oręża');h.items.push(talent('Szkolenie Oręża',2));for(const tier of [1,2,3,4]){h.system.derived.tier=tier;assert.equal(archetypeTalentTierForActor(warrior,h),Math.ceil(tier/2));}h.system.phase='human';assert(!talentUsable119(h,h.items[1]));assert(!h.effectiveTalents.some(i=>i.name==='Szkolenie Oręża'));h.system.phase='beast';assert(h.effectiveTalents.some(i=>i.name==='Szkolenie Oręża'));
// Legacy XP, IDs, undo snapshots and resource history survive correction, even if talent119 already ran.
const raw={_id:'oldHybrid',name:'Bestialska Hybryda',type:'talent',system:{rank:2,level:4,effectTier:4,costLevel:4,learned:true,costXP:400},flags:{[NS]:{talent119:true,custom:'keep'}}};
const [fixed]=migrateItemData119(raw);assert.equal(fixed._id,raw._id);assert.equal(fixed.system.rank,1);assert.equal(fixed.system.level,1);assert.equal(fixed.system.costXP,400);assert.equal(fixed.flags[NS].legacyHybridRank119.system.rank,2);assert.equal(fixed.flags[NS].custom,'keep');assert.deepEqual(migrateItemData119(fixed),[fixed]);
const ledger={canon119:true,entries:[{id:'purchase',label:'Hybryda R2',delta:-400,undo:{before:{'system.xp':500},after:{'system.xp':100},items:[{id:raw._id,before:null,after:raw}]}}]},updated=migrateLedger119(ledger);assert.equal(updated.entries[0].delta,-400);assert.deepEqual(updated.entries[0].undo.before,ledger.entries[0].undo.before);assert.deepEqual(updated.entries[0].undo.after,ledger.entries[0].undo.after);assert.deepEqual(migrateLedger119(updated),updated);
const legacy=make([]),i=structuredClone(raw);i.id=i._id;i.update=async patch=>applyPatch(i,patch);legacy.items=[i];legacy.flags[NS]={development:ledger,automation:{resources:{oldHybrid:{remaining:0,combatId:'c2'}},temporary:[{id:'oldHybrid',name:'Bestialska Hybryda',effects:rule.effects}]}};game.actors=[legacy];game.items=[];game.packs=[];const xp=legacy.system.xp;await migrate119();assert.equal(legacy.system.xp,xp);assert.equal(legacy.flags[NS].automation.temporary.length,0);assert.equal(legacy.flags[NS].automation.resources.oldHybrid.remaining,0);assert(auditBuild(legacy).some(e=>e.severity==='review'&&e.message.includes('Historyczna ranga')));assert.equal(legacy.items.length,1,'No free Shapeshifter');const snapshot=JSON.stringify(legacy);await migrate119();assert.equal(JSON.stringify(legacy),snapshot);
class Field{constructor(options={}){this.options=options;}}class SchemaField{constructor(fields){this.fields=fields;}}class ArrayField extends Field{constructor(field,options){super(options);}}
foundry.data={fields:{NumberField:Field,StringField:Field,BooleanField:Field,SchemaField,ArrayField}};foundry.abstract={TypeDataModel:class{prepareDerivedData(){}}};
const {GahlaActorData}=await import('../module/data-models.mjs');
function defaults(schema){return Object.fromEntries(Object.entries(schema).map(([k,f])=>[k,f.fields?defaults(f.fields):structuredClone(f.options.initial)]));}
function model(name){const armor={type:'armor',name:'Armor',system:{equipped:true,armor:5,locations:{body:5},defenseMod:17,runes:['Runa Statystyk'],runeStat:'sf'}},owner=actor([talent(name),armor]),m=new GahlaActorData();Object.assign(m,defaults(GahlaActorData.defineSchema()));owner.system=m;m.parent=owner;m.species='therian';m.archetype='bestia';m.phase='beast';m.level=1;for(const k of ['sf','zr','per','um','er','wia','og'])m.base.race[k]=40;m.base.race.zyw=10;m.prepareDerivedData();return {m,owner,armor};}
const full=model('Zmiennokształtny'),partial=model('Bestialska Hybryda');assert.equal(full.m.stats.sf,60,'Full +50%, armor rune disabled');assert.equal(partial.m.stats.sf,55,'Partial +25%, equipped armor rune +5');assert.equal(full.m.derived.armor.body,0);assert.equal(partial.m.derived.armor.body,5);full.m.prepareDerivedData();assert.equal(full.m.stats.sf,60,'No repeated multiplication');
assert(ALL_TALENTS.find(t=>t.name==='Zmiennokształtny').description.includes('Pazury i Kły, Blokada Aury, Naturalna Obrona, Zwierzęcy Szał'));
console.log('PASS P0 form canon: 8 required cases; early form end, free action, rank/exclusion/bridge, pre-existing migration, XP/undo/resource preservation, T3 resistance and replay guard; full/partial derived stats and armor/runes.');
