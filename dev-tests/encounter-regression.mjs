import assert from "node:assert/strict";
import fs from "node:fs";

class ApplicationV2 {}
globalThis.foundry={applications:{api:{ApplicationV2,HandlebarsApplicationMixin:Base=>Base,DialogV2:{}}}};

const data=JSON.parse(fs.readFileSync(new URL("../data/bestiary_tags.json",import.meta.url),"utf8"));
const {computeEncounterMonsterStats,partyReferenceLevel,partyPowerV3,partyPowerV2,partyPowerLegacy,monsterCostV3,monsterCostV2,monsterCostLegacy,allowedTagTier}=await import("../module/encounter-builder.mjs");

const normalizeRule=key=>{
  const r=data.system_info.tag_budget_rules[key];
  return {key,name:r.name,tp:r.tag_points,maxTier:r.max_tag_tier,mult:r.mc_multiplier,mods:r.stat_mods,reactions:r.reactions,description:r.description};
};
const brutal=data.archetypes.find(a=>a.id==="bestia_brutal");
const golem=data.archetypes.find(a=>a.id==="czolg_obronca");

const standard=computeEncounterMonsterStats(data,brutal,normalizeRule("zolnierz_standard"),1,4);
assert.equal(standard.skill,90);
assert.equal(standard.defense,30);
assert.equal(standard.baseSpeed,8);
assert.equal(standard.actualSpeed,8);
assert.equal(standard.damageDice,4);
assert.equal(standard.vitality,3);
assert.equal(standard.usesHP,true,"Żołnierz używa HP zamiast progów Ran.");
assert.equal(standard.woundMax,0);
assert.equal(standard.hp,30,"Żołnierz T1 Bestia: ŻYW 3 × 10 = 30 HP.");
assert.equal(standard.thresholdBonus,1,"Bestia ma +1 do progów, nie +1 ŻYW.");
assert.equal(standard.attributes.sf,45,"T1 Standard Bestia powinien mieć sensowną bazową SF zamiast 0.");
assert.equal(standard.attributes.zr,30);
assert.equal(standard.attributes.per,35);
assert.ok(Object.values(standard.attributes).every(v=>v>0),"Wygenerowany NPC nie może mieć bazowych cech równych 0.");
assert.ok(Object.values(standard.resistances).every(v=>v>0),"Generator powinien nadać NPC także użyteczne Odporności.");

const minion=computeEncounterMonsterStats(data,brutal,normalizeRule("plotka_minion"),1,4);
assert.equal(minion.vitality,3,"ŻYW pozostaje bazą do wyliczenia HP Płotki.");
assert.equal(minion.usesHP,true);
assert.equal(minion.hp,15,"Płotka T1 Bestia: ŻYW 3 × 5 = 15 HP.");
assert.equal(minion.reactions,0,"Płotka nie ma Reakcji.");

assert.equal(data.system_info.scaling.hp_formula.plotka_minion,"HP = ŻYW × 5");
assert.equal(data.system_info.scaling.hp_formula.zolnierz_standard,"HP = ŻYW × 10");
assert.match(data.system_info.scaling.extra_wounds_note,/Dokładnie 2 × najwyższy próg/);

assert.equal(allowedTagTier(normalizeRule("boss"),1),1,"Boss T1 nie może dostać tagu T4.");
assert.equal(allowedTagTier(normalizeRule("elita_lieutenant"),4),3,"Elita pozostaje ograniczona do T3 tagów.");

const party=[
  {system:{level:1,derived:{tier:1,speedBase:10},stats:{sz:10}}},
  {system:{level:7,derived:{tier:3,speedBase:8},stats:{sz:8}}}
];
assert.equal(partyReferenceLevel(party),4,"Poziom referencyjny NPC to zaokrąglona średnia poziomów drużyny.");
assert.equal(partyPowerV3(party,5),13.2,"PP v3 liczy każdą postać jako Poziom × SZ / 5.");
assert.equal(partyPowerV2(party,5),6.8,"PP v2 pozostaje diagnostycznie oparty o Tier.");
assert.equal(partyPowerLegacy(party,5),7.2,"Stary wzór pozostaje wyłącznie diagnostyczny.");

const stdMonster={count:1,ruleMult:1,tier:1,stats:standard};
const golemStats=computeEncounterMonsterStats(data,golem,normalizeRule("zolnierz_standard"),1,4);
const golemMonster={count:1,ruleMult:1,tier:1,stats:golemStats};
assert.equal(monsterCostLegacy(stdMonster),monsterCostLegacy(golemMonster),"Stary MC ignoruje różnicę SZ.");
assert.notEqual(monsterCostV2(stdMonster,5),monsterCostV2(golemMonster,5),"MC v2 uwzględnia bazową SZ przeciwnika.");
assert.notEqual(monsterCostV3(stdMonster,5),monsterCostV3(golemMonster,5),"MC v3 nadal uwzględnia bazową SZ przeciwnika.");

const eliteT3=computeEncounterMonsterStats(data,brutal,normalizeRule("elita_lieutenant"),3,4);
assert.equal(eliteT3.combatLevel,5,"Bez drużyny T3 używa poziomu 5 jako fallbacku.");
assert.equal(eliteT3.attributes.sf,75,"Fallback T3/lvl5 zachowuje oczekiwany profil Elity.");
const eliteLvl7=computeEncounterMonsterStats(data,brutal,normalizeRule("elita_lieutenant"),3,4,7);
assert.equal(eliteLvl7.skill,160,"T3 lvl7 musi być bojowo silniejszy niż T3 lvl5 mimo identycznego Tieru tagów.");
assert.equal(eliteLvl7.defense,100);
assert.equal(eliteLvl7.vitality,11);
assert.equal(eliteLvl7.attributes.sf,85,"Cechy reagują na poziom drużyny wewnątrz tego samego Tieru.");
const hunter=data.archetypes.find(a=>a.id==="skrytobojca_lowca");
const hunterT1=computeEncounterMonsterStats(data,hunter,normalizeRule("zolnierz_standard"),1,4);
assert.ok(hunterT1.attributes.zr>standard.attributes.zr && hunterT1.attributes.per>standard.attributes.per,"Archetyp Łowcy powinien zachować przewagę ZR/PER nad Bestią.");

const bossStats=computeEncounterMonsterStats(data,brutal,normalizeRule("boss"),2,4,4);
assert.equal(bossStats.actualSpeed,bossStats.baseSpeed*4,"Boss w walce skaluje SZ liczbą graczy.");
assert.equal(bossStats.singleHitWoundCap,3,"Boss ma globalną ochronę alpha-strike: max 3 Rany / trafienie.");
const bossCost=monsterCostV3({count:1,ruleMult:4,tier:2,stats:bossStats},5);
assert.equal(bossCost,4*4*(bossStats.baseSpeed/5),"MC v3 Bossa używa poziomu bojowego i nie liczy speed×players drugi raz.");

console.log("Gahla encounter generator regression: PASS");
