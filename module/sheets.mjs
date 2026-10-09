import {fullForm119,formRank119} from './form-canon119.mjs';
import {resolveInfusion119,resolveFormBleeding119} from './talent-infusion119.mjs';
import {tier119} from './talent-values119.mjs';
import {artView,chooseArt,promptArt} from './talent-choices119.mjs';
import {levelView,changeLevel} from './progression118.mjs';
import {monkView,chooseMonkWeapon,promptMonkWeapon,WEAPON_PROFILES} from './monk118.mjs';
import {talentPresentation,canCreateMagic} from "./talent-presentation.mjs";
import {injuriesOf,injuryAction,movementFactor} from './injury-runtime.mjs';
import {chooseShield,reloadWeapon,rollRunecraft,setBodyRune} from './canon-actions.mjs';
import {shieldCovers} from './armor-rules.mjs';
import { ledgerView, awardSessionXP, undoPurchase } from './development-ledger.mjs';
import { handleSpellCondition } from './spell-quality.mjs';
import { auraAccess, effectiveThresholds, DAMAGE_TYPES, spellDamageType } from './canonical-rules.mjs';
import { togglePreparationPlan, configureSource, equipItem } from './canonical-runtime.mjs';
import { handleContextAction, filterContextButtons, handleDamageCard } from "./context-reactions.mjs";
import { buyGrowth } from "./automation-runtime.mjs";
import { growthOffer } from "./automation-rules.mjs";
import { STAT_LABELS, STAT_KEYS, ARCHETYPES, RACES, CONDITIONS } from "./rules.mjs";
import { SPELL_ASPECTS, MANEUVER_ASPECTS, RUNE_TYPES, METALS } from "./content.mjs";
import { TALENT_CATEGORY_ORDER, TALENT_CATEGORY_LABELS } from "./talent-tree-rules.mjs";
import { GahlaCharacterCreator } from "./creator.mjs";
import { maneuverOverlayFromSystem } from "./maneuver-rules.mjs";
import { armorMaterialBonus } from "./armor-rules.mjs";
import { normalizeItemSubmitData, spellStoredDelay } from "./item-data.mjs";
import { captureApplicationScroll, restoreApplicationScroll } from "./ui-state.mjs";
import { WOUND_PROFILE_OPTIONS } from "./lingering-wounds.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
const { DialogV2 } = foundry.applications.api;

function talentCategory(value){
  const key=String(value||"").toLowerCase();
  return TALENT_CATEGORY_LABELS[key] ? key : "special";
}

function groupKnownTalents(list){
  const buckets=new Map(TALENT_CATEGORY_ORDER.map(key=>[key,[]]));
  for(const talent of list){
    const category=talentCategory(talent.category);
    const entry={...talent,category,categoryLabel:TALENT_CATEGORY_LABELS[category],requirements:talent.requirements||"",deity:talent.deity||""};
    buckets.get(category)?.push(entry);
  }
  return TALENT_CATEGORY_ORDER.map(key=>({
    key,label:TALENT_CATEGORY_LABELS[key],count:buckets.get(key)?.length||0,
    talents:(buckets.get(key)||[]).sort((a,b)=>String(a.name).localeCompare(String(b.name),"pl"))
  })).filter(group=>group.count>0);
}


function modifierOptions(selected=0){
  return [-40,-30,-20,-10,0,10,20,30,40].map(v=>`<option value="${v}" ${Number(selected)===v?"selected":""}>${v>0?"+":""}${v}</option>`).join("");
}

function safeOption(value,label,selected=false){
  return `<option value="${foundry.utils.escapeHTML(String(value))}" ${selected?"selected":""}>${foundry.utils.escapeHTML(String(label))}</option>`;
}

export async function promptAttackBonusAllocation(maxPoints){
  const max=Math.max(0,Number(maxPoints||0));
  while(true){
    const fd=await DialogV2.input({
      window:{title:`Rozdziel ${max} pkt bonusu`},
      position:{width:620,height:"auto"},
      content:`<div class="gahla-roll-dialog gahla-bonus-dialog"><div class="gahla-dialog-kpis"><span><small>Dostępne</small><b>${max} pkt</b></span><span><small>Obrażenia</small><b>1 pkt = +1k10</b></span><span><small>Penetracja</small><b>2 pkt = +1</b></span></div><div class="gahla-bonus-fields"><label><span>Dodatkowe kości</span><input type="number" name="damageDice" value="${max}" min="0" max="${max}"><small>1 punkt za każde +1k10</small></label><label><span>Dodatkowa Penetracja</span><input type="number" name="penetration" value="0" min="0" max="${Math.floor(max/2)}"><small>2 punkty za każdy +1 Pen.</small></label><label class="gahla-check-line"><span>Powalenie</span><input type="checkbox" name="prone"><small>koszt 3 pkt</small></label></div><p class="gahla-note">System sprawdzi sumę przed rzutem. Niewydane punkty przepadają dla tego trafienia.</p></div>`,
      ok:{label:"Zatwierdź i przejdź do obrażeń"}
    });
    if(!fd)return null;
    const damageDice=Math.max(0,Math.floor(Number(fd.damageDice||0)));
    const penetration=Math.max(0,Math.floor(Number(fd.penetration||0)));
    const prone=Boolean(fd.prone);
    const spent=damageDice+2*penetration+(prone?3:0);
    if(spent<=max)return {damageDice,penetration,prone,spent,remaining:max-spent};
    ui.notifications.warn(`Gahla: wybrano opcje za ${spent} pkt, ale dostępne jest tylko ${max}.`);
  }
}

function shortText(value,max=900){
  const text=String(value||"").trim()||"Brak opisu.";
  return text.length>max?`${text.slice(0,max-1)}…`:text;
}

function itemChoicePreview(item,{weapon=false}={}){
  if(!item) return `<div class="gahla-choice-empty">Wybierz pozycję z listy.</div>`;
  const esc=foundry.utils.escapeHTML;
  const description=esc(shortText(item.system?.description));
  if(item.type==="spell"){
    const aspects=(item.system?.aspects||[]).slice(0,8).map(x=>`<span>${esc(String(x))}</span>`).join("");
    return `<div class="gahla-choice-card"><div class="gahla-choice-head"><b>${esc(item.name)}</b><span>Koszt ${Number(item.system?.spellCost||0)} · OP ${spellStoredDelay(item.system||{})}</span></div><div class="gahla-choice-meta"><span>Zasięg: ${esc(item.system?.range||"—")}</span><span>Cel: ${esc(item.system?.target||"—")}</span>${item.system?.duration?`<span>Czas: ${esc(item.system.duration)}</span>`:""}</div><p>${description}</p>${aspects?`<div class="gahla-choice-tags">${aspects}</div>`:""}</div>`;
  }
  if(item.type==="maneuver"){
    const mv=maneuverDisplay(item.system||{}); const sign=v=>`${Number(v)>=0?"+":""}${Number(v)}`;
    return `<div class="gahla-choice-card"><div class="gahla-choice-head"><b>${esc(item.name)}</b><span>${sign(mv.damageDiceDelta)}k10 · ${sign(mv.delayDelta)} OP · ${sign(mv.hitMod)} traf.</span></div><div class="gahla-choice-meta"><span>Penetracja +${Number(mv.penetrationBonus||0)}</span>${mv.halfWeaponDice?"<span>+½ kości broni</span>":""}${mv.extraTargets?`<span>+${Number(mv.extraTargets)} cel</span>`:""}</div><p>${description}</p></div>`;
  }
  if(item.type==="weapon"||weapon){
    const traits=(item.system?.traits||[]).slice(0,6).map(x=>`<span>${esc(String(x))}</span>`).join("");
    return `<div class="gahla-choice-card compact"><div class="gahla-choice-head"><b>${esc(item.name)}</b><span>${esc(item.system?.damage||"—")} · OP ${Number(item.system?.delay||0)}</span></div><div class="gahla-choice-meta"><span>Pen. ${Number(item.system?.penetration||0)}</span><span>${Number(item.system?.hands||1)} ręka/ręce</span></div>${traits?`<div class="gahla-choice-tags">${traits}</div>`:""}</div>`;
  }
  return `<div class="gahla-choice-card"><div class="gahla-choice-head"><b>${esc(item.name)}</b></div><p>${description}</p></div>`;
}

function dialogRoot(dialog){ return (typeof HTMLElement!=="undefined" && dialog?.element instanceof HTMLElement) ? dialog.element : dialog?.element?.[0] || dialog?.element; }


export async function openAttackAction(actor){
  if(!actor) return ui.notifications.warn("Gahla: brak Aktora do wykonania ataku.");
  const target=actor.getTokenTargetActor?.();
  if(!target) return ui.notifications.warn("Gahla: wskaż cel przed atakiem.");
  const weapons=actor.items.filter(i=>i.type==="weapon"&&i.system.equipped);
  if(!weapons.length) return ui.notifications.warn("Gahla: brak wyposażonej broni.");
  const maneuvers=actor.items.filter(i=>i.type==="maneuver"&&i.system.prepared);
  const content=`<div class="gahla-roll-dialog gahla-action-dialog gahla-attack-dialog">
    <div class="gahla-dialog-section">
      <label>Broń <select name="weaponId">${weapons.map((w,i)=>safeOption(w.id,`${w.name} — ${w.system.damage||"—"}, OP ${Number(w.system.delay||0)}`,i===0)).join("")}</select></label>
      <div data-preview="weapon"></div>
    </div>
    <div class="gahla-dialog-section">
      <label>Manewr <select name="maneuverId"><option value="">— zwykły atak —</option>${maneuvers.map(m=>safeOption(m.id,m.name)).join("")}</select></label>
      <div data-preview="maneuver"><div class="gahla-choice-empty">Zwykły atak — bez nakładki manewru.</div></div>
    </div>
    <div class="gahla-dialog-section gahla-dialog-options">
      <label>Przycelowanie (do ${tier119(actor,"Celny Strzał")?6:4} segmentów, tylko dystans)<input name="aimSegments" type="number" min="0" max="${tier119(actor,"Celny Strzał")?6:4}" value="0"></label>
      <details class="gahla-sequence-options"><summary>Sekwencja — kolejne manewry i talent</summary><label>Manewr Sekwencji (0 = poza Sekwencją)<input name="sequenceIndex" type="number" min="0" max="4" value="0"></label><label>Długość Sekwencji<input name="sequenceLength" type="number" min="1" max="4" value="4"></label><label><input name="sequenceIgnore" type="checkbox"> Kontrolowana Sekwencja T3: bez kary celowania (raz, nie pierwszy manewr)</label><label><input name="promoteSequenceBonus" type="checkbox"> Mistrz Sekwencji T4: awans trafienia do Bonusu (raz, nie pierwszy Manewr)</label><label>T4: czwarty manewr<select name="finisher"><option value="">Bez efektu</option><option value="armor">Ignoruj Pancerz</option><option value="wound">+1 Rana</option></select></label><p class="gahla-note">Zacznij od 1; kolejne numery muszą następować po sobie. Numer 0 kończy Sekwencję. Pominięcie kary celowania jest dostępne raz na Sekwencję.</p></details>
      <label>Modyfikator rzutu <select name="modifier">${modifierOptions(0)}</select></label>
      <label class="gahla-check-line"><span>Atak celowany −30</span><input type="checkbox" name="calledShot"></label>
      <label data-called-location hidden>Lokacja <select name="calledShotLocation">${ARMOR_LOCATIONS.map(loc=>safeOption(loc.key,loc.label,loc.key==="body")).join("")}</select></label>
      <p class="gahla-note">Najpierw wybierz broń, potem opcjonalną nakładkę manewru. Podgląd pokazuje obie składowe przed rzutem.</p>
    </div>
  </div>`;
  const fd=await DialogV2.input({window:{title:`Atak → ${target.name}`},position:{width:780,height:"auto"},content,render:(_event,dialog)=>{
    const root=dialogRoot(dialog);if(!root)return;
    const weaponSel=root.querySelector('[name="weaponId"]'),maneuverSel=root.querySelector('[name="maneuverId"]'),wp=root.querySelector('[data-preview="weapon"]'),mp=root.querySelector('[data-preview="maneuver"]'),shot=root.querySelector('[name="calledShot"]'),loc=root.querySelector('[data-called-location]');
    const update=()=>{const w=actor.items.get(String(weaponSel?.value||""));const m=actor.items.get(String(maneuverSel?.value||""));if(w&&wp)wp.innerHTML=itemChoicePreview(w,{weapon:true});if(mp)mp.innerHTML=m?itemChoicePreview(m):'<div class="gahla-choice-empty">Zwykły atak — bez nakładki manewru.</div>';if(loc)loc.hidden=!Boolean(shot?.checked);};
    weaponSel?.addEventListener("change",update);maneuverSel?.addEventListener("change",update);shot?.addEventListener("change",update);update();
  },ok:{label:"Rzuć atak"}});
  if(!fd) return;
  const weapon=actor.items.get(String(fd.weaponId||""));
  if(!weapon) return ui.notifications.warn("Gahla: nie wybrano poprawnej broni.");
  const modifier=Math.max(-40,Math.min(40,Number(fd.modifier||0)));
  const maneuver=fd.maneuverId?actor.items.get(String(fd.maneuverId)):null;
  const attackOptions={promoteSequenceBonus:Boolean(fd.promoteSequenceBonus),aimSegments:Number(fd.aimSegments||0),sequence:Number(fd.sequenceIndex)?{index:Number(fd.sequenceIndex),length:Number(fd.sequenceLength),ignoreCalled:Boolean(fd.sequenceIgnore),finisher:String(fd.finisher||"")}:null,modifier,promptModifier:false,calledShot:Boolean(fd.calledShot),calledShotLocation:String(fd.calledShotLocation||"body")};
  if(maneuver) return maneuver.roll({weapon,target,...attackOptions});
  return actor.rollAttack(target,weapon,attackOptions);
}

export async function openSpellAction(actor){
  if(!actor) return ui.notifications.warn("Gahla: brak Aktora do rzucenia zaklęcia.");
  const spells=actor.items.filter(i=>i.type==="spell"&&i.system.prepared);
  if(!spells.length) return ui.notifications.warn(`Gahla: brak przygotowanych ${actor.system.archetype==="kaplan"?"cudów":actor.system.archetype==="polmag"?"zaklęć":"zaklęć/cudów"}.`);
  const content=`<div class="gahla-roll-dialog gahla-action-dialog gahla-spell-dialog">
    <div class="gahla-dialog-section">
      <label>${actor.system.archetype==="kaplan"?"Cud":actor.system.archetype==="polmag"?"Zaklęcie":"Zaklęcie / cud"} <select name="spellId">${spells.map((sp,i)=>safeOption(sp.id,sp.name,i===0)).join("")}</select></label>
      <div data-preview="spell"></div>
    </div>
    <div class="gahla-dialog-section gahla-dialog-options">
      <label>Modyfikator rzutu <select name="modifier">${modifierOptions(0)}</select></label>
      <label class="gahla-check-line" data-reaction-cast hidden><span>Rzuć jako reakcję (4 segmenty)</span><input type="checkbox" name="asReaction"></label>
      <p class="gahla-note">Podgląd pokazuje zapisany opis i parametry wybranej zdolności. Rzut jako reakcję jest dostępny tylko dla zdolności z aspektem Reakcja.</p>
    </div>
  </div>`;
  const fd=await DialogV2.input({window:{title:actor.system.archetype==="kaplan"?"Rzuć cud":"Rzuć zaklęcie"},position:{width:760,height:"auto"},content,render:(_event,dialog)=>{
    const root=dialogRoot(dialog);if(!root)return;
    const select=root.querySelector('[name="spellId"]'),preview=root.querySelector('[data-preview="spell"]'),reactionLine=root.querySelector('[data-reaction-cast]'),reactionInput=root.querySelector('[name="asReaction"]');
    const update=()=>{const spell=actor.items.get(String(select?.value||""));if(preview)preview.innerHTML=itemChoicePreview(spell);const canReact=Boolean(spell?.system?.aspects?.some?.(x=>String(x).includes("Reakcja")));if(reactionLine)reactionLine.hidden=!canReact;if(!canReact&&reactionInput)reactionInput.checked=false;};
    select?.addEventListener("change",update);update();
  },ok:{label:"Rzuć"}});
  if(!fd) return;
  const spell=actor.items.get(String(fd.spellId||""));
  if(!spell) return;
  const modifier=Math.max(-40,Math.min(40,Number(fd.modifier||0)));
  return spell.roll({modifier,promptModifier:false,asReaction:Boolean(fd.asReaction)});
}

export async function executeGahlaActorAction(actorUuid,action){
  let actor=null;
  try{ actor=actorUuid?await fromUuid(actorUuid):null; }catch(_err){}
  actor=actor?.actor ?? actor ?? canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
  if(!actor) return ui.notifications.warn("Gahla: makro nie znalazło Aktora. Zaznacz token albo przypisz postać użytkownikowi.");
  if(action==="attack") return openAttackAction(actor);
  if(action==="spell") return openSpellAction(actor);
  if(action==="tracker") return game.gahla?.openTracker?.();
  return ui.notifications.warn(`Gahla: nieznana akcja makra „${action}”.`);
}

export function registerHotbarActions(){
  Hooks.on("hotbarDrop",async(_hotbar,data,slot)=>{
    if(data?.type!=="GahlaAction") return;
    const actorUuid=String(data.actorUuid||"");
    const action=String(data.action||"");
    if(!["attack","spell","tracker"].includes(action)) return false;
    const label=String(data.label||({attack:"Atak / manewr",spell:"Zaklęcie / cud",tracker:"Tracker"}[action]||action));
    const command=`await game.gahla.executeAction(${JSON.stringify(actorUuid)}, ${JSON.stringify(action)});`;
    let macro=game.macros.find(m=>m.getFlag?.("gahla-resurrected","actorUuid")===actorUuid && m.getFlag?.("gahla-resurrected","action")===action);
    if(!macro){
      macro=await Macro.create({
        name:label,
        type:"script",
        command,
        img:action==="attack"?"icons/svg/sword.svg":action==="spell"?"icons/svg/book.svg":"icons/svg/clockwork.svg",
        flags:{"gahla-resurrected":{actorUuid,action}}
      });
    }
    if(macro) await game.user.assignHotbarMacro(macro,slot);
    return false;
  });
}

const ARMOR_LOCATIONS=[
  {key:"head",label:"Głowa"},{key:"leftArm",label:"Lewa ręka"},{key:"rightArm",label:"Prawa ręka"},
  {key:"body",label:"Korpus"},{key:"leftLeg",label:"Lewa noga"},{key:"rightLeg",label:"Prawa noga"}
];

function maneuverDisplay(system={}){ return maneuverOverlayFromSystem(system); }

function itemView(i){
  const materialBonus=armorMaterialBonus(i);
  const armorRuneBonus=(i.system?.runes||[]).includes?.("Runa Pancerza") ? 1 : 0;
  const armorLocations=ARMOR_LOCATIONS.map(loc=>{
    let value=Number(i.system?.isShield?(shieldCovers(i,loc.key)?i.system?.armor||0:0):i.system?.locations?.[loc.key]||0);
    if(value>0) value+=materialBonus;
    if(armorRuneBonus && i.system?.runeArmorLocation===loc.key) value+=1;
    return {key:loc.key,label:loc.label,value};
  }).filter(x=>x.value>0);
  const maneuver=maneuverDisplay(i.system||{});
  return {
    id:i.id,name:i.name,type:i.type,
    typeLabel:{weapon:"Broń",armor:"Pancerz",talent:"Talent",spell:"Zaklęcie / cud",maneuver:"Manewr",rune:"Runa",powerSource:"Źródło Mocy",equipment:"Ekwipunek"}[i.type]||i.type,
    equipped:Boolean(i.system?.equipped),prepared:Boolean(i.system?.prepared),learned:Boolean(i.system?.learned),
    level:Number(i.system?.level||0),tier:Number(i.system?.tier||0),damage:i.system?.damage||"",delay:i.type==="spell"?spellStoredDelay(i.system||{}):Number(i.system?.delay||0),
    description:i.system?.description||"",maneuverHitMod:Number(maneuver.hitMod||0),spellCost:Number(i.system?.spellCost||0),
    isRanged:Boolean(i.system?.isRanged||i.system?.reload),isRune:i.type==="rune",armor:Number(i.system?.armor||0),element:i.system?.element||"",isShield:Boolean(i.system?.isShield),shieldLocation:i.system?.shieldLocation||"",ignoreLow:Number(i.system?.ignoreLow||0),
    armorLocations,maneuverDamageDiceDelta:maneuver.damageDiceDelta,maneuverDelayDelta:maneuver.delayDelta,maneuverPenetrationBonus:maneuver.penetrationBonus,
    maneuverHalfWeaponDice:maneuver.halfWeaponDice,maneuverExtraTargets:maneuver.extraTargets,maneuverReferenceWeapon:i.system?.maneuverWeapon||"",
    maneuverDamageText:`${Number(maneuver.damageDiceDelta)>=0?"+":""}${Number(maneuver.damageDiceDelta)}k10`,
    maneuverDelayText:`${Number(maneuver.delayDelta)>=0?"+":""}${Number(maneuver.delayDelta)} OP`,
    maneuverHitText:`${Number(maneuver.hitMod)>=0?"+":""}${Number(maneuver.hitMod)} traf.`,
    maneuverPenText:`+${Number(maneuver.penetrationBonus||0)} Pen.`
  };
}

export class GahlaActorSheet extends HandlebarsApplicationMixin(ActorSheetV2){
  static DEFAULT_OPTIONS={
    classes:["gahla","sheet","actor"],tag:"form",position:{width:1160,height:880},
    form:{submitOnChange:true,closeOnSubmit:false},window:{icon:"fas fa-dice-d20",title:"Gahla Resurrected"},
    actions:{
      chooseArt:GahlaActorSheet.#chooseArt,changeLevel:GahlaActorSheet.#changeLevel,chooseMonk:GahlaActorSheet.#chooseMonk,sheetTool:GahlaActorSheet.#sheetTool,useActiveTalent:GahlaActorSheet.#useActiveTalent,toggleDarkness:GahlaActorSheet.#toggleDarkness,
      rollStat:GahlaActorSheet.#rollStat,rollDerived:GahlaActorSheet.#rollDerived,spendFate:GahlaActorSheet.#spendFate,adjustFate:GahlaActorSheet.#adjustFate,
      injury:GahlaActorSheet.#injury,reload:GahlaActorSheet.#reload,runecraft:GahlaActorSheet.#runecraft,bodyRune:GahlaActorSheet.#bodyRune,awardSessionXP:GahlaActorSheet.#awardSessionXP,undoPurchase:GahlaActorSheet.#undoPurchase,longRest:GahlaActorSheet.#longRest,levelUp:GahlaActorSheet.#levelUp,addExperience:GahlaActorSheet.#addExperience,addFeature:GahlaActorSheet.#addFeature,
      removeExperience:GahlaActorSheet.#removeExperience,removeFeature:GahlaActorSheet.#removeFeature,
      rollExperience:GahlaActorSheet.#rollExperience,itemRoll:GahlaActorSheet.#itemRoll,openItem:GahlaActorSheet.#openItem,
      removeItem:GahlaActorSheet.#removeItem,toggleEquip:GahlaActorSheet.#toggleEquip,togglePrepared:GahlaActorSheet.#togglePrepared,
      toggleCondition:GahlaActorSheet.#toggleCondition,openCreator:GahlaActorSheet.#openCreator,openAbilityBuilder:GahlaActorSheet.#openAbilityBuilder,
      openTracker:GahlaActorSheet.#openTracker,openTalentTree:GahlaActorSheet.#openTalentTree,spendXp:GahlaActorSheet.#spendXp,attack:GahlaActorSheet.#attack,castSpell:GahlaActorSheet.#castSpell,
      editAbility:GahlaActorSheet.#editAbility,useManeuver:GahlaActorSheet.#useManeuver,moveShield:GahlaActorSheet.#moveShield,npcBasicAttack:GahlaActorSheet.#npcBasicAttack
    }
  };
  static PARTS={form:{template:"systems/gahla-resurrected/templates/actor/character-sheet.hbs"}};

  async _prepareContext(options){
    captureApplicationScroll(this);
    const context=await super._prepareContext(options);
    const actor=this.actor ?? this.document;
    if(!actor) throw new Error("GahlaActorSheet: brak dokumentu Actor.");
    const system=actor.system ?? {};
    const isNPC=actor.type!=="character";
    const isMinion=actor.type==="minion";
    const usesHP=actor.type==="minion"||actor.type==="standard";
    const npcTypeLabel={minion:"Płotka",standard:"Żołnierz",elite:"Elita",boss:"Boss",bossPart:"Część Bossa"}[actor.type]||"Przeciwnik";
    const statData=system.stats ?? {}, base=system.base ?? {};
    const baseRace=base.race ?? {}, basePath=base.lifePath ?? {}, baseRolls=base.rolls ?? {}, baseGrowth=base.growth ?? {}, upgradeCounts=base.statUpgradeCounts ?? {};
    const stats=STAT_KEYS.map(key=>({
      key,label:STAT_LABELS[key],value:Number(statData[key]??0),race:Number(baseRace[key]??0),path:Number(basePath[key]??0),
      roll:Number(baseRolls[key]??0),growth:Number(baseGrowth[key]??0),upgrades:Number(upgradeCounts[key]??0)
    }));
    const hasCreationBase=Boolean(system.lifePath) && Object.values(baseRolls).some(v=>Number(v)!==0);
    const creationComplete=isNPC || Boolean(system.creation?.completed || hasCreationBase);
    const actorItems=Array.from(actor.items?.contents ?? actor.items ?? []);
    const knownTalents=Array.from(actor.knownTalents ?? actorItems.filter(i=>i.type==="talent"&&i.system?.learned));
    const talents=knownTalents.map(i=>({...talentPresentation(actor,i),id:i.id,name:i.name,level:Number(i.system?.level||1),tier:Number(i.system?.tier||1),category:i.system?.category,description:i.system?.description||"",requirements:i.system?.requirements||"",deity:i.system?.deity||""}));
    const talentGroups=groupKnownTalents(talents);
    const conditionKeys=Array.isArray(system.conditions)?system.conditions:[];
    const conditions=Object.entries(CONDITIONS).map(([key,v])=>({key,...v,active:Boolean(actor.statuses?.has?.(`gahla-${key}`)||conditionKeys.includes(key))}));

    const mapped=actorItems.map(itemView);
    const weapons=mapped.filter(i=>i.type==="weapon");
    const armors=mapped.filter(i=>i.type==="armor");
    const powerSources=mapped.filter(i=>i.type==="powerSource");
    const otherEquipment=mapped.filter(i=>["equipment","rune"].includes(i.type));
    const maneuvers=mapped.filter(i=>i.type==="maneuver");
    const spells=mapped.filter(i=>i.type==="spell");
    const preparedManeuvers=maneuvers.filter(i=>i.prepared);
    const preparedSpells=system.archetype==="polmag"?spells.filter(i=>i.prepared):[];
    const preparedMiracles=system.archetype==="kaplan"?spells.filter(i=>i.prepared):[];
    const armorLocations=ARMOR_LOCATIONS.map(loc=>({key:loc.key,label:loc.label,value:Number(system.derived?.armor?.[loc.key]||0)}));
    const woundTwo=Math.max(1,Number(system.derived?.woundTwo||1)), woundThree=Math.max(woundTwo,Number(system.derived?.woundThree||woundTwo));
    const fiveStart=woundThree*2;
    const woundBands=Object.keys(DAMAGE_TYPES).map(type=>{const t=effectiveThresholds(actor,type);return {...t,key:type,range:'I: '+t.one+' · II: '+t.two,threshold:t.one+' / '+t.two};});
    let groupFate=0;
    try{groupFate=Number(game.settings.get("gahla-resurrected","groupFatePool")||0);}catch(e){console.warn("[Gahla] Nie można odczytać groupFatePool.",e);}
    return {
      ...context,art:artView(actor),levelProgress:levelView(actor),monk:monkView(actor),canCreateMagic:canCreateMagic(actor),hasActiveTalents:talents.some(t=>t.active),creatureOfDarkness:Boolean(actor.flags?.["gahla-resurrected"]?.creatureOfDarkness),movementFactor:movementFactor(actor),dead:Boolean(actor.flags?.["gahla-resurrected"]?.dead),injuries:injuriesOf(actor).map(i=>({...i,locationLabel:ARMOR_LOCATIONS.find(l=>l.key===i.location)?.label??i.location})),developmentLedger:ledgerView(actor),auraAccess:auraAccess(actor),isGM:game.user.isGM,document:actor,actor,system,stats,talents,talentGroups,conditions,classFeatures:system.classFeatures||[],groupFate,
      archetypeLabel:ARCHETYPES[system.archetype]?.label||system.archetype||"Postać",speciesLabel:RACES[system.species]?.label||system.species||"—",editable:this.isEditable,creatorLabel:"Kreator postaci",creationComplete,isNPC,isMinion,usesHP,npcTypeLabel,
      preparationPlanNames:(actor.flags?.["gahla-resurrected"]?.preparationPlan??actor.items.filter(i=>i.system.prepared).map(i=>i.id)).map(id=>actor.items.get(id)?.name).filter(Boolean).join(", "),weapons,armors,powerSources,otherEquipment,maneuvers,spells,preparedManeuvers,preparedSpells,preparedMiracles,armorLocations,woundBands,
      equippedWeapons:weapons.filter(i=>i.equipped),hasPreparedMagic:(preparedSpells.length+preparedMiracles.length)>0,
      hasMagicAction:Boolean(spells.length || system.archetype==="polmag" || system.archetype==="kaplan"),
      preparedMagic:spells.filter(i=>i.prepared),
      isMage:system.archetype==="polmag",isCleric:system.archetype==="kaplan",talentCount:talents.length
    };
  }

  async _onRender(context,options){
    await super._onRender(context,options);
    const root=this.element;
    const filter=key=>{this._talentFilter=key;root.querySelectorAll('[data-sheet-talent]').forEach(card=>{card.hidden=key==='active'?!card.dataset.activeTalent.includes('true'):key==='passive'?card.dataset.activeTalent==='true':key!=='all'&&card.dataset.category!==key;});root.querySelectorAll('[data-talent-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.talentFilter===key)));};
    root.querySelectorAll('[data-talent-filter]').forEach(b=>b.addEventListener('click',()=>filter(b.dataset.talentFilter)));filter(this._talentFilter??'all');
    root.querySelectorAll('[data-sheet-tool]').forEach(b=>{b.draggable=true;b.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',JSON.stringify({type:'GahlaTool',action:b.dataset.sheetTool,actorUuid:this.actor.uuid,label:b.textContent.trim()})));});
    root.querySelectorAll('[data-action="useActiveTalent"]').forEach(b=>{b.draggable=true;b.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',JSON.stringify({type:'GahlaTool',action:'talent',actorUuid:this.actor.uuid,itemId:b.dataset.itemId,label:this.actor.items.get(b.dataset.itemId)?.name??b.textContent.trim()})));});
    for(const [selector,key]of [['[data-session-name]','label'],['[data-session-xp]','amount']]){
      const input=root.querySelector(selector);if(!input)continue;
      if(this._xpDraft?.[key]!==undefined)input.value=this._xpDraft[key];
      input.addEventListener('input',()=>{this._xpDraft??={};this._xpDraft[key]=input.value;});
      input.addEventListener('change',event=>event.stopPropagation());
    }
    const nav=[...root.querySelectorAll("[data-gahla-tab]")], panels=[...root.querySelectorAll(".gahla-tab-content")];
    const activate=tab=>{
      panels.forEach(p=>p.classList.toggle("active",p.dataset.tab===tab));
      nav.forEach(b=>b.classList.toggle("active",b.dataset.gahlaTab===tab));
      root.dataset.activeTab=tab;
      this._activeTab=tab;
    };
    nav.forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();activate(btn.dataset.gahlaTab);}));
    root.querySelectorAll("[data-edit-array]").forEach(input=>input.addEventListener("change",async()=>{
      const collection=input.dataset.editArray;
      const index=Number(input.dataset.index);
      if(!["experiences","classFeatures"].includes(collection) || !Number.isInteger(index)) return;
      const values=[...(this.actor.system?.[collection]||[])];
      if(index<0 || index>=values.length) return;
      values[index]=String(input.value||"").trim();
      await this.actor.update({[`system.${collection}`]:values});
    }));
    root.querySelectorAll("[data-gahla-macro-action]").forEach(button=>{
      button.setAttribute("draggable","true");
      button.addEventListener("dragstart",event=>{
        const action=button.dataset.gahlaMacroAction;
        if(!action||!event.dataTransfer)return;
        const label=button.dataset.gahlaMacroLabel||`${this.actor.name} — ${action==="attack"?"Atak / manewr":action==="spell"?"Zaklęcie / cud":"Gahla"}`;
        event.dataTransfer.setData("text/plain",JSON.stringify({type:"GahlaAction",actorUuid:this.actor.uuid,action,label}));
        event.dataTransfer.effectAllowed="copy";
      });
    });
    activate(this._activeTab||root.dataset.activeTab||"character");
    if(this._focusDevelopment){const input=[...root.querySelectorAll('[data-edit-array="'+this._focusDevelopment+'"]')].at(-1);requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{input?.scrollIntoView({block:"center"});input?.focus();})));this._focusDevelopment=null;}
    restoreApplicationScroll(this);
  }

  static async #changeLevel(_e,t){
 captureApplicationScroll(this);
 try{await changeLevel(this.actor,Number(t.dataset.delta),{confirm:({old,next,tierDrop})=>DialogV2.confirm({window:{title:'Obniżenie poziomu'},content:'<p>Obniżyć poziom '+old+' → '+next+'?</p>'+(tierDrop?'<p>Może to ograniczyć możliwość dalszego rozwijania talentów wyższego Tieru. Istniejące zakupy nie zostaną usunięte ani refundowane.</p>':'')}),announce:async level=>{await DialogV2.wait({window:{title:'AWANS NA POZIOM '+level},content:'<p>Otrzymujesz dodatkowo: +1 SZ, nowe Doświadczenie i nową Cechę Specjalną Ścieżki. Możesz uzupełnić je później w Rozwoju.</p>',buttons:[{action:'experience',label:'Dodaj Doświadczenie',callback:()=>{this._activeTab='development';this._focusDevelopment='experiences';}},{action:'feature',label:'Dodaj Cechę Specjalną',callback:()=>{this._activeTab='development';this._focusDevelopment='classFeatures';}},{action:'later',label:'Później',default:true}]});}});await this.render({force:true});}catch(error){ui.notifications.warn(error.message);}
 }
 static async #chooseArt(){try{const choice=await promptArt();if(choice){captureApplicationScroll(this);await chooseArt(this.actor,choice);await this.render({force:true});}}catch(error){ui.notifications.warn(error.message);}}
 static async #chooseMonk(){try{const type=await promptMonkWeapon();if(type){captureApplicationScroll(this);await chooseMonkWeapon(this.actor,type);await this.render({force:true});}}catch(error){ui.notifications.warn(error.message);}}
 static async #rollStat(_e,t){await this.actor.rollTest(t.dataset.stat);}
  static async #sheetTool(_e,t){const key=t.dataset.sheetTool;if(['audit','session','boss','library','npc','encounter'].includes(key)&&!game.user.isGM)return ui.notifications.warn('Narzędzie dostępne tylko MG.');return game.gahla.executeTool(key,this.actor.uuid);}
  static async #useActiveTalent(_e,t){return game.gahla.executeTool('talent',this.actor.uuid,t.dataset.itemId);}
  static async #toggleDarkness(){if(!game.user.isGM)return ui.notifications.warn('Oznaczenie Mroku ustala MG.');await this.actor.setFlag('gahla-resurrected','creatureOfDarkness',!this.actor.flags?.['gahla-resurrected']?.creatureOfDarkness);}
  static async #rollDerived(_e,t){const stat=t.dataset.stat;let againstCondition="";if(stat==='physicalResistance'&&fullForm119(this.actor)&&formRank119(this.actor,'Zmiennokształtny')>=2){const fd=await foundry.applications.api.DialogV2.input({window:{title:'Zmiennokształtny T2 — kontekst Odporności'},content:'<label>Przeciw czemu?<select name="againstCondition"><option value="">Inny efekt</option><option value="prone">Powalenie — Ułatwienie</option><option value="pushed">Pchnięcie — Ułatwienie</option></select></label>',ok:{label:'Wykonaj test'}});if(!fd)return;againstCondition=fd.againstCondition??"";}await this.actor.rollTest(stat,{label:`Odporność ${stat}`,againstCondition});}
  static async #spendFate(){if(await this.actor.spendFate())ui.notifications.info("Wydano Punkt Losu.");else ui.notifications.warn("Brak Punktów Losu.");}
  static async #adjustFate(_e,t){
    const delta=Number(t.dataset.delta||0);if(!Number.isFinite(delta)||delta===0)return;
    const current=Math.max(0,Number(this.actor.system.fate?.personal||0));
    const next=Math.max(0,current+delta);
    captureApplicationScroll(this);
    await this.actor.update({"system.fate.personal":next});
  }
  static async #longRest(){const r=await this.actor.longRest();ui.notifications.info(`Długi odpoczynek: +${r.heal} Rany odzyskane, Aura odnowiona.`);}
  static async #injury(_e,t){try{await injuryAction(this.actor,t.dataset.id,t.dataset.kind);}catch(e){ui.notifications.warn(e.message);}}
  static async #reload(_e,t){try{await reloadWeapon(this.actor,this.actor.items.get(t.dataset.itemId));}catch(e){ui.notifications.warn(e.message);}}
  static async #runecraft(){try{await rollRunecraft(this.actor);}catch(e){ui.notifications.warn(e.message);}}
  static async #bodyRune(_e,t){try{await setBodyRune(this.actor,this.actor.items.get(t.dataset.itemId));}catch(e){ui.notifications.warn(e.message);}}
  static async #awardSessionXP(){try{const root=this.element;this._xpDraft={label:"",amount:"50"};await awardSessionXP(this.actor,root.querySelector('[data-session-name]').value,root.querySelector('[data-session-xp]').value);}catch(e){ui.notifications.warn(e.message);}}
  static async #undoPurchase(_e,t){try{if(await DialogV2.confirm({window:{title:'Cofnij zakup'},content:'<p>Cofnąć ostatni zakup i zwrócić jego EXP?</p>'}))await undoPurchase(this.actor,t.dataset.id);}catch(e){ui.notifications.warn(e.message);}}
  static async #levelUp(){await this.actor.applyLevelProgression(Number(this.actor.system.level||1));}
  static async #addExperience(){const arr=[...(this.actor.system.experiences||[]),""];await this.actor.update({"system.experiences":arr});}
  static async #addFeature(){const arr=[...(this.actor.system.classFeatures||[]),""];await this.actor.update({"system.classFeatures":arr});}
  static async #removeExperience(_e,t){const idx=Number(t.dataset.index),arr=[...(this.actor.system.experiences||[])];if(Number.isInteger(idx)&&idx>=0&&idx<arr.length){arr.splice(idx,1);await this.actor.update({"system.experiences":arr});}}
  static async #removeFeature(_e,t){const idx=Number(t.dataset.index),arr=[...(this.actor.system.classFeatures||[])];if(Number.isInteger(idx)&&idx>=0&&idx<arr.length){arr.splice(idx,1);await this.actor.update({"system.classFeatures":arr});}}
  static async #rollExperience(_e,t){const idx=Number(t.dataset.index);const exp=this.actor.system.experiences?.[idx];if(exp){const fd=await DialogV2.input({window:{title:'Experience — powiązany test'},content:'<p>Wybierz logicznie powiązaną cechę i uzasadnij użycie Experience.</p><select name="stat">'+Object.entries(STAT_LABELS).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('')+'</select>',ok:{label:'Test z Ułatwieniem'}});if(fd)await this.actor.rollTest(fd.stat,{label:'Experience: '+exp,advantage:true});}}
  static async #itemRoll(_e,t){const item=this.actor.items.get(t.dataset.itemId);if(item)await item.roll();}
  static async #openItem(_e,t){const item=this.actor.items.get(t.dataset.itemId);if(!item)return;const sheet=item.sheet||new GahlaItemSheet({document:item});await sheet.render({force:true});}
  static async #removeItem(_e,t){const item=this.actor.items.get(t.dataset.itemId);if(item&&await DialogV2.confirm({window:{title:"Usuń przedmiot"},content:`<p>Usunąć <b>${foundry.utils.escapeHTML(item.name)}</b>?</p>`}))await item.delete();}
  static async #toggleEquip(_e,t){const item=this.actor.items.get(t.dataset.itemId);if(item)await equipItem(item);}
  static async #togglePrepared(_e,t){const item=this.actor.items.get(t.dataset.itemId);if(item)await togglePreparationPlan(item);}
  static async #toggleCondition(_e,t){await this.actor.toggleCondition(t.dataset.condition);}
  static async #openCreator(){await new GahlaCharacterCreator().render({force:true});}
  static async #openTalentTree(){
    try{const {GahlaTalentTree}=await import("./talent-tree.mjs");await new GahlaTalentTree({actor:this.actor}).render({force:true});}
    catch(err){console.error("[Gahla] talent tree failed",err);ui.notifications.error("Gahla: nie udało się otworzyć drzewka talentów. Szczegóły są w konsoli F12.");}
  }
  static async #openAbilityBuilder(_e,t){
    try{const {GahlaAbilityBuilder}=await import("./ability-builder.mjs");await new GahlaAbilityBuilder({actor:this.actor,mode:t?.dataset?.mode||"spell"}).render({force:true});}
    catch(err){console.error("[Gahla] ability builder failed",err);ui.notifications.error("Gahla: nie udało się otworzyć kreatora zdolności. Szczegóły są w konsoli F12.");}
  }
  static async #moveShield(_e,t){
    const item=this.actor.items.get(t.dataset.itemId); if(!item||item.type!=="armor"||!item.system.isShield)return;
    try{await chooseShield(item);}catch(e){ui.notifications.warn(e.message);}
  }
  static async #editAbility(_e,t){
    const item=this.actor.items.get(t.dataset.itemId); if(!item||!["spell","maneuver"].includes(item.type)) return;
    try{const {GahlaAbilityBuilder}=await import("./ability-builder.mjs");await new GahlaAbilityBuilder({actor:this.actor,item,mode:item.type}).render({force:true});}
    catch(err){console.error("[Gahla] edit ability failed",err);ui.notifications.error("Gahla: nie udało się otworzyć kreatora do edycji. Szczegóły są w konsoli F12.");}
  }
  static async #useManeuver(_e,t){
    const maneuver=this.actor.items.get(t.dataset.itemId); if(!maneuver||maneuver.type!=="maneuver") return;
    const target=this.actor.getTokenTargetActor?.(); if(!target) return ui.notifications.warn("Gahla: wskaż cel przed użyciem manewru.");
    const weapons=this.actor.items.filter(i=>i.type==="weapon"&&i.system.equipped); if(!weapons.length) return ui.notifications.warn("Gahla: brak wyposażonej broni.");
    const content=`<div class="gahla-roll-dialog gahla-action-dialog"><label>Broń <select name="weaponId">${weapons.map((w,i)=>safeOption(w.id,`${w.name} — ${w.system.damage||"—"}, OP ${Number(w.system.delay||0)}`,i===0)).join("")}</select></label><div data-preview="weapon"></div><div data-preview="maneuver">${itemChoicePreview(maneuver)}</div><label>Modyfikator rzutu <select name="modifier">${modifierOptions(0)}</select></label><label class="gahla-check-line"><span>Atak celowany −30</span><input type="checkbox" name="calledShot"></label><label data-called-location hidden>Lokacja <select name="calledShotLocation">${ARMOR_LOCATIONS.map(loc=>safeOption(loc.key,loc.label,loc.key==="body")).join("")}</select></label></div>`;
    const fd=await DialogV2.input({window:{title:`${maneuver.name} → ${target.name}`},position:{width:760,height:"auto"},content,render:(_event,dialog)=>{const root=dialogRoot(dialog);if(!root)return;const weaponSel=root.querySelector('[name="weaponId"]'),wp=root.querySelector('[data-preview="weapon"]'),shot=root.querySelector('[name="calledShot"]'),loc=root.querySelector('[data-called-location]');const updateWeapon=()=>{const w=this.actor.items.get(String(weaponSel?.value||""));if(w&&wp)wp.innerHTML=itemChoicePreview(w,{weapon:true});};const updateShot=()=>{if(loc)loc.hidden=!Boolean(shot?.checked);};weaponSel?.addEventListener("change",updateWeapon);shot?.addEventListener("change",updateShot);updateWeapon();updateShot();},ok:{label:"Wykonaj manewr"}}); if(!fd)return;
    const weapon=this.actor.items.get(String(fd.weaponId||"")); if(!weapon)return;
    const modifier=Math.max(-40,Math.min(40,Number(fd.modifier||0)));
    return maneuver.roll({weapon,modifier,promptModifier:false,target,calledShot:Boolean(fd.calledShot),calledShotLocation:String(fd.calledShotLocation||"body")});
  }
  static async #npcBasicAttack(){
    if(!this.actor?.isNPC) return;
    const dice=Math.max(1,Number(this.actor.system.npc?.damageDice||1));
    const delay=Math.max(3,dice+1);
    let item=this.actor.items.find(i=>i.type==="weapon"&&i.getFlag?.("gahla-resurrected","npcBasicAttack"));
    const data={name:"Atak bazowy",type:"weapon",system:{damage:`${dice}k10`,damageType:"physical",delay,hands:1,penetration:0,equipped:true,traits:["Podstawowa"],description:"Bazowy atak przeciwnika. Możesz edytować go jak zwykłą broń."},flags:{"gahla-resurrected":{npcBasicAttack:true}}};
    if(item) await item.update({"name":data.name,"system.damage":data.system.damage,"system.delay":delay,"system.equipped":true});
    else [item]=await this.actor.createEmbeddedDocuments("Item",[data]);
    if(item) ui.notifications.info(`Gahla: ${this.actor.name} ma atak ${dice}k10 / OP ${delay}.`);
  }
  static async #openTracker(){
    try{const {GahlaInitiativeTracker}=await import("./tracker.mjs");await new GahlaInitiativeTracker().render({force:true});}
    catch(err){console.error("[Gahla] tracker failed",err);ui.notifications.error("Gahla: nie udało się otworzyć trackera. Szczegóły są w konsoli F12.");}
  }
  static async #spendXp(_e,t){
    const offer=growthOffer(this.actor);
    const content='<p>Za 50 EXP wybierz dokładnie '+offer.count+' różne cechy.</p>'+offer.choices.map(c=>'<label><input type="checkbox" name="'+c.key+'"> '+c.label+' +'+c.growth+'</label>').join('<br>');
    const fd=await DialogV2.input({window:{title:"Rozwój statystyk — 50 EXP"},position:{width:620,height:"auto"},content,ok:{label:"Wydaj 50 EXP"}});if(!fd)return;
    try{await buyGrowth(this.actor,offer.choices.filter(c=>Boolean(fd[c.key])).map(c=>c.key));}catch(e){ui.notifications.warn(e.message);}
  }
  static async #attack(){ return openAttackAction(this.actor); }

  static async #castSpell(){ return openSpellAction(this.actor); }
}

export class GahlaItemSheet extends HandlebarsApplicationMixin(ItemSheetV2){
  static DEFAULT_OPTIONS={classes:["gahla","sheet","item"],tag:"form",position:{width:860,height:760},form:{submitOnChange:true,closeOnSubmit:false},window:{icon:"fas fa-scroll"},actions:{configureSource:GahlaItemSheet.#configureSource,saveItem:GahlaItemSheet.#saveItem,deleteItem:GahlaItemSheet.#deleteItem,roll:GahlaItemSheet.#roll,equip:GahlaItemSheet.#equip,prepare:GahlaItemSheet.#prepare,openBuilder:GahlaItemSheet.#openBuilder,toggleAspect:GahlaItemSheet.#toggleAspect,recalculate:GahlaItemSheet.#recalculate,setShieldLocation:GahlaItemSheet.#setShieldLocation}}
  static PARTS={form:{template:"systems/gahla-resurrected/templates/item/item-sheet.hbs"}};
  async _prepareContext(){
    captureApplicationScroll(this);
    const context=await super._prepareContext();
    const system=this.item.system;
    const spellAspects=SPELL_ASPECTS.map(a=>({...a,selected:(system.aspects||[]).includes(a.name)}));
    const maneuverAspects=MANEUVER_ASPECTS.map(a=>({...a,selected:(system.aspects||[]).includes(a.name)}));
    const runes=RUNE_TYPES.map(r=>({...r,selected:(system.runes||[]).includes(r.name)}));
    const locations=ARMOR_LOCATIONS;
    const maneuver=maneuverDisplay(system||{});
    const maneuverView={
      ...maneuver,
      damageText:`${Number(maneuver.damageDiceDelta)>=0?"+":""}${Number(maneuver.damageDiceDelta)}k10`,
      delayText:`${Number(maneuver.delayDelta)>=0?"+":""}${Number(maneuver.delayDelta)} OP`,
      hitText:`${Number(maneuver.hitMod)>=0?"+":""}${Number(maneuver.hitMod)} traf.`,
      penetrationText:`+${Number(maneuver.penetrationBonus||0)} Pen.`
    };
    const type=this.item.type;
    const typeLabel={weapon:"Broń",armor:"Pancerz / tarcza",talent:"Talent",spell:"Zaklęcie / cud",maneuver:"Manewr",rune:"Runa",powerSource:"Źródło Mocy",equipment:"Ekwipunek"}[type]||type;
    const embedded=Boolean(this.item.parent);
    const canEquip=embedded&&["weapon","armor","powerSource","equipment"].includes(type);
    const canPrepare=embedded&&["spell","maneuver"].includes(type);
    const canUse=embedded&&["weapon","spell","maneuver"].includes(type);
    return {...context,weaponProfiles:Object.entries(WEAPON_PROFILES).map(([id,label])=>({id,label})),isGM:game.user.isGM,monkItem:this.item.name==="Szkolenie Mnicha",monkWeaponLabel:WEAPON_PROFILES[system.monkWeaponType]??"Nie wybrano",item:this.item,system,type,typeLabel,isEditable:this.isEditable,embedded,canEquip,canPrepare,canUse,
      spellAspects,maneuverAspects,runes,metals:METALS,locations,maneuverView,woundProfiles:WOUND_PROFILE_OPTIONS,
      runesText:(system.runes||[]).join(", "),traitsText:(system.traits||[]).join(", ")};
  }
  async _onRender(context,options){
    await super._onRender(context,options);
    restoreApplicationScroll(this);
  }
  _processFormData(event,form,formData){
    const data=super._processFormData(event,form,formData);
    return normalizeItemSubmitData(this.item.type,data,this.item.system);
  }
  static async #saveItem(){
    try{await this.submit();ui.notifications.info(`Gahla: zapisano ${this.item.name}.`);}
    catch(err){console.error("[Gahla] Item save failed",err);ui.notifications.error("Gahla: nie udało się zapisać przedmiotu. Szczegóły w konsoli F12.");}
  }
  static async #deleteItem(){
    const item=this.item;if(!item)return;
    const place=item.parent?`z ${item.parent.name}`:"ze świata / biblioteki";
    const ok=await DialogV2.confirm({window:{title:"Usuń Item"},content:`<p>Usunąć <b>${foundry.utils.escapeHTML(item.name)}</b> ${foundry.utils.escapeHTML(place)}?</p><p class="gahla-note">Tej operacji nie można cofnąć z poziomu karty.</p>`});
    if(!ok)return; await item.delete(); await this.close();
  }
  static async #roll(){await this.item.roll();}
  static async #openBuilder(){
    if(!["spell","maneuver"].includes(this.item.type)) return;
    try{
      const {GahlaAbilityBuilder}=await import("./ability-builder.mjs");
      await new GahlaAbilityBuilder({actor:this.item.parent,item:this.item,mode:this.item.type}).render({force:true});
    }catch(err){
      console.error("[Gahla] item ability editor failed",err);
      ui.notifications.error("Gahla: nie udało się otworzyć kreatora do edycji. Szczegóły są w konsoli F12.");
    }
  }
  static async #equip(){await equipItem(this.item);}
  static async #prepare(){await togglePreparationPlan(this.item);}
  static async #configureSource(){await configureSource(this.item);}
  static async #toggleAspect(_e,t){const name=t.dataset.aspect;const current=[...(this.item.system.aspects||[])];const next=current.includes(name)?current.filter(x=>x!==name):[...current,name];await this.item.update({"system.aspects":next});}
  static async #recalculate(){
    if(this.item.type!=="spell" && this.item.type!=="maneuver") return;
    const selected=new Set(this.item.system.aspects||[]);
    if(this.item.type==="spell"){
      const numeric=SPELL_ASPECTS.filter(a=>selected.has(a.name)&&typeof a.cost==="number").reduce((sum,a)=>sum+Number(a.cost),0);
      const cost=Math.max(0,numeric);
      const minDelay=cost<=5?4:cost<=10?5:cost<=15?6:7;
      await this.item.update({"system.spellCost":cost,"system.aspectCost":cost,"system.minDelay":minDelay});
      ui.notifications.info(`Gahla: koszt aspektów = ${cost}. Bazowe OP czaru = ${cost+1}; minimum OP = ${minDelay}.`);
    }
    if(this.item.type==="maneuver") ui.notifications.info("Gahla: zaznaczone aspekty manewru są zapisane. Koszty specjalne X pozostają do ustalenia przez MG.");
  }
  static async #setShieldLocation(){try{await chooseShield(this.item);}catch(e){ui.notifications.warn(e.message);}}
}

export function registerStatusEffects(){
  const icons={prone:"icons/svg/falling.svg",bleeding:"icons/svg/blood.svg",poisoned:"icons/svg/poison.svg",frightened:"icons/svg/terror.svg",stunned:"icons/svg/daze.svg",blind:"icons/svg/blind.svg",frozen:"icons/svg/frozen.svg",shocked:"icons/svg/daze.svg",auraWeak:"icons/svg/lightning.svg",burning:"icons/svg/fire.svg",asleep:"icons/svg/sleep.svg",fatigued:"icons/svg/downgrade.svg",slowed:"icons/svg/hourglass.svg",hasted:"icons/svg/wingfoot.svg"};
  const merged=Object.fromEntries(Object.entries(CONFIG.statusEffects||{}).map(([id,value])=>[id,value]));
  for(const [key,v] of Object.entries(CONDITIONS)) merged[`gahla-${key}`]={id:`gahla-${key}`,label:v.label,icon:icons[key]||"icons/svg/question-mark.svg"};
  CONFIG.statusEffects=merged;
}


export function registerChatActions(){
  Hooks.on("renderChatMessageHTML",filterContextButtons);
  document.addEventListener("click",async event=>{
    const button=event.target.closest("[data-action]"); if(!button)return;
    const action=button.dataset.action;
    try{if(await handleDamageCard(button))return;}catch(e){ui.notifications.warn(e.message);return;}
    if(action?.startsWith("gahla-auto-")){try{await handleContextAction(button);}catch(e){ui.notifications.warn(e.message);}return;}
    if(action==="gahla-apply-damage"){
      const actor=await fromUuid(button.dataset.actor); if(actor) await actor.applyDamage(Number(button.dataset.damage||0),{wounds:Number(button.dataset.wounds||0),lwBonus:Number(button.dataset.lwBonus||0),source:button.dataset.source||"czat",lingeringProfile:button.dataset.lwProfile||"none",lingeringLocation:button.dataset.lwLocation||"body",lingeringElement:button.dataset.lwElement||"",successType:button.dataset.lwSuccess||"normal"});
    }
    if(action==='gahla-form-bleeding119'){try{await resolveFormBleeding119(game.messages.get(button.closest('[data-message-id]')?.dataset.messageId));}catch(error){ui.notifications.warn(error.message);}return;}
    if(action==='gahla-gida119'){try{await resolveInfusion119(game.messages.get(button.closest('[data-message-id]')?.dataset.messageId));}catch(error){ui.notifications.warn(error.message);}return;}
    if(action==="gahla-injury-apply"){const actor=await fromUuid(button.dataset.actor);try{await injuryAction(actor,button.dataset.injury,"apply");}catch(e){ui.notifications.warn(e.message);}return;}
    if(action==="gahla-fate-test"){
      const actor=await fromUuid(button.dataset.actor); if(!actor||!(await actor.spendFate())) return;
      await actor.rollTest(button.dataset.stat,{casting:button.dataset.casting==="true",actingLocation:button.dataset.actingLocation,movement:button.dataset.movement==="true",modifier:Number(button.dataset.modifier||0),advantage:button.dataset.advantage==="true",disadvantage:button.dataset.disadvantage==="true",label:button.dataset.label,promptModifier:false});
    }
    if(action==="gahla-fate-attack"){
      const message=game.messages.get(button.closest('[data-message-id]')?.dataset.messageId),attack=message?.flags?.['gahla-resurrected']?.attack;
      const attacker=await fromUuid(button.dataset.actor),target=await fromUuid(button.dataset.target),weapon=await fromUuid(button.dataset.weapon),maneuver=button.dataset.maneuver?await fromUuid(button.dataset.maneuver):null;
      if(!attacker||!target||!weapon||!attacker.isOwner||!attack?.declaredDefense)return;
      if(attacker.flags?.['gahla-resurrected']?.attacks?.[message.id]?.damageRolled)return;
      if(!(await attacker.spendFate()))return;
      await attacker.rollAttack(target,weapon,{modifier:Number(button.dataset.modifier||0),calledShot:button.dataset.calledShot==="true",calledShotLocation:button.dataset.calledShotLocation||"body",advantage:button.dataset.advantage==="true",disadvantage:button.dataset.disadvantage==="true",promptModifier:false,maneuver,free:true,actingLocation:attack.actingLocation,aimSegments:Number(attack.aiming?.segments||0),sequence:attack.sequence,sequence119Previous:attack.sequence119Previous,promoteSequenceBonus:attack.promoteSequenceBonus,declaredSpirit:attack.spirit,declaredShots:attack.shots,declaredDefense:{...attack.declaredDefense,parryChat:null}});
      await attacker.update({["flags.gahla-resurrected.attacks."+message.id]:{damageRolled:true,replaced:true}});
    }
    if(action==="gahla-fate-damage"){
      const attacker=await fromUuid(button.dataset.attacker),target=await fromUuid(button.dataset.target),weapon=await fromUuid(button.dataset.weapon),maneuver=button.dataset.maneuver?await fromUuid(button.dataset.maneuver):null; if(!attacker||!target||!weapon||!(await attacker.spendFate())) return;
      const damageMessage=game.messages.get(button.closest('[data-message-id]')?.dataset.messageId);
      await attacker.rollDamageAgainst(target,weapon,{...damageMessage?.flags?.['gahla-resurrected']?.damage?.attackContext,bonus:button.dataset.bonus==="true",criticalSuccess:button.dataset.critical==="true",location:button.dataset.location,roll:Number(button.dataset.roll||100),maneuver},{maneuver,damageDice:Number(button.dataset.damageDice||0),penetration:Number(button.dataset.penetration||0),applyProne:button.dataset.prone==="true",skipAuraPrompt:true,auraSpent:Number(button.dataset.auraSpent||0),auraDiceReduced:Number(button.dataset.auraDiceReduced||0),auraDicePerPoint:Number(button.dataset.auraDicePerPoint||1)});
    }
    if(await handleSpellCondition(button))return;
    if(action==="gahla-spell-damage"){
      const attacker=await fromUuid(button.dataset.attacker),target=await fromUuid(button.dataset.target),spell=await fromUuid(button.dataset.spell); if(attacker&&target&&spell){
        if(!attacker.isOwner&&!game.user.isGM)return;
        const messageId=button.closest("[data-message-id]")?.dataset.messageId;
        if(messageId&&attacker.flags?.["gahla-resurrected"]?.attacks?.[messageId]?.damageRolled)return ui.notifications.warn("Ta karta została już wykorzystana lub zastąpiona przerzutem.");
        const cast=game.messages.get(messageId)?.flags?.["gahla-resurrected"]?.spellCast?.system??spell.system;
        const fakeWeapon={name:spell.name,system:{...cast,magical:true,damageType:cast.damageType||spellDamageType(spell.system.school||attacker.system.archetype),flatDamage:Number(cast.flatDamage||0)+Number(button.dataset.statchar||0)}};
        const damageResult=await attacker.rollDamageAgainst(target,fakeWeapon,{success:true,bonus:button.dataset.bonus==="true",criticalSuccess:button.dataset.critical==="true",location:"body",roll:Number(button.dataset.roll||100)},{isSpell:true});
        if(damageResult&&messageId)await attacker.update({[`flags.gahla-resurrected.attacks.${messageId}`]:{damageRolled:true}});
      }
    }
    if(action==="gahla-parry"){
      ui.notifications.warn("Parowanie trzeba zadeklarować przed rzutem trafienia. Rozpocznij nowy atak.");
    }
    if(action==="gahla-tracker-reaction"){
      const actor=await fromUuid(button.dataset.actor); if(actor) await actor.trackerReaction(Number(button.dataset.cost||4));
    }
    if(action==="gahla-free-counterattack"){
      const defender=await fromUuid(button.dataset.defender),attacker=await fromUuid(button.dataset.attacker),weapon=await fromUuid(button.dataset.weapon); if(defender&&attacker&&weapon) await defender.rollAttack(attacker,weapon,{free:true});
    }
    if(action==="gahla-break-armor")return ui.notifications.warn("Pełne zniszczenie pancerza nie anuluje Ran. Stara karta jest nieaktualna.");
    if(action==="gahla-save-armor"){
      const actor=await fromUuid(button.dataset.actor); const loc=button.dataset.location; if(!actor||!loc)return;
      const armor=actor.activeArmor.find(i=>i.system.isShield ? shieldCovers(i,loc) : Number(i.system.locations?.[loc]||0)>0); if(!armor)return ui.notifications.warn("Brak pancerza na tej lokacji.");
      const isShield=Boolean(armor.system.isShield); const current=isShield?Number(armor.system.armor||0):Number(armor.system.locations?.[loc]||0);
      if(current<=0)return ui.notifications.warn("Ta część pancerza nie ma już pancerza do uszkodzenia.");
      const nextArmor=Math.max(0,current-1);
      await armor.update(isShield?{"system.armor":nextArmor}:{[`system.locations.${loc}`]:nextArmor});
      const damage=Number(button.dataset.damage||0); const woundsToApply=Number(button.dataset.woundsToApply||0);
      await actor.applyDamage(damage,{wounds:woundsToApply,lwBonus:Number(button.dataset.lwBonus||0),source:`Uszkodzenie pancerza — ${action}`,lingeringProfile:button.dataset.lwProfile||"none",lingeringLocation:button.dataset.lwLocation||loc||"body",lingeringElement:button.dataset.lwElement||"",successType:button.dataset.lwSuccess||"normal"});
    }
    if(action==="gahla-damage"){
      const attacker=await fromUuid(button.dataset.attacker),target=await fromUuid(button.dataset.target),weapon=await fromUuid(button.dataset.weapon),maneuver=button.dataset.maneuver?await fromUuid(button.dataset.maneuver):null; if(attacker&&target&&weapon) await attacker.rollDamageAgainst(target,weapon,{success:true,bonus:button.dataset.bonus==="true",criticalSuccess:button.dataset.critical==="true",location:button.dataset.location,roll:Number(button.dataset.roll||100),maneuver},{maneuver});
    }
    if(action==="gahla-bonus-dialog"){
      const attacker=await fromUuid(button.dataset.attacker),target=await fromUuid(button.dataset.target),weapon=await fromUuid(button.dataset.weapon),maneuver=button.dataset.maneuver?await fromUuid(button.dataset.maneuver):null;if(!attacker||!target||!weapon)return;
      const allocation=await promptAttackBonusAllocation(Number(button.dataset.points||0));
      if(!allocation)return;
      await attacker.rollDamageAgainst(target,weapon,{criticalSuccess:button.dataset.critical==="true",bonus:button.dataset.bonus==="true",location:button.dataset.location,roll:Number(button.dataset.roll||100),maneuver},{damageDice:allocation.damageDice,penetration:allocation.penetration,applyProne:allocation.prone,maneuver});
    }
  });
}
