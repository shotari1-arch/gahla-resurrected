import {NS} from './effects-engine.mjs';
import {talentRank} from './canon-names.mjs';
import {reloadCost,runecraftTarget,bodyRuneCost,bodyRuneLimit} from './canon-mechanics.mjs';
import {shieldLocations,shieldLocationLimit,ARMOR_LOCATION_KEYS} from './armor-rules.mjs';
import {rollD100,evaluateTest} from './rules.mjs';
import {requireOwner,serial} from './automation-runtime.mjs';
const esc=s=>foundry.utils.escapeHTML(String(s??''));
const labels={head:'Głowa',body:'Korpus',leftArm:'Lewa ręka',rightArm:'Prawa ręka',leftLeg:'Lewa noga',rightLeg:'Prawa noga'};
export async function chooseShield(item){
 const actor=item.parent;requireOwner(actor??item);const limit=shieldLocationLimit(actor),current=shieldLocations(item);
 const fd=await foundry.applications.api.DialogV2.input({window:{title:item.name+' — ochrona tarczy'},position:{width:500,height:'auto'},content:'<p>Wybierz od 1 do '+limit+' lokacji. Bazowy Pancerz pozostaje bez zmian.</p>'+ARMOR_LOCATION_KEYS.map(k=>'<label style="display:block"><input type="checkbox" name="'+k+'" '+(current.includes(k)?'checked':'')+'> '+labels[k]+'</label>').join(''),ok:{label:'Ustaw lokacje'}});if(!fd)return;
 const chosen=ARMOR_LOCATION_KEYS.filter(k=>fd[k]);if(!chosen.length||chosen.length>limit)throw Error('Niepoprawna liczba lokacji tarczy.');
 return item.update({'system.shieldLocation':chosen[0],'system.shieldLocations':chosen});
}
export async function reloadWeapon(actor,weapon){
 requireOwner(actor);if(!weapon||weapon.type!=='weapon'||!weapon.system.reload)throw Error('Wybierz broń dystansową.');
 const max=talentRank(actor,'Wielostrzał')>=4?3:talentRank(actor,'Wielostrzał')>=3?2:1;
 const fd=await foundry.applications.api.DialogV2.input({window:{title:'Przeładuj — '+weapon.name},content:'<label>Liczba strzał<select name="shots">'+Array.from({length:max},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+' · OP '+reloadCost(actor,weapon,i+1)+'</option>').join('')+'</select></label>'+(max>1?'<p>Wielostrzał: sposób nakładania flat damage i bonusów jakości wymaga decyzji autora. System liczy koszt przeładowania; obrażenia wielostrzału rozstrzyga MG.</p>':''),ok:{label:'Przeładuj'}});if(!fd)return;
 return serial('reload:'+actor.uuid,async()=>{const shots=Number(fd.shots),cost=reloadCost(actor,weapon,shots),c=game.combat?.started&&game.combat.combatants.find(c=>c.actor?.uuid===actor.uuid);
 if(c&&!await game.combat.spendSegments(cost,c.id,{advance:false}))return;
 await weapon.update({['flags.'+NS+'.loadedShots']:shots});await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:'<p>Przeładowano '+esc(weapon.name)+': '+shots+' pocisk(i), '+cost+' OP.</p>'});if(c){await game.combat.completeGahlaAction?.(actor);await game.combat.advanceGahlaTurn({allowRoundAdvance:true});}return {shots,cost};});
}
export async function rollRunecraft(actor){
 requireOwner(actor);if(!talentRank(actor,'Runotwórstwo'))throw Error('Brak Runotwórstwa.');
 const fd=await foundry.applications.api.DialogV2.input({window:{title:'Test Runotwórstwa'},content:'<label><input type="checkbox" name="craft"> Posiadam odpowiednie Rzemiosło (+10)</label><p>Zaokrąglenie w górę sumy czterech ćwiartek cech.</p>',ok:{label:'Rzuć'}});if(!fd)return;
 const target=runecraftTarget(actor,Boolean(fd.craft)),roll=rollD100(),result=evaluateTest(roll.final,target);await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:'<p>Runotwórstwo: '+roll.final+' / '+target+' — '+(result.success?'sukces':'porażka')+'.</p>'});return result;
}
export async function setBodyRune(actor,item){
 requireOwner(actor);if(item.type!=='rune')throw Error('Wybierz Item typu Runa.');
 const smiths=Array.from(new Map([actor,...Array.from(game.actors??[])].filter(a=>(a.isOwner||game.user.isGM)&&talentRank(a,'Runotwórstwo')>0).map(a=>[a.uuid,a])).values());
 const fd=await foundry.applications.api.DialogV2.input({window:{title:'Runa w ciele'},position:{width:580,height:'auto'},content:'<div class="gahla-roll-dialog"><label>Koszt runy<input name="cost" type="number" min="1" value="'+Number(item.system.bodyRuneCost||item.system.costXP||1)+'"></label><label>Runotwórca<select name="smith">'+smiths.map(a=>'<option value="'+esc(a.uuid)+'">'+esc(a.name)+'</option>').join('')+'</select></label><label><input type="checkbox" name="craft"> Odpowiednie Rzemiosło runotwórcy (+10)</label><label>Tryb<select name="mode"><option value="roll">Test wszczepienia</option>'+(game.user.isGM?'<option value="record">MG: zapisz istniejącą / rozstrzygniętą runę</option><option value="remove">MG: usuń runę z ciała</option>':'')+'</select></label><p>Limit: '+bodyRuneLimit(actor)+' pkt (⅓ ŻYW przed kosztem run, w górę). Porażka zwykła lub krytyczna zadaje bezpośrednio Rany równe kosztowi wszczepianej runy.</p></div>',ok:{label:'Rozstrzygnij'}});if(!fd)return;
 return serial('bodyRune:'+actor.uuid,async()=>{
 if(fd.mode==='remove'&&game.user.isGM)return item.update({'system.bodyRune':false,'system.bodyRuneCost':0});
 const cost=Number(fd.cost),old=item.system.bodyRune?Number(item.system.bodyRuneCost||0):0,current=bodyRuneCost(actor);
 if(!Number.isInteger(cost)||cost<1||current-old+cost>bodyRuneLimit(actor))throw Error('Suma kosztu Run w ciele przekracza limit ⅓ ŻYW (w górę).');
 if(fd.mode!=='record'||!game.user.isGM){
  if(item.system.bodyRune)throw Error('Ta runa jest już wszczepiona. Korektę istniejącej runy wykonuje MG.');
  const smith=smiths.find(a=>a.uuid===fd.smith);if(!smith)throw Error('Wybierz dostępnego Runotwórcę.');
  if(talentRank(smith,'Runotwórstwo')<Number(item.system.tier||1))throw Error('Za niski Tier Runotwórstwa dla tej runy.');
  const target=runecraftTarget(smith,Boolean(fd.craft)),roll=rollD100(),result=evaluateTest(roll.final,target);
  if(!result.success)await applyImplantFailure(actor,cost);
  await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:smith}),content:'<p>Wszczepienie '+esc(item.name)+' → '+esc(actor.name)+': '+roll.final+' / '+target+'. '+(result.success?'Sukces.':'Porażka: '+cost+' bezpośrednich Ran (bez Pancerza, Aury i Progów).')+'</p>'});
  if(!result.success)return result;
 }
 await item.update({'system.bodyRune':true,'system.bodyRuneCost':cost,'system.equipped':true});
 });
}
export async function applyImplantFailure(actor,cost){
 requireOwner(actor);if(!Number.isInteger(cost)||cost<1)throw Error('Niepoprawny koszt runy.');
 const value=Number(actor.system.combat.wounds.value||0)+cost;
 await actor.update({'system.combat.wounds.value':value,...(value>=Number(actor.system.stats.zyw)?{'system.combat.deadly':true}:{})});return value;
}
