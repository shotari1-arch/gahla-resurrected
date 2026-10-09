const SYSTEM_ID = "gahla-resurrected";
const DATA_URL = `systems/${SYSTEM_ID}/data/lingering-wounds.json`;

export const WOUND_PROFILE_OPTIONS = [
  {key:"auto", label:"Automatycznie wg broni"},
  {key:"slashing", label:"Sieczna"},
  {key:"piercing", label:"Kłuta"},
  {key:"blunt", label:"Obuchowa"},
  {key:"projectile", label:"Strzała / bełt"},
  {key:"firearm", label:"Broń palna"},
  {key:"none", label:"Brak tabeli — tylko wynik LW"}
];

export const WOUND_PROFILE_LABELS = Object.fromEntries(WOUND_PROFILE_OPTIONS.map(x => [x.key, x.label]));
export const LOCATION_GROUPS = {
  head:"head", body:"body", leftArm:"arm", rightArm:"arm", leftLeg:"leg", rightLeg:"leg",
  arm:"arm", leg:"leg"
};
export const ELEMENT_KEYS = new Set(["fire","ice","lightning","earth","water","wind","light","shadow"]);
const ELEMENT_ALIASES = {
  "ogień":"fire",ogien:"fire",fire:"fire",
  "lód":"ice",lod:"ice",ice:"ice",
  "elektryczność":"lightning",elektrycznosc:"lightning",lightning:"lightning",
  ziemia:"earth",earth:"earth",woda:"water",water:"water",wiatr:"wind",wind:"wind",
  "światło":"light",swiatlo:"light",light:"light","cień":"shadow",cien:"shadow",shadow:"shadow"
};

let cachedTables = null;

export async function loadLingeringWounds({fetcher=globalThis.fetch}={}) {
  if (cachedTables) return cachedTables;
  if (typeof fetcher !== "function") throw new Error("Gahla: brak fetch() do odczytu tabel Trwałych Ran.");
  const response = await fetcher(DATA_URL);
  if (!response?.ok) throw new Error(`Gahla: nie udało się wczytać tabel Trwałych Ran (${response?.status ?? "brak statusu"}).`);
  cachedTables = await response.json();
  return cachedTables;
}

export function clearLingeringWoundCache(){ cachedTables = null; }

export function scoreRangeContains(range, score){
  const text = String(range ?? "").trim().replace(/\s+/g, " ");
  const value = Math.max(0, Number(score || 0));
  const plus = text.match(/^(\d+)\+$/);
  if (plus) return value >= Number(plus[1]);
  const pair = text.match(/^(\d+)\s*[–-]\s*(\d+)$/);
  if (!pair) return false;
  return value >= Number(pair[1]) && value <= Number(pair[2]);
}

export function inferWoundProfile(weapon){
  const explicit = String(weapon?.system?.woundProfile || "auto").trim().toLowerCase();
  if (explicit && explicit !== "auto") return explicit;
  const name = String(weapon?.name || "").toLowerCase();
  const traits = Array.isArray(weapon?.system?.traits) ? weapon.system.traits.map(x => String(x).toLowerCase()).join(" ") : "";
  const haystack = `${name} ${traits}`;
  if (/pistolet|muszkiet|arkebuz|rewolwer|karabin|broń palna|firearm/.test(haystack)) return "firearm";
  if (weapon?.system?.isRanged || Number(weapon?.system?.reload || 0) > 0 || /łuk|kusz|strzał|bełt/.test(haystack)) return "projectile";
  if (/włócz|sztylet|lewak|rapier|pik|oszczep|kolec|kłut/.test(haystack)) return "piercing";
  if (/pazur/.test(haystack)) return "blunt";
  if (/halabard/.test(haystack)) return "piercing";
  if (/maczug|buzdygan|młot|obuch|pałk|tarcza|bez broni|pięść|kopni/.test(haystack)) return "blunt";
  if (/miecz|topór|siekier|ostrze|szabl|katana|pazur|sierp|siecz/.test(haystack)) return "slashing";
  return "none";
}

export function lingeringLocationGroup(location){ return LOCATION_GROUPS[String(location || "")] || "body"; }
export function normalizeElementKey(element){
  const key=String(element||"").trim().toLowerCase();
  return ELEMENT_ALIASES[key] || key;
}

export function profileLabel(profile, tables=null){
  return tables?.profiles?.[profile]?.label || WOUND_PROFILE_LABELS[profile] || profile || "Brak profilu";
}

export async function resolveLingeringWound({score, profile="none", location="body", element="", tables=null}={}){
  const data = tables || await loadLingeringWounds();
  const numericScore = Math.max(1, Number(score || 1));
  const elementKey = normalizeElementKey(element);
  if (ELEMENT_KEYS.has(elementKey)) {
    const entries = data?.profiles?.element?.locations?.[lingeringLocationGroup(location)] ?? data?.elements?.tables?.[elementKey] ?? [];
    const entry = entries.find(row => scoreRangeContains(row.range, numericScore)) || entries.at?.(-1) || null;
    return entry ? { ...entry, effect:entry.effect+" "+(data.elements.flavour?.[elementKey]??""), profile:"element", profileLabel:data?.elements?.label || "Obrażenia żywiołowe", element:elementKey, location:lingeringLocationGroup(location), tableStatus:entry?.status||data?.elements?.status||"ACTIVE", tableNote:[data?.elements?.note,entry?.note].filter(Boolean).join(" "), tableSource:data?.elements?.source||"" } : null;
  }
  const key = String(profile || "none");
  if (key === "none") return null;
  const group = lingeringLocationGroup(location);
  const profileData=data?.profiles?.[key]||{};
  const entries = profileData?.locations?.[group] || [];
  const entry = entries.find(row => scoreRangeContains(row.range, numericScore)) || entries.at?.(-1) || null;
  return entry ? { ...entry, profile:key, profileLabel:profileLabel(key,data), element:"", location:group, tableStatus:entry?.status||profileData.status||"ACTIVE", tableNote:[profileData.note,entry?.note].filter(Boolean).join(" "), tableSource:profileData.source||"" } : null;
}
