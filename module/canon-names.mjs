export const TALENT_ALIASES={
 'John Cena':'Krok Widma','Trzy Szybkie':'Wielostrzał','3 szybkie':'Wielostrzał','3 szybkie XD':'Wielostrzał','Czatownik':'Błyskawiczne Otwarcie','Czatownik(XD)':'Błyskawiczne Otwarcie','Doświadczone Wojaczkowe':'Doświadczony Wojak','Doświadczone Wojaczkowe / Doświadczenie Strzelca':'Doświadczony Wojak / Doświadczenie Strzelca','Mistrz Bloków':'Garda Weterana','Unik Specjalny':'Akrobatyczny Unik'
};
export function canonicalTalentName(name){const entry=Object.entries(TALENT_ALIASES).find(([old])=>old.toLocaleLowerCase('pl')===String(name).trim().toLocaleLowerCase('pl'));return entry?.[1]??name;}
export function normalizeCanonText(text){let out=String(text??'').replaceAll('Łotr','Łowca').replaceAll('łotr','łowca');for(const [old,name]of Object.entries(TALENT_ALIASES).sort((a,b)=>b[0].length-a[0].length))out=out.replaceAll(old,name);return out;}
export function talentRank(actor,name){return Math.max(0,...Array.from(actor?.items??[]).filter(i=>i.type==='talent'&&i.system.learned&&canonicalTalentName(i.name)===name).map(i=>Number(i.system.level)||1));}
