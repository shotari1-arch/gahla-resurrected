import assert from 'node:assert/strict';
import {actor,install,applyPatch,NS} from './helpers/automation-fixtures.mjs';
import {ALL_TALENTS} from '../module/content.mjs';
import {rankSteps,rankCost,rankData} from '../module/talent-ranks.mjs';
import {talentErrors,auditBuild} from '../module/automation-rules.mjs';
import {migrateItemData118,migrateLedger118} from '../module/migration118.mjs';
install();globalThis.Actor=class{};globalThis.Item=class{};const {GahlaActor}=await import('../module/documents.mjs');const {undoPurchase,ledgerView}=await import('../module/development-ledger.mjs');
const def=n=>ALL_TALENTS.find(t=>t.name===n);
for(const n of ['Wnikliwość','Mocne Kości','Kartograf','Sztuka Rysunku','Poliglota']){assert.deepEqual(rankSteps(def(n)).map(s=>[s.rank,s.requiredTier,s.costLevel]),[[1,1,1],[2,3,3]]);assert.equal(rankCost(def(n),2),150);}
assert.deepEqual(rankSteps(def('Odporność na Klimat')).map(s=>s.requiredTier),[1,2]);assert.equal(rankSteps(def('Odporny Fizycznie')).length,4);
const a=actor();Object.setPrototypeOf(a,GahlaActor.prototype);a.system.xp=1000;a.system.derived.tier=3;let seq=0;
a.createEmbeddedDocuments=async(_type,docs)=>docs.map(data=>{const item={...structuredClone(data),id:data._id??'i'+(++seq),toObject(){return {name:this.name,type:this.type,system:structuredClone(this.system),flags:structuredClone(this.flags??{})};},async update(p){applyPatch(this,p);},async delete(){a.items.splice(a.items.indexOf(this),1);}};a.items.push(item);return item;});
assert(await a.buyTalent('Wnikliwość',1));assert.equal(a.system.xp,950);a.system.derived.tier=2;assert(talentErrors(a,def('Wnikliwość'),2,{purchase:true}).length);a.system.derived.tier=3;assert(await a.buyTalent('Wnikliwość',2));assert.equal(a.system.xp,800);assert.equal(a.items[0].system.rank,2);assert.equal(a.items[0].system.level,3);assert.equal(a.items[0].system.effectTier,3);assert.equal(ledgerView(a).rows[0].costLevel,3);await undoPurchase(a,ledgerView(a).rows[0].id);assert.equal(a.system.xp,950);assert.equal(a.items[0].system.rank,1);assert(talentErrors(a,def('Wnikliwość'),3,{purchase:true}).length);
const prereq={name:'Custom',category:'general',requirements:'Wnikliwość T3',maxRank:1,costBase:50,description:'Test'};assert(talentErrors(a,prereq,1).some(s=>s.includes('Wymagany')));Object.assign(a.items[0].system,rankData(def('Wnikliwość'),2));assert(!talentErrors(a,prereq,1).some(s=>s.includes('Wymagany')));
const legacy={_id:'legacy',name:'Kartograf / Sztuka Rysunku / Poliglota',type:'talent',system:{learned:true,level:3,maxLevel:4,description:'old'},flags:{custom:1}};const split=migrateItemData118(legacy);assert.deepEqual(split.map(i=>i.name),['Kartograf','Sztuka Rysunku','Poliglota']);assert.equal(split[0]._id,'legacy');assert.equal(new Set(split.map(i=>i._id)).size,3);for(const i of split){assert.equal(i.system.rank,2);assert.equal(i.system.effectTier,3);assert.equal(i.flags.custom,1);assert.deepEqual(migrateItemData118(i),[i]);}
const ledger={opening:500,entries:[{id:'p1',kind:'purchase',delta:-50,undo:{items:[{id:'legacy',before:null,after:{...legacy,system:{...legacy.system,level:1}}}]}},{id:'p2',kind:'purchase',delta:-100,undo:{items:[{id:'legacy',before:{...legacy,system:{...legacy.system,level:1}},after:{...legacy,system:{...legacy.system,level:2}}}]}}]};const history=migrateLedger118(ledger);assert.equal(history.entries[1].delta,-100);assert(history.entries[1].emptyLegacyPurchase);assert.equal(history.entries[0].undo.items.length,3);assert.equal(history.entries[1].undo.items[0].after.system.effectTier,1);
a.flags[NS]={development:history};assert(auditBuild(a).some(e=>e.message.includes('pusty zakup')));
const monk=migrateItemData118({_id:'m',name:'Szkolenie Mnicha',type:'talent',system:{level:2,learned:true}})[0];assert.equal(monk.system.monkWeaponType,null);assert.equal(monk.system.level,2);
console.log('PASS 118 rank/Tier/cost separation, real purchase/refund/prerequisite, split stable IDs, ledger migration/empty historical purchase, monk migration.');

for(const name of ['Mistrz Run','Sokole Oko']){const item=migrateItemData118({_id:'old',name,type:'talent',system:{level:1,learned:true}})[0];assert.equal(item.system.level,1);assert.equal(item.system.effectTier,1);assert(item.flags[NS].legacyEffectPending118);}
for(const name of ['Kartograf','Sztuka Rysunku','Poliglota'])assert.equal(def(name).maxRank,2);
assert.match(def('Kartograf').description,/ukryte oznaczenia/);assert.match(def('Sztuka Rysunku').description,/fałszerstwa dokumentów/);assert.match(def('Poliglota').description,/użytkownikami tego języka/);
