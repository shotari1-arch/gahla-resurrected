import assert from "node:assert/strict";
import { maneuverOverlayFromSystem, maneuverAttackProfile, weaponMinimumDelay } from "../module/maneuver-rules.mjs";

const dagger={name:"Sztylet",system:{damage:"3k10",delay:4,hands:1,traits:["Lekka"]}};
const paidWithHit={system:{maneuverOverlayVersion:2,maneuverDamageDiceDelta:0,maneuverDelayDelta:0,maneuverHitMod:-20,maneuverPenetrationBonus:0,maneuverHalfWeaponDice:false,maneuverExtraTargets:0}};
const daggerProfile=maneuverAttackProfile(dagger,paidWithHit);
assert.equal(daggerProfile.damage,"3k10","Manewr opłacony trafieniem nie może podmieniać bazowych obrażeń sztyletu.");
assert.equal(daggerProfile.delayDelta,0,"-20 trafienia nie powinno samo zwiększać OP manewru.");
assert.equal(weaponMinimumDelay(dagger),3);
assert.equal(Number(dagger.system.delay)+daggerProfile.delayDelta,4,"Bazowe OP sztyletu musi pozostać 4 przy zerowej delcie OP.");

const sword2h={name:"Dwuręczny Miecz",system:{damage:"8k10",delay:9,hands:2,traits:["2-ręczna"]}};
const heavyManeuver={system:{maneuverOverlayVersion:2,maneuverDamageDiceDelta:-1,maneuverDelayDelta:2,maneuverHitMod:10,maneuverPenetrationBonus:1,maneuverHalfWeaponDice:true,maneuverExtraTargets:1}};
const heavyProfile=maneuverAttackProfile(sword2h,heavyManeuver);
assert.equal(heavyProfile.halfBonus,4,"Użycie obu rąk powinno dodać połowę bazowych kości, zaokrągloną w górę.");
assert.equal(heavyProfile.damage,"11k10","8k10 -1k10 + połowa 8k10 powinno dać 11k10.");
assert.equal(heavyProfile.penetrationBonus,1);
assert.equal(weaponMinimumDelay(sword2h),5);

const legacy={builderState:JSON.stringify({strong:1,pay_dmg:2,fast:1,pay_op:3,twoHanded:false,accurate:2,pay_hit:1,pen:2,sweep:1})};
const migrated=maneuverOverlayFromSystem(legacy);
assert.deepEqual(migrated,{damageDiceDelta:-2,delayDelta:2,hitMod:10,penetrationBonus:2,halfWeaponDice:false,extraTargets:1});

console.log("Gahla maneuver overlay regression: PASS");
