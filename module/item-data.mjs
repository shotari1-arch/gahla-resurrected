import { maneuverOverlayFromSystem } from "./maneuver-rules.mjs";

export const ITEM_ARRAY_FIELDS = ["traits", "runes", "aspects", "risks", "maneuvers", "effects", "enchantments"];
export const ITEM_DATA_VERSION = 2;

export function parseItemList(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.flatMap(v => typeof v === "string" ? v.split(/[\n,]+/) : [v])
      .map(v => String(v ?? "").trim()).filter(Boolean))];
  }
  if (value === null || value === undefined || value === "") return [];
  if (typeof value === "string") return [...new Set(value.split(/[\n,]+/).map(v => v.trim()).filter(Boolean))];
  return [String(value).trim()].filter(Boolean);
}

function plainClone(value) {
  if (value === null || value === undefined) return {};
  if (typeof value?.toObject === "function") return value.toObject();
  try { return structuredClone(value); } catch (_err) { return {...value}; }
}

function numberOr(value, fallback=0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function spellStoredDelay(system={}) {
  const direct = numberOr(system.delay, 0);
  if (direct > 0) return direct;
  try {
    const builder = JSON.parse(system.builderState || "{}");
    const built = numberOr(builder?.calculated?.op, 0);
    if (built > 0) return built;
  } catch (_err) {}
  const cost = Math.max(0, numberOr(system.spellCost ?? system.aspectCost, 0));
  const minimum = Math.max(4, numberOr(system.minDelay, 4));
  return Math.max(minimum, cost + 1 + (system.fromBook ? 1 : 0));
}

export function normalizeItemSystem(type, rawSystem={}) {
  const system = plainClone(rawSystem);
  for (const field of ITEM_ARRAY_FIELDS) {
    if (field in system) system[field] = parseItemList(system[field]);
  }

  if (type === "armor" && "locations" in system) {
    const locations = system.locations && typeof system.locations === "object" && !Array.isArray(system.locations) ? system.locations : {};
    system.locations = {
      head:numberOr(locations.head), leftArm:numberOr(locations.leftArm), rightArm:numberOr(locations.rightArm),
      body:numberOr(locations.body), leftLeg:numberOr(locations.leftLeg), rightLeg:numberOr(locations.rightLeg)
    };
  }

  if (type === "spell") {
    system.delay = spellStoredDelay(system);
    system.spellCost = Math.max(0, numberOr(system.spellCost ?? system.aspectCost));
    system.aspectCost = Math.max(0, numberOr(system.aspectCost ?? system.spellCost));
    system.minDelay = Math.max(4, numberOr(system.minDelay, 4));
  }

  if (type === "maneuver") {
    const overlay = maneuverOverlayFromSystem(system);
    system.maneuverOverlayVersion = 2;
    system.maneuverDamageDiceDelta = numberOr(overlay.damageDiceDelta);
    system.maneuverDelayDelta = numberOr(overlay.delayDelta);
    system.maneuverHitMod = numberOr(overlay.hitMod);
    system.maneuverPenetrationBonus = numberOr(overlay.penetrationBonus);
    system.maneuverHalfWeaponDice = Boolean(overlay.halfWeaponDice);
    system.maneuverExtraTargets = numberOr(overlay.extraTargets);
  }

  return system;
}

/** Normalize expanded DocumentSheetV2 form data before the document is validated. */
export function normalizeItemSubmitData(type, submitData={}, currentSystem={}) {
  const data = plainClone(submitData);
  const submitted = data.system ?? {};
  for (const field of ITEM_ARRAY_FIELDS) {
    if (field in submitted) submitted[field] = parseItemList(submitted[field]);
  }
  if (type === "armor" && "locations" in submitted) {
    const loc = submitted.locations ?? {};
    submitted.locations = {
      head:numberOr(loc.head), leftArm:numberOr(loc.leftArm), rightArm:numberOr(loc.rightArm),
      body:numberOr(loc.body), leftLeg:numberOr(loc.leftLeg), rightLeg:numberOr(loc.rightLeg)
    };
  }
  if (type === "spell") {
    const combined = normalizeItemSystem(type, {...plainClone(currentSystem), ...plainClone(submitted)});
    submitted.delay = combined.delay;
    submitted.spellCost = combined.spellCost;
    submitted.aspectCost = combined.aspectCost;
    submitted.minDelay = combined.minDelay;
  }
  data.system = submitted;
  return data;
}

/** Return only persisted updates that repair legacy Item data. */
export function itemMigrationPatch(item) {
  const type = item?.type;
  const source = item?._source?.system ?? item?.system ?? {};
  const patch = {};

  for (const field of ITEM_ARRAY_FIELDS) {
    const current = source?.[field];
    if (current !== undefined && !Array.isArray(current)) patch[`system.${field}`] = parseItemList(current);
  }

  if (type === "spell") {
    const currentDelay = numberOr(source?.delay, 0);
    const desiredDelay = spellStoredDelay(source);
    if (desiredDelay > 0 && currentDelay !== desiredDelay) patch["system.delay"] = desiredDelay;
  }

  if (type === "weapon" && !String(source?.woundProfile || "").trim()) {
    patch["system.woundProfile"] = "auto";
  }

  if (type === "maneuver" && Number(source?.maneuverOverlayVersion || 0) < 2) {
    const overlay = maneuverOverlayFromSystem(source);
    patch["system.maneuverOverlayVersion"] = 2;
    patch["system.maneuverDamageDiceDelta"] = numberOr(overlay.damageDiceDelta);
    patch["system.maneuverDelayDelta"] = numberOr(overlay.delayDelta);
    patch["system.maneuverHitMod"] = numberOr(overlay.hitMod);
    patch["system.maneuverPenetrationBonus"] = numberOr(overlay.penetrationBonus);
    patch["system.maneuverHalfWeaponDice"] = Boolean(overlay.halfWeaponDice);
    patch["system.maneuverExtraTargets"] = numberOr(overlay.extraTargets);
  }

  return patch;
}

export async function migrateExistingItems() {
  if (!game.user?.isGM) return {updated:0, skipped:true};
  let current = 0;
  try { current = Number(game.settings.get("gahla-resurrected", "itemDataVersion") || 0); } catch (_err) {}
  if (current >= ITEM_DATA_VERSION) return {updated:0, skipped:true};

  const items = [
    ...Array.from(game.items ?? []),
    ...Array.from(game.actors ?? []).flatMap(actor => Array.from(actor.items?.contents ?? actor.items ?? []))
  ];
  let updated = 0;
  for (const item of items) {
    const patch = itemMigrationPatch(item);
    if (!Object.keys(patch).length || typeof item.update !== "function") continue;
    try { await item.update(patch, {gahlaMigration:true}); updated++; }
    catch (err) { console.warn(`[Gahla] Nie udało się zmigrować Itemu ${item.name ?? item.id}`, err); }
  }
  try { await game.settings.set("gahla-resurrected", "itemDataVersion", ITEM_DATA_VERSION); } catch (_err) {}
  console.info(`[Gahla] migracja danych Itemów v${ITEM_DATA_VERSION}: ${updated} zaktualizowanych.`);
  return {updated, skipped:false};
}
