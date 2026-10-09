import { parseDiceFormula } from "./rules.mjs";

export function maneuverOverlayFromSystem(system={}){
  if(Number(system.maneuverOverlayVersion||0)>=2){
    return {
      damageDiceDelta:Number(system.maneuverDamageDiceDelta||0),
      delayDelta:Number(system.maneuverDelayDelta||0),
      hitMod:Number(system.maneuverHitMod||0),
      penetrationBonus:Number(system.maneuverPenetrationBonus||0),
      halfWeaponDice:Boolean(system.maneuverHalfWeaponDice),
      extraTargets:Number(system.maneuverExtraTargets||0)
    };
  }
  try{
    const state=JSON.parse(system.builderState||"{}");
    const n=v=>Number.isFinite(Number(v))?Number(v):0;
    return {
      damageDiceDelta:n(state.strong)-n(state.pay_dmg)-n(state.fast),
      delayDelta:n(state.pay_op)-n(state.fast)+(state.twoHanded?2:0),
      hitMod:(n(state.accurate)*10)-(n(state.pay_hit)*10),
      penetrationBonus:n(state.pen),
      halfWeaponDice:Boolean(state.twoHanded),
      extraTargets:n(state.sweep)
    };
  }catch(_e){
    return {
      damageDiceDelta:0,
      delayDelta:0,
      hitMod:Number(system.maneuverHitMod||0),
      penetrationBonus:Number(system.penetration||0),
      halfWeaponDice:Boolean(system.maneuverTwoHanded),
      extraTargets:0
    };
  }
}

export function maneuverAttackProfile(weapon,maneuver){
  const overlay=maneuverOverlayFromSystem(maneuver?.system||maneuver||{});
  const parsed=parseDiceFormula(weapon?.system?.damage||weapon?.damage||"0");
  const halfBonus=overlay.halfWeaponDice?Math.ceil(parsed.count/2):0;
  const dice=Math.max(0,parsed.count+overlay.damageDiceDelta+halfBonus);
  const flat=Number(parsed.flat||0);
  const damage=`${dice}k${parsed.faces}${flat>0?`+${flat}`:flat<0?String(flat):""}`;
  return {...overlay,baseDice:parsed.count,halfBonus,damage};
}

export function weaponMinimumDelay(weapon){
  const system=weapon?.system||weapon||{};
  const traits=(system.traits||[]).map(t=>String(t).toLowerCase());
  const hands=Number(system.hands||1);
  const raw=Number(system.delay||4);
  if(system.isRanged||Number(system.reload)>0)return 2;
  const name=String(weapon?.name||"").toLowerCase();
  if(raw<=3 || name==="walka bez broni" || traits.some(t=>t.includes("lekka"))) return 3;
  if(hands>=2 || traits.some(t=>t.includes("2-ręczna")||t.includes("2reczna")||t.includes("2 ręczna"))) return 5;
  return 4;
}
