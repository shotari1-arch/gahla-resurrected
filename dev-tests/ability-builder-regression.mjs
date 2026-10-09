import assert from "node:assert/strict";
import { calculateSpell, calculateManeuver } from "../module/ability-builder-rules.mjs";

const spell={mode:"spell",name:"Kula Żaru",spellClass:"Półmag",tier:2,desc:"",dmg:4,pen:0,elName:"",element:0,statdmg:false,heal:0,temphp:0,hitbonus:0,haste:false,state:"0",armorminus:0,hitminus:0,odpminus:0,range:3,aoe:false,duration:0,reaction:false,book:false,minusop:0,customDesc:"",customCost:0,risks:{r_double:false,r_dmg7:false,r_numpech:false,r_1dmg:false,r_aura:false,r_focus:false,r_destab:false,r_fatigue:false,r_delay:0,r_custom_cost:0}};
const sc=calculateSpell(spell);
assert.equal(sc.finalCost,8);
assert.equal(sc.op,9);
assert.equal(sc.minOp,5);

// Kreator manewru MUSI zaczynać od czystego ataku broni, bez demo-kosztów.
const clean={mode:"maneuver",name:"Nowy Manewr",w_name:"Długi Miecz",w_op:6,w_dmg:5,w_hands:1,w_min_op:4,weaponHeavy:false,weaponTwoHandCapable:false,strong:0,accurate:0,pen:0,knockdown:false,bloody:false,stun:false,sweep:0,customDesc:"",customCost:0,twoHanded:false,fast:0,pay_dmg:0,pay_op:0,pay_hit:0};
const cc=calculateManeuver(clean);
assert.equal(cc.stars,0);
assert.equal(cc.totalPaid,0);
assert.equal(cc.balanced,true);
assert.equal(cc.hasModification,false);
assert.equal(cc.finalDmg,5);
assert.equal(cc.finalOp,6);
assert.equal(cc.modHit,0);
assert.equal(cc.damageDiceDelta,0);
assert.equal(cc.delayDelta,0);

// Źródłowy przykład "Podcięcie": Powalający 3*, płatność +1 OP, -10 traf., -1k10.
const trip={...clean,name:"Podcięcie",knockdown:true,pay_dmg:1,pay_op:1,pay_hit:1};
const tc=calculateManeuver(trip);
assert.equal(tc.stars,3);
assert.equal(tc.totalPaid,3);
assert.equal(tc.balanced,true);
assert.equal(tc.finalDmg,4);
assert.equal(tc.finalOp,7);
assert.equal(tc.modHit,-10);
assert.equal(tc.damageDiceDelta,-1);
assert.equal(tc.delayDelta,1);

// Użycie obu rąk nie kosztuje *, tylko +2 OP i +1/2 bazowych kości przy właściwej broni.
const twoHand={...clean,w_name:"Dwuręczny Miecz",w_op:9,w_dmg:8,w_hands:2,weaponTwoHandCapable:true,twoHanded:true};
const hc=calculateManeuver(twoHand);
assert.equal(hc.stars,0);
assert.equal(hc.totalPaid,0);
assert.equal(hc.balanced,true);
assert.equal(hc.hasModification,true);
assert.equal(hc.finalDmg,12,"8k10 + połowa bazowych 8k10 powinno dać 12k10 w podglądzie.");
assert.equal(hc.finalOp,11);
assert.equal(hc.halfWeaponDice,true);

// Szybki nie może zejść poniżej minimalnego OP broni; nadmiar nie zabiera dodatkowych kości.
const fastDagger={...clean,w_name:"Sztylet",w_op:4,w_dmg:3,w_min_op:3,fast:2};
const fdc=calculateManeuver(fastDagger);
assert.equal(fdc.fast,1);
assert.equal(fdc.finalOp,3);
assert.equal(fdc.finalDmg,2);

// Broń Ciężka obniża koszt Powalającego i Ogłuszającego o 1*.
const heavy={...clean,weaponHeavy:true,knockdown:true,stun:true,pay_dmg:2,pay_op:1,pay_hit:2};
const hvc=calculateManeuver(heavy);
assert.equal(hvc.stars,5,"Broń Ciężka: Powalający 2* + Ogłuszający 3* = 5*.");
assert.equal(hvc.totalPaid,5);
assert.equal(hvc.balanced,true);

console.log("Gahla ability-builder regression: PASS");
