import {talentUsable119} from './talent-eligibility.mjs';
import {fullForm119,formEffectActive119} from './form-canon119.mjs';
import {zoneModifiers119} from './talent-zones119.mjs';
/** Data-only modifiers. No eval, expressions, arbitrary paths, or persisted derived values. */
export const NS="gahla-resurrected";
export const itemsOf=a=>Array.from(a?.items?.contents??a?.items??[]);
export const flagData=a=>a?.flags?.[NS]??a?.getFlag?.(NS,"automation")??{};
export const levelOf=i=>Math.max(1,Math.min(4,Number(i?.system?.level)||1));
export function conditionLevel(actor,key){
  if((actor?.flags?.[NS]?.automation?.temporary??[]).filter(e=>formEffectActive119(actor,e)).some(e=>(e.effects??[]).some(r=>r.target==="ignoreCondition"&&r.when?.condition===key&&r.value)))return 0;
  const timed=Array.from(actor?.effects??[]).filter(e=>!e.disabled&&e.statuses?.has?.(`gahla-${key}`));
  const injuryStacks=(actor?.flags?.[NS]?.injuries??[]).filter(i=>i.active).reduce((n,i)=>n+Number(i.conditions?.[key]||0),0);
  const present=injuryStacks||timed.length||actor?.statuses?.has?.(`gahla-${key}`)||(actor?.system?.conditions??[]).includes(key);
  return present?Math.max(1,injuryStacks,Number(actor?.flags?.[NS]?.conditionLevels?.[key])||1,timed.reduce((n,e)=>n+Number(e.flags?.[NS]?.conditionLevel||1),0)):0;
}
const add=(target,value,when={})=>({target,op:"add",value,when});
const disadvantage=when=>add("disadvantage",1,when);
export const CONDITION_RULES={
  fatigued:[add("speed",-1),add("test",-10)],
  slowed:[add("speed",-3),add("defense",-20),add("delay",1)],
  hasted:[add("speed",3),add("defense",20),add("delay",-1)],
  prone:[disadvantage({kind:"attack"})],
  poisoned:[disadvantage({kind:"attack"}),disadvantage({stat:["sf","physicalResistance"]})],
  frozen:[disadvantage({stat:"zr"})],
  auraWeak:[disadvantage({ranged:true,kind:"attack"}),disadvantage({stat:"per"})],
  blind:[{target:"hitMultiplier",op:"multiply",value:0.5,when:{kind:"attack"}}]
};
export const TALENT_RULES={
  "Pazury i Kły":[add("hit",[0,10,10,20],{kind:"attack",natural:true}),add("attackDice",[1,2,2,3],{natural:true}),add("penetration",[0,0,1,1],{natural:true}),add("attackDelay",1,{natural:true})],
  "Duchowa Pięść":[add("penetration",[0,0,0,1],{natural:true})],
  "Przyspieszony Nurt":[add("aspectCost",-1,{school:"Kapłan",aspect:"minusop"}),add("aspectCost",-1,{school:"Kapłan",aspect:"speedBonus"})],
  "Światło Przewodnika":[add("aspectCost",-1,{school:"Kapłan",aspect:"speedBonus"}),add("aspectCost",-1,{school:"Kapłan",aspect:"statBonus",stat:"per"})],
  "Szał Bitewny":[add("aspectCost",-1,{school:"Kapłan",aspect:"battleDamage"}),add("aspectCost",-1,{school:"Kapłan",aspect:"battleHit"})],
  "Celny Cios":[add("hit",[5,10,15,20],{kind:"attack",ranged:false})],
  "Mocna Skóra":[{...add("threshold",1,{damageType:"physical"}),scale:"tier"}],
  "Naturalna Obrona":[add("threshold",[2,4,6,8],{damageType:"physical"}),add("physicalResistance",[0,5,5,10])],
  "Mocne Kości":[add("threshold",[1,1,2,2])],
  "Serce Burzy":[add("physicalResistance",10)],
  "Odporny Fizycznie":[add("physicalResistance",[5,10,15,20])],
  "Odporny Psychicznie":[add("mentalResistance",[5,10,15,20])],
  "Odporny Magicznie":[add("magicalResistance",[5,10,15,20])],
  "Odporny Duchowo":[add("spiritualResistance",[5,10,15,20])],
  "Specjalny Manewr":[{target:"maneuverFreeStars",op:"add",value:[2,3,4,5],when:{special:true}},add("maneuverSlots",1)],
  "Pamięć Maga":[{target:"mageSlots",op:"add",value:[1,2,3,4]}],
  "Święty Płomień":[add("aspectCost",-1,{school:"Kapłan",aspect:"element",element:["ogień","fire"]})],
  "Dotyk Litości":[add("aspectCost",-1,{school:"Kapłan",aspect:"heal"})],
  "Głos Wyroczni":[{target:"aspectCost",op:"set",value:0,when:{school:"Kapłan",aspect:"statBonus",stat:["per","er"]}}],
  "Głos Otuchy":[add("aspectCost",-1,{school:"Kapłan",aspect:"removeCondition"}),add("aspectCost",-1,{school:"Kapłan",aspect:"removeCondition",condition:"frightened"})],
  "Gniew Burzy":[add("aspectCost",-2,{school:"Kapłan",aspect:"element",element:["elektryczność","wiatr","lightning","wind"]})],
  "Szept z Mroku":[add("aspectCost",-1,{school:"Kapłan",aspect:"element",element:["cień","shadow"]})],
  "Spaczenie Materii":[{target:"aspectCost",op:"set",value:0,when:{school:"Kapłan",aspect:"element",element:["woda","ziemia","water","earth"]}},add("aspectCost",-1,{school:"Kapłan",aspect:"condition",condition:"poisoned"})],
  "Słowo Ostatniego Strażnika":[add("aspectCost",-1,{school:"Kapłan",aspect:"condition",condition:"frightened"})],
  "Biegłość Magiczna":[{target:"spellDelay",op:"add",value:[0,-1,-2,-3],when:{school:"Półmag"}},add("bookDelay",-1,{school:"Półmag"})]
};
export const ACTIVE_RULES={
 "Osłona Koncentracji":{id:"concentration119",minLevel:3,action:"concentration119"},
 "Wspinacz":{id:"climb119",action:"climb119"},
 "Sanktuarium Eruela":{id:"sanctuary119",minLevel:2,action:"sanctuary119"},
  "Gniew Gidy":{id:"gida119",max:[1,1,1,2],reset:"combat",action:"temporary",durationRounds:[2,4,4,4],element:"fire",effects:[]},
  "Żołnierz Burzy":{id:"storm119",max:[1,1,1,2],reset:"combat",action:"temporary",durationRounds:[2,4,4,4],element:"lightning",effects:[]},
  "Doświadczony Wojak":{id:"meleeReroll",max:[1,1,2,2],reset:"combat",action:"reroll",contexts:["attack"],attackMode:"melee"},
  "Doświadczenie Strzelca":{id:"rangedReroll",max:[1,1,2,2],reset:"combat",action:"reroll",contexts:["attack"],attackMode:"ranged"},
  "Naturalna Obrona":{id:"naturalDefense4",minLevel:4,max:1,reset:"round",action:"resistHit",note:"Jeden test Odp. Fizycznej przeciw stanowi wywołanemu otrzymanym trafieniem; zadeklaruj przed rzutem. Wymaga rozpoczętej walki do odliczania rund."},
  "Zmiennokształtny":{id:"shapeshifter4",requiresFullForm:true,minLevel:4,max:1,reset:"combat",requiresPhase:"beast",action:"temporary",durationRounds:2,note:"T4: raz na walkę, akcja darmowa; 2 rundy, tylko w aktywnej pełnej formie Zmiennokształtnego.",effects:[{target:"resistanceThreshold",op:"multiply",value:2,when:{damageType:"physical"}},{target:"ignoreCondition",op:"add",value:1,when:{condition:"fatigued"}},{target:"ignoreCondition",op:"add",value:1,when:{condition:"bleeding"}}]},
  "Doświadczenie Magiczne / Kapłańskie":{id:"spellReroll",max:[1,1,2,2],reset:"combat",action:"reroll",contexts:["spell"]},
  "Doświadczony Wojak / Doświadczenie Strzelca":{id:"attackReroll",max:[1,1,2,2],reset:"combat",action:"reroll",contexts:["attack"]},
  "Pierwsza Pomoc":{id:"firstAid",reset:"session",action:"firstAid",note:"Raz na sesję na dany cel dla tej postaci; leczy Rany według Tieru i usuwa jeden stan."},
  "Szybka Regeneracja":{id:"regeneration",max:[1,1,1,2],reset:"combat",action:"healOrCondition",amount:[1,2,3,4]},
  "Krwisty Metabolizm":{id:"blood",max:[1,2,3,4],reset:"scene",initial:0,action:"advantage",replenish:"blood"},
  "Nadludzka Siła":{id:"strength",max:1,reset:"combat",action:"temporary",duration:"round",effects:[{target:"sf",op:"multiply",value:2}],after:"fatigued"},
  "Przeczucie Przyszłości":{id:"foresight",max:[1,2,3,4],initial:0,reset:"manual",action:"foretell",note:"Źródło nie określa odnawiania wyników; pulę przyznaje MG."},
  "Spojrzenie w Przyszłość":{id:"question",max:[1,1,1,1],reset:"session",action:"announce"},
  "Rytuał Dwoistości":{id:"duality",max:[1,1,1,1],reset:"session",action:"roll",note:"Wynik interpretuje MG zgodnie z opisem talentu."}
};
export function ruleValue(value,level=1){return Array.isArray(value)?Number(value[level-1]??value.at(-1)):Number(value);}
export function matches(when={},context={}){
  return Object.entries(when).every(([key,expected])=>{
    const actual=context[key];return Array.isArray(expected)?expected.includes(actual):actual===expected;
  });
}
export function collectModifiers(actor){
  const out=(actor?.flags?.[NS]?.modifiers??[]).map((rule,index)=>({...rule,source:actor.name||"Postać",id:"actor:"+index}));
  for(const [key,rules] of Object.entries(CONDITION_RULES)){
    const stacks=conditionLevel(actor,key);if(!stacks)continue;
    for(const rule of rules)out.push({...rule,value:ruleValue(rule.value)*(key==="fatigued"?stacks:1),source:`Stan: ${key}`,id:`condition:${key}:${rule.target}`});
  }
  const fearSource=actor?.flags?.[NS]?.conditionSources?.frightened;
  if(fearSource&&conditionLevel(actor,"frightened"))out.push({target:"disadvantage",op:"add",value:1,source:"Przerażenie",when:{targetUuid:fearSource}});
  for(const item of itemsOf(actor)){
    if(item.type==="talent"?(!item.system?.learned||!talentUsable119(actor,item)):(!item.system?.equipped||item.type==="armor"&&fullForm119(actor)))continue;
    if(item.system?.deity&&item.system.deity!==actor?.system?.deity)continue;
    const rules=[...(item.type==="talent"?TALENT_RULES[item.name]??[]:[]),...(item.flags?.[NS]?.modifiers??[])];
    rules.forEach((rule,index)=>out.push({...rule,value:ruleValue(rule.value,levelOf(item))*(rule.scale==="tier"?Math.max(1,Math.min(4,Number(actor?.system?.derived?.tier)||1)):1),source:item.name,id:`${item.id}:${index}`}));
  }
  for(const effect of (actor?.flags?.[NS]?.automation?.temporary??[]).filter(e=>formEffectActive119(actor,e))) for(const rule of effect.effects??[])out.push({...rule,source:effect.name,id:`temporary:${effect.id}:${rule.target}`});
  for(const injury of actor?.flags?.[NS]?.injuries??[])if(injury.active)for(const rule of injury.modifiers??[])out.push({...rule,when:{...rule.when,...(rule.when?.location==='affected'?{location:injury.location}:{})},source:'LW: '+injury.title,id:'injury:'+injury.id+':'+rule.target});
  for(const effect of actor?.effects??[])if(!effect.disabled)for(const rule of effect.flags?.[NS]?.modifiers??[])out.push({...rule,source:effect.name,id:`effect:${effect.id}:${rule.target}`});
  if(fullForm119(actor))out.push({target:"attackDice",op:"add",value:1,when:{unarmed:true},source:"Zmiennokształtny T1",id:"form119:unarmed"});
  return [...out,...zoneModifiers119(actor)];
}
export function resolveModifiers(base,target,modifiers=[],context={},minimum=-Infinity){
  let value=Number(base);const trace=[];
  // Stable phases make effects independent of item collection order.
  for(const op of ["add","multiply","set","min","max"]){
    for(const rule of modifiers){
      if(rule.target!==target||rule.op!==op||!Number.isFinite(Number(rule.value))||!matches(rule.when,context))continue;
      const before=value,n=Number(rule.value);
      value=op==="add"?value+n:op==="multiply"?value*n:op==="set"?n:op==="min"?Math.min(value,n):Math.max(value,n);
      trace.push({source:rule.source,id:rule.id,before,after:value});
    }
  }
  return {value:Math.max(minimum,value),trace};
}
export function modified(actor,base,target,context={},minimum=-Infinity){return resolveModifiers(base,target,collectModifiers(actor),context,minimum).value;}
export function activeRule(item){if(item?.name==="Bestialska Hybryda")return null;if(ACTIVE_RULES[item?.name]?.minLevel>levelOf(item))return null;return item?.type==="talent"&&item.system?.learned?(/WIP/i.test(item.system?.description??"")?null:item.flags?.[NS]?.activity??ACTIVE_RULES[item.name]??null):null;}
export function resourceState(actor,item){
  const rule=activeRule(item);if(!rule)return null;
  let saved=actor.flags?.[NS]?.automation?.resources?.[item.flags?.[NS]?.resourcePool118??item.id]??{};
  if(rule.reset==='round'&&(saved.combatId!==globalThis.game?.combat?.id||saved.round!==Number(globalThis.game?.combat?.round)))saved={};
  if(rule.reset==='combat'&&saved.combatId&&saved.combatId!==globalThis.game?.combat?.id)saved={};
  const max=rule.max?ruleValue(rule.max,levelOf(item)):null;
  return {...saved,max,remaining:max===null?null:Math.max(0,Math.min(max,Number(saved.remaining??rule.initial??max))),rule};
}

