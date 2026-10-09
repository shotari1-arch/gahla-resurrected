// reservedSZ is the spent lower boundary, never initiative.
export function effectiveSegments(s={}){return Math.max(0,Number(s.currentSegments||0)-Number(s.reservedSZ||0));}
export function isBossCombatant(c){return Boolean(c?.actor?.system?.combat?.trackerBoss||['boss','bossPart'].includes(c?.actor?.type));}
export function bossPauseKey(c){return c.actor.flags?.['gahla-resurrected']?.bossPauseId??`legacy:${c.actor.uuid??c.actor.id}`;}
export function bossPauseActive(c,combatants){
 if(!isBossCombatant(c)||!c.actor.system.combat.justActed)return false;
 const id=bossPauseKey(c);
 return !Array.from(combatants?.contents??combatants??[]).some(other=>!isBossCombatant(other)&&other.actor?.flags?.['gahla-resurrected']?.releasedBossPauses?.includes(id));
}
/** Shared by the native combat and its existing Gahla panel. Never consumes a pause by viewing it. */
export function nextGahlaCombatant(combatants){
 const active=Array.from(combatants?.contents??combatants??[]).filter(c=>{
  const s=c.actor?.system?.combat;
  return s&&!c.defeated&&!s.done&&(s.longReady||(!s.longDebt&&effectiveSegments(s)>0));
 }).sort((a,b)=>Number(b.initiative??b.actor.system.combat.currentSegments)-Number(a.initiative??a.actor.system.combat.currentSegments)||Number(b.actor.system.stats?.zr||0)-Number(a.actor.system.stats?.zr||0)||String(a.name||a.actor.name||'').localeCompare(String(b.name||b.actor.name||''),'pl'));
 const first=active[0];
 if(first&&bossPauseActive(first,combatants))return active.find(c=>!isBossCombatant(c))??active.find(c=>!bossPauseActive(c,combatants))??first;
 return first;
}
export function trackerReactionMax(s={},fallback=1){return s.trackerBoss?3:Math.max(0,Number(s.reactionMax??fallback)||0);}
export function normalizeTrackerState(s={},d={}){
 const current=Math.max(0,Number(s.currentSegments??d.currentSegments??0)),max=trackerReactionMax(s,d.reactionMax??1);
 return {...s,currentSegments:current,reservedSZ:Math.min(current,Math.max(0,Number(s.reservedSZ)||0)),reactionMax:max,reactionLeft:Math.min(max,Math.max(0,Number(s.reactionLeft??max))),reactionUsed:!!s.reactionUsed,reactionPenalty:0,normalDebt:0,longDebt:Math.max(0,Number(s.longDebt)||0),longReady:!!s.longReady,transferSegments:Math.max(0,Number(s.transferSegments)||0),trackerBoss:!!s.trackerBoss,justActed:!!s.justActed,done:!!s.done};
}
export function startTrackerRound(state={},baseSZ=0){
 const s=normalizeTrackerState(state),base=Math.max(0,Number(baseSZ)||0),pay=Math.min(base,s.longDebt),ongoing=s.longDebt>0;
 return {...s,currentSegments:base-pay,reservedSZ:0,longDebt:s.longDebt-pay,longReady:ongoing&&s.longDebt===pay,reactionLeft:ongoing?0:s.reactionMax,reactionUsed:ongoing,justActed:false,done:false};
}
export function applyTrackerReaction(state={},cost=0){
 const s=normalizeTrackerState(state),n=Number(cost),fail=error=>({ok:false,error,state:s});
 if(!Number.isInteger(n)||n<1)return fail('Niepoprawny koszt reakcji.');
 if(s.longDebt>0||s.longReady||s.done)return fail('W trakcie akcji długiej lub po zakończeniu rundy nie można reagować.');
 if(s.reactionLeft<=0)return fail('Brak reakcji w tej rundzie.');
 if(n>effectiveSegments(s))return fail('Brak dostępnych segmentów.');
 return {ok:true,cost:n,state:{...s,reservedSZ:s.reservedSZ+n,reactionLeft:s.reactionLeft-1,reactionUsed:true}};
}
export function applyTrackerAction(state={},cost=0,mode='n'){
 const s=normalizeTrackerState(state),n=Number(cost),available=effectiveSegments(s),fail=error=>({ok:false,error,state:s});
 if(s.longDebt>0||s.longReady||s.done)return fail('Akcja długa trwa lub postać zakończyła działania w tej rundzie.');
 if(mode==='c'){
  if(s.reactionLeft<1||available<=0)return fail('Przeniesienie wymaga niewykorzystanej Reakcji i pozostałych segmentów.');
  return {ok:true,mode,cost:available,state:{...s,currentSegments:s.reservedSZ,transferSegments:available,reactionLeft:s.reactionLeft-1,reactionUsed:true,done:true}};
 }
 if(!Number.isInteger(n)||n<1)return fail('Niepoprawny koszt akcji.');
 if(mode==='n'){
  const actual=s.transferSegments>0?Math.max(2,n-s.transferSegments):n;
  if(actual>available)return fail('Brak segmentów. Zakończ rundę Przeniesieniem Akcji lub wybierz jawną Akcję Długą.');
  return {ok:true,mode,cost:actual,state:{...s,currentSegments:s.currentSegments-actual,transferSegments:0}};
 }
 if(mode==='l'){
  const pay=Math.min(n,available);
  return {ok:true,mode,cost:pay,completedLong:false,state:{...s,currentSegments:s.currentSegments-pay,longDebt:n-pay,longReady:n===pay,transferSegments:0,reactionLeft:0,reactionUsed:true}};
 }
 return fail('Nieznany tryb akcji.');
}
export function cancelTrackerLong(state={}){
 const s=normalizeTrackerState(state);
 if(!s.longDebt&&!s.longReady)return {ok:false,error:'Nie trwa akcja długa.',state:s};
 return {ok:true,state:{...s,longDebt:0,longReady:false,done:true}};
}
