import { calculateActorAbility, EXTRA_ASPECTS } from './ability-automation.mjs';
import { serial, activateTalent } from './automation-runtime.mjs';
import { NS, itemsOf, resourceState } from './effects-engine.mjs';
import { CONDITIONS, ELEMENTS, evaluateTest, rollD100, parseDiceFormula } from './rules.mjs';
import { elementKey } from './canonical-rules.mjs';
export function qualityChoices(state,actor,remaining){
 state={...state,...(!state.selfTarget&&!state.aoe?{targetCount:Number(state.targetCount)||1}:{}),...(state.aoe?{areaUnits:Number(state.areaUnits)||1}:{})};
 const base=calculateActorAbility(state,actor),choices=[];
 const fields={dmg:'Obrażenia',pen:'Penetracja',element:'Poziom elementu',heal:'Leczenie',temphp:'Tymczasowe ŻYW',hitbonus:'Trafienie',armorminus:'Osłabienie pancerza',hitminus:'Osłabienie trafienia',odpminus:'Osłabienie odporności',range:'Zasięg',duration:'Długość',targetCount:'Liczba celów',areaUnits:'Obszar'};
 for(const [key,label] of Object.entries(fields)){
  if(!(Number(state[key])>0))continue;
  if(['element','range'].includes(key)&&Number(state[key])>=3)continue;
  if(key==='targetCount'&&(state.selfTarget||state.aoe)||key==='areaUnits'&&!state.aoe)continue;
  const next={...state,[key]:Number(state[key])+1},calc=calculateActorAbility(next,actor),cost=calc.finalCost-base.finalCost;
  if(cost>0&&cost<=remaining)choices.push({key,label,cost,next});
 }
 for(const [key,value]of Object.entries(state.extraAspects??{})){
  const def=EXTRA_ASPECTS[key];if(!def||!Number(value)||Number(value)>=Number(def.max??100))continue;
  const next={...state,extraAspects:{...state.extraAspects,[key]:Number(value)+1}},cost=calculateActorAbility(next,actor).finalCost-base.finalCost;
  if(cost>0&&cost<=remaining)choices.push({key:'extra:'+key,label:def.label,cost,next});
 }
 return choices;
}
export async function allocateSpellQuality(state,actor,points){
 let current=structuredClone(state),left=points;const spent=[];
 while(left>0){
  const choices=qualityChoices(current,actor,left);if(!choices.length)break;
  const fd=await foundry.applications.api.DialogV2.input({window:{title:'Jakość czaru — '+left+' pkt'},content:'<p>Wzmacniaj istniejące aspekty. OP pozostaje bez zmian.</p><select name="choice"><option value="">Zakończ</option>'+choices.map((c,i)=>'<option value="'+i+'">'+foundry.utils.escapeHTML(c.label)+' +1 ('+c.cost+' pkt)</option>').join('')+'</select>',ok:{label:'Wybierz'}});
  if(!fd||fd.choice==='')break;const choice=choices[Number(fd.choice)];if(!choice)break;
  current=choice.next;left-=choice.cost;spent.push(choice.label+' +1');
 }
 return {state:current,spent,remaining:left};
}
export const spellConditionDefinition=key=>CONDITIONS[key]??(key==='pushed'?{label:'Pchnięcie',resist:'physical'}:null);
export function spellConditions(state){
 const choices=({2:['prone','burning'],3:['bleeding','stunned'],4:['poisoned','frightened'],5:['slowed']})[state.state]??[];
 const extras=Object.keys(state.extraAspects??{}).filter(k=>Number(state.extraAspects[k])>0&&CONDITIONS[k]);
 const element=Number(state.element)>0?ELEMENTS[elementKey(state.elName)]:null;
 return {choices,keys:[...new Set([...extras,...(state.haste?['hasted']:[]),...(element?.condition&&spellConditionDefinition(element.condition)?[element.condition]:[])])]};
}
/** Only explicit damaging/debilitating aspects identify a main offensive cast. */
export function isOffensiveSpell(system={},state={}){
 const conditions=spellConditions(state);
 return parseDiceFormula(system.damage).count>0||Number(state.dmg)>0
  ||['armorminus','hitminus','odpminus'].some(k=>Number(state[k])>0)
  ||['statPenalty','allTestsPenalty','speedPenalty','thresholdPenalty','vulnerability'].some(k=>Number(state.extraAspects?.[k])>0)
  ||conditions.choices.length>0||conditions.keys.some(k=>k!=='hasted');
}
export async function handleSpellCondition(button){
 if(button.dataset.action!=='gahla-spell-condition')return false;
 const message=game.messages.get(button.closest('[data-message-id]')?.dataset.messageId),cast=message?.flags?.[NS]?.spellCast??message?.flags?.[NS]?.effectCast;if(!cast)return true;
 if(button.dataset.target!==cast.target)throw Error("Cel nie należy do tej karty.");
 const target=await fromUuid(cast.target);if(!target?.isOwner&&!game.user.isGM)throw Error('Brak uprawnień celu.');
 const attacker=await fromUuid(cast.attacker);if(attacker?.flags?.[NS]?.attacks?.[message.id]?.replaced)throw Error('Ta karta została zastąpiona przerzutem.');
 return serial('spell-effect:'+target.uuid,async()=>{
 const key=button.dataset.condition,allowed=spellConditions(cast.state),id=message.id+'-'+key;
 if(!allowed.keys.includes(key)&&!allowed.choices.includes(key))throw Error('Stan nie należy do tego czaru.');
 if(target.flags?.[NS]?.spellEffects?.[id])throw Error('Ten efekt już rozstrzygnięto.');
 // Paired legacy selectors require a single explicit choice; never apply both.
 if(allowed.choices.includes(key)&&allowed.choices.some(k=>target.flags?.[NS]?.spellEffects?.[message.id+'-'+k]))throw Error('Wybrany aspekt został już rozstrzygnięty.');
 const element=ELEMENTS[elementKey(cast.state.elName)];
 const def=spellConditionDefinition(key);
 const resist=element?.condition===key?element.resist:def.resist,threshold=Number(target.system.derived[resist+'Resistance']||0);
 const natural=itemsOf(target).find(i=>i.name==='Naturalna Obrona'&&i.system.learned&&Number(i.system.level)>=4);
 const eligible=natural&&resist==='physical'&&game.combat?.started&&(cast.mode==='weapon'||parseDiceFormula(cast.system?.damage).count>0)&&resourceState(target,natural)?.remaining>0;
 let roll,result;
 if(eligible&&await foundry.applications.api.DialogV2.confirm?.({window:{title:'Naturalna Obrona T4'},content:'<p>Użyć raz na rundę Ułatwienia do tego testu Odporności Fizycznej przeciw stanowi po otrzymanym trafieniu?</p>'})){
  result=await activateTalent(target,natural.id);if(!result)return false;roll={final:result.roll};
 }else{roll=rollD100();result=key==='hasted'?{success:false}:evaluateTest(roll.final,threshold);}
 await target.setFlag(NS,'spellEffects',{...target.flags?.[NS]?.spellEffects,[id]:true});
 if(!result.success){
  if(key==='shocked'&&(target.system.combat.longDebt||target.system.combat.longReady))await target.trackerCancelLong();
  if(key==='auraWeak')await target.update({'system.combat.aura.value':Math.max(0,Number(target.system.combat.aura.value)-Math.max(1,Number(cast.state.element)||1))});
  if(key==='pushed')await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:target}),content:'<p>Pchnięcie '+(2*Math.max(1,Number(cast.state.element)||1))+' m. MG wskazuje kierunek i przemieszcza token.</p>'});
  const rounds=Number(cast.state.duration)||0;
  if(cast.mode==='weapon'){
   const old=Number(target.flags?.[NS]?.conditionLevels?.[key])||((target.system.conditions??[]).includes(key)?1:0);
   await target.toggleCondition(key,true);
   if(key==='bleeding')await target.update({[`flags.${NS}.conditionLevels.${key}`]:old+1});
  }
  else if(key==='pushed'||key==='shocked'){}
  else if(!rounds){ui.notifications.warn('Stan ma długość 0 — brak określonego czasu utrzymania. MG rozstrzyga efekt natychmiastowy.');}
  else{
   await target.createEmbeddedDocuments('ActiveEffect',[{name:def.label,statuses:['gahla-'+key],changes:[],duration:{units:"rounds",value:rounds,expiry:"roundStart"},start:{combat:game.combat?.id??null,round:Number(game.combat?.round)||0,turn:game.combat?.turn??null,time:game.time?.worldTime??0},flags:{[NS]:{spellDuration:{combatId:game.combat?.id,expiresRound:Number(game.combat?.round)+rounds,key},conditionLevel:element?.condition===key?Math.max(1,Number(cast.state.element)||1):1}}}]);
   if(key==='shocked'&&(target.system.combat.longDebt||target.system.combat.longReady))await target.trackerCancelLong();
  }
 }
 await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:target}),content:'<p>'+def.label+': odporność '+roll.final+'/'+threshold+' — '+(result.success?'uniknięto stanu':'efekt rozstrzygnięty')+'. Obrażenia są rozliczane osobno.</p>'});return true;
 });
}
