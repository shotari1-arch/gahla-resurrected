export const NS="gahla-resurrected";
let seq=0;
export const hooks=new Map(),settings=new Map(),messages=[];
export function applyPatch(target,patch){for(const [path,value]of Object.entries(patch)){const keys=path.split('.');let obj=target;for(const k of keys.slice(0,-1))obj=obj[k]??={};obj[keys.at(-1)]=structuredClone(value);}return target;}
export function actor(items=[],overrides={}){
  const a={id:`a${++seq}`,name:"Test",type:"character",isOwner:true,usesHP:false,flags:{},effects:[],statuses:new Set(),items,
    system:{species:"human",archetype:"kaplan",deity:"Gida",lifePath:"Ojczulek / Księżyna",level:8,xp:500,derived:{tier:4,maneuverSlots:2,spellSlotsMage:2,spellSlotsCleric:2},stats:{sf:40},npc:{tags:[]},base:{growth:{sf:5,zr:5,per:5,er:5,um:5,og:5,wia:5},statUpgradeCounts:{sf:0,zr:0,per:0,er:0,um:0,og:0,wia:0},versatileUsedLevel:0},combat:{wounds:{value:4,max:8},hp:{value:20,max:20},aura:{value:5,max:5},reactionLeft:1,reactionMax:1,currentSegments:8,reservedSZ:0,longDebt:0},conditions:[]},
    async update(patch){applyPatch(this,patch);return this;},async setFlag(ns,key,value){return this.update({[`flags.${ns}.${key}`]:value});},getFlag(ns,key){return this.flags[ns]?.[key];},
    async toggleCondition(key,enabled=null){const active=this.system.conditions.includes(key);if(enabled??!active){this.system.conditions=[...new Set([...this.system.conditions,key])];this.statuses.add(`gahla-${key}`);}else{this.system.conditions=this.system.conditions.filter(x=>x!==key);this.statuses.delete(`gahla-${key}`);}},
    async getTokenDocument(options){return {toObject:()=>({_id:"template-id",actorId:this.id,name:this.name,...options})};}
  };a.uuid=`Actor.${a.id}`;Object.assign(a,overrides);return a;
}
export function talent(name,level=1,extra={}){return {id:`i${++seq}`,name,type:"talent",system:{learned:true,level,description:"",...extra}};}
export function install(){
  class App{constructor(options={}){this.options=options;}async _prepareContext(){return {};}render(){return this;}async _onRender(){}}
  globalThis.foundry={applications:{api:{ApplicationV2:App,HandlebarsApplicationMixin:B=>class extends B{},DialogV2:{input:async()=>null,wait:async()=>null}}},utils:{escapeHTML:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),randomID:()=>`r${++seq}`}};
  globalThis.game={user:{id:"gm",isGM:true},users:[{id:"gm",isGM:true,active:true}],actors:[],scenes:[],folders:[],messages:new Map(),settings:{get:(ns,key)=>settings.get(`${ns}.${key}`),set:async(ns,key,value)=>settings.set(`${ns}.${key}`,structuredClone(value)),register:(ns,key,config)=>{if(!settings.has(`${ns}.${key}`))settings.set(`${ns}.${key}`,config.default);}},system:{version:"0.10.0-beta"},combat:{id:"c1",round:1,started:true,combatants:[]},gahla:{openTracker:async()=>true}};
  globalThis.ChatMessage={getSpeaker:({actor}={})=>({actor:actor?.id}),create:async data=>{messages.push(data);return data;},getWhisperRecipients:()=>[]};
  globalThis.Hooks={on:(key,fn)=>{if(!hooks.has(key))hooks.set(key,[]);hooks.get(key).push(fn);}};
  globalThis.ui={notifications:{warn:()=>{},error:()=>{},info:()=>{}}};globalThis.fromUuid=async uuid=>game.actors.find(a=>a.uuid===uuid);
}
