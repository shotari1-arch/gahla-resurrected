import {currentRank,rankStep,rankCost,rankSteps,effectTier} from './talent-ranks.mjs';
import { ALL_TALENTS } from "./content.mjs";
import { talentRelevantToActor, archetypeTalentTierForActor, minimumTalentTier } from "./talent-eligibility.mjs";

export const TALENT_CATEGORY_ORDER=["racial","general","archetype","special","deity"];
export const TALENT_CATEGORY_LABELS={racial:"Rasowe",general:"Ogólne",archetype:"Archetypowe",special:"Specjalne",deity:"Boskie"};

const norm=s=>String(s??"").toLocaleLowerCase("pl");

/**
 * Extract only prerequisites which are explicitly another named talent from the source data.
 * This intentionally does not invent dependencies from free-form requirements.
 */
export function explicitTalentPrerequisites(def, definitions=ALL_TALENTS){
  const req=String(def?.requirements||"");
  const reqNorm=norm(req);
  const candidates=definitions
    .filter(t=>t?.name && t.name!==def?.name)
    .sort((a,b)=>String(b.name).length-String(a.name).length);
  const found=[];
  for(const talent of candidates){
    const nameNorm=norm(talent.name);
    const idx=reqNorm.indexOf(nameNorm);
    if(idx<0) continue;
    const tail=req.slice(idx+talent.name.length, idx+talent.name.length+12);
    const levelMatch=tail.match(/\s*T\s*([1-4])/i);
    found.push({name:talent.name, level:levelMatch?Number(levelMatch[1]):1, category:talent.category});
  }
  // A longer talent name can contain a shorter one; keep unique names only.
  return found.filter((p,i,arr)=>arr.findIndex(x=>x.name===p.name)===i);
}

export function knownTalentLevels(actor){
  const map=new Map();
  const items=Array.from(actor?.items?.contents ?? actor?.items ?? []);
  for(const item of items){
    if(item?.type!=="talent" || !item.system?.learned) continue;
    map.set(item.name,currentRank(item,ALL_TALENTS.find(t=>t.name===item.name)??{name:item.name}));
  }
  return map;
}

function statusFor(def, known, actor){
  const current=Number(known.get(def.name)||0);
  const maxLevel=rankSteps(def).length;
  const next=current?current+1:1;
  const tier=Math.max(1,Number(actor?.system?.derived?.tier||1));
  const accessTier=def.category==="archetype"?archetypeTalentTierForActor(def,actor):tier;
  const deity=String(actor?.system?.deity||"");
  const prereqs=explicitTalentPrerequisites(def);
  const missingPrereqs=prereqs.filter(p=>effectTier(Array.from(actor?.items?.contents??actor?.items??[]).find(i=>i.type==="talent"&&i.system?.learned&&i.name===p.name))<p.level);
  const deityLocked=def.category==="deity" && Boolean(def.deity) && def.deity!==deity;
  const maxed=current>=maxLevel;
  const tierLocked=!maxed && ((rankStep(def,next)?.requiredTier??99)>accessTier || tier<minimumTalentTier(def));
  const cost=rankCost(def,Math.min(next,maxLevel));
  return {requiredTier:rankStep(def,Math.min(next,maxLevel))?.requiredTier,costLevel:rankStep(def,Math.min(next,maxLevel))?.costLevel,current,next,tier,accessTier,maxLevel,prereqs,missingPrereqs,deityLocked,maxed,tierLocked,cost,
    canAttempt:!(next>1&&def.rankNeedsDecision)&&!(/WIP/i.test(def.description))&&!['Wybraniec Boży','Święty Wojownik','Błogosławiony'].includes(def.name)&&talentRelevantToActor(def,actor)&&!maxed&&!tierLocked&&!deityLocked&&!missingPrereqs.length};
}

/** Cztery wizualne gałęzie nie zmieniają źródłowych kategorii talentów.
 *  Boskie pozostają oznaczone jako Boskie, ale są pokazane razem ze Specjalnymi,
 *  aby drzewko miało cztery duże, czytelne ścieżki dla gracza.
 */
export const TALENT_BRANCH_ORDER=["heritage","general","archetype","special"];
export const TALENT_BRANCH_LABELS={heritage:"Rasa",general:"Ogólne",archetype:"Archetyp",special:"Specjalne / Boskie"};
const BRANCH_CATEGORIES={heritage:["racial"],general:["general"],archetype:["archetype"],special:["special","deity"]};

/** Build a source-grounded visual forest. Nesting is only created when the source requirement
 * explicitly names another talent in the same source category. Cross-category requirements remain badges.
 */
export function buildTalentTree(actor, definitions=ALL_TALENTS){
  const known=knownTalentLevels(actor);
  const actorDeity=String(actor?.system?.deity||"");
  const actorArchetype=String(actor?.system?.archetype||"");
  const isCleric=actorArchetype==="kaplan";
  // Talenty Boskie są osobistą ścieżką Kapłana. Nie są częścią pełnego katalogu
  // dla pozostałych archetypów, a Kapłan widzi wyłącznie talenty swojego bóstwa.
  const visibleDefinitions=definitions.filter(t=>t.category!=="deity" || (isCleric && (!t.deity || String(t.deity)===actorDeity)));
  const groups=[];
  for(const branch of TALENT_BRANCH_ORDER){
    const categories=BRANCH_CATEGORIES[branch];
    let defs=visibleDefinitions.filter(t=>categories.includes(t.category));
    defs=[...defs].sort((a,b)=>{
      const ar=talentRelevantToActor(a,actor)?0:1, br=talentRelevantToActor(b,actor)?0:1;
      if(ar!==br) return ar-br;
      if(a.category==="deity"||b.category==="deity"){
        const ad=a.deity===actorDeity?0:1, bd=b.deity===actorDeity?0:1;
        if(ad!==bd) return ad-bd;
      }
      return String(a.name).localeCompare(String(b.name),"pl");
    });

    const nodes=new Map();
    for(const def of defs){
      const status=statusFor(def,known,actor);
      const relevant=talentRelevantToActor(def,actor)&&!/WIP/i.test(def.description)&&!['Wybraniec Boży','Święty Wojownik','Błogosławiony'].includes(def.name);
      nodes.set(def.name,{...def,...status,relevant,canAttempt:status.canAttempt&&relevant,descriptionShort:String(def.description||"").length>150?`${String(def.description||"").slice(0,149)}…`:String(def.description||""),categoryLabel:TALENT_CATEGORY_LABELS[def.category]||def.category,children:[],depth:0,parent:"",search:`${def.name} ${def.requirements||""} ${def.description||""} ${def.deity||""}`.toLocaleLowerCase("pl")});
    }
    const roots=[];
    for(const node of nodes.values()){
      const sameCategoryParent=node.prereqs.map(p=>nodes.get(p.name)).find(parent=>parent&&parent.category===node.category);
      if(sameCategoryParent){node.parent=sameCategoryParent.name;sameCategoryParent.children.push(node);}
      else roots.push(node);
    }
    const flat=[];
    const walk=(node,depth=0)=>{
      node.depth=Math.min(depth,4);
      node.depthClass=`depth-${node.depth}`;
      node.prereqText=node.prereqs.map(p=>`${p.name}${p.level>1?` T${p.level}`:""}`).join(", ");
      node.missingText=node.missingPrereqs.map(p=>`${p.name}${p.level>1?` T${p.level}`:""}`).join(", ");
      node.children.sort((a,b)=>String(a.name).localeCompare(String(b.name),"pl"));
      flat.push(node);
      node.children.forEach(c=>walk(c,depth+1));
    };
    roots.sort((a,b)=>String(a.name).localeCompare(String(b.name),"pl")).forEach(r=>walk(r));
    const label=(branch==="special"&&!isCleric)?"Specjalne":TALENT_BRANCH_LABELS[branch];
    groups.push({key:branch,label,count:flat.length,relevantCount:flat.filter(n=>n.relevant).length,nodes:flat});
  }
  return {groups,knownCount:known.size,totalCount:visibleDefinitions.length,relevantCount:visibleDefinitions.filter(t=>talentRelevantToActor(t,actor)).length,tier:Number(actor?.system?.derived?.tier||1),xp:Number(actor?.system?.xp||0),deity:actorDeity,isCleric};
}

