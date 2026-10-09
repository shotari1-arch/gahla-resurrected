import {canonicalTalentName,normalizeCanonText} from './canon-names.mjs';
import {ALL_TALENTS,WEAPONS} from './content.mjs';
const NS='gahla-resurrected';
const changedRules=new Set(['Kontrolowana Sekwencja','Mistrz Tarczy','Runotwórstwo','Mistrz Run','Bestialska Hybryda','Zmiennokształtny','Sokole Oko','Wielostrzał','Śmiertelny Cios']);
function migrateSnapshot(snapshot){
 if(!snapshot)return snapshot;const patch=canonItemPatch(snapshot);if(!patch)return snapshot;
 for(const [path,value]of Object.entries(patch)){const keys=path.split('.');let ref=snapshot;for(const key of keys.slice(0,-1))ref=ref[key]??={};ref[keys.at(-1)]=value;}return snapshot;
}
export function migrateCanonLedger(ledger){
 if(!ledger)return ledger;const next=structuredClone(ledger);
 for(const entry of next.entries??[]){entry.label=normalizeCanonText(entry.label);for(const change of entry.undo?.items??[]){migrateSnapshot(change.before);migrateSnapshot(change.after);}}
 return next;
}
export function canonItemPatch(item){
 if(item.flags?.[NS]?.canon115)return null;
 const s=item.system??{},name=canonicalTalentName(item.name),patch={['flags.'+NS+'.canon115']:true};
 if(item.type==='talent'){
  if(name!==item.name){patch.name=name;patch['flags.'+NS+'.legacyName']=item.name;}
  const def=ALL_TALENTS.find(t=>t.name===name&&(!s.category||s.category===t.category));
  for(const key of ['description','requirements']){
   const value=changedRules.has(name)&&def?def[key]??'':normalizeCanonText(s[key]);
   if(value!==s[key]){patch['system.'+key]=value;patch['flags.'+NS+'.canon115Previous.'+key]=s[key]??'';}
  }
 }
 const ranged=item.type==='weapon'&&WEAPONS.find(w=>w.name===item.name&&w.system.isRanged);
 if(ranged){patch['flags.'+NS+'.canon115Previous.weapon']=structuredClone(s.toObject?.()??s);for(const key of ['damage','delay','reload','hands','traits','runSlots','penetration','isRanged','damageStat','woundProfile'])patch['system.'+key]=structuredClone(ranged.system[key]??(key==='damageStat'?'':0));}
 // Preserve the legacy field and every document ID. No delete/create migration.
 if(item.type==='armor'&&s.isShield&&!s.shieldLocations?.length)patch['system.shieldLocations']=[s.shieldLocation||'body'];
 return patch;
}
export async function migrateCanon115(){
 if(!game.user.isGM||Array.from(game.users??[]).find(u=>u.isGM&&u.active)?.id!==game.user.id)return;
 const actors=new Map(Array.from(game.actors??[]).map(a=>[a.uuid,a]));
 for(const scene of game.scenes??[])for(const token of scene.tokens??[])if(token.actor&&!token.actorLink)actors.set(token.actor.uuid,token.actor);
 for(const item of game.items??[]){const p=canonItemPatch(item);if(p)await item.update(p,{gahlaCanonicalMigration:true});}
 for(const actor of actors.values()){
  for(const item of actor.items??[]){const p=canonItemPatch(item);if(p)await item.update(p,{gahlaCanonicalMigration:true});}
  if(actor.flags?.[NS]?.development&&!actor.flags?.[NS]?.ledgerCanon115)await actor.update({['flags.'+NS+'.development']:migrateCanonLedger(actor.flags[NS].development),['flags.'+NS+'.ledgerCanon115']:true});
  if(['lotr','łotr'].includes(String(actor.system.archetype).toLowerCase()))await actor.update({'system.archetype':'lowca',['flags.'+NS+'.legacyArchetype']:actor.system.archetype});
 }
}
export function registerCanon115(){Hooks.on('preCreateItem',(item)=>{const p=canonItemPatch(item);if(p)item.updateSource(p);});}
