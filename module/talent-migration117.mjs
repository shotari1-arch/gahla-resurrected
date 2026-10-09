import {ALL_TALENTS} from './content.mjs';
const NS='gahla-resurrected';
const names=new Set(['Mocna Skóra','Naturalna Obrona','Bestialska Hybryda','Święty Płomień']);
export function talent117Patch(item){
 if(item.type!=='talent'||item.flags?.[NS]?.talent117)return null;
 const def=names.has(item.name)?ALL_TALENTS.find(t=>t.name===item.name):null;
 const race=['Jestestwo Taurosa','Jestestwo Krasnoluda','Jestestwo Erusanina'].includes(item.name);
 if(!def&&!race)return null;
 const old=String(item.system?.description??''),description=def?.description??old.replace('Mocna Skóra za darmo.','Mocna Skóra za darmo: +Tier do Fizycznego Progu I i II, bez zmiany Pancerza i testów Odporności.');
 return {['flags.'+NS+'.talent117']:true,['flags.'+NS+'.talent117Previous']:{description:old,maxLevel:item.system?.maxLevel??4},'system.description':description,...(def?{'system.maxLevel':def.maxLevel}:{})};
}
function patchObject(object,patch){for(const [path,value]of Object.entries(patch)){const keys=path.split('.');let ref=object;for(const k of keys.slice(0,-1))ref=ref[k]??={};ref[keys.at(-1)]=structuredClone(value);}return object;}
export function talent117Ledger(ledger){
 const next=structuredClone(ledger);
 for(const entry of next.entries??[])for(const change of entry.undo?.items??[])for(const key of ['before','after'])if(change[key]){const p=talent117Patch(change[key]);if(p)patchObject(change[key],p);}
 return next;
}
export async function migrateTalents117(){
 if(!game.user.isGM||Array.from(game.users??[]).find(u=>u.isGM&&u.active)?.id!==game.user.id)return;
 const actors=new Map(Array.from(game.actors??[]).map(a=>[a.uuid,a]));
 for(const scene of game.scenes??[])for(const token of scene.tokens??[])if(token.actor&&!token.actorLink)actors.set(token.actor.uuid,token.actor);
 const migrateItem=async item=>{const p=talent117Patch(item);if(p)await item.update(p,{gahlaCanonicalMigration:true});};
 const migrateActor=async actor=>{
  for(const item of actor.items??[])await migrateItem(item);
  if(actor.flags?.[NS]?.development&&!actor.flags?.[NS]?.ledger117)await actor.update({['flags.'+NS+'.development']:talent117Ledger(actor.flags[NS].development),['flags.'+NS+'.ledger117']:true});
 };
 for(const item of game.items??[])await migrateItem(item);
 for(const actor of actors.values())await migrateActor(actor);
 // World/system-owned Gahla packs, preserving their original lock setting even on failure.
 for(const pack of game.packs??[]){
  if(!['Item','Actor'].includes(pack.documentName)||!['world','gahla-resurrected'].includes(pack.metadata?.packageName))continue;
  const docs=await pack.getDocuments();
  if(!docs.some(d=>pack.documentName==='Item'?talent117Patch(d):Array.from(d.items??[]).some(talent117Patch)))continue;
  const locked=pack.locked;
  try{if(locked)await pack.configure({locked:false});for(const doc of docs)await (pack.documentName==='Item'?migrateItem(doc):migrateActor(doc));}
  finally{if(locked)await pack.configure({locked:true});}
 }
}
export function registerTalents117(){Hooks.on('preCreateItem',item=>{const p=talent117Patch(item);if(p)item.updateSource(p);});}
