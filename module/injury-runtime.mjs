import {NS} from './effects-engine.mjs';
import {requireOwner,requireGM,serial} from './automation-runtime.mjs';
export const injuriesOf=actor=>structuredClone(actor.flags?.[NS]?.injuries??[]);
export const movementFactor=actor=>injuriesOf(actor).some(i=>i.active&&i.halfMovement)?0.5:1;
export const disabledLocations=actor=>new Set(injuriesOf(actor).filter(i=>i.active&&i.disabledLocation).map(i=>i.location));
export async function injuryContext(actor,{location='',movement=false,prompt=true,attack=false,weapon=null}={}){
 const injuries=injuriesOf(actor).filter(i=>i.active),disabled=disabledLocations(actor);
 const contextual=injuries.some(i=>i.disabledLocation||(i.modifiers??[]).some(m=>m.when?.location||m.when?.movement));
 if(attack&&Number(weapon?.system.hands)>=1.5&&['leftArm','rightArm'].some(l=>disabled.has(l)))throw Error('Broń oburęczna wymaga obu sprawnych rąk.');
 if(contextual&&prompt&&!location){
  const fd=await foundry.applications.api.DialogV2.input({window:{title:'Trwałe Rany — używana lokacja'},position:{width:520,height:'auto'},content:'<div class="gahla-roll-dialog"><label>Czynność wykonywana<select name="location">'+(attack?'':'<option value="">Bez użycia zranionej kończyny</option>')+'<option value="rightArm">Prawą ręką</option><option value="leftArm">Lewą ręką</option>'+(attack?'':'<option value="rightLeg">Prawą nogą</option><option value="leftLeg">Lewą nogą</option>')+'</select></label>'+(!attack?'<label><input type="checkbox" name="movement"> Ruchowy test ZR</label>':'')+'</div>',ok:{label:'Uwzględnij skutki'}});if(!fd)return null;
  location=String(fd.location||'');movement=Boolean(fd.movement);
 }
 if(disabled.has(location))throw Error('Wybrana lokacja jest niesprawna. Wybierz legalną czynność lub skoryguj skutek po leczeniu.');
 return {location,movement};
}
export async function recordInjury(actor,resolved,context={}){
 const injury={id:foundry.utils.randomID(),date:new Date().toISOString(),...structuredClone(resolved),location:context.location??resolved.location,score:context.score,source:context.source??'',active:false,stabilized:false,remaining:Number(resolved.deathRisk||0),clock:null};
 const injuries=injuriesOf(actor);injuries.push(injury);await actor.update({['flags.'+NS+'.injuries']:injuries});return injury;
}
export async function applyInjury(actor,id){requireOwner(actor);return serial('injury:'+actor.uuid,async()=>{
 const list=injuriesOf(actor),entry=list.find(i=>i.id===id);if(!entry||entry.active)return false;
 entry.active=true;entry.clock=game.combat?.started?{combat:game.combat.id,round:Number(game.combat.round),firstBoundary:true}:null;
 const patch={['flags.'+NS+'.injuries']:list};if(entry.terminal){patch['flags.'+NS+'.dead']=true;patch['system.combat.deadly']=true;}
 if(entry.conditions?.stunned)patch['flags.'+NS+'.stunConsumed']=false;
 await actor.update(patch);return true;
});}
export async function stabilizeInjuries(actor){requireOwner(actor);const list=injuriesOf(actor);for(const injury of list)if(injury.active&&injury.remaining>0)injury.stabilized=true;await actor.update({['flags.'+NS+'.injuries']:list});}
export async function tickInjuries(actor,combat,{fullRound=false}={}){
 const list=injuriesOf(actor);let changed=false,dead=false;
 for(const injury of list){if(!injury.active||injury.stabilized||injury.remaining<=0)continue;
  if(fullRound){injury.remaining--;changed=true;}
  else {const round=Number(combat.round);if(!injury.clock||injury.clock.combat!==combat.id){injury.clock={combat:combat.id,round,firstBoundary:false};changed=true;continue;}
   if(round<=injury.clock.round)continue;
   let elapsed=round-injury.clock.round;if(injury.clock.firstBoundary){elapsed--;injury.clock.firstBoundary=false;}injury.clock.round=round;injury.remaining=Math.max(0,injury.remaining-elapsed);changed=true;
  }
  if(injury.remaining===0){injury.death=true;dead=true;}
 }
 if(changed)await actor.update({['flags.'+NS+'.injuries']:list,...(dead?{['flags.'+NS+'.dead']:true,'system.combat.deadly':true}:{})});return {dead};
}
export async function injuryAction(actor,id,action){
 if(action==='apply')return applyInjury(actor,id);
 requireGM();if(action==='stabilize')return stabilizeInjuries(actor);if(action==='round'){if(game.combat?.started&&game.combat.combatants?.some(c=>c.actor?.uuid===actor.uuid))throw Error('W Trackerze odliczanie odbywa się automatycznie.');return tickInjuries(actor,null,{fullRound:true});}
 const list=injuriesOf(actor),entry=list.find(i=>i.id===id);if(!entry)return;
 if(action==='remove'){const kept=list.filter(i=>i.id!==id);await actor.update({['flags.'+NS+'.injuries']:kept,['flags.'+NS+'.dead']:kept.some(i=>i.active&&(i.terminal||i.death))});return;}
 if(action==='edit'){
  const esc=foundry.utils.escapeHTML,check=(key,label,value)=>'<label><input type="checkbox" name="'+key+'" '+(value?'checked':'')+'> '+label+'</label>';
  const penalties=(entry.modifiers??[]).map((m,n)=>'<label>Kara '+esc(m.target)+' '+esc(Object.values(m.when??{}).join(' / '))+'<input type="number" name="mod'+n+'" value="'+Number(m.value)+'"></label>').join('');
  const states=['bleeding','fatigued','stunned'].map((k,n)=>'<label>'+['Krwawienie','Zmęczenie','Oszołomienie'][n]+'<input type="number" name="state_'+k+'" min="0" value="'+Number(entry.conditions?.[k]||0)+'"></label>').join('');
  const fd=await foundry.applications.api.DialogV2.input({window:{title:'Leczenie / edycja Trwałej Rany'},position:{width:600,height:'auto'},content:'<div class="gahla-roll-dialog"><label>Opis<textarea name="effect">'+esc(entry.effect)+'</textarea></label>'+check('active','Skutki aktywne',entry.active)+check('stabilized','Ustabilizowano',entry.stabilized)+check('disabledLocation','Lokacja niesprawna',entry.disabledLocation)+check('halfMovement','Połowa maksymalnego ruchu',entry.halfMovement)+check('death','Śmierć wskutek tej rany',entry.terminal||entry.death)+'<label>Pozostałe pełne rundy<input name="remaining" type="number" min="0" max="3" value="'+entry.remaining+'"></label>'+states+penalties+'<p>Wyłączenie skutków usuwa kary tej rany. Sam Długi Odpoczynek nie usuwa wpisu.</p></div>',ok:{label:'Zapisz'}});if(!fd)return;
  const remaining=Number(fd.remaining);if(!Number.isInteger(remaining)||remaining<0||remaining>3)throw Error('Niepoprawne odliczanie.');
  for(const [n,m]of (entry.modifiers??[]).entries()){const value=Number(fd['mod'+n]);if(!Number.isFinite(value))throw Error('Niepoprawna kara.');m.value=value;}
  entry.conditions??={};for(const k of ['bleeding','fatigued','stunned']){const n=Number(fd['state_'+k]);if(!Number.isInteger(n)||n<0)throw Error('Niepoprawny poziom stanu.');entry.conditions[k]=n;}
  const restarting=!entry.active||entry.remaining!==remaining;
  Object.assign(entry,{effect:String(fd.effect),active:Boolean(fd.active),stabilized:Boolean(fd.stabilized),disabledLocation:Boolean(fd.disabledLocation),halfMovement:Boolean(fd.halfMovement),terminal:Boolean(fd.death),death:Boolean(fd.death),remaining});
  if(restarting)entry.clock=game.combat?.started?{combat:game.combat.id,round:Number(game.combat.round),firstBoundary:true}:null;
  await actor.update({['flags.'+NS+'.injuries']:list,['flags.'+NS+'.dead']:list.some(i=>i.active&&(i.terminal||i.death))});
 }
}
export function injuryModifiers(actor){return (actor?.flags?.[NS]?.injuries??[]).filter(i=>i.active).flatMap(i=>(i.modifiers??[]).map(m=>({...m,when:{...m.when,...(m.when?.location==='affected'?{location:i.location}:{})},source:'LW: '+i.title,id:'injury:'+i.id+':'+m.target})));}
