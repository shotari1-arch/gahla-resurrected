import assert from 'node:assert/strict';
import {reverseD100,rollD100,evaluateTest,pickHitLocation,woundCountFromDamage,lingeringWoundScore} from '../module/rules.mjs';
import {install,actor,NS} from './helpers/automation-fixtures.mjs';
install();
const {rollWithDeclarations}=await import('../module/automation-runtime.mjs');
for(const [raw,mirror]of [[100,100],[0,100],[4,40],[40,4],[10,1],[1,10]])assert.equal(reverseD100(raw),mirror);
for(const options of [{},{advantage:true},{disadvantage:true}]){
 let draws=0;const r=rollD100({...options,rng:()=>{draws++;return .995;}});
 assert.deepEqual([r.rawRoll,r.mirrorRoll,r.effectiveRoll,r.locationRoll],[100,100,100,100]);
 assert(evaluateTest(r.effectiveRoll,200).criticalFailure);assert.equal(draws,1);
}
for(const options of [{advantage:true},{disadvantage:true}])for(const double of [11,22,33,44,55,66,77,88,99]){
 const queue=[double,27];const r=rollD100({...options,rng:()=>{assert(queue.length);return (queue.shift()-.5)/100;}});assert.equal(r.rawRoll,27);assert.equal(queue.length,0);
}
for(const options of [{},{advantage:true,disadvantage:true}]){
 let draws=0;assert.equal(rollD100({...options,rng:()=>{draws++;return .545;}}).effectiveRoll,55);assert.equal(draws,1);
}
for(const [raw,options,effective,location]of [[27,{advantage:true},27,'body'],[72,{disadvantage:true},72,'rightArm'],[72,{advantage:true},27,'rightArm'],[27,{disadvantage:true},72,'body']]){
 let draws=0;const r=rollD100({...options,rng:()=>{draws++;return(raw-.5)/100;}});assert.equal(draws,1,'Do not discard a non-double first roll');assert.equal(r.effectiveRoll,effective);assert.equal(r.locationRoll,reverseD100(raw));assert.equal(pickHitLocation(r.locationRoll,true),location);
}
const a=actor();a.flags[NS]={automation:{pendingAdvantage:true}};
let r=await rollWithDeclarations(a,{rng:()=>.715});assert.equal(r.rawRoll,72);assert.equal(r.effectiveRoll,27);assert.equal(r.locationRoll,27);assert(!a.flags[NS].automation.pendingAdvantage);
a.flags[NS].automation.pendingRoll=100;r=await rollWithDeclarations(a,{advantage:true,rng:()=>{throw Error('Stored result must not roll');}});assert.equal(r.effectiveRoll,100);assert.equal(r.locationRoll,100);
for(const R of [0,7]){
 for(const [damage,wounds]of [[17,1],[18,2],[26,2],[27,3],[53,3],[54,5],[80,5],[81,6],[108,7]])assert.equal(woundCountFromDamage(damage+R,9,0,R),wounds);
 for(let damage=0;damage<=200;damage++)assert.notEqual(woundCountFromDamage(damage,9,0,R),4);
 assert.equal(woundCountFromDamage(R,9,0,R),0);assert.equal(woundCountFromDamage(54+R-1,9,0,R),3);
}
assert.equal(lingeringWoundScore({roll:40,woundsOverMax:3,successType:'normal'}),70);
assert.equal(lingeringWoundScore({roll:40,woundsOverMax:3,successType:'bonus'}),80);
assert.equal(lingeringWoundScore({roll:40,woundsOverMax:3,successType:'crit'}),90);
console.log('D100: 100/00, zeros, doubles, single draw, declarations, physical location; thresholds and LW: PASS');
