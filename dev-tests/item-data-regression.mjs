import assert from "node:assert/strict";
import { parseItemList, normalizeItemSubmitData, normalizeItemSystem, spellStoredDelay, itemMigrationPatch } from "../module/item-data.mjs";

assert.deepEqual(parseItemList("Runa Obrony, Runa Pancerza\nRuna Obrony"), ["Runa Obrony","Runa Pancerza"]);
assert.deepEqual(parseItemList(["Lekka, Parująca", "Nieporęczna"]), ["Lekka","Parująca","Nieporęczna"]);

const currentWeapon={damage:"3k10",delay:4,runes:["Runa Obrony"],traits:["Lekka"],maneuverOverlayVersion:0};
const weaponSubmit=normalizeItemSubmitData("weapon",{name:"Sztylet +1",system:{damage:"4k10",runes:"Runa Obrony, Runa Obrażeń",traits:"Lekka\nParująca"}},currentWeapon);
assert.equal(weaponSubmit.system.damage,"4k10");
assert.deepEqual(weaponSubmit.system.runes,["Runa Obrony","Runa Obrażeń"]);
assert.deepEqual(weaponSubmit.system.traits,["Lekka","Parująca"]);
assert.equal(weaponSubmit.system.delay,undefined,"partial weapon form must not inject unrelated fields");

const armorSubmit=normalizeItemSubmitData("armor",{system:{locations:{head:"2",body:"3",leftArm:"1",rightArm:"1",leftLeg:"2",rightLeg:"2"},traits:"Ciężka, Wymóg SF 50"}},{});
assert.equal(armorSubmit.system.locations.body,3);
assert.deepEqual(armorSubmit.system.traits,["Ciężka","Wymóg SF 50"]);

const spellState={spellCost:8,aspectCost:8,minDelay:5,fromBook:false,delay:0,builderState:JSON.stringify({calculated:{op:9}}),aspects:["Obrażenia 4k10"],risks:[]};
assert.equal(spellStoredDelay(spellState),9);
assert.equal(normalizeItemSystem("spell",spellState).delay,9);
const spellSubmit=normalizeItemSubmitData("spell",{system:{spellCost:"8",minDelay:"5",delay:"9"}},spellState);
assert.equal(spellSubmit.system.delay,9);
assert.equal(spellSubmit.system.spellCost,8);

const legacyManeuver={builderState:JSON.stringify({strong:1,pay_dmg:2,fast:0,pay_op:1,twoHanded:false,accurate:0,pay_hit:2,pen:1,sweep:0}),maneuverOverlayVersion:0};
const normalizedManeuver=normalizeItemSystem("maneuver",legacyManeuver);
assert.equal(normalizedManeuver.maneuverOverlayVersion,2);
assert.equal(normalizedManeuver.maneuverDamageDiceDelta,-1);
assert.equal(normalizedManeuver.maneuverDelayDelta,1);
assert.equal(normalizedManeuver.maneuverHitMod,-20);
assert.equal(normalizedManeuver.maneuverPenetrationBonus,1);

const spellPatch=itemMigrationPatch({type:"spell",_source:{system:spellState}});
assert.equal(spellPatch["system.delay"],9);
const legacyWeaponPatch=itemMigrationPatch({type:"weapon",_source:{system:{damage:"4k10"}}});
assert.equal(legacyWeaponPatch["system.woundProfile"],"auto");
const maneuverPatch=itemMigrationPatch({type:"maneuver",_source:{system:legacyManeuver}});
assert.equal(maneuverPatch["system.maneuverOverlayVersion"],2);
assert.equal(maneuverPatch["system.maneuverHitMod"],-20);

console.log("Gahla item-data regression: PASS");
