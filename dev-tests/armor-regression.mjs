import assert from "node:assert/strict";
import { computeArmorLocations, computeIgnoreLowAtLocation } from "../module/armor-rules.mjs";

const medium={system:{equipped:true,isShield:false,locations:{head:2,leftArm:2,rightArm:2,body:2,leftLeg:2,rightLeg:2},metal:""}};
const lightShield={system:{equipped:true,isShield:true,armor:1,shieldLocation:"leftArm",metal:""}};
let armor=computeArmorLocations([medium,lightShield]);
assert.equal(armor.leftArm,3,"Lekka tarcza powinna DODAĆ +1 do pancerza wybranej lokacji.");
assert.equal(armor.rightArm,2);

const heavyShield={system:{equipped:true,isShield:true,armor:2,shieldLocation:"body",metal:""}};
armor=computeArmorLocations([medium,heavyShield]);
assert.equal(armor.body,4,"Ciężka tarcza powinna DODAĆ +2 do pancerza wybranej lokacji.");

const lightArmor={system:{equipped:true,isShield:false,locations:{head:0,leftArm:1,rightArm:1,body:1,leftLeg:1,rightLeg:1},metal:"Metal Ciężki"}};
armor=computeArmorLocations([medium,lightArmor]);
assert.equal(armor.body,2,"Bonus materiału lżejszego pancerza nie powinien podbijać mocniejszego, niezależnego pancerza na tej samej lokacji.");

const metalShield={system:{equipped:true,isShield:true,armor:1,shieldLocation:"rightArm",metal:"Metal Ciężki"}};
armor=computeArmorLocations([medium,metalShield]);
assert.equal(armor.rightArm,4,"Tarcza 1 + bonus materiału 1 powinna dodać 2 do zbroi 2 na swojej lokacji.");

const paddedMedium={system:{equipped:true,isShield:false,locations:{head:2,leftArm:2,rightArm:2,body:2,leftLeg:2,rightLeg:2},ignoreLow:1,metal:""}};
const heavyIgnoreShield={system:{equipped:true,isShield:true,armor:2,shieldLocation:"leftArm",ignoreLow:2,metal:""}};
assert.equal(computeIgnoreLowAtLocation([paddedMedium,heavyIgnoreShield],"leftArm"),3,"Redukcja niskich kości ze zbroi i tarczy powinna się sumować na chronionej lokacji.");
assert.equal(computeIgnoreLowAtLocation([paddedMedium,heavyIgnoreShield],"rightArm"),1,"Tarcza nie powinna redukować kości poza wybraną lokacją.");

console.log("Gahla armor location regression: PASS");
