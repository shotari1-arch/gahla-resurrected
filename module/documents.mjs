import {talentUsable119} from './talent-eligibility.mjs';
import {fullForm119,formResistance119,formRank119} from './form-canon119.mjs';
import {saveAuraManeuver119} from './talent-aura119.mjs';
import {infusion119} from './talent-infusion119.mjs';
import {chooseSpirit119} from './talent-spirit119.mjs';
import {defenseLabel119,payDefense119} from './talent-defense119.mjs';
import {aim119 as aimBonus,naturalAttack119,tier119,sequenceDiscount119,sequenceResult119} from './talent-values119.mjs';
import {promptArt} from './talent-choices119.mjs';
import {rankData,rankCost,currentRank,effectTier} from './talent-ranks.mjs';
import {monkAttack,promptMonkWeapon,monkTalent} from './monk118.mjs';
import {recordInjury,injuryContext} from './injury-runtime.mjs';
import {controlledSequence,sequenceNext,bodyRuneCost,spellCriticalFailureStart} from './canon-mechanics.mjs';
import { ledgerPatch, itemSnapshot } from './development-ledger.mjs';
import { allocateSpellQuality, spellConditions, spellConditionDefinition, isOffensiveSpell } from './spell-quality.mjs';
import { holyFlameIgnoresResistance, elementKey, auraAccess, effectiveThresholds, thresholdWounds, powerSourceProfile, spellDamageType, preparationErrors } from './canonical-rules.mjs';
import { requestDefense } from "./defense-declarations.mjs";
import { modified, conditionLevel, activeRule } from "./effects-engine.mjs";
import { rollWithDeclarations, resetResources, consumeStun, purchaseTalent } from "./automation-runtime.mjs";
import { talentErrors } from "./automation-rules.mjs";
import { calculateActorAbility } from "./ability-automation.mjs";
import { evaluateTest, rollD100, rollDice, getAttackTarget, pickHitLocation, woundCountFromDamage, capWoundsPerHit, lingeringWoundScore, parseDiceFormula, damageFromAttack, getDamageResistance, applyIgnoreLow, tens, CONDITIONS, ELEMENTS } from "./rules.mjs";
import { effectiveSegments, normalizeTrackerState, applyTrackerAction, applyTrackerReaction, startTrackerRound, cancelTrackerLong } from "./tracker-rules.mjs";
import { explicitTalentPrerequisites } from "./talent-tree-rules.mjs";
import { maneuverAttackProfile, weaponMinimumDelay } from "./maneuver-rules.mjs";
import { spellStoredDelay } from "./item-data.mjs";
import { armorContributors, computeIgnoreLowAtLocation, shieldCovers } from "./armor-rules.mjs";
import { talentAllowedForRace, talentAllowedForArchetype, archetypeTalentTierForActor, talentAllowedForSpecial, minimumTalentTier } from "./talent-eligibility.mjs";
import { weaponTrainingBonusPoints } from "./talent-balance.mjs";
import { inferWoundProfile, profileLabel, resolveLingeringWound } from "./lingering-wounds.mjs";

const { DialogV2 } = foundry.applications.api;

function weaponMetalBonuses(item){
  const metal=String(item?.system?.metal||"").toLowerCase();
  return {
    delay:(metal.includes("lekki")||metal.includes("elficki"))?-1:0,
    hit:(metal.includes("zbalans"))?10:0,
    dice:(metal.includes("ciężki")||metal.includes("krasnoludzki")||metal.includes("krasnoludzkiego kowala run"))?1:0,
    dragonFireDice:metal.includes("smoczy oddech")?3:0,
    penetration:metal.includes("ostrzejszy")?1:0,
    element:metal.includes("smoczy oddech")?"fire":"",
    magical:metal.includes("umagiczniony")||metal.includes("magiczny")||metal.includes("smoczy oddech"),
  };
}

function runeWeaponMods(item){
  const runes=Array.isArray(item?.system?.runes)?item.system.runes:[];
  const elementRune=runes.includes("Runa Elementu")?String(item.system.runeElement||""):"";
  return {
    damageDice:(runes.includes("Runa Obrażeń")?1:0)+(elementRune?1:0),
    penetration:runes.includes("Runa Penetracji")?1:0,
    magical:runes.includes("Runa Magiczna")||Boolean(elementRune),
    element:elementRune,
    advantage:runes.includes("Runa Ułatwienia w ataku / strzale")
  };
}

async function promptManualModifier({title="Modyfikator rzutu",automatic=0}={}){
  const options=[-40,-30,-20,-10,0,10,20,30,40].map(v=>`<option value="${v}" ${v===0?"selected":""}>${v>0?"+":""}${v}</option>`).join("");
  const fd=await DialogV2.input({
    window:{title},
    position:{width:520,height:"auto"},
    content:`<div class="gahla-roll-dialog"><label>Modyfikator ręczny <select name="modifier" autofocus>${options}</select></label><p class="gahla-note">Automatyczny modyfikator przed wyborem: <b>${Number(automatic)>=0?"+":""}${Number(automatic||0)}</b>. Ręczny zakres: −40 do +40.</p></div>`,
    ok:{label:"Rzuć"}
  });
  if(!fd) return null;
  return Math.max(-40,Math.min(40,Number(fd.modifier||0)));
}

function minDelayDefault(cost){ const c=Number(cost||0); return c<=5?4:c<=10?5:c<=15?6:7; }

function escapeHtml(value){ return foundry.utils.escapeHTML(String(value??"")); }
const LOCATION_LABELS={head:"Głowa",leftArm:"Lewa ręka",rightArm:"Prawa ręka",body:"Korpus",rightLeg:"Prawa noga",leftLeg:"Lewa noga"};
function locationLabel(key){ return LOCATION_LABELS[String(key||"")]||String(key||"—"); }
function resultLabel(result){
  if(result?.criticalSuccess)return "KRYTYCZNY SUKCES";
  if(result?.criticalFailure)return "KRYTYCZNA PORAŻKA";
  if(result?.bonus)return "SUKCES Z BONUSEM";
  return result?.success?"SUKCES":"PORAŻKA";
}
function resultClass(result){ return result?.success?"success":result?.criticalFailure?"critical-failure":"failure"; }

async function promptDefensiveAura(targetActor,dice,{dicePerPoint=1}={}){
  const incoming=Math.max(0,Number(dice||0));
  const available=auraAccess(targetActor).allowed?Math.max(0,Number(targetActor?.system?.combat?.aura?.value||0)):0;
  const perPoint=Math.max(1,Number(dicePerPoint||1));
  if(incoming<=0||available<=0)return {points:0,reducedDice:0,remainingDice:incoming,dicePerPoint:perPoint};
  const usefulMax=Math.min(available,Math.ceil(incoming/perPoint));
  const fd=await DialogV2.input({
    window:{title:`Aura — obrona ${targetActor.name}`},
    position:{width:580,height:"auto"},
    content:`<div class="gahla-roll-dialog gahla-aura-dialog"><div class="gahla-dialog-kpis"><span><small>Kości przed Aurą</small><b>${incoming}k10</b></span><span><small>Dostępna Aura</small><b>${available}</b></span><span><small>Redukcja</small><b>−${perPoint}k10 / 1 pkt</b></span></div><p>Aura jest używana <b>wyłącznie defensywnie</b> i musi zostać zadeklarowana przed rzutem obrażeń.</p><label>Punkty Aury do spalenia <input type="number" name="points" min="0" max="${usefulMax}" value="0" autofocus></label><p class="gahla-note">Maksymalnie użyteczne w tym trafieniu: ${usefulMax}. Po wydaniu maksymalnej wartości pozostanie ${Math.max(0,incoming-usefulMax*perPoint)}k10.</p></div>`,
    ok:{label:"Zatwierdź obronę i rzuć"}
  });
  if(!fd)return null;
  const points=Math.max(0,Math.min(usefulMax,Number(fd.points||0)));
  if(points>0){
    const spent=await targetActor.spendAura(points);
    if(!spent)return ui.notifications.warn("Gahla: nie udało się wydać Aury."),null;
  }
  const reducedDice=Math.min(incoming,points*perPoint);
  return {points,reducedDice,remainingDice:Math.max(0,incoming-reducedDice),dicePerPoint:perPoint};
}

export class GahlaActor extends Actor {
  get activeArmor(){ return this.items.filter(i=>i.type==="armor" && i.system.equipped&&!fullForm119(this)); }
  get weapons(){ return this.items.filter(i=>i.type==="weapon"); }
  get mainWeapon(){ return this.weapons.find(i=>i.system.equipped) ?? this.weapons[0]; }
  get powerSource(){ return this.items.find(i=>i.type==="powerSource" && i.system.equipped); }
  get knownTalents(){ return this.items.filter(i=>i.type==="talent" && i.system.learned); }
  get effectiveTalents(){return this.knownTalents.filter(i=>talentUsable119(this,i));}
  get isMinion(){ return this.type==="minion"; }
  get usesHP(){ return this.type==="minion" || this.type==="standard"; }
  get isNPC(){ return ["minion","standard","elite","boss","bossPart"].includes(this.type); }
  get armorIgnoreLow(){ return this.activeArmor.reduce((m,i)=>Math.max(m,Number(i.system.ignoreLow||0)),0); }

  hasCondition(key){ return conditionLevel(this,key)>0; }

  get trackerBaseSZ(){ return Math.max(1, Number(this.system.combat.speedOverride||0) || Number(this.system.derived.speedBase||1)); }
  get trackerIsBoss(){ return Boolean(this.system.combat.trackerBoss || this.type === "boss" || this.type === "bossPart"); }

  async #syncTrackerInitiative(){
    const combat=game.combat;
    if(!combat) return;
    const combatant=combat.combatants.find(c=>c.actor?.id===this.id);
    if(!combatant) return;
    // Use the same synchronization path as weapon/spell actions. Avoid core
    // updateTurn semantics because Gahla initiative is a spendable pool, not
    // a fixed one-turn-per-combatant list.
    if(combat.syncCombatantFromActor) return combat.syncCombatantFromActor(combatant,{advance:false});
    const initiative=Number(this.system.combat.currentSegments)||0;
    if(combat.setInitiative) return combat.setInitiative(combatant.id,initiative);
    return combat.updateEmbeddedDocuments("Combatant",[{_id:combatant.id,initiative}],{gahlaSync:true});
  }

  async setTrackerBoss(value){
    const trackerBoss=Boolean(value);
    const reactionMax=trackerBoss?3:1;
    const reactionLeft=Math.min(reactionMax,Math.max(0,Number(this.system.combat.reactionLeft||0)));
    await this.update({"system.combat.trackerBoss":trackerBoss,"system.combat.reactionMax":reactionMax,"system.combat.reactionLeft":reactionLeft},{gahlaTrackerSync:true});
    await this.#syncTrackerInitiative();
  }

  async adjustTrackerBaseSZ(delta){
    const oldBase=this.trackerBaseSZ;
    const nextBase=Math.max(1,oldBase+Number(delta||0));
    const appliedDelta=nextBase-oldBase;
    if(!appliedDelta) return nextBase;
    const current=Math.max(0,Number(this.system.combat.currentSegments||0)+appliedDelta);
    const reserved=Math.min(current,Number(this.system.combat.reservedSZ||0));
    await this.update({"system.combat.speedOverride":nextBase,"system.combat.currentSegments":current,"system.combat.reservedSZ":reserved},{gahlaTrackerSync:true});
    await this.#syncTrackerInitiative();
    return nextBase;
  }

  async trackerAction(cost,mode="n",{bossPauseEligible=false}={}){
    if(await consumeStun(this))return {ok:false,error:"Oszołomienie — stracona akcja"};
    const state=normalizeTrackerState({...this.system.combat,trackerBoss:this.trackerIsBoss},{reactionMax:this.trackerIsBoss?3:1,currentSegments:this.system.combat.currentSegments});
    const result=applyTrackerAction(state,cost,mode);
    if(!result.ok){ ui.notifications.warn(`Gahla: ${result.error}`); return result; }
    const s=result.state;
    const update={
      "system.combat.currentSegments":s.currentSegments,
      "system.combat.reservedSZ":s.reservedSZ,
      "system.combat.reactionMax":s.reactionMax,
      "system.combat.reactionLeft":s.reactionLeft,
      "system.combat.reactionUsed":s.reactionUsed,
      "system.combat.normalDebt":s.normalDebt,
      "system.combat.longDebt":s.longDebt,
      "system.combat.longReady":s.longReady,
      "system.combat.transferSegments":s.transferSegments,
      "system.combat.justActed":s.justActed,
      "system.combat.done":s.done,
      "system.combat.reactionPenalty":0
    };
    await this.update(update,{gahlaTrackerSync:true});
    if(mode!=="n" || result.cost>0) await this.#syncTrackerInitiative();
    if(mode==="n")await game.combat?.completeGahlaAction?.(this,{bossPauseEligible});
    if(mode==="l"&&!this.flags?.["gahla-resurrected"]?.pendingSpell)await this.setFlag("gahla-resurrected","pendingMainAction",{bossPauseEligible});
    // An action recorded from the full Gahla tracker is a real initiative action.
    // Re-evaluate the active combatant by remaining SZ, just like weapon/spell actions.
    if(game.combat?.advanceGahlaTurn && (mode!=="n" || result.cost>0)) {
      await game.combat.advanceGahlaTurn({allowRoundAdvance:true});
    }
    return result;
  }

  async trackerReaction(cost){
    cost=modified(this,cost,"reactionCost",{},1);
    const state=normalizeTrackerState({...this.system.combat,trackerBoss:this.trackerIsBoss},{reactionMax:this.trackerIsBoss?3:1,currentSegments:this.system.combat.currentSegments});
    const result=applyTrackerReaction(state,cost);
    if(!result.ok){ ui.notifications.warn(`Gahla: ${result.error}`); return result; }
    const s=result.state;
    await this.update({
      "system.combat.currentSegments":s.currentSegments,
      "system.combat.reservedSZ":s.reservedSZ,
      "system.combat.reactionMax":s.reactionMax,
      "system.combat.reactionLeft":s.reactionLeft,
      "system.combat.reactionUsed":s.reactionUsed
    },{gahlaTrackerSync:true});
    await this.#syncTrackerInitiative();
    return result;
  }

  async trackerCancelLong(){
    const result=cancelTrackerLong({...this.system.combat,trackerBoss:this.trackerIsBoss});
    if(!result.ok){ ui.notifications.warn(`Gahla: ${result.error}`); return result; }
    await this.update({"system.combat.longDebt":0,"system.combat.longReady":false,"system.combat.done":true,"flags.gahla-resurrected.pendingSpell":null},{gahlaTrackerSync:true});
    await this.#syncTrackerInitiative();
    return result;
  }

  async resolveLongAction(){
    if(!this.system.combat.longReady)return false;
    const pending=this.flags?.['gahla-resurrected']?.pendingSpell;
    await this.update({'system.combat.longReady':false,'system.combat.done':true,'flags.gahla-resurrected.pendingSpell':null});
    if(pending){const item=this.items.get(pending.itemId);if(item)await item.roll({...pending.options,longResolution:true,promptModifier:false});}
    else {await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this}),content:'<p>Akcja Długa opłacona. Rozstrzygnij jej efekt; pozostałe segmenty tej rundy nie pozwalają na kolejną akcję.</p>'});await game.combat?.completeGahlaAction?.(this,this.flags?.['gahla-resurrected']?.pendingMainAction??{});await this.setFlag('gahla-resurrected','pendingMainAction',null);}
    return true;
  }

  async trackerStartRound({sync=true}={}){
    const state=normalizeTrackerState({...this.system.combat,trackerBoss:this.trackerIsBoss},{reactionMax:this.trackerIsBoss?3:1});
    const result=startTrackerRound(state,this.trackerBaseSZ);
    await this.update({
      "system.combat.currentSegments":result.currentSegments,
      "system.combat.reservedSZ":result.reservedSZ,
      "system.combat.reactionMax":result.reactionMax,
      "system.combat.reactionLeft":result.reactionLeft,
      "system.combat.reactionUsed":result.reactionUsed,
      "system.combat.reactionPenalty":0,
      "system.combat.normalDebt":result.normalDebt,
      "system.combat.longDebt":result.longDebt,
      "system.combat.longReady":result.longReady,
      "system.combat.transferSegments":result.transferSegments,
      "system.combat.justActed":result.justActed,
      "system.combat.done":result.done
    },{gahlaTrackerSync:true});
    if(sync) await this.#syncTrackerInitiative();
    return result;
  }

  async rollTest(stat,{modifier=0,advantage=false,disadvantage=false,label=null,promptModifier=true,casting=false,actingLocation="",movement=false,againstCondition=""}={}){
    const context=await injuryContext(this,{location:actingLocation,movement,prompt:promptModifier});if(!context)return null;
    advantage=advantage||formResistance119(this,stat,againstCondition);
    const suppliedModifier=Number(modifier||0);
    let conditionModifier=modified(this,0,"test",{kind:"test",stat,...context});
    disadvantage=disadvantage||modified(this,0,"disadvantage",{kind:"test",stat})>0;
    if(this.hasCondition("frozen") && stat==="zr") disadvantage=true;
    if(this.hasCondition("auraWeak") && stat==="per") disadvantage=true;
    const automaticModifier=suppliedModifier+conditionModifier;
    const manualModifier=promptModifier?await promptManualModifier({title:`${label??String(stat).toUpperCase()} — modyfikator`,automatic:automaticModifier}):0;
    if(manualModifier===null) return null;
    const finalModifier=automaticModifier+Number(manualModifier||0);
    const target=Number(this.system.stats?.[stat]??this.system.derived?.[stat]??0)+finalModifier;
    const r=await rollWithDeclarations(this,{advantage,disadvantage});
    const result=evaluateTest(r.final,target);
    if(casting&&r.final>=spellCriticalFailureStart(this,stat))Object.assign(result,{success:false,bonus:false,criticalSuccess:false,criticalFailure:true});
    const rerollModifier=suppliedModifier+Number(manualModifier||0);
    const fateButton=Number(this.system.fate.personal||0)>0?`<button type="button" data-action="gahla-fate-test" data-actor="${this.uuid}" data-stat="${stat}" data-casting="${casting}" data-acting-location="${context.location}" data-movement="${context.movement}" data-modifier="${rerollModifier}" data-advantage="${advantage}" data-disadvantage="${disadvantage}" data-label="${foundry.utils.escapeHTML(label??stat.toUpperCase())}">Przerzuć test — Punkt Losu</button>`:"";
    const modHtml=finalModifier?`<small>Modyfikator łącznie: ${finalModifier>0?"+":""}${finalModifier}${manualModifier?` (ręczny ${manualModifier>0?"+":""}${manualModifier})`:""}</small>`:"";
    const testStatus=resultLabel(result);
    const content=`<div class="gahla-chat gahla-chat-card gahla-test-card"><header class="gahla-chat-header"><div><small>TEST</small><h3>${foundry.utils.escapeHTML(label??stat.toUpperCase())}</h3><p>${escapeHtml(this.name)}</p></div><span class="gahla-chat-status ${resultClass(result)}">${testStatus}</span></header><div class="gahla-chat-kpis"><span><small>Rzut</small><b>${String(r.final).padStart(2,"0")}</b></span><span><small>Próg</small><b>${target}</b></span><span><small>Modyfikator</small><b>${finalModifier>0?"+":""}${finalModifier}</b></span>${(advantage||disadvantage)?`<span><small>Odwrócony</small><b>${r.alternate}</b></span>`:""}</div>${modHtml?`<p class="gahla-chat-explain">${modHtml}</p>`:""}${(advantage||disadvantage)?`<p class="gahla-chat-muted">Surowy wynik: ${r.raw} · po zasadzie Ułatwienia/Utrudnienia: ${r.final}.</p>`:""}${fateButton?`<div class="gahla-chat-actions gahla-chat-fate">${fateButton}</div>`:""}</div>`;
    await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this}),content});
    await this.setFlag?.("gahla-resurrected","lastRoll",{kind:"test",combatId:game.combat?.id});
    return {...result,...r,modifier:finalModifier,manualModifier};
  }

  async rollAttack(targetActor=this.getTokenTargetActor(),weapon=this.mainWeapon,{modifier=0,calledShot=false,calledShotLocation="body",advantage=false,disadvantage=false,free=false,promptModifier=true,maneuver=null,declaredDefense=null,aimSegments=0,sequence=null,declaredShots=null,actingLocation="",promoteSequenceBonus=false,declaredSpirit=undefined,sequence119Previous=undefined}={}){
    if(await consumeStun(this))return null;
    if(!weapon) return ui.notifications.warn("Gahla: wybierz broń.");
    if(!targetActor) return ui.notifications.warn("Gahla: wskaż cel (zaznacz token) lub wybierz cel w parametrach makra.");
    const injuryCtx=await injuryContext(this,{location:actingLocation,attack:true,weapon,prompt:!free});if(!injuryCtx)return null;
    const overlay=maneuver?maneuverAttackProfile(weapon,maneuver):null;
    const ranged=Boolean(weapon.system.isRanged||weapon.system.reload);
    const aiming=aimBonus(this,ranged?Number(aimSegments):0);
    const natural=naturalAttack119(weapon);
    const infusion=infusion119(this,weapon);
    const formBleeding119=fullForm119(this)&&formRank119(this,"Zmiennokształtny")>=3;
    const spirit=declaredSpirit??await chooseSpirit119(this,weapon);if(spirit===null)return null;
    if(spirit&&infusion&&spirit.element!==infusion.element)throw Error('Duchowa Pięść i nasycenie broni mają różne żywioły. Łączenie wymaga rozstrzygnięcia MG.');
    const sequenceEffect=sequence?controlledSequence(this,sequence):{};
    const nextSequence=!free?sequenceNext(this,sequence):sequence?{...structuredClone(this.flags?.["gahla-resurrected"]?.sequence??{}),complete:sequence.index===sequence.length}:null;
    if(sequence&&!maneuver)throw Error("Sekwencja wymaga manewru.");
    if(sequence&&fullForm119(this))throw Error("Bestia w pełnej przemianie używa Manewrów, ale nie Sekwencji.");
    if(ranged&&!free&&weapon.flags?.["gahla-resurrected"]?.loadedShots===0)return ui.notifications.warn("Przeładuj broń przed strzałem.");
    if(overlay?.halfWeaponDice && Number(weapon.system.hands||1)<1.5){
      return ui.notifications.warn(`Gahla: aspekt „Użycie obu rąk” wymaga broni 1,5- lub 2-ręcznej. ${weapon.name} nie spełnia tego wymogu.`);
    }
    const maneuverHit=Number(overlay?.hitMod||0)+aiming.hit;
    const targetDefense=Number(targetActor.system.derived.defense||0);
    const monkBonus=monkAttack(this,weapon);
    const automaticPrompt=Number(modifier||0)+monkBonus.bgl+maneuverHit+(calledShot&&!sequenceEffect.ignoreCalled?Math.min(0,-30+aiming.calledShotReduction):0);
    const title=maneuver?`Atak: ${weapon.name} + ${maneuver.name} — modyfikator`:`Atak: ${weapon.name} — modyfikator`;
    const manualModifier=promptModifier?await promptManualModifier({title,automatic:automaticPrompt}):0;
    if(manualModifier===null) return null;
    modifier=Number(modifier||0)+Number(manualModifier||0);
    const runeMods=runeWeaponMods(weapon);
    const gida=(this.flags?.["gahla-resurrected"]?.automation?.temporary??[]).some(e=>e.name==="Gniew Gidy"&&e.effectTier>=4&&e.weaponId===weapon.id);
    let effectiveAdvantage=Boolean(advantage||runeMods.advantage||gida&&targetActor.flags?.["gahla-resurrected"]?.creatureOfDarkness&&!ranged), effectiveDisadvantage=Boolean(disadvantage);
    if(modified(this,0,"disadvantage",{kind:"attack",targetUuid:targetActor.uuid})>0) effectiveDisadvantage=true;
    const isRanged=Boolean(weapon.system.reload||weapon.system.isRanged);
    if(targetActor.hasCondition?.("asleep")) effectiveAdvantage=false;
    if(targetActor.hasCondition?.("prone")) { if(isRanged) effectiveDisadvantage=true; else effectiveAdvantage=true; }
    if(targetActor.hasCondition?.("stunned") || targetActor.hasCondition?.("asleep")) effectiveAdvantage=true;
    const metalMods=weaponMetalBonuses(weapon);
    let targetNumber=getAttackTarget(this,targetDefense,Number(modifier||0)+monkBonus.bgl+maneuverHit+(calledShot&&!sequenceEffect.ignoreCalled?Math.min(0,-30+aiming.calledShotReduction):0)+metalMods.hit+modified(this,0,"hit",{kind:"attack",ranged:isRanged,natural}));
    if(targetActor.hasCondition?.("asleep")) targetNumber=100;
    targetNumber+=modified(this,0,"test",{kind:"attack",...injuryCtx});
    targetNumber=Math.ceil(targetNumber*modified(this,1,"hitMultiplier",{kind:"attack"}));
    if(modified(this,0,"disadvantage",{kind:"attack",ranged:isRanged,targetUuid:targetActor.uuid})>0)effectiveDisadvantage=true;
    const legacyReactionPenalty=Number(this.system.combat.reactionPenalty||0);
    const weaponTraits=(weapon.system.traits||[]).map(t=>String(t).toLowerCase());
    const heavyStrengthPenalty=weaponTraits.includes("ciężka") && Number(this.system.stats?.sf||0)<50 ? 2 : 0;
    const rawDelay=Number(weapon.system.delay||3)+metalMods.delay+Number(this.system.derived.actionDelayMod||0)+heavyStrengthPenalty+Number(overlay?.delayDelta||0);
    const talentDelay=modified(this,0,"attackDelay",{natural,ranged})-sequenceDiscount119(this,maneuver);
    const delay=free?0:Math.max(modified(this,weaponMinimumDelay(weapon),"minimumDelay"),rawDelay+talentDelay)+aiming.segments;
    const payingCombatant=!free&&game.combat?.started?game.combat.combatants.find(c=>c.actor?.id===this.id):null;
    if(payingCombatant){const check=applyTrackerAction(this.system.combat,delay,'n');if(!check.ok){ui.notifications.warn(check.error);return null;}}
    const defense=declaredDefense??await requestDefense(this,targetActor,{ranged:isRanged});
    if(defense.cancelled)return null;
    if(payingCombatant&&!await game.combat.spendSegments(delay,payingCombatant.id,{advance:false}))return null;
    targetNumber-=Number(defense.defenseBonus||0);
    if(defense.attackDisadvantage)effectiveDisadvantage=true;
    const shots=declaredShots??(ranged?Number(weapon.flags?.["gahla-resurrected"]?.loadedShots??1):1);
    if(ranged&&!free)await weapon.update({"flags.gahla-resurrected.loadedShots":0});
    
    const r=await rollWithDeclarations(this,{advantage:effectiveAdvantage,disadvantage:effectiveDisadvantage});
    let result=evaluateTest(r.final,targetNumber);
    if(targetActor.hasCondition?.("asleep") && !result.criticalFailure){ result={...result,success:true,bonus:false,criticalSuccess:true,criticalFailure:false}; }
    const locationRoll=calledShot?null:r.locationRoll;
    const location=result.success?(calledShot?String(calledShotLocation||"body"):pickHitLocation(r.locationRoll,true)):null;
    const training=this.effectiveTalents.find(i=>i.name.toLowerCase()==="szkolenie oręża");
    const previousSequence=sequence119Previous??structuredClone(this.flags?.["gahla-resurrected"]?.sequence??{});
    const mastery=sequenceResult119(this,sequence,nextSequence??{},result,{promote:promoteSequenceBonus,previous:previousSequence});result=mastery.result;
    const trainingBonus=training?weaponTrainingBonusPoints(Number(training.system.level||1),result):0;
    const bonusPoints=(result.criticalSuccess?4:result.bonus?2:0)+trainingBonus+mastery.points;
    if(!free||sequence&&sequence119Previous!==undefined&&this.flags?.["gahla-resurrected"]?.sequence?.index===sequence.index){if(sequence||this.flags?.["gahla-resurrected"]?.sequence)await this.setFlag("gahla-resurrected","sequence",nextSequence);if(maneuver||mastery.state)await this.setFlag("gahla-resurrected","sequence119",mastery.state??null);}
    const maneuverUuid=maneuver?.uuid||"";
    const fateButton=Number(this.system.fate.personal||0)>0?`<button type="button" data-action="gahla-fate-attack" data-actor="${this.uuid}" data-target="${targetActor.uuid}" data-weapon="${weapon.uuid}" data-maneuver="${maneuverUuid}" data-modifier="${modifier}" data-called-shot="${calledShot}" data-called-shot-location="${foundry.utils.escapeHTML(String(calledShotLocation||"body"))}" data-advantage="${effectiveAdvantage}" data-disadvantage="${effectiveDisadvantage}">Przerzuć trafienie — Punkt Losu</button>`:"";

    let failureHtml="";
    if(result.criticalFailure){
      const { FAILURE_TABLES }=await import("./content.mjs");
      const tableKey=(maneuver||!isRanged)?"maneuver":"ranged"; const table=FAILURE_TABLES[tableKey]||[];
      const fr=Math.floor(Math.random()*100)+1; const row=table.find(([min,max])=>fr>=min&&fr<=max);
      if(row) failureHtml=`<div class="gahla-note"><b>Pech przy ${maneuver?"manewrze":isRanged?"ataku dystansowym":"ataku"}</b>: k100 ${fr} — ${row[2]}<br>${foundry.utils.escapeHTML(row[3])}</div>`;
    }
    const maneuverHtml=maneuver?`<div class="gahla-note"><b>Manewr: ${foundry.utils.escapeHTML(maneuver.name)}</b> · ${overlay.damageDiceDelta>=0?"+":""}${overlay.damageDiceDelta}k10 · ${overlay.delayDelta>=0?"+":""}${overlay.delayDelta} OP · ${overlay.hitMod>=0?"+":""}${overlay.hitMod} traf. · +${overlay.penetrationBonus} Pen.${overlay.halfWeaponDice?` · +${overlay.halfBonus}k10 (½ kości broni)`:""}</div>`:"";
    const damageAttrs=`data-attacker="${this.uuid}" data-target="${targetActor.uuid}" data-weapon="${weapon.uuid}" data-maneuver="${maneuverUuid}" data-roll="${r.final}" data-location="${location||"body"}" data-bonus="${Boolean(result.bonus)}" data-critical="${Boolean(result.criticalSuccess)}"`;
    const attackSource=`${escapeHtml(weapon.name)}${maneuver?` + ${escapeHtml(maneuver.name)}`:""}`;
    const status=defense.stopped?"SPAROWANO":resultLabel(result);
    const defenseStep='<section class="gahla-chat-step gahla-defense-summary"><div><b>Obrona zadeklarowana przed rzutem</b><p>'+escapeHtml(defenseLabel119(defense))+'</p></div></section>';
    const damageStep=result.success&&!defense.stopped&&shots===1?`<section class="gahla-chat-step"><span class="gahla-step-no">2</span><div><b>Obrażenia</b><small>${bonusPoints?`Najpierw rozdziel ${bonusPoints} pkt bonusu.`:"Aura obrońcy zostanie zadeklarowana defensywnie przed rzutem kości."}</small><div class="gahla-chat-actions">${bonusPoints?`<button type="button" class="gahla-chat-primary" data-action="gahla-auto-bonus" ${damageAttrs} data-points="${bonusPoints}">Rozdziel ${bonusPoints} pkt bonusu</button>`:`<button type="button" class="gahla-chat-primary" data-action="gahla-auto-damage" ${damageAttrs}>Przejdź do obrażeń</button>`}</div></div></section>`:"";
    const rollExplanation=(effectiveAdvantage||effectiveDisadvantage||r.effectiveRoll!==r.rawRoll)?'<p class="gahla-chat-explain">Rzut fizyczny: <b>'+r.rawRoll+'</b> · odwrócony: '+r.mirrorRoll+' · wynik testu: <b>'+r.effectiveRoll+'</b> · '+(calledShot?'atak celowany — '+escapeHtml(locationLabel(calledShotLocation)):'rzut lokacji: '+locationRoll+(location?' — '+escapeHtml(locationLabel(location)):''))+'.</p>':'';
    const fateStep=fateButton?`<div class="gahla-chat-actions gahla-chat-fate">${fateButton}</div>`:"";
    const html=`<div class="gahla-chat gahla-chat-card gahla-attack-card"><header class="gahla-chat-header"><div><small>ATAK</small><h3>${escapeHtml(this.name)} → ${escapeHtml(targetActor.name)}</h3><p>${attackSource}</p></div><span class="gahla-chat-status ${resultClass(result)}">${status}</span></header><div class="gahla-chat-kpis"><span><small>Rzut</small><b>${String(r.final).padStart(2,"0")}</b></span><span><small>Próg trafienia</small><b>${targetNumber}</b></span><span><small>OP</small><b>${delay}</b></span>${location?`<span><small>Lokacja</small><b>${escapeHtml(locationLabel(location))}</b></span>`:""}</div>${rollExplanation}${monkBonus.bgl?`<p class="gahla-note">BGŁ bazowa: ${Number(this.system.stats.bgl)} · Szkolenie Mnicha: +${monkBonus.bgl} · BGŁ ataku: ${Number(this.system.stats.bgl)+monkBonus.bgl}</p>`:""}${maneuverHtml}${failureHtml}${bonusPoints?`<div class="gahla-chat-callout"><b>${bonusPoints} pkt bonusu</b><span>1 pkt = +1k10 · 2 pkt = +1 Pen. · 3 pkt = Powalenie</span></div>`:""}${defenseStep}${shots>1?"<p>Wielostrzał: "+shots+" strzały. Nakładanie flat damage i jakości wymaga decyzji autora; obrażenia rozstrzyga MG.</p>":""}${damageStep}${result.success&&result.bonus&&!defense.stopped&&infusion?.name==="Gniew Gidy"&&infusion.tier>=3?'<button type="button" data-action="gahla-gida119">Gniew Gidy: test Odporności na Podpalenie (obrońca / MG)</button>':""}${result.success&&result.bonus&&!defense.stopped&&formBleeding119?'<button type="button" data-action="gahla-form-bleeding119">Zmiennokształtny T3: test Odporności Fizycznej na Krwawienie (obrońca / MG)</button>':""}${fateStep}</div>`;
    const attackMessage=await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this}),content:html,flags:{"gahla-resurrected":{attack:{attacker:this.uuid,defender:targetActor.uuid,weapon:weapon.uuid,maneuver:maneuverUuid,rawRoll:r.rawRoll,mirrorRoll:r.mirrorRoll,effectiveRoll:r.effectiveRoll,locationRoll,ranged:isRanged,actingLocation:injuryCtx.location,aiming,sequence,sequenceEffect,spirit,infusion,formBleeding119,sequence119Previous:previousSequence,promoteSequenceBonus,shots,reacted:true,stopped:Boolean(defense.stopped),declaredDefense:defense,success:result.success,roll:r.final,targetNumber,location,bonusPoints,bonus:result.bonus,critical:result.criticalSuccess},combatEvent:{type:"attack",actor:this.uuid,name:this.name,target:targetActor.uuid,success:result.success}}}});
    if(defense.parryChat)await ChatMessage.create(defense.parryChat);
    await this.setFlag?.("gahla-resurrected","lastRoll",{kind:"attack",combatId:game.combat?.id,round:Number(game.combat?.round),messageId:attackMessage?.id,target:targetActor.uuid,weapon:weapon.uuid,maneuver:maneuverUuid,options:{declaredSpirit:spirit,sequence119Previous:previousSequence,promoteSequenceBonus,modifier,calledShot,calledShotLocation,advantage,disadvantage,declaredDefense:{...defense,parryChat:null},aimSegments,sequence,declaredShots:shots,actingLocation:injuryCtx.location}});
    if(!free&&game.combat?.started){
      const combatant=game.combat?.combatants.find(c=>c.actor?.id===this.id);
      if(combatant) { await game.combat.completeGahlaAction?.(this,{bossPauseEligible:true}); await game.combat.advanceGahlaTurn({allowRoundAdvance:true}); if(legacyReactionPenalty>0) await this.update({"system.combat.reactionPenalty":0},{gahlaTrackerSync:true}); }
    }
    return {...result,...r,locationRoll,location,bonusPoints,weapon,maneuver,targetActor,delay,overlay,aiming,sequenceEffect,spirit,infusion,shots};
  }

  async rollParry(attacker,{deferChat=false,concentration=false}={}){
    if(!attacker) return ui.notifications.warn("Gahla: brak atakującego.");
    if(Number(this.system.combat.reactionLeft||0)<=0) return ui.notifications.warn("Gahla: brak reakcji w tej rundzie.");
    const weapon=this.mainWeapon; if(!weapon) return ui.notifications.warn("Gahla: brak broni do parowania.");
    let modifier=0; const traits=(weapon.system.traits||[]).map(t=>String(t).toLowerCase());
    if(traits.includes("parująca")) modifier+=10;
    const parryMaster=this.effectiveTalents.find(i=>i.name.toLowerCase()==="mistrz parowania"); if(parryMaster) modifier+=5*Math.max(1,Math.min(4,Number(parryMaster.system.level||1)));
    const shield=this.activeArmor.find(i=>i.system.isShield&&Number(i.system.armor||0)>0); if(shield?.system?.traits?.some?.(t=>String(t).toLowerCase().includes("parująca"))) modifier+=10;
    const manualModifier=await promptManualModifier({title:"Parowanie — modyfikator",automatic:modifier});
    if(manualModifier===null) return null;
    modifier+=Number(manualModifier||0);
    const attackerBgl=Number(attacker.system.stats.bgl||0); const target=Number(this.system.stats.zr||0)+Number(this.system.stats.bgl||0)-attackerBgl+modifier;
    const cost=Math.max(1,Math.ceil(Number(weapon.system.delay||3)/2));
    const concentrationResult=concentration?await payDefense119(this,'parry',{concentration:true}):null;
    const reaction=concentrationResult?{ok:true}:await this.trackerReaction(cost);
    if(!reaction.ok) return reaction;
    const r=await rollWithDeclarations(this,{disadvantage:modified(this,0,"disadvantage",{kind:"test",stat:"zr"})>0}); const result=evaluateTest(r.final,target+modified(this,0,"test",{kind:"test",stat:"zr"}));
    // trackerReaction already reserves this cost against available SZ; do not also
    // add it to reactionPenalty or the same reaction would be charged twice.
    const freeAttack=result.bonus?`<button type="button" data-action="gahla-free-counterattack" data-defender="${this.uuid}" data-attacker="${attacker.uuid}" data-weapon="${weapon.uuid}">Darmowy kontratak</button>`:"";
    const parryStatus=result.criticalSuccess?"KRYTYCZNE PAROWANIE":result.bonus?"PAROWANIE + KONTRATAK":result.success?"SPAROWANO":"PAROWANIE NIEUDANE";
    const chatData={speaker:ChatMessage.getSpeaker({actor:this}),content:`<div class="gahla-chat gahla-chat-card gahla-parry-card"><header class="gahla-chat-header"><div><small>REAKCJA</small><h3>Parowanie</h3><p>${escapeHtml(this.name)} przeciw ${escapeHtml(attacker.name)}</p></div><span class="gahla-chat-status ${result.success?"success":"failure"}">${parryStatus}</span></header><div class="gahla-chat-kpis"><span><small>Rzut</small><b>${String(r.final).padStart(2,"0")}</b></span><span><small>Próg</small><b>${target}</b></span><span><small>Koszt reakcji</small><b>${cost} SZ</b></span></div><p class="gahla-chat-explain">${result.success?"Atak został sparowany — nie rozliczaj jego obrażeń.":"Parowanie nie zatrzymało ataku — możesz przejść do obrażeń z karty ataku."}</p>${freeAttack?`<div class="gahla-chat-actions">${freeAttack}</div>`:""}</div>`};
    if(deferChat)return {...result,chatData,concentration:concentrationResult};
    await ChatMessage.create(chatData);
    return result;
  }

  getTokenTargetActor(){
    const token=game.user?.targets?.first();
    return token?.actor ?? null;
  }

  async resolveAttackBonus(targetActor,weapon,attackResult,{damageDice=0,penetration=0,applyProne=false}={}){
    const damage=await this.rollDamageAgainst(targetActor,weapon,attackResult,{damageDice,penetration,applyProne});
    return damage;
  }

  async rollDamageAgainst(targetActor,weapon=this.mainWeapon,attackResult={},opts={}){
    if(!weapon||!targetActor) return null;
    const metalMods=weaponMetalBonuses(weapon);
    const runeMods=runeWeaponMods(weapon);
    const isSpell=Boolean(opts.isSpell);
    const maneuver=opts.maneuver||attackResult.maneuver||null;
    const profile=maneuver?maneuverAttackProfile(weapon,maneuver):null;
    const infusion=!isSpell?(attackResult.infusion??infusion119(this,weapon)):null;
    const effectiveWeapon={system:{...weapon.system,damage:profile?.damage||weapon.system.damage,penetration:Number(weapon.system.penetration||0)+Number(profile?.penetrationBonus||0),element:attackResult.spirit?.element||infusion?.element||weapon.system.element||runeMods.element||metalMods.element,magical:Boolean(weapon.system.magical||runeMods.magical||metalMods.magical)}};
    const mode=damageFromAttack({weapon:effectiveWeapon,attackResult,bonusDamageDice:(opts.damageDice||0)+Number(attackResult.aiming?.dice||0)+metalMods.dice+metalMods.dragonFireDice,bonusPenetration:(opts.penetration||0)+metalMods.penetration+runeMods.penetration,magical:isSpell||runeMods.magical||metalMods.magical,isSpell});
    mode.dice+=Number(attackResult.spirit?.dice||0)+Number(infusion?.dice||0);
    mode.dice=modified(this,mode.dice,"damageDice",{kind:isSpell?"spell":"attack"},0);
    mode.penetration=modified(this,mode.penetration,"penetration",{kind:isSpell?"spell":"attack",natural:!isSpell&&naturalAttack119(weapon)},0);
    if(!isSpell)mode.dice=modified(this,mode.dice,"attackDice",{natural:naturalAttack119(weapon),ranged:Boolean(weapon.system.isRanged||weapon.system.reload),unarmed:weapon.system.profileId==="unarmed",weaponId:weapon.id},0);
    const location=attackResult.location||"body";
    const originalArmor=Math.max(0,modified(targetActor,Number(targetActor.system.derived.armor?.[location]||0),"armor",{location}));
    let armor=originalArmor;
    const matchingArmor=targetActor.activeArmor.find(i=>{
      const covered=i.system.isShield ? shieldCovers(i,location,targetActor) : Number(i.system.locations?.[location]||0)>0;
      const value=i.system.isShield?Number(i.system.armor||0):Number(i.system.locations?.[location]||0);
      return covered && value>=originalArmor;
    }) ?? targetActor.activeArmor.find(i=>i.system.isShield?shieldCovers(i,location,targetActor):Number(i.system.locations?.[location]||0)>0) ?? targetActor.activeArmor[0];
    const magical=mode.magical;
    const armorHasMagicRune=Boolean(matchingArmor?.system?.runes?.includes?.("Runa Magiczna"));
    if(magical && (matchingArmor?.system.magical||armorHasMagicRune)) { /* pełny pancerz */ }
    else if(magical) armor=Math.ceil(armor/2);
    const element=effectiveWeapon.system.element;
    const armorElementRune=matchingArmor?.system?.runes?.includes?.("Runa Elementu") ? String(matchingArmor.system.runeElement||"") : "";
    const matchingElementResistance=Boolean(element && (matchingArmor?.system.armorElementResistance===element || armorElementRune===element));
    if(matchingElementResistance) armor*=2;
    armor=attackResult.sequenceEffect?.ignoreArmor?0:Math.max(0,armor-mode.penetration);
    const overflow=Math.max(0,mode.penetration-originalArmor)*5;
    const attackDice=Math.max(0,Number(mode.dice||0));
    const armorDiceRemoved=Math.min(attackDice,armor);
    let dice=Math.max(0,attackDice-armor);
    const diceAfterArmor=dice;
    let forcedMax=0; let extraDice=0; let deadlyMultiplier=1;
    // Quality grants spendable points only; no legacy dice multiplier.
    dice+=monkAttack(this,weapon).dice;
    const diceBeforeAura=Math.max(0,dice);

    let auraSpent=Math.max(0,Number(opts.auraSpent||0));
    let auraDiceReduced=Math.max(0,Number(opts.auraDiceReduced||0));
    let auraDicePerPoint=Math.max(1,Number(opts.auraDicePerPoint||1));
    if(opts.skipAuraPrompt){
      dice=Math.max(0,dice-auraDiceReduced);
    }else if(dice>0){
      auraDicePerPoint=matchingElementResistance?2:1;
      const aura=await promptDefensiveAura(targetActor,dice,{dicePerPoint:auraDicePerPoint});
      if(aura===null)return null;
      auraSpent=aura.points;auraDiceReduced=aura.reducedDice;dice=aura.remainingDice;
    }

    const resolution={
      isSpell,damageDice:Number(opts.damageDice||0),penetration:Number(opts.penetration||0),applyProne:Boolean(opts.applyProne),
      auraSpent,auraDiceReduced,auraDicePerPoint,skipAuraPrompt:true
    };
    if(dice<=0){
      const wounds=targetActor.usesHP?0:capWoundsPerHit(Number(attackResult.sequenceEffect?.extraWound||0),Number(targetActor.system.npc?.singleHitWoundCap||0));
      const lwBonus=this.effectiveTalents.some(i=>i.name.toLowerCase()==="śmiertelny cios")?10:0;
      await this.#postDamage(targetActor,weapon,location,0,0,{armor,originalArmor,armorDiceRemoved,overflow,resistanceReduction:0,flatReduction:0,dice:0,attackDice,diceAfterArmor,diceBeforeAura,auraSpent,auraDiceReduced,auraDicePerPoint,rollsRaw:[],rolls:[]},attackResult,wounds,lwBonus,maneuver,resolution);
      return {damage:0,wounds,location,dice:0,auraSpent,auraDiceReduced};
    }
    const raw=rollDice(`${dice}k10`);
    const armorIgnore=attackResult.sequenceEffect?.ignoreArmor?0:computeIgnoreLowAtLocation(targetActor.activeArmor,location,targetActor);
    const deadlyRolls=raw.rolls.map((v,idx)=>idx<forcedMax?10:v);
    const ignored=applyIgnoreLow(deadlyRolls,armorIgnore);
    const rangedLike=Boolean(weapon.system.isRanged||weapon.system.reload);
    const talentFlat=Number(this.system.derived[rangedLike?"flatRanged":"flatMelee"]||0)+(rangedLike&&weapon.system.damageStat==="sf"?tens(this.system.stats.sf):0);
    const rawTotal=ignored.reduce((a,b)=>a+b,0)+mode.flat+overflow+talentFlat;
    const resType=isSpell?weapon.system.damageType:(mode.magical?'magical':weapon.system.damageType||'physical');
    const resReduction=0; // Resistance contributes to thresholds, never subtracts damage (including HP actors).
    const flatReduction=0; // Legacy flat resistance fields are preserved in saved data, not applied.
    const finalDamage=Math.max(0,rawTotal-resReduction-flatReduction);
    const uncappedWounds=targetActor.usesHP?0:thresholdWounds(finalDamage,effectiveThresholds(targetActor,resType,{ignoreResistanceBonus:holyFlameIgnoresResistance(this,targetActor,weapon,{isSpell})}));
    const woundCap=targetActor.usesHP?0:Number(targetActor.system.npc?.singleHitWoundCap||0);
    const wounds=targetActor.usesHP?0:capWoundsPerHit(uncappedWounds+Number(attackResult.sequenceEffect?.extraWound||0),woundCap);
    const deathBlow=this.effectiveTalents.find(i=>i.name.toLowerCase()==="śmiertelny cios");
    const lwBonus=deathBlow?10:0;
    await this.#postDamage(targetActor,weapon,location,rawTotal,finalDamage,{armor,originalArmor,armorDiceRemoved,overflow,resistanceReduction:resReduction,flatReduction,dice,attackDice,diceAfterArmor,diceBeforeAura,auraSpent,auraDiceReduced,auraDicePerPoint,rollsRaw:raw.rolls,rolls:ignored,armorIgnore,modeFlat:mode.flat,talentFlat,uncappedWounds,woundCap,armorIds:armorDiceRemoved>0?armorContributors(targetActor.activeArmor,location,targetActor):[]},attackResult,wounds,lwBonus,maneuver,resolution);
    return {damage:finalDamage,wounds,location,dice,rolls:ignored,rawRolls:raw.rolls,auraSpent,auraDiceReduced};
  }

  async #postDamage(targetActor,weapon,location,rawDamage,finalDamage,reduction,attackResult,wounds=0,lwBonus=0,maneuver=null,resolution={}){
    const lwProfile=inferWoundProfile(weapon);
    const lwElement=String(weapon?.system?.element||"").trim().toLowerCase();
    const lwSuccessType=attackResult?.criticalSuccess?"crit":attackResult?.bonus?"bonus":"normal";
    const lwAttrs=`data-lw-bonus="${Number(lwBonus||0)}" data-lw-profile="${escapeHtml(lwProfile)}" data-lw-location="${escapeHtml(location)}" data-lw-element="${escapeHtml(lwElement)}" data-lw-success="${escapeHtml(lwSuccessType)}"`;
    const armorButtons=wounds>0&&reduction.armorIds?.length>0?`<div class="gahla-chat-actions gahla-armor-actions"><button type="button" data-action="gahla-save-armor" data-actor="${targetActor.uuid}" data-location="${location}" data-damage="${finalDamage}" data-wounds-to-apply="${Math.max(0,wounds-1)}" ${lwAttrs}>Uszkodź pancerz · −1 Rana</button></div>`:"";
    const maneuverUuid=maneuver?.uuid||"";
    let maneuverState={};try{maneuverState=JSON.parse(maneuver?.system?.builderState||'{}');}catch{}
    const effectKeys=[...(resolution.applyProne||maneuverState.knockdown?['prone']:[]),...(maneuverState.bloody?['bleeding']:[]),...(maneuverState.stun?['stunned']:[])];
    const effectCast={mode:'weapon',target:targetActor.uuid,attacker:this.uuid,state:{extraAspects:Object.fromEntries(effectKeys.map(k=>[k,1]))}};
    const effectButtons=effectKeys.map(key=>'<button type="button" data-action="gahla-spell-condition" data-target="'+targetActor.uuid+'" data-condition="'+key+'">'+CONDITIONS[key].label+' — test odporności</button>').join('');
    const sourceName=maneuver?`${weapon.name} + ${maneuver.name}`:weapon.name;
    const rawRolls=Array.isArray(reduction.rollsRaw)?reduction.rollsRaw:[];
    const effectiveRolls=Array.isArray(reduction.rolls)?reduction.rolls:[];
    const diceHtml=rawRolls.length?rawRolls.map((raw,i)=>{const effective=Number(effectiveRolls[i]??raw);const changed=effective!==Number(raw);return `<span class="gahla-die ${changed?"modified":""}" title="${changed?`Wynik ${raw} został rozliczony jako ${effective}`:`Wynik ${raw}`}">${changed?`<small>${raw}→</small>`:""}<b>${effective}</b></span>`;}).join(""):'<span class="gahla-chat-muted">Brak kości do rzutu</span>';
    const auraPart=Number(reduction.auraDiceReduced||0)>0?`<span class="aura"><small>Aura</small><b>−${reduction.auraDiceReduced}k10</b><em>${reduction.auraSpent} pkt</em></span>`:"";
    const modifierDelta=Number(reduction.diceBeforeAura||0)-Number(reduction.diceAfterArmor||0);
    const modifierPart=modifierDelta?`<span><small>Efekty trafienia</small><b>${modifierDelta>0?"+":""}${modifierDelta}k10</b></span>`:"";
    const pipeline=`<div class="gahla-damage-pipeline"><span><small>Pula ataku</small><b>${Number(reduction.attackDice||0)}k10</b></span><span><small>Pancerz</small><b>−${Number(reduction.armorDiceRemoved||0)}k10</b></span>${modifierPart}${auraPart}<span class="final"><small>Rzut</small><b>${Number(reduction.dice||0)}k10</b></span></div>`;
    const mathBits=[];
    const diceSum=effectiveRolls.reduce((a,b)=>a+Number(b||0),0);
    mathBits.push(`kości ${diceSum}`);
    const flatTotal=Number(reduction.modeFlat||0)+Number(reduction.overflow||0)+Number(reduction.talentFlat||0);
    if(flatTotal)mathBits.push(`stałe +${flatTotal}`);
    if(Number(reduction.resistanceReduction||0))mathBits.push(`odporność −${reduction.resistanceReduction}`);
    if(Number(reduction.flatReduction||0))mathBits.push(`redukcja −${reduction.flatReduction}`);
    const mathLine=mathBits.join(" · ");
    const fateAttrs=weapon?.uuid?`data-action="gahla-fate-damage" data-attacker="${this.uuid}" data-target="${targetActor.uuid}" data-weapon="${weapon.uuid}" data-maneuver="${maneuverUuid}" data-roll="${attackResult.roll||100}" data-location="${location}" data-bonus="${Boolean(attackResult.bonus)}" data-critical="${Boolean(attackResult.criticalSuccess)}" data-damage-dice="${Number(resolution.damageDice||0)}" data-penetration="${Number(resolution.penetration||0)}" data-prone="${Boolean(resolution.applyProne)}" data-aura-spent="${Number(reduction.auraSpent||0)}" data-aura-dice-reduced="${Number(reduction.auraDiceReduced||0)}" data-aura-dice-per-point="${Number(reduction.auraDicePerPoint||1)}"`:"";
    const fateButton=Number(this.system.fate.personal||0)>0&&weapon?.uuid?`<button type="button" ${fateAttrs}>Przerzuć obrażenia · Punkt Losu</button>`:"";
    const woundsText=targetActor.usesHP?`HP: <b>−${finalDamage}</b>`:`Rany z trafienia: <b>${wounds}</b>`;
    const bossCapNote="";
    const html=`<div class="gahla-chat gahla-chat-card gahla-damage-card"><header class="gahla-chat-header"><div><small>OBRAŻENIA</small><h3>${escapeHtml(sourceName)}</h3><p>${escapeHtml(this.name)} → ${escapeHtml(targetActor.name)} · ${escapeHtml(locationLabel(location))}</p></div><span class="gahla-chat-status ${finalDamage>0?"danger":"success"}">${finalDamage} obrażeń</span></header><section class="gahla-chat-section"><h4>1. Ile kości przechodzi?</h4>${pipeline}${Number(reduction.auraSpent||0)>0?`<p class="gahla-aura-spent">Aura obrońcy: wydano <b>${reduction.auraSpent}</b> pkt i usunięto <b>${reduction.auraDiceReduced}k10</b>.</p>`:""}</section><section class="gahla-chat-section"><h4>2. Wyniki kości</h4><div class="gahla-dice-results">${diceHtml}</div></section><section class="gahla-chat-section"><h4>3. Suma i redukcje</h4><div class="gahla-damage-total"><span><small>Suma kości i dodatków</small><b>${rawDamage}</b></span><span><small>Obrażenia</small><b>${finalDamage}</b></span><span><small>${targetActor.usesHP?"HP":"Rany"}</small><b>${targetActor.usesHP?finalDamage:wounds}</b></span></div><p class="gahla-chat-math">${mathLine||"Brak dodatkowych redukcji."}</p>${bossCapNote}</section>${effectButtons}${armorButtons}<div class="gahla-chat-actions gahla-chat-final-actions">${fateButton}<button type="button" class="gahla-chat-primary" data-action="gahla-apply-damage" data-actor="${targetActor.uuid}" data-damage="${finalDamage}" data-wounds="${wounds}" ${lwAttrs} data-source="${escapeHtml(this.name)}: ${escapeHtml(sourceName)}">Zastosuj · ${woundsText}</button></div></div>`;
    await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this}),content:html,flags:{"gahla-resurrected":{effectCast,damage:{attackContext:{aiming:attackResult.aiming,sequenceEffect:attackResult.sequenceEffect},target:targetActor.uuid,amount:finalDamage,wounds,location,armorIds:reduction.armorIds,options:{source:sourceName,lwBonus,lingeringProfile:lwProfile,lingeringLocation:location,lingeringElement:lwElement,successType:lwSuccessType}}}}});
  }

  async applyDamage(damage,{wounds=null,source="",damageType="physical",lwBonus=0,lingeringProfile="none",lingeringLocation="body",lingeringElement="",successType="normal",resolutionId=""}={}){
    if(resolutionId&&this.flags?.["gahla-resurrected"]?.resolvedDamage?.[resolutionId])throw Error("Obrażenia już zastosowane.");
    const resolved=resolutionId?{[`flags.gahla-resurrected.resolvedDamage.${resolutionId}`]:true}:{};
    const amount=Math.max(0,Number(damage||0));
    if(this.usesHP){
      const hp=Math.max(0,Number(this.system.combat.hp.value??0)-amount);
      await this.update({...resolved,"system.combat.hp.value":hp,"system.combat.deadly":hp<=0});
      return {hp,defeated:hp<=0};
    }
    const rawComputed=wounds==null?thresholdWounds(amount,effectiveThresholds(this,damageType)):Number(wounds||0);
    const woundCap=Number(this.system.npc?.singleHitWoundCap||0);
    const computed=capWoundsPerHit(rawComputed,woundCap);
    const total=Math.max(0,Number(this.system.combat.wounds.value||0)+computed);
    const updates={...resolved,"system.combat.wounds.value":total};
    const max=this.type!=="character"?Math.max(1,Number(this.system.combat.wounds.max||this.system.npc?.woundMax||this.system.stats.zyw||1)):Number(this.system.stats.zyw||0);
    if(total>=max && computed>0){ updates["system.combat.deadly"]=true; }
    const previous=Number(this.system.combat.wounds.value||0);
    if(total>max && computed>0 && this.system.options.lingeringWounds){
      const over=total-max;
      const roll=Math.floor(Math.random()*100)+1;
      const normalizedSuccess=["normal","bonus","crit"].includes(String(successType))?String(successType):"normal";
      const successBonus=normalizedSuccess==="crit"?20:normalizedSuccess==="bonus"?10:0;
      const talentBonus=Number(lwBonus||0);
      const score=lingeringWoundScore({roll,woundsOverMax:over,successType:normalizedSuccess})+talentBonus;
      updates["system.combat.lingeringScore"]=score;
      await this.update(updates);
      let resolved=null;
      try{ resolved=await resolveLingeringWound({score,profile:lingeringProfile,location:lingeringLocation,element:lingeringElement}); }
      catch(err){ console.warn("[Gahla] Nie udało się odczytać tabel Trwałych Ran.",err); }
      const injury=resolved?await recordInjury(this,resolved,{location:lingeringLocation,score,source}):null;
      const resolvedBlock=resolved?`<section class="gahla-chat-section gahla-lw-result"><h4>${escapeHtml(resolved.profileLabel||profileLabel(lingeringProfile))}${String(resolved.tableStatus||"ACTIVE").toUpperCase()==="WIP"?' · <span class="gahla-wip-badge">WIP</span>':""}</h4><div class="gahla-lw-range">Przedział tabeli: <b>${escapeHtml(resolved.range||"—")}</b>${resolved.element?` · żywioł: <b>${escapeHtml(resolved.element)}</b>`:` · lokacja: <b>${escapeHtml(locationLabel(lingeringLocation))}</b>`}</div><h3>${escapeHtml(resolved.title||"Trwała Rana")}</h3><p>${escapeHtml(resolved.effect||"")}</p>${resolved.tableNote?`<p class="gahla-lw-note">${escapeHtml(resolved.tableNote)}</p>`:""}</section>`:`<section class="gahla-chat-section"><h4>Skutek</h4><p>Brak dopasowanej tabeli dla tego źródła obrażeń. Wynik LW pozostaje zapisany; MG może rozstrzygnąć skutek ręcznie albo ustawić profil Trwałej Rany na używanej broni.</p></section>`;
      const calculation=[`k100 ${roll}`,`${over} × 10 = ${over*10} za Rany ponad ŻYW`,successBonus?`+${successBonus} za ${normalizedSuccess==="crit"?"krytyczny sukces":"sukces z bonusem"}`:"",talentBonus?`${talentBonus>=0?"+":""}${talentBonus} z talentów/efektów`:""].filter(Boolean).join(" · ");
      const lwHtml=`<div class="gahla-chat gahla-chat-card gahla-lw-card"><header class="gahla-chat-header"><div><small>TRWAŁA RANA</small><h3>${escapeHtml(this.name)}</h3><p>${escapeHtml(source||"Rozliczenie obrażeń")}</p></div><span class="gahla-chat-status danger">LW ${score}</span></header><section class="gahla-chat-section"><h4>Wynik</h4><div class="gahla-chat-kpis"><span><small>k100</small><b>${roll}</b></span><span><small>Rany ponad ŻYW</small><b>${over}</b></span><span><small>Jakość trafienia</small><b>${normalizedSuccess==="crit"?"Krytyk":normalizedSuccess==="bonus"?"Bonus":"Zwykłe"}</b></span><span><small>Wynik LW</small><b>${score}</b></span></div><p class="gahla-chat-math">${escapeHtml(calculation)}</p></section>${resolvedBlock}${injury?`<button type="button" data-action="gahla-injury-apply" data-actor="${this.uuid}" data-injury="${injury.id}">Zastosuj skutki Trwałej Rany</button>`:""}<p class="gahla-chat-explain"><b>Ważne:</b> Trwała Rana została zapisana na karcie. Zastosuj skutek, aby włączyć jej stany, kary i odliczanie Ryzyka Śmierci. Stabilizacja zatrzymuje odliczanie, lecz nie usuwa rany.</p></div>`;
      await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this}),content:lwHtml});
      return {wounds:computed,totalWounds:total,lingeringScore:score,lingeringWound:resolved};
    }
    await this.update(updates);
    return {wounds:computed,totalWounds:total,previous};
  }

  async toggleCondition(key,enabled=null){
    if(!CONDITIONS[key]) return false;
    const statusId=`gahla-${key}`;
    const existing=this.effects.find(e=>e.statuses?.has?.(statusId)||Array.from(e.statuses||[]).includes(statusId));
    if(enabled===true&&existing&&!existing.disabled)return;
    if(enabled===false&&!existing&&!this.hasCondition(key))return;
    if(existing) await existing.delete();
    if((enabled===null&&!existing)||enabled===true) {
      const status=CONFIG.statusEffects?.[statusId];
      await this.createEmbeddedDocuments("ActiveEffect",[{name:CONDITIONS[key].label,img:status?.icon||"icons/svg/aura.svg",statuses:[statusId],changes:[],showIcon:1}]);
    }
    if(key==="shocked"&&enabled!==false&&(this.system.combat.longDebt||this.system.combat.longReady))await this.trackerCancelLong();
    if(key==="stunned")await this.update({"flags.gahla-resurrected.stunConsumed":false,"flags.gahla-resurrected.stunnedRound":Number(game.combat?.round??0),"flags.gahla-resurrected.stunnedCombat":game.combat?.id??""});
    const list=Array.from(this.effects.filter(e=>!e.disabled).flatMap(e=>Array.from(e.statuses||[]))).filter(s=>s.startsWith("gahla-")).map(s=>s.replace(/^gahla-/,""));
    await this.update({"system.conditions":list});
    return list;
  }

  async spendFate(kind="personal"){
    if(kind==="group"){
      const current=Number(game.settings.get("gahla-resurrected","groupFatePool")||0); if(current<=0) return false;
      await game.settings.set("gahla-resurrected","groupFatePool",current-1); return true;
    }
    const current=Number(this.system.fate.personal||0); if(current<=0) return false;
    await this.update({"system.fate.personal":current-1}); return true;
  }
  async recoverFate(amount=1,kind="personal"){
    if(kind==="group"){
      const current=Number(game.settings.get("gahla-resurrected","groupFatePool")||0); await game.settings.set("gahla-resurrected","groupFatePool",Math.max(0,current+Number(amount||0))); return true;
    }
    await this.update({"system.fate.personal":Number(this.system.fate.personal||0)+Number(amount||0)}); return true;
  }
  async spendAura(points=1){ if(!auraAccess(this).allowed)return false; const spend=Math.max(0,Number(points||0)); const cur=Number(this.system.combat.aura.value||0); if(cur<spend)return false; await this.update({"system.combat.aura.value":cur-spend}); return {points:spend}; }
  async longRest(){
    const heal=Math.floor(Math.random()*3)+1; const wounds=Math.max(0,Number(this.system.combat.wounds.value||0)-heal); const aura=auraAccess(this).regenerate?Number(this.system.combat.aura.max||0):Number(this.system.combat.aura.value||0);
    const updates={"system.combat.wounds.value":wounds,"system.combat.aura.value":aura,"system.combat.reactionUsed":false,"system.combat.deadly":wounds>=Number(this.system.combat.wounds.max),"system.combat.lingeringScore":0};
    await this.update(updates);
    for(const item of this.items.filter(i=>i.flags?.['gahla-resurrected']?.pendingAbility)){const draft=item.flags['gahla-resurrected'].pendingAbility;const applyDraft=item.type==='maneuver'?(data)=>saveAuraManeuver119(this,item,data):(data)=>item.update(data,{gahlaPreparation:true});await applyDraft({name:draft.name,system:{...draft.system,prepared:item.system.prepared},'flags.gahla-resurrected.pendingAbility':null,'flags.gahla-resurrected.schoolNeedsReview':false,'flags.gahla-resurrected.illegalElement':false},{gahlaPreparation:true});}
    const planned=this.flags?.['gahla-resurrected']?.preparationPlan;
    if(Array.isArray(planned)){const errors=preparationErrors(this,planned);if(errors.length)ui.notifications.warn(errors.join('; '));else await this.updateEmbeddedDocuments('Item',this.items.filter(i=>['spell','maneuver'].includes(i.type)).map(i=>({_id:i.id,'system.prepared':planned.includes(i.id)})),{gahlaPreparation:true});}
    await resetResources(this,"rest"); return {heal,aura};
  }
  async applyLevelProgression(targetLevel){
    const target=Math.max(1,Number(targetLevel||1)); const old=Number(this.system.appliedLevel||1); if(target<=old)return;
    const experiences=[...(this.system.experiences||[])]; const features=[...(this.system.classFeatures||[])];
    for(const lvl of [3,6,11]){
      if(lvl>old&&lvl<=target){
        experiences.push(`Experience poziomu ${lvl} — wpisz własne doświadczenie`);
        features.push(`Osobny Feature Ścieżki — poziom ${lvl} — ustal z MG na podstawie wydarzeń, relacji i treningu`);
      }
    }
    await this.update({"system.level":target,"system.appliedLevel":target,"system.experiences":experiences,"system.classFeatures":features});
    ui.notifications.info(`Gahla: poziom ${target} zastosowany. Bonusy +ŻYW/+BGŁ wynikają automatycznie z poziomu; SZ rośnie automatycznie na 3/6/11. Special Feature jest wpisywany przez gracza; system zapisuje treść bez wymyślania mechaniki.`);
  }

  async buyTalent(name,targetLevel=1,{teacher=false}={}){
    try{return await purchaseTalent(this,name,targetLevel,teacher);}catch(e){ui.notifications.warn(e.message);return false;}
  }

  async _buyTalentUnchecked(name,targetLevel=1,{teacher=false}={}){
    const def=await import("./rules.mjs").then(m=>m.talentDefinition(name));
    if(!def)return ui.notifications.warn("Gahla: nie znaleziono talentu.");
    const legality=talentErrors(this,def,Number(targetLevel),{purchase:true,teacher});
    if(legality.length)return ui.notifications.warn(legality.join("; "));
    const tier=Number(this.system.derived.tier||1);
    const progression=rankData(def,targetLevel); const maxLevel=Number(def.maxRank??def.maxLevel);
    if(progression.requiredTier>tier)return ui.notifications.warn("Gahla: wymagany wyższy Tier.");
    if(Number(targetLevel)>maxLevel)return ui.notifications.warn(`Gahla: ten talent ma maksymalnie ${maxLevel} poziom${maxLevel===1?"":"y"}.`);
    const existing=this.items.find(i=>i.type==="talent"&&i.name===name);
    if(existing?.system.learned && currentRank(existing,def)>=maxLevel)return ui.notifications.warn(`Gahla: talent osiągnął maksymalny ${maxLevel}. poziom.`);
    if(def.category==="deity" && String(this.system.archetype||"")!=="kaplan") return ui.notifications.warn("Gahla: Talenty Boskie są dostępne wyłącznie dla Kapłanów.");
    if(def.category==="deity" && (!this.system.deity || def.deity!==this.system.deity)) return ui.notifications.warn("Gahla: ten Talent Boski należy do innego bóstwa.");
    if(def.category==="racial" && !talentAllowedForRace(def,String(this.system.species||""))) return ui.notifications.warn(`Gahla: ten talent rasowy nie jest dostępny dla Twojej rasy (${def.requirements}).`);
    if(def.category==="archetype") {
      const accessTier=archetypeTalentTierForActor(def,this);
      if(accessTier<=0) return ui.notifications.warn(`Gahla: ten talent wymaga innego archetypu lub aktywnego mostu archetypów (${def.requirements}).`);
      if(minimumTalentTier(def)>accessTier || progression.requiredTier>accessTier) return ui.notifications.warn(`Gahla: przez obecny archetyp/most możesz kupować ten talent najwyżej do Tieru ${accessTier}.`);
    }
    if(def.category==="special" && !talentAllowedForSpecial(def,this)) return ui.notifications.warn(`Gahla: ten talent specjalny nie jest dostępny dla Twojej Ścieżki Życia (${def.requirements}).`);
    const req=String(def.requirements||"").toLowerCase();
    const tierReqs=[...req.matchAll(/t(?:ier)?\s*(\d)/g)].map(m=>Number(m[1]));
    if(tierReqs.some(t=>tier<t)) return ui.notifications.warn(`Gahla: wymagany jest co najmniej Tier ${Math.max(...tierReqs)}.`);
    // Source-grounded talent prerequisites: enforce only dependencies which explicitly name
    // another known talent in the source requirement string. Free-form/WIP requirements remain descriptive.
    for(const prerequisite of explicitTalentPrerequisites(def)){
      const owned=this.knownTalents.find(i=>i.name.toLowerCase()===prerequisite.name.toLowerCase());
      const level=effectTier(owned);
      if(level<prerequisite.level) return ui.notifications.warn(`Gahla: najpierw wymagany talent: ${prerequisite.name}${prerequisite.level>1?` T${prerequisite.level}`:""}.`);
    }
    const cost=rankCost(def,targetLevel,teacher);
    let monkWeaponType=existing?.system.monkWeaponType??null;
    if(name==="Szkolenie Mnicha"&&!monkWeaponType){monkWeaponType=await promptMonkWeapon();if(!monkWeaponType)return false;}
    if(Number(this.system.xp||0)<cost)return ui.notifications.warn(`Gahla: potrzeba ${cost} EXP.`);
    let artChoice=existing?.flags?.["gahla-resurrected"]?.artChoice??null;
    if(name==="Uzdolnienie Artystyczne"&&!artChoice){artChoice=await promptArt();if(!artChoice)return false;}
    const artFlags=artChoice?{"gahla-resurrected":{...existing?.flags?.["gahla-resurrected"],artChoice}}:{};
    const update={"system.xp":Number(this.system.xp||0)-cost};
    const beforeItems=new Set(this.items.map(i=>i.id)),oldItem=existing?.toObject?.(),oldXP=Number(this.system.xp),historyBefore=existing?itemSnapshot(existing):null;
    try{
    if(existing) await existing.update({flags:artFlags,system:{...existing.system,...progression,monkWeaponType,learned:true,description:def.description,requirements:def.requirements,costXP:cost}});
    else await this.createEmbeddedDocuments("Item",[{name,type:"talent",flags:artFlags,system:{category:def.category,description:def.description,requirements:def.requirements,tier,...progression,monkWeaponType,costXP:cost,learned:true,deity:def.deity||""}}]);
    if(name==="Szkolenie Mnicha" && Number(targetLevel)>=1 && !this.knownTalents.some(i=>i.name==="Walka Wręcz")){
      const meleeDef=await import("./rules.mjs").then(m=>m.talentDefinition("Walka Wręcz"));
      if(meleeDef) await this.createEmbeddedDocuments("Item",[{name:"Walka Wręcz",type:"talent",system:{category:"archetype",description:meleeDef.description,requirements:"Darmowo z talentu Szkolenie Mnicha",tier:1,level:1,maxLevel:Number(meleeDef.maxLevel||4),costXP:0,learned:true,deity:""}}]);
    }
    const changes=this.items.filter(i=>!beforeItems.has(i.id)||i.id===existing?.id).map(i=>({id:i.id,before:i.id===existing?.id?historyBefore:null,after:itemSnapshot(i)}));
    await this.update({...update,...ledgerPatch(this,'purchase',name+' R'+targetLevel+' (T'+progression.effectTier+')',-cost,{rank:targetLevel,costLevel:progression.costLevel,requiredTier:progression.requiredTier,teacher,undo:{before:{},after:{},items:changes}})}); return true;
    }catch(error){
      for(const item of this.items.filter(i=>!beforeItems.has(i.id)))await item.delete();
      if(existing&&oldItem)await existing.update(oldItem);
      if(Number(this.system.xp)!==oldXP)await this.update({"system.xp":oldXP});
      throw error;
    }
  }
}

export class GahlaItem extends Item {
  get dice(){return parseDiceFormula(this.system.damage||"0").count;}
  get displayDamage(){return this.system.damage||"—";}
  async roll({weapon=null,modifier=0,promptModifier=true,target=null,calledShot=false,calledShotLocation="body",asReaction=false,reroll=false,longResolution=false,longAction=false,aimSegments=0,sequence=null,bossPauseEligible=null}={}){
    if(this.type==="talent"&&activeRule(this))return game.gahla.executeTool("talent",this.parent?.uuid,this.id);
    if(this.type==="weapon") return this.parent?.rollAttack?.(target||this.parent.getTokenTargetActor?.(),this,{modifier,promptModifier});
    if(["spell","maneuver"].includes(this.type)&&this.parent&&!this.system.prepared&&!longResolution)return ui.notifications.warn("Zdolność nie jest przygotowana. Zmień plan przygotowania i wykonaj Długi Odpoczynek.");
    if(this.type==="maneuver") {
      const actor=this.parent; if(!actor) return;
      target=target||actor.getTokenTargetActor?.();
      if(!target) return ui.notifications.warn("Gahla: wskaż cel dla manewru.");
      const attackWeapon=weapon||actor.mainWeapon;
      if(!attackWeapon) return ui.notifications.warn("Gahla: wybierz / wyposaż broń, na którą ma zostać nałożony manewr.");
      return actor.rollAttack(target,attackWeapon,{modifier:Number(modifier||0),promptModifier,calledShot,calledShotLocation,maneuver:this,aimSegments,sequence});
    }
    if(this.type==="spell"){
      const actor=this.parent; if(!actor) return;
      if(await consumeStun(actor))return null;
      let live=null;
      if(this.system.builderState){try{const state=JSON.parse(this.system.builderState);if(state.mode==="spell")live=calculateActorAbility(state,actor);}catch(e){return ui.notifications.warn("Uszkodzony zapis kreatora: "+e.message);}}
      if(this.flags?.["gahla-resurrected"]?.schoolNeedsReview||this.flags?.["gahla-resurrected"]?.illegalElement)return ui.notifications.warn("Zdolność wymaga sprawdzenia szkoły / elementu w kreatorze.");
      if(live&&!live.valid)return ui.notifications.warn(live.errors.join("; "));
      if(!live){const source=powerSourceProfile(actor.powerSource,this.system.element);if(source.errors.length)return ui.notifications.warn(source.errors.join('; '));if(['light','shadow'].includes(elementKey(this.system.element))&&spellDamageType(this.system.school||actor.system.archetype)!=='spiritual')return ui.notifications.warn('Światło i Cień są wyłącznie kapłańskie.');}
      const reactionSpell=Array.isArray(this.system.aspects)&&this.system.aspects.some(x=>String(x).includes("Reakcja"));
      if(asReaction && !reactionSpell) return ui.notifications.warn("Gahla: to zaklęcie/cud nie ma aspektu Reakcja.");

      const rollStat=actor.system.archetype==="kaplan"?"wia":(this.system.rollStat||"um");
      const sourceBonus=live?.sourceBonus??powerSourceProfile(actor.powerSource,this.system.element).test;
      const ownBonus=Number(this.system.testBonus||0);
      const magicalRuneAdvantage=actor.items.some(i=>i.system.equipped && Array.isArray(i.system.runes) && i.system.runes.includes("Runa Ułatwienia w testach magicznych/modlitwy"));
      if(promptModifier&&!longResolution){const chosen=await promptManualModifier({title:this.name+' — modyfikator',automatic:sourceBonus+ownBonus+Number(modifier||0)});if(chosen===null)return null;modifier=Number(modifier||0)+Number(chosen);promptModifier=false;}
      const cost=live?.finalCost??Number(this.system.spellCost||this.system.aspectCost||0); const magicTalent=actor.knownTalents.find(i=>i.name.toLowerCase()==="biegłość magiczna"); const magicReduction=magicTalent?Math.max(0,Math.min(3,Number(magicTalent.system.level||1)-1)):0; const minDelay=Math.max(4,Number(this.system.minDelay||minDelayDefault(cost))); const storedDelay=spellStoredDelay(this.system); const baseDelay=live?.op??Math.max(modified(actor,minDelay,"minimumDelay"),storedDelay-magicReduction+Number(actor.system.derived.actionDelayMod||0));
      const combatant=game.combat?.combatants.find(c=>c.actor?.id===actor.id);
      if(asReaction&&!reroll){const rr=await actor.trackerReaction(4);if(!rr?.ok)return null;}
      if(combatant&&!asReaction&&!reroll&&!longResolution){
        if(actor.system.combat.longDebt||actor.system.combat.longReady||actor.system.combat.done)return ui.notifications.warn('Postać nie może teraz rozpocząć akcji.');
        const payable=applyTrackerAction(actor.system.combat,baseDelay,'n');
        if(longAction||!payable.ok){
          const yes=await DialogV2.confirm({window:{title:'Akcja Długa'},content:'<p>Rozpocząć Akcję Długą? Rzut dopiero po opłaceniu '+baseDelay+' OP. Bez Reakcji i Przeniesienia; Szok przerywa. Pozostałe segmenty ostatniej rundy przepadają.</p>'});
          if(!yes)return null;
          await actor.setFlag('gahla-resurrected','pendingSpell',{itemId:this.id,options:{modifier,asReaction:false,bossPauseEligible}});
          const queued=await actor.trackerAction(baseDelay,'l');
          if(!queued.ok)await actor.setFlag('gahla-resurrected','pendingSpell',null);
          return {queued:queued.ok};
        }
        if(!await game.combat.spendSegments(baseDelay,combatant.id,{advance:false}))return null;
      }
      const result=await actor.rollTest(rollStat,{label:`${this.name} – rzucanie`,modifier:sourceBonus+ownBonus+Number(modifier||0),advantage:magicalRuneAdvantage,promptModifier,casting:true});
      if(!result)return null;

      const target=actor.getTokenTargetActor?.();
      let builderData={}; try{builderData=this.system.builderState?JSON.parse(this.system.builderState):{};}catch(_e){}
      const qualityPoints=result.criticalSuccess?4+(live?.sourceCriticalPoints??powerSourceProfile(actor.powerSource).critical):result.bonus?2+(live?.sourcePoints??powerSourceProfile(actor.powerSource).bonus):0;
      let allocation={state:builderData,spent:[],remaining:qualityPoints};
      if(result.success&&qualityPoints&&this.system.builderState)allocation=await allocateSpellQuality(builderData,actor,qualityPoints);
      builderData=allocation.state;
      const sourceDice=live?.sourceDice??powerSourceProfile(actor.powerSource,this.system.element).dice;
      const castSystem={...this.system.toObject?.()??this.system,damageType:spellDamageType(this.system.school||actor.system.archetype),damage:this.system.builderState&&Number(builderData.dmg)>0?builderData.dmg+'k10':this.system.damage,penetration:Number(builderData.pen??this.system.penetration),damageBonusDice:Number(this.system.damageBonusDice||0)+sourceDice};
      const conditionSet=spellConditions(builderData);
      const conditionButtons=result.success&&target?[...conditionSet.keys,...conditionSet.choices].map(key=>'<button type="button" data-action="gahla-spell-condition" data-target="'+target.uuid+'" data-condition="'+key+'">Efekt: '+spellConditionDefinition(key).label+' (osobne rozstrzygnięcie)</button>').join(''):'';
      const dynamicStatDamage=builderData?.statdmg ? Math.floor(Math.abs(Number(actor.system.stats?.[rollStat]||0))/10) : 0;
      const damageButton=result.success&&String(this.system.damage||"").trim()&&target?`<button type="button" data-action="gahla-spell-damage" data-attacker="${actor.uuid}" data-target="${target.uuid}" data-spell="${this.uuid}" data-bonus="${Boolean(result.bonus)}" data-critical="${Boolean(result.criticalSuccess)}" data-roll="${result.roll}" data-statchar="${dynamicStatDamage}">Rzuć obrażenia czaru na cel</button>`:"";
      if(combatant&&!asReaction&&!reroll){
        const offensive=Boolean(bossPauseEligible??isOffensiveSpell(castSystem,builderData));
        await game.combat.completeGahlaAction?.(actor,{bossPauseEligible:offensive});
        if(!longResolution)await game.combat.advanceGahlaTurn({allowRoundAdvance:true});
      }
      const reactionInfo=reactionSpell?`<div class="gahla-note">Aspekt Reakcja: ${asReaction?"rzucono jako reakcję za 4 segmenty":"możesz wybrać rzut jako reakcję w oknie wyboru czaru"}.</div>`:"";
      const spellMessage=await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<div class="gahla-chat"><h3>${foundry.utils.escapeHTML(this.name)} — parametry rzucania</h3><div>Koszt: <b>${cost}</b> · bazowe OP: <b>${baseDelay}</b> · minimum: <b>${minDelay}</b>${asReaction?" · <b>REAKCJA 4</b>":""}</div><div>Bonus Źródła Mocy: +${sourceBonus}; punkty bonusowe Źródła: +${(live?.sourcePoints??Number(actor.powerSource?.system?.sourceBonusPoints||0))}</div>${reactionInfo}<p>Jakość: ${qualityPoints} pkt; ${allocation.spent.join(", ")||"bez wzmocnień"}; niewydane ${allocation.remaining}. OP bez zmian.</p>${damageButton}${conditionButtons}</div>`,flags:{"gahla-resurrected":{spellCast:{system:castSystem,state:builderData,qualityPoints,target:target?.uuid,attacker:actor.uuid}}}});
      if(result?.criticalFailure){
        const tableKey=actor.system.archetype==="kaplan"?"divine":"magic";
        const table=(await import("./content.mjs")).FAILURE_TABLES[tableKey]||[];
        const roll=Math.floor(Math.random()*100)+1; const row=table.find(([min,max])=>roll>=min&&roll<=max);
        if(row) await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<div class="gahla-chat"><h3>PECH — ${row[2]}</h3><div>k100: <b>${roll}</b></div><p>${row[3]}</p></div>`});
      }
      await actor.setFlag?.("gahla-resurrected","lastRoll",{kind:"spell",item:this.uuid,messageId:spellMessage?.id,combatId:game.combat?.id,round:Number(game.combat?.round),options:{modifier,asReaction}});
      return result;
    }
    await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this.parent}),content:`<div class="gahla-chat"><h3>${foundry.utils.escapeHTML(this.name)}</h3><p>${foundry.utils.escapeHTML(this.system.description||"")}</p></div>`});
  }
}

