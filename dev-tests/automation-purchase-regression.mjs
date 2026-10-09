import assert from 'node:assert/strict';
import {actor,install,applyPatch} from './helpers/automation-fixtures.mjs';
install();globalThis.Actor=class{};globalThis.Item=class{};
const {GahlaActor}=await import('../module/documents.mjs');
function buyer(){
  const a=actor();Object.setPrototypeOf(a,GahlaActor.prototype);a.system.xp=100;
  a.createEmbeddedDocuments=async(type,docs)=>docs.map((data,index)=>{const i={...structuredClone(data),id:'created'+a.items.length,toObject(){return {name:this.name,system:structuredClone(this.system)};},async update(patch){applyPatch(this,patch);},async delete(){a.items.splice(a.items.indexOf(this),1);}};a.items.push(i);return i;});
  return a;
}
const a=buyer();assert.equal(await a.buyTalent('Żywotny',1),true);assert.equal(a.system.xp,50);assert.equal(a.items.length,1);assert.equal(await a.buyTalent('Żywotny',1),false);assert.equal(a.system.xp,50);
const b=buyer();b.update=async patch=>{if('system.xp'in patch)throw Error('simulated persistence failure');applyPatch(b,patch);};assert.equal(await b.buyTalent('Żywotny',1),false);assert.equal(b.items.length,0,'new talent rolled back when XP persistence fails');assert.equal(b.system.xp,100);
const c=buyer();const results=await Promise.all([c.buyTalent('Żywotny',1),c.buyTalent('Żywotny',1)]);assert.equal(results.filter(Boolean).length,1);assert.equal(c.items.length,1);assert.equal(c.system.xp,50);
console.log('Gahla talent purchase / sequential levels / rollback regression: PASS');
