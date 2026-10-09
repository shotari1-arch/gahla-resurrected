import {currentRank,rankStep,rankCost,effectTier} from './talent-ranks.mjs';
import {bodyRuneCost,bodyRuneLimit} from './canon-mechanics.mjs';
import { powerSourceProfile, spellDamageType, elementKey } from './canonical-rules.mjs';
import { ALL_TALENTS, STAT_LABELS, statUpgradeLimit } from "./rules.mjs";
import { explicitTalentPrerequisites } from "./talent-tree-rules.mjs";
import { talentRelevantToActor, minimumTalentTier, archetypeTalentTierForActor } from "./talent-eligibility.mjs";
import { itemsOf, levelOf, NS } from "./effects-engine.mjs";
import { RUNE_TYPES } from "./content.mjs";
export const GROWTH_STATS=["sf","zr","per","er","um","og","wia"];
export function growthOffer(actor){
  const s=actor.system,limit=statUpgradeLimit(s.derived.tier),versatile=itemsOf(actor).some(i=>i.name==="Wszechstronny"&&i.system.learned)&&Number(s.base.versatileUsedLevel)!==Number(s.level);
  return {cost:50,count:versatile?4:3,versatile,limit,choices:GROWTH_STATS.filter(k=>Number(s.base.growth[k])>0&&Number(s.base.statUpgradeCounts[k]??0)<limit).map(key=>({key,label:STAT_LABELS[key],growth:s.base.growth[key],count:s.base.statUpgradeCounts[key]??0}))};
}
export function growthUpdate(actor,selected){
  const offer=growthOffer(actor),keys=new Set(selected);
  if(keys.size!==selected.length||keys.size!==offer.count)throw Error(`Wybierz dokładnie ${offer.count} różne cechy.`);
  if([...keys].some(k=>!offer.choices.some(c=>c.key===k)))throw Error("Wybrana cecha nie ma legalnego przyrostu lub osiągnęła limit Tieru.");
  if(Number(actor.system.xp)<offer.cost)throw Error("Potrzeba 50 EXP.");
  const update={"system.xp":Number(actor.system.xp)-offer.cost};
  for(const key of keys)update[`system.base.statUpgradeCounts.${key}`]=Number(actor.system.base.statUpgradeCounts[key]??0)+1;
  if(offer.versatile)update["system.base.versatileUsedLevel"]=Number(actor.system.level);
  return update;
}
export function talentErrors(actor,def,level,{purchase=false,teacher=false}={}){
  const step=rankStep(def,level);
  const errors=[],known=itemsOf(actor).filter(i=>i.type==="talent"&&i.system.learned),current=known.find(i=>i.name===def.name);
  if(!Number.isInteger(level)||level<1||!step)errors.push("Poziom poza zakresem talentu");
  if((step?.requiredTier??99)>Number(actor.system.derived.tier)||minimumTalentTier(def)>Number(actor.system.derived.tier))errors.push("Za niski Tier");
  // Walka Wręcz granted by the monk bridge is an explicit exception.
  const monkGift=def.name==="Walka Wręcz"&&known.some(i=>i.name==="Szkolenie Mnicha")&&level===1;
  if(!monkGift&&!talentRelevantToActor(def,actor))errors.push("Niewłaściwa rasa, archetyp, bóstwo lub Ścieżka Życia");
  if(!monkGift&&def.category==="archetype"&&(step?.requiredTier??99)>archetypeTalentTierForActor(def,actor))errors.push("Przekroczony Tier mostu archetypów");
  for(const req of explicitTalentPrerequisites(def))if(!known.some(i=>i.name.toLowerCase()===req.name.toLowerCase()&&effectTier(i)>=req.level))errors.push(`Wymagany ${req.name} T${req.level}`);
  const levelReq=String(def.requirements).match(/(\d+)\. poziom/);if(levelReq&&Number(actor.system.level)<Number(levelReq[1]))errors.push(`Wymagany poziom postaci ${levelReq[1]}`);
  if(def.name==="Chwyt Tytana"&&Number(actor.system.stats.sf)<([40,40,50,60][level-1]??Infinity))errors.push(`Wymagane SF ${[40,40,50,60][level-1]}`);
  if(["Bestialska Hybryda","Zmiennokształtny"].includes(def.name)&&known.some(i=>i.name===(def.name==="Bestialska Hybryda"?"Zmiennokształtny":"Bestialska Hybryda")))errors.push("Hybryda i Zmiennokształtny wzajemnie się wykluczają.");
  if(purchase){
    if(level>1&&def.rankNeedsDecision)errors.push("Progresja kolejnych rang wymaga decyzji projektowej — brak jednoznacznego nowego efektu.");
    if(['Wybraniec Boży','Święty Wojownik','Błogosławiony'].includes(def.name))errors.push('Special Feature Ścieżki jest przyznawany na poziomie postaci, nie kupowany za EXP.');
    if(level!==(current?currentRank(current,def)+1:1))errors.push("Kupuj kolejne poziomy, zaczynając od T1");
    if(Number(actor.system.xp)<rankCost(def,level,teacher))errors.push("Za mało EXP");
    if(/WIP/i.test(def.description))errors.push("WIP — brak ostatecznej mechaniki");
  }
  return [...new Set(errors)];
}
export function auditBuild(actor){
  const issues=[],s=actor.system,items=itemsOf(actor),add=(severity,message)=>issues.push({severity,message});
  for(const entry of actor.flags?.[NS]?.development?.entries??[])if(entry.emptyLegacyPurchase&&!entry.reverted)add("review",`Historyczny pusty zakup: ${entry.label} (${Math.abs(entry.delta)} EXP). Zwrot wyłącznie po decyzji MG.`);
  if(items.some(i=>i.name==="Szkolenie Mnicha"&&i.system.learned&&!i.system.monkWeaponType))add("review","Szkolenie Mnicha wymaga wyboru Broni Mnicha.");
  if(bodyRuneCost(actor)>bodyRuneLimit(actor))add("error","Suma kosztu Run w ciele przekracza ⅓ ŻYW (w górę).");
  if(s.species==="therian"&&!actor.flags?.[NS]?.selfTrigger)add("review","Uzupełnij personalny Wyzwalacz Jaźni ustalony z MG.");
  if(actor.flags?.[NS]?.legacyHybridT4Review119||items.some(i=>i.flags?.[NS]?.legacyHybridRank119))add("review","Historyczna ranga/aktywacja T4 Bestialskiej Hybrydy: błędny zapis wcześniejszej wersji. Historia i EXP zachowane; rozstrzygnięcie zakupu przez MG, bez automatycznego zwrotu.");
  for(const item of items.filter(i=>i.type==="talent"&&i.system.learned)){
    const def=ALL_TALENTS.find(d=>d.name===item.name);
    if(!def){add("review",`${item.name}: własna zdolność / tag — weryfikacja MG`);continue;}
    for(const error of talentErrors(actor,def,currentRank(item,def)))add("error",`${item.name}: ${error}`);
    if(item.flags?.[NS]?.legacyEffectPending118||item.flags?.[NS]?.legacyEffectPending119)add("review",`${item.name}: dawny poziom poprzedza pierwszy zdefiniowany efekt. Migracja zachowała efekt; aktywacja wymaga decyzji MG.`);
    if(def.rankNeedsDecision)add("review",`${item.name}: kolejne efekty/rangi wymagają decyzji projektowej.`);
    if(/WIP/i.test(def.description))add("review",`${item.name}: WIP, bez automatycznej interpretacji`);
    if(def.category==="special"&&!/Szkolenie Mnicha|Duchowa Pięść|Chwyt Tytana|Święty Wojownik|Błogosławiony|Wybraniec Boży/.test(def.name))add("review",`${item.name}: sprawdź opisowe wymagania — ${def.requirements}`);
  }
  for(const key of GROWTH_STATS)if(Number(s.base?.statUpgradeCounts?.[key]??0)>statUpgradeLimit(s.derived.tier))add("error",`${STAT_LABELS[key]}: przekroczony limit rozwinięć`);
  for(const [type,school,limit] of [["maneuver",null,s.derived.maneuverSlots],["spell","Kapłan",s.derived.spellSlotsCleric],["spell","Półmag",s.derived.spellSlotsMage]]){
    const n=items.filter(i=>i.type===type&&i.system.prepared&&(!school||(i.system.school|| (i.system.rollStat==="wia"?"Kapłan":"Półmag"))===school)).length;
    if(n>Number(limit))add("error",`Przygotowane ${school??"manewry"}: ${n}/${limit}`);
  }
  for(const item of items){
    if(item.type==="spell"&&Number(item.system.tier)>Number(s.derived.tier))add("error",`${item.name}: za wysoki Tier`);
    if(item.system.equipped&&(item.system.traits??[]).some(t=>/Ciężka|SF 50/i.test(t))&&Number(s.stats.sf)<50)add("review",`${item.name}: SF < 50 — obowiązują kary za ciężki ekwipunek`);
    if(item.system.runes?.length){
      const runes=item.system.runes.map(name=>RUNE_TYPES.find(r=>r.name===name));
      const cost=runes.reduce((sum,r)=>sum+Number(r?.cost??0),0);
      const material=String(item.system.metal??"").toLowerCase(),capacity=Number(item.system.runSlots??0)+(/runiczny|kowala run/.test(material)?1:0);
      if(runes.some(r=>!r||r.cost===null))add("review",`${item.name}: nieznany koszt runy — sprawdź opis`);
      if(cost>capacity)add("error",`${item.name}: koszt run ${cost} przekracza pojemność ${capacity}`);
      for(const r of runes.filter(Boolean)){
        if(r.max&&runes.filter(x=>x?.name===r.name).length>r.max)add("error",`${item.name}: przekroczono limit ${r.name}`);
        if(r.tier>Number(s.derived.tier))add("review",`${item.name}: runa T${r.tier} — sprawdź uprawnienia do użycia`);
      }
    }
  }
  if(actor.flags?.['gahla-resurrected']?.trackerNeedsReview)add('review','Stary dług Trackera został zarchiwizowany — MG musi uzgodnić bieżącą akcję.');
  for(const i of items){if(i.type==='powerSource')for(const e of powerSourceProfile(i).errors)add('review',i.name+': '+e);if(i.type==='spell'&&['light','shadow'].includes(elementKey(i.system.element))&&spellDamageType(i.system.school||s.archetype)!=='spiritual')add('error',i.name+': Światło / Cień tylko dla Kapłana.');}
  const special=items.filter(i=>{try{return i.type==="maneuver"&&i.system.prepared&&JSON.parse(i.system.builderState||"{}").specialManeuver;}catch{return false;}});
  if(special.length>1)add("error","Przygotowano więcej niż jeden Specjalny Manewr");
  return issues;
}
export function aggregateLog(events=[]){
  const totals={attacks:0,hits:0,wounds:0,hp:0,aura:0,reactions:0,deadly:0,rounds:0};
  for(const e of events){totals.rounds=Math.max(totals.rounds,Number(e.round)||0);if(e.type==="attack"){totals.attacks++;if(e.success)totals.hits++;}else if(Object.hasOwn(totals,e.type))totals[e.type]+=Number(e.amount??1);}
  return totals;
}
