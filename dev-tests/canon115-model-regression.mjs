import assert from 'node:assert/strict';
import {actor,talent,install,NS} from './helpers/automation-fixtures.mjs';
install();
class Field{constructor(options={}){this.options=options;}}
class SchemaField{constructor(fields){this.fields=fields;}}
class ArrayField extends Field{constructor(field,options){super(options);}}
foundry.data={fields:{NumberField:Field,StringField:Field,BooleanField:Field,SchemaField,ArrayField}};foundry.abstract={TypeDataModel:class{prepareDerivedData(){}}};
const {GahlaActorData}=await import('../module/data-models.mjs');
function defaults(schema){return Object.fromEntries(Object.entries(schema).map(([k,f])=>[k,f.fields?defaults(f.fields):structuredClone(f.options.initial)]));}
function model(items=[],flags={}){const a=actor(items),m=new GahlaActorData();Object.assign(m,defaults(GahlaActorData.defineSchema()));m.parent=a;a.system=m;a.flags=flags;m.level=3;m.archetype='polmag';m.lifePath='Znawca Run';m.base.race.zyw=10;m.base.race.sf=40;m.base.race.zr=40;m.base.race.um=40;m.base.race.wia=40;m.base.race.per=40;m.base.race.sz=5;m.base.race.er=40;m.base.race.og=40;m.prepareDerivedData();return m;}
const baseline=model();assert.equal(baseline.stats.zyw,12);
const runes=[{name:'Runa Szybkości',type:'rune',system:{bodyRune:true,bodyRuneCost:2,equipped:true,runes:[]}},talent('Mistrz Run',3)];const m=model(runes);assert.equal(m.stats.zyw,10);assert.equal(m.combat.wounds.max,10);assert.equal(m.derived.woundTwo,20);assert.equal(m.derived.woundThree,30);assert.equal(m.derived.speedBase,baseline.derived.speedBase+1);
for(const key of ['physicalResistance','mentalResistance','magicalResistance','spiritualResistance'])assert.equal(m.derived[key],baseline.derived[key]+10,key);
m.prepareDerivedData();assert.equal(m.stats.zyw,10);assert.equal(m.derived.woundTwo,20,'Repeated derived data does not reapply costs');
const injury=model([],{[NS]:{injuries:[{active:true,modifiers:[{target:'zyw',op:'add',value:-2}],conditions:{fatigued:2}}]}});assert.equal(injury.stats.zyw,10);assert.equal(injury.derived.woundTwo,20);assert.equal(injury.derived.speedBase,baseline.derived.speedBase-2);
const marksman=model([talent('Precyzyjny Strzał')]);assert.equal(marksman.derived.flatRanged,4);
for(const [name,key]of [['Odporny Fizycznie','physicalResistance'],['Odporny Psychicznie','mentalResistance'],['Odporny Magicznie','magicalResistance'],['Odporny Duchowo','spiritualResistance']])for(const level of [1,2,3,4]){const resistant=model([talent(name,level)]);assert.equal(resistant.derived[key],baseline.derived[key]+5*level);resistant.prepareDerivedData();assert.equal(resistant.derived[key],baseline.derived[key]+5*level,'No stacking after recalculation');}
assert.equal(model([talent('Serce Burzy')]).derived.physicalResistance,baseline.derived.physicalResistance+10);
console.log('Derived model: body rune vitality/thresholds/all four resists/rune effects, no double application, injury vitality/fatigue, Precise Shot: PASS');
