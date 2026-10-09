import {serial,requireOwner} from './automation-runtime.mjs';
import {NS,itemsOf,modified,conditionLevel} from './effects-engine.mjs';
import {tier119,profile119} from './talent-values119.mjs';
import {auraAccess} from './canonical-rules.mjs';
import {applyTrackerReaction} from './tracker-rules.mjs';
export function resource119(actor,key,max,period='combat'){const scope=game.combat?.id??'outside',stamp=period==='turn'?scope+':'+Number(game.combat?.round??0)+':'+Number(game.combat?.turn??0):scope;const old=actor.flags?.[NS]?.canon119?.[key];return {stamp,remaining:old?.stamp===stamp?Math.max(0,max-Number(old.used||0)):max,used:old?.stamp===stamp?Number(old.used||0):0};}
export function concentration119(actor){return tier119(actor,'Osłona Koncentracji')>=2&&auraAccess(actor).allowed&&Number(actor.system.combat.aura.value)>=2&&resource119(actor,'concentrationDefense',1,'turn').remaining>0;}
export function reactions119(actor,{ranged=false}={}){const c=actor.system.combat,out=[];if(conditionLevel(actor,'asleep')||c.done||c.longReady||c.longDebt||c.reactionLeft<=0)return out;const spirit=tier119(actor,'Duchowa Pięść');if(spirit&&auraAccess(actor).allowed&&c.aura.value>=2&&resource119(actor,'spiritDefense',spirit>=4?2:1).remaining){out.push({id:'spiritDodge',label:'Kontrola Aury: Unik — 2 Aury, 0 segmentów'});if(!ranged)out.push({id:'spiritParry',label:'Kontrola Aury: Parowanie — 2 Aury, 0 segmentów'});}if(ranged&&tier119(actor,'Taktyczny Wybór')>=3&&c.currentSegments-Number(c.reservedSZ||0)>=2)out.push({id:'tactical',label:'Taktyczny Wybór — Utrudnienie ataku, 2 segmenty'});return out;}
export function dodgeCost119(actor,segments){const weapon=actor.mainWeapon??itemsOf(actor).find(i=>i.type==='weapon'&&i.system.equipped);const light=(weapon?.system?.traits??[]).some(t=>/Lekka|Podstawowa|Prosta/i.test(t));return modified(actor,Math.max(1,segments-(tier119(actor,'Ruch Cienia')>=3&&light?1:0)),'reactionCost',{},1);}
export function defenseLabel119(d){const labels={none:'Brak reakcji',dodge:'Unik',spiritDodge:'Kontrola Aury: Unik',spiritParry:'Kontrola Aury: Parowanie',tactical:'Taktyczny Wybór: Utrudnienie ataku',parry:d.stopped?'Parowanie — atak zatrzymany':'Parowanie nieudane'};return (labels[d.kind]??'Reakcja')+(d.defenseBonus?' · +'+d.defenseBonus+' Obrony':'')+(d.auraSpent?' · '+d.auraSpent+' Aury':'');}
export async function payDefense119(actor,kind,options={}){requireOwner(actor);return serial(actor.uuid,()=>payDefenseCore119(actor,kind,options));}
async function payDefenseCore119(actor,kind,{concentration=false,segments=1,ranged=false}={}){const c=actor.system.combat,patch={},pools=structuredClone(actor.flags?.[NS]?.canon119??{});let aura=0,bonus=0,cost=0,state=null;const use=(key,max,period)=>{const r=resource119(actor,key,max,period);if(!r.remaining)throw Error('Zdolność została już wykorzystana.');pools[key]={stamp:r.stamp,used:r.used+1};};
 if(concentration){if(!concentration119(actor))throw Error('Osłona Koncentracji niedostępna.');use('concentrationDefense',1,'turn');aura+=2;bonus+=10;}
 if(['spiritDodge','spiritParry','tactical'].includes(kind)){if(!reactions119(actor,{ranged}).some(r=>r.id===kind))throw Error('Reakcja niedostępna.');if(kind==='tactical')cost=modified(actor,2,'reactionCost',{},1);else{use('spiritDefense',tier119(actor,'Duchowa Pięść')>=4?2:1);aura+=2;bonus+=5;state={...c,reactionLeft:c.reactionLeft-1,reactionUsed:true};}}
 if(kind==='dodge'){if(!Number.isInteger(segments)||segments<1||segments>4)throw Error('Unik: wybierz 1–4 segmenty.');cost=dodgeCost119(actor,segments);bonus+=(itemsOf(actor).some(i=>i.name==='Akrobatyczny Unik'&&i.system.learned)?8:5)*segments;if(tier119(actor,'Garda Weterana')>=2)bonus+=5;}
 if(kind==='parry'){const weapon=actor.mainWeapon;if(!weapon)throw Error('Brak broni do parowania.');cost=modified(actor,Math.max(1,Math.ceil(Number(weapon.system.delay||3)/2)),'reactionCost',{},1);}
 if(cost){const r=applyTrackerReaction({...c,trackerBoss:actor.trackerIsBoss},cost);if(!r.ok)throw Error(r.error);state=r.state;}
 if(aura&&(!auraAccess(actor).allowed||Number(c.aura.value)<aura))throw Error('Za mało dostępnej Aury.');
 if(state)Object.assign(patch,{'system.combat.reservedSZ':Number(state.reservedSZ||0),'system.combat.reactionLeft':state.reactionLeft,'system.combat.reactionUsed':state.reactionUsed});
 if(aura)patch['system.combat.aura.value']=Number(c.aura.value)-aura;
 if(aura)patch['flags.'+NS+'.canon119']=pools;
 if(Object.keys(patch).length)await actor.update(patch,{gahlaTrackerSync:true});
 return {kind,segments:cost,auraSpent:aura,defenseBonus:bonus,stopped:false,attackDisadvantage:kind==='tactical'};
}
