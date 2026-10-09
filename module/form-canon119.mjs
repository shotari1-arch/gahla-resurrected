const list=a=>Array.from(a?.items?.contents??a?.items??[]);
export const formRank119=(a,name)=>Number(list(a).find(i=>i.type==='talent'&&i.system?.learned&&i.name===name)?.system.level||0);
export const fullForm119=a=>a?.system?.phase==='beast'&&formRank119(a,'Zmiennokształtny')>0&&!formRank119(a,'Bestialska Hybryda');
export const partialForm119=a=>a?.system?.phase==='beast'&&formRank119(a,'Bestialska Hybryda')>0&&!formRank119(a,'Zmiennokształtny');
export function formEffectActive119(a,e){if(e.name==='Bestialska Hybryda')return false;if(e.requiresFullForm||e.name==='Zmiennokształtny')return fullForm119(a)&&formRank119(a,'Zmiennokształtny')>=4;return !e.requiresPhase||a.system.phase===e.requiresPhase;}
export const formResistance119=(a,stat,condition)=>fullForm119(a)&&formRank119(a,'Zmiennokształtny')>=2&&stat==='physicalResistance'&&['prone','pushed'].includes(condition);
