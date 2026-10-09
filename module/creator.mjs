import { RACES, ARCHETYPES, LIFE_PATHS, WEAPONS, ARMORS, SHIELDS, RACIAL_TALENTS, GENERAL_TALENTS, ARCHETYPE_TALENTS, DEITY_TALENTS, DEITIES, ELEMENTS } from "./content.mjs";
import { talentAllowedForRace, talentAllowedForArchetype, archetypeTalentAvailableAtCreation } from "./talent-eligibility.mjs";
import { captureApplicationScroll, restoreApplicationScroll } from "./ui-state.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const CREATOR_VERSION = "0.9.6-beta";


const RACE_IDENTITY={
  human:{name:"Jestestwo Człowieka",description:"Do 100 lat. Wolna Wola. Przy tworzeniu postaci losujesz 2 dodatkowe talenty ogólne."},
  olag:{name:"Jestestwo Olaga",description:"Do 100 lat. Wolna Wola. Przy tworzeniu postaci losujesz 1 dodatkowy talent ogólny."},
  tauros:{name:"Jestestwo Taurosa",description:"Do 150 lat. Mocna Skóra za darmo: +Tier do Fizycznego Progu I i II, bez zmiany Pancerza i testów Odporności. +10 Odp. Fizycznej na zimno i +10 PER na węch."},
  dwarf:{name:"Jestestwo Krasnoluda",description:"Do 500 lat. Mocna Skóra za darmo: +Tier do Fizycznego Progu I i II, bez zmiany Pancerza i testów Odporności. +10 Odp. Fizycznej na zimno i podczas picia alkoholu. Skłonność do agresji: −10 Odp. Psychicznej przy prowokacji."},
  erusanin:{name:"Jestestwo Erusanina",description:"Do 1000 lat. Mocna Skóra za darmo: +Tier do Fizycznego Progu I i II, bez zmiany Pancerza i testów Odporności. Nienasycone pragnienie, strach przed ogniem i nadwrażliwość na ogień."},
  kastianin:{name:"Jestestwo Kastianina",description:"Do 100 lat. Aura Cienia: w mroku +1 do Progu Obrażeń. Nadwrażliwość na światło."},
  sharii:{name:"Jestestwo Sharii",description:"Do 100 lat. Aura Światłości: w czystym świetle +1 do Progu Obrażeń. +10 Odp. Fizycznej na gorąco. Nadwrażliwość na cień."},
  vampir:{name:"Jestestwo Vampirsa",description:"Długowieczność. +10 PER na słuch i węch. Zależność od pory dnia. Głód Krwi, Żądza Krwi i wrażliwość na bezpośrednie światło."},
  therian:{name:"Jestestwo Therianina",description:"Do 100 lat. +10 PER na słuch, węch i dotyk. Zależność od przemiany. Darmowy Zmiennokształtny albo Bestialska Hybryda. Wyzwalacz jaźni; w Fazie Zwierza −10 Odp. Psychicznej."}
};

const POWER_SOURCE_PACKAGES={
  test5Element:"+5 do testu + 1k10 obrażeń wybranego żywiołu",
  quality:"+5 do testu; +1 punkt przy bonusie / +2 przy krytyku",
  aura:"+5 do testu; +1 maks. Aury",
  test15:"+15 do testu"
};

const DEFAULT_STATE={
  name:"",species:"human",archetype:"wojownik",sex:"M",lifePath:"",deity:"",deityTalent:"",experience:"",
  rolls:{},manualRolls:false,powerSourcePackage:"test5Element",powerElement:"fire",racialTalent:"",therianFormTalent:"",archetypeTalent:"",generalTalent1:"",generalTalent2:"",
  weapon1:"",weapon2:"",armor:""
};

function itemFromTalent(def, category, extra={}){
  return {name:def.name,type:"talent",system:{category,level:1,maxLevel:Number(def.maxLevel||4),tier:1,learned:true,description:def.description||"",requirements:def.requirements||"",...extra}};
}

function phaseForSpecies(species){
  if(species==="vampir") return "day";
  if(species==="therian") return "human";
  return "normal";
}

async function rollStartingStats(){
  const result={};
  for(const [key,formula] of Object.entries({zyw:"1d3",sf:"1d10",zr:"1d10",per:"1d10",er:"1d10",um:"1d10",og:"1d10",wia:"1d10"})) {
    result[key]=(await new Roll(formula).evaluate()).total;
  }
  return result;
}

export class GahlaCharacterCreator extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS={
    classes:["gahla","character-creator"],tag:"form",
    form:{handler:GahlaCharacterCreator.#submit,closeOnSubmit:false},
    position:{width:980,height:820},
    window:{title:"Gahla Resurrected — Kreator postaci",icon:"fas fa-dice-d20"},
    actions:{create:GahlaCharacterCreator.#create,refreshPath:GahlaCharacterCreator.#refreshPath,randomize:GahlaCharacterCreator.#randomize}
  };
  static PARTS={form:{template:"systems/gahla-resurrected/templates/apps/character-creator.hbs"}};

  constructor(options={}){
    const {folderId=null,folder=null,seedName="",...appOptions}=options;
    super(appOptions);
    this.folderId=folderId||folder||null;
    this.draft=structuredClone(DEFAULT_STATE);
    if(seedName) this.draft.name=String(seedName);
  }

  #captureForm(){
    const root=this.element;
    if(!root) return;
    const value=name=>root.querySelector(`[name="${name}"]`)?.value ?? "";
    const generals=[...root.querySelectorAll('[name="generalTalent"]')].map(e=>e.value||"");
    const manualRolls=Boolean(root.querySelector('[name="manualRolls"]')?.checked);
    const rolls={...this.draft.rolls};
    if(manualRolls){
      for(const key of ["zyw","sf","zr","per","er","um","og","wia"]){
        const el=root.querySelector(`[name="roll_${key}"]`);
        if(el) rolls[key]=Math.max(0,Math.min(99,Number(el.value||0)));
      }
    }
    this.draft={...this.draft,
      name:value("name"),species:value("species")||this.draft.species,sex:value("sex")||this.draft.sex,
      archetype:value("archetype")||this.draft.archetype,lifePath:value("lifePath"),deity:value("deity"),deityTalent:value("deityTalent"),
      selfTrigger:value("selfTrigger"),experience:value("experience"),powerSourcePackage:value("powerSourcePackage")||this.draft.powerSourcePackage,powerElement:value("powerElement")||this.draft.powerElement,
      racialTalent:value("racialTalent"),therianFormTalent:value("therianFormTalent"),archetypeTalent:value("archetypeTalent"),generalTalent1:generals[0]||"",generalTalent2:generals[1]||"",
      weapon1:value("weapon1"),weapon2:value("weapon2"),armor:value("armor"),manualRolls,rolls
    };
  }

  async _onRender(context, options){
    await super._onRender(context, options);
    const rerender=async()=>{this.#captureForm(); captureApplicationScroll(this); await this.render({force:true});};
    this.element.querySelectorAll("[name=species],[name=archetype],[name=sex],[name=deity],[name=lifePath],[name=manualRolls],[name=racialTalent],[name=archetypeTalent],[name=therianFormTalent],[name^=roll_]").forEach(el=>el.addEventListener("change",rerender,{once:true}));
    restoreApplicationScroll(this);
  }

  async _prepareContext(){
    captureApplicationScroll(this);
    if(Object.keys(this.draft.rolls||{}).length<8) this.draft.rolls=await rollStartingStats();
    const species=this.draft.species||"human";
    const sex=this.draft.sex||"M";
    const race=RACES[species];
    const allowedArchetypeKeys=[...new Set(LIFE_PATHS.filter(p=>p.species===species&&!p.special).map(p=>p.archetype))];
    let arch=this.draft.archetype||allowedArchetypeKeys[0]||"wojownik";
    if(!allowedArchetypeKeys.includes(arch)){
      arch=allowedArchetypeKeys[0]||"wojownik";
      this.draft.archetype=arch;
      this.draft.archetypeTalent="";
    }
    const paths=LIFE_PATHS.filter(p=>p.species===species&&p.archetype===arch&&!p.special);
    const path=paths.find(p=>p.lifePath===this.draft.lifePath)||paths[0]||null;
    if(path && this.draft.lifePath!==path.lifePath) this.draft.lifePath=path.lifePath;
    const raceStats=race?.usesHumanBase?RACES.human.stats[sex]:race?.stats?.[sex];
    const preview={};
    if(raceStats&&path){
      for(const k of ["zyw","sf","zr","per","er","um","og","wia"]){
        preview[k]=Number(raceStats[k]||0)+(k==="zyw"?Number(path.zyw||0):0)+Number(path.values?.[k]||0)+Number(this.draft.rolls[k]||0);
      }
      preview.sz=Number(raceStats.sz||0)+Number(ARCHETYPES[arch]?.speed||0);
      preview.bgl=Number(ARCHETYPES[arch]?.bgl||0);
    }
    const archetypeTalents=ARCHETYPE_TALENTS.filter(t=>archetypeTalentAvailableAtCreation(t,arch));
    if(this.draft.archetypeTalent && !archetypeTalents.some(t=>t.name===this.draft.archetypeTalent)) this.draft.archetypeTalent="";
    const labels={zyw:"ŻYW",sf:"SF",zr:"ZR",sz:"SZ",per:"PER",er:"ER",um:"UM",og:"OG",wia:"WIA"};
    const raceBaseStats=["zyw","sf","zr","sz","per","er","um","og","wia"].map(key=>({key,label:labels[key],value:Number(raceStats?.[key]||0)}));
    const pathBaseStats=["zyw","sf","zr","per","er","um","og","wia"].map(key=>({key,label:labels[key],value:key==="zyw"?Number(path?.zyw||0):Number(path?.values?.[key]||0)}));
    const deityTalentOptions=DEITY_TALENTS.filter(t=>t.deity===this.draft.deity);
    return {
      raceOptions:Object.values(RACES).filter(r=>r.playable),archetypeOptions:allowedArchetypeKeys.map(key=>ARCHETYPES[key]).filter(Boolean),pathOptions:paths,
      state:this.draft,previewStats:preview,previewGrowth:{...(path?.growth||{})},raceBaseStats,pathBaseStats,path,race,archetype:ARCHETYPES[arch],raceIdentity:RACE_IDENTITY[species]||null,
      racialTalents:RACIAL_TALENTS.filter(t=>!/WIP/i.test(t.description)&&talentAllowedForRace(t,species) && !(species==="therian"&&["Zmiennokształtny","Bestialska Hybryda"].includes(t.name))),generalTalents:GENERAL_TALENTS,archetypeTalents,
      selectedRacialTalent:RACIAL_TALENTS.find(t=>t.name===this.draft.racialTalent)||null,
      isTherian:species==="therian",therianFormTalents:RACIAL_TALENTS.filter(t=>["Zmiennokształtny","Bestialska Hybryda"].includes(t.name)),
      selectedArchetypeTalent:ARCHETYPE_TALENTS.find(t=>t.name===this.draft.archetypeTalent)||null,
      racialTalentNote:"Talenty z wymogiem „wszyscy” są rasowe, ale dostępne każdej rasie. Specjalistyczne talenty rasowe są filtrowane wg wybranej rasy.",
      weapons:WEAPONS,startingWeapons:[...WEAPONS,...SHIELDS],armors:ARMORS.filter(a=>!a.name.startsWith("Szaty ")),
      deities:DEITIES,deityTalentOptions,powerSourcePackages:Object.entries(POWER_SOURCE_PACKAGES).map(([key,label])=>({key,label})),
      elements:Object.entries(ELEMENTS).map(([key,v])=>({key,label:v.label})),hasDeity:arch==="kaplan",isCombat:Boolean(ARCHETYPES[arch]?.combat),
      sourceNote:"Statystyki na karcie są wynikiem kreatora: rasa + Ścieżka Życia + rzuty + późniejszy rozwój. Pola WIP pozostają WIP."
    };
  }

  static async #submit(){ /* Actions handle creation; this prevents native form navigation. */ }
  static async #refreshPath(){ this.#captureForm(); captureApplicationScroll(this); await this.render({force:true}); }
  static async #randomize(){ this.#captureForm(); this.draft.rolls=await rollStartingStats(); captureApplicationScroll(this); await this.render({force:true}); }

  #readCreationData(){
    this.#captureForm();
    const species=this.draft.species||"human", sex=this.draft.sex||"M", archetype=this.draft.archetype||"wojownik";
    const race=RACES[species], arch=ARCHETYPES[archetype];
    const path=LIFE_PATHS.find(p=>p.species===species&&p.archetype===archetype&&p.lifePath===this.draft.lifePath);
    if(!race||!race.playable) return {error:"Wybrana rasa nie jest gotową rasą grywalną."};
    const allowedArchetypeKeys=[...new Set(LIFE_PATHS.filter(p=>p.species===species&&!p.special).map(p=>p.archetype))];
    if(!allowedArchetypeKeys.includes(archetype)) return {error:"Wybrany archetyp nie ma gotowej startowej Ścieżki Życia dla tej rasy."};
    if(!arch||!path) return {error:"Wybór rasy, archetypu lub Ścieżki Życia jest niepełny."};
    if(path.special) return {error:"Ta Ścieżka Życia jest specjalna i wymaga rytuału; nie można jej wybrać na starcie."};
    const raceStats=race.usesHumanBase?RACES.human.stats[sex]:race.stats?.[sex];
    if(!raceStats) return {error:"Brak gotowych statystyk rasy dla wybranej płci."};

    const pickedRacial=RACIAL_TALENTS.find(t=>t.name===this.draft.racialTalent);
    if(pickedRacial&&/WIP/i.test(pickedRacial.description))return {error:"Ten talent pozostaje WIP — nie można go wybrać."};
    if(!pickedRacial) return {error:"Wybierz 1 talent rasowy."};
    if(!talentAllowedForRace(pickedRacial,species)) return {error:"Wybrany talent rasowy nie jest dostępny dla tej rasy."};
    const therianFormTalent=species==="therian"?RACIAL_TALENTS.find(t=>t.name===this.draft.therianFormTalent&&["Bestialska Hybryda","Zmiennokształtny"].includes(t.name)):null;
    if(species==="therian" && !therianFormTalent) return {error:"Therianin otrzymuje za darmo Zmiennokształtnego albo Bestialską Hybrydę — wybierz jeden z nich."};
    if(species==="therian" && ["Zmiennokształtny","Bestialska Hybryda"].includes(pickedRacial.name)) return {error:"Zmiennokształtny/Bestialska Hybryda są darmowym wyborem Jestestwa Therianina. Jako normalny talent rasowy wybierz inny talent."};

    const generalNames=[this.draft.generalTalent1,this.draft.generalTalent2].filter(Boolean);
    const archetypeTalent=ARCHETYPE_TALENTS.find(t=>t.name===this.draft.archetypeTalent);
    if(archetypeTalent && generalNames.length) return {error:"Wybierz albo 1 talent archetypowy, albo 2 talenty ogólne — nie oba warianty."};
    if(!archetypeTalent && generalNames.length!==2) return {error:"Wybierz 2 talenty ogólne albo 1 talent archetypowy."};
    if(new Set(generalNames).size!==generalNames.length) return {error:"Nie wybieraj dwa razy tego samego talentu ogólnego."};
    if(archetypeTalent && !talentAllowedForArchetype(archetypeTalent,archetype)) return {error:"Wybrany talent archetypowy nie pasuje do archetypu."};
    if(archetypeTalent && !archetypeTalentAvailableAtCreation(archetypeTalent,archetype)) return {error:"W kreatorze startowym można wybrać tylko bazowy talent archetypowy dostępny na Tierze 1, bez wcześniejszego talentu jako wymogu."};
    const generals=generalNames.map(n=>GENERAL_TALENTS.find(t=>t.name===n));
    if(generals.some(x=>!x)) return {error:"Nie udało się odnaleźć jednego z talentów ogólnych."};

    let deityTalent=null;
    if(archetype==="kaplan"){
      if(!this.draft.deity) return {error:"Kapłan musi wybrać bóstwo."};
      deityTalent=DEITY_TALENTS.find(t=>t.deity===this.draft.deity&&t.name===this.draft.deityTalent) || DEITY_TALENTS.find(t=>t.deity===this.draft.deity);
      if(!deityTalent) return {error:"Wybrane bóstwo nie ma gotowego talentu w materiale źródłowym."};
    }

    const startItems=[];
    const identity=RACE_IDENTITY[species];
    if(identity) startItems.push({name:identity.name,type:"talent",system:{category:"racial",level:1,tier:1,learned:true,description:identity.description,requirements:"Talent startowy rasy"}});
    startItems.push(itemFromTalent(pickedRacial,"racial"));
    if(species==="therian" && therianFormTalent && therianFormTalent.name!==pickedRacial.name) startItems.push(itemFromTalent(therianFormTalent,"racial"));
    // Darmowe talenty wynikające wprost z Jestestwa rasy.
    if(["tauros","dwarf","erusanin"].includes(species) && !startItems.some(i=>i.name==="Mocna Skóra")){
      const free=RACIAL_TALENTS.find(t=>t.name==="Mocna Skóra"); if(free) startItems.push(itemFromTalent(free,"racial"));
    }
    if(species==="therian" && therianFormTalent?.name==="Bestialska Hybryda"){
      const free=ARCHETYPE_TALENTS.find(t=>t.name==="Blokada Aury"); if(free) startItems.push(itemFromTalent(free,"archetype"));
    }
    if(species==="therian" && therianFormTalent?.name==="Zmiennokształtny"){
      for(const name of ["Pazury i Kły","Blokada Aury","Naturalna Obrona","Zwierzęcy Szał"]){
        const free=ARCHETYPE_TALENTS.find(t=>t.name===name); if(free) startItems.push(itemFromTalent(free,"archetype"));
      }
    }
    if(archetypeTalent) startItems.push(itemFromTalent(archetypeTalent,"archetype"));
    else startItems.push(...generals.map(t=>itemFromTalent(t,"general")));
    if(species==="human" || species==="olag"){
      const occupied=new Set(startItems.map(i=>i.name));
      const pool=GENERAL_TALENTS.filter(t=>!occupied.has(t.name));
      const extra=species==="human"?2:1;
      for(const t of pool.sort(()=>Math.random()-0.5).slice(0,extra)) startItems.push(itemFromTalent(t,"general"));
    }
    if(deityTalent) startItems.push(itemFromTalent(deityTalent,"deity",{deity:this.draft.deity}));

    if(arch.combat){
      const first=WEAPONS.find(w=>w.name===this.draft.weapon1) || WEAPONS[0];
      const second=[...WEAPONS,...SHIELDS].find(w=>w.name===this.draft.weapon2) || [...WEAPONS,...SHIELDS][0];
      const armor=ARMORS.filter(a=>!a.name.startsWith("Szaty ")).find(a=>a.name===this.draft.armor) || ARMORS.filter(a=>!a.name.startsWith("Szaty "))[0];
      if(first) startItems.push({...first,system:{...first.system,equipped:true}});
      if(second) startItems.push({...second,system:{...second.system,equipped:true}});
      if(armor) startItems.push({...armor,system:{...armor.system,equipped:true}});
    } else {
      const robeName=archetype==="polmag"?"Szaty Półmaga":"Szaty Kapłana";
      const robe=ARMORS.find(a=>a.name===robeName);
      if(robe) startItems.push({...robe,system:{...robe.system,equipped:true}});
      const pkg=this.draft.powerSourcePackage||"test5Element";
      startItems.push({name:"Źródło Mocy — Własne (T1)",type:"powerSource",system:{
        tier:1,description:"Źródło Mocy T1",sourceTier:1,equipped:true,
        sourceTestBonus:pkg==="test15"?15:5,
        sourceBonusPoints:pkg==="quality"?1:0,sourceElement:pkg==="test5Element"?(this.draft.powerElement||"fire"):"",
        enchantments:[pkg==="test15"?"test":pkg==="quality"?"quality":pkg==="aura"?"aura":"element:"+(this.draft.powerElement||"fire")]
      }});
    }

    const stat={};
    for(const k of ["zyw","sf","zr","per","er","um","og","wia"]) stat[k]=Number(raceStats[k]||0)+(k==="zyw"?Number(path.zyw||0):0)+Number(path.values?.[k]||0)+Number(this.draft.rolls[k]||0);
    stat.sz=Number(raceStats.sz||0)+Number(arch.speed||0); stat.bgl=Number(arch.bgl||0);
    const actorData={
      name:this.draft.name?.trim()||"Gahla — Nowa Postać",type:"character",folder:this.folderId||undefined,flags:{"gahla-resurrected":{selfTrigger:String(this.draft.selfTrigger||"")}},
      system:{species,sex,phase:phaseForSpecies(species),archetype,lifePath:path.lifePath,deity:this.draft.deity||"",creation:{completed:true,version:CREATOR_VERSION,wizard:true},level:1,xp:100,appliedLevel:1,
        base:{race:{...raceStats},lifePath:{zyw:path.zyw,...path.values},growth:{...path.growth},rolls:{...this.draft.rolls},raceResist:{...(race.resist||{})},archetypeResist:{...(arch.resist||{})},startBgl:arch.bgl,startDefense:arch.defense,startSpeed:arch.speed,statUpgradeCounts:{zyw:0,sf:0,zr:0,sz:0,per:0,er:0,um:0,og:0,wia:0}},
        stats:stat,fate:{personal:0,group:0},experiences:[this.draft.experience||"Doświadczenie do uzupełnienia"],options:{lingeringWounds:true,deadlyCrits:false},combat:{wounds:{value:0,max:stat.zyw},hp:{value:10,max:10},aura:{value:0,max:0}}
      }
    };
    return {actorData,startItems,stat};
  }

  static async #create(){
    const built=this.#readCreationData();
    if(built.error) return ui.notifications.warn(`Gahla: ${built.error}`);
    const fate=(await new Roll("1d3+1").evaluate()).total;
    built.actorData.system.fate.personal=fate;
    let actor;
    try{
      actor=await Actor.create(built.actorData,{gahlaCreator:true,renderSheet:false});
      if(!actor) return;
      if(built.startItems.length) await actor.createEmbeddedDocuments("Item",built.startItems);
      actor.prepareData();
      const initialAura=Number(actor.system.derived.auraMax||0);
      const updates={"system.combat.wounds.max":Number(actor.system.stats.zyw||built.stat.zyw||0)};
      if(initialAura>0){updates["system.combat.aura.value"]=initialAura;updates["system.combat.aura.max"]=initialAura;}
      await actor.update(updates,{gahlaCreator:true});
      ui.notifications.info(`Gahla: utworzono gotową postać „${actor.name}”.`);
      await this.close();
      await actor.sheet.render({force:true});
    }catch(err){
      console.error("[Gahla] character creator failed",err);
      if(actor) ui.notifications.error("Gahla: postać została utworzona, ale kreator nie ukończył wyposażenia. Sprawdź konsolę.");
      else ui.notifications.error("Gahla: nie udało się utworzyć postaci. Sprawdź konsolę.");
    }
  }
}
