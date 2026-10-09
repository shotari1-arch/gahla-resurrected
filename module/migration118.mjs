import {ALL_TALENTS} from './content.mjs';
import {SPLIT_TALENTS,rankSteps,rankData,currentRank} from './talent-ranks.mjs';
import {profileForName,WEAPON_PROFILES} from './weapon-profiles.mjs';
const NS='gahla-resurrected',descriptions=new Set(['Szkolenie Mnicha','Naturalna Obrona','Nadludzka Siła','Bestialska Hybryda']);
export const splitId=(id,index)=>index?String(id).slice(0,12).padEnd(12,'x')+String(index).padStart(4,'0'):id;
export function migrateItemData118(raw){
 const data=structuredClone(raw);data.system={rank:0,maxRank:0,effectTier:0,requiredTier:0,costLevel:0,monkWeaponType:null,profileId:'',...data.system};if(data.flags?.[NS]?.talent118)return [data];
 if(data.type==='weapon'){if(!data.system.profileId&&!data.system.isRanged&&!data.system.reload)data.system.profileId=profileForName(data.name);return [data];}
 if(data.type!=='talent')return [data];
 const parts=SPLIT_TALENTS[data.name]??[[data.name,data.system.description]];
 return parts.map(([name],index)=>{const out=structuredClone(data),def=ALL_TALENTS.find(t=>t.name===name);if(!def)return out;
  const legacyLevel=Number(data.system.level)||1,rank=Math.max(1,rankSteps(def).filter(s=>s.effectTier<=legacyLevel).length);
  out.name=name;if(data._id)out._id=splitId(data._id,index);out.system={...out.system,...rankData(def,rank)};
  if(legacyLevel<rankSteps(def)[0].effectTier){out.system.level=legacyLevel;out.system.effectTier=legacyLevel;}
  if(parts.length>1||descriptions.has(name))out.system.description=def.description;
  if(name==='Szkolenie Mnicha')out.system.monkWeaponType??=null;
  out.flags??={};out.flags[NS]??={};Object.assign(out.flags[NS],{talent118:true,legacy118:{name:data.name,level:legacyLevel,description:data.system.description,maxLevel:data.system.maxLevel}});
  if(legacyLevel<rankSteps(def)[0].effectTier)out.flags[NS].legacyEffectPending118=true;
  if(parts.length>1){out.flags[NS].splitOrigin118=data._id;out.system.requirements=def.requirements;}
  if(data.name==='Doświadczony Wojak / Doświadczenie Strzelca')out.flags[NS].resourcePool118=data._id;
  return out;
 });
}
export function migrateLedger118(ledger){const result=structuredClone(ledger);for(const entry of result.entries??[]){const changes=[];for(const change of entry.undo?.items??[]){
 const after=migrateItemData118({_id:change.id,...change.after}),before=change.before?migrateItemData118({_id:change.id,...change.before}):[];
 after.forEach((a,index)=>{const b=before[index]??null;delete a._id;if(b)delete b._id;changes.push({id:splitId(change.id,index),before:b,after:a});});
 if(change.after?.type==='talent'){const def=ALL_TALENTS.find(d=>d.name===after[0].name);if(def){entry.rank=currentRank(after[0],def);entry.costLevel??=Number(change.after.system.level);entry.requiredTier=after[0].system.requiredTier;if(change.before&&change.after.system.level!==change.before.system.level&&after[0].system.effectTier===before[0]?.system.effectTier)entry.emptyLegacyPurchase=true;}}
 }if(entry.undo)entry.undo.items=changes;}return result;}
function snapshot(item){const raw=item.toObject?.()??item;return structuredClone({_id:item.id??raw._id,name:raw.name,type:raw.type,system:raw.system,flags:raw.flags??{}});}
async function migrateCollection(parent){for(const item of Array.from(parent.items??[])){
 const source=snapshot(item),parts=migrateItemData118(source);for(const extra of parts.slice(1)){const existing=Array.from(parent.items).find(i=>i.id===extra._id);if(existing&&existing.flags?.[NS]?.splitOrigin118!==source._id)throw Error('Kolizja ID migracji talentu '+extra.name);if(!existing)await parent.createEmbeddedDocuments('Item',[{...(item.toObject?.()??{}),...extra}],{keepId:true,gahlaMigration118:true});}
 if(JSON.stringify(source)!==JSON.stringify(parts[0])){const {_id,...patch}=parts[0];await item.update(patch,{gahlaMigration118:true});}
 }
 if(parent.flags?.[NS]?.development&&!parent.flags?.[NS]?.ledger118)await parent.update({['flags.'+NS+'.development']:migrateLedger118(parent.flags[NS].development),['flags.'+NS+'.ledger118']:true});
}
export async function migrate118(){if(!game.user.isGM||Array.from(game.users??[]).filter(u=>u.isGM&&u.active).sort((a,b)=>a.id.localeCompare(b.id))[0]?.id!==game.user.id)return;
 const actors=new Map(Array.from(game.actors??[]).map(a=>[a.uuid,a]));for(const scene of game.scenes??[])for(const t of scene.tokens??[])if(t.actor&&!t.actorLink)actors.set(t.actor.uuid,t.actor);for(const actor of actors.values())await migrateCollection(actor);
 const migrateWorld=async(collection,create)=>{for(const item of Array.from(collection)){const source=snapshot(item),parts=migrateItemData118(source);for(const extra of parts.slice(1)){const existing=Array.from(collection).find(i=>i.id===extra._id);if(existing&&existing.flags?.[NS]?.splitOrigin118!==source._id)throw Error('Kolizja ID migracji '+extra.name);if(!existing)await create({...item.toObject?.(),...extra});}if(JSON.stringify(source)!==JSON.stringify(parts[0])){const {_id,...patch}=parts[0];await item.update(patch,{gahlaMigration118:true});}}};
 await migrateWorld(game.items??[],data=>Item.create(data,{keepId:true,gahlaMigration118:true}));
 for(const pack of game.packs??[]){if(!['Item','Actor'].includes(pack.documentName)||!['world','gahla-resurrected'].includes(pack.metadata?.packageName))continue;const locked=pack.locked;try{const docs=await pack.getDocuments();if(locked)await pack.configure({locked:false});if(pack.documentName==='Actor')for(const actor of docs)await migrateCollection(actor);else await migrateWorld(docs,data=>Item.create(data,{pack:pack.collection,keepId:true,gahlaMigration118:true}));}finally{if(locked)await pack.configure({locked:true});}}
}
export function register118(){
 Hooks.on('preUpdateActor',(actor,changes)=>{const phase=changes['system.phase']??changes.system?.phase;if(phase===undefined)return;const automation=structuredClone(actor.flags?.[NS]?.automation??{});if((automation.temporary??[]).some(e=>e.requiresPhase&&e.requiresPhase!==phase)){automation.temporary=automation.temporary.filter(e=>!e.requiresPhase||e.requiresPhase===phase);changes['flags.'+NS+'.automation']=automation;}});
 Hooks.on('preCreateItem',(item,_data,options)=>{if(options?.gahlaMigration118)return;const raw=snapshot(item),parts=migrateItemData118(raw);if(parts.length===1){const {_id,...patch}=parts[0];item.updateSource(patch);}else{ui.notifications.warn('Importowany stary talent zbiorczy wymaga migracji 0.11.8 przy następnym uruchomieniu świata przez MG.');}});
 Hooks.on('preUpdateItem',(item,changes,options)=>{if(item.name!=='Szkolenie Mnicha'||options?.gahlaMigration118)return;const selection=Object.hasOwn(changes,'system.monkWeaponType')?changes['system.monkWeaponType']:changes.system?.monkWeaponType;if(selection===undefined)return;if(selection!==null&&!WEAPON_PROFILES[selection]){ui.notifications.warn('Niepoprawny profil Broni Mnicha.');return false;}if(item.system.monkWeaponType&&selection!==item.system.monkWeaponType&&!game.user.isGM){ui.notifications.warn('Broń Mnicha może zmienić tylko MG.');return false;}});
}
