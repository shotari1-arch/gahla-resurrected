import {talentRank} from './canon-names.mjs';
import {modified} from './effects-engine.mjs';
import {RUNE_TYPES} from './content.mjs';
export function bodyRuneCost(actor){return Array.from(actor?.items??[]).filter(i=>i.type==='rune'&&i.system.bodyRune).reduce((n,i)=>n+Number(i.system.bodyRuneCost||RUNE_TYPES.find(r=>r.name===i.name)?.cost||0),0);}
export function runecraftTarget(actor,craft=false){const s=actor.system.stats;return Math.ceil((Number(s.wia)+Number(s.zr)+Number(s.um)+Number(s.sf))/4)+10*talentRank(actor,'Runotwórstwo')+(craft?10:0);}
export function runeMasterBonus(actor){return talentRank(actor,'Mistrz Run')>=3?bodyRuneCost(actor)*5:0;}
export function bodyRuneLimit(actor){return Math.ceil((Number(actor.system.stats.zyw)+bodyRuneCost(actor))/3);}
export function spellCriticalFailureStart(actor,stat){return actor.system.archetype==='polmag'&&stat==='um'?96-bodyRuneCost(actor):96;}
export function reloadCost(actor,weapon,shots=1){const base=Number(weapon.system.reload||0);if(base<=0)throw Error('Ta broń nie wymaga przeładowania.');const max=talentRank(actor,'Wielostrzał')>=4?3:talentRank(actor,'Wielostrzał')>=3?2:1;if(!Number.isInteger(shots)||shots<1||shots>max)throw Error('Nielegalna liczba strzał.');return modified(actor,Math.ceil(base*(1+(shots-1)/2))-talentRank(actor,'Szybkie Przeładowanie'),'delay',{kind:'reload'},1);}
export function aimBonus(actor,segments=0){if(!Number.isInteger(segments)||segments<0||segments>4)throw Error('Przycelowanie: 0–4 segmenty.');if(segments&&!talentRank(actor,'Przycelowanie'))throw Error('Wymagany talent Przycelowanie.');const eagle=talentRank(actor,'Sokole Oko')>=3;return {hit:segments*(eagle?15:5),dice:Math.floor(segments/2)+(eagle&&segments>=2?1:0),segments};}
export function controlledSequence(actor,{index=0,length=0,ignoreCalled=false,finisher=''}={}){
 const rank=talentRank(actor,'Kontrolowana Sekwencja');if(!index)return {};
 if(!Number.isInteger(index)||index<1||index>4||length<index||length>4)throw Error('Sekwencja: wybierz numer i długość 1–4.');
 if(ignoreCalled&&(rank<3||index===1))throw Error('Kontrolowana Sekwencja T3 nie działa na pierwszy manewr.');
 if(finisher&&(rank<4||index!==4||length!==4||!['armor','wound'].includes(finisher)))throw Error('Efekt T4 wymaga czwartego, ostatniego manewru pełnej Sekwencji.');
 return {ignoreCalled,ignoreArmor:finisher==='armor',extraWound:finisher==='wound'?1:0};
}
export function sequenceNext(actor,sequence){
 const old=actor.flags?.['gahla-resurrected']?.sequence;
 if(!sequence)return null;
 controlledSequence(actor,sequence);
 const {index,length,ignoreCalled}=sequence;
 if(index>1&&(!old||old.index!==index-1||old.length!==length))throw Error('Rozpocznij Sekwencję od manewru 1 i wykonuj kolejne manewry po kolei.');
 if(index>1&&ignoreCalled&&old.ignoreUsed)throw Error('Pominięcie kary celowania zostało już użyte w tej Sekwencji.');
 return {index,length,ignoreUsed:Boolean(ignoreCalled||(index>1&&old.ignoreUsed)),complete:index===length};
}
