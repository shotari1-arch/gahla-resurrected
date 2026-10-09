import {currentRank,rankCost,rankStep} from './talent-ranks.mjs';
import { awardOptionalFateXP } from './canonical-runtime.mjs';
import { FAILURE_TABLES } from "./content.mjs";
import { resolveLingeringWound, WOUND_PROFILE_OPTIONS } from "./lingering-wounds.mjs";
import { NS, itemsOf, resourceState, activeRule, conditionLevel } from "./effects-engine.mjs";
import { growthOffer, auditBuild, aggregateLog, talentErrors } from "./automation-rules.mjs";
import { requireOwner, requireGM, serial, activateTalent, buyGrowth, purchaseTalent, resetResources, automation } from "./automation-runtime.mjs";
import { ALL_TALENTS, CONDITIONS } from "./rules.mjs";
const {ApplicationV2,HandlebarsApplicationMixin,DialogV2}=foundry.applications.api;
const esc=s=>foundry.utils.escapeHTML(String(s??""));
export async function deployEncounter(entries,partyIds=[],{name="Starcie Gahla",start=false}={}){
  requireGM();if(!Array.isArray(entries)||!entries.length)throw Error("Starcie jest puste.");
  if(entries.some(e=>!e.stats||!Number.isInteger(Number(e.count))||e.count<1||e.count>99)||entries.reduce((n,e)=>n+Number(e.count),0)>200)throw Error("Niepoprawna liczba przeciwników (limit narzędzia: 200 tokenów).");
  const {createGeneratedEnemyActors}=await import("./encounter-builder.mjs");
  const created=[];let scene,combat;
  try{
    for(const entry of entries)for(let n=0;n<Number(entry.count);n++)created.push(...await createGeneratedEnemyActors({...entry,count:1,name:Number(entry.count)>1?`${entry.name} ${n+1}`:entry.name},{partyCount:partyIds.length||1}));
    const party=partyIds.map(id=>game.actors.get(id)).filter(Boolean),all=[...party,...created];
    const columns=10,rows=Math.ceil(all.length/columns),size=100;
    scene=await Scene.create({name,width:Math.max(2000,columns*300),height:Math.max(1500,rows*300+400),padding:0,grid:{type:1,size,distance:1,units:"m"}});
    const tokens=[];
    for(let i=0;i<all.length;i++){
      const doc=await all[i].getTokenDocument({x:100+(i%columns)*300,y:100+Math.floor(i/columns)*300,actorLink:true,disposition:i<party.length?1:-1});
      const data=doc.toObject();delete data._id;tokens.push(data);
    }
    const placed=await scene.createEmbeddedDocuments("Token",tokens);
    combat=await Combat.create({name,scene:scene.id,active:true});
    await combat.createEmbeddedDocuments("Combatant",placed.map(t=>({tokenId:t.id,sceneId:scene.id,actorId:t.actorId})));
    await scene.view();if(start)await combat.startCombat();await game.gahla.openTracker();
    return {scene,combat,actors:created};
  }catch(error){
    // Roll back only documents created by this operation; never existing party actors.
    if(combat)await combat.delete().catch(()=>{});
    if(scene)await scene.delete().catch(()=>{});
    for(const actor of created)await actor.delete().catch(()=>{});
    throw error;
  }
}
export async function saveEncounterTemplate(name,entries,partyIds=[]){
  requireGM();if(!name.trim()||!entries.length)throw Error("Podaj nazwę i dodaj przeciwników.");
  return serial("templates",async()=>{
    const templates=structuredClone(game.settings.get(NS,"encounterTemplates")??[]);
    templates.push({id:foundry.utils.randomID(),schema:1,name:name.trim(),entries:structuredClone(entries),partyIds:[...partyIds],version:game.system.version});
    await game.settings.set(NS,"encounterTemplates",templates);
  });
}
export const TOOL_LABELS={session:"Panel sesji MG",boss:"Boss Dashboard",development:"Rozwój postaci",audit:"Audyt buildu",active:"Aktywne talenty",builder:"Kreator zdolności",encounter:"Generator Starć",tracker:"Tracker",library:"Narzędzia i biblioteka",firstAid:"Pierwsza Pomoc",npc:"Generator NPC",failure:"Losuj Pecha",wound:"Losuj Trwałą Ranę"};
export async function executeTool(action,actorUuid="",itemId=""){
  const actor=actorUuid?await fromUuid(actorUuid):globalThis.canvas?.tokens?.controlled?.[0]?.actor??game.user?.character;
  if(action==="npc"){requireGM();return game.gahla.openEncounterBuilder();}
  if(action==="firstAid"){requireOwner(actor);const item=itemsOf(actor).find(i=>i.name==="Pierwsza Pomoc"&&i.system.learned);if(!item)throw Error("Postać nie zna Pierwszej Pomocy.");return promptTalent(actor,item.id);}
  if(action==="failure"||action==="wound"){requireGM();return rollTableTool(action);}
  if(action==="talent"){requireOwner(actor);return promptTalent(actor,itemId);}
  if(["session","boss","encounter","npc","failure","wound","audit","library"].includes(action))requireGM();
  if(action==="builder")return game.gahla.openAbilityBuilder({actor});
  if(action==="encounter")return game.gahla.openEncounterBuilder();
  if(action==="tracker")return game.gahla.openTracker();
  if(action==="library")return game.gahla.openSetup();
  if(!TOOL_LABELS[action])throw Error("Nieznane narzędzie.");
  if(!["session","boss"].includes(action))requireOwner(actor);
  return new GahlaSessionPanel({mode:action,actor}).render({force:true});
}
export async function promptTalent(actor,itemId){
  const item=itemsOf(actor).find(i=>i.id===itemId),state=resourceState(actor,item);if(!state)throw Error("Brak automatycznej reguły tego talentu.");
  const rule=state.rule;
  const modes=[{id:"use",label:"Użyj"}];if(rule.replenish==="blood")modes.push({id:"replenish",label:"Wypiłem krew — uzupełnij pulę"});if(rule.reset==="manual"&&game.user.isGM)modes.push({id:"replenish",label:"MG: przyznaj nową pulę"});
  const states=Object.entries(CONDITIONS).filter(([key])=>rule.action==="firstAid"||conditionLevel(actor,key));
  const content=`<p>${esc(item.system.description)}</p><p>${state.remaining??"—"}/${state.max??"—"} · ${esc(rule.reset??"runda")} ${esc(rule.note??"")}</p><label>Działanie <select name="mode">${modes.map(m=>`<option value="${m.id}">${esc(m.label)}</option>`).join("")}</select></label>${["healOrCondition","firstAid"].includes(rule.action)?`<label>Leczenie / stan <select name="condition"><option value="">Lecz Rany</option>${states.map(([key,v])=>`<option value="${key}">${esc(v.label)}</option>`).join("")}</select></label>`:""}${rule.action==="firstAid"?`<label>Cel <select name="targetUuid">${Array.from(game.actors??[]).filter(a=>a.isOwner||game.user.isGM).map(a=>`<option value="${esc(a.uuid)}">${esc(a.name)}</option>`).join("")}</select></label>`:""}${rule.action==="foretell"?`<label>Wynik <select name="index">${(state.results??[]).map((r,i)=>`<option value="${i}">${r}</option>`).join("")}</select></label><label>Cel (widoczność potwierdza gracz/MG) <select name="targetUuid"><option value="${esc(actor.uuid)}">${esc(actor.name)}</option>${Array.from(game.actors??[]).filter(a=>a.uuid!==actor.uuid&&(a.isOwner||game.user.isGM)).map(a=>`<option value="${esc(a.uuid)}">${esc(a.name)}</option>`).join("")}</select></label>`:""}`;
  const fd=await DialogV2.input({window:{title:item.name},content,ok:{label:"Wykonaj"}});if(!fd)return;
  return activateTalent(actor,itemId,{mode:fd.mode,condition:fd.condition,index:Number(fd.index??0),targetUuid:fd.targetUuid??""});
}
export class GahlaSessionPanel extends HandlebarsApplicationMixin(ApplicationV2){
  static DEFAULT_OPTIONS={classes:["gahla","gahla-session-panel"],tag:"div",position:{width:900,height:780},window:{title:"Gahla — centrum gry"},actions:{fateXP:GahlaSessionPanel.#fateXP,tool:GahlaSessionPanel.#tool,use:GahlaSessionPanel.#use,growth:GahlaSessionPanel.#growth,talent:GahlaSessionPanel.#talent,reset:GahlaSessionPanel.#reset,fate:GahlaSessionPanel.#fate,deploy:GahlaSessionPanel.#deploy,removeTemplate:GahlaSessionPanel.#removeTemplate,condition:GahlaSessionPanel.#condition,configure:GahlaSessionPanel.#configure,conditionDetails:GahlaSessionPanel.#conditionDetails,report:GahlaSessionPanel.#report}};
  static PARTS={main:{template:`systems/${NS}/templates/apps/session-panel.hbs`}};
  constructor({mode="session",actor=null,...options}={}){super(options);this.mode=mode;this.actor=actor;}
  async _prepareContext(){
    const actor=this.actor,isGM=Boolean(game.user.isGM),mode=this.mode;
    if(["session","boss","audit"].includes(mode))requireGM();else requireOwner(actor);
    const actors=mode==="boss"?[...new Map([...Array.from(game.actors??[]),...Array.from(game.combat?.combatants??[]).map(c=>c.actor).filter(Boolean)].filter(a=>["boss","bossPart"].includes(a.type)).map(a=>[a.uuid,a])).values()]:actor?[actor]:[];
    const rows=actors.map(a=>({uuid:a.uuid,name:a.name,reactions:a.system.combat.reactionLeft,reactionMax:a.system.combat.reactionMax,speed:a.system.combat.currentSegments,cap:a.system.npc.singleHitWoundCap,tags:a.system.npc.tags,conditions:Object.entries(CONDITIONS).map(([key,v])=>({key,label:v.label,active:conditionLevel(a,key)>0})),active:itemsOf(a).filter(activeRule).map(i=>({id:i.id,name:i.name,actorUuid:a.uuid,canUse:!activeRule(i).gmOnly||isGM,...resourceState(a,i)})),manual:itemsOf(a).filter(i=>i.type==="talent"&&i.system.learned&&!activeRule(i)).map(i=>({name:i.name,description:i.system.description}))}));
    const offer=actor?growthOffer(actor):null;
    const talents=actor?ALL_TALENTS.filter(d=>!/WIP/i.test(d.description)&&!["Wybraniec Boży","Święty Wojownik","Błogosławiony"].includes(d.name)).map(d=>{const current=itemsOf(actor).find(i=>i.name===d.name&&i.system.learned),level=current?currentRank(current,d)+1:1;const errors=talentErrors(actor,d,level,{purchase:true});return {...rankStep(d,level),name:d.name,level,cost:rankCost(d,level),errors:errors.join("; "),available:!errors.length};}):[];
    return {fateXPOptional:game.settings.get(NS,"fateXPOptional"),mode,title:TOOL_LABELS[mode],isGM,actorName:actor?.name,actorUuid:actor?.uuid,xp:actor?.system.xp,development:mode==="development",audit:mode==="audit",showActors:["active","boss"].includes(mode),session:mode==="session",rows,offer,talents,issues:actor?auditBuild(actor):[],tools:Object.entries(TOOL_LABELS).filter(([key])=>isGM||!["session","boss","encounter","npc","failure","wound","audit","library"].includes(key)).map(([key,label])=>({key,label})),templates:game.settings.get(NS,"encounterTemplates")??[],groupFate:game.settings.get(NS,"groupFatePool"),combat:game.combat?{name:game.combat.name,round:game.combat.round,summary:JSON.stringify(aggregateLog(game.combat.flags?.[NS]?.events??[]))}:null,reports:game.settings.get(NS,"combatReports")??[]};
  }
  async _onRender(context,options){
    await super._onRender(context,options);
    for(const node of this.element.querySelectorAll("[data-tool], [data-talent-drag]")){
      node.draggable=true;node.addEventListener("dragstart",e=>e.dataTransfer.setData("text/plain",JSON.stringify({type:"GahlaTool",action:node.dataset.tool??"talent",actorUuid:node.dataset.actorUuid??this.actor?.uuid??"",itemId:node.dataset.talentDrag??"",label:node.textContent.trim()})));
    }
  }
  static async #tool(e,t){return guarded(()=>executeTool(t.dataset.tool,this.actor?.uuid??""));}
  static async #use(e,t){await guarded(async()=>promptTalent(await fromUuid(t.dataset.actorUuid),t.dataset.itemId));await this.render({force:true});}
  static async #growth(){
    const selected=Array.from(this.element.querySelectorAll('[name="growth"]:checked')).map(n=>n.value);await guarded(()=>buyGrowth(this.actor,selected));await this.render({force:true});
  }
  static async #talent(e,t){await guarded(()=>purchaseTalent(this.actor,t.dataset.name,Number(t.dataset.level),false));await this.render({force:true});}
  static async #reset(e,t){await guarded(async()=>{requireGM();const scope=t.dataset.scope;if(!["scene","session","rest"].includes(scope))return;
    const actors=scope==="scene"?Array.from(globalThis.canvas?.scene?.tokens??[]).map(t=>t.actor).filter(Boolean):Array.from(game.actors??[]);
    for(const a of new Map(actors.map(a=>[a.uuid,a])).values())await resetResources(a,scope);
  });await this.render({force:true});}
  static async #fateXP(){await awardOptionalFateXP();await this.render({force:true});}
  static async #fate(e,t){await guarded(async()=>{requireGM();await serial("group-fate",()=>game.settings.set(NS,"groupFatePool",Math.max(0,Number(game.settings.get(NS,"groupFatePool"))+Number(t.dataset.delta))));});await this.render({force:true});}
  static async #deploy(e,t){await guarded(async()=>{requireGM();const template=(game.settings.get(NS,"encounterTemplates")??[]).find(x=>x.id===t.dataset.id);if(!template||template.schema!==1)throw Error("Nieobsługiwany szablon.");await deployEncounter(template.entries,template.partyIds,{name:template.name,start:false});});}
  static async #removeTemplate(e,t){await guarded(async()=>{requireGM();await game.settings.set(NS,"encounterTemplates",game.settings.get(NS,"encounterTemplates").filter(x=>x.id!==t.dataset.id));});await this.render({force:true});}
  static async #conditionDetails(e,t){await guarded(async()=>{
    const actor=await fromUuid(t.dataset.uuid);requireOwner(actor);
    const active=Object.entries(CONDITIONS).filter(([key])=>conditionLevel(actor,key));
    const fd=await DialogV2.input({window:{title:"Parametry stanów"},content:active.map(([key,v])=>'<label>'+esc(v.label)+' — poziom / stosy <input type="number" min="1" max="99" name="'+key+'" value="'+conditionLevel(actor,key)+'"></label>').join('')+'<label>Źródło Przerażenia <select name="fear"><option value="">Nieustalone — bez automatycznego Utrudnienia wobec źródła</option>'+Array.from(game.actors??[]).map(a=>'<option value="'+esc(a.uuid)+'" '+(actor.flags?.[NS]?.conditionSources?.frightened===a.uuid?'selected':'')+'>'+esc(a.name)+'</option>').join('')+'</select></label>',ok:{label:"Zapisz"}});if(!fd)return;
    const levels={};for(const [key]of active){const n=Number(fd[key]);if(!Number.isInteger(n)||n<1||n>99)throw Error("Poziom stanu musi być liczbą 1–99.");levels[key]=n;}
    await actor.update({['flags.'+NS+'.conditionLevels']:levels,['flags.'+NS+'.conditionSources.frightened']:String(fd.fear??"")});
  });await this.render({force:true});}
  static async #configure(e,t){await guarded(async()=>{
    requireGM();const actor=await fromUuid(t.dataset.uuid);
    const fd=await DialogV2.input({window:{title:"Zasób / zdolność MG"},content:'<p>Źródło nie definiuje Legendarnej Odporności. Ustal zasadę, liczbę użyć i odnowienie.</p><label>Nazwa <input name="name" value="Legendarna Odporność"></label><label>Pełna zasada <textarea name="description" required></textarea></label><label>Liczba użyć <input name="max" type="number" min="1" max="99" required></label><label>Odnowienie <select name="reset"><option value="combat">Walka</option><option value="scene">Scena</option><option value="session">Sesja</option></select></label>',ok:{label:"Zapisz licznik"}});if(!fd)return;
    const max=Number(fd.max);if(!Number.isInteger(max)||max<1||max>99||!String(fd.description??"").trim())throw Error("Podaj regułę i dodatnią liczbę użyć (maks. 99).");
    await actor.createEmbeddedDocuments("Item",[{name:String(fd.name||"Zdolność MG"),type:"talent",system:{learned:true,level:1,description:String(fd.description)},flags:{[NS]:{activity:{id:"custom",max:[max],reset:fd.reset,action:"announce",note:"Reguła MG: przycisk liczy użycia; skutek rozstrzyga MG."}}}}]);
  });await this.render({force:true});}
  static async #condition(e,t){await guarded(async()=>{requireGM();const actor=await fromUuid(t.dataset.uuid);await actor.toggleCondition(t.dataset.key);});await this.render({force:true});}
  static async #report(e,t){await guarded(async()=>{requireGM();const report=t.dataset.id?(game.settings.get(NS,"combatReports")??[]).find(x=>x.id===t.dataset.id):{name:game.combat?.name,events:game.combat?.flags?.[NS]?.events??[]};if(!report)return;await showCombatReport(report);});}
}
export async function showCombatReport(report){
  const t=aggregateLog(report.events),labels={rounds:"Rundy",attacks:"Ataki",hits:"Trafienia",wounds:"Rany",hp:"Obrażenia HP",aura:"Wydana Aura",reactions:"Zużyte reakcje",deadly:"Wejścia w stan śmiertelny"};
  await DialogV2.wait({window:{title:`Raport: ${report.name??"Starcie"}`},content:`<table>${Object.entries(labels).map(([key,label])=>`<tr><th>${label}</th><td>${t[key]}</td></tr>`).join("")}</table><p>Zapis obejmuje zdarzenia od wersji 0.10.0. Zmiany ręczne zasobów są wliczane. Pełny dziennik można pobrać jako JSON.</p>`,buttons:[{action:"close",label:"Zamknij"},{action:"export",label:"Pobierz JSON",callback:()=>foundry.utils.saveDataToFile(JSON.stringify(report,null,2),"application/json","gahla-raport.json")} ]});
}
export async function guarded(fn){try{return await fn();}catch(e){console.error("[Gahla]",e);ui.notifications.error(e.message);return null;}}
export function registerSessionTools(){
  for(const [key,type,initial]of [["encounterTemplates",Array,[]],["combatReports",Array,[]]])game.settings.register(NS,key,{scope:"world",config:false,type,default:initial});
  game.gahla.executeTool=executeTool;
  Hooks.on("hotbarDrop",(_bar,data,slot)=>{
    if(data?.type!=="GahlaTool")return;
    void guarded(async()=>{
      if(!TOOL_LABELS[data.action]&&data.action!=="talent")return;
      const command=`await game.gahla.executeTool(${JSON.stringify(String(data.action))},${JSON.stringify(String(data.actorUuid??""))},${JSON.stringify(String(data.itemId??""))});`;
      let macro=game.macros.find(m=>m.command===command&&m.isOwner);
      macro??=await Macro.create({name:String(data.label??"Gahla"),type:"script",command,img:"icons/svg/d20.svg"});await game.user.assignHotbarMacro(macro,slot);
    });return false;
  });
  Hooks.on("renderApplicationV2",(app,element)=>{
    const root=element?.querySelector?element:app.element;if(!root?.querySelector)return;
    const actor=app.actor;
    if(game.user.isGM&&app.constructor?.name==="ActorDirectory"&&!root.querySelector("[data-gahla-session]")){
      const b=document.createElement("button");b.dataset.gahlaSession="1";b.textContent="Gahla — Panel sesji MG";b.addEventListener("click",()=>executeTool("session"));root.prepend?.(b);
    }
  });
}

async function rollTableTool(mode){
  const options=mode==="failure"?Object.keys(FAILURE_TABLES).map(key=>({key,label:key})):WOUND_PROFILE_OPTIONS.filter(p=>!["auto","none"].includes(p.key));
  const fd=await DialogV2.input({window:{title:mode==="failure"?"Losowanie Pecha":"Losowanie Trwałej Rany"},content:'<label>Tabela <select name="table">'+options.map(o=>'<option value="'+o.key+'">'+esc(o.label)+'</option>').join('')+'</select></label>'+(mode==="wound"?'<label>Lokacja <select name="location"><option value="body">Korpus</option><option value="head">Głowa</option><option value="leftArm">Ręka</option><option value="leftLeg">Noga</option></select></label><label>Modyfikator LW <input name="modifier" type="number" value="0"></label>':''),ok:{label:"Losuj"}});if(!fd)return;
  const roll=Math.floor(Math.random()*100)+1;let text;
  if(mode==="failure"){const row=FAILURE_TABLES[fd.table]?.find(([min,max])=>roll>=min&&roll<=max);text=row?row.slice(2).join(' — '):'Brak wiersza tabeli';}
  else{const result=await resolveLingeringWound({score:roll+Number(fd.modifier||0),profile:fd.table,location:fd.location});text=JSON.stringify(result);}
  await ChatMessage.create({content:'<p>k100: '+roll+'</p><p>'+esc(text)+'</p>',whisper:ChatMessage.getWhisperRecipients("GM").map(u=>u.id)});
}
