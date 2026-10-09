import fs from 'node:fs';import assert from 'node:assert/strict';
import {actor,install,NS} from './helpers/automation-fixtures.mjs';
import {resolveLingeringWound} from '../module/lingering-wounds.mjs';
import {recordInjury,applyInjury,tickInjuries,stabilizeInjuries,injuriesOf,injuryAction,injuryContext,movementFactor,disabledLocations} from '../module/injury-runtime.mjs';
import {modified,conditionLevel} from '../module/effects-engine.mjs';
install();const data=JSON.parse(fs.readFileSync(new URL('../data/lingering-wounds.json',import.meta.url),'utf8'));
async function add(a,score,profile='slashing',location='body'){const row=await resolveLingeringWound({score,profile,location,tables:data});const i=await recordInjury(a,row,{score,location});await applyInjury(a,i.id);return i.id;}
const a=actor();let id=await add(a,110);assert.equal(injuriesOf(a)[0].remaining,3);await applyInjury(a,id);assert.equal(injuriesOf(a).length,1);
await tickInjuries(a,{id:'c1',round:2});assert.equal(injuriesOf(a)[0].remaining,3,'Partial injury round is not a full round');await tickInjuries(a,{id:'c1',round:3});assert.equal(injuriesOf(a)[0].remaining,2);await tickInjuries(a,{id:'c1',round:3});assert.equal(injuriesOf(a)[0].remaining,2,'Repeated hook cannot tick twice');await tickInjuries(a,{id:'c1',round:4});assert.equal(injuriesOf(a)[0].remaining,1);await stabilizeInjuries(a);await tickInjuries(a,{id:'c1',round:50});assert.equal(injuriesOf(a)[0].remaining,1);assert(injuriesOf(a)[0].active);assert(!a.flags[NS].dead);
const b=actor();await add(b,130);await tickInjuries(b,{id:'c1',round:2});assert(!b.flags[NS].dead);await tickInjuries(b,{id:'c1',round:3});assert(b.flags[NS].dead);await injuryAction(b,injuriesOf(b)[0].id,'remove');assert(!b.flags[NS].dead);
const c=actor();await add(c,90);assert.equal(modified(c,12,'zyw'),10);id=await add(c,30,'slashing','leftArm');assert.equal(conditionLevel(c,'bleeding'),1);assert.equal(modified(c,0,'test',{location:'leftArm'}),-10);assert.equal(modified(c,0,'test',{location:'rightArm'}),0);await injuryAction(c,id,'remove');assert.equal(conditionLevel(c,'bleeding'),0);
await add(c,70,'blunt','leftLeg');assert.equal(movementFactor(c),0.5);await add(c,70,'slashing','rightArm');assert(disabledLocations(c).has('rightArm'));await assert.rejects(()=>injuryContext(c,{location:'rightArm',prompt:false}),/niesprawna/);await assert.rejects(()=>injuryContext(c,{attack:true,weapon:{system:{hands:2}},prompt:false}),/obu sprawnych/);
const d=actor();await add(d,141,'slashing','head');assert(d.flags[NS].dead);
const edited=actor(),editId=await add(edited,30,'slashing','leftArm');
foundry.applications.api.DialogV2.input=async()=>({effect:'Po opatrzeniu: kara zmniejszona przez MG',active:true,stabilized:true,disabledLocation:false,halfMovement:false,death:false,remaining:0,state_bleeding:0,state_fatigued:0,state_stunned:0,mod0:-5});
await injuryAction(edited,editId,'edit');assert.equal(conditionLevel(edited,'bleeding'),0);assert.equal(modified(edited,0,'test',{location:'leftArm'}),-5);assert.match(injuriesOf(edited)[0].effect,/Po opatrzeniu/);
console.log('LW runtime: persistent entries, apply idempotency, 3/1 FULL rounds, stabilization, terminal death, removal, conditions, local penalties and disabled limbs: PASS');
