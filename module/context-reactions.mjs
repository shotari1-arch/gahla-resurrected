import {reactions119,dodgeCost119} from './talent-defense119.mjs';
import { NS, itemsOf, conditionLevel, modified } from "./effects-engine.mjs";
import { requireOwner, serial } from "./automation-runtime.mjs";
export function availableReactions(actor,{ranged=false,success=true,resolved=false}={}){
  if(!success||resolved||conditionLevel(actor,"asleep")||actor.system.combat.done||actor.system.combat.longReady)return [];
  const c=actor.system.combat,available=Math.max(0,Number(c.currentSegments)-Number(c.reservedSZ??0)),out=[];
  if(Number(c.reactionLeft)>0&&Number(c.longDebt??0)===0){
    const dodgeMax=[1,2,3,4].filter(n=>dodgeCost119(actor,n)<=available).at(-1);
    if(dodgeMax)out.push({id:"dodge",label:"Unik",max:dodgeMax});
    const weapon=actor.mainWeapon??itemsOf(actor).find(i=>i.type==="weapon"&&i.system.equipped);
    if(!ranged&&weapon&&available>=modified(actor,Math.max(1,Math.ceil(Number(weapon.system.delay||3)/2)),"reactionCost",{},1))out.push({id:"parry",label:"Parowanie"});
  }
  return [...out,...reactions119(actor,{ranged})];
}
export async function handleContextAction(button){
  const action=button.dataset.action;
  if(!action?.startsWith("gahla-auto-"))return false;
  const message=game.messages.get(button.closest("[data-message-id]")?.dataset.messageId);
  if(!message)throw Error("Nie znaleziono karty czatu.");
  await serial(`chat:${message.id}`,async()=>{
    let attack=message.flags?.[NS]?.attack;
    if(!attack)throw Error("Brak danych ataku.");
    const defender=await fromUuid(attack.defender),attacker=await fromUuid(attack.attacker),weapon=await fromUuid(attack.weapon);
    if(!defender||!attacker||!weapon)throw Error("Uczestnik lub broń nie jest już dostępna.");
    attack={...attack,...defender.flags?.[NS]?.reactions?.[message.id],...attacker.flags?.[NS]?.attacks?.[message.id]};
    if(action==="gahla-auto-dodge"||action==="gahla-auto-parry"){
      throw Error("Reakcje defensywne deklaruje się przed rzutem trafienia. Rozpocznij nowy atak.");
    }
    requireOwner(attacker);
    if(attack.stopped||attack.damageRolled||attack.shots>1)throw Error("Ten atak jest już rozstrzygnięty.");
    let allocation={};
    if(action==="gahla-auto-bonus"){
      const {promptAttackBonusAllocation}=await import("./sheets.mjs");allocation=await promptAttackBonusAllocation(attack.bonusPoints);if(!allocation)return;
    }
    const maneuver=attack.maneuver?await fromUuid(attack.maneuver):null;
    const result=await attacker.rollDamageAgainst(defender,weapon,{success:true,bonus:attack.bonus,criticalSuccess:attack.critical,location:attack.location,roll:attack.roll,maneuver,aiming:attack.aiming,sequenceEffect:attack.sequenceEffect,spirit:attack.spirit,infusion:attack.infusion},{maneuver,damageDice:allocation.damageDice??0,penetration:allocation.penetration??0,applyProne:allocation.prone??false});
    if(result){await attacker.update({[`flags.${NS}.attacks.${message.id}`]:{damageRolled:true}});button.disabled=true;}
  });return true;
}
export function filterContextButtons(message,element){
  const root=element?.querySelectorAll?element:element?.[0];if(!root)return;
  let attack=message.flags?.[NS]?.attack;if(!attack)return;
  void (async()=>{
    const defender=await fromUuid(attack.defender),attacker=await fromUuid(attack.attacker);
    attack={...attack,...defender?.flags?.[NS]?.reactions?.[message.id],...attacker?.flags?.[NS]?.attacks?.[message.id]};
    for(const button of root.querySelectorAll('[data-action^="gahla-auto-"]')){
      const kind=button.dataset.action.replace("gahla-auto-","");
      button.disabled=["parry","dodge"].includes(kind)?true:!(attacker?.isOwner||game.user.isGM)||Boolean(attack.stopped||attack.damageRolled);
    }
  })();
}

export async function handleDamageCard(button){
  const action=button.dataset.action;if(action==="gahla-break-armor")throw Error("Opcja pełnego zniszczenia pancerza została usunięta.");if(!["gahla-apply-damage","gahla-save-armor","gahla-break-armor"].includes(action))return false;
  const message=game.messages.get(button.closest("[data-message-id]")?.dataset.messageId),data=message?.flags?.[NS]?.damage;
  if(!data)return false;
  const actor=await fromUuid(data.target);requireOwner(actor);
  await serial(`damage:${actor.uuid}`,async()=>{
    if(actor.flags?.[NS]?.resolvedDamage?.[message.id])throw Error("Obrażenia z tej karty zostały już zastosowane.");
    let wounds=data.wounds,armor=null,patch=null,restore=null;
    if(action!=="gahla-apply-damage"){
      const candidates=actor.activeArmor.filter(i=>data.armorIds?.includes(i.id));
      armor=candidates[0];
      if(candidates.length>1){const fd=await foundry.applications.api.DialogV2.input({window:{title:'Uszkodź uczestniczący pancerz'},content:'<select name="id">'+candidates.map(i=>'<option value="'+i.id+'">'+foundry.utils.escapeHTML(i.name)+'</option>').join('')+'</select>',ok:{label:'−1 pancerza / −1 Rana'}});if(!fd)return;armor=candidates.find(i=>i.id===fd.id);}
      if(!armor||actor.usesHP)throw Error("Nie ma legalnego pancerza do poświęcenia na tej lokacji.");
      const path=armor.system.isShield?"system.armor":`system.locations.${data.location}`,old=armor.system.isShield?Number(armor.system.armor):Number(armor.system.locations[data.location]);
      if(old<=0)throw Error("Brak pancerza do uszkodzenia.");patch={[path]:Math.max(0,old-1)};restore={[path]:old};wounds=Math.max(0,wounds-1);
      await armor.update(patch);
    }
    try{await actor.applyDamage(data.amount,{...data.options,wounds,resolutionId:message.id});}
    catch(error){if(armor&&!actor.flags?.[NS]?.resolvedDamage?.[message.id])await armor.update(restore);throw error;}
    button.disabled=true;
  });return true;
}
