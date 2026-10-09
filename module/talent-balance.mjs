const clampLevel=(level,max=4)=>Math.max(1,Math.min(max,Number(level||1)));

export const TALENT_MAX_LEVELS = Object.freeze({
  "Mocna Skóra":1,
  "Widzenie w Ciemności":1,
  "Nadludzka Siła":1,
  "Szarża Taurosa":1,
  "Silnoręki":1,
  "Niezłomna Postawa":1,
  "Podziemne Zmysły":1,
  "Wszechstronny":1,
  "Zmysł Przyrody":1,
  "Ciało Cienia":1,
  "Ciało Światła":1,
  "Czytanie/Pisanie":1,
  "Heraldyka / Etykieta":1,
  "Kowal własnego Losu":1,
  "Zwinność Akrobaty":1,
  "Otwieranie Zamków":1,
  "Rozbrajanie Pułapek":1,
  "Magiczne Manewry":1,
  "Krok Widma":1,
  "Wybraniec Boży":1,
  "Święty Wojownik":1,
  "Błogosławiony":1,
  "Skóra jak Kora":3,
  "Szkolenie Mnicha":2
});

export function talentMaxLevel(name,fallback=4){
  return Math.max(1,Math.min(4,Number(TALENT_MAX_LEVELS[String(name||"")] ?? fallback)));
}

export function vitalityTalentBonus(level){ return clampLevel(level); }
export function meleeAccuracyTalentBonus(level){ return 5*clampLevel(level); }
export function auraMasteryBonus(level){ return clampLevel(level)+1; }
export function rerollTalentUses(level){ return clampLevel(level)>=3?2:1; }
export function weaponTrainingBonusPoints(level,{bonus=false,criticalSuccess=false}={}){
  return (bonus||criticalSuccess)?clampLevel(level):0;
}
export function barkSkinBonuses(level){
  const l=clampLevel(level);
  return {armor:l>=3?2:1,physicalResistance:l>=3?10:l>=2?5:0};
}
export function monkTrainingBonuses(level){
  const l=clampLevel(level,2);
  return l>=2
    ? {bgl:30,defense:10,speed:1,unarmedBonusDice:1}
    : {bgl:20,defense:0,speed:0,unarmedBonusDice:1};
}
export function taurosChargeBonusDice(baseStrength,tier){
  const raw=Math.max(0,Math.floor(Number(baseStrength||0)/20));
  const cap=Math.max(0,Math.min(6,Number(tier||1)+2));
  return Math.min(raw,cap);
}
export function bloodMetabolismUses(level){ return clampLevel(level); }
export function enforceActionMinimum(cost,minimum){
  return Math.max(Number(minimum||0),Number(cost||0));
}
