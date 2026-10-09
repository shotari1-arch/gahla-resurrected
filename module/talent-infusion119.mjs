import {NS} from './effects-engine.mjs';
import {ELEMENTS} from './content.mjs';
import {serial,requireOwner} from './automation-runtime.mjs';
export async function resolveFormBleeding119(message){
 const attack=message?.flags?.[NS]?.attack;
 if(!attack?.formBleeding119||!attack.success||!attack.bonus||attack.stopped)throw Error('Brak legalnego Krwawienia Zmiennokształtnego T3.');
 const target=await fromUuid(attack.defender);requireOwner(target);
 return serial('form119:'+target.uuid,async()=>{
  if(target.flags?.[NS]?.formBleeding119?.[message.id])throw Error('Test tej zdolności został już rozstrzygnięty.');
  const result=await target.rollTest('physicalResistance',{label:'Zmiennokształtny T3 — Odporność na Krwawienie'});if(!result)return null;
  await target.update({['flags.'+NS+'.formBleeding119.'+message.id]:true});
  if(!result.success)await target.toggleCondition('bleeding',true);return result;
 });
}
export function infusion119(actor,weapon){if(weapon?.system.isRanged||weapon?.system.reload)return null;const e=(actor.flags?.[NS]?.automation?.temporary??[]).find(e=>e.element&&e.weaponId===weapon?.id);return e?{name:e.name,element:e.element,tier:e.effectTier,dice:[0,1,2,2][Math.max(0,Number(e.effectTier)-1)]??0,weaponId:e.weaponId}:null;}
export async function resolveInfusion119(message){const attack=message.flags?.[NS]?.attack;if(!attack?.success||!attack.bonus||attack.stopped||attack.infusion?.name!=='Gniew Gidy'||attack.infusion.tier<3)throw Error('Brak legalnego Podpalenia Gniewu Gidy.');const target=await fromUuid(attack.defender);requireOwner(target);return serial('gida119:'+target.uuid,async()=>{if(target.flags?.[NS]?.gida119?.[message.id])throw Error('Test tej zdolności został już rozstrzygnięty.');const result=await target.rollTest(ELEMENTS.fire.resist+'Resistance',{label:'Gniew Gidy — Odporność na Podpalenie'});if(!result)return null;await target.update({['flags.'+NS+'.gida119.'+message.id]:true});if(!result.success)await target.toggleCondition('burning',true);return result;});}
