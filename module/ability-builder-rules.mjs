function i(v,d=0){const x=Number(v);return Number.isInteger(x)?x:d;}
function bool(v){return v===true||v==="true"||v===1||v==="1";}
export function calculateSpell(state){
  const tier=i(state.tier,2),maxCost=tier*5; let baseCost=0; const bullets=[]; const risksList=[]; let effectStr=""; let opReduction=0;
  const dmg=i(state.dmg); if(dmg>0){baseCost+=dmg;bullets.push(`Obrażenia ${dmg}k10`);effectStr+=`${dmg}k10 obrażeń. `;}
  const pen=i(state.pen); if(pen>0){baseCost+=pen*3;bullets.push(`Penetracja ${pen}`);}
  const elLevel=i(state.element); if(elLevel>0){baseCost+=elLevel===1?2:elLevel===2?5:9;const elName=state.elName||"Żywioł";bullets.push(`Element: ${elName} (Poz. ${elLevel})`);}
  if(bool(state.statdmg)){baseCost+=1;bullets.push("+dziesiętna UM/Wia do obr.");}
  const heal=i(state.heal); if(heal>0){baseCost+=3+heal;bullets.push(`Leczenie ${heal} ran`);effectStr+=`Leczy ${heal} ran. `;}
  const tempHp=i(state.temphp); if(tempHp>0){baseCost+=tempHp*2;bullets.push(`+${tempHp} Tymcz. ŻYW`);}
  const hitB=i(state.hitbonus); if(hitB>0){baseCost+=hitB;bullets.push(`Trafienie +${hitB*10}`);}
  if(bool(state.haste)){baseCost+=5;bullets.push("Stan: Przyspieszenie");}
  const stateVal=i(state.state); if(stateVal>0){baseCost+=stateVal;const names={2:"Powalenie / Podpalenie",3:"Krwawienie / Oszołomienie",4:"Zatrucie / Przerażenie",5:"Spowolnienie"};bullets.push(`Stan: ${names[stateVal]||"Wybrany stan"}`);}
  const armorMinus=i(state.armorminus); if(armorMinus>0){baseCost+=armorMinus*3;bullets.push(`Pancerz celu -${armorMinus}`);}
  const hitMinus=i(state.hitminus); if(hitMinus>0){baseCost+=hitMinus;bullets.push(`Trafienie celu -${hitMinus*10}`);}
  const odpMinus=i(state.odpminus); if(odpMinus>0){baseCost+=odpMinus*2;bullets.push(`ODP celu -${odpMinus*10}`);}
  const range=i(state.range); baseCost+=range;
  const isAoe=bool(state.aoe); if(isAoe){baseCost+=3;bullets.push("Obszar 10m²");}else baseCost+=1;
  const dur=i(state.duration); if(dur>0){baseCost+=dur;bullets.push(`Czas: ${dur} rund`);}
  if(bool(state.reaction)){baseCost+=5;bullets.push("Reakcja (Wymaga 4 OP)");}
  const minusOp=i(state.minusop); if(minusOp>0){baseCost+=minusOp*2;opReduction=minusOp*3;bullets.push(`Redukcja OP -${opReduction}`);}
  const custom=i(state.customCost); if(custom>0){baseCost+=custom;bullets.push(`${state.customDesc||"Własny efekt"} (+${custom})`);}
  let riskDiscount=0,extraOpFromRisks=0;
  if(state.spellClass==="Półmag"){
    const r=state.risks||{};
    if(bool(r.r_double)){riskDiscount+=2;risksList.push("Dublet = Pech (-2)");}
    if(bool(r.r_dmg7)){riskDiscount+=2;risksList.push("Obr. 8,9,10 to 7 (-2)");}
    if(bool(r.r_numpech)){riskDiscount+=1;risksList.push("Wybrana cyfra = pech (-1)");}
    if(bool(r.r_1dmg)){riskDiscount+=1;risksList.push("Jedynka = rana w siebie (-1)");}
    if(bool(r.r_aura)){riskDiscount+=2;risksList.push("Wyczerpanie aury (-2)");}
    if(bool(r.r_focus)){riskDiscount+=2;risksList.push("Mega skupienie (-2)");}
    if(bool(r.r_destab)){riskDiscount+=3;risksList.push("Destabilizacja Mocy (-3)");}
    if(bool(r.r_fatigue)){riskDiscount+=4;risksList.push("Zmęczenie po rzuceniu (-4)");}
    const rd=Math.max(0,Math.min(2,i(r.r_delay))); if(rd>0){riskDiscount+=rd;extraOpFromRisks+=rd*3;risksList.push(`Nadmierne OP (+${rd*3} OP) (-${rd})`);}
    const rc=i(r.r_custom_cost); if(rc>0){riskDiscount+=rc;risksList.push(`Własne Ryzyko GM (-${rc})`);}
  }
  if(state.spellClass==="Kapłan"){
    if(dmg>0)baseCost+=1;if(pen>0)baseCost+=1;if(elLevel>0)baseCost+=1;if(stateVal>0)baseCost+=1;
  }
  const finalCost=Math.max(0,baseCost-riskDiscount);
  let op=finalCost+1+extraOpFromRisks+(bool(state.book)?1:0)-opReduction;
  if(bool(state.book))bullets.push("Z księgi (+1 OP)");
  const minOp=tier===1?4:(tier===2&&finalCost>=6?5:(tier===3&&finalCost>=11?6:(tier===4&&finalCost>=16?7:4)));
  op=Math.max(op,minOp);
  return {tier,maxCost,baseCost,riskDiscount,finalCost,op,minOp,range,rangeLabel:["Dotyk","Bliski","Średni","Daleki"][range]||"Daleki",target:isAoe?"Obszar":"1",bullets,risksList,effectStr,valid:finalCost<=maxCost};
}

export function calculateManeuver(state){
  let stars=0;const bullets=[];
  const baseOp=i(state.w_op),baseDmg=i(state.w_dmg);
  const strong=Math.max(0,Math.min(2,i(state.strong))),accurate=Math.max(0,Math.min(2,i(state.accurate))),pen=Math.max(0,Math.min(2,i(state.pen))),sweep=Math.max(0,Math.min(3,i(state.sweep)));
  const heavyWeapon=bool(state.weaponHeavy);
  const twoHandCapable=state.weaponTwoHandCapable===undefined?true:bool(state.weaponTwoHandCapable);

  if(strong>0){stars+=strong;bullets.push(`Silny x${strong} (+${strong}k10, ${strong}*)`);}
  if(accurate>0){stars+=accurate;bullets.push(`Celny x${accurate} (+${accurate*10} traf., ${accurate}*)`);}
  if(pen>0){stars+=pen*2;bullets.push(`Penetrujący x${pen} (+${pen} Pen., ${pen*2}*)`);}
  if(bool(state.knockdown)){
    const cost=Math.max(0,3-(heavyWeapon?1:0)); stars+=cost;
    bullets.push(`Powalający (${cost}*${heavyWeapon?", broń Ciężka −1*":""})`);
  }
  if(bool(state.bloody)){stars+=4;bullets.push("Krwawy (4*)");}
  if(bool(state.stun)){
    const cost=Math.max(0,4-(heavyWeapon?1:0)); stars+=cost;
    bullets.push(`Ogłuszający (${cost}*${heavyWeapon?", broń Ciężka −1*":""})`);
  }
  if(sweep>0){stars+=sweep*2;bullets.push(`Zamaszysty (+${sweep} cel, poł. obr., ${sweep*2}*)`);}
  const cc=Math.max(0,i(state.customCost));if(cc>0){stars+=cc;bullets.push(`${state.customDesc||"Własny efekt"} (${cc}*)`);}

  // Gwiazdki płaci się DOPIERO po wybraniu aspektów. Każda jednostka płatności to 1*.
  // Płatności są niezależne od bazowego ataku broni i nie są domyślną częścią manewru.
  const pDmg=Math.max(0,i(state.pay_dmg)),pOp=Math.max(0,i(state.pay_op)),pHit=Math.max(0,i(state.pay_hit));
  const totalPaid=pDmg+pOp+pHit;
  const fastRequested=Math.max(0,Math.min(2,i(state.fast)));
  const requestedTwoHanded=bool(state.twoHanded);
  const halfWeaponDice=requestedTwoHanded&&twoHandCapable;
  const minOp=Math.max(0,i(state.w_min_op));
  const delayBeforeFast=baseOp+pOp+(halfWeaponDice?2:0);
  const maxUsefulFast=minOp>0?Math.max(0,delayBeforeFast-minOp):2;
  const fast=Math.min(fastRequested,maxUsefulFast);
  const damageDiceDelta=strong-pDmg-fast;
  const delayDelta=pOp-fast+(halfWeaponDice?2:0);
  const modHit=(accurate*10)-(pHit*10);
  const penetrationBonus=pen;
  const extraTargets=sweep;

  if(pDmg>0) bullets.push(`Płatność *: -${pDmg}k10 obrażeń = ${pDmg}*`);
  if(pOp>0) bullets.push(`Płatność *: +${pOp} OP = ${pOp}*`);
  if(pHit>0) bullets.push(`Płatność *: -${pHit*10} trafienia = ${pHit}*`);
  if(fast>0) bullets.push(`Szybki x${fast}: -${fast}k10, -${fast} OP`);
  if(fastRequested>fast) bullets.push(`Szybki ograniczony z x${fastRequested} do x${fast} przez minimalne OP broni`);
  let halfDiceText="";
  if(halfWeaponDice){halfDiceText=" + 1/2 kości broni";bullets.push("Użycie obu rąk: +2 OP, +1/2 kości broni");}
  else if(requestedTwoHanded&&!twoHandCapable){bullets.push("Użycie obu rąk: niedostępne dla tej broni");}

  // finalOp/finalDmg to podgląd aktualnej broni + świadomie wybrane delty.
  const rawFinalOp=Math.max(0,baseOp+delayDelta);
  const finalOp=Math.max(minOp,rawFinalOp);
  if(minOp>0 && rawFinalOp<minOp) bullets.push(`Minimalne OP tej broni: ${minOp}`);
  const modifiedDice=Math.max(0,baseDmg+damageDiceDelta);
  const halfBonus=halfWeaponDice?Math.ceil(baseDmg/2):0;
  const finalDmg=modifiedDice+halfBonus;
  const hasModification=stars>0||totalPaid>0||fast>0||halfWeaponDice;
  const balanced=stars===totalPaid;
  return {
    stars,totalPaid,balanced,hasModification,
    baseOp,baseDmg,minOp,rawFinalOp,modifiedDice,halfBonus,finalOp,finalDmg,modHit,halfDiceText,bullets,weaponName:state.w_name||"Broń",
    damageDiceDelta,delayDelta,penetrationBonus,halfWeaponDice,extraTargets,
    heavyWeapon,twoHandCapable,fastRequested,fast
  };
}
