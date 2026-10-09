import { readFile } from "node:fs/promises";
const once = new Map();
const many = new Map();
globalThis.Hooks = {
  once(name, fn) { once.set(name, fn); },
  on(name, fn) { if (!many.has(name)) many.set(name, []); many.get(name).push(fn); }
};

let lastRenderedApp=null;
class BaseApp {
  constructor(options={}) { this.options=options; this.document=options.document; }
  async _prepareContext(){ return {}; }
  _processFormData(_event,_form,formData){ return structuredClone(formData?.object ?? {}); }
  async _onRender(){}
  render(options={}){ this.lastRenderOptions=options; lastRenderedApp=this; return this; }
}
class ActorSheetV2 extends BaseApp { get actor(){ return this.document; } }
class ItemSheetV2 extends BaseApp { get item(){ return this.document; } }
class ApplicationV2 extends BaseApp { get state(){ return 0; } }
class ActorDirectory extends BaseApp {}
class TypeDataModel { prepareDerivedData(){} }
class Field { constructor(options={}, extra={}) { this.options=options; this.extra=extra; } }
class SchemaField extends Field {}
class ArrayField extends Field {}

const sheetRegistry = { Actor:{}, Item:{} };
const DocumentSheetConfig = {
  registerSheet(docClass, scope, sheetClass, options={}) {
    const name = docClass.documentName || docClass.name;
    const id = `${scope}.${sheetClass.name}`;
    for (const type of options.types || ["base"]) {
      sheetRegistry[name] ??= {};
      sheetRegistry[name][type] ??= {};
      sheetRegistry[name][type][id] = { cls:sheetClass, label:options.label, default:!!options.makeDefault };
    }
  },
  unregisterSheet(docClass, scope, sheetClass, options={}) {
    const name = docClass.documentName || docClass.name;
    const id = `${scope}.${sheetClass.name}`;
    for (const type of options.types || Object.keys(sheetRegistry[name] || {})) delete sheetRegistry[name]?.[type]?.[id];
  },
  getSheetClassesForSubType(name, type) {
    const entries = sheetRegistry[name]?.[type] || {};
    const ids = Object.keys(entries);
    const def = ids.find(id => entries[id].default) || ids[0] || "";
    return { defaultClass:def, defaultClasses:{[type]:def}, sheetClasses:Object.fromEntries(ids.map(id => [id, entries[id].label || id])) };
  },
  updateDefaultSheets(setting={}) {
    for (const [name, types] of Object.entries(setting)) for (const [type, id] of Object.entries(types || {})) {
      const entries = sheetRegistry[name]?.[type] || {};
      for (const entry of Object.values(entries)) entry.default = false;
      if (entries[id]) entries[id].default = true;
    }
  }
};

class FoundryActor { static documentName="Actor"; }
class FoundryItem { static documentName="Item"; }
globalThis.foundry = {
  applications: {
    api: {
      ApplicationV2,
      DialogV2: { input: async()=>null, confirm: async()=>false },
      HandlebarsApplicationMixin: Base => class extends Base {}
    },
    sheets: { ActorSheetV2, ItemSheetV2 },
    apps: { DocumentSheetConfig },
    sidebar: { tabs: { ActorDirectory } }
  },
  abstract: { TypeDataModel },
  data: { fields: {
    NumberField:Field, BooleanField:Field, StringField:Field, ArrayField, SchemaField
  }},
  documents: { Actor:FoundryActor, Item:FoundryItem },
  utils: { deepClone:o=>structuredClone(o), mergeObject:(a,b)=>Object.assign({},a,b) }
};

globalThis.Actor = class Actor extends FoundryActor {};
globalThis.Item = class Item extends FoundryItem {};
globalThis.Combat = class Combat {};
globalThis.ActiveEffect = class {};
globalThis.Folder = class { static async create(){} };
globalThis.ChatMessage = class {};
globalThis.Roll = class {};
globalThis.CONFIG = { Actor:{}, Item:{}, Combat:{}, statusEffects:[] };
globalThis.Handlebars = { registerHelper(){} };
globalThis.ui = { notifications:{ info(){}, warn(){}, error(){} } };
globalThis.document = {
  addEventListener(){},
  querySelector(){return null;},
  createElement(){ return {dataset:{},addEventListener(type,fn){this[`on_${type}`]=fn;},append(){},insertAdjacentElement(){}}; }
};
globalThis.game = {
  system:{id:"gahla-resurrected"},
  user:{isGM:true,id:"U1",character:null},
  settings:{
    register(){}, registerMenu(){}, get(scope,key){ if(scope==="core" && key==="sheetClasses") return {}; return 0; }, async set(){}
  },
  actors:[], items:[], folders:[], i18n:{localize:s=>s}
};

globalThis.CONST = { ACTIVE_EFFECT_MODES:{ADD:2}, DOCUMENT_OWNERSHIP_LEVELS:{OWNER:3} };

await import(new URL(`../gahla-resurrected.mjs?smoke=${Date.now()}`, import.meta.url));
if (!once.has("init")) throw new Error("Main module loaded but did not register init hook");
await once.get("init")();

if (CONFIG.Actor.documentClass?.name !== "GahlaActor") throw new Error(`Actor document class not installed: ${CONFIG.Actor.documentClass?.name}`);
if (CONFIG.Item.documentClass?.name !== "GahlaItem") throw new Error(`Item document class not installed: ${CONFIG.Item.documentClass?.name}`);
const actorInfo = DocumentSheetConfig.getSheetClassesForSubType("Actor", "character");
const itemInfo = DocumentSheetConfig.getSheetClassesForSubType("Item", "weapon");
if (!actorInfo.defaultClass.includes("GahlaActorSheet")) throw new Error(`GahlaActorSheet not default: ${JSON.stringify(actorInfo)}`);
if (!itemInfo.defaultClass.includes("GahlaItemSheet")) throw new Error(`GahlaItemSheet not default: ${JSON.stringify(itemInfo)}`);
if (!game.gahla?.debugSheets) throw new Error("game.gahla API not initialized");
if (!game.gahla?.executeAction || !game.gahla?.openEncounterBuilder) throw new Error("Gahla macro/encounter APIs not initialized");
if (!(many.get("hotbarDrop")||[]).length) throw new Error("Gahla hotbarDrop handler not registered");
let assignedMacro=null, assignedSlot=null;
game.macros=[];
game.user.assignHotbarMacro=async(macro,slot)=>{assignedMacro=macro;assignedSlot=slot;};
globalThis.Macro={create:async data=>{const macro={...data,getFlag:(scope,key)=>data.flags?.[scope]?.[key]};game.macros.push(macro);return macro;}};
await many.get("hotbarDrop")[0](null,{type:"GahlaAction",actorUuid:"Actor.A1",action:"attack",label:"Test — Atak"},4);
if(!assignedMacro || assignedSlot!==4 || !String(assignedMacro.command).includes("game.gahla.executeAction")) throw new Error("Gahla hotbar macro was not created/assigned");

const directoryHooks = many.get("renderApplicationV2") || [];
if (!directoryHooks.length) throw new Error("Actor directory creator render hook not registered");
const insertedButtons=[];
const fakeCreateButton={insertAdjacentElement(_where,el){insertedButtons.push(el);}};
const fakeDirectoryRoot={querySelector(selector){
  if(selector==="[data-gahla-character-creator]") return null;
  if(selector==='[data-action="createEntry"]') return fakeCreateButton;
  return null;
}};
for(const hook of directoryHooks) hook(new ActorDirectory(),fakeDirectoryRoot,{canCreateEntry:true},{});
if(insertedButtons.length!==2 || !insertedButtons.some(b=>b.dataset.gahlaCharacterCreator==="true") || !insertedButtons.some(b=>b.dataset.gahlaEncounterBuilder==="true")) throw new Error("Gahla creator/encounter buttons were not injected into ActorDirectory");

// Exercise the actual sheet context path. Previous tests only proved that files parsed;
// this catches failures which occur only when a character sheet is opened.
const { GahlaActorSheet, GahlaItemSheet } = await import(new URL("../module/sheets.mjs", import.meta.url));
const emptyItems = {
  contents: [],
  get(){ return null; },
  find(){ return undefined; },
  filter(){ return []; },
  [Symbol.iterator](){ return this.contents[Symbol.iterator](); }
};
const actorSystem = {
  species:"human", sex:"M", phase:"normal", archetype:"wojownik", lifePath:"", deity:"",
  level:1, xp:100,
  stats:{zyw:10,sf:10,zr:10,sz:5,per:10,er:10,um:10,og:10,wia:10,bgl:10},
  derived:{tier:1,speedBase:5,defense:10,physicalResistance:10,mentalResistance:10,magicalResistance:10,spiritualResistance:10,hitMelee:20,hitRanged:20,woundTwo:20,woundThree:30,thresholdBonus:0,maneuverSlots:1,spellSlotsMage:0,spellSlotsCleric:0,armor:{head:2,leftArm:3,rightArm:2,body:2,leftLeg:2,rightLeg:2},armorDefense:0},
  combat:{wounds:{value:0,max:10},aura:{value:0,max:0},transferSegments:0},
  fate:{personal:2}, conditions:[], experiences:[], classFeatures:[], base:{growth:{},statUpgradeCounts:{}}
};
const mockActor = { id:"A1", name:"Testowa Postać", type:"character", system:actorSystem, items:emptyItems, knownTalents:[], statuses:new Set() };
const actorSheet = new GahlaActorSheet({document:mockActor});
actorSheet.isEditable = true;
const actorContext = await actorSheet._prepareContext({});
if (actorContext.actor !== mockActor || actorContext.stats.length !== 10) throw new Error("GahlaActorSheet _prepareContext failed");
if (actorContext.system?.derived?.speedBase !== 5) throw new Error("GahlaActorSheet did not expose system data");
if ("availableTalentGroups" in actorContext || "availableTalents" in actorContext) throw new Error("Actor sheet still prepares the full talent catalog");
if (!Array.isArray(actorContext.talentGroups)) throw new Error("Known talents are not grouped");
if (!Array.isArray(actorContext.weapons) || !Array.isArray(actorContext.spells)) throw new Error("Actor sheet item categories missing");
if (actorContext.armorLocations?.length !== 6 || actorContext.armorLocations.find(x=>x.key==="leftArm")?.value !== 3) throw new Error("Actor sheet armor-location context missing");
if (actorContext.woundBands?.length !== 3) throw new Error("Actor sheet wound-threshold context missing");

const mockItem = { id:"I1", name:"Miecz", type:"weapon", system:{aspects:[],runes:[],equipped:false} };
const itemSheet = new GahlaItemSheet({document:mockItem});
itemSheet.isEditable = true;
const itemContext = await itemSheet._prepareContext({});
if (itemContext.item !== mockItem || itemContext.type !== "weapon") throw new Error("GahlaItemSheet _prepareContext failed");
if (GahlaItemSheet.DEFAULT_OPTIONS?.form?.submitOnChange !== true) throw new Error("GahlaItemSheet must auto-submit changed fields");
const processedItem=itemSheet._processFormData(null,null,{object:{name:"Miecz testowy",system:{runes:"Runa Obrony, Runa Obrażeń",traits:"Lekka\nParująca",damage:"4k10"}}});
if (!Array.isArray(processedItem.system.runes) || processedItem.system.runes.length!==2) throw new Error("GahlaItemSheet did not normalize runes to ArrayField data");
if (!Array.isArray(processedItem.system.traits) || processedItem.system.traits.length!==2) throw new Error("GahlaItemSheet did not normalize traits to ArrayField data");
for (const type of ["weapon","armor","talent","spell","maneuver","rune","powerSource","equipment"]) {
  const system={aspects:[],runes:[],traits:[],risks:[],effects:[],maneuvers:[],enchantments:[],locations:{head:0,leftArm:0,rightArm:0,body:0,leftLeg:0,rightLeg:0}};
  const doc={id:`T-${type}`,name:`Test ${type}`,type,parent:null,system};
  const sheet=new GahlaItemSheet({document:doc}); sheet.isEditable=true;
  const ctx=await sheet._prepareContext({});
  if(ctx.type!==type || !ctx.typeLabel) throw new Error(`GahlaItemSheet context missing for ${type}`);
}

// The ItemSheet edit button previously used the legacy render(true) signature. Exercise it
// so maneuver/spell editing must open an ApplicationV2 builder with {force:true}.
const maneuverItem={id:"M1",name:"Testowy Manewr",type:"maneuver",parent:mockActor,system:{aspects:[],runes:[],builderState:"",maneuverOverlayVersion:2}};
const maneuverSheet=new GahlaItemSheet({document:maneuverItem});
await GahlaItemSheet.DEFAULT_OPTIONS.actions.openBuilder.call(maneuverSheet);
if(lastRenderedApp?.constructor?.name!=="GahlaAbilityBuilder" || lastRenderedApp?.lastRenderOptions?.force!==true) throw new Error("Maneuver ItemSheet edit did not open GahlaAbilityBuilder with ApplicationV2 render options");

const { GahlaAbilityBuilder } = await import(new URL(`../module/ability-builder.mjs?smoke=${Date.now()}`, import.meta.url));
const { GahlaInitiativeTracker } = await import(new URL(`../module/tracker.mjs?smoke=${Date.now()}`, import.meta.url));
const { GahlaTalentTree } = await import(new URL(`../module/talent-tree.mjs?smoke=${Date.now()}`, import.meta.url));
const { GahlaSetupApp } = await import(new URL("../module/setup.mjs", import.meta.url));
const { GahlaEncounterBuilder } = await import(new URL("../module/encounter-builder.mjs", import.meta.url));
const { GahlaCharacterCreator } = await import(new URL("../module/creator.mjs", import.meta.url));

async function assertTemplateActions(templateRel, AppClass) {
  const text = await readFile(new URL(`../${templateRel}`, import.meta.url), "utf8");
  const actions = [...text.matchAll(/data-action=["']([^"']+)/g)].map(m => m[1]);
  const handlers = AppClass.DEFAULT_OPTIONS?.actions || {};
  for (const action of new Set(actions)) {
    if (!(action in handlers)) throw new Error(`${templateRel}: no ApplicationV2 action handler for ${action}`);
  }
}
await assertTemplateActions("templates/actor/character-sheet.hbs", GahlaActorSheet);
await assertTemplateActions("templates/item/item-sheet.hbs", GahlaItemSheet);
await assertTemplateActions("templates/apps/setup.hbs", GahlaSetupApp);
await assertTemplateActions("templates/apps/character-creator.hbs", GahlaCharacterCreator);
await assertTemplateActions("templates/apps/ability-builder.hbs", GahlaAbilityBuilder);
const abilityTemplate = await readFile(new URL("../templates/apps/ability-builder.hbs", import.meta.url), "utf8");
const ids = [...abilityTemplate.matchAll(/id=["']([^"']+)/g)].map(m=>m[1]);
if (new Set(ids).size !== ids.length) throw new Error("ability-builder.hbs contains duplicate element ids");
await assertTemplateActions("templates/apps/initiative-tracker.hbs", GahlaInitiativeTracker);
await assertTemplateActions("templates/apps/talent-tree.hbs", GahlaTalentTree);
await assertTemplateActions("templates/apps/encounter-builder.hbs", GahlaEncounterBuilder);


const talentTreeActor={...mockActor,system:{...actorSystem,archetype:"kaplan",xp:500,deity:"Gida",derived:{...actorSystem.derived,tier:2}}};
const treeApp=new GahlaTalentTree({actor:talentTreeActor});
const treeContext=await treeApp._prepareContext({});
if(treeContext.tree?.totalCount<100 || treeContext.groups?.length!==4) throw new Error("GahlaTalentTree _prepareContext failed");
const deityNodes=treeContext.groups.flatMap(g=>g.nodes||[]).filter(n=>n.category==="deity");
if(!deityNodes.length || deityNodes.some(n=>n.deity!=="Gida")) throw new Error("GahlaTalentTree exposed deity talents outside the cleric's deity");
const generalTree=treeContext.groups.find(g=>g.key==="general");
const medicine=generalTree?.nodes.find(n=>n.name==="Medycyna Zaawansowana");
if(!medicine?.prereqs?.some(p=>p.name==="Pierwsza Pomoc"&&p.level===2)) throw new Error("Talent tree did not extract explicit prerequisite");

const builderApp = new GahlaAbilityBuilder({mode:"spell"});
const builderContext = await builderApp._prepareContext({});
if (builderContext.spell?.finalCost !== 8 || builderContext.spell?.op !== 9) throw new Error("GahlaAbilityBuilder _prepareContext failed");
const equippedDagger={id:"W-DAG",name:"Sztylet",type:"weapon",system:{equipped:true,damage:"3k10",delay:4,penetration:0,hands:1,traits:[]}};
const spareSword={id:"W-SWD",name:"Miecz zapasowy",type:"weapon",system:{equipped:false,damage:"5k10",delay:6,penetration:0,hands:1,traits:[]}};
const weaponCollection={contents:[equippedDagger,spareSword],get(id){return this.contents.find(x=>x.id===id)||null;},[Symbol.iterator](){return this.contents[Symbol.iterator]();}};
const maneuverActor={...mockActor,id:"A-MV",items:weaponCollection};
const maneuverBuilder=new GahlaAbilityBuilder({actor:maneuverActor,mode:"maneuver"});
const maneuverBuilderContext=await maneuverBuilder._prepareContext({});
if(maneuverBuilderContext.state?.weaponId!=="W-DAG" || maneuverBuilderContext.state?.w_name!=="Sztylet" || maneuverBuilderContext.state?.w_op!==4 || maneuverBuilderContext.state?.w_dmg!==3) throw new Error("GahlaAbilityBuilder did not use the currently equipped weapon as maneuver base");
if(maneuverBuilderContext.maneuver?.stars!==0 || maneuverBuilderContext.maneuver?.totalPaid!==0 || maneuverBuilderContext.maneuver?.finalDmg!==3 || maneuverBuilderContext.maneuver?.finalOp!==4 || maneuverBuilderContext.maneuver?.modHit!==0) throw new Error("Fresh maneuver builder must start as a clean weapon attack with no automatic costs");
if(maneuverBuilderContext.state?.twoHanded || maneuverBuilderContext.state?.pay_dmg || maneuverBuilderContext.state?.pay_op || maneuverBuilderContext.state?.pay_hit) throw new Error("Fresh maneuver builder contains demo/default modifiers");
if(maneuverBuilderContext.maneuverWeapons?.length!==1) throw new Error("GahlaAbilityBuilder should offer only equipped weapons as maneuver bases");
if (!GahlaAbilityBuilder.DEFAULT_OPTIONS?.form?.handler) throw new Error("GahlaAbilityBuilder has no ApplicationV2 form handler");
if (!GahlaCharacterCreator.DEFAULT_OPTIONS?.form?.handler) throw new Error("GahlaCharacterCreator has no ApplicationV2 form handler");
if (!GahlaInitiativeTracker.DEFAULT_OPTIONS?.form?.handler) throw new Error("GahlaInitiativeTracker has no ApplicationV2 form handler");
if (!GahlaSetupApp.DEFAULT_OPTIONS?.form?.handler) throw new Error("GahlaSetupApp has no ApplicationV2 form handler");

const creatorApp = new GahlaCharacterCreator({seedName:"Kreator Test"});
creatorApp.draft.rolls={zyw:1,sf:1,zr:1,per:1,er:1,um:1,og:1,wia:1};
const creatorContext = await creatorApp._prepareContext({});
if (!creatorContext.pathOptions?.length || creatorContext.state.name !== "Kreator Test") throw new Error("GahlaCharacterCreator _prepareContext failed");
const { LIFE_PATHS: CREATOR_PATHS } = await import(new URL("../module/content.mjs", import.meta.url));
for(const species of ["human","olag","tauros","dwarf","erusanin","kastianin","sharii","vampir","therian"]){
  const app=new GahlaCharacterCreator();
  app.draft.species=species; app.draft.rolls={zyw:1,sf:1,zr:1,per:1,er:1,um:1,og:1,wia:1};
  const ctx=await app._prepareContext({});
  if(!ctx.archetypeOptions.length) throw new Error(`Creator has no archetype for playable race ${species}`);
  for(const arch of ctx.archetypeOptions){
    if(!CREATOR_PATHS.some(p=>p.species===species&&p.archetype===arch.key&&!p.special)) throw new Error(`Creator exposes invalid race/archetype combo: ${species}/${arch.key}`);
  }
  if(ctx.pathOptions.some(p=>p.special)) throw new Error(`Creator exposes special life path at start for ${species}`);
}
const humanCreator=new GahlaCharacterCreator(); humanCreator.draft.species="human"; humanCreator.draft.rolls={zyw:1,sf:1,zr:1,per:1,er:1,um:1,og:1,wia:1};
const humanCtx=await humanCreator._prepareContext({});
if(!humanCtx.racialTalents.some(t=>t.name==="Widzenie w Ciemności") || humanCtx.racialTalents.some(t=>t.name==="Nadludzka Siła")) throw new Error("Creator racial-talent filter failed for human");
if (!creatorContext.archetypeOptions.every(a=>creatorContext.pathOptions.some(p=>p.archetype===a.key) || creatorContext.pathOptions[0]?.archetype===a.key)) {
  // pathOptions is scoped to the selected archetype; all options are nevertheless source-backed by LIFE_PATHS.
  const { LIFE_PATHS } = await import(new URL("../module/content.mjs", import.meta.url));
  if (!creatorContext.archetypeOptions.every(a=>LIFE_PATHS.some(p=>p.species===creatorContext.state.species&&p.archetype===a.key&&!p.special))) throw new Error("Creator offers archetype without a start life path for selected race");
}
creatorApp.draft.manualRolls=true;
creatorApp.draft.rolls={zyw:3,sf:10,zr:9,per:8,er:7,um:6,og:5,wia:4};
const manualContext=await creatorApp._prepareContext({});
if(!manualContext.state.manualRolls || manualContext.previewStats.sf<=0) throw new Error("Creator manual-roll mode failed");


// Exercise library organization: talents must be categorized and deity talents must not be duplicated.
let folderSeq=0;
globalThis.Folder.create=async data=>{
  const folder={id:`F${++folderSeq}`,name:data.name,type:data.type,folder:data.folder?{id:data.folder}:null,_source:{folder:data.folder??null}};
  game.folders.push(folder);
  return folder;
};
globalThis.Item.createDocuments=async docs=>{
  for(const data of docs){
    const item={id:`I${game.items.length+1}`,name:data.name,type:data.type,system:data.system||{},folder:data.folder?{id:data.folder}:null,_source:{folder:data.folder??null},
      async update(update){if("folder" in update){this.folder=update.folder?{id:update.folder}:null;this._source.folder=update.folder??null;}},
      async delete(){const idx=game.items.indexOf(this);if(idx>=0)game.items.splice(idx,1);}
    };
    game.items.push(item);
  }
  return docs;
};
await GahlaSetupApp.DEFAULT_OPTIONS.actions.seed.call(new GahlaSetupApp());
for(const label of ["Talenty — Rasowe","Talenty — Ogólne","Talenty — Archetypowe","Talenty — Specjalne","Talenty — Boskie"]){
  if(!game.folders.some(f=>f.name===label)) throw new Error(`Missing library talent folder: ${label}`);
}
const deityTalentKeys=game.items.filter(i=>i.type==="talent"&&i.system?.category==="deity").map(i=>`${i.system.deity}:${i.name}`);
if(new Set(deityTalentKeys).size!==deityTalentKeys.length) throw new Error("Library seed created duplicate deity talents");

const preCreate = many.get("preCreateActor")?.[0];
if (!preCreate) throw new Error("Wizard-first preCreateActor hook not registered");
const cancelBlank = preCreate({type:"character",name:"Nowy Bohater",pack:null,folder:null},{},{},"U1");
if (cancelBlank !== false) throw new Error("Blank character creation was not redirected to creator");
const allowWizard = preCreate({type:"character",name:"Gotowy",pack:null,folder:null},{},{gahlaCreator:true},"U1");
if (allowWizard === false) throw new Error("Creator-created character was incorrectly cancelled");

// 0.9.2 migration: generated Minions/Soldiers created by older builds must move to the new HP formula
// without healing already lost HP. 10/10 with 2 damage taken becomes 28/30 for a ŻYW 3 Soldier.
const legacyStandard={
  id:"NPC-OLD-1",name:"Stary Goblin",type:"standard",
  system:{npc:{generated:true,hpMax:10},stats:{zyw:3},combat:{hp:{value:8,max:10},deadly:false},options:{lingeringWounds:true}},
  getFlag(){return "";},
  async update(patch){
    for(const [path,value] of Object.entries(patch)){
      const keys=path.split("."); let node=this;
      for(let i=0;i<keys.length-1;i++) node=node[keys[i]] ??= {};
      node[keys.at(-1)]=value;
    }
  }
};
game.actors.push(legacyStandard);
if (once.has("ready")) await once.get("ready")();
if(legacyStandard.system.combat.hp.max!==30 || legacyStandard.system.combat.hp.value!==28 || legacyStandard.system.npc.hpMax!==30) throw new Error("Generated Soldier HP migration failed");
if(legacyStandard.system.options.lingeringWounds!==false) throw new Error("HP NPC migration did not disable lingering wounds");
console.log("Gahla Foundry boot + sheet context smoke: PASS");
