import {payDefense119,concentration119} from './talent-defense119.mjs';
import {NS,itemsOf} from './effects-engine.mjs';
import {availableReactions} from './context-reactions.mjs';
import {serial,requireOwner} from './automation-runtime.mjs';

const waiting=new Map(),processing=new Set();
const authorId=m=>m.author?.id??m.user?.id??m.user;
const esc=s=>foundry.utils.escapeHTML(String(s??''));
const owns=(actor,user)=>Boolean(user&&(user.isGM||actor.testUserPermission?.(user,'OWNER')));
export function defenseOwner(actor){
  const users=Array.from(game.users??[]).filter(u=>u.active).sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  return users.find(u=>!u.isGM&&u.character?.id===actor.id&&owns(actor,u))??users.find(u=>!u.isGM&&owns(actor,u))??users.find(u=>u.isGM);
}
export async function chooseDefense(defender,attacker,{ranged=false,stillPending=()=>true}={}){
  requireOwner(defender);
  return serial('pre-defense:'+defender.uuid,async()=>{
    const outside=!game.combat?.started;
    const context=String(game.combat?.id??'none')+':'+Number(game.combat?.round??0);
    if(outside&&defender.flags?.[NS]?.outsideDefense!==context){
      await defender.trackerStartRound({sync:false});
      await defender.setFlag(NS,'outsideDefense',context);
    }
    while(stillPending()){
      const reactions=availableReactions(defender,{ranged});
      const dodge=reactions.find(r=>r.id==='dodge');
      const fd=await foundry.applications.api.DialogV2.input({window:{title:'Reakcja przed trafieniem — '+defender.name},content:'<p>Segmenty: '+Math.max(0,Number(defender.system.combat.currentSegments)-Number(defender.system.combat.reservedSZ||0))+' · reakcje: '+Number(defender.system.combat.reactionLeft||0)+(outside?' · próba poza walką':'')+'</p><p>'+esc(attacker.name)+' atakuje '+esc(defender.name)+'. Rzut trafienia nie został jeszcze wykonany.</p><label>Reakcja<select name="kind"><option value="none">Brak reakcji</option>'+reactions.map(r=>'<option value="'+r.id+'">'+esc(r.label)+'</option>').join('')+(outside?'<option value="refresh">Odnowienie puli do kolejnej próby (poza walką)</option>':'')+'</select></label>'+(!reactions.length?'<p>Brak dostępnych reakcji: sprawdź pozostałe segmenty, reakcje, sen lub trwającą akcję długą.</p>':'')+(dodge?'<label>Segmenty Uniku (1–'+dodge.max+')<input name="segments" type="number" min="1" max="'+dodge.max+'" value="1"></label>':'')+(concentration119(defender)?'<label><input type="checkbox" name="concentration"> Osłona Koncentracji: +10 Obrony, 2 Aury (raz/turę)</label>':'')+'<p>Zamknięcie okna anuluje atak, nie oznacza zgody na brak reakcji.</p>',ok:{label:'Zatwierdź obronę'}});
      if(!fd||!stillPending())return {cancelled:true};
      if(fd.kind==='refresh'&&outside&&!game.combat?.started){await defender.trackerStartRound({sync:false});continue;}
      if(fd.kind==='none'){try{return await payDefense119(defender,'none',{concentration:Boolean(fd.concentration)});}catch(error){ui.notifications.warn(error.message);continue;}}
      const legal=availableReactions(defender,{ranged}).find(r=>r.id===fd.kind);
      if(!legal){ui.notifications.warn('Reakcja nie jest już dostępna. Wybierz ponownie.');continue;}
      if(['dodge','spiritDodge','spiritParry','tactical'].includes(fd.kind)){
        try{return await payDefense119(defender,fd.kind,{segments:Number(fd.segments),ranged,concentration:Boolean(fd.concentration)});}catch(error){ui.notifications.warn(error.message);continue;}
      }
      if(fd.kind==='parry'){
        if(fd.concentration&&!concentration119(defender)){ui.notifications.warn('Osłona Koncentracji nie jest już dostępna.');continue;}
        const result=await defender.rollParry(attacker,{deferChat:true,concentration:Boolean(fd.concentration)});if(!result||result.ok===false)continue;
        const extra=result.concentration??{defenseBonus:0};
        return {...extra,kind:'parry',stopped:Boolean(result.success),parryChat:result.chatData??null};
      }
    }
    return {cancelled:true};
  });
}
export async function receiveDefenseMessage(message){
  const response=message.flags?.[NS]?.defenseResponse;
  if(response){
    const pending=waiting.get(response.nonce);if(!pending)return;
    const request=game.messages.get(response.requestId),data=request?.flags?.[NS]?.defenseRequest;
    if(!data||data.nonce!==response.nonce||data.initiator!==game.user.id||authorId(message)!==data.recipient||authorId(request)!==data.initiator||data.status!=='pending')return;
    const defender=await fromUuid(data.defender),user=game.users.get(data.recipient);
    if(!defender||!owns(defender,user))return;
    const d=response.decision;
    if(!d||(!d.cancelled&&(!['none','dodge','parry','spiritDodge','spiritParry','tactical'].includes(d.kind)||!Number.isFinite(d.defenseBonus)||d.defenseBonus<0||d.defenseBonus>80)))return;
    waiting.delete(response.nonce);
    try{await request.update({[`flags.${NS}.defenseRequest.status`]:'complete'});pending.resolve(response.decision);}catch(error){pending.reject(error);}
    return;
  }
  const data=message.flags?.[NS]?.defenseRequest;
  if(!data||data.status!=='pending'||data.recipient!==game.user.id||authorId(message)!==data.initiator||processing.has(message.id))return;
  processing.add(message.id);
  const defender=await fromUuid(data.defender),attacker=await fromUuid(data.attacker),initiator=game.users.get(data.initiator);
  if(!defender||!attacker||!owns(defender,game.user)||!owns(attacker,initiator))return;
  let decision;
  try{decision=await chooseDefense(defender,attacker,{ranged:data.ranged,stillPending:()=>game.messages.get(message.id)?.flags?.[NS]?.defenseRequest?.status==='pending'});}
  catch(error){console.error('[Gahla] Defense declaration',error);ui.notifications.error(error.message);decision={cancelled:true};}
  await ChatMessage.create({whisper:[data.initiator,data.recipient],content:'<p>'+esc(defender.name)+': '+(decision.cancelled?'atak anulowany.':'zatwierdzono reakcję przed rzutem trafienia.')+'</p>',flags:{[NS]:{defenseResponse:{requestId:message.id,nonce:data.nonce,decision}}}});
}
export async function requestDefense(attacker,defender,{ranged=false}={}){
  const user=defenseOwner(defender);if(!user)throw Error('Brak aktywnego właściciela celu lub MG. Atak nie został rzucony.');
  // Local ownership follows the same pre-roll dialog and payment path.
  if(user.id===game.user.id)return chooseDefense(defender,attacker,{ranged});
  const nonce=foundry.utils.randomID();let resolve,reject;
  const result=new Promise((yes,no)=>{resolve=yes;reject=no;});waiting.set(nonce,{resolve,reject});
  try{
    await ChatMessage.create({whisper:[game.user.id,user.id],content:'<p>'+esc(attacker.name)+' → '+esc(defender.name)+': oczekiwanie na deklarację obrony. Rzut trafienia nie został wykonany.</p>',flags:{[NS]:{defenseRequest:{nonce,initiator:game.user.id,recipient:user.id,attacker:attacker.uuid,defender:defender.uuid,ranged,status:'pending'}}}});
    ui.notifications.info('Atak czeka na deklarację obrony: '+user.name);
    return await result;
  }finally{waiting.delete(nonce);}
}
export function registerDefenseHooks(){
  Hooks.on('deleteChatMessage',message=>{
    processing.delete(message.id);
    const nonce=message.flags?.[NS]?.defenseRequest?.nonce,pending=waiting.get(nonce);
    if(pending){waiting.delete(nonce);pending.resolve({cancelled:true});}
  });
  Hooks.on('createChatMessage',message=>{void receiveDefenseMessage(message).catch(e=>{console.error('[Gahla] Defense message',e);ui.notifications.error(e.message);});});
}



export async function clearStaleDefenseRequests(){
    // A page reload discards the original attack continuation. Never allow an
    // old request to consume a fresh reaction or generate an unrequested roll.
    for(const message of (game.messages?.contents??Array.from(game.messages?.values?.()??[]))){
      const request=message.flags?.[NS]?.defenseRequest;
      if(request?.status==='pending'&&authorId(message)===game.user.id)
        await message.update({[`flags.${NS}.defenseRequest.status`]:'cancelled'});
    }
}
