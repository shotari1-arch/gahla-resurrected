import {talentUsable119} from './talent-eligibility.mjs';
import {fullForm119,partialForm119} from './form-canon119.mjs';
import {reservedAura119} from './talent-aura119.mjs';
import {artBonus} from './talent-values119.mjs';
import {bodyRuneCost,runeMasterBonus} from './canon-mechanics.mjs';
import { powerSourceProfile } from './canonical-rules.mjs';
import { modified } from "./effects-engine.mjs";
import { getRace, getArchetype, getLifePath, ceil10, tens, tierFromLevel, RACES, ARCHETYPES } from "./rules.mjs";
import { RUNE_TYPES } from "./content.mjs";
import { computeArmorLocations } from "./armor-rules.mjs";
import { vitalityTalentBonus, meleeAccuracyTalentBonus, auraMasteryBonus, barkSkinBonuses, monkTrainingBonuses } from "./talent-balance.mjs";

const f = foundry.data.fields;
const n = (initial=0, {min=-9999,max=9999,integer=true,persisted=true}={}) => new f.NumberField({initial,min,max,integer,persisted});
const b = (initial=false) => new f.BooleanField({initial});
const s = (initial="") => new f.StringField({initial});
const arrS = (initial=[]) => new f.ArrayField(new f.StringField({initial:""}), {initial});
const locs = () => new f.SchemaField({head:n(),leftArm:n(),rightArm:n(),body:n(),rightLeg:n(),leftLeg:n()});

export class GahlaActorData extends foundry.abstract.TypeDataModel {
  static defineSchema(){
    return {
      species:s("human"), sex:s("M"), phase:s("day"), archetype:s("wojownik"), lifePath:s(""), deity:s(""),
      creation:new f.SchemaField({completed:b(false),version:s(""),wizard:b(false)}),
      npc:new f.SchemaField({
        generated:b(false),tier:n(1,{min:1,max:4}),combatLevel:n(1,{min:1,max:11}),category:s(""),archetypeId:s(""),archetypeName:s(""),role:s(""),source:s(""),
        defense:n(20),damageDice:n(3,{min:1,max:99}),woundMax:n(3,{min:1,max:999}),hpMax:n(10,{min:1,max:9999}),thresholdBonus:n(0),singleHitWoundCap:n(0,{min:0,max:99}),armor:n(0),auraMax:n(0),
        tagBudget:n(0,{min:0,max:99}),tagSpent:n(0,{min:0,max:99}),baseBonus:s(""),tags:arrS([])
      }),
      level:n(1,{min:1,max:11}), xp:n(100,{min:0}), appliedLevel:n(1,{min:1,max:11}),
      base:new f.SchemaField({
        race:new f.SchemaField({zyw:n(),sf:n(),zr:n(),sz:n(),per:n(),er:n(),um:n(),og:n(),wia:n()}),
        lifePath:new f.SchemaField({zyw:n(),sf:n(),zr:n(),per:n(),er:n(),um:n(),og:n(),wia:n()}),
        growth:new f.SchemaField({sf:n(),zr:n(),per:n(),er:n(),um:n(),og:n(),wia:n()}),
        rolls:new f.SchemaField({zyw:n(),sf:n(),zr:n(),per:n(),er:n(),um:n(),og:n(),wia:n()}),
        raceResist:new f.SchemaField({physical:n(),mental:n(),magical:n(),spiritual:n()}),
        archetypeResist:new f.SchemaField({physical:n(),mental:n(),magical:n(),spiritual:n()}),
        startBgl:n(), startDefense:n(), startSpeed:n(),
        statUpgradeCounts:new f.SchemaField({zyw:n(),sf:n(),zr:n(),sz:n(),per:n(),er:n(),um:n(),og:n(),wia:n()}),
        versatileUsedLevel:n(0,{min:0,max:11})
      }),
      stats:new f.SchemaField({zyw:n(1),sf:n(),zr:n(),sz:n(),per:n(),er:n(),um:n(),og:n(),wia:n(),bgl:n()}),
      resistanceBases:new f.SchemaField({physical:n(),mental:n(),magical:n(),spiritual:n()}),
      modifiers:new f.SchemaField({defense:n(),speed:n(),aura:n(),threshold:n(),physicalDR:n(),mentalDR:n(),magicalDR:n(),spiritualDR:n(),physicalFlatDR:n(),mentalFlatDR:n(),magicalFlatDR:n(),spiritualFlatDR:n(),hitMelee:n(),hitRanged:n(),flatMelee:n(),flatRanged:n(),actionDelay:n()}),
      conditions:arrS([]), experiences:arrS([]), classFeatures:arrS([]), notes:s(""),
      prepared:new f.SchemaField({maneuvers:arrS([]),spells:arrS([]),miracles:arrS([])}),
      options:new f.SchemaField({lingeringWounds:b(true),deadlyCrits:b(false),optionalDeadlyCrits:b(false),nonPlayableOverride:b(false)}),
      combat:new f.SchemaField({
        wounds:new f.SchemaField({value:n(0),max:n(1)}),
        hp:new f.SchemaField({value:n(10),max:n(10)}),
        aura:new f.SchemaField({value:n(0),max:n(0)}),
        currentSegments:n(0), reactionUsed:b(false), reactionPenalty:n(0), reactionMax:n(1,{min:0,max:3}), reactionLeft:n(1,{min:0,max:3}), reservedSZ:n(0), normalDebt:n(0), longDebt:n(0), longReady:b(false), justActed:b(false), done:b(false), trackerBoss:b(false), speedOverride:n(0), deadly:b(false), lingeringScore:n(0), transferSegments:n(0),
        bonusPoints:n(0)
      }),
      fate:new f.SchemaField({personal:n(2),group:n(0)}),
      derived:new f.SchemaField({
        tier:n(1,{persisted:false}), bgl:n(0,{persisted:false}), speedBase:n(0,{persisted:false}), defense:n(0,{persisted:false}), hitMelee:n(0,{persisted:false}), hitRanged:n(0,{persisted:false}),
        physicalResistance:n(0,{persisted:false}),mentalResistance:n(0,{persisted:false}),magicalResistance:n(0,{persisted:false}),spiritualResistance:n(0,{persisted:false}),
        auraMax:n(0,{persisted:false}),maneuverSlots:n(0,{persisted:false}),spellSlotsMage:n(0,{persisted:false}),spellSlotsCleric:n(0,{persisted:false}),
        woundOne:n(1,{persisted:false}),woundTwo:n(2,{persisted:false}),woundThree:n(3,{persisted:false}),thresholdBonus:n(0,{persisted:false}),armor:locs(),armorDefense:n(0,{persisted:false}),armorPenalty:n(0,{persisted:false}),
        stealthDisadvantage:b(false),spellMinDelay:n(4,{persisted:false}),preparedManeuversCount:n(0,{persisted:false}),preparedSpellsCount:n(0,{persisted:false}),preparedMiraclesCount:n(0,{persisted:false}),
        physicalFlatDR:n(0,{persisted:false}),mentalFlatDR:n(0,{persisted:false}),magicalFlatDR:n(0,{persisted:false}),spiritualFlatDR:n(0,{persisted:false}),actionDelayMod:n(0,{persisted:false}),flatMelee:n(0,{persisted:false}),flatRanged:n(0,{persisted:false}),unarmedBonusDice:n(0,{persisted:false})
      })
    };
  }

  prepareDerivedData(){
    super.prepareDerivedData();
    const actor=this.parent;
    const arch=getArchetype(this.archetype) ?? {bgl:0,speed:0,defense:0,resist:{physical:0,mental:0,magical:0,spiritual:0}};
    const race=getRace(this.species);
    const lvl=Math.max(1,Number(this.level||1));
    const ceil=ceil10;
    const tier=tierFromLevel(lvl);
    this.derived.tier=tier;

    const isNpc=Boolean(actor?.type && actor.type!=="character");
    if(isNpc){
      const npc=this.npc||{};
      this.stats.zyw=Math.max(0,modified(actor,Number(this.stats.zyw),"zyw"));
      const npcTier=Math.max(1,Math.min(4,Number(npc.tier||tier)));
      this.derived.tier=npcTier;
      let speed=Math.max(1,Number(this.combat.speedOverride||0)||Number(this.stats.sz||1)+Number(this.modifiers.speed||0));
      let defense=Number(npc.defense||0)+Number(this.modifiers.defense||0);
      let actionDelayMod=Number(this.modifiers.actionDelay||0);

      speed=modified(actor,speed,"speed",{},1);
      defense=modified(actor,defense,"defense");
      actionDelayMod=modified(actor,actionDelayMod,"delay");
      const armorItems=actor?.items?.filter(i=>i.type==="armor"&&i.system.equipped&&!fullForm119(actor)) ?? [];
      const armor=computeArmorLocations(armorItems,actor);
      const naturalArmor=Math.max(0,Number(npc.armor||0));
      for(const loc of Object.keys(armor)) this.derived.armor[loc]=Number(armor[loc]||0)+naturalArmor;
      let armorDefense=0,stealthPenalty=0;
      for(const item of armorItems){armorDefense+=Number(item.system.defenseMod||0);stealthPenalty+=Number(item.system.stealthPenalty||0);}
      defense+=armorDefense;

      this.derived.bgl=Math.max(0,Number(this.stats.bgl||0));
      this.derived.speedBase=speed;
      this.derived.defense=defense;
      this.derived.armorDefense=armorDefense;
      this.derived.armorPenalty=stealthPenalty;
      this.derived.stealthDisadvantage=stealthPenalty>0;
      this.derived.physicalResistance=Number(this.resistanceBases.physical||0)+Number(this.modifiers.physicalDR||0);
      this.derived.mentalResistance=Number(this.resistanceBases.mental||0)+Number(this.modifiers.mentalDR||0);
      this.derived.magicalResistance=Number(this.resistanceBases.magical||0)+Number(this.modifiers.magicalDR||0);
      this.derived.spiritualResistance=Number(this.resistanceBases.spiritual||0)+Number(this.modifiers.spiritualDR||0);
      this.derived.physicalFlatDR=Math.max(0,Number(this.modifiers.physicalFlatDR||0));
      this.derived.mentalFlatDR=Math.max(0,Number(this.modifiers.mentalFlatDR||0));
      this.derived.magicalFlatDR=Math.max(0,Number(this.modifiers.magicalFlatDR||0));
      this.derived.spiritualFlatDR=Math.max(0,Number(this.modifiers.spiritualFlatDR||0));
      for(const type of ["physical","mental","magical","spiritual"])this.derived[type+"Resistance"]=modified(actor,this.derived[type+"Resistance"],type+"Resistance");
      const thresholdBonus=Number(npc.thresholdBonus||0)+Number(this.modifiers.threshold||0);
      this.derived.thresholdBonus=thresholdBonus;
      this.derived.woundOne=1;
      this.derived.woundTwo=Math.max(1,2*Number(this.stats.zyw||1)+thresholdBonus);
      this.derived.woundThree=Math.max(1,3*Number(this.stats.zyw||1)+thresholdBonus);
      this.derived.hitMelee=this.derived.bgl+ceil(Number(this.stats.per||0))+Number(this.modifiers.hitMelee||0);
      this.derived.hitRanged=this.derived.bgl+ceil(Number(this.stats.per||0))+Number(this.modifiers.hitRanged||0);
      this.derived.actionDelayMod=actionDelayMod;
      this.derived.flatMelee=Number(this.modifiers.flatMelee||0);
      this.derived.flatRanged=Number(this.modifiers.flatRanged||0);
      this.derived.unarmedBonusDice=0;
      this.derived.maneuverSlots=0; this.derived.spellSlotsMage=0; this.derived.spellSlotsCleric=0;
      this.derived.preparedManeuversCount=actor?.items?.filter(i=>i.type==="maneuver"&&i.system.prepared).length||0;
      this.derived.preparedSpellsCount=actor?.items?.filter(i=>i.type==="spell"&&i.system.prepared).length||0;
      this.derived.preparedMiraclesCount=0;
      this.derived.auraMax=Math.max(0,Number(npc.auraMax||0)+Number(this.modifiers.aura||0)-reservedAura119(actor));
      this.derived.spellMinDelay=4;
      this.stats.sz=this.derived.speedBase;
      this.stats.bgl=this.derived.bgl;
      this.combat.wounds.max=Math.max(0,modified(actor,Number(npc.woundMax||this.stats.zyw||1),"zyw"));
      this.combat.wounds.value=Math.max(0,Number(this.combat.wounds.value||0));
      this.combat.hp.max=Math.max(1,Number(npc.hpMax||this.combat.hp.max||10));
      const currentHp=Number(this.combat.hp.value);
      this.combat.hp.value=Math.min(Math.max(0,Number.isFinite(currentHp)?currentHp:this.combat.hp.max),this.combat.hp.max);
      this.combat.aura.max=this.derived.auraMax;
      const currentAura=Number(this.combat.aura.value);
      this.combat.aura.value=Math.min(Math.max(0,Number.isFinite(currentAura)?currentAura:this.derived.auraMax),this.derived.auraMax);
      return;
    }

    // Reguły postaci wyliczamy z rasy, Ścieżki, rzutów, zakupów EXP i poziomu. Dzięki temu
    // modyfikacja fazy Vampira/Therianina nie nakłada się wielokrotnie po każdym odświeżeniu arkusza.
    const counts=this.base.statUpgradeCounts||{};
    const baseStats={
      zyw:Number(this.base.race.zyw||0)+Number(this.base.lifePath.zyw||0)+Number(this.base.rolls.zyw||0)+(lvl-1),
      sf:Number(this.base.race.sf||0)+Number(this.base.lifePath.sf||0)+Number(this.base.rolls.sf||0)+Number(this.base.growth.sf||0)*Number(counts.sf||0),
      zr:Number(this.base.race.zr||0)+Number(this.base.lifePath.zr||0)+Number(this.base.rolls.zr||0)+Number(this.base.growth.zr||0)*Number(counts.zr||0),
      per:Number(this.base.race.per||0)+Number(this.base.lifePath.per||0)+Number(this.base.rolls.per||0)+Number(this.base.growth.per||0)*Number(counts.per||0),
      er:Number(this.base.race.er||0)+Number(this.base.lifePath.er||0)+Number(this.base.rolls.er||0)+Number(this.base.growth.er||0)*Number(counts.er||0),
      um:Number(this.base.race.um||0)+Number(this.base.lifePath.um||0)+Number(this.base.rolls.um||0)+Number(this.base.growth.um||0)*Number(counts.um||0),
      og:Number(this.base.race.og||0)+Number(this.base.lifePath.og||0)+Number(this.base.rolls.og||0)+Number(this.base.growth.og||0)*Number(counts.og||0),
      wia:Number(this.base.race.wia||0)+Number(this.base.lifePath.wia||0)+Number(this.base.rolls.wia||0)+Number(this.base.growth.wia||0)*Number(counts.wia||0)
    };
    const art=artBonus(actor);baseStats.og+=art.og;baseStats.zr+=art.zr;
    const milestoneSpeed=[3,6,11].filter(x=>lvl>=x).length;
    let stats={...baseStats,sz:Number(this.base.race.sz||0)+Number(arch.speed||0)+milestoneSpeed,bgl:Number(arch.bgl||0)+10*(lvl-1)};
    let physicalDR=Number(this.modifiers.physicalDR||0);
    let mentalDR=Number(this.modifiers.mentalDR||0);
    let magicalDR=Number(this.modifiers.magicalDR||0);
    let spiritualDR=Number(this.modifiers.spiritualDR||0);
    let physicalFlatDR=Number(this.modifiers.physicalFlatDR||0);
    let mentalFlatDR=Number(this.modifiers.mentalFlatDR||0);
    let magicalFlatDR=Number(this.modifiers.magicalFlatDR||0);
    let spiritualFlatDR=Number(this.modifiers.spiritualFlatDR||0);
    let actionDelayMod=Number(this.modifiers.actionDelay||0);
    let thresholdBonus=Number(this.modifiers.threshold||0);
    let auraBonus=powerSourceProfile(actor?.items?.find(i=>i.type==="powerSource"&&i.system.equipped)).aura;
    let hitMeleeBonus=Number(this.modifiers.hitMelee||0);
    let hitRangedBonus=Number(this.modifiers.hitRanged||0);
    let barkArmor=0;
    let barkPhysicalResistance=0;
    const talents=actor?.items?.filter(i=>i.type==="talent"&&i.system.learned&&talentUsable119(actor,i)) ?? [];
    // Proste modyfikatory statystyk z talentów wpływają na "aktualną wartość" przed fazą Vampira/Therianina.
    for(const item of talents){
      const name=item.name.toLowerCase(); const tl=Math.max(1,Math.min(4,Number(item.system.level||1)));
      if(name==="żywotny" || name.includes("żywotny")) stats.zyw+=vitalityTalentBonus(tl);
      if(name==="potencjał magiczny") stats.um+=5+(tl>=3?5:0);
      if(name==="potencjał duchowy") stats.wia+=5+(tl>=3?5:0);
      if(name==="wnikliwość") stats.per+=5+(tl>=3?5:0);
      if(name==="większa muskulatura") stats.sf+=5+(tl>=3?5:0);
      if(name==="gibkość") stats.zr+=5+(tl>=3?5:0);
      if(name==="uczony") stats.er+=5+(tl>=3?5:0);
      if(name==="większa ogłada") stats.og+=5+(tl>=3?5:0);
      if(name==="skóra jak kora") { const bark=barkSkinBonuses(tl); barkArmor=Math.max(barkArmor,bark.armor); barkPhysicalResistance=Math.max(barkPhysicalResistance,bark.physicalResistance); }
    }
    if(this.species==="vampir" || this.species==="therian"){
      const multiplier=partialForm119(actor)?1.25:this.phase==="night" || this.phase==="beast" ? 1.5 : 0.5;
      for(const key of ["zyw","sf","zr","per","er","um","og","wia"]) stats[key]=Math.ceil(Number(stats[key]||0)*multiplier);
    }

    // Runy statystyk/odporności wpływają na aktualne wartości przed wyliczeniem pochodnych.
    const runeStats={zyw:0,sf:0,zr:0,per:0,er:0,um:0,og:0,wia:0};
    const runeRes={physical:0,mental:0,magical:0,spiritual:0};
    const equippedRuneItems=(actor?.items?.filter(i=>(i.system.equipped && !(i.type==="armor"&&fullForm119(actor)) && Array.isArray(i.system.runes)) || (i.type==="rune"&&i.system.bodyRune)) ?? []).map(i=>i.type==="rune"&&i.system.bodyRune?{...i,system:{...i.system,runes:[i.name]}}:i);
    for(const item of equippedRuneItems){
      for(const runeName of item.system.runes){
        const rune=RUNE_TYPES.find(r=>r.name===runeName); if(!rune) continue;
        if(rune.name==="Runa Statystyk" && runeStats[item.system.runeStat]!==undefined) runeStats[item.system.runeStat]+=5;
        if(rune.name==="Runa Odporności" && runeRes[item.system.runeResistance]!==undefined) runeRes[item.system.runeResistance]+=10;
      }
    }
    for(const k of Object.keys(runeStats)) stats[k]+=runeStats[k];
    stats.sf=modified(actor,stats.sf,"sf");
    stats.zyw=Math.max(0,modified(actor,stats.zyw-bodyRuneCost(actor),"zyw"));

    this.derived.bgl=Number(stats.bgl||0);
    this.derived.defense=Number(arch.defense||0)+10*(lvl-1)+ceil(stats.zr)+Number(this.modifiers.defense||0);
    this.derived.speedBase=Math.max(1,Number(this.combat.speedOverride||0)||Number(stats.sz||0)+Number(this.modifiers.speed||0));
    this.derived.speedBase=modified(actor,this.derived.speedBase,"speed",{},1);
    this.derived.defense=modified(actor,this.derived.defense,"defense");
    actionDelayMod=modified(actor,actionDelayMod,"delay");
    const equippedWeapons=actor?.items?.filter(i=>i.type==="weapon"&&i.system.equipped) ?? [];
    const mainWeapon=equippedWeapons[0];
    if(mainWeapon){
      const traits=(mainWeapon.system.traits||[]).map(t=>String(t).toLowerCase());
      if(traits.includes("nieporęczna")) this.derived.defense-=10;
      if(traits.includes("ciężka")) {
        this.derived.defense-=25;
        if(Number(stats.sf||0)<50) this.derived.defense-=25;
      }
    }
    const armorItems=actor?.items?.filter(i=>i.type==="armor"&&i.system.equipped&&!fullForm119(actor)) ?? [];
    const armor=computeArmorLocations(armorItems);
    let armorDefense=0; let stealthPenalty=0; let canAura=true; let ignoreLow=0;
    for(const item of armorItems){
      let itemDefense=Number(item.system.defenseMod||0);
      const metal=String(item.system.metal||"").toLowerCase();
      if(metal.includes("lekki")||metal.includes("elficki")) itemDefense+=10;
      if(metal.includes("zbalans")) itemDefense+=10;
      const armorTraits=(item.system.traits||[]).map(t=>String(t).toLowerCase());
      if(item.system.isShield && armorTraits.some(t=>t.includes("ciężka")) && Number(stats.sf||0)<50) itemDefense-=25;
      if(!item.system.isShield && Number(item.system.armor||0)>=4 && Number(stats.sf||0)<50) itemDefense=-50;
      armorDefense+=itemDefense; stealthPenalty+=Number(item.system.stealthPenalty||0);
      if(item.system.isShield && Number(item.system.ignoreLow||0)>ignoreLow) ignoreLow=Number(item.system.ignoreLow||0);
      if(item.system.auraCompatible) auraBonus+=Number(item.system.auraBonus||0); else if(Number(item.system.armor||0)>0) canAura=false;
      ignoreLow=Math.max(ignoreLow,Number(item.system.ignoreLow||0));
    }
    const wearsArmor=armorItems.some(item=>!item.system.isShield && Number(item.system.armor||0)>0 && !item.system.auraCompatible);
    if(barkArmor>0 && !wearsArmor){
      for(const loc of Object.keys(armor)) armor[loc]=Math.max(Number(armor[loc]||0),barkArmor);
    }
    for(const loc of Object.keys(armor)) this.derived.armor[loc]=armor[loc];
    this.derived.armorDefense=armorDefense; this.derived.armorPenalty=stealthPenalty; this.derived.stealthDisadvantage=stealthPenalty>0;
    this.derived.defense+=armorDefense;
    this.derived.physicalResistance=Number(this.base.raceResist.physical||0)+Number(arch.resist?.physical||0)+lvl+ceil(stats.sf)+physicalDR+barkPhysicalResistance;
    this.derived.mentalResistance=Number(this.base.raceResist.mental||0)+Number(arch.resist?.mental||0)+lvl+ceil(stats.er)+mentalDR;
    this.derived.magicalResistance=Number(this.base.raceResist.magical||0)+Number(arch.resist?.magical||0)+lvl+ceil(stats.um)+magicalDR;
    this.derived.spiritualResistance=Number(this.base.raceResist.spiritual||0)+Number(arch.resist?.spiritual||0)+lvl+ceil(stats.wia)+spiritualDR;

    this.derived.flatMelee=0; this.derived.flatRanged=0; this.derived.unarmedBonusDice=0;
    for(const item of talents){
      const name=item.name.toLowerCase(); const tl=Math.max(1,Math.min(4,Number(item.system.level||1)));
      if(name==="szybki") this.derived.defense+=5*tl;
      if(name==="celny cios") hitMeleeBonus+=meleeAccuracyTalentBonus(tl);
      if(name==="mocny cios") this.derived.flatMelee=Number(this.derived.flatMelee||0)+tens(stats.sf);
      if(name==="precyzyjny strzał") this.derived.flatRanged=Number(this.derived.flatRanged||0)+tens(stats.per);
      if(name==="mistrzostwo aury") auraBonus+=auraMasteryBonus(tl);
      // Mocna Skóra uses the shared physical threshold modifier.
      if(name==="wytrzymały") thresholdBonus+=2*tl;
      // Naturalna Obrona uses the shared physical threshold modifier.
      if(name==="szkolenie mnicha") { const monk=monkTrainingBonuses(tl); this.derived.speedBase+=monk.speed; this.derived.defense+=monk.defense; }
      if(name==="zwinnie") this.derived.defense+=5*tl;
    }

    this.derived.physicalFlatDR=Math.max(0,physicalFlatDR); this.derived.mentalFlatDR=Math.max(0,mentalFlatDR); this.derived.magicalFlatDR=Math.max(0,magicalFlatDR); this.derived.spiritualFlatDR=Math.max(0,spiritualFlatDR);
    // Runy przedmiotowe: efekty, które nie zmieniają bazowych cech.
    for(const item of equippedRuneItems){
      for(const runeName of item.system.runes){
        const rune=RUNE_TYPES.find(r=>r.name===runeName); if(!rune) continue;
        if(rune.name==="Runa Szybkości") this.derived.speedBase+=1;
        if(rune.name==="Runa Obrony") this.derived.defense+=10;
        if(rune.name==="Runa Pancerza" && item.type==="armor" && item.system.runeArmorLocation){
          const loc=item.system.runeArmorLocation; if(loc in this.derived.armor) this.derived.armor[loc]=Number(this.derived.armor[loc]||0)+1;
        }
      }
    }
    for(const key of ["physicalResistance","mentalResistance","magicalResistance","spiritualResistance"])this.derived[key]+=runeMasterBonus(actor);
    this.derived.physicalResistance+=runeRes.physical; this.derived.mentalResistance+=runeRes.mental; this.derived.magicalResistance+=runeRes.magical; this.derived.spiritualResistance+=runeRes.spiritual;

    for(const type of ["physical","mental","magical","spiritual"])this.derived[type+"Resistance"]=modified(actor,this.derived[type+"Resistance"],type+"Resistance");
    const auraBase=ceil(stats.um)+ceil(stats.er)+ceil(stats.wia)+lvl+Number(this.modifiers.aura||0)+auraBonus;
    const calculatedAuraMax=Math.max(0,auraBase);
    const auraLock=talents.some(i=>i.name.toLowerCase()==="blokada aury"&&i.system.learned);
    this.derived.auraMax=Math.max(0,calculatedAuraMax-reservedAura119(actor));
    if(auraLock) thresholdBonus+=Math.floor(calculatedAuraMax/5);
    this.stats.bgl=this.derived.bgl;
    this.derived.maneuverSlots=modified(actor,Math.max(0,Math.ceil(Number(this.derived.bgl||0)/20)),"maneuverSlots",{},0);
    this.derived.spellSlotsMage=modified(actor,Math.max(0,Math.ceil((ceil(stats.um)+ceil(stats.er))/2)),"mageSlots",{},0);
    this.derived.spellSlotsCleric=Math.max(0,Math.ceil((ceil(stats.wia)+ceil(stats.er))/2));
    this.derived.woundOne=1; this.derived.thresholdBonus=thresholdBonus; this.derived.woundTwo=Math.max(1,2*Number(stats.zyw||1)+thresholdBonus); this.derived.woundThree=Math.max(1,3*Number(stats.zyw||1)+thresholdBonus);
    this.derived.hitMelee=ceil(stats.per)+Number(this.derived.bgl||0)+hitMeleeBonus;
    this.derived.hitRanged=ceil(stats.per)+Number(this.derived.bgl||0)+hitRangedBonus;
    this.derived.actionDelayMod=actionDelayMod;
    this.stats.sz=this.derived.speedBase;
    this.derived.spellMinDelay=Math.max(4, tier<=1?4:tier===2?5:tier===3?6:7);
    // Redukcje OP (np. Biegłość Magiczna) nie obniżają minimalnego OP danego czaru.
    // Minimum może przełamać wyłącznie efekt, który mówi o tym wprost.
    this.combat.wounds.max=Math.max(0,Number(stats.zyw||0));
    this.combat.hp.max=Math.max(0,Number(this.combat.hp.max||10));
    this.combat.wounds.value=Math.max(0,Number(this.combat.wounds.value||0));
    this.combat.aura.max=this.derived.auraMax;
    const currentAura=Number(this.combat.aura.value);
    this.combat.aura.value=Math.min(Math.max(0,Number.isFinite(currentAura)?currentAura:0),this.derived.auraMax);
    for (const key of ["zyw","sf","zr","per","er","um","og","wia"]) this.stats[key]=stats[key];
    this.resistanceBases.physical=this.base.raceResist.physical; this.resistanceBases.mental=this.base.raceResist.mental; this.resistanceBases.magical=this.base.raceResist.magical; this.resistanceBases.spiritual=this.base.raceResist.spiritual;
  }
}

export class GahlaItemData extends foundry.abstract.TypeDataModel {
  static defineSchema(){
    return {
      rank:n(0,{min:0,max:4}), maxRank:n(0,{min:0,max:4}), effectTier:n(0,{min:0,max:4}), requiredTier:n(0,{min:0,max:4}), costLevel:n(0,{min:0,max:4}), monkWeaponType:new f.StringField({initial:null,nullable:true}), profileId:s(""), description:s(""), tier:n(1,{min:1,max:4}), level:n(1,{min:1,max:4}), maxLevel:n(4,{min:1,max:4}), category:s(""), requirements:s(""), costXP:n(0), learned:b(false), equipped:b(false), traits:arrS([]),
      damage:s(""), damageType:s("physical"), magical:b(false), element:s(""), woundProfile:s("auto"), delay:n(0), reload:n(0), hands:n(1), penetration:n(0), flatDamage:n(0), damageBonusDice:n(0), broken:n(0), isRanged:b(false), range:s(""),
      armor:n(0), defenseMod:n(0), armorElementResistance:s(""), auraCompatible:b(false), auraBonus:n(0), isShield:b(false), shieldLocation:s("leftArm"), shieldLocations:arrS([]), bodyRune:b(false), bodyRuneCost:n(0,{min:0}), damageStat:s(""), ignoreLow:n(0), stealthPenalty:n(0), locations:locs(), runSlots:n(0), runes:arrS([]), metal:s(""), runeStat:s(""), runeResistance:s(""), runeArmorLocation:s("body"), runeElement:s(""), runeSpell:s(""), runeUsed:b(false),
      spellCost:n(0), aspectCost:n(0), maxCost:n(5), minDelay:n(4), rollStat:s("um"), testBonus:n(0), bonusPoints:n(0), target:s(""), duration:s(""), school:s(""), fromBook:b(false), aspects:arrS([]), risks:arrS([]), prepared:b(false),
      maneuvers:arrS([]), effects:arrS([]), maneuverHitMod:n(0), maneuverBaseOp:n(0), maneuverWeapon:s(""), maneuverTwoHanded:b(false),
      maneuverOverlayVersion:n(0), maneuverDamageDiceDelta:n(0), maneuverDelayDelta:n(0), maneuverPenetrationBonus:n(0), maneuverHalfWeaponDice:b(false), maneuverExtraTargets:n(0),
      deity:s(""), sourceTier:n(1), sourceTestBonus:n(0), sourceBonusPoints:n(0), sourceElement:s(""), enchantments:arrS([]), builderState:s("")
    };
  }
}

