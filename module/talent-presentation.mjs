import {currentRank,effectTier} from './talent-ranks.mjs';
import {activeRule,resourceState,TALENT_RULES} from './effects-engine.mjs';
const calculated=new Set(['Żywotny','Potencjał Magiczny','Potencjał Duchowy','Wnikliwość','Większa Muskulatura','Gibkość','Uczony','Większa Ogłada','Skóra jak Kora','Szybki','Celny Cios','Mocny Cios','Precyzyjny Strzał','Mistrzostwo Aury','Wytrzymały','Szkolenie Mnicha','Blokada Aury','Mistrz Run','Mistrz Tarczy','Szybkie Przeładowanie','Przycelowanie','Sokole Oko','Kontrolowana Sekwencja','Śmiertelny Cios','Szkolenie Oręża','Mistrz Parowania','Wszechstronny','Runotwórstwo','Mistrz Sekwencji','Duchowa Pięść','Celny Strzał','Uzdolnienie Artystyczne','Ruch Cienia','Taktyczny Wybór','Garda Weterana']);
const resets={combat:'na walkę',round:'na rundę',scene:'na scenę',session:'na sesję',manual:'przyznaje MG'};
export function talentPresentation(actor,item){
 const rule=activeRule(item),state=resourceState(actor,item),description=String(item.system?.description??'');
 const automated=Boolean(rule||TALENT_RULES[item.name]||calculated.has(item.name));
 return {rank:currentRank(item),effectTier:effectTier(item),active:Boolean(rule),automationLabel:/WIP/i.test(description)?'WIP — bez automatyzacji':automated?'Automatyzacja całości lub części — szczegóły w audycie':'Rozstrzyganie ręczne z MG',
  useLabel:rule?.gmOnly?'Włącz T4 (MG)':rule?.action==='resistHit'?'Test stanu po trafieniu':'Użyj',canActivate:Boolean(rule&&(!rule.gmOnly||globalThis.game?.user?.isGM)),
  resetLabel:rule?rule.gmOnly?'Włącza MG · 2 rundy':(resets[rule.reset]??'Według opisu talentu'):'Według opisu',
  usesLabel:state?.max!=null?state.remaining+' / '+state.max:rule?'Bez licznika użyć':'—',shortEffect:description.length>210?description.slice(0,207)+'…':description};
}
export function canCreateMagic(actor){
 const known=Array.from(actor.items??[]).filter(i=>i.type==='talent'&&i.system.learned);
 return ['polmag','kaplan','mag'].includes(actor.system.archetype)||Array.from(actor.items??[]).some(i=>i.type==='spell')||known.some(i=>['Umiejętności Magiczne','Modlitwa','Wybraniec Boży','Błogosławiony','Magiczne Manewry'].includes(i.name));
}
