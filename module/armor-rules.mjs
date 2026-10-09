import {talentRank} from './canon-names.mjs';
export const ARMOR_LOCATION_KEYS=["head","leftArm","rightArm","body","leftLeg","rightLeg"];

export function armorMaterialBonus(item){
  const metal=String(item?.system?.metal ?? item?.metal ?? "").toLowerCase();
  let bonus=0;
  if(metal.includes("ciężki")||metal.includes("krasnoludzki")) bonus+=1;
  if(metal.includes("ostrzejszy")) bonus+=1;
  if(metal.includes("krasnoludzkiego kowala run")) bonus+=1;
  return bonus;
}

/**
 * Wylicza pancerz lokacyjny z wyposażonych Itemów.
 * - zwykłe elementy/zestawy: najwyższa wartość na lokacji,
 * - tarcza: najwyższy bonus tarczy na wybranej lokacji DODAWANY do zbroi,
 * - metaliczny bonus pancerza należy do konkretnego Itemu przed porównaniem.
 */
export function computeArmorLocations(items=[],actor=null){
  const armor=Object.fromEntries(ARMOR_LOCATION_KEYS.map(k=>[k,0]));
  const shield=Object.fromEntries(ARMOR_LOCATION_KEYS.map(k=>[k,0]));
  for(const item of items){
    const system=item?.system ?? item ?? {};
    if(system.equipped===false) continue;
    const material=armorMaterialBonus(item);
    if(system.isShield){
      for(const loc of shieldLocations(item,actor)){
      if(loc in shield) shield[loc]=Math.max(shield[loc],Math.max(0,Number(system.armor||0)+material));
      }
      continue;
    }
    for(const loc of ARMOR_LOCATION_KEYS){
      const value=Number(system.locations?.[loc]||0);
      if(value>0) armor[loc]=Math.max(armor[loc],value+material);
    }
  }
  return Object.fromEntries(ARMOR_LOCATION_KEYS.map(loc=>[loc,armor[loc]+shield[loc]]));
}
/**
 * Próg ignorowania niskich wyników k10 na danej lokacji.
 * Zgodnie z zasadami wybieramy najlepszą aktywną zbroję pokrywającą lokację
 * oraz najlepszą tarczę ustawioną na tej lokacji, a następnie SUMUJEMY oba efekty.
 * Nie sumujemy kilku nakładających się zbroi ani kilku tarcz.
 */
export function computeIgnoreLowAtLocation(items=[],location="body",actor=null){
  let armorIgnore=0;
  let shieldIgnore=0;
  for(const item of items){
    const system=item?.system ?? item ?? {};
    if(system.equipped===false) continue;
    const ignore=Math.max(0,Number(system.ignoreLow||0));
    if(ignore<=0) continue;
    if(system.isShield){
      if(shieldCovers(item,location,actor)) shieldIgnore=Math.max(shieldIgnore,ignore+(talentRank(actor??item.parent,"Mistrz Tarczy")>=4?1:0));
      continue;
    }
    if(Number(system.locations?.[location]||0)>0) armorIgnore=Math.max(armorIgnore,ignore);
  }
  return armorIgnore+shieldIgnore;
}


export function armorContributors(items,location,actor=null){
 const value=i=>i.system.isShield?(shieldCovers(i,location,actor)?Number(i.system.armor)||0:0):Number(i.system.locations?.[location])||0;
 return [false,true].map(shield=>items.filter(i=>Boolean(i.system.isShield)===shield&&i.system.equipped!==false&&value(i)>0).sort((a,b)=>(value(b)+armorMaterialBonus(b))-(value(a)+armorMaterialBonus(a)))[0]?.id).filter(Boolean);
}

export function shieldLocationLimit(actor){return Math.min(4,1+talentRank(actor,'Mistrz Tarczy'));}
export function shieldLocations(item,actor=null){const s=item.system??item;return [...new Set(s.shieldLocations?.length?s.shieldLocations:[s.shieldLocation||'leftArm'])].filter(k=>ARMOR_LOCATION_KEYS.includes(k)).slice(0,shieldLocationLimit(actor??item.parent));}
export const shieldCovers=(item,location,actor=null)=>shieldLocations(item,actor).includes(location);
