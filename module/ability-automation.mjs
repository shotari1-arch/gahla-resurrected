import {validateAuraPayment119} from './talent-aura119.mjs';
import { powerSourceProfile, elementKey } from './canonical-rules.mjs';
import { calculateSpell, calculateManeuver } from "./ability-builder-rules.mjs";
import { collectModifiers, resolveModifiers, itemsOf, modified } from "./effects-engine.mjs";
export const EXTRA_ASPECTS={
  removeCondition:{label:"Usunięcie / odporność na stan",cost:2,max:1},removeAll:{label:"Usunięcie / odporność na wszystkie stany",cost:5,max:1},
  statBonus:{label:"Bonus wybranej cechy +10",cost:1},damageBonus:{label:"Bonus obrażeń +1k10",cost:2},resistance:{label:"Jedna odporność +10",cost:1},allResistance:{label:"Wszystkie odporności +10",cost:3},
  defenseBonus:{label:"Obrona +10",cost:1},armorBonus:{label:"Pancerz +1",cost:3,max:2},threshold:{label:"Próg obrażeń +1",cost:1},elementArmor:{label:"Pancerz odporny na żywioł",cost:3,max:1},
  speedBonus:{label:"Szybkość +1 SZ (kolejne ×2)",cost:2,exponential:true},enchant:{label:"Umagicznienie broni / zbroi",cost:2,max:1},
  statPenalty:{label:"Test jednej cechy −10",cost:1},allTestsPenalty:{label:"Testy wszystkich cech −10",cost:3},speedPenalty:{label:"Szybkość −1",cost:2},thresholdPenalty:{label:"Próg obrażeń −1",cost:1},
  vulnerability:{label:"Nadwrażliwość na element",cost:4,max:1},trigger:{label:"Trigger (nie reakcja)",cost:1,max:1},
  asleep:{label:"Uśpienie",cost:7,max:1},blind:{label:"Ślepota",cost:4,max:1},fatigued:{label:"Zmęczenie",cost:6,max:1},burning:{label:"Podpalenie",cost:2,max:1},stunned:{label:"Oszołomienie",cost:3,max:1},frightened:{label:"Przerażenie",cost:4,max:1}
};
export function calculateActorAbility(state,actor){
  const errors=[],warnings=[],trace=[],s={...state},modifiers=collectModifiers(actor),mode=s.mode??"spell";
  for(const [key,value] of Object.entries(s))if(typeof value==="number"&&(!Number.isFinite(value)||value<0||!Number.isInteger(value)))errors.push(`Niepoprawna wartość: ${key}`);
  if(mode==="maneuver"){
    for(const [key,max]of Object.entries({strong:2,accurate:2,pen:2,sweep:3,fast:2}))if(Number(s[key]??0)>max)errors.push(`Aspekt ${key}: limit ${max}.`);
    const c=calculateManeuver(s),weapon=itemsOf(actor).find(i=>i.id===s.weaponId&&i.type==="weapon"&&i.system.equipped);
    c.baseStars=c.stars;
    if(s.specialManeuver){
      const discount=resolveModifiers(0,"maneuverFreeStars",modifiers,{special:true});
      if(discount.value<=0)errors.push("Specjalny manewr wymaga talentu Specjalny Manewr.");
      c.stars=Math.max(0,c.stars-discount.value);c.balanced=c.stars===c.totalPaid;trace.push(...discount.trace);
      warnings.push("Specjalny Manewr: darmowy koszt działa; opis nie podaje wartości zwiększonych limitów aspektów, więc wymagają decyzji MG.");
    }
    const aura=Number(s.pay_aura||0);try{if(aura)validateAuraPayment119(actor,aura,s.reservationItemId);}catch(error){errors.push(error.message);}c.totalPaid+=aura;c.balanced=c.stars===c.totalPaid;if(aura)c.bullets.push('Skupienie Bojowe: '+aura+' Aury zablokowane do zmiany Manewru');
    if(actor&&!weapon)errors.push("Wybierz wyposażoną broń postaci.");
    if(!c.balanced)errors.push("Koszt gwiazdek nie został dokładnie opłacony.");
    if(!c.hasModification)errors.push("To czysty atak — wybierz modyfikację.");
    if(Number(c.baseDmg)+Number(c.damageDiceDelta)<0)errors.push("Płatność wymaga więcej kości niż posiada broń.");
    if(s.customCost)warnings.push("Kreatywny: efekt i koszt wymagają ustalenia z MG.");
    const finalOp=modified(actor,c.finalOp,"delay",{kind:"maneuver"},Math.max(0,modified(actor,c.minOp??s.w_min_op,"minimumDelay")));
    return {...c,finalOp,errors,warnings,trace,valid:errors.length===0};
  }
  const school=s.spellClass;
  if(Number(s.element)>0&&["light","shadow"].includes(elementKey(s.elName))&&school!=="Kapłan")errors.push("Światło i Cień są dostępne tylko Kapłanowi.");
  if(Number(s.element)>0&&!String(s.elName??"").trim())errors.push("Podaj nazwę wybranego elementu.");
  if(Number(s.range??0)>3||Number(s.element??0)>3)errors.push("Zasięg lub poziom elementu poza zakresem kreatora.");
  if(!["Półmag","Kapłan"].includes(school))errors.push("Wybierz Półmaga albo Kapłana.");
  if(!Number.isInteger(Number(s.tier))||Number(s.tier)<1||Number(s.tier)>4)errors.push("Tier musi być w zakresie 1–4.");
  if(actor){
    if(Number(s.tier)>Number(actor.system.derived.tier))errors.push("Tier zdolności przekracza Tier postaci.");
    if(actor.type==="character"&&actor.system.archetype!==(school==="Kapłan"?"kaplan":"polmag"))errors.push("Archetyp nie daje bezpośredniego dostępu do tej szkoły. Opisowy most wymaga rozstrzygnięcia MG.");
  }
  const c=calculateSpell(s),context={school},discount=(aspect,cost,extra={})=>{
    const r=resolveModifiers(cost,"aspectCost",modifiers,{...context,aspect,...extra},0);trace.push(...r.trace);return r.value-cost;
  };
  let change=0,extraCost=0;
  if(s.selfTarget){change-=s.aoe?3:1;c.target="Rzucający";if(Number(s.range)>0)errors.push("Cel: rzucający wymaga zasięgu Dotyk.");}
  else if(s.aoe){const n=Number(s.areaUnits??1);if(!Number.isInteger(n)||n<1||n>100)errors.push("Obszar: wybierz 1–100 jednostek po 10 m².");else{extraCost+=3*(n-1);c.target=`Obszar ${n*10} m²`;}}
  else{const n=Number(s.targetCount??1);if(!Number.isInteger(n)||n<1||n>100)errors.push("Wybierz 1–100 celów.");else{extraCost+=n-1;c.target=String(n);}}
  if(Number(s.element)>0)change+=discount("element",([0,2,5,9][Number(s.element)]??9)+(school==="Kapłan"?1:0),{element:String(s.elName||"").toLowerCase()});
  if(Number(s.minusop)>0)change+=discount("minusop",Number(s.minusop)*2);
  if(Number(s.hitbonus)>=2)change+=discount("battleHit",1);
  if(Number(s.extraAspects?.damageBonus)>0)change+=discount("battleDamage",1);
  if(Number(s.heal)>0)change+=discount("heal",3+Number(s.heal));
  if(Number(s.state)>0)change+=discount("condition",Number(s.state)+(school==="Kapłan"?1:0),{condition:({2:"prone",3:"bleeding",4:"poisoned",5:"slowed"})[s.state]});
  for(const [key,value] of Object.entries(s.extraAspects??{})){
    const def=EXTRA_ASPECTS[key],n=Number(value);if(!n)continue;
    if(!def||!Number.isInteger(n)||n<0||n>Number(def.max??100)){errors.push(`Niepoprawny aspekt ${key}`);continue;}
    const cost=def.exponential?2*(2**n-1):def.cost*n;
    extraCost+=cost;change+=discount(key,cost,{condition:s.removeCondition,stat:s.extraStat});
    if(["asleep","blind","fatigued","burning","stunned","frightened"].includes(key)){if(school==="Kapłan")extraCost+=1;change+=discount("condition",cost+(school==="Kapłan"?1:0),{condition:key});}
    c.bullets.push(`${def.label} ×${n} (${cost})`);
  }
  if(s.extraAspects?.removeCondition&&!s.removeCondition)errors.push("Wybierz stan usuwany przez cud.");
  const finalCost=Math.max(0,c.baseCost+extraCost+change-c.riskDiscount);
  const minOp=Number(s.tier)===2&&finalCost>=6?5:Number(s.tier)===3&&finalCost>=11?6:Number(s.tier)===4&&finalCost>=16?7:4;
  const book=s.book?resolveModifiers(1,"bookDelay",modifiers,context,0).value:0;
  const extraDelay=school==="Półmag"?Math.max(0,Math.min(2,Number(s.risks?.r_delay)||0))*3:0;
  const rawDelay=finalCost+1+extraDelay+book-Number(s.minusop||0)*3;
  const delayResult=resolveModifiers(rawDelay,"spellDelay",modifiers,context);trace.push(...delayResult.trace);
  const minimum=Math.max(0,modified(actor,minOp,"minimumDelay",{kind:"spell"}));
  const op=Math.max(minimum,modified(actor,delayResult.value,"delay",{kind:"spell"}));
  if(finalCost>c.maxCost)errors.push(`Koszt ${finalCost} przekracza limit ${c.maxCost}.`);
  if(s.reaction&&op!==4)errors.push("Zaklęcie reakcyjne musi mieć OP równe 4.");
  const sources=itemsOf(actor).filter(i=>i.type==="powerSource"&&i.system.equipped),source=s.sourceId?itemsOf(actor).find(i=>i.id===s.sourceId&&i.type==="powerSource"&&i.system.equipped):sources[0];
  if(s.sourceId&&!source)errors.push("Wybrane Źródło Mocy nie jest wyposażone / dostępne.");
  if(sources.length>1&&!s.sourceId)errors.push("Wybierz jedno z wyposażonych Źródeł Mocy.");
  if(!source)warnings.push("Brak wyposażonego Źródła Mocy: brak premii źródła.");
  if(s.customCost||s.risks?.r_custom_cost)warnings.push("Własny efekt / Ryzyko: koszt i działanie zatwierdza MG.");

  const sourceProfile=powerSourceProfile(source,Number(s.element)>0?s.elName:'');errors.push(...sourceProfile.errors);
  return {...c,baseCost:c.baseCost+extraCost,finalCost,minOp:minimum,op,errors,warnings,trace,sourceId:source?.id??"",sourceBonus:sourceProfile.test,sourcePoints:sourceProfile.bonus,sourceCriticalPoints:sourceProfile.critical,sourceDice:sourceProfile.dice,valid:errors.length===0};
}
