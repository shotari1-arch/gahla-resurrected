import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ALL_TALENTS} from '../module/content.mjs';
import {rankSteps,rankCost} from '../module/talent-ranks.mjs';
import {CANON119} from '../module/talent-canon119.mjs';
import {profile119} from '../module/talent-values119.mjs';
import {calculateActorAbility} from '../module/ability-automation.mjs';
import {install,actor,talent} from './helpers/automation-fixtures.mjs';
install();
const startsAtTwo=['Sanktuarium Eruela','Nieustępliwe Uderzenie','Uderzenie Tarczą','Ruch Cienia','Osłona Koncentracji','Ostoja Wędrowca','Klątwa Krwawej Matki'];
for(const name of startsAtTwo){const def=ALL_TALENTS.find(t=>t.name===name);assert.deepEqual(rankSteps(def).map(s=>[s.rank,s.effectTier,s.requiredTier,s.costLevel]),[[1,2,2,2],[2,3,3,3],[3,4,4,4]]);assert.equal(rankCost(def,1,false),def.costBase*2);assert.equal(rankCost(def,1,true),Math.floor(def.costBase));}
for(const [name,canon] of Object.entries(CANON119)){const t=ALL_TALENTS.find(t=>t.name===name);assert(t&&!t.rankNeedsDecision,name);assert.equal(t.description,canon.description);assert(rankSteps(t).every(s=>s.effectTier>0&&s.requiredTier>0&&s.costLevel>0));}
// Numeric source contracts used by the talent profiles; manual workflows remain manual.
const checks=[['Rozmach Olbrzyma','extraTargets',[0,1,1,1]],['Rozmach Olbrzyma','fullTargets',[1,1,3,3]],['Rozmach Olbrzyma','specialOp',[0,0,0,4]],['Nieustępliwe Uderzenie','proneDice',[0,1,1,2]],['Nieustępliwe Uderzenie','nextDiscount',[0,0,2,2]],['Uderzenie Tarczą','segments',[0,5,5,3]],['Uderzenie Tarczą','uses',[0,1,2,2]],['Grad Strzał','targets',[2,2,3,3]],['Grad Strzał','dicePenalty',[-1,0,0,0]],['Ruch Cienia','firstDiscount',[0,0,0,3]],['Dwa Oblicza Śmierci','threshold',[1,2,2,3]],['Dwa Oblicza Śmierci','rounds',[1,2,2,4]],['Kaprys Losu','uses',[1,1,2,2]],['Nieustępliwość Tępiciela','physicalResistance',[5,10,10,15]],['Nieustępliwość Tępiciela','mentalResistance',[0,0,0,15]],['Profanacja Spokoju','spiritualPenalty',[0,0,-10,-20]],['Plaga Zarazy','rounds',[2,4,4,4]],['Plaga Zarazy','uses',[1,1,1,2]]];for(const [name,key,values]of checks)assert.deepEqual([1,2,3,4].map(t=>profile119(name,t)[key]),values,name+': '+key);
assert.equal(profile119('Grad Strzał',4).areaExtraCost,2);assert.equal(profile119('Grad Strzał',4).areaDice,3);assert.equal(profile119('Taktyczny Wybór',4).woundTier,4);
const base={mode:'spell',spellClass:'Kapłan',tier:4,dmg:0,range:0,duration:0,extraAspects:{damageBonus:2},hitbonus:4};const a=actor(),b=actor([talent('Szał Bitewny')]);a.system.deity=b.system.deity='Rador';const plain=calculateActorAbility(base,a),enhanced=calculateActorAbility(base,b);assert.equal(plain.finalCost-enhanced.finalCost,2,'Only one discounted damage unit and one +20 hit unit');
const audit=fs.readFileSync(new URL('../docs/TALENT-CANON-RECONCILIATION-0.11.9.md',import.meta.url),'utf8');assert.equal(audit.split('\n').filter(l=>l.includes('| WYMAGA DECYZJI |')).length,43);assert(!ALL_TALENTS.some(t=>t.name==='Mistrz Ukrywania / Cichy Ruch'));for(const name of ['Mistrz Ukrywania','Cichy Ruch'])assert(ALL_TALENTS.some(t=>t.name===name));
console.log('PASS canon/rank/source contracts, sparse T2–T4 prices, 43-row reconciliation, split entries and live Szał Bitewny single-unit discounts. Numeric contracts do not assert automation of manual workflows.');
