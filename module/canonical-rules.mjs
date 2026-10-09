import { itemsOf, modified, NS, collectModifiers, resolveModifiers } from './effects-engine.mjs';

export const DAMAGE_TYPES={physical:'Fizyczne',magical:'Magiczne',spiritual:'Duchowe'};
export function spellDamageType(school){return ['kaplan','Kapłan'].includes(school)?'spiritual':'magical';}
export function elementKey(value){return ({ogień:'fire',ogien:'fire',woda:'water',ziemia:'earth',powietrze:'wind',wiatr:'wind',air:'wind','lód':'ice',lod:'ice','elektryczność':'lightning','światło':'light',swiatlo:'light','cień':'shadow',cien:'shadow'})[String(value??'').toLowerCase()]??String(value??'').toLowerCase();}
export function effectiveThresholds(actor,type='physical',{ignoreResistanceBonus=false}={}){
  const life=Math.max(1,Number(actor.system.stats.zyw)||1),derived=actor.system.derived??{};
  const baseBonus=Number(derived.thresholdBonus)||0;
  const result=resolveModifiers(baseBonus,'threshold',collectModifiers(actor),{damageType:type});
  const bonus=result.value,resistance=Number(derived[type+'Resistance']||0);
  const resistanceBase=Math.max(0,Math.floor(resistance/10));
  const passive=ignoreResistanceBonus?0:modified(actor,resistanceBase,'resistanceThreshold',{damageType:type},0);
  const baseI=2*life+bonus,baseII=3*life+bonus;
  return {type,label:DAMAGE_TYPES[type],life,bonus,baseBonus,resistance,resistanceBase,resistanceBonus:passive,
    sources:[{label:'Bazowe z ŻYW '+life,one:2*life,two:3*life},{label:'Pozostałe bonusy (cechy, talenty, NPC)',one:baseBonus,two:baseBonus},...result.trace.map(t=>({label:t.source,one:t.after-t.before,two:t.after-t.before})),{label:'Odporność '+resistance+(ignoreResistanceBonus?' — pominięty bonus':passive!==resistanceBase?' — wzmocniony bonus':''),one:passive,two:passive}],
    baseI,baseII,passive,one:baseI+passive,two:baseII+passive,five:2*baseII+passive,six:3*baseII+passive,seven:4*baseII+passive};
}
/** Explicit GM designation; do not infer alignment from race, name or darkness on the map. */
export function holyFlameIgnoresResistance(attacker,target,weapon,{isSpell=false}={}){
 return isSpell&&weapon?.system?.damageType==='spiritual'&&elementKey(weapon.system.element)==='fire'
  &&target?.flags?.[NS]?.creatureOfDarkness===true&&attacker?.system?.deity==='Gida'
  &&itemsOf(attacker).some(i=>i.type==='talent'&&i.system.learned&&i.name==='Święty Płomień');
}
export function thresholdWounds(damage,{baseI,baseII,passive=0}){
  const d=Number(damage)||0;
  // Canon 0.11: the resistance boundary also retains the no-wound band; damage itself is unchanged.
  if(d<=passive)return 0;
  if(d<baseI+passive)return 1;
  if(d<baseII+passive)return 2;
  if(d<2*baseII+passive)return 3;
  return 3+Math.floor((d-passive)/Math.max(1,baseII));
}
export function auraAccess(actor){
  const items=itemsOf(actor),learned=items.filter(i=>i.type==='talent'&&i.system.learned);
  const bodyArmor=items.some(i=>i.type==='armor'&&i.system.equipped&&!i.system.isShield&&!i.system.auraCompatible&&(Number(i.system.armor)>0||Object.values(i.system.locations??{}).some(v=>Number(v)>0)));
  const locked=learned.some(i=>i.name.toLowerCase()==='blokada aury');
  const permitted=['polmag','kaplan','mag'].includes(actor.system.archetype)||actor.system.species==='therian'||modified(actor,0,'auraAccess')>0||learned.some(i=>['umiejętności magiczne','modlitwa','duchowa pięść','ziarna czasu','osłona koncentracji'].includes(i.name.toLowerCase()));
  return {allowed:permitted&&!bodyArmor&&!locked,regenerate:!bodyArmor&&!locked,reason:bodyArmor?'Zbroja na ciele blokuje wydawanie i regenerację Aury.':locked?'Blokada Aury.':!permitted?'Brak mocy lub jawnego wyjątku pozwalającego używać Aury.':''};
}
export function powerSourceProfile(item,element=''){
  if(!item)return {test:0,aura:0,dice:0,bonus:0,critical:0,errors:[]};
  const slots=item.system.enchantments??[],tier=Number(item.system.sourceTier)||1,errors=[];
  if(slots.length>tier)errors.push('Źródło ma więcej umagicznienia niż Tier.');
  if(!Number.isInteger(tier)||tier<1||tier>4)errors.push('Tier źródła musi być 1–4.');
  const out={test:5,aura:0,dice:0,bonus:0,critical:0,errors};
  if(item.flags?.[NS]?.sourceNeedsReview)errors.push('Stare Źródło Mocy wymaga wyboru umagicznienia na karcie przedmiotu.');
  for(const slot of slots){
    if(slot==='test')out.test+=10;
    else if(slot==='aura')out.aura++;
    else if(slot==='quality'){out.bonus++;out.critical+=2;}
    else if(/^element:(fire|water|earth|wind|light|shadow|lightning|ice)$/.test(slot)){if(elementKey(element)&&slot==='element:'+elementKey(element))out.dice++;}
    else errors.push('Nieznane umagicznienie: '+slot);
  }
  return out;
}
export function preparationErrors(actor,ids){
  const items=itemsOf(actor).filter(i=>ids.includes(i.id));
  const errors=[];
  for(const type of ['spell','maneuver']){
    const max=Number(type==='spell'?actor.system.derived[actor.system.archetype==='kaplan'?'spellSlotsCleric':'spellSlotsMage']:actor.system.derived.maneuverSlots)||0;
    if(items.filter(i=>i.type===type).length>max)errors.push('Brak slotów: '+type);
  }
  const special=items.filter(i=>{try{return i.type==='maneuver'&&JSON.parse(i.system.builderState||'{}').specialManeuver;}catch{return false;}});
  if(special.length>1)errors.push('Można przygotować tylko jeden Specjalny Manewr.');
  return errors;
}
