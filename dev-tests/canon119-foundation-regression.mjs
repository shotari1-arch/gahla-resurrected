import assert from 'node:assert/strict';
import {actor,talent,install,applyPatch,NS,hooks} from './helpers/automation-fixtures.mjs';
import {ALL_TALENTS} from '../module/content.mjs';
import {rankSteps} from '../module/talent-ranks.mjs';
import {talentErrors} from '../module/automation-rules.mjs';
import {artBonus,climbingCost119} from '../module/talent-values119.mjs';
import {chooseArt,registerArt119} from '../module/talent-choices119.mjs';
install();registerArt119();
const def=n=>ALL_TALENTS.find(t=>t.name===n);
for(const n of ['Walka Wręcz','Zwierzęcy Szał','Celny Strzał'])assert.equal(def(n).maxRank,1);
for(const n of ['Sanktuarium Eruela','Nieustępliwe Uderzenie','Uderzenie Tarczą','Ruch Cienia','Osłona Koncentracji'])assert.deepEqual(rankSteps(def(n)).map(s=>[s.effectTier,s.requiredTier,s.costLevel]),[[2,2,2],[3,3,3],[4,4,4]]);
const titan=def('Chwyt Tytana'),a=actor();a.system.xp=1000;
for(const level of [1,2,3,4]){a.system.derived.tier=level;a.system.stats.sf=[40,40,50,60][level-1];assert.deepEqual(talentErrors(a,titan,level),[]);a.system.stats.sf--;assert(talentErrors(a,titan,level).some(e=>e.startsWith('Wymagane SF')));}
const c=actor([talent('Wspinacz',3)]);assert.equal(climbingCost119(c,4),2);assert.equal(climbingCost119(c,1),1);assert.equal(climbingCost119(c,9,{requiresSegments:false}),0);c.items[0].system.level=1;assert.equal(climbingCost119(c,4),4);
const art=talent('Uzdolnienie Artystyczne',3);art.update=async p=>applyPatch(art,p);const artist=actor([art]);artist.flags[NS]={development:{entries:[{undo:{items:[{id:art.id,before:null,after:{flags:{},system:{}}}]}}]}};
assert.deepEqual(artBonus(artist),{og:0,zr:0});game.user.isGM=false;await chooseArt(artist,'singing');assert.deepEqual(artBonus(artist),{og:5,zr:0});assert.equal(artist.flags[NS].development.entries[0].undo.items[0].after.flags[NS].artChoice,'singing');await assert.rejects(()=>chooseArt(artist,'dancing'));game.user.isGM=true;await chooseArt(artist,'dancing');assert.deepEqual(artBonus(artist),{og:0,zr:5});artist.isOwner=false;game.user.isGM=false;await assert.rejects(()=>chooseArt(artist,'singing'));assert.equal(hooks.get('preUpdateItem').at(-1)(art,{['flags.'+NS+'.artChoice']:null},{}),false);
class Field{constructor(options={}){this.options=options;}}class SchemaField{constructor(fields){this.fields=fields;}}class ArrayField extends Field{constructor(f,o){super(o);}}
foundry.data={fields:{NumberField:Field,StringField:Field,BooleanField:Field,SchemaField,ArrayField}};foundry.abstract={TypeDataModel:class{prepareDerivedData(){}}};
const {GahlaActorData}=await import('../module/data-models.mjs');
const defaults=schema=>Object.fromEntries(Object.entries(schema).map(([k,f])=>[k,f.fields?defaults(f.fields):structuredClone(f.options.initial)]));
const model=new GahlaActorData();Object.assign(model,defaults(GahlaActorData.defineSchema()));model.parent=artist;artist.system=model;model.archetype='wojownik';model.base.race={zyw:15,sf:40,zr:40,per:40,er:40,um:40,og:40,wia:40,sz:5};const original=JSON.stringify(model.base);
for(const [choice,og,zr]of [['singing',45,40],['dancing',40,45]]){art.flags[NS].artChoice=choice;model.prepareDerivedData();assert.equal(model.stats.og,og);assert.equal(model.stats.zr,zr);model.prepareDerivedData();assert.equal(model.stats.og,og);assert.equal(model.stats.zr,zr);assert.equal(JSON.stringify(model.base),original);}
console.log('PASS initial 119 explicit canon ranks, Titan Tier/SF, climbing minimum helper, permanent art choice/permissions/history, real derived OG/ZR without accumulation.');
