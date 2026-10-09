import assert from 'node:assert/strict';
import {install,actor,talent,NS} from './helpers/automation-fixtures.mjs';
import {activateTalent,expireRound} from '../module/automation-runtime.mjs';
import {resourceState} from '../module/effects-engine.mjs';
import {infusion119,resolveInfusion119} from '../module/talent-infusion119.mjs';
install();const weapon={id:'sword',name:'Miecz',type:'weapon',system:{equipped:true}},other={id:'other',system:{}};
for(const tier of [1,2,3,4]){game.combat.round=1;const t=talent('Gniew Gidy',tier),a=actor([t,weapon]);foundry.applications.api.DialogV2.input=async()=>({weapon:'sword'});await activateTalent(a,t.id);assert.equal(infusion119(a,weapon).dice,[0,1,2,2][tier-1]);assert.equal(infusion119(a,other),null);assert.equal(resourceState(a,t).remaining,tier===4?1:0);game.combat.round=tier===1?3:5;await expireRound(a,game.combat);assert.equal(infusion119(a,weapon),null);if(tier===4){await activateTalent(a,t.id);assert.equal(resourceState(a,t).remaining,0);}}
const d=actor();game.actors=[d];let rolls=0;d.rollTest=async stat=>{rolls++;assert.equal(stat,'magicalResistance');return {success:false};};const card={id:'hit',flags:{[NS]:{attack:{success:true,bonus:true,defender:d.uuid,infusion:{name:'Gniew Gidy',tier:3}}}}};await resolveInfusion119(card);assert(d.system.conditions.includes('burning'));await assert.rejects(()=>resolveInfusion119(card));assert.equal(rolls,1);card.id='no-bonus';card.flags[NS].attack.bonus=false;await assert.rejects(()=>resolveInfusion119(card));assert.equal(rolls,1);
console.log('PASS Gniew Gidy activation: weapon binding, T1–T4 dice/duration/uses, expiry, authorized conditional resistance and no repeat.');
