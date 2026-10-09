import {registerZones119} from './module/talent-zones119.mjs';
import {registerAura119} from './module/talent-aura119.mjs';
import {migrate119,register119} from './module/migration119.mjs';
import {registerArt119} from './module/talent-choices119.mjs';
import {migrate118,register118} from './module/migration118.mjs';
import {migrateTalents117,registerTalents117} from './module/talent-migration117.mjs';
import {migrateCanon115,registerCanon115} from './module/canon-migration.mjs';
import { registerDevelopmentHooks, migrateDevelopment } from './module/development-ledger.mjs';
import { registerDefenseHooks, clearStaleDefenseRequests } from './module/defense-declarations.mjs';
import { registerCanonicalHooks, migrateCanonical } from './module/canonical-runtime.mjs';
import { registerAutomationHooks, migrateAutomation } from "./module/automation-runtime.mjs";
import { registerSessionTools } from "./module/session-tools.mjs";
import { GahlaActor, GahlaItem } from "./module/documents.mjs";
import { GahlaActorData, GahlaItemData } from "./module/data-models.mjs";
import { GahlaActorSheet, GahlaItemSheet, registerStatusEffects, registerChatActions, registerHotbarActions, executeGahlaActorAction } from "./module/sheets.mjs";
import { GahlaCombat, registerCombatIntegration } from "./module/combat.mjs";
import { GahlaSetupApp, registerSettings } from "./module/setup.mjs";
import { GahlaCharacterCreator } from "./module/creator.mjs";
import { RULES, ARCHETYPES, RACES, LIFE_PATHS, ALL_TALENTS, WEAPONS, ARMORS, SHIELDS, CONDITIONS, ELEMENTS } from "./module/rules.mjs";
import { RUNE_TYPES, METALS, FAILURE_TABLES } from "./module/content.mjs";
import { migrateExistingItems } from "./module/item-data.mjs";

const SYSTEM_ID = "gahla-resurrected";
const VERSION = "0.11.9-beta";
const ACTOR_TYPES = ["character", "minion", "standard", "elite", "boss", "bossPart"];
const ITEM_TYPES = ["weapon", "armor", "talent", "spell", "maneuver", "rune", "powerSource", "equipment"];

console.info(`[Gahla Resurrected] module loaded (${VERSION})`);

function registerHandlebarsHelpers() {
  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("or", (a, b) => Boolean(a || b));
  Handlebars.registerHelper("and", (a, b) => Boolean(a && b));
  Handlebars.registerHelper("json", obj => JSON.stringify(obj));
  Handlebars.registerHelper("join", (value, separator = ", ") => Array.isArray(value) ? value.join(separator) : String(value ?? ""));
  Handlebars.registerHelper("array", (...args) => args.slice(0, -1));
  Handlebars.registerHelper("multiply", (a, b) => Number(a || 0) * Number(b || 0));
}


function registerActorDirectoryCreatorButton() {
  const ActorDirectory = foundry.applications.sidebar?.tabs?.ActorDirectory;
  if (!ActorDirectory) return;
  Hooks.on("renderApplicationV2", (application, element, context) => {
    if (!(application instanceof ActorDirectory)) return;
    if (context?.canCreateEntry === false) return;
    const root = element?.querySelector ? element : application.element;
    if (!root?.querySelector || root.querySelector("[data-gahla-character-creator]")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "gahla-directory-creator";
    button.dataset.gahlaCharacterCreator = "true";
    button.innerHTML = '<i class="fas fa-user-plus"></i><span>Kreator postaci</span>';
    button.title = "Utwórz postać Gahla przez kreator";
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      new GahlaCharacterCreator().render({force:true});
    });

    const encounterButton = document.createElement("button");
    encounterButton.type = "button";
    encounterButton.className = "gahla-directory-creator";
    encounterButton.dataset.gahlaEncounterBuilder = "true";
    encounterButton.innerHTML = '<i class="fas fa-dragon"></i><span>Generator Starć</span>';
    encounterButton.title = "Zbuduj starcie i utwórz gotowych przeciwników";
    encounterButton.addEventListener("click", async event => {
      event.preventDefault();
      event.stopPropagation();
      if (!game.user?.isGM) return ui.notifications.warn("Gahla: Generator Starć jest narzędziem MG.");
      const { GahlaEncounterBuilder } = await import("./module/encounter-builder.mjs");
      new GahlaEncounterBuilder().render({force:true});
    });

    const createEntry = root.querySelector('[data-action="createEntry"]');
    if (createEntry) {
      if(game.user?.isGM) createEntry.insertAdjacentElement("afterend", encounterButton);
      createEntry.insertAdjacentElement("afterend", button);
      return;
    }
    const footer = root.querySelector(".directory-footer, footer, [data-application-part='footer']");
    if (footer) { footer.append(button); if(game.user?.isGM) footer.append(encounterButton); }
  });
}

function registerDocumentSheets() {
  const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;

  // Remove generic core fallbacks for Gahla sub-types when present. Official V14 systems
  // commonly do this before registering their own default sheets. Both candidates are guarded
  // because V14 installations may expose the legacy appv1 fallback in addition to ActorSheetV2.
  const coreActorSheets = [foundry.applications.sheets?.ActorSheetV2, foundry.appv1?.sheets?.ActorSheet].filter(Boolean);
  const coreItemSheets = [foundry.applications.sheets?.ItemSheetV2, foundry.appv1?.sheets?.ItemSheet].filter(Boolean);
  for (const cls of coreActorSheets) {
    try { DocumentSheetConfig.unregisterSheet(foundry.documents.Actor, "core", cls, {types: ACTOR_TYPES}); } catch (err) { console.debug("[Gahla] core Actor sheet not registered", err); }
  }
  for (const cls of coreItemSheets) {
    try { DocumentSheetConfig.unregisterSheet(foundry.documents.Item, "core", cls, {types: ITEM_TYPES}); } catch (err) { console.debug("[Gahla] core Item sheet not registered", err); }
  }

  // Follow the V14 API literally: register against the core Actor/Item document classes.
  // CONFIG.Actor.documentClass may be our subclass, but sheet registration is keyed by the
  // document type itself, not by the system subclass constructor.
  DocumentSheetConfig.registerSheet(foundry.documents.Actor, game.system.id, GahlaActorSheet, {
    types: ACTOR_TYPES,
    makeDefault: true,
    canBeDefault: true,
    canConfigure: true,
    label: "Gahla Resurrected"
  });
  DocumentSheetConfig.registerSheet(foundry.documents.Item, game.system.id, GahlaItemSheet, {
    types: ITEM_TYPES,
    makeDefault: true,
    canBeDefault: true,
    canConfigure: true,
    label: "Gahla Resurrected"
  });
}

function getSheetDiagnostics() {
  const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
  const actor = {};
  const item = {};
  for (const type of ACTOR_TYPES) actor[type] = DocumentSheetConfig.getSheetClassesForSubType("Actor", type);
  for (const type of ITEM_TYPES) item[type] = DocumentSheetConfig.getSheetClassesForSubType("Item", type);
  const pinnedActors = Array.from(game.actors ?? []).filter(a => String(a.getFlag?.("core", "sheetClass") ?? "").startsWith("core.")).map(a => ({id:a.id,name:a.name,sheetClass:a.getFlag?.("core", "sheetClass")}));
  const pinnedItems = Array.from(game.items ?? []).filter(i => String(i.getFlag?.("core", "sheetClass") ?? "").startsWith("core.")).map(i => ({id:i.id,name:i.name,sheetClass:i.getFlag?.("core", "sheetClass")}));
  return {
    version: VERSION,
    systemId: game.system?.id,
    actorDocumentClass: CONFIG.Actor.documentClass?.name,
    itemDocumentClass: CONFIG.Item.documentClass?.name,
    actor,
    item,
    coreSheetClasses: game.settings?.get?.("core", "sheetClasses") ?? {},
    pinnedActors,
    pinnedItems
  };
}

async function migrateGeneratedNpcHealth() {
  if (!game.user?.isGM) return {updated:0};
  let updated = 0;
  for (const actor of Array.from(game.actors ?? [])) {
    if (!["minion", "standard"].includes(actor?.type)) continue;
    if (!actor.system?.npc?.generated) continue;
    const factor = actor.type === "minion" ? 5 : 10;
    const vitality = Math.max(1, Number(actor.system?.stats?.zyw || 1));
    const nextMax = Math.max(1, Math.round(vitality * factor));
    const oldMax = Math.max(1, Number(actor.system?.combat?.hp?.max || actor.system?.npc?.hpMax || 1));
    const rawValue = Number(actor.system?.combat?.hp?.value);
    const oldValue = Math.max(0, Number.isFinite(rawValue) ? rawValue : oldMax);
    const damageTaken = Math.max(0, oldMax - oldValue);
    const nextValue = Math.max(0, nextMax - damageTaken);
    const alreadyMigrated = oldMax === nextMax
      && Number(actor.system?.npc?.hpMax || 0) === nextMax
      && actor.system?.options?.lingeringWounds === false;
    if (alreadyMigrated) continue;
    await actor.update({
      "system.npc.hpMax": nextMax,
      "system.combat.hp.max": nextMax,
      "system.combat.hp.value": nextValue,
      "system.options.lingeringWounds": false,
      "system.combat.deadly": nextValue <= 0
    });
    updated++;
  }
  if (updated) console.info(`[Gahla Resurrected] migracja HP Płotek/Żołnierzy: ${updated} Actor(ów)`);
  return {updated};
}

async function migrateGeneratedBossProtection() {
  if (!game.user?.isGM) return {updated:0};
  let updated = 0;
  for (const actor of Array.from(game.actors ?? [])) {
    if (actor?.type !== "boss" || !actor.system?.npc?.generated) continue;
    const cap = Number(actor.system?.npc?.singleHitWoundCap || 0);
    const combatLevel = Math.max(1, Math.min(11, Number(actor.system?.npc?.combatLevel || actor.system?.level || 1)));
    if (cap === 3 && Number(actor.system?.npc?.combatLevel || 0) === combatLevel) continue;
    await actor.update({
      "system.npc.singleHitWoundCap": 3,
      "system.npc.combatLevel": combatLevel
    });
    updated++;
  }
  if (updated) console.info(`[Gahla Resurrected] migracja ochrony Bossów: ${updated} Actor(ów)`);
  return {updated};
}


async function migrateTalentBalanceData() {
  if (!game.user?.isGM) return {updated:0,granted:0};
  const defs=new Map(ALL_TALENTS.map(t=>[t.name,t]));
  const items=[
    ...Array.from(game.items ?? []),
    ...Array.from(game.actors ?? []).flatMap(actor=>Array.from(actor.items?.contents ?? actor.items ?? []))
  ];
  let updated=0,granted=0;
  for(const item of items){
    if(item?.type!=="talent" || typeof item.update!=="function") continue;
    const def=defs.get(item.name); if(!def) continue;
    const patch={};
    if(String(item.system?.description||"")!==String(def.description||"")) patch["system.description"]=String(def.description||"");
    if(String(item.system?.requirements||"")!==String(def.requirements||"")) patch["system.requirements"]=String(def.requirements||"");
    if(Number(item.system?.maxLevel||4)!==Number(def.maxLevel||4)) patch["system.maxLevel"]=Number(def.maxLevel||4);
    if(Object.keys(patch).length){ try{await item.update(patch,{gahlaTalentBalanceMigration:true});updated++;}catch(err){console.warn(`[Gahla] nie udało się zsynchronizować talentu ${item.name}`,err);} }
  }
  const meleeDef=defs.get("Walka Wręcz");
  for(const actor of Array.from(game.actors ?? [])){
    if(actor?.type!=="character" || typeof actor.createEmbeddedDocuments!=="function") continue;
    const actorItems=Array.from(actor.items?.contents ?? actor.items ?? []);
    const monk=actorItems.find(i=>i.type==="talent"&&i.name==="Szkolenie Mnicha"&&i.system?.learned);
    const melee=actorItems.find(i=>i.type==="talent"&&i.name==="Walka Wręcz"&&i.system?.learned);
    if(monk&&!melee&&meleeDef){
      await actor.createEmbeddedDocuments("Item",[{name:"Walka Wręcz",type:"talent",system:{category:"archetype",description:meleeDef.description,requirements:"Darmowo z talentu Szkolenie Mnicha",tier:1,level:1,maxLevel:Number(meleeDef.maxLevel||4),costXP:0,learned:true,deity:""}}]);
      granted++;
    }
  }
  if(updated||granted) console.info(`[Gahla Resurrected] migracja balansu talentów: ${updated} zsynchronizowanych, ${granted} darmowych Walka Wręcz.`);
  return {updated,granted};
}

async function repairPinnedCoreSheets() {
  if (!game.user?.isGM) return {actors:0, items:0};
  let actors = 0;
  let items = 0;
  for (const actor of Array.from(game.actors ?? [])) {
    const flag = String(actor.getFlag?.("core", "sheetClass") ?? "");
    if (flag.startsWith("core.") && actor.unsetFlag) { await actor.unsetFlag("core", "sheetClass"); actors++; }
  }
  for (const item of Array.from(game.items ?? [])) {
    const flag = String(item.getFlag?.("core", "sheetClass") ?? "");
    if (flag.startsWith("core.") && item.unsetFlag) { await item.unsetFlag("core", "sheetClass"); items++; }
  }
  if (actors || items) console.info(`[Gahla Resurrected] usunięto przypięcie do core sheet: Actor ${actors}, Item ${items}`);
  return {actors, items};
}

function preferGahlaOverCoreDefaults() {
  const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
  const current = foundry.utils.deepClone?.(game.settings?.get?.("core", "sheetClasses") ?? {}) ?? {};
  let changed = false;
  const actorDefaults = current.Actor ??= {};
  const itemDefaults = current.Item ??= {};
  const gahlaActor = `${game.system.id}.GahlaActorSheet`;
  const gahlaItem = `${game.system.id}.GahlaItemSheet`;
  for (const type of ACTOR_TYPES) {
    const info = DocumentSheetConfig.getSheetClassesForSubType("Actor", type);
    if (!info.defaultClass || String(info.defaultClass).startsWith("core.")) { actorDefaults[type] = gahlaActor; changed = true; }
  }
  for (const type of ITEM_TYPES) {
    const info = DocumentSheetConfig.getSheetClassesForSubType("Item", type);
    if (!info.defaultClass || String(info.defaultClass).startsWith("core.")) { itemDefaults[type] = gahlaItem; changed = true; }
  }
  if (changed) DocumentSheetConfig.updateDefaultSheets(current);
  return changed;
}

Hooks.once("init", () => {
  console.info(`[Gahla Resurrected] init start (${VERSION})`);

  // Register sheets first. A later optional integration must never be able to prevent
  // the Gahla character sheet from existing.
  registerDocumentSheets();
  console.info("[Gahla Resurrected] Gahla sheets registered");

  registerHandlebarsHelpers();
  registerActorDirectoryCreatorButton();

  CONFIG.Actor.documentClass = GahlaActor;
  CONFIG.Item.documentClass = GahlaItem;
  CONFIG.Combat.documentClass = GahlaCombat;
  CONFIG.Actor.dataModels = Object.fromEntries(ACTOR_TYPES.map(type => [type, GahlaActorData]));
  CONFIG.Item.dataModels = Object.fromEntries(ITEM_TYPES.map(type => [type, GahlaItemData]));

  registerStatusEffects();
  registerSettings();
  registerCombatIntegration();
  registerChatActions();
  registerDefenseHooks();
  registerDevelopmentHooks();
  registerHotbarActions();

  game.gahla = {
    rules: RULES,
    archetypes: ARCHETYPES,
    races: RACES,
    lifePaths: LIFE_PATHS,
    talents: ALL_TALENTS,
    weapons: WEAPONS,
    armors: ARMORS,
    shields: SHIELDS,
    conditions: CONDITIONS,
    elements: ELEMENTS,
    version: VERSION,
    runes: RUNE_TYPES,
    metals: METALS,
    failureTables: FAILURE_TABLES,
    repairSheets: async () => { const cleared = await repairPinnedCoreSheets(); preferGahlaOverCoreDefaults(); return {...cleared, diagnostics:getSheetDiagnostics()}; },
    openSetup: () => new GahlaSetupApp().render({force:true}),
    openCharacterCreator: (options = {}) => new GahlaCharacterCreator(options).render({force:true}),
    openTalentTree: async (actor = game.user?.character ?? null) => {
      const { GahlaTalentTree } = await import("./module/talent-tree.mjs");
      return new GahlaTalentTree({actor}).render({force:true});
    },
    openTracker: async () => {
      const { GahlaInitiativeTracker } = await import("./module/tracker.mjs");
      return new GahlaInitiativeTracker().render({force:true});
    },
    openEncounterBuilder: async () => {
      const { GahlaEncounterBuilder } = await import("./module/encounter-builder.mjs");
      return new GahlaEncounterBuilder().render({force:true});
    },
    executeAction: executeGahlaActorAction,
    openAbilityBuilder: async (options = {}) => {
      try{
        const { GahlaAbilityBuilder } = await import("./module/ability-builder.mjs");
        return await new GahlaAbilityBuilder(options).render({force:true});
      }catch(err){
        console.error("[Gahla] openAbilityBuilder failed",err);
        ui.notifications.error("Gahla: nie udało się otworzyć kreatora zdolności. Szczegóły są w konsoli F12.");
        return null;
      }
    },
    debugSheets: getSheetDiagnostics
  };

  registerSessionTools();
  registerAutomationHooks();
  registerCanonicalHooks();
  registerCanon115(); registerTalents117();register118();register119();registerArt119();registerAura119();registerZones119();

  // Character creation is wizard-first. The cancellable preCreateActor hook is synchronous,
  // so it can stop the blank character document and open our wizard on the next task.
  Hooks.on("preCreateActor", (actor, data, options = {}, userId) => {
    if (actor?.type !== "character") return;
    if (options.gahlaCreator || options.gahlaBypassWizard) return;
    if (actor?.pack || options.fromCompendium || options.keepId) return;
    if (userId && game.user?.id && userId !== game.user.id) return;
    let enabled = true;
    try { enabled = game.settings.get(SYSTEM_ID, "useCharacterCreator") !== false; } catch (_err) {}
    if (!enabled) return;
    const seedName = actor?.name && actor.name !== "New Actor" ? actor.name : "";
    const folderId = actor?.folder?.id ?? data?.folder ?? null;
    setTimeout(() => new GahlaCharacterCreator({seedName,folderId}).render({force:true}), 0);
    ui.notifications.info("Gahla: tworzenie postaci odbywa się przez Kreator postaci.");
    return false;
  });

  console.info(`[Gahla Resurrected] initialized (${VERSION})`);
});

Hooks.once("ready", async () => {
  await clearStaleDefenseRequests();
  await migrateDevelopment();
  try{await migrateAutomation();}catch(error){game.gahla.migrationError=error.message;console.error("[Gahla] migration 0.10.0",error);ui.notifications.error("Gahla: migracja automatyki nie została ukończona. Sprawdź konsolę; ponowne uruchomienie wznowi migrację.");}
  await repairPinnedCoreSheets();
  try { await migrateGeneratedNpcHealth(); } catch (err) { console.warn("[Gahla] migracja HP NPC nie powiodła się", err); }
  try { await migrateGeneratedBossProtection(); } catch (err) { console.warn("[Gahla] migracja ochrony Bossów nie powiodła się", err); }
  try { await migrateTalentBalanceData(); } catch (err) { console.warn("[Gahla] migracja balansu talentów nie powiodła się", err); }
  try { await migrateExistingItems(); } catch (err) { console.warn("[Gahla] migracja Itemów nie powiodła się", err); }
  try{await migrateCanonical();}catch(error){console.error("[Gahla] migration 0.11",error);ui.notifications.error("Migracja 0.11 nieukończona; ponowne uruchomienie wznowi pracę.");}
  try{await migrateCanon115();}catch(error){console.error('[Gahla] migracja 0.11.5',error);ui.notifications.error('Migracja 0.11.5 nieukończona. Uruchom świat ponownie, aby ją wznowić.');}
  try{await migrateTalents117();}catch(error){console.error('[Gahla] migracja talentów 0.11.7',error);ui.notifications.error('Migracja talentów 0.11.7 nieukończona. Uruchom świat ponownie, aby wznowić.');}
  try{await migrate118();}catch(error){console.error('[Gahla] migracja 0.11.8',error);ui.notifications.error('Migracja 0.11.8 nieukończona. Uruchom świat ponownie, aby ją wznowić.');}
  try{await migrate119();}catch(error){console.error("[Gahla] migration 0.11.9",error);ui.notifications.error("Migracja 0.11.9 nieukończona. Ponowne uruchomienie wznowi pracę.");}
  preferGahlaOverCoreDefaults();
  const diagnostics = getSheetDiagnostics();
  console.info("[Gahla Resurrected] sheet diagnostics", diagnostics);

  const characterDefault = diagnostics.actor.character?.defaultClass ?? "";
  if (!String(characterDefault).includes("GahlaActorSheet")) {
    console.warn("[Gahla Resurrected] GahlaActorSheet is registered but is not the current default for Actor.character.", diagnostics.actor.character);
  }

  console.info("[Gahla Resurrected] Gotowe. game.gahla.debugSheets() pokazuje diagnostykę arkuszy.");
});

