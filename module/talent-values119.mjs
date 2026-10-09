import {talentUsable119} from './talent-eligibility.mjs';
import {NS,itemsOf,levelOf} from './effects-engine.mjs';
export const ART_CHOICES={singing:'Śpiew',dancing:'Taniec'};
export const artTalent=actor=>itemsOf(actor).find(i=>i.type==='talent'&&i.system.learned&&i.name==='Uzdolnienie Artystyczne');
export function artBonus(actor){const item=artTalent(actor),choice=item?.flags?.[NS]?.artChoice;return {og:item&&levelOf(item)>=3&&choice==='singing'?5:0,zr:item&&levelOf(item)>=3&&choice==='dancing'?5:0};}
export function climbingCost119(actor,cost,{requiresSegments=true}={}){if(!requiresSegments)return 0;if(!Number.isFinite(Number(cost))||Number(cost)<1)throw Error('Koszt wspinaczki musi być dodatni.');const item=itemsOf(actor).find(i=>i.name==='Wspinacz'&&i.system.learned);return Math.max(1,Number(cost)-(item&&levelOf(item)>=3?2:0));}
export const tier119=(actor,name)=>levelOf(itemsOf(actor).find(i=>i.type==='talent'&&i.system.learned&&talentUsable119(actor,i)&&i.name===name))*(itemsOf(actor).some(i=>i.type==='talent'&&i.system.learned&&talentUsable119(actor,i)&&i.name===name)?1:0);
export const naturalAttack119=weapon=>['unarmed','claws','fangs'].includes(weapon?.system?.profileId)||weapon?.flags?.[NS]?.naturalAttack===true;
export function aim119(actor,segments=0){const max=tier119(actor,'Celny Strzał')?6:4;if(!Number.isInteger(segments)||segments<0||segments>max)throw Error(`Przycelowanie: 0–${max} segmentów.`);if(segments&&!tier119(actor,'Przycelowanie'))throw Error('Wymagany talent Przycelowanie.');const eagle=tier119(actor,'Sokole Oko')>=3;return {hit:segments*(eagle?15:5),dice:Math.floor(segments/2)+(eagle&&segments>=2?1:0),segments,calledShotReduction:tier119(actor,'Celny Strzał')?5*segments:0};}
export const PROFILES119={
 'Chwyt Tytana':{sf:[40,40,50,60],lightHit:[0,10,10,20],heavyHit:[0,0,0,10],secondDiscount:[0,1,1,2],fullSecondDice:[false,false,true,true],heavyPair:[false,false,true,true]},
 'Mistrz Sekwencji':{discountTwo:[1,1,2,2],discountFour:[2,2,4,4],firstBonus:[0,1,1,2],promote:[false,false,false,true]},
 'Duchowa Pięść':{uses:[1,1,1,2],aura:2,defense:5,elementDice:[0,1,1,2],reserve:[0,0,2,3],naturalPen:[0,0,0,1]},
 'Gniew Gidy':{uses:[1,1,1,2],rounds:[2,4,4,4],dice:[0,1,2,2],conditionTier:3,condition:'burning',darkAdvantageTier:4,element:'fire'},
 'Sanktuarium Eruela':{segments:10,radius:10,rounds:2,resistance:[0,10,15,15],heal:[0,0,0,1]},
 'Rozmach Olbrzyma':{sweepDiscount:1,sweepMinimum:1,extraTargets:[0,1,1,1],defense:[0,-10,-10,-10],fullTargets:[1,1,3,3],specialOp:[0,0,0,4],uses:[0,0,0,1]},
 'Nieustępliwe Uderzenie':{proneDice:[0,1,1,2],nextDiscount:[0,0,2,2],nextMinimum:2,defenseRecovery:[0,0,0,10]},
 'Uderzenie Tarczą':{uses:[0,1,2,2],segments:[0,5,5,3],proneTier:3,disadvantageTier:4,condition:'stunned'},
 'Grad Strzał':{segments:3,targets:[2,2,3,3],dicePenalty:[-1,0,0,0],areaTier:4,areaExtraCost:2,areaRadius:5,areaDice:3},
 'Taktyczny Wybór':{farHit:5,hiddenAdvantageTier:2,reactionTier:3,reactionCost:2,woundTier:4},
 'Przygotowany Atak':{penetration:1,firstAdvantageTier:2,armorBonusTier:3,armorBonusCost:1,hiddenWoundTier:4},
 'Ruch Cienia':{move:[0,2,2,2],dodgeDiscount:[0,0,1,1],dodgeMinimum:1,firstDiscount:[0,0,0,3],uses:[0,0,0,2],minimum:2},
 'Pazury i Kły':{dice:[1,2,2,3],hit:[0,10,10,20],penetration:[0,0,1,1],delay:1},
 'Osłona Koncentracji':{defenseTier:2,defense:10,aura:2,resistTier:3,resistUses:1,cleanseTier:4,cleanseAura:5,cleanseUses:1},
 'Dwa Oblicza Śmierci':{segments:3,uses:[1,1,1,2],rounds:[1,2,2,4],threshold:[1,2,2,3],woundTier:3,reactionTier:2},
 'Żołnierz Burzy':{uses:[1,1,1,2],rounds:[2,4,4,4],dice:[0,1,2,2],conditionTier:3,proneTier:4,element:'lightning'},
 'Ostoja Wędrowca':{segments:10,radius:10,rounds:[0,2,2,4],defense:[0,5,10,10],rerollTier:4},
 'Kaprys Losu':{uses:[1,1,2,2],advantageTier:2,adjustment:[0,0,0,10]},
 'Nieustępliwość Tępiciela':{physicalResistance:[5,10,10,15],mentalResistance:[0,0,0,15],advantageTier:3},
 'Profanacja Spokoju':{radius:10,immuneTier:2,spiritualPenalty:[0,0,-10,-20]},
 'Ostrze Cieni':{dice:[1,2,2,2],fearTier:3,ignoreArmorTier:4},
 'Plaga Zarazy':{uses:[1,1,1,2],rounds:[2,4,4,4],strengthTier:2,lifeTier:3,lifeAura:1,lifeLoss:1,lifeMin:1,lifeDaysDice:1,spreadTier:4,spreadRadius:5},
 'Garda Weterana':{shieldCost:3,shieldUses:1,firstDodge:[5,10,10,10],nextDiscount:[0,0,2,2],ignoreOverflowTier:4},
 'Nasycenie Źródła Mocy':{creationTestPerTalentTier:5,attemptsPerRest:1,sourceBaseCastingBonus:5,enchantmentChoicesPerSourceTier:1,extraOptionsPerProcess:1},
 'Klątwa Krwawej Matki':{usesPerRound:1,spiritualDisadvantageTier:3,bleedDice:[0,1,1,2]},
 'Szept z Mroku':{discount:1,dice:1},'Przyspieszony Nurt':{discount:1},'Światło Przewodnika':{discount:1,extraRound:1},'Szał Bitewny':{damageDice:1,damageCost:1,hit:20,hitCost:1},'Kradzież Fortuny':{extraCost:1,fate:1,maxPerScene:1}
};
export function profile119(name,tier){const p=PROFILES119[name];if(!p||tier<1||tier>4)return null;return Object.fromEntries(Object.entries(p).map(([k,v])=>[k,Array.isArray(v)?v[tier-1]:v]));}
export function sequenceDiscount119(actor,maneuver){const saved=actor.flags?.[NS]?.sequence119;return maneuver&&saved?.combat===(globalThis.game?.combat?.id??null)?Number(saved.discount||0):0;}
export function sequenceResult119(actor,sequence,next,result,{promote=false,previous=actor.flags?.[NS]?.sequence??{}}={}){const tier=tier119(actor,'Mistrz Sekwencji');if(!tier||!sequence)return {result,points:0,state:null};const p=profile119('Mistrz Sekwencji',tier),old=sequence.index>1?previous:{};let promoted=false;if(promote&&p.promote&&sequence.index>1&&!old.promoted119&&result.success&&!result.bonus&&!result.criticalSuccess){result={...result,bonus:true};promoted=true;}const points=result.bonus&&!old.bonus119?p.firstBonus:0;Object.assign(next,{bonus119:Boolean(old.bonus119||result.bonus),promoted119:Boolean(old.promoted119||promoted)});return {result,points,state:next.complete?{combat:globalThis.game?.combat?.id??null,discount:sequence.length===2?p.discountTwo:sequence.length===4?p.discountFour:0}:null};}
