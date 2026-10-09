import {saveAuraManeuver119} from './talent-aura119.mjs';
import { calculateActorAbility, EXTRA_ASPECTS } from "./ability-automation.mjs";
import { CONDITIONS } from "./rules.mjs";
const SPELL_DEFAULTS={
  mode:"spell",name:"Kula Żaru",spellClass:"Półmag",tier:2,desc:"Skompresowana kula żaru wybuchająca przy kontakcie z celem.",
  dmg:4,pen:0,elName:"",element:0,statdmg:false,heal:0,temphp:0,hitbonus:0,haste:false,state:"0",armorminus:0,hitminus:0,odpminus:0,range:3,aoe:false,duration:0,reaction:false,book:false,minusop:0,customDesc:"",customCost:0,
  risks:{r_double:false,r_dmg7:false,r_numpech:false,r_1dmg:false,r_aura:false,r_focus:false,r_destab:false,r_fatigue:false,r_delay:0,r_custom_cost:0}
};
const MANEUVER_DEFAULTS={mode:"maneuver",name:"Nowy Manewr",weaponId:"",w_name:"Broń",w_op:4,w_dmg:3,w_hands:1,w_min_op:4,weaponHeavy:false,weaponTwoHandCapable:false,strong:0,accurate:0,pen:0,knockdown:false,bloody:false,stun:false,sweep:0,customDesc:"",customCost:0,twoHanded:false,fast:0,pay_dmg:0,pay_op:0,pay_hit:0};

function clone(v){return structuredClone(v);}
function n(v,d=0){const x=Number(v);return Number.isFinite(x)?x:d;}
function i(v,d=0){const x=Number(v);return Number.isInteger(x)?x:d;}
function bool(v){return v===true||v==="true"||v===1||v==="1";}

import { calculateSpell, calculateManeuver } from "./ability-builder-rules.mjs";
import { captureApplicationScroll, restoreApplicationScroll } from "./ui-state.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export function spellItemSystem(s,c){
  const stateNames={2:"Powalenie",3:"Krwawienie",4:"Zatrucie",5:"Spowolnienie"};
  const aspects=[...c.bullets];
  const damage=c.finalCost>0&&i(s.dmg)>0?`${i(s.dmg)}k10`:"0";
  return {description:s.desc||"",tier:c.tier,level:1,damageType:s.spellClass==="Kapłan"?"spiritual":"magical",rollStat:s.spellClass==="Kapłan"?"wia":"um",spellCost:c.finalCost,aspectCost:c.finalCost,maxCost:c.maxCost,minDelay:c.minOp,delay:c.op,testBonus:0,bonusPoints:0,target:c.target,duration:i(s.duration)>0?String(i(s.duration)):"0",school:s.spellClass,fromBook:bool(s.book),aspects,risks:c.risksList,prepared:false,damage,penetration:i(s.pen),flatDamage:0,damageBonusDice:0,element:s.elName||"",range:c.rangeLabel,effects:[stateNames[i(s.state)]||"",bool(s.haste)?"Przyspieszenie":"",...Object.entries(s.extraAspects??{}).filter(([,v])=>Number(v)>0).map(([key])=>EXTRA_ASPECTS[key]?.label??key)].filter(Boolean),builderState:JSON.stringify({...s,calculated:c})};
}

export function maneuverItemSystem(s,c){
  const sign=v=>Number(v)>0?`+${Number(v)}`:String(Number(v));
  return {
    description:`Nakładka na zwykły atak. Modyfikatory: ${sign(c.damageDiceDelta)}k10, ${sign(c.delayDelta)} OP, ${sign(c.modHit)} trafienia, +${c.penetrationBonus} Penetracji${c.halfWeaponDice?", +1/2 kości aktualnej broni przy użyciu oburącz":""}. Broń w kreatorze (${s.w_name||"—"}) służy tylko do podglądu.`,
    tier:1,level:1,category:"builder",costXP:0,requirements:"",damage:`${c.finalDmg}k10`,damageType:"physical",delay:c.finalOp,penetration:Math.max(0,c.penetrationBonus),hands:Number(s.w_hands||1),
    traits:c.bullets,equipped:false,maneuvers:[...c.bullets],effects:[...c.bullets],aspects:[...c.bullets],
    maneuverHitMod:c.modHit,maneuverBaseOp:c.baseOp,maneuverWeapon:s.w_name||"",maneuverTwoHanded:bool(s.twoHanded),
    maneuverOverlayVersion:2,maneuverDamageDiceDelta:c.damageDiceDelta,maneuverDelayDelta:c.delayDelta,maneuverPenetrationBonus:c.penetrationBonus,maneuverHalfWeaponDice:c.halfWeaponDice,maneuverExtraTargets:c.extraTargets,
    prepared:false,builderState:JSON.stringify({...s,calculated:c})
  };
}

export class GahlaAbilityBuilder extends HandlebarsApplicationMixin(ApplicationV2){
  static DEFAULT_OPTIONS={classes:["gahla","gahla-ability-builder"],tag:"form",form:{handler:GahlaAbilityBuilder.#submit,closeOnSubmit:false},position:{width:1280,height:900},window:{title:"Gahla Resurrected — Kreator Zdolności",icon:"fas fa-magic"},actions:{save:GahlaAbilityBuilder.#save,mode:GahlaAbilityBuilder.#mode,print:GahlaAbilityBuilder.#print}};
  static PARTS={form:{template:"systems/gahla-resurrected/templates/apps/ability-builder.hbs"}};
  constructor(options={}){
    const {actor=null,item=null,mode=null,...appOptions}=options;
    super(appOptions);
    this.actor=actor||game.user?.character||game.gahla?.lastActor||null;
    this.item=item||null;
    this.draft=this.#initialState(mode||(this.item?.type||"spell"));
    if(!this.item && this.draft.mode==="spell" && this.actor){
      if(this.actor.system?.archetype==="kaplan") this.draft.spellClass="Kapłan";
      const tier=Number(this.actor.system?.derived?.tier||1);
      if(Number.isInteger(tier) && tier>=1 && tier<=4) this.draft.tier=tier;
    }
    const equippedWeapons=this.#equippedWeapons();
    if(!this.item && this.draft.mode==="maneuver" && equippedWeapons.length){
      this.#applyWeaponBase(equippedWeapons[0]);
    }
    const draftSystem=this.item?.flags?.['gahla-resurrected']?.pendingAbility?.system??this.item?.system;
    if(draftSystem?.builderState){try{this.draft={...this.draft,...JSON.parse(draftSystem.builderState)};}catch(_e){}}
    this.draft.reservationItemId=this.item?.id??"";
    if(this.draft.mode==="maneuver" && equippedWeapons.length){
      const stored=equippedWeapons.find(w=>w.id===this.draft.weaponId) || equippedWeapons.find(w=>w.name===this.draft.w_name);
      if(stored) this.#applyWeaponBase(stored);
      else if(!this.item) this.#applyWeaponBase(equippedWeapons[0]);
    }
  }
  #initialState(mode){return mode==="maneuver"?clone(MANEUVER_DEFAULTS):clone(SPELL_DEFAULTS);}
  #equippedWeapons(){
    return Array.from(this.actor?.items?.contents ?? this.actor?.items ?? []).filter(i=>i?.type==="weapon"&&i.system?.equipped);
  }
  #applyWeaponBase(weapon){
    if(!weapon) return;
    this.draft.weaponId=weapon.id||"";
    this.draft.w_name=weapon.name||this.draft.w_name;
    this.draft.w_op=Math.max(1,Number(weapon.system?.delay||this.draft.w_op));
    this.draft.w_hands=Math.max(1,Number(weapon.system?.hands||1));
    const traits=Array.from(weapon.system?.traits||[]).map(t=>String(t).toLowerCase());
    this.draft.weaponHeavy=traits.some(t=>t.includes("ciężka")||t.includes("ciezka"));
    this.draft.weaponTwoHandCapable=this.draft.w_hands>=1.5||traits.some(t=>t.includes("2-ręczna")||t.includes("2reczna")||t.includes("2 ręczna")||t.includes("1,5-ręczna")||t.includes("1,5reczna")||t.includes("1,5 ręczna"));
    this.draft.w_min_op=(Number(weapon.system?.delay||0)<=3||traits.some(t=>t.includes("lekka")))?3:(this.draft.weaponTwoHandCapable&&this.draft.w_hands>=2?5:4);
    if(!this.draft.weaponTwoHandCapable) this.draft.twoHanded=false;
    const match=String(weapon.system?.damage||"").match(/^(\d+)k10/i);
    if(match) this.draft.w_dmg=Math.max(1,Number(match[1]));
  }
  async _prepareContext(options){
    captureApplicationScroll(this);
    const context=await super._prepareContext(options);
    const spell=calculateActorAbility({...this.draft,mode:"spell"},this.actor), maneuver=calculateActorAbility({...this.draft,mode:"maneuver"},this.actor);
    const actors=Array.from(game.actors ?? []).filter(a=>a?.isOwner).map(a=>({id:a.id,name:a.name}));
    const maneuverWeapons=this.#equippedWeapons().map(w=>({id:w.id,name:w.name,damage:w.system?.damage||"—",delay:Number(w.system?.delay||0),hands:Number(w.system?.hands||1),selected:w.id===this.draft.weaponId}));
    return {...context,state:this.draft,spell,maneuver,actors,maneuverWeapons,hasManeuverWeapons:maneuverWeapons.length>0,currentActorId:this.actor?.id||"",editing:Boolean(this.item),editingName:this.item?.name||"",note:"Kalkulator 1.5 odwzorowuje logikę dostarczonego narzędzia HTML. Pola Kreatywny/Własne Ryzyko pozostają decyzją MG i nie dostają automatycznej interpretacji."};
  }
  async _onRender(context,options){
    await super._onRender(context,options);
    this.#automationFields();this.#wireInputs();this.#updatePreview();
    restoreApplicationScroll(this);
  }
  #automationFields(){
    const root=this.element;root.querySelectorAll('[data-builder-generated],.gahla-builder-extras').forEach(e=>e.remove());
    const esc=v=>foundry.utils.escapeHTML(String(v??''));
    const append=(slot,html,classes='')=>{const node=document.createElement('div');node.dataset.builderGenerated='1';node.className='gahla-extra-fields '+classes;node.innerHTML=html;(root.querySelector('[data-extra-slot="'+slot+'"]')??root.querySelector('.gahla-builder-workspace')).append(node);};
    if(this.draft.mode!=='spell'){append('maneuver','<label>Skupienie Bojowe — zablokowana Aura<input id="auto_aura119" type="number" min="0" max="3" value="'+Number(this.draft.pay_aura||0)+'"></label>');append('maneuver','<label class="gahla-check-card"><span>Specjalny Manewr<small class="gahla-field-hint">Darmowy koszt z talentu</small></span><input type="checkbox" id="auto_special" '+(this.draft.specialManeuver?'checked':'')+'></label>','gahla-builder-extras');return;}
    const sources=Array.from(this.actor?.items??[]).filter(i=>i.type==='powerSource'&&i.system.equipped);
    append('source','<label>Źródło Mocy<select id="auto_source"><option value="">Automatyczne</option>'+sources.map(i=>'<option value="'+esc(i.id)+'" '+(this.draft.sourceId===i.id?'selected':'')+'>'+esc(i.name)+'</option>').join('')+'</select><small class="gahla-field-hint">Premie źródła i talentów w podsumowaniu.</small></label>','gahla-builder-extras');
    append('target','<label class="gahla-check-card"><span>Cel: rzucający<small class="gahla-field-hint">Koszt celu 0 · zasięg Dotyk</small></span><input id="auto_self" type="checkbox" '+(this.draft.selfTarget?'checked':'')+'></label><label>Liczba celów<small class="gahla-field-hint">1 / cel</small><input id="auto_targets" type="number" min="1" max="100" value="'+Number(this.draft.targetCount??1)+'"></label><label>Obszar: jednostki po 10 m²<small class="gahla-field-hint">3 / jednostka</small><input id="auto_area" type="number" min="1" max="100" value="'+Number(this.draft.areaUnits??1)+'"></label>');
    append('support','<label>Usuwany stan<select id="auto_condition"><option value="">— wybierz przy usuwaniu stanu —</option>'+Object.entries(CONDITIONS).map(([key,v])=>'<option value="'+key+'" '+(this.draft.removeCondition===key?'selected':'')+'>'+esc(v.label)+'</option>').join('')+'</select></label><label>Wybrana cecha<select id="auto_stat">'+['sf','zr','per','er','um','og','wia'].map(key=>'<option '+(this.draft.extraStat===key?'selected':'')+'>'+key+'</option>').join('')+'</select><small class="gahla-field-hint">Dla premii lub kary do jednej cechy.</small></label>');
    const groups={support:['removeCondition','removeAll','statBonus','damageBonus','resistance','allResistance','defenseBonus','armorBonus','threshold','speedBonus','enchant'],debuff:['statPenalty','allTestsPenalty','speedPenalty','thresholdPenalty'],conditions:['asleep','blind','fatigued','burning','stunned','frightened'],elements:['elementArmor','vulnerability'],casting:['trigger']};
    for(const [group,keys]of Object.entries(groups))append(group,keys.map(key=>{const v=EXTRA_ASPECTS[key];return '<label>'+esc(v.label)+'<small class="gahla-field-hint">'+(v.exponential?'Koszt: 2, 4, 8… za kolejne poziomy':v.cost+' / poziom')+(v.max?' · maks. '+v.max:'')+'</small><input aria-label="'+esc(v.label)+'" data-extra-aspect="'+key+'" type="number" min="0" max="'+(v.max??100)+'" value="'+Number(this.draft.extraAspects?.[key]??0)+'"></label>';}).join(''));
  }
  #wireInputs(){
    const root=this.element;
    root.querySelectorAll("input,select,textarea").forEach(el=>{ if(el.dataset.bound)return; el.dataset.bound="1"; el.addEventListener("input",()=>{this.#syncFromDom();this.#updatePreview();});el.addEventListener("change",()=>{this.#syncFromDom();this.#updatePreview();}); });
    const weaponSelect=root.querySelector("#m_weapon_id");
    if(weaponSelect && !weaponSelect.dataset.weaponBound){
      weaponSelect.dataset.weaponBound="1";
      weaponSelect.addEventListener("change",async()=>{this.#syncFromDom();await this.render({force:true});});
    }
    const actorSelect=root.querySelector("#builder-actor");
    if(actorSelect && !actorSelect.dataset.actorBound){
      actorSelect.dataset.actorBound="1";
      actorSelect.addEventListener("change",async()=>{
        const actor=actorSelect.value?game.actors.get(actorSelect.value):null;
        this.actor=actor||null;
        if(this.draft.mode==="spell")await this.render({force:true});
        if(this.draft.mode==="maneuver"){
          const weapons=this.#equippedWeapons();
          if(weapons.length)this.#applyWeaponBase(weapons[0]);
          else this.draft.weaponId="";
          await this.render({force:true});
        }
      });
    }
  }
  #syncFromDom(){
    const root=this.element;const mode=this.draft.mode;
    this.draft.pay_aura=Number(root.querySelector("#auto_aura119")?.value||0);
    this.draft.specialManeuver=Boolean(root.querySelector("#auto_special")?.checked);
    this.draft.selfTarget=Boolean(root.querySelector("#auto_self")?.checked);
    this.draft.targetCount=Number(root.querySelector("#auto_targets")?.value??1);
    this.draft.areaUnits=Number(root.querySelector("#auto_area")?.value??1);
    this.draft.extraAspects=Object.fromEntries(Array.from(root.querySelectorAll("[data-extra-aspect]")).map(e=>[e.dataset.extraAspect,Number(e.value)]));
    this.draft.sourceId=root.querySelector("#auto_source")?.value??this.draft.sourceId;
    this.draft.removeCondition=root.querySelector("#auto_condition")?.value??this.draft.removeCondition;
    this.draft.extraStat=root.querySelector("#auto_stat")?.value??this.draft.extraStat;
    const read=(id)=>root.querySelector(`#${id}`);const val=(id)=>read(id)?.value;const chk=(id)=>Boolean(read(id)?.checked);
    if(mode==="spell"){
      this.draft={...this.draft,name:val("s_name")||"",spellClass:val("s_class")||"Półmag",tier:i(val("s_tier"),2),desc:val("s_desc")||"",dmg:i(val("s_dmg")),pen:i(val("s_pen")),elName:val("s_el_name")||"",element:i(val("s_element")),statdmg:chk("s_statdmg"),heal:i(val("s_heal")),temphp:i(val("s_temphp")),hitbonus:i(val("s_hitbonus")),haste:chk("s_haste"),state:val("s_state")||"0",armorminus:i(val("s_armorminus")),hitminus:i(val("s_hitminus")),odpminus:i(val("s_odpminus")),range:i(val("s_range")),aoe:chk("s_aoe"),duration:i(val("s_duration")),reaction:chk("s_reaction"),book:chk("s_book"),minusop:i(val("s_minusop")),customDesc:val("s_custom_desc")||"",customCost:i(val("s_custom_cost")),risks:{r_double:chk("r_double"),r_dmg7:chk("r_dmg7"),r_numpech:chk("r_numpech"),r_1dmg:chk("r_1dmg"),r_aura:chk("r_aura"),r_focus:chk("r_focus"),r_destab:chk("r_destab"),r_fatigue:chk("r_fatigue"),r_delay:i(val("r_delay")),r_custom_cost:i(val("r_custom_cost"))}};
    }else{
      const weaponId=val("m_weapon_id")||this.draft.weaponId||"";
      const weapon=this.#equippedWeapons().find(w=>w.id===weaponId);
      let wName=val("m_w_name")||"", wOp=i(val("m_w_op")), wDmg=i(val("m_w_dmg"));
      let wHands=Number(this.draft.w_hands||1), wMinOp=Number(this.draft.w_min_op||0), weaponHeavy=Boolean(this.draft.weaponHeavy), weaponTwoHandCapable=Boolean(this.draft.weaponTwoHandCapable);
      if(weapon){
        wName=weapon.name||wName; wOp=Math.max(1,Number(weapon.system?.delay||wOp)); wHands=Math.max(1,Number(weapon.system?.hands||1));
        const traits=Array.from(weapon.system?.traits||[]).map(t=>String(t).toLowerCase());
        weaponHeavy=traits.some(t=>t.includes("ciężka")||t.includes("ciezka"));
        weaponTwoHandCapable=wHands>=1.5||traits.some(t=>t.includes("2-ręczna")||t.includes("2reczna")||t.includes("2 ręczna")||t.includes("1,5-ręczna")||t.includes("1,5reczna")||t.includes("1,5 ręczna"));
        wMinOp=(Number(weapon.system?.delay||0)<=3||traits.some(t=>t.includes("lekka")))?3:(weaponTwoHandCapable&&wHands>=2?5:4);
        const match=String(weapon.system?.damage||"").match(/^(\d+)k10/i); if(match) wDmg=Math.max(1,Number(match[1]));
        const nameInput=read("m_w_name"), opInput=read("m_w_op"), dmgInput=read("m_w_dmg");
        if(nameInput) nameInput.value=wName; if(opInput) opInput.value=String(wOp); if(dmgInput) dmgInput.value=String(wDmg);
      }
      const twoHanded=weaponTwoHandCapable&&chk("m_2h");
      this.draft={...this.draft,name:val("m_name")||"",weaponId,w_name:wName,w_op:wOp,w_dmg:wDmg,w_hands:wHands,w_min_op:wMinOp,weaponHeavy,weaponTwoHandCapable,strong:i(val("m_strong")),accurate:i(val("m_accurate")),pen:i(val("m_pen")),knockdown:chk("m_knockdown"),bloody:chk("m_bloody"),stun:chk("m_stun"),sweep:i(val("m_sweep")),customDesc:val("m_custom_desc")||"",customCost:i(val("m_custom_cost")),twoHanded,fast:i(val("m_fast")),pay_dmg:i(val("pay_dmg")),pay_op:i(val("pay_op")),pay_hit:i(val("pay_hit"))};
    }
  }
  #updatePreview(){
    if(!this.element)return;
    const root=this.element;const state=this.draft;
    const validation=calculateActorAbility(state,this.actor);
    const esc=v=>foundry.utils.escapeHTML(String(v??''));
    const notice=root.querySelector('[data-automation-validation]');
    if(notice){const list=(title,entries,cls)=>entries.length?'<div class="'+cls+'"><h4>'+title+'</h4><ul>'+entries.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>':'';
      notice.innerHTML='<h3>Walidacja</h3>'+list('Popraw przed zapisem',validation.errors,'validation-errors')+(!validation.errors.length?'<p class="validation-ok">✓ Zdolność spełnia sprawdzane wymagania.</p>':'')+list('Uwagi',validation.warnings,'validation-warnings')+(state.mode==='spell'?'<h4>Podsumowanie kosztu</h4><dl><dt>Przed zniżkami i ryzykami</dt><dd>'+validation.baseCost+'</dd><dt>Po zniżkach i ryzykach</dt><dd>'+validation.finalCost+' / '+validation.maxCost+'</dd><dt>Źródło — test / punkty bonusu</dt><dd>+'+validation.sourceBonus+' / +'+validation.sourcePoints+'</dd></dl>':'')+list('Zastosowane modyfikatory',validation.trace.map(t=>t.source+': '+t.before+' → '+t.after),'validation-trace');
    }
    this.#txt('summary_cost',state.mode==='spell'?validation.finalCost+' / '+validation.maxCost:validation.stars+'* / '+validation.totalPaid+'*');
    this.#txt('summary_op',state.mode==='spell'?validation.op:validation.finalOp);
    this.#txt('summary_min',state.mode==='spell'?validation.minOp:validation.minOp);
    this.#txt('summary_validation',validation.errors.length?validation.errors.length+' bł.':'OK');
    root.querySelector('.gahla-builder-summary')?.classList.toggle('has-errors',validation.errors.length>0);
    root.querySelectorAll('[data-action="save"]').forEach(e=>{e.disabled=!validation.valid;e.title=validation.valid?'Zapisz zdolność':'Popraw błędy w sekcji Walidacja';});
    const targetInput=root.querySelector('#auto_targets'),areaInput=root.querySelector('#auto_area');
    if(targetInput)targetInput.disabled=Boolean(state.selfTarget||state.aoe);
    if(areaInput)areaInput.disabled=Boolean(state.selfTarget||!state.aoe);
    root.querySelectorAll('[data-preview="spell"]').forEach(e=>e.classList.toggle("hidden",state.mode!=="spell"));
    root.querySelectorAll('[data-preview="maneuver"]').forEach(e=>e.classList.toggle("hidden",state.mode!=="maneuver"));
    root.querySelector("[data-mage-risks]")?.classList.toggle("hidden",state.mode!=="spell" || state.spellClass!=="Półmag");
    if(state.mode==="spell"){
      const c=calculateActorAbility(state,this.actor);this.#txt("c_title",state.name||"Zaklęcie");this.#txt("c_type",`${state.spellClass||"Półmag"} · TIER ${c.tier}`);this.#txt("c_cost",c.finalCost);this.#txt("c_op",c.op);this.#txt("c_range",c.rangeLabel);this.#txt("c_target",c.target);this.#txt("c_effect",c.effectStr||"Efekt wspierający / status.");this.#txt("c_desc",state.desc||"");this.#setHtml("c_bullets",c.bullets.map(x=>`<span class=\"c-bullet\">${foundry.utils.escapeHTML(x)}</span>`).join(""));this.#setHtml("c_risks",c.risksList.map(x=>`<span class=\"c-bullet risk\">${foundry.utils.escapeHTML(x)}</span>`).join(""));root.querySelector("#c_risks_box")?.classList.toggle("hidden",c.risksList.length===0);this.#txt("s_balance",`Koszt Finalny: ${c.finalCost} / ${c.maxCost} | OP: ${c.op} (Min: ${c.minOp})`);this.#setClass("s_balance",`balance gahla-builder-balance ${c.valid?"ok":"err"}`);
    }else{const c=calculateActorAbility(state,this.actor);this.#txt("c_title",state.name||"Manewr");this.#txt("c_type","MANEWR · ZWARCIE");this.#txt("c_m_final_op",c.finalOp);this.#txt("c_m_final_dmg",`${c.finalDmg}k10`);this.#txt("c_m_hit",c.modHit>0?`+${c.modHit}`:c.modHit);this.#txt("c_m_stars",c.stars);this.#txt("c_m_effect",`Baza: ${c.weaponName} — ${c.baseDmg}k10 / OP ${c.baseOp}`);this.#txt("c_m_desc",c.hasModification?`Po modyfikacjach: ${c.finalDmg}k10${c.halfDiceText} / OP ${c.finalOp} / ${c.modHit>=0?"+":""}${c.modHit} trafienia. Każdy koszt * jest opłacany osobno: −1k10, +1 OP lub −10 trafienia.`:`Czysty atak broni: ${c.baseDmg}k10 / OP ${c.baseOp} / +0 trafienia. Nic nie jest doliczane automatycznie — wybierz aspekty, a potem opłać ich gwiazdki.`);this.#setHtml("c_m_bullets",c.bullets.map(x=>`<span class=\"c-bullet\">${foundry.utils.escapeHTML(x)}</span>`).join(""));this.#txt("m_balance",c.stars===0&&c.totalPaid===0?"Baza czysta: 0* wymagane / 0* zapłacone":`Wymagane *: ${c.stars} | Zapłacone: ${c.totalPaid} ${c.balanced?"(Zbilansowano!)":"(Brak balansu!)"}`);this.#setClass("m_balance",`balance gahla-builder-balance ${c.stars===0&&c.totalPaid===0?"":(c.balanced?"ok":"err")}`);}
  }
  #txt(id,value){const e=this.element?.querySelector?.(`#${id}`);if(e)e.textContent=String(value??"");}
  #setHtml(id,value){const e=this.element.querySelector(`#${id}`);if(e)e.innerHTML=value||"";}
  #setClass(id,value){const e=this.element.querySelector(`#${id}`);if(e)e.className=value;}
  static async #submit(){ /* Builder is action-driven; prevent native form submit. */ }
  static async #mode(_e,t){
    if(this.item && t.dataset.mode!==this.item.type) return ui.notifications.warn("Gahla: przy edycji istniejącego Itemu nie można zmienić jego typu.");
    this.#syncFromDom(); this.draft={...(t.dataset.mode==="spell"?clone(SPELL_DEFAULTS):clone(MANEUVER_DEFAULTS)),mode:t.dataset.mode};
    if(t.dataset.mode==="maneuver"){
      const weapons=this.#equippedWeapons(); if(weapons.length)this.#applyWeaponBase(weapons[0]);
    }
    await this.render({force:true});
  }
  static async #save(_e){
    this.#syncFromDom();const state=clone(this.draft);const currentActor=this.element.querySelector("#builder-actor")?.value;const actor=currentActor?game.actors.get(currentActor):this.actor;this.actor=actor||null;
    const validation=calculateActorAbility(state,this.actor);
    if(!validation.valid)return ui.notifications.warn(validation.errors.join("; "));
    let docData;
    if(state.mode==="spell"){
      const calc=calculateActorAbility(state,this.actor);if(!calc.valid)return ui.notifications.warn(`Gahla: koszt ${calc.finalCost} przekracza limit Tieru (${calc.maxCost}).`);docData={name:state.name||"Zaklęcie",type:"spell",system:spellItemSystem(state,calc)};
    }else{
      const calc=calculateActorAbility(state,this.actor);if(!calc.balanced)return ui.notifications.warn(`Gahla: manewr nie jest zbilansowany — wymagane * ${calc.stars}, opłacone ${calc.totalPaid}.`);if(!calc.hasModification)return ui.notifications.warn("Gahla: to nadal czysty atak broni. Wybierz przynajmniej jeden aspekt, Szybki albo Użycie obu rąk, aby zapisać manewr.");docData={name:state.name||"Manewr",type:"maneuver",system:maneuverItemSystem(state,calc)};
    }
    if(this.item){
      if(this.item.system.prepared&&this.item.parent){await this.item.setFlag('gahla-resurrected','pendingAbility',docData);ui.notifications.info('Zapisano projekt zmian. Aktualna wersja pozostaje przygotowana do Długiego Odpoczynku.');}
      else if(actor&&state.mode==='maneuver'){await saveAuraManeuver119(actor,this.item,docData);ui.notifications.info('Zaktualizowano '+docData.name);}
      else{await this.item.update({name:docData.name,system:docData.system,'flags.gahla-resurrected.schoolNeedsReview':false,'flags.gahla-resurrected.illegalElement':false});ui.notifications.info('Zaktualizowano '+docData.name);}
    } 
    else if(actor&&state.mode==='maneuver'){await saveAuraManeuver119(actor,null,docData);ui.notifications.info('Utworzono '+docData.name);}
    else if(actor){await actor.createEmbeddedDocuments("Item",[docData]);ui.notifications.info(`Gahla: utworzono ${docData.name} na ${actor.name}.`);}
    else {await Item.createDocuments([docData]);ui.notifications.info(`Gahla: utworzono ${docData.name} w świecie.`);}
    if(this.item) await this.item.sheet?.render?.({force:true});
  }
  static async #print(){
    this.#syncFromDom();const card=this.element.querySelector("#builder-card");if(!card)return;const win=window.open("","_blank","width=500,height=750");if(!win)return;win.document.write(`<!doctype html><html lang=\"pl\"><head><meta charset=\"utf-8\"><title>Gahla — karta</title><style>body{background:#111;color:#eee;font-family:Georgia,serif;padding:20px}.card{width:360px;min-height:500px;margin:auto;background:linear-gradient(145deg,#dfd6c0,#bfb297);border:4px solid #756242;border-radius:12px;padding:20px;color:#24211c}.c-header{display:flex;justify-content:space-between;border-bottom:2px solid #756242;padding-bottom:10px}.c-title{font-size:26px;font-weight:bold}.c-type{font-size:10px;text-transform:uppercase}.c-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:15px 0}.c-stat{background:#ffffff66;padding:8px 4px;text-align:center}.c-label{font-size:10px;text-transform:uppercase}.c-val{font-size:17px;font-weight:bold}.section{margin:10px 0;border-top:1px solid #0002;padding-top:8px}.bullet{display:inline-block;background:#0001;padding:4px 7px;border-radius:4px;margin:3px;font-size:11px}</style></head><body>${card.outerHTML}</body></html>`);win.document.close();win.focus();setTimeout(()=>win.print(),100);}
}
