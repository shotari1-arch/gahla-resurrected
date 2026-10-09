import { effectiveSegments, nextGahlaCombatant, bossPauseActive } from "./tracker-rules.mjs";
import { captureApplicationScroll, restoreApplicationScroll } from "./ui-state.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

function isBoss(actor){ return Boolean(actor?.system?.combat?.trackerBoss || actor?.type === "boss" || actor?.type === "bossPart"); }

export class GahlaInitiativeTracker extends HandlebarsApplicationMixin(ApplicationV2){
  static DEFAULT_OPTIONS={
    classes:["gahla","gahla-tracker"],tag:"form",form:{handler:GahlaInitiativeTracker.#submit,closeOnSubmit:false},position:{width:980,height:820},window:{title:"Gahla Resurrected — Tracker Inicjatywy",icon:"fas fa-stopwatch"},
    actions:{newRound:GahlaInitiativeTracker.#newRound,undo:GahlaInitiativeTracker.#undo,refresh:GahlaInitiativeTracker.#refresh,sync:GahlaInitiativeTracker.#sync,adjustBase:GahlaInitiativeTracker.#adjustBase,toggleBoss:GahlaInitiativeTracker.#toggleBoss,act:GahlaInitiativeTracker.#act,react:GahlaInitiativeTracker.#react,cancelLong:GahlaInitiativeTracker.#cancelLong}
  };
  static PARTS={form:{template:"systems/gahla-resurrected/templates/apps/initiative-tracker.hbs"}};
  constructor(options={}){ super(options); this.undoStack=[]; this.undoLimit=30; }
  async _prepareContext(){
    captureApplicationScroll(this);
    const combat=game.combat;
    if(!combat) return {hasCombat:false,round:0,characters:[]};
    const entries=combat.combatants.contents.filter(c=>c.actor).map(c=>{
      const a=c.actor, s=a.system.combat;
      const current=Number(s.currentSegments||0); const reserved=Number(s.reservedSZ||0);
      const effective=effectiveSegments(s); const initiative=Math.max(0,Number(c.initiative||0));
      return {combatantId:c.id,actorId:a.id,uuid:a.uuid,name:a.name,baseSZ:a.trackerBaseSZ,currentSegments:current,effective,initiative,inSync:initiative===current,zr:Number(a.system.stats.zr||0),isBoss:isBoss(a),reactionLeft:Number(s.reactionLeft||0),reactionMax:Number(s.reactionMax||(isBoss(a)?3:1)),reservedSZ:reserved,normalDebt:Number(s.normalDebt||0),longDebt:Number(s.longDebt||0),longReady:!!s.longReady,transferSegments:Number(s.transferSegments||0),done:Boolean(s.done),justActed:Boolean(s.justActed)};
    }).sort((a,b)=>b.currentSegments-a.currentSegments||b.zr-a.zr||a.name.localeCompare(b.name,"pl"));
    const selected=nextGahlaCombatant(combat.combatants);
    const active=entries.find(e=>e.combatantId===selected?.id);
    for(const e of entries){e.active=Boolean(active&&active.actorId===e.actorId);e.paused=!e.active&&e.currentSegments>0&&bossPauseActive(combat.combatants.get(e.combatantId),combat.combatants);e.costPlaceholder=e.normalDebt>0?String(e.normalDebt):"";}
    return {hasCombat:true,round:Number(combat.round||1),combatName:combat.name||"Walka",characters:entries,combatantCount:entries.length,activeName:active?.name||"—",allInSync:entries.every(e=>e.inSync),canGM:game.user.isGM};
  }
  async _onRender(context,options){ await super._onRender(context,options); restoreApplicationScroll(this); }
    static async #submit(){ /* Tracker uses explicit action buttons. */ }
  #snapshot(){
    const combat=game.combat; if(!combat)return;
    const state={round:Number(combat.round||1),turn:combat.turn,actors:combat.combatants.contents.filter(c=>c.actor).map(c=>({actor:c.actor,combatantId:c.id,combat:c.actor.system.combat?foundry.utils.deepClone(c.actor.system.combat):null,pauseFlags:Object.fromEntries(['bossPauseId','releasedBossPauses','pendingMainAction'].map(k=>[k,foundry.utils.deepClone(c.actor.flags?.['gahla-resurrected']?.[k]??null)]))}))};
    this.undoStack.push(state); if(this.undoStack.length>this.undoLimit)this.undoStack.shift();
  }
  static async #refresh(){ await this.render({force:true}); }
  static async #sync(){ if(game.combat?.syncAllFromActors) await game.combat.syncAllFromActors(); await this.render({force:true}); }
  static async #undo(){
    const snap=this.undoStack.pop(); if(!snap||!game.combat)return ui.notifications.info("Gahla: nie ma czego cofać.");
    for(const row of snap.actors){ if(row.actor?.isOwner&&row.combat) await row.actor.update({"system.combat":row.combat,...Object.fromEntries(Object.entries(row.pauseFlags??{}).map(([k,v])=>['flags.gahla-resurrected.'+k,v]))},{gahlaTrackerSync:true}); }
    await game.combat.syncAllFromActors?.();
    await game.combat.update({round:snap.round,turn:snap.turn});
    await this.render({force:true});
  }
  static async #newRound(_e,_t){const app=this; if(!game.combat)return; app.#snapshot(); await game.combat.nextRound(); await app.render({force:true});}
  static async #adjustBase(_e,t){const actor=await fromUuid(t.dataset.actor); if(!actor)return; this.#snapshot(); await actor.adjustTrackerBaseSZ(Number(t.dataset.amt||0)); await this.render({force:true});}
  static async #toggleBoss(_e,t){const actor=await fromUuid(t.dataset.actor); if(!actor)return; this.#snapshot(); await actor.setTrackerBoss(!isBoss(actor)); await this.render({force:true});}
  static async #act(_e,t){const actor=await fromUuid(t.dataset.actor); if(!actor)return; const input=this.element.querySelector(`#gahla-cost-${CSS.escape(actor.id)}`); const mode=this.element.querySelector(`input[name="gahla-mode-${CSS.escape(actor.id)}"]:checked`)?.value||"n"; const raw=input?.value??""; const cost=Number(raw); if(mode!=="c"&&(!Number.isInteger(cost)||cost<=0))return ui.notifications.warn("Gahla: koszt musi być dodatnią liczbą całkowitą."); this.#snapshot(); const result=await actor.trackerAction(cost,mode,{bossPauseEligible:Boolean(this.element.querySelector(`[name="gahla-offensive-${CSS.escape(actor.id)}"]`)?.checked)}); if(result.ok) await this.render({force:true});}
  static async #react(_e,t){const actor=await fromUuid(t.dataset.actor); if(!actor)return; const input=this.element.querySelector(`#gahla-cost-${CSS.escape(actor.id)}`); const cost=Number(input?.value||0); if(!Number.isInteger(cost)||cost<=0)return ui.notifications.warn("Gahla: koszt reakcji musi być dodatnią liczbą całkowitą."); this.#snapshot(); const result=await actor.trackerReaction(cost); if(result.ok) await this.render({force:true});}
  static async #cancelLong(_e,t){const actor=await fromUuid(t.dataset.actor); if(!actor)return; if(!window.confirm("Przerwać akcję długą? Zainwestowana Szybkość przepada; akcja zostaje przerwana.")) return; this.#snapshot(); const result=await actor.trackerCancelLong(); if(result.ok) await this.render({force:true});}
}
