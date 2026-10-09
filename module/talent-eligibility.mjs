import { ARCHETYPE_TALENTS } from "./content.mjs";

const norm=s=>String(s??"").toLocaleLowerCase("pl");
const ALL_ARCHETYPES=["wojownik","lowca","bestia","polmag","kaplan"];
const ARCH_WORDS=[
  ["wojownik","wojownik"],["łowca","lowca"],["lowca","lowca"],["bestia","bestia"],
  ["półmag","polmag"],["polmag","polmag"],["mag","polmag"],["kapłan","kaplan"],["kaplan","kaplan"]
];

export function talentAllowedForRace(talent,species){
  const req=norm(talent?.requirements);
  if(!req || req==="wszyscy" || req==="wszyscy (rasowy)" || req==="–" || req==="-") return true;
  if(req.includes("tauros")) return species==="tauros";
  if(req.includes("krasnolud")) return species==="dwarf";
  if(req.includes("erus")) return species==="erusanin";
  if(req.includes("kastian")) return species==="kastianin";
  if(req.includes("sharii")) return species==="sharii";
  if(req.includes("vampir")) return species==="vampir";
  if(req.includes("therian")) return species==="therian";
  if(req.includes("kevru")) return species==="kevru";
  if(req.includes("ludzie, olagowie") || req.includes("ludzie / olagowie")) return species==="human" || species==="olag";
  if(req.includes("olag")) return species==="olag";
  if(req.includes("ludzie") || req.includes("człowiek")) return species==="human";
  return true;
}

function directArchetypes(requirements){
  const req=norm(requirements);
  const found=new Set();
  for(const [word,key] of ARCH_WORDS){
    if(req.includes(word)) found.add(key);
  }
  // "Mag" appears inside Półmag; after normalization both resolve to polmag and are de-duplicated.
  return found;
}

export function archetypeKeysForTalent(talent,definitions=ARCHETYPE_TALENTS,seen=new Set()){
  if(!talent) return new Set(ALL_ARCHETYPES);
  if(seen.has(talent.name)) return new Set();
  const nextSeen=new Set(seen); nextSeen.add(talent.name);
  const req=String(talent.requirements||"");
  const direct=directArchetypes(req);
  if(direct.size) return direct;
  const reqNorm=norm(req);
  const parents=definitions
    .filter(t=>t?.name && t.name!==talent.name && reqNorm.includes(norm(t.name)))
    .sort((a,b)=>String(b.name).length-String(a.name).length);
  if(parents.length){
    const inherited=new Set();
    for(const parent of parents){
      for(const key of archetypeKeysForTalent(parent,definitions,nextSeen)) inherited.add(key);
    }
    if(inherited.size) return inherited;
  }
  // Brak jawnego ograniczenia archetypu w źródle = talent nie jest filtrowany przez archetyp.
  return new Set(ALL_ARCHETYPES);
}

export function talentAllowedForArchetype(talent,archetype){
  return archetypeKeysForTalent(talent).has(archetype);
}


export function minimumTalentTier(talent,definitions=ARCHETYPE_TALENTS,seen=new Set()){
  if(!talent)return 1;
  if(seen.has(talent.name))return 1;
  const nextSeen=new Set(seen);nextSeen.add(talent.name);
  const req=String(talent.requirements||"");
  const direct=[...req.matchAll(/(?:\bTier\s*|\bT\s*)([1-4])\b/gi)].map(m=>Number(m[1]));
  let minimum=direct.length?Math.max(...direct):1;
  const reqNorm=norm(req);
  const parents=definitions.filter(t=>t?.name&&t.name!==talent.name&&reqNorm.includes(norm(t.name)));
  for(const parent of parents) minimum=Math.max(minimum,minimumTalentTier(parent,definitions,nextSeen));
  return Math.max(1,Math.min(4,minimum));
}

export function hasNamedArchetypePrerequisite(talent,definitions=ARCHETYPE_TALENTS){
  const req=norm(talent?.requirements);
  return definitions.some(t=>t?.name&&t.name!==talent?.name&&req.includes(norm(t.name)));
}

export function archetypeTalentAvailableAtCreation(talent,archetype){
  return talentAllowedForArchetype(talent,archetype) && minimumTalentTier(talent)<=1 && !hasNamedArchetypePrerequisite(talent);
}


function learnedTalentLevel(actor,name){
  const items=Array.from(actor?.items?.contents ?? actor?.items ?? []);
  const item=items.find(i=>i?.type==="talent" && i?.system?.learned && norm(i.name)===norm(name));
  return Math.max(0,Number(item?.system?.level||0));
}

export function monkBridgeTier(actor){
  const archetype=String(actor?.system?.archetype||"");
  const lifePath=norm(actor?.system?.lifePath||"");
  if(archetype!=="kaplan" || (!lifePath.includes("ojczulek") && !lifePath.includes("księżyna"))) return 0;
  if(learnedTalentLevel(actor,"Szkolenie Mnicha")<1) return 0;
  const tier=Math.max(1,Number(actor?.system?.derived?.tier||1));
  return Math.ceil(tier/2);
}

export function archetypeTalentTierForActor(talent,actor){
  const tier=Math.max(1,Number(actor?.system?.derived?.tier||1));
  const archetype=String(actor?.system?.archetype||"");
  if(talentAllowedForArchetype(talent,archetype)) return tier;
  const keys=archetypeKeysForTalent(talent);
  const hybrid=archetype==='bestia'&&learnedTalentLevel(actor,'Bestialska Hybryda')>0&&keys.has('wojownik')?Math.ceil(tier/2):0;
  if(hybrid>0)return minimumTalentTier(talent)<=hybrid?hybrid:0;
  const bridge=monkBridgeTier(actor);
  if(bridge<=0) return 0;
  if(!(keys.has("wojownik")||keys.has("lowca"))) return 0;
  return minimumTalentTier(talent)<=bridge ? bridge : 0;
}

// Purchased Warrior talents remain on the sheet/history; only their effects are gated.
export function talentUsable119(actor,item){
 const def=ARCHETYPE_TALENTS.find(t=>t.name===item?.name);
 if(actor?.system?.archetype!=='bestia'||!learnedTalentLevel(actor,'Bestialska Hybryda')||!def)return true;
 const keys=archetypeKeysForTalent(def);
 return keys.has('bestia')||!keys.has('wojownik')||actor.system.phase==='beast';
}

export function talentAllowedForSpecial(talent,actor){
  const name=norm(talent?.name);
  const archetype=String(actor?.system?.archetype||"");
  const lifePath=norm(actor?.system?.lifePath||"");
  if(name==="mistrz run")return lifePath.includes("znawca run");
  if(name==="szkolenie mnicha" || name==="duchowa pięść") return archetype==="kaplan" && (lifePath.includes("ojczulek")||lifePath.includes("księżyna"));
  if(norm(talent?.requirements).includes("ścieżka: święty rycerz")) return lifePath.includes("święty rycerz");
  return true;
}

export function talentRelevantToActor(talent,actor){
  const category=String(talent?.category||"");
  if(category==="racial") return talentAllowedForRace(talent,String(actor?.system?.species||""));
  if(category==="archetype") return archetypeTalentTierForActor(talent,actor)>0;
  if(category==="special") return talentAllowedForSpecial(talent,actor);
  if(category==="deity") {
    const archetype=String(actor?.system?.archetype||"");
    if(archetype!=="kaplan") return false;
    return !talent?.deity || String(talent.deity)===String(actor?.system?.deity||"");
  }
  return true;
}
