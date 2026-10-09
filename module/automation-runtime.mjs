import {talentUsable119} from './talent-eligibility.mjs';
import {fullForm119,formEffectActive119} from './form-canon119.mjs';
import { ledgerPatch, getPath } from './development-ledger.mjs';
import { NS, itemsOf, activeRule, resourceState, ruleValue, levelOf, conditionLevel } from "./effects-engine.mjs";
import { growthUpdate, talentErrors } from "./automation-rules.mjs";
import { ALL_TALENTS, CONDITIONS, rollD100, d100Result } from "./rules.mjs";

const queues=new Map();
export async function serial(key,fn){
  const previous=queues.get(key)??Promise.resolve();
  const next=previous.catch(()=>{}).then(fn);queues.set(key,next);
  try{return await next;}finally{if(queues.get(key)===next)queues.delete(key);}
}
export function requireOwner(actor){if(!actor||!(game.user?.isGM||actor.isOwner))throw Error("Brak uprawnień do tej postaci.");}
export function requireGM(){if(!game.user?.isGM)throw Error("To narzędzie jest dostępne tylko dla MG.");}
export function authority(){const gms=Array.from(game.users??[]).filter(u=>u.active&&u.isGM).sort((a,b)=>String(a.id).localeCompare(String(b.id)));return game.user?.isGM&&(!gms.length||gms[0].id===game.user.id);}
export function automation(actor){return structuredClone(actor.flags?.[NS]?.automation??{schema:1,resources:{},temporary:[]});}
export async function buyGrowth(actor,selected){requireOwner(actor);return serial(actor.uuid,()=>{const update=growthUpdate(actor,selected),before={},after={};for(const [key,value]of Object.entries(update))if(key!=='system.xp'){before[key]=getPath(actor,key);after[key]=value;}return actor.update({...update,...ledgerPatch(actor,'purchase','Przyrost: '+selected.map(k=>k.toUpperCase()).join(', '),-50,{undo:{before,after,items:[]}})});});}
export async function purchaseTalent(actor,name,level,teacher=false){
  requireOwner(actor);return serial(actor.uuid,async()=>{
    const def=ALL_TALENTS.find(t=>t.name===name);if(!def)throw Error("Nieznany talent.");
    const errors=talentErrors(actor,def,Number(level),{purchase:true,teacher});if(errors.length)throw Error(errors.join("; "));
    return actor._buyTalentUnchecked(name,Number(level),{teacher});
  });
}
export async function activateTalent(actor,itemId,{mode="use",condition="",index=0,targetUuid=""}={}){
  requireOwner(actor);
  return serial(actor.uuid,async()=>{
    const item=itemsOf(actor).find(i=>i.id===itemId),rule=activeRule(item);if(!rule)throw Error("Talent nie ma zdefiniowanej automatycznej aktywacji.");
    if(!talentUsable119(actor,item))throw Error("Ten talent Wojownika działa wyłącznie w formie Hybrydy.");
    if(rule.gmOnly)requireGM();
    if(rule.requiresFullForm&&!fullForm119(actor))throw Error("Wymagana aktywna pełna forma Zmiennokształtnego. Aktywacja nie rozpoczyna przemiany.");
    if(rule.requiresPhase&&actor.system.phase!==rule.requiresPhase)throw Error("Wymagana aktywna forma. Ta aktywacja nie rozpoczyna przemiany.");
    const resourceKey=item.flags?.[NS]?.resourcePool118??itemId;
    const a=automation(actor),state=resourceState(actor,item);a.resources??={};a.temporary??=[];
    if(['climb119','concentration119'].includes(rule.action)){const actions=await import('./talent-actions119.mjs');return rule.action==='climb119'?actions.climb119(actor):actions.concentrationAction119(actor);}
    if(rule.action==='sanctuary119'){const {createSanctuary119}=await import('./talent-zones119.mjs');return createSanctuary119(actor,levelOf(item));}
    if(rule.action==='resistHit'){
      if(!game.combat?.started)throw Error('Test raz na rundę wymaga rozpoczętego starcia.');
      if(state.remaining<=0)throw Error('Naturalna Obrona została już użyta w tej rundzie.');
      const previous=a.resources[resourceKey]??{};
      a.resources[resourceKey]={remaining:0,combatId:game.combat.id,round:Number(game.combat.round)};await actor.setFlag(NS,'automation',a);
        let result;
        try{result=await actor.rollTest('physicalResistance',{advantage:true,label:'Naturalna Obrona — stan po otrzymanym trafieniu'});return result;}
        finally{if(!result){const current=automation(actor);current.resources[resourceKey]=previous;await actor.setFlag(NS,'automation',current);}}
    }
    let content=`${item.name}: aktywacja`,target=actor;
    if(targetUuid&&targetUuid!==actor.uuid){target=await fromUuid(targetUuid);requireOwner(target);}
    if(rule.action==="reroll"){
      const last=actor.flags?.[NS]?.lastRoll;
      if(!last||!rule.contexts.includes(last.kind))throw Error("Brak ostatniego rzutu właściwego typu do przerzucenia.");
      if(!game.combat?.started||last.combatId!==game.combat.id)throw Error("Można przerzucić ostatni rzut z tej walki.");
      if(state.remaining<=0)throw Error("Brak dostępnych przerzutów.");
      if(rule.attackMode){const weapon=await fromUuid(last.weapon);const ranged=Boolean(weapon?.system?.isRanged||weapon?.system?.reload);if(!weapon||(rule.attackMode==="ranged")!==ranged)throw Error("Niewłaściwy rodzaj ataku dla tego przerzutu.");}
      if(last.messageId&&actor.flags?.[NS]?.attacks?.[last.messageId]?.damageRolled)throw Error("Obrażenia zostały już rozliczone.");
      a.resources[resourceKey]={remaining:state.remaining-1,combatId:game.combat.id};await actor.setFlag(NS,"automation",a);
      try{
        let result;
        if(last.kind==="attack"){
          const target=await fromUuid(last.target),weapon=await fromUuid(last.weapon),maneuver=last.maneuver?await fromUuid(last.maneuver):null;
          if(!target||!weapon)throw Error("Cel lub broń nie jest już dostępna.");
          result=await actor.rollAttack(target,weapon,{...last.options,free:true,promptModifier:false,maneuver});
        }else{
          const spell=await fromUuid(last.item);if(!spell||spell.parent?.uuid!==actor.uuid)throw Error("Zaklęcie nie jest dostępne.");
          result=await spell.roll({...last.options,reroll:true,promptModifier:false});
        }
        if(!result)throw Error("Przerzut nie został wykonany.");
        if(last.messageId)await actor.update({[`flags.${NS}.attacks.${last.messageId}`]:{damageRolled:true,replaced:true}});
        return result;
      }catch(error){const current=automation(actor);current.resources[resourceKey]={remaining:state.remaining,combatId:game.combat.id};await actor.setFlag(NS,"automation",current);throw error;}
    }
    if(mode==="replenish"){
      if(rule.replenish!=="blood"&&rule.reset!=="manual")throw Error("Ta pula odnawia się automatycznie.");
      if(rule.reset==="manual")requireGM();
      a.resources[resourceKey]={remaining:state.max,...(rule.action==="foretell"?{results:Array.from({length:state.max},()=>Math.floor(Math.random()*100)+1)}:{})};
      content=rule.replenish==="blood"?`${item.name}: wypicie krwi — pula ${state.max}`:`${item.name}: MG przyznał pulę wyników`;
    }else{
      if(state.remaining!==null&&state.remaining<=0)throw Error("Brak dostępnych użyć.");
      if(rule.reset==="combat"&&!game.combat?.started)throw Error("Talent raz na walkę wymaga rozpoczętego starcia.");
      const update={};
      if(rule.action==="firstAid"){
        const treated=Array.from(a.resources[resourceKey]?.treated??[]);
        if(treated.includes(target.uuid))throw Error("Ta postać udzieliła już temu celowi Pierwszej Pomocy w tej sesji.");
        if(target.usesHP)throw Error("Pierwsza Pomoc leczy Rany; przelicznik HP nie jest określony.");
        if(condition&&!conditionLevel(target,condition))throw Error("Cel nie ma wybranego stanu.");
        if(Number(target.system.combat.wounds.value)<=0&&!condition)throw Error("Cel nie ma Ran ani wybranego stanu.");
        if(condition)await target.toggleCondition(condition,false);
        const {stabilizeInjuries}=await import("./injury-runtime.mjs");await stabilizeInjuries(target);
        const healing={"system.combat.wounds.value":Math.max(0,Number(target.system.combat.wounds.value)-Number(actor.system.derived.tier))};
        if(target===actor)Object.assign(update,healing);else await target.update(healing);
        a.resources[resourceKey]={treated:[...treated,target.uuid]};content+=` — cel: ${target.name}`;
      }else if(rule.action==="healOrCondition"){
        if(condition){if(!CONDITIONS[condition]||!conditionLevel(actor,condition))throw Error("Postać nie ma tego stanu.");await actor.toggleCondition(condition,false);}
        else {if(actor.usesHP)throw Error("Talent leczy Rany; przelicznik HP nie jest określony.");const value=Number(actor.system.combat.wounds.value);if(value<=0)throw Error("Brak Ran do leczenia.");update["system.combat.wounds.value"]=Math.max(0,value-ruleValue(rule.amount,levelOf(item)));}
      }else if(rule.action==="temporary"){
        if(!game.combat?.started)throw Error("Efekt na rundę wymaga rozpoczętego starcia.");
        if(a.temporary.some(e=>e.id===itemId))throw Error("Ten efekt jest już aktywny.");
        let infusedWeapon=null;
        if(rule.element){const weapons=itemsOf(actor).filter(i=>i.type==='weapon'&&i.system.equipped&&!i.system.isRanged&&!i.system.reload);if(!weapons.length)throw Error('Wyposaż broń wręcz do nasycenia.');const fd=await foundry.applications.api.DialogV2.input({window:{title:item.name+' — broń'},content:'<label>Broń<select name="weapon">'+weapons.map(w=>'<option value="'+w.id+'">'+foundry.utils.escapeHTML(w.name)+'</option>').join('')+'</select></label>',ok:{label:'Nasyć broń'}});if(!fd)return;infusedWeapon=weapons.find(w=>w.id===fd.weapon);if(!infusedWeapon)throw Error('Nieprawidłowa broń.');if(a.temporary.some(e=>e.element&&e.weaponId===infusedWeapon.id))throw Error('Broń ma już aktywne nasycenie. Łączenie żywiołów wymaga rozstrzygnięcia MG.');}
        a.temporary.push({weaponId:infusedWeapon?.id,id:itemId,name:item.name,effects:rule.effects.map(e=>({...e,value:ruleValue(e.value,levelOf(item)),when:{...e.when,...(infusedWeapon?{weaponId:infusedWeapon.id}:{})}})),element:rule.element,effectTier:levelOf(item),after:rule.after,requiresFullForm:rule.requiresFullForm,requiresPhase:rule.requiresPhase,combat:game.combat.id,round:Number(game.combat.round),expiresRound:Number(game.combat.round)+ruleValue(rule.durationRounds||1,levelOf(item))});
      }else if(rule.action==="advantage"){
        if(a.pendingAdvantage)throw Error("Ułatwienie czeka już na następny test.");a.pendingAdvantage=true;content+=" — Ułatwienie zadeklarowane przed następnym rzutem";
      }else if(rule.action==="foretell"){
        const results=[...(state.results??[])];if(!Number.isInteger(index)||index<0||index>=results.length)throw Error("Brak zapisanego wyniku.");
        const ta=target===actor?a:automation(target);if(ta.pendingRoll)throw Error("Podmiana została już zadeklarowana.");
        ta.pendingRoll=results.splice(index,1)[0];a.resources[resourceKey]={...state,results};delete a.resources[resourceKey].rule;
        if(target!==actor)await target.setFlag(NS,"automation",ta);
        content+=` — wynik ${ta.pendingRoll} dla ${target.name}, przed rzutem`;
      }else if(rule.action==="roll")content+=` — k100: ${Math.floor(Math.random()*100)+1}`;
      if(state.remaining!==null)a.resources[resourceKey]={...(a.resources[resourceKey]??{}),remaining:state.remaining-1,...(rule.reset==="combat"?{combatId:game.combat.id}:{})};
      update[`flags.${NS}.automation`]=a;await actor.update(update);
      await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p>${foundry.utils.escapeHTML(content)}</p>`});return;
    }
    await actor.setFlag(NS,"automation",a);
    await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<p>${foundry.utils.escapeHTML(content)}</p>`});
  });
}
export async function rollWithDeclarations(actor,options={}){
  return serial(`${actor.uuid}:roll`,async()=>{
    const a=automation(actor),pending=a.pendingRoll,advantage=Boolean(options.advantage||a.pendingAdvantage);
    if(!pending&&!a.pendingAdvantage)return rollD100(options);
    a.pendingRoll=null;a.pendingAdvantage=false;await actor.setFlag(NS,"automation",a);
      // A stored result replaces the test; advantage does not adjust it and doubles are not rerolled.
    return pending?{...d100Result(pending),roll:pending,declared:true}:rollD100({...options,advantage});
  });
}
export async function resetResources(actor,scope){
  return serial(actor.uuid,async()=>{
    const a=automation(actor);a.resources??={};
    for(const item of itemsOf(actor)){const rule=activeRule(item);if(rule?.reset!==scope&&!(scope==="rest"&&rule?.replenish==="blood"))continue;
      a.resources[item.flags?.[NS]?.resourcePool118??item.id]=rule.max?{remaining:rule.initial??ruleValue(rule.max,levelOf(item))}:{};
    }
    if(["scene","rest"].includes(scope)){a.pendingAdvantage=false;}
    await actor.setFlag(NS,"automation",a);
  });
}
export async function expireRound(actor,combat,{end=false}={}){
  const expiredKeys=[];
  for(const effect of Array.from(actor.effects??[])){const d=effect.flags?.[NS]?.spellDuration;if(d?.combatId===combat.id&&(end||Number(combat.round)>=Number(d.expiresRound))){await effect.delete();expiredKeys.push(d.key);}}
  if(expiredKeys.length)await actor.update({'system.conditions':(actor.system.conditions??[]).filter(k=>!expiredKeys.includes(k)||Array.from(actor.effects??[]).some(e=>!e.disabled&&e.statuses?.has?.('gahla-'+k)))});

  if(conditionLevel(actor,"stunned")&&!Array.from(actor.effects??[]).some(e=>e.flags?.[NS]?.spellDuration?.key==="stunned")&&actor.flags?.[NS]?.stunnedCombat===combat.id&&(end||Number(actor.flags?.[NS]?.stunnedRound)<Number(combat.round)))await actor.toggleCondition("stunned",false);
  const a=automation(actor),expired=(a.temporary??[]).filter(e=>e.combat===combat.id&&(end||Number(e.expiresRound??Number(e.round)+1)<=Number(combat.round)));
  if(!expired.length)return;
  a.temporary=a.temporary.filter(e=>!expired.includes(e));await actor.setFlag(NS,"automation",a);
  for(const effect of expired)if(effect.after)await actor.toggleCondition(effect.after,true);
}
export async function recordEvent(combat,event){
  if(!combat||!authority())return;
  return serial(`log:${combat.id}`,async()=>{
    const events=Array.from(combat.flags?.[NS]?.events??[]);
    events.push({id:foundry.utils.randomID(),time:Date.now(),round:Number(combat.round)||0,...event});
    await combat.setFlag(NS,"events",events);
  });
}
export async function migrateAutomation(){
  if(!authority())return {actors:0};
  const actors=new Map(Array.from(game.actors??[]).map(a=>[a.uuid,a]));
  for(const scene of game.scenes??[])for(const token of scene.tokens??[])if(token.actor&&!token.actorLink)actors.set(token.actor.uuid,token.actor);
  let count=0;
  for(const actor of actors.values())if(Number(actor.flags?.[NS]?.automation?.schema??0)<1){
    // Preserve custom flags, spent resources, descriptions, XP and purchased ranks.
    await actor.update({[`flags.${NS}.automation`]:{resources:{},temporary:[],...automation(actor),schema:1}});count++;
  }
  return {actors:count};
}
export function registerAutomationHooks(){
  Hooks.on("updateActor",async(actor,changes)=>{if(!authority()||!(changes["system.phase"]!==undefined||changes.system?.phase!==undefined))return;const a=automation(actor),kept=(a.temporary??[]).filter(e=>formEffectActive119(actor,e));if(kept.length!==(a.temporary??[]).length){a.temporary=kept;await actor.setFlag(NS,"automation",a);}});
  Hooks.on("preUpdateActor",(actor,changes,options)=>{
    options.gahlaBefore={wounds:Number(actor.system.combat.wounds.value),hp:Number(actor.system.combat.hp.value),aura:Number(actor.system.combat.aura.value),reactions:Number(actor.system.combat.reactionLeft),deadly:Boolean(actor.system.combat.deadly)};
  });
  Hooks.on("updateActor",(actor,changes,options)=>{
    if(!authority()||!game.combat?.started||!game.combat.combatants.some(c=>c.actor?.uuid===actor.uuid))return;
    const before=options.gahlaBefore;if(!before)return;
    const after=actor.system.combat;
    const deltas={wounds:actor.usesHP?0:Number(after.wounds.value)-before.wounds,hp:actor.usesHP?before.hp-Number(after.hp.value):0,aura:before.aura-Number(after.aura.value),reactions:before.reactions-Number(after.reactionLeft),deadly:!before.deadly&&after.deadly?1:0};
    for(const [type,amount]of Object.entries(deltas))if(amount>0)void recordEvent(game.combat,{type,amount,actor:actor.uuid,name:actor.name});
  });
  Hooks.on("createChatMessage",message=>{const event=message.flags?.[NS]?.combatEvent;if(event&&game.combat?.started)void recordEvent(game.combat,event);});
  Hooks.on("updateCombat",async(combat,changes)=>{
    if(!authority()||!Object.hasOwn(changes,"round"))return;
    for(const actor of new Map(Array.from(combat.combatants??[]).filter(c=>c.actor).map(c=>[c.actor.uuid,c.actor])).values()){
      if(Number(changes.round)===1&&actor.flags?.[NS]?.lastResourceCombat!==combat.id){await resetResources(actor,"combat");await actor.setFlag(NS,"lastResourceCombat",combat.id);}
      await expireRound(actor,combat);
    }
    await recordEvent(combat,{type:"round",amount:1});
  });
  Hooks.on("deleteCombat",async combat=>{
    if(!authority())return;
    const reports=game.settings.get(NS,"combatReports")??[];
    await game.settings.set(NS,"combatReports",[...reports,{id:combat.id,name:combat.name,events:combat.flags?.[NS]?.events??[],ended:Date.now()}]);
    for(const c of combat.combatants??[])if(c.actor)await expireRound(c.actor,combat,{end:true});
  });
  Hooks.on("updateScene",async(scene,changes)=>{
    if(!authority()||changes.active!==false)return;
    for(const actor of new Map(Array.from(scene.tokens??[]).filter(t=>t.actor).map(t=>[t.actor.uuid,t.actor])).values())await resetResources(actor,"scene");
  });
}

/** Stun consumes one empty action, rather than adding +5 to every action. */
export async function consumeStun(actor){
  if(actor.flags?.[NS]?.dead){ui.notifications.warn("Postać nie żyje. MG może skorygować status po edycji Trwałych Ran.");return true;}
  if(!conditionLevel(actor,"stunned")||actor.flags?.[NS]?.stunConsumed)return false;
  const c=actor.system.combat;
  await actor.update({[`flags.${NS}.stunConsumed`]:true,"system.combat.currentSegments":Math.max(Number(c.reservedSZ)||0,Number(c.currentSegments)-5)});
  await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:"<p>Oszołomienie: następna akcja stracona (5 segmentów). Wykonaj właściwą akcję później.</p>"});
  return true;
}
