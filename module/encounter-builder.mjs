import { deployEncounter, saveEncounterTemplate, guarded } from "./session-tools.mjs";
import { captureApplicationScroll, restoreApplicationScroll } from "./ui-state.mjs";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;

const SYSTEM_ID="gahla-resurrected";
const DATA_URL=`systems/${SYSTEM_ID}/data/bestiary_tags.json`;
const SPEED_DIVISOR_FALLBACK=5;
const LEVEL_BY_TIER={1:1,2:2,3:5,4:8};
const ACTOR_TYPE_BY_CATEGORY={plotka_minion:"minion",zolnierz_standard:"standard",elita_lieutenant:"elite",boss:"boss"};

const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v||0)));
const round1=v=>Math.round(Number(v||0)*10)/10;
const levelFromTierFallback=tier=>LEVEL_BY_TIER[Math.max(1,Math.min(4,Number(tier||1)))]||1;
const powerTierFromLevel=level=>{const n=Math.max(1,Math.min(11,Number(level||1)));return n>=8?4:n>=5?3:n>=2?2:1;};

export function partyReferenceLevel(actors){
  if(!actors?.length)return 1;
  const levels=actors.map(a=>Math.max(1,Math.min(11,Number(a.system?.level||levelFromTierFallback(a.system?.derived?.tier||1)))));
  return Math.max(1,Math.min(11,Math.round(levels.reduce((a,b)=>a+b,0)/levels.length)));
}

function categoryRule(data,key){
  const r=data?.system_info?.tag_budget_rules?.[key];
  if(!r)return null;
  return {key,name:r.name||key,tp:Number(r.tag_points||0),maxTier:Number(r.max_tag_tier??4),mult:Number(r.mc_multiplier??1),mods:r.stat_mods||{},reactions:Number.isFinite(r.reactions)?Number(r.reactions):null,description:r.description||""};
}


export function allowedTagTier(rule,tier){
  return Math.max(0,Math.min(Number(rule?.maxTier??4),Math.max(1,Number(tier||1))));
}

function baseThresholdBonus(archetype){
  if(Number.isFinite(archetype?.base_stats?.threshold_bonus)) return Number(archetype.base_stats.threshold_bonus);
  // The source bestiary describes this explicitly but v1.3 did not store a numeric field.
  return archetype?.id==="bestia_brutal"?1:0;
}

export function computeEncounterMonsterStats(data,archetype,rule,tier,partyCount=1,combatLevel=null){
  const scaling=data.system_info.scaling;
  const base=archetype.base_stats;
  const mods=rule.mods||{};
  // Tier is intentionally separated from raw combat scaling. It governs tag access / special abilities.
  // Numerical combat stats follow the party's reference LEVEL, which mirrors player progression much better.
  const level=Math.max(1,Math.min(11,Number(combatLevel??levelFromTierFallback(tier))||1));
  const L=level-1;
  const powerTier=powerTierFromLevel(level);
  const levelStep=scaling.level_step||{skill:10,defense:10,vitality:1,wounds:1,attributes:5,resistance:2};
  const hpMode=Boolean(mods.hp_instead_of_wounds || rule?.key==="plotka_minion" || rule?.key==="zolnierz_standard");
  const speedMilestones=Array.isArray(scaling.speed_level_milestones)?scaling.speed_level_milestones:[3,6,11];
  const speedBonus=speedMilestones.filter(x=>level>=Number(x)).length;
  const baseSpeed=Math.max(1,Number(base.speed||1)+speedBonus);
  const actualSpeed=mods.speed_multiplied_by_players?baseSpeed*Math.max(1,Number(partyCount||1)):baseSpeed;
  const vitality=Math.max(1,Number(base.vitality||1)+L*Number(levelStep.vitality||1)+Number(mods.vitality||0));
  const woundMax=hpMode?0:Math.max(1,(Number(base.wounds||1)+L*Number(levelStep.wounds||1)+Number(mods.wounds||0))*Number(mods.wounds_multiplier||1));
  const hpPerVitality=Math.max(1,Number(mods.hp_per_vitality || (rule?.key==="plotka_minion"?5:rule?.key==="zolnierz_standard"?10:0)));
  const hp=hpMode?Math.max(1,Math.round(vitality*hpPerVitality)):null;
  const thresholdBonus=baseThresholdBonus(archetype);
  const attrScaling=scaling.attribute_scaling||{};
  const attrLevelStep=Number(levelStep.attributes??attrScaling.level_step??5);
  const attrMin=Number(attrScaling.minimum||5),attrMax=Number(attrScaling.maximum||95);
  const attrCategoryMod=Number(mods.attributes||0);
  const baseAttrs=base.attributes||{};
  const attributeKeys=["sf","zr","per","er","um","og","wia"];
  const attributes=Object.fromEntries(attributeKeys.map(key=>[key,clamp(Number(baseAttrs[key]||25)+L*attrLevelStep+attrCategoryMod,attrMin,attrMax)]));
  const resBase=Number(attrScaling.resistance_base||10);
  const resLevelStep=Number(levelStep.resistance??attrScaling.resistance_level_step??2);
  const resCategoryMod=Number(mods.resistance||0);
  const resistanceFor=key=>Math.max(0,resBase+Math.ceil(Number(attributes[key]||0)/10)+L*resLevelStep+resCategoryMod);
  const resistances={physical:resistanceFor("sf"),mental:resistanceFor("er"),magical:resistanceFor("um"),spiritual:resistanceFor("wia")};
  const damageTierStep=Number(scaling.damage_dice_per_power_tier??1);
  const singleHitWoundCap=rule?.key==="boss"?Math.max(1,Number(scaling.boss_single_hit_wound_cap||3)):0;
  return {
    combatLevel:level,powerTier,
    skill:Math.max(0,Number(base.skill||0)+L*Number(levelStep.skill||10)+Number(mods.skill||0)),
    defense:Number(base.defense||0)+L*Number(levelStep.defense||10)+Number(mods.defense||0),
    baseSpeed,actualSpeed,attributes,resistances,
    damageDice:Math.max(Number(scaling.min_damage_dice||1),Number(base.damage_dice||1)+(powerTier-1)*damageTierStep+Number(mods.damage_dice||0)),
    vitality,woundMax,hp,usesHP:hpMode,hpPerVitality,thresholdBonus,singleHitWoundCap,
    reactions:Number.isFinite(rule.reactions)?rule.reactions:(rule.key==="plotka_minion"?0:rule.key==="boss"?3:1),
    armor:archetype.id==="czolg_obronca"?1:0,
    auraMax:archetype.id==="adept_mroku_mag"?3:0
  };
}

function woundBands(stats){
  if(stats.usesHP||stats.hp!=null)return [];
  const v=Number(stats.vitality||1),b=Number(stats.thresholdBonus||0);
  const t2=2*v+b,t3=3*v+b;
  return [
    {label:"1 Rana",range:`1–${t2}`},
    {label:"2 Rany",range:`${t2+1}–${t3}`},
    {label:"3 Rany",range:`${t3+1}–${t3*2-1}`},
    {label:"5+ Ran",range:`od ${t3*2}; +1 Rana co ${t3}`}
  ];
}

export function partyPowerV3(actors,speedDivisor=SPEED_DIVISOR_FALLBACK){
  return actors.reduce((sum,a)=>{
    const level=Math.max(1,Math.min(11,Number(a.system?.level||levelFromTierFallback(a.system?.derived?.tier||1))));
    const speed=Number(a.system?.derived?.speedBase||a.system?.stats?.sz||1);
    return sum+(level*speed/speedDivisor);
  },0);
}

export function partyPowerV2(actors,speedDivisor=SPEED_DIVISOR_FALLBACK){
  return actors.reduce((sum,a)=>sum+(Number(a.system?.derived?.tier||1)*Number(a.system?.derived?.speedBase||a.system?.stats?.sz||1)/speedDivisor),0);
}

export function partyPowerLegacy(actors,speedDivisor=SPEED_DIVISOR_FALLBACK){
  if(!actors.length)return 0;
  const sumTiers=actors.reduce((s,a)=>s+Number(a.system?.derived?.tier||1),0);
  const avgSpeed=actors.reduce((s,a)=>s+Number(a.system?.derived?.speedBase||a.system?.stats?.sz||1),0)/actors.length;
  return sumTiers*(avgSpeed/speedDivisor);
}

export function monsterCostV3(monster,speedDivisor=SPEED_DIVISOR_FALLBACK){
  // Category multiplier represents equivalent unit count. Combat LEVEL, not tag Tier,
  // drives the power budget. Boss speed×party is not counted a second time here.
  const level=Math.max(1,Math.min(11,Number(monster.stats?.combatLevel||levelFromTierFallback(monster.tier))));
  return Number(monster.count||1)*Number(monster.ruleMult||1)*level*(Number(monster.stats?.baseSpeed||1)/speedDivisor);
}

export function monsterCostV2(monster,speedDivisor=SPEED_DIVISOR_FALLBACK){
  return Number(monster.count||1)*Number(monster.ruleMult||1)*Number(monster.tier||1)*(Number(monster.stats?.baseSpeed||1)/speedDivisor);
}

export function monsterCostLegacy(monster){ return Number(monster.count||1)*Number(monster.ruleMult||1)*Number(monster.tier||1); }

function difficultyFor(data,ratio){
  const scale=data.system_info.difficulty_scale||[];
  for(const d of scale){
    if(d.max_ratio==null)return d;
    if(ratio<Number(d.max_ratio)||(d.inclusive&&ratio===Number(d.max_ratio)))return d;
  }
  return scale.at(-1)||{id:"none",label:"Brak danych",description:""};
}

async function ensureActorFolder(name="Gahla — Przeciwnicy"){
  let folder=game.folders.find(f=>f.type==="Actor"&&f.name===name&&!f.folder);
  if(!folder) folder=await Folder.create({name,type:"Actor"});
  return folder;
}

export async function createGeneratedEnemyActors(monster,{partyCount=1}={}){
  const folder=await ensureActorFolder();
  const actorType=ACTOR_TYPE_BY_CATEGORY[monster.category]||"standard";
  const created=[];
  for(let i=0;i<Number(monster.count||1);i++){
    const name=Number(monster.count||1)>1?`${monster.name} ${i+1}`:monster.name;
    const s=monster.stats;
    const reactionMax=Math.max(0,Number(s.reactions??1));
    const actor=await Actor.create({
      name,type:actorType,folder:folder.id,
      system:{
        level:Math.max(1,Math.min(11,Number(s.combatLevel||levelFromTierFallback(monster.tier)))),
        creation:{completed:true,version:game.gahla?.version||"",wizard:false},
        options:{nonPlayableOverride:true,lingeringWounds:!s.usesHP},
        npc:{generated:true,tier:monster.tier,combatLevel:Math.max(1,Math.min(11,Number(s.combatLevel||1))),category:monster.categoryLabel,archetypeId:monster.archetypeId,archetypeName:monster.archetypeName,role:monster.role||"",source:"Generator Starć SBSM v3",defense:s.defense,damageDice:s.damageDice,woundMax:Math.max(1,s.woundMax||1),hpMax:Math.max(1,s.hp||10),thresholdBonus:s.thresholdBonus,singleHitWoundCap:Number(s.singleHitWoundCap||0),armor:s.armor,auraMax:s.auraMax,tagBudget:monster.tpBudget,tagSpent:monster.tagSpent,baseBonus:`${monster.baseBonus?.name||""}: ${monster.baseBonus?.effect||""}`,tags:monster.tags.map(t=>t.name)},
        stats:{zyw:Math.max(1,s.vitality||1),sf:Number(s.attributes?.sf||0),zr:Number(s.attributes?.zr||0),sz:s.actualSpeed,per:Number(s.attributes?.per||0),er:Number(s.attributes?.er||0),um:Number(s.attributes?.um||0),og:Number(s.attributes?.og||0),wia:Number(s.attributes?.wia||0),bgl:s.skill},
        resistanceBases:{physical:Number(s.resistances?.physical||0),mental:Number(s.resistances?.mental||0),magical:Number(s.resistances?.magical||0),spiritual:Number(s.resistances?.spiritual||0)},
        modifiers:{threshold:0},
        combat:{wounds:{value:0,max:Math.max(1,s.woundMax||1)},hp:{value:Math.max(1,s.hp||10),max:Math.max(1,s.hp||10)},aura:{value:s.auraMax,max:s.auraMax},currentSegments:0,reactionMax,reactionLeft:reactionMax,trackerBoss:actorType==="boss",speedOverride:s.actualSpeed},
        notes:`${monster.role||""}${monster.ruleDescription?`\n${monster.ruleDescription}`:""}`
      }
    },{gahlaBypassWizard:true});
    if(!actor)continue;
    const delay=Math.max(3,Number(s.damageDice||1)+1);
    const items=[{
      name:"Atak bazowy",type:"weapon",system:{damage:`${s.damageDice}k10`,damageType:"physical",delay,hands:1,penetration:0,equipped:true,traits:["Podstawowa"],description:"Bazowy atak wygenerowanego przeciwnika. Edytuj broń, jeśli potwór używa innego oręża."},flags:{[SYSTEM_ID]:{npcBasicAttack:true}}
    }];
    if(monster.baseBonus?.name) items.push({name:monster.baseBonus.name,type:"talent",system:{category:"special",learned:true,level:1,tier:1,description:monster.baseBonus.effect||"",requirements:"Cecha bazowa archetypu przeciwnika"}});
    for(const tag of monster.tags) items.push({name:tag.name,type:"talent",system:{category:"special",learned:true,level:1,tier:tag.tier,description:tag.effect||"",requirements:`Tag przeciwnika · T${tag.tier} · ${tag.cost} TP`}});
    try{await actor.createEmbeddedDocuments("Item",items);}catch(error){await actor.delete();throw error;}
    created.push(actor);
  }
  return created;
}

export class GahlaEncounterBuilder extends HandlebarsApplicationMixin(ApplicationV2){
  static DEFAULT_OPTIONS={
    classes:["gahla","gahla-encounter-builder"],tag:"form",position:{width:1120,height:860},window:{title:"Gahla — Generator Starć",icon:"fas fa-dragon"},
    form:{handler:GahlaEncounterBuilder.#submit,closeOnSubmit:false},
    actions:{deploy:GahlaEncounterBuilder.#deploy,saveTemplate:GahlaEncounterBuilder.#saveTemplate,toggleParty:GahlaEncounterBuilder.#toggleParty,partyFromCombat:GahlaEncounterBuilder.#partyFromCombat,toggleTag:GahlaEncounterBuilder.#toggleTag,addMonster:GahlaEncounterBuilder.#addMonster,removeMonster:GahlaEncounterBuilder.#removeMonster,clear:GahlaEncounterBuilder.#clear,createActors:GahlaEncounterBuilder.#createActors}
  };
  static PARTS={form:{template:`systems/${SYSTEM_ID}/templates/apps/encounter-builder.hbs`}};
  constructor(options={}){super(options);this.draft={partyIds:new Set(),selectedTags:new Set(),encounter:[],name:"",count:1,category:"zolnierz_standard",tier:1,archetypeId:"",allowForeign:false};this._loaded=false;this.data=null;}

  static async #submit(){ }

  async #load(){
    if(this._loaded)return;
    const response=await fetch(DATA_URL,{cache:"no-cache"});
    if(!response.ok)throw new Error(`Nie udało się wczytać ${DATA_URL}: ${response.status}`);
    this.data=await response.json();this._loaded=true;
    this.draft.archetypeId=this.data.archetypes?.[0]?.id||"";
    for(const actor of game.actors.filter(a=>a.type==="character"&&a.hasPlayerOwner))this.draft.partyIds.add(actor.id);
  }

  #syncForm(){
    const root=this.element;if(!root?.querySelector)return;
    this.draft.name=String(root.querySelector('[name="monsterName"]')?.value||this.draft.name||"");
    this.draft.count=clamp(root.querySelector('[name="monsterCount"]')?.value||this.draft.count,1,99);
    this.draft.category=String(root.querySelector('[name="monsterCategory"]')?.value||this.draft.category);
    this.draft.tier=clamp(root.querySelector('[name="monsterTier"]')?.value||this.draft.tier,1,4);
    this.draft.archetypeId=String(root.querySelector('[name="monsterArchetype"]')?.value||this.draft.archetypeId);
    this.draft.allowForeign=Boolean(root.querySelector('[name="allowForeign"]')?.checked);
  }

  #current(){
    const rule=categoryRule(this.data,this.draft.category)||categoryRule(this.data,"zolnierz_standard");
    const archetype=this.data.archetypes.find(a=>a.id===this.draft.archetypeId)||this.data.archetypes[0];
    return {rule,archetype};
  }

  #tagMap(){
    const map=new Map();
    for(const a of this.data.archetypes){for(let t=1;t<=4;t++){for(const tag of a.tags?.[`tier_${t}`]||[])map.set(tag.id,{...tag,tier:t,archetypeId:a.id,archetypeName:a.name});}}
    return map;
  }

  #pruneSelected(){
    const {rule}=this.#current();const maxTier=allowedTagTier(rule,this.draft.tier);const map=this.#tagMap();
    for(const id of [...this.draft.selectedTags]){const t=map.get(id);if(!t||t.tier>maxTier)this.draft.selectedTags.delete(id);}
    while([...this.draft.selectedTags].reduce((s,id)=>s+Number(map.get(id)?.cost||0),0)>rule.tp){this.draft.selectedTags.delete([...this.draft.selectedTags].at(-1));}
  }

  async _prepareContext(){
    captureApplicationScroll(this);
    await this.#load();this.#pruneSelected();
    const allParty=game.actors.filter(a=>a.type==="character");
    const party=allParty.filter(a=>this.draft.partyIds.has(a.id));
    const partyCount=party.length||1;
    const referenceLevel=party.length?partyReferenceLevel(party):null;
    // Boss SZ is defined as base SZ × party size. Recompute already-added entries when
    // the selected party changes so the preview, balance report and generated Actor agree.
    for(const monster of this.draft.encounter){
      const mr=categoryRule(this.data,monster.category);
      const ma=this.data.archetypes.find(a=>a.id===monster.archetypeId);
      if(mr&&ma){ monster.ruleMult=mr.mult; monster.stats=computeEncounterMonsterStats(this.data,ma,mr,monster.tier,partyCount,referenceLevel); }
    }
    const {rule,archetype}=this.#current();
    const tagMap=this.#tagMap();
    const tagSpent=[...this.draft.selectedTags].reduce((s,id)=>s+Number(tagMap.get(id)?.cost||0),0);
    const tagRemaining=Math.max(0,rule.tp-tagSpent);
    const allowedTier=allowedTagTier(rule,this.draft.tier);
    const groups=this.data.archetypes.filter(a=>a.id===archetype.id||this.draft.allowForeign).map(a=>({
      id:a.id,name:a.name,foreign:a.id!==archetype.id,
      tiers:[1,2,3,4].map(t=>({tier:t,locked:t>allowedTier,tags:(a.tags?.[`tier_${t}`]||[]).map(tag=>({id:tag.id,name:tag.name,cost:Number(tag.cost||t),effect:tag.effect||"",selected:this.draft.selectedTags.has(tag.id),disabled:!this.draft.selectedTags.has(tag.id)&&(t>allowedTier||Number(tag.cost||t)>tagRemaining)}))})).filter(x=>x.tags.length)
    }));
    const preview=computeEncounterMonsterStats(this.data,archetype,rule,this.draft.tier,partyCount,referenceLevel);
    const divisor=Number(this.data.system_info.party_power?.speed_divisor||5);
    const pp=partyPowerV3(party,divisor);
    const v2PP=partyPowerV2(party,divisor);
    const legacyPP=partyPowerLegacy(party,divisor);
    const mc=this.draft.encounter.reduce((s,m)=>s+monsterCostV3(m,divisor),0);
    const v2MC=this.draft.encounter.reduce((s,m)=>s+monsterCostV2(m,divisor),0);
    const legacyMC=this.draft.encounter.reduce((s,m)=>s+monsterCostLegacy(m),0);
    const ratio=pp>0?mc/pp:0,v2Ratio=v2PP>0?v2MC/v2PP:0,legacyRatio=legacyPP>0?legacyMC/legacyPP:0;
    const diff=ratio>0?difficultyFor(this.data,Math.round(ratio*100)/100):null;
    const previewMC=monsterCostV3({count:this.draft.count,ruleMult:rule.mult,tier:this.draft.tier,stats:preview},divisor);
    return {
      party:allParty.map(a=>({id:a.id,name:a.name,selected:this.draft.partyIds.has(a.id),level:Number(a.system.level||1),tier:Number(a.system.derived.tier||1),speed:Number(a.system.derived.speedBase||a.system.stats.sz||1)})),partyCount:party.length,partyReferenceLevel:referenceLevel||levelFromTierFallback(this.draft.tier),
      categories:Object.entries(this.data.system_info.tag_budget_rules).map(([key,r])=>({key,label:r.name,selected:key===this.draft.category,tp:r.tag_points,mult:r.mc_multiplier})),
      archetypes:this.data.archetypes.map(a=>({id:a.id,name:a.name,selected:a.id===archetype.id,role:a.role})),draft:this.draft,rule,archetype,tagGroups:groups,tagSpent,tagRemaining,allowedTier,
      preview:{...preview,woundBands:woundBands(preview),mc:round1(previewMC)},
      encounter:this.draft.encounter.map((m,index)=>({...m,index,mc:round1(monsterCostV3(m,divisor)),v2MC:round1(monsterCostV2(m,divisor)),legacyMC:round1(monsterCostLegacy(m)),woundBands:woundBands(m.stats)})),
      balance:{pp:round1(pp),mc:round1(mc),ratio:ratio?ratio.toFixed(2):"—",difficulty:diff?.label||"Brak danych",difficultyId:diff?.id||"none",description:diff?.description||"",v2PP:round1(v2PP),v2MC:round1(v2MC),v2Ratio:v2Ratio?v2Ratio.toFixed(2):"—",legacyPP:round1(legacyPP),legacyMC:round1(legacyMC),legacyRatio:legacyRatio?legacyRatio.toFixed(2):"—"}
    };
  }

  async _onRender(context,options){
    await super._onRender(context,options);
    const root=this.element;
    for(const sel of ['[name="monsterCategory"]','[name="monsterTier"]','[name="monsterArchetype"]','[name="allowForeign"]']) root.querySelector(sel)?.addEventListener("change",async()=>{this.#syncForm();this.#pruneSelected();captureApplicationScroll(this);await this.render({force:true});});
    for(const sel of ['[name="monsterName"]','[name="monsterCount"]']) root.querySelector(sel)?.addEventListener("change",()=>this.#syncForm());
    restoreApplicationScroll(this);
  }

  static async #toggleParty(_e,t){const id=t.dataset.actorId;if(!id)return;this.draft.partyIds.has(id)?this.draft.partyIds.delete(id):this.draft.partyIds.add(id);captureApplicationScroll(this);await this.render({force:true});}
  static async #partyFromCombat(){this.draft.partyIds.clear();for(const c of game.combat?.combatants||[]){if(c.actor?.type==="character")this.draft.partyIds.add(c.actor.id);}captureApplicationScroll(this);await this.render({force:true});}
  static async #toggleTag(_e,t){
    this.#syncForm();const id=t.dataset.tagId;if(!id)return;const map=this.#tagMap();const tag=map.get(id);const {rule}=this.#current();if(!tag)return;
    if(this.draft.selectedTags.has(id))this.draft.selectedTags.delete(id);else{
      const spent=[...this.draft.selectedTags].reduce((s,x)=>s+Number(map.get(x)?.cost||0),0);const maxTier=allowedTagTier(rule,this.draft.tier);
      if(tag.tier>maxTier)return ui.notifications.warn(`Gahla: tag T${tag.tier} wymaga przeciwnika co najmniej T${tag.tier} i odpowiedniej kategorii.`);
      if(spent+Number(tag.cost||0)>rule.tp)return ui.notifications.warn("Gahla: brak Punktów Tagów.");
      this.draft.selectedTags.add(id);
    }captureApplicationScroll(this);await this.render({force:true});
  }
  static async #addMonster(){
    this.#syncForm();this.#pruneSelected();const {rule,archetype}=this.#current();const map=this.#tagMap();const tags=[...this.draft.selectedTags].map(id=>map.get(id)).filter(Boolean);const spent=tags.reduce((s,t)=>s+Number(t.cost||0),0);const partyCount=this.draft.partyIds.size||1;
    const party=game.actors.filter(a=>this.draft.partyIds.has(a.id));const referenceLevel=party.length?partyReferenceLevel(party):null;
    const stats=computeEncounterMonsterStats(this.data,archetype,rule,this.draft.tier,partyCount,referenceLevel);
    this.draft.encounter.push({name:this.draft.name.trim()||archetype.name,count:this.draft.count,category:this.draft.category,categoryLabel:rule.name,ruleMult:rule.mult,ruleDescription:rule.description,tier:this.draft.tier,archetypeId:archetype.id,archetypeName:archetype.name,role:archetype.role||"",baseBonus:{...archetype.base_bonus},tags:tags.map(x=>({...x})),tpBudget:rule.tp,tagSpent:spent,stats});
    this.draft.name="";this.draft.count=1;this.draft.selectedTags.clear();captureApplicationScroll(this);await this.render({force:true});
  }
  static async #removeMonster(_e,t){const idx=Number(t.dataset.index);if(Number.isInteger(idx)&&idx>=0)this.draft.encounter.splice(idx,1);captureApplicationScroll(this);await this.render({force:true});}
  static async #clear(){if(this.draft.encounter.length&&!(await DialogV2.confirm({window:{title:"Wyczyść starcie"},content:"<p>Usunąć wszystkie wpisy z projektowanego starcia?</p>"})))return;this.draft.encounter=[];captureApplicationScroll(this);await this.render({force:true});}
  static async #deploy(){
    if(this.deploying)return;this.deploying=true;
    try{await guarded(()=>deployEncounter(this.draft.encounter,[...this.draft.partyIds],{start:Boolean(this.element.querySelector('[name="startEncounter"]')?.checked)}));}finally{this.deploying=false;}
  }
  static async #saveTemplate(){
    const fd=await DialogV2.input({window:{title:"Zapisz szablon starcia"},content:'<label>Nazwa <input name="name" required></label>',ok:{label:"Zapisz"}});if(!fd)return;
    await guarded(()=>saveEncounterTemplate(String(fd.name??""),this.draft.encounter,[...this.draft.partyIds]));
  }
  static async #createActors(){
    if(!game.user.isGM)return ui.notifications.warn("Gahla: tylko MG może generować przeciwników.");
    if(!this.draft.encounter.length)return ui.notifications.warn("Gahla: starcie jest puste.");
    let count=0;for(const m of this.draft.encounter){const made=await createGeneratedEnemyActors(m,{partyCount:this.draft.partyIds.size||1});count+=made.length;}
    ui.notifications.info(`Gahla: utworzono ${count} Actorów w folderze „Gahla — Przeciwnicy”.`);
  }
}
