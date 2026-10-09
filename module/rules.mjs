import { thresholdWounds } from './canonical-rules.mjs';
import { ARCHETYPES, RACES, LIFE_PATHS, ALL_TALENTS, WEAPONS, ARMORS, SHIELDS, CONDITIONS, ELEMENTS, DEITIES } from "./content.mjs";

export const STAT_LABELS = { zyw:"ŻYW", sf:"SF", zr:"ZR", sz:"SZ", per:"PER", er:"ER", um:"UM", og:"OG", wia:"WIA", bgl:"BGŁ" };
export const STAT_KEYS = Object.keys(STAT_LABELS);
export const TIERS = [{min:1,max:1,tier:1},{min:2,max:4,tier:2},{min:5,max:7,tier:3},{min:8,max:11,tier:4}];
export const LOCATIONS = [
  ["head","Głowa"],["leftArm","Lewa ręka"],["rightArm","Prawa ręka"],["body","Korpus"],["rightLeg","Prawa noga"],["leftLeg","Lewa noga"]
];
export const RULES = {
  tests:{criticalSuccessMax:5,criticalFailureMin:96,bonusHalf:"ceil(target / 2)",advantage:"odwróć cyfry na lepszy wynik",disadvantage:"odwróć cyfry na gorszy wynik",doubles:"przerzut"},
  defense:{formula:"Obrona start + 10 × (poziom − 1) + ceil(ZR/10)",dodgePerSegment:5,dodgeMaxSegments:4},
  hit:{formula:"ceil(PER/10) + BGŁ − Obrona celu",calledShot:-30,location:"odwrócony wynik rzutu"},
  resistance:{formula:"rasa + archetyp + poziom + ceil(stat/10)"},
  aura:{formula:"ceil(UM/10)+ceil(ER/10)+ceil(WIA/10)+poziom",pointPerDie:1,elementalPointPerDice:2},
  slots:{maneuver:"ceil(BGŁ/20)",spell:"ceil((ceil(UM/10)+ceil(ER/10))/2)",miracle:"ceil((ceil(WIA/10)+ceil(ER/10))/2)"},
  progression:{startXP:100,statsCost:50,generalTalentBase:50,classTalentBase:100,teacherMultiplier:0.5},
  actionCost:{rule:"Redukcje OP mogą się sumować, ale nie obniżają kosztu poniżej minimum danej akcji, chyba że efekt mówi wprost inaczej.",reloadMinimum:1},
  fate:{temporary:"Tymczasowy Punkt Losu nie daje EXP za wydanie i nie może uruchomić efektu tworzącego kolejny Punkt Losu."},
  levelBenefits:{from2:{wounds:1,bgl:10,defense:10},milestones:[3,6,11]},
  woundThresholds:"Rany kumulują się do wyleczenia. 1 poniżej Progu I; 2 od I do poniżej II; 3 od II. Katastrofalne: 2×bazowy II + bonus progów z Odporności = 5 Ran; 3× = 6 itd. Odporność jest już zawarta w progach.",
  lingering:"k100 + 10 × aktualne Rany ponad ŻYW + jakość ostatniego trafienia (10 bonus ALBO 20 krytyk)"
};

export function tierFromLevel(level=1){ const n=Number(level)||1; return TIERS.find(t=>n>=t.min&&n<=t.max)?.tier ?? 4; }
export function ceil10(value){ return Math.ceil(Number(value||0)/10); }
export function clamp(value,min,max){ return Math.min(Math.max(Number(value||0),min),max); }
export function tens(value){ return Math.floor(Math.abs(Number(value||0))/10); }
export function statBonus(value){ return ceil10(value); }
export function reverseD100(result){ const n=Number(result); if(n===100||n===0) return 100; const s=String(Math.max(1,Math.min(100,n))).padStart(2,"0"); const rev=Number(`${s[1]}${s[0]}`); return rev===0?100:rev; }

/** One representation for physical dice and declared replacements; aliases keep old macros working. */
export function d100Result(rawRoll,{advantage=false,disadvantage=false}={}){
  rawRoll=Number(rawRoll)===0?100:Number(rawRoll);
  const mirrorRoll=reverseD100(rawRoll);
  const effectiveRoll=advantage===disadvantage?rawRoll:advantage?Math.min(rawRoll,mirrorRoll):Math.max(rawRoll,mirrorRoll);
  return {rawRoll,mirrorRoll,effectiveRoll,locationRoll:mirrorRoll,raw:rawRoll,final:effectiveRoll,alternate:mirrorRoll};
}

export function rollD100({advantage=false,disadvantage=false,rng=Math.random}={}){
  let roll=Math.floor(rng()*100)+1;
  if(advantage!==disadvantage){
    while(roll<100&&roll%11===0)roll=Math.floor(rng()*100)+1;
  }
  return d100Result(roll,{advantage,disadvantage});
}
export function evaluateTest(roll,target){
  const r=Number(roll), t=Number(target);
  return {roll:r,target:t,criticalFailure:r>=96,criticalSuccess:r>=1&&r<=5,success:r>=1&&r<96&&(r<=5||r<=t),bonus:r>5&&r<96&&r<=Math.ceil(t/2)};
}
export function parseDiceFormula(formula="0"){
  const str=String(formula).trim().toLowerCase().replace(/d/g,"k");
  const m=str.match(/^(\d+)k(\d+)(?:\s*([+-])\s*(\d+))?$/);
  if(!m) return {count:0,faces:10,flat:Number(str)||0};
  return {count:Number(m[1]),faces:Number(m[2]),flat:m[3]==="+"?Number(m[4]):m[3]==="-"?-Number(m[4]):0};
}
export function rollDice(formula="0",rng=Math.random){ const {count,faces,flat}=parseDiceFormula(formula); const rolls=[]; for(let i=0;i<count;i++) rolls.push(Math.floor(rng()*faces)+1); return {formula,rolls,total:rolls.reduce((a,b)=>a+b,0)+flat,flat}; }
export function applyIgnoreLow(rolls,ignoreLow=0){ return rolls.map(n=>Number(n)<=Number(ignoreLow)?0:Number(n)); }
export function getAttackTarget(actor,targetDefense,modifiers=0){ const s=actor.system.stats; return ceil10(s.per)+Number(s.bgl||0)+Number(modifiers||0)-Number(targetDefense||0); }
export function woundCountFromDamage(damage,life,thresholdBonus=0,passive=0){
 const l=Math.max(1,Number(life)||1),b=Number(thresholdBonus)||0;
 return thresholdWounds(damage,{baseI:2*l+b,baseII:3*l+b,passive});
}
export function capWoundsPerHit(wounds,cap=0){
  const w=Math.max(0,Number(wounds||0)), c=Math.max(0,Number(cap||0));
  return c>0?Math.min(w,c):w;
}

export function thresholdSummary(life,bonus=0){
  const l=Math.max(1,Number(life||1)),b=Number(bonus||0);
  const oneMax=2*l+b, twoMax=3*l+b;
  return {one:1,oneMax,twoStart:oneMax,twoMax,threeStart:twoMax,max:twoMax,fiveStart:twoMax*2,extraStep:twoMax};
}
export function lingeringWoundScore({roll,woundsOverMax=0,successType="normal"}){ const b=successType==="crit"?20:successType==="bonus"?10:0; return Number(roll||0)+10*Number(woundsOverMax||0)+b; }
export function pickHitLocation(roll,useRaw=false){ const n=useRaw?Number(roll):reverseD100(roll); if(n<=9)return"head"; if(n<=24)return"leftArm"; if(n<=44)return"rightArm"; if(n<=79)return"body"; if(n<=89)return"rightLeg"; return"leftLeg"; }

export function getLifePath(species,archetype,lifePath){ return LIFE_PATHS.find(x=>x.species===species&&x.archetype===archetype&&x.lifePath===lifePath) ?? null; }
export function getRace(species){ return RACES[species] ?? null; }
export function getArchetype(archetype){ return ARCHETYPES[archetype] ?? null; }
export function availableLifePaths(species,archetype){ return LIFE_PATHS.filter(x=>x.species===species&&x.archetype===archetype); }
export function talentDefinition(name){ return ALL_TALENTS.find(t=>t.name===name) ?? null; }
export function talentCost(definition,targetLevel=1,teacher=false){ if(!definition) return 0; const base=definition.costBase??50; return Math.floor(base*Number(targetLevel||1)*(teacher?0.5:1)); }
export function statUpgradeLimit(tier){ return {1:1,2:4,3:7,4:11}[Number(tier)||1] ?? 11; }
export function startRollFormula(stat){ return stat==="zyw"?"1d3":stat==="sz"?null:"1d10"; }
export function getDamageResistance(actor,damageType="physical"){ const d=actor?.system?.derived; if(damageType==="physical")return Number(d?.physicalResistance||0); if(damageType==="spiritual")return Number(d?.spiritualResistance||0); if(damageType==="magical")return Number(d?.magicalResistance||0); return 0; }

export function damageFromAttack({weapon,attackResult,bonusDamageDice=0,bonusPenetration=0,magical=false,isSpell=false}){
  const parsed=parseDiceFormula(weapon?.system?.damage||"0");
  const broken=Math.max(0,Number(weapon?.system?.broken||0));
  let dice=Math.max(0,parsed.count-broken)+Number(weapon?.system?.damageBonusDice||0)+Number(bonusDamageDice||0);
  return {dice,faces:parsed.faces,flat:Number(parsed.flat||0)+Number(weapon?.system?.flatDamage||0),penetration:Number(weapon?.system?.penetration||0)+Number(bonusPenetration||0),magical:magical||weapon?.system?.damageType!=="physical"||Boolean(weapon?.system?.element)};
}

export { ARCHETYPES, RACES, LIFE_PATHS, ALL_TALENTS, WEAPONS, ARMORS, SHIELDS, CONDITIONS, ELEMENTS, DEITIES };
