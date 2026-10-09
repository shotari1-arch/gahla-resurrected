import assert from "node:assert/strict";
import fs from "node:fs";
import { inferWoundProfile, scoreRangeContains, resolveLingeringWound, lingeringLocationGroup, normalizeElementKey } from "../module/lingering-wounds.mjs";

const data=JSON.parse(fs.readFileSync(new URL("../data/lingering-wounds.json",import.meta.url),"utf8"));
const physical=["slashing","piercing","blunt","projectile","firearm"];
for(const key of physical){
  assert.ok(data.profiles[key],`Brak profilu ${key}`);
  for(const loc of ["head","body","arm","leg"]){
    assert.equal(data.profiles[key].locations[loc].length,key==="firearm"?15:7,`${key}/${loc} powinno mieć kanoniczne przedziały`);
  }
}
assert.equal(data.profiles.piercing.status,"ACTIVE");
assert.equal(data.elements.status,"ACTIVE");
for(const key of physical){
  for(const loc of ["head","body","arm","leg"]){
    for(let score=1;score<=180;score++){
      const hit=data.profiles[key].locations[loc].filter(r=>scoreRangeContains(r.range,score));
      assert.equal(hit.length,1,`${key}/${loc}: wynik ${score} powinien trafiać dokładnie w jeden przedział`);
    }
  }
}

assert.equal(scoreRangeContains("01 – 09",1),true);
assert.equal(scoreRangeContains("01 – 09",9),true);
assert.equal(scoreRangeContains("10 – 18",10),true);
assert.equal(scoreRangeContains("127+",127),true);
assert.equal(scoreRangeContains("127+",300),true);
assert.equal(lingeringLocationGroup("rightArm"),"arm");
assert.equal(lingeringLocationGroup("leftLeg"),"leg");
assert.equal(normalizeElementKey("Ogień"),"fire");
assert.equal(normalizeElementKey("Cień"),"shadow");

const weapon=(name,system={})=>({name,system});
assert.equal(inferWoundProfile(weapon("Długi Miecz")),"slashing");
assert.equal(inferWoundProfile(weapon("Włócznia")),"piercing");
assert.equal(inferWoundProfile(weapon("Młot Bojowy")),"blunt");
assert.equal(inferWoundProfile(weapon("Kusza",{isRanged:true})),"projectile");
assert.equal(inferWoundProfile(weapon("Muszkiet",{isRanged:true})),"firearm");
assert.equal(inferWoundProfile(weapon("Dziwna broń",{woundProfile:"none"})),"none");

const a=await resolveLingeringWound({score:1,profile:"slashing",location:"head",tables:data});
assert.equal(a.range,"01–40");
const b=await resolveLingeringWound({score:130,profile:"piercing",location:"leftArm",tables:data});
assert.equal(b.range,"121–140");
assert.equal(b.tableStatus,"ACTIVE");
const e=await resolveLingeringWound({score:20,profile:"slashing",location:"head",element:"fire",tables:data});
assert.equal(e.profile,"element");
assert.equal(e.range,"01–40");
assert.equal(e.tableStatus,"ACTIVE");

const raw=JSON.stringify(data);
for(const forbidden of [/\bWW\b/i,/\bSW\b/i,/\bWT\b/i,/\bPŻ\b/i,/\bPB\b/i,/Punkt\w* Obłędu/i,/WFRP/i,/symulacja biegunki/i,/Bardzo Utrudn/i,/Bardzo Trudn/i]){
  assert.doesNotMatch(raw,forbidden,`Pozostałość obcej terminologii: ${forbidden}`);
}

const risky=await resolveLingeringWound({score:104,profile:"slashing",location:"leftArm",tables:data});
assert.equal(risky.deathRisk,3);
assert.equal(risky.tableStatus,"ACTIVE");
for(const profile of ["slashing","piercing","blunt","projectile","element"])for(const loc of ["head","body","leftArm","rightArm","leftLeg","rightLeg"])for(const score of [1,39,40,41,60,61,79,80,81,100,101,120,121,140,141,190]){
 const row=await resolveLingeringWound({score,profile,location:loc,element:profile==="element"?"fire":"",tables:data});
 assert(row);assert(scoreRangeContains(row.range,score));
 if(score>=101&&score<=120)assert.equal(row.deathRisk,3);
 if(score>=121&&score<=140)assert.equal(row.deathRisk,1);
 if(score>=141)assert.equal(row.terminal,["head","body"].includes(loc));
}
assert.equal(inferWoundProfile(weapon("Pazury i kły")),"blunt");
console.log("Gahla lingering-wounds regression: PASS");
