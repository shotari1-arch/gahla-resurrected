import { NS, itemsOf } from './effects-engine.mjs';
import { preparationErrors, powerSourceProfile, elementKey, spellDamageType } from './canonical-rules.mjs';
const dialog=()=>foundry.applications.api.DialogV2;
const own=doc=>{if(!doc?.isOwner&&!game.user.isGM)throw Error('Brak uprawnień.');};
export async function togglePreparationPlan(item){
 const actor=item.parent;if(!actor||!['spell','maneuver'].includes(item.type))return;own(actor);
 const plan=[...(actor.flags?.[NS]?.preparationPlan??itemsOf(actor).filter(i=>i.system.prepared).map(i=>i.id))];
 const next=plan.includes(item.id)?plan.filter(id=>id!==item.id):[...plan,item.id];
 const errors=preparationErrors(actor,next);if(errors.length)return ui.notifications.warn(errors.join('; '));
 await actor.setFlag(NS,'preparationPlan',next);
 ui.notifications.info((next.includes(item.id)?'Dodano do':'Usunięto z')+' planu: '+item.name+'. Zmiana wejdzie w życie po Długim Odpoczynku.');
}
export async function configureSource(item){
 own(item);const tier=Math.max(1,Math.min(4,Number(item.system.sourceTier)||1));
 const choices={'':'Niewybrane',test:'+10 UM/WIA',aura:'+1 maksimum Aury',quality:'+1 pkt bonus / +2 krytyk',...Object.fromEntries(['fire','water','earth','wind','light','shadow','lightning','ice'].map(e=>['element:'+e,'+1k10: '+e]))};
 const content='<p>Baza +5 do UM/WIA. Każdy slot jest jednym wyborem.</p>'+Array.from({length:tier},(_,i)=>'<label>Slot '+(i+1)+' <select name="slot'+i+'">'+Object.entries(choices).map(([k,v])=>'<option value="'+k+'" '+(item.system.enchantments?.[i]===k?'selected':'')+'>'+v+'</option>').join('')+'</select></label>').join('');
 const fd=await dialog().input({window:{title:'Umagicznienie Źródła Mocy'},content,ok:{label:'Zapisz wybory'}});if(!fd)return;
 const slots=Array.from({length:tier},(_,i)=>fd['slot'+i]).filter(Boolean),p=powerSourceProfile({system:{sourceTier:tier,enchantments:slots}});
 await item.update({'system.enchantments':slots,'system.sourceTestBonus':p.test,'system.sourceBonusPoints':p.bonus,[`flags.${NS}.sourceNeedsReview`]:false});
}
export async function equipItem(item){
 own(item);const actor=item.parent;if(!actor)return;
 if(item.type==='powerSource'&&!item.system.equipped)await actor.updateEmbeddedDocuments('Item',itemsOf(actor).filter(i=>i.type==='powerSource'&&i.id!==item.id&&i.system.equipped).map(i=>({_id:i.id,'system.equipped':false})));
 if(item.type!=='weapon')return item.update({'system.equipped':!item.system.equipped});
 const combatant=game.combat?.started&&game.combat.combatants.find(c=>c.actor?.uuid===actor.uuid);
 const equipped=itemsOf(actor).filter(i=>i.type==='weapon'&&i.system.equipped),empty=equipped.length===0;
 const fd=await dialog().input({window:{title:'Broń — dobycie / zmiana zestawu'},content:'<select name="mode">'+(empty&&!actor.hasCondition?.('surprised')?'<option value="draw">Dobycie do pustej ręki — 0, jeśli sytuacja pozwala</option>':'')+'<option value="switch">Pełna zmiana zestawu — 3 segmenty</option><option value="pack">Plecak / trudny dostęp — koszt MG</option></select><label>Koszt MG <input type="number" name="cost" min="0" value="3"></label>',ok:{label:'Wykonaj'}});if(!fd)return;
 const cost=fd.mode==='draw'?0:fd.mode==='switch'?3:Number(fd.cost);
 if(!Number.isInteger(cost)||cost<0)return ui.notifications.warn('Niepoprawny koszt.');
 if(combatant&&cost&&!await game.combat.spendSegments(cost,combatant.id,{advance:false}))return;
 if(fd.mode==='switch')await actor.updateEmbeddedDocuments('Item',equipped.filter(i=>i.id!==item.id).map(i=>({_id:i.id,'system.equipped':false})),{gahlaEquip:true});
 const updated=await item.update({'system.equipped':!item.system.equipped},{gahlaEquip:true});
 if(combatant&&cost){await game.combat.completeGahlaAction?.(actor);await game.combat.advanceGahlaTurn({allowRoundAdvance:true});}
 return updated;
}
export function itemCanonicalPatch(item,actor){
 if(Number(item.flags?.[NS]?.canonicalVersion)>=11)return null;
 const s=item.system??{},patch={[`flags.${NS}.canonicalVersion`]:11};
 if(item.type==='powerSource'){
  const backup=JSON.parse(JSON.stringify(s));const slots=s.enchantments??[];
  const valid=slots.every(v=>['test','aura','quality'].includes(v)||/^element:(fire|water|earth|wind|light|shadow|lightning|ice)$/.test(v));
  let chosen=valid&&slots.length?[...slots]:null;
  if(!slots.length&&Number(s.sourceTestBonus)<=5&&!Number(s.sourceBonusPoints)&&!s.sourceElement)chosen=[];
  // Only unambiguous old presets can be translated. Never invent mixed allocations.
  if(!chosen&&Number(s.sourceTestBonus)===15&&!Number(s.sourceBonusPoints)&&!s.sourceElement)chosen=['test'];
  if(!chosen&&Number(s.sourceTestBonus)===5&&!Number(s.sourceBonusPoints)&&s.sourceElement)chosen=['element:'+elementKey(s.sourceElement)];
  patch[`flags.${NS}.legacySource`]=backup;
  patch['system.enchantments']=chosen??[];
  patch[`flags.${NS}.sourceNeedsReview`]=!chosen||chosen.length>Number(s.sourceTier||1);
  const p=powerSourceProfile({system:{...s,enchantments:chosen??[]}});patch['system.sourceTestBonus']=p.test;patch['system.sourceBonusPoints']=p.bonus;
 }
 if(item.type==='spell'){
  const school=s.school||actor?.system?.archetype;
  if(school)patch['system.damageType']=spellDamageType(school);
  else patch[`flags.${NS}.schoolNeedsReview`]=true;
  if(['light','shadow'].includes(elementKey(s.element))&&spellDamageType(school)!=='spiritual')patch[`flags.${NS}.illegalElement`]=true;
 }
 if(typeof s.description==='string')patch['system.description']=s.description.replace(/Półmag może używać elementu (Cienia|Światła)\. ?/g,'').replace(/15 × Rany ponad ŻYW/g,'10 × aktualne Rany ponad ŻYW');
 return patch;
}
export function effectCanonicalPatch(effect){
 const d=effect._source?.duration??effect.duration??{};
 if(Number(d.rounds)>0)return {duration:{units:'rounds',value:Number(d.rounds),expiry:'roundStart'},start:{combat:effect.start?.combat??null,round:Number(d.startRound)||0,time:Number(d.startTime)||0},[`flags.${NS}.legacyDuration`]:JSON.parse(JSON.stringify(d))};
 return null;
}
export async function migrateCanonical(){
 if(!game.user.isGM||Array.from(game.users??[]).find(u=>u.isGM&&u.active)?.id!==game.user.id)return;
 const actors=new Map(Array.from(game.actors??[]).map(a=>[a.uuid,a]));
 for(const scene of game.scenes??[])for(const token of scene.tokens??[])if(token.actor&&!token.actorLink)actors.set(token.actor.uuid,token.actor);
 const migrateItem=async(item,actor)=>{const patch=itemCanonicalPatch(item,actor);if(patch)await item.update(patch,{gahlaCanonicalMigration:true});};
 for(const item of game.items??[])await migrateItem(item);
 for(const actor of actors.values()){
  for(const item of itemsOf(actor))await migrateItem(item,actor);
  for(const effect of actor.effects??[]){if(effect.flags?.[NS]?.legacyDuration)continue;const patch=effectCanonicalPatch(effect);if(patch)await effect.update(patch);}
  if(Number(actor.flags?.[NS]?.canonicalVersion)>=11)continue;
  const c=actor.system.combat??{},patch={[`flags.${NS}.canonicalVersion`]:11,[`flags.${NS}.legacyTracker`]:JSON.parse(JSON.stringify(c)),'system.combat.normalDebt':0,'system.combat.reactionPenalty':0,'system.combat.longReady':false,[`flags.${NS}.preparationPlan`]:itemsOf(actor).filter(i=>i.system.prepared).map(i=>i.id)};
  // Old long actions already rolled their effects. Do not replay them as new casts.
  if(c.longDebt>0||c.normalDebt>0){patch[`flags.${NS}.trackerNeedsReview`]=true;patch['system.combat.longDebt']=0;patch['system.combat.done']=true;}
  await actor.update(patch,{gahlaCanonicalMigration:true});
 }
}
export async function awardOptionalFateXP(){
 if(!game.user.isGM||!game.settings.get(NS,'fateXPOptional'))return;
 const actors=Array.from(game.actors??[]).filter(a=>a.type==='character');
 const fd=await dialog().input({window:{title:'Opcjonalne EXP za Punkt Losu'},content:'<p>MG zatwierdza nagrodę i odbiorców. Tymczasowe Punkty Losu nie dają EXP.</p><select name="amount"><option value="10">Indywidualny — 10 EXP</option><option value="100">Grupowy — 100 EXP</option></select>'+actors.map(a=>'<label><input type="checkbox" name="actor_'+a.id+'" '+(a.hasPlayerOwner?'checked':'')+'>'+foundry.utils.escapeHTML(a.name)+'</label>').join(''),ok:{label:'Przyznaj EXP'}});
 if(!fd)return;const amount=Number(fd.amount);if(![10,100].includes(amount))return;
 for(const actor of actors)if(fd['actor_'+actor.id])await actor.update({'system.xp':Number(actor.system.xp||0)+amount});
}
export function registerCanonicalHooks(){
 game.settings.register(NS,'fateXPOptional',{name:'Opcjonalne EXP za Punkty Losu (10 / 100)',hint:'Zasada MG; nie jest obowiązkową regułą core.',scope:'world',config:true,type:Boolean,default:false});
 Hooks.on('preUpdateItem',(item,changes,options={})=>{
  if(options.gahlaCanonicalMigration||options.gahlaMigration)return;
  if(item.parent?.flags?.[NS]?.pendingSpell?.itemId===item.id){ui.notifications.warn('Nie zmieniaj czaru podczas jego Akcji Długiej.');return false;}
  if(item.parent&&item.system.prepared&&['spell','maneuver'].includes(item.type)&&!options.gahlaPreparation&&(changes.system||Object.keys(changes).some(k=>k.startsWith('system.')))){ui.notifications.warn('Przygotowaną zdolność edytuj w kreatorze jako projekt po odpoczynku.');return false;}
  const prepared=changes['system.prepared']??changes.system?.prepared;
  if(item.parent&&['spell','maneuver'].includes(item.type)&&prepared!==undefined&&!options.gahlaPreparation&&prepared!==item.system.prepared){ui.notifications.warn('Przygotowanie zmienia Długi Odpoczynek. Użyj planu przygotowania.');return false;}
  const equipped=changes['system.equipped']??changes.system?.equipped;
  if(item.type==='weapon'&&item.parent&&equipped!==undefined&&equipped!==item.system.equipped&&!options.gahlaEquip){ui.notifications.warn('Użyj przycisku dobycia / zmiany zestawu.');return false;}
 });
 Hooks.on('preCreateItem',(item,data,options={})=>{
  const patch=itemCanonicalPatch(item,item.parent);if(patch)item.updateSource(patch);
  if(item.parent&&['spell','maneuver'].includes(item.type)&&!options.gahlaPreparation)item.updateSource({'system.prepared':false});
 });
}
