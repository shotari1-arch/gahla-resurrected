import {NS} from './effects-engine.mjs';
import {serial,requireOwner} from './automation-runtime.mjs';
const copy=v=>structuredClone(v);
export const getPath=(o,p)=>p.split('.').reduce((v,k)=>v?.[k],o);
export function ledgerState(actor){
 const state=copy(actor.flags?.[NS]?.development??{schema:1,opening:Number(actor.system.xp||0),entries:[]});
 const sum=state.opening+state.entries.reduce((n,e)=>n+e.delta,0),difference=Number(actor.system.xp||0)-sum;
 if(difference)state.entries.push(entry('adjustment','Korekta salda poza historią',difference));
 return state;
}
function entry(kind,label,delta,extra={}){return {id:foundry.utils.randomID(),date:new Date().toISOString(),kind,label,delta,...extra};}
export function ledgerPatch(actor,kind,label,delta,extra={}){
 const state=ledgerState(actor);state.entries.push(entry(kind,label,delta,extra));
 return {['flags.'+NS+'.development']:state};
}
export function ledgerView(actor){
 const state=ledgerState(actor),latest=state.entries.findLast(e=>e.kind==='purchase'&&!e.reverted);
 return {...state,rows:[...state.entries].reverse().map(e=>({...e,dateLabel:new Date(e.date).toLocaleDateString('pl-PL'),amount:(e.delta>0?'+':'')+e.delta,canUndo:e.id===latest?.id})),earned:state.entries.filter(e=>e.kind==='session').reduce((n,e)=>n+e.delta,0)};
}
export async function awardSessionXP(actor,label,amount){
 requireOwner(actor);const n=Number(amount);if(!String(label).trim()||!Number.isSafeInteger(n)||n<=0)throw Error('Podaj nazwę sesji i dodatnią całkowitą liczbę EXP.');
 return serial(actor.uuid,()=>actor.update({'system.xp':Number(actor.system.xp)+n,...ledgerPatch(actor,'session',String(label).trim(),n)}));
}
export function itemSnapshot(item){const raw=item.toObject?.()??item;return copy({name:raw.name,type:raw.type??item.type,system:raw.system,flags:raw.flags??{}});}
export async function undoPurchase(actor,id){
 requireOwner(actor);return serial(actor.uuid,async()=>{
  const state=ledgerState(actor),purchase=state.entries.findLast(e=>e.kind==='purchase'&&!e.reverted);
  if(!purchase||purchase.id!==id)throw Error('Cofaj zakupy od najnowszego, aby zachować wymagania późniejszych zakupów.');
  const undo=purchase.undo;if(!undo)throw Error('Ten stary zakup nie ma danych do cofnięcia.');
  for(const [key,v]of Object.entries(undo.after??{}))if(JSON.stringify(getPath(actor,key))!==JSON.stringify(v))throw Error('Zmieniono rozwój poza historią. Cofnięcie mogłoby nadpisać późniejsze zmiany.');
  for(const change of undo.items??[]){const item=actor.items.find(i=>i.id===change.id);if(!item||JSON.stringify(itemSnapshot(item))!==JSON.stringify(change.after))throw Error('Talent został zmieniony poza historią. Nie można bezpiecznie cofnąć zakupu.');}
  const completed=[];
  try{
   for(const change of undo.items??[]){const item=actor.items.find(i=>i.id===change.id);if(change.before)await item.update(change.before);else await item.delete();completed.push(change);}
   purchase.reverted=true;state.entries.push(entry('refund','Cofnięto: '+purchase.label,-purchase.delta,{purchaseId:id}));
   await actor.update({...undo.before,'system.xp':Number(actor.system.xp)-purchase.delta,['flags.'+NS+'.development']:state});
  }catch(error){
   for(const change of completed.reverse()){const item=actor.items.find(i=>i.id===change.id);if(item)await item.update(change.after);else await actor.createEmbeddedDocuments('Item',[{_id:change.id,...change.after}],{keepId:true});}
   throw error;
  }
 });
}
export function levelProgressionPatch(actor,target){
 if(actor.type!=='character')return {};
 const old=Number(actor.system.appliedLevel||1),level=Number(target);
 if(!Number.isInteger(level)||level<=old||level>11)return {};
 const experiences=[...(actor.system.experiences??[])],features=[...(actor.system.classFeatures??[])];
 for(const lvl of [3,6,11])if(lvl>old&&lvl<=level){experiences.push('Experience poziomu '+lvl+' — wpisz własne doświadczenie');features.push('Osobny Feature Ścieżki — poziom '+lvl+' — ustal z MG na podstawie wydarzeń, relacji i treningu');}
 return {'system.appliedLevel':level,'system.experiences':experiences,'system.classFeatures':features};
}
export function registerDevelopmentHooks(){
 Hooks.on('preUpdateActor',(actor,changes)=>{
  const level=changes['system.level']??changes.system?.level;
  if(level!==undefined&&changes['system.appliedLevel']===undefined&&changes.system?.appliedLevel===undefined)Object.assign(changes,levelProgressionPatch(actor,level));
  const xp=changes['system.xp']??changes.system?.xp;
  if(xp!==undefined&&!changes['flags.'+NS+'.development']&&!changes.flags?.[NS]?.development){const delta=Number(xp)-Number(actor.system.xp);if(delta)Object.assign(changes,ledgerPatch(actor,'adjustment','Zmiana EXP poza zakupami',delta));}
 });
}
export async function migrateDevelopment(){
 if(!game.user?.isGM)return;
 const gm=Array.from(game.users??[]).filter(u=>u.active&&u.isGM).sort((a,b)=>String(a.id).localeCompare(String(b.id)))[0];
 if(gm&&gm.id!==game.user.id)return;
 for(const actor of game.actors??[]){if(actor.type!=='character')continue;const patch=levelProgressionPatch(actor,actor.system.level);if(!actor.flags?.[NS]?.development)patch['flags.'+NS+'.development']=ledgerState(actor);if(Object.keys(patch).length)await actor.update(patch);}
}
