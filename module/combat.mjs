import {tickInjuries} from './injury-runtime.mjs';
import { applyTrackerAction, nextGahlaCombatant, isBossCombatant, bossPauseKey } from './tracker-rules.mjs';
import { expireRound } from "./automation-runtime.mjs";
function effectiveFromActor(actor){
  const current=Math.max(0,Number(actor?.system?.combat?.currentSegments||0));
  const reserved=Math.max(0,Number(actor?.system?.combat?.reservedSZ||0));
  return current;
}

export class GahlaCombat extends Combat {
  async syncCombatantFromActor(combatant,{advance=false}={}){
    if(!combatant?.actor) return null;
    const initiative=effectiveFromActor(combatant.actor);
    if(Number(combatant.initiative??-1)!==initiative){
      // Public V14 API. setInitiative preserves the currently-active Combatant while
      // the initiative order is re-sorted. The fallback keeps tests/older shims robust.
      if(this.setInitiative) await this.setInitiative(combatant.id,initiative);
      else await this.updateEmbeddedDocuments?.("Combatant",[{_id:combatant.id,initiative}],{gahlaSync:true});
      combatant.initiative=initiative;
    }
    if(advance) await this.advanceGahlaTurn({allowRoundAdvance:false});
    return initiative;
  }

  async syncAllFromActors({advance=false}={}){
    let count=0;
    for(const combatant of this.combatants.contents){
      if(!combatant.actor) continue;
      const initiative=effectiveFromActor(combatant.actor);
      if(Number(combatant.initiative??-1)!==initiative){
        if(this.setInitiative) await this.setInitiative(combatant.id,initiative);
        else await this.updateEmbeddedDocuments?.("Combatant",[{_id:combatant.id,initiative}],{gahlaSync:true});
        combatant.initiative=initiative;
        count++;
      }
    }
    if(advance) await this.advanceGahlaTurn({allowRoundAdvance:false});
    return count;
  }

  async _onEnter(combatant){
    await super._onEnter(combatant);
    // Entering a turn is NOT the start of a Gahla round. Initiative is a spendable
    // pool and re-sorting the Combat can cause Foundry to enter the same Combatant
    // several times during one round. Never restore SZ here; _onStartRound is the
    // single place which replenishes every participant.
    if(combatant?.actor) await this.syncCombatantFromActor(combatant);
  }

  async _onStartRound(context){
    await super._onStartRound(context);
    for(const c of this.combatants){
      if(!c.actor || c.defeated) continue;
      const injuryTick=await tickInjuries(c.actor,this);
      if(injuryTick.dead){await c.update({defeated:true});continue;}
      await expireRound(c.actor,this);
      await c.actor.trackerStartRound?.({sync:false});
    }
    await this.syncAllFromActors();
    await this.advanceGahlaTurn({allowRoundAdvance:false});
  }

  async _onStartTurn(combatant, context){
    await super._onStartTurn(combatant, context);
    // Do not reset or grant any segments here. A Foundry "turn" in Gahla is only
    // the pointer to the creature with the greatest currently-available SZ.
    if(combatant?.actor) await this.syncCombatantFromActor(combatant);
  }

  /**
   * Foundry normally advances one fixed initiative slot per nextTurn() call and
   * starts a new round after the final slot. Gahla is different: initiative is a
   * spendable pool. Recompute the actor with the greatest remaining effective SZ
   * and only start a new round when every non-defeated combatant reaches 0.
   */
  async nextTurn(){
    if(!this.started) return super.nextTurn();
    return this.advanceGahlaTurn({allowRoundAdvance:true});
  }

  async advanceGahlaTurn({allowRoundAdvance=true}={}){
    const eligible=nextGahlaCombatant(this.combatants);
    if(!eligible){
      if(!allowRoundAdvance) return this;
      return super.nextRound();
    }

    // Bosses can have much larger SZ pools. The original tracker deliberately
    // prevents a boss from monopolising successive actions until somebody else
    // acts, while normal combatants simply follow remaining SZ.
    if(eligible.actor.system.combat.longReady){
      await eligible.actor.resolveLongAction();
      return this.advanceGahlaTurn({allowRoundAdvance});
    }
    const idx=this.turns.findIndex(c=>c.id===eligible.id);
    if(idx<0) return this;
    if(Number(this.turn)!==idx) await this.update({turn:idx},{gahlaTurnAdvance:true});
    return this;
  }

  async spendSegments(cost,combatantId=this.combatant?.id,{advance=true}={}){
    const c=this.combatants.get(combatantId); if(!c?.actor)return false;
    const actor=c.actor;
    const n=Math.max(0,Number(cost||0));
    const result=applyTrackerAction(actor.system.combat,n,'n');
    if(!result.ok){ui.notifications.warn(result.error);return false;}
    await actor.update({'system.combat.currentSegments':result.state.currentSegments,'system.combat.transferSegments':0},{gahlaTrackerSync:true});
    await this.syncCombatantFromActor(c);

    if(advance) await this.advanceGahlaTurn({allowRoundAdvance:true});
    return true;
  }

  /** Called on completion of a main action, never by a reaction or raw segment payment. */
  async completeGahlaAction(actor,{bossPauseEligible=false}={}){
    const c=this.combatants.find(c=>c.actor?.id===actor.id);if(!c)return;
    if(isBossCombatant(c)){
      if(bossPauseEligible)await actor.update({'system.combat.justActed':true,'flags.gahla-resurrected.bossPauseId':foundry.utils.randomID()},{gahlaTrackerSync:true});
    }else{
      const paused=Array.from(this.combatants).filter(c=>isBossCombatant(c)&&c.actor.system.combat.justActed);
      // A player can acknowledge pauses on their own Actor without editing an unowned Boss.
      await actor.update({'flags.gahla-resurrected.releasedBossPauses':paused.map(bossPauseKey)},{gahlaTrackerSync:true});
      for(const other of paused)if(game.user?.isGM||other.actor.isOwner)await other.actor.update({'system.combat.justActed':false},{gahlaTrackerSync:true});
    }
  }

  async resetGahlaRound(){ return this.nextRound(); }
}

function getCombatantIdFromElement(li){
  return li?.dataset?.combatantId || li?.closest?.("[data-combatant-id]")?.dataset?.combatantId || "";
}

function applicationRoot(application, element){
  const direct=element?.querySelector?element:null;
  if(direct)return direct;
  const appEl=application?.element;
  if(appEl?.querySelector)return appEl;
  return appEl?.[0]?.querySelector?appEl[0]:null;
}

export function injectGahlaTrackerButton(application, element){
  const CombatTracker=foundry.applications.sidebar?.tabs?.CombatTracker;
  if(!CombatTracker || !(application instanceof CombatTracker))return false;
  const root=applicationRoot(application,element);
  if(!root?.querySelector || root.querySelector("[data-gahla-open-tracker]"))return false;

  const toolbar=document.createElement("div");
  toolbar.className="gahla-combat-tracker-toolbar";
  toolbar.dataset.gahlaOpenTracker="true";
  const button=document.createElement("button");
  button.type="button";
  button.className="gahla-combat-tracker-button";
  button.innerHTML='<i class="fas fa-stopwatch"></i><span>Tracker Gahla</span>';
  button.title="Otwórz pełny Tracker Inicjatywy Gahla";
  button.addEventListener("click",event=>{
    event.preventDefault();
    event.stopPropagation();
    game.gahla?.openTracker?.();
  });
  toolbar.append(button);

  // V14 zmieniało markup sidebara między buildami, więc szukamy kilku stabilnych
  // punktów zaczepienia. Zawsze ma to być tylko pojedynczy przycisk nad listą Encounteru.
  const list=root.querySelector(".combat-tracker, ol.combat-tracker, [data-application-part='combatants'], .directory-list");
  const header=root.querySelector(".combat-tracker-header, .encounter-header, .directory-header, [data-application-part='header']");
  if(list?.parentElement)list.insertAdjacentElement("beforebegin",toolbar);
  else if(header)header.insertAdjacentElement("afterend",toolbar);
  else root.prepend(toolbar);
  return true;
}

export function registerCombatIntegration(){
  // Zostawiamy natywny Encounter czysty, ale przywracamy jedno wygodne wejście
  // do pełnego Trackera Gahla u góry zakładki. Guard w helperze zapobiega duplikatom.
  const renderTrackerButton=(application,element)=>injectGahlaTrackerButton(application,element);
  Hooks.on("renderApplicationV2",renderTrackerButton);
  Hooks.on("renderCombatTracker",renderTrackerButton);

  // Keep Foundry's own tracker visually native. Gahla-specific controls live in
  // the dedicated tracker window; the core encounter still mirrors live SZ.
  Hooks.on("getCombatTrackerEntryContext",(_html,_entries,options)=>{
    for(const cost of [1,2,3]) options.push({
      name:`Gahla: wydaj ${cost} segment${cost===1?"":"y"}`,
      icon:"<i class='fas fa-forward'></i>",
      condition:li=>Boolean(game.combat?.combatants.get(getCombatantIdFromElement(li))),
      callback:li=>game.combat?.spendSegments(cost,getCombatantIdFromElement(li))
    });
  });

  // If the GM edits initiative directly in Foundry, treat it as currently
  // available SZ (current minus reaction reserve), then reflect it to the Actor.
  Hooks.on("updateCombatant",async(combatant,changes,options={})=>{
    if(options.gahlaSync || changes?.initiative===undefined || !combatant?.actor) return;
    const initiative=Math.max(0,Number(changes.initiative||0));
    const reserved=Math.max(0,Number(combatant.actor.system.combat.reservedSZ||0));
    await combatant.actor.update({"system.combat.currentSegments":initiative},{gahlaCombatantSync:true});
    await game.combat?.advanceGahlaTurn?.({allowRoundAdvance:false});
  });

  // Keep native initiative fresh when Gahla segment data changes outside Combat.
  Hooks.on("updateActor",async(actor,changes,options={})=>{
    if(options.gahlaCombatantSync || options.gahlaTrackerSync) return;
    const combatChanges=changes?.system?.combat;
    if(!combatChanges) return;
    if(!["currentSegments","reservedSZ","speedOverride"].some(k=>Object.prototype.hasOwnProperty.call(combatChanges,k))) return;
    const combat=game.combat; if(!combat?.combatants)return;
    const combatant=combat.combatants.find(c=>c.actor?.id===actor.id);
    if(combatant) await combat.syncCombatantFromActor?.(combatant,{advance:false});
  });
}
