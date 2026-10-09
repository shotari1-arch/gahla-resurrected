import {tierFromLevel} from './rules.mjs';
import {requireOwner,serial} from './automation-runtime.mjs';
import {levelProgressionPatch} from './development-ledger.mjs';
export function levelBenefits(level){return {zyw:level-1,bgl:10*(level-1),defense:10*(level-1),speed:[3,6,11].filter(n=>level>=n).length};}
export function levelView(actor){const level=Number(actor.system.level),next=Math.min(11,level+1),a=levelBenefits(level),b=levelBenefits(next),canEdit=Boolean(globalThis.game?.user?.isGM||actor.isOwner);return {level,tier:tierFromLevel(level),next,canEdit,canLower:canEdit&&level>1,canRaise:canEdit&&level<11,hasNext:level<11,milestone:[3,6,11].includes(next)&&level<11,zyw:b.zyw-a.zyw,bgl:b.bgl-a.bgl,defense:b.defense-a.defense,speed:b.speed-a.speed};}
export async function changeLevel(actor,delta,{confirm=async()=>false,announce=async()=>{}}={}){
 requireOwner(actor);if(actor.type!=='character'||![-1,1].includes(Number(delta)))throw Error('Niepoprawna zmiana poziomu.');
 return serial(actor.uuid,async()=>{const old=Number(actor.system.level),next=old+Number(delta);if(next<1||next>11)throw Error('Poziom musi należeć do zakresu 1–11.');
  if(delta<0&&!await confirm({old,next,tierDrop:tierFromLevel(next)<tierFromLevel(old)}))return false;
  await actor.update({'system.level':next,...levelProgressionPatch(actor,next)});
  if(delta>0&&[3,6,11].includes(next))await announce(next);return true;
 });
}
