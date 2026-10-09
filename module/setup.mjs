import {canonicalTalentName} from './canon-names.mjs';
import { WEAPONS, ARMORS, SHIELDS, ALL_TALENTS, ELEMENTS, SPELL_ASPECTS, MANEUVER_ASPECTS, DEITY_TALENTS, RUNE_TYPES, METALS } from "./content.mjs";
import { GahlaCharacterCreator } from "./creator.mjs";
import { captureApplicationScroll, restoreApplicationScroll } from "./ui-state.mjs";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;

export class GahlaSetupApp extends HandlebarsApplicationMixin(ApplicationV2){
  static DEFAULT_OPTIONS={classes:["gahla","gahla-setup"],tag:"form",form:{handler:GahlaSetupApp.#submit,closeOnSubmit:false},position:{width:760,height:650},window:{title:"Gahla Resurrected — Narzędzia",icon:"fas fa-toolbox"},actions:{creator:GahlaSetupApp.#creator,tracker:GahlaSetupApp.#tracker,builder:GahlaSetupApp.#builder,encounter:GahlaSetupApp.#encounter,seed:GahlaSetupApp.#seed,updateFate:GahlaSetupApp.#updateFate}};
  static PARTS={form:{template:"systems/gahla-resurrected/templates/apps/setup.hbs"}};
  async _onRender(context,options){ await super._onRender(context,options); restoreApplicationScroll(this); }
    static async #submit(){ /* Tools are action-driven. */ }
  async _prepareContext(){captureApplicationScroll(this);return {version:game.gahla?.version||"0.9.6-beta",wip:["Multiklasowość — WIP.","Pamięć Krwi — WIP.","Łączenie Żywiołów — WIP.","Rzemiosło jako pełny subsystem — WIP.","Poziomy powyżej 11 — WIP.","Rasy Kevru/Lud Stali/Niziołki — WIP.","Przeczucie Przyszłości — decyzja autora."],groupFate:game.settings.get("gahla-resurrected","groupFatePool")};}
  static async #creator(){new GahlaCharacterCreator().render({force:true});}
  static async #tracker(){const {GahlaInitiativeTracker}=await import("./tracker.mjs");new GahlaInitiativeTracker().render({force:true});}
  static async #builder(){const {GahlaAbilityBuilder}=await import("./ability-builder.mjs");new GahlaAbilityBuilder().render({force:true});}
  static async #encounter(){const {GahlaEncounterBuilder}=await import("./encounter-builder.mjs");new GahlaEncounterBuilder().render({force:true});}
  static async #updateFate(event,target){const value=Number(target.form?.elements.groupFate?.value||0);await game.settings.set("gahla-resurrected","groupFatePool",Math.max(0,value));}
  static async #seed(){
    const folderParentId=f=>f?.folder?.id ?? f?._source?.folder ?? null;
    const itemFolderId=i=>i?.folder?.id ?? i?._source?.folder ?? null;
    const ensureFolder=async(name,parent=null)=>{
      const parentId=parent?.id ?? null;
      let folder=game.folders.find(f=>f.name===name&&f.type==="Item"&&folderParentId(f)===parentId);
      if(!folder) folder=await Folder.create({name,type:"Item",folder:parentId});
      return folder;
    };

    const root=await ensureFolder("Gahla — Biblioteka");
    const equipment=await ensureFolder("Ekwipunek",root);
    const weaponFolder=await ensureFolder("Broń",equipment);
    const armorFolder=await ensureFolder("Pancerze i tarcze",equipment);
    const runeFolder=await ensureFolder("Runy",root);
    const talentFolders={
      racial:await ensureFolder("Talenty — Rasowe",root),
      general:await ensureFolder("Talenty — Ogólne",root),
      archetype:await ensureFolder("Talenty — Archetypowe",root),
      special:await ensureFolder("Talenty — Specjalne",root),
      deity:await ensureFolder("Talenty — Boskie",root)
    };

    const deityFolders=new Map();
    for(const deity of [...new Set(DEITY_TALENTS.map(t=>t.deity))].sort((a,b)=>a.localeCompare(b,"pl"))){
      deityFolders.set(deity,await ensureFolder(deity,talentFolders.deity));
    }

    const libraryFolderIds=new Set([root.id]);
    let expanded=true;
    while(expanded){
      expanded=false;
      for(const folder of game.folders){
        const parentId=folderParentId(folder);
        if(parentId&&libraryFolderIds.has(parentId)&&!libraryFolderIds.has(folder.id)){libraryFolderIds.add(folder.id);expanded=true;}
      }
    }
    const libraryItems=game.items.filter(i=>libraryFolderIds.has(itemFolderId(i)));
    const libraryKey=doc=>doc.type==="talent"
      ? `talent:${canonicalTalentName(doc.name)}:${doc.system?.category||""}:${doc.system?.deity||""}`
      : `${doc.type}:${doc.name}`;
    const byName=new Map();
    for(const item of libraryItems){
      const key=libraryKey(item);
      if(!byName.has(key)) byName.set(key,[]);
      byName.get(key).push(item);
    }

    const desired=[];
    for(const w of WEAPONS) desired.push({...w,folder:weaponFolder.id});
    for(const a of [...ARMORS,...SHIELDS]) desired.push({...a,folder:armorFolder.id});
    for(const r of RUNE_TYPES) desired.push({name:r.name,type:"rune",folder:runeFolder.id,system:{category:"rune",description:r.description,tier:r.tier,level:1,costXP:Number(r.cost||0),requirements:`Wymagany Tier runotwórstwa ${r.tier}`,runSlots:0}});
    for(const t of ALL_TALENTS){
      const category=talentFolders[t.category]?t.category:"special";
      const folder=(category==="deity"&&t.deity?deityFolders.get(t.deity):talentFolders[category]) || root;
      desired.push({name:t.name,type:"talent",folder:folder.id,system:{category:t.category,description:t.description,requirements:t.requirements||"",costXP:t.costBase||50,tier:1,level:1,maxLevel:Number(t.maxLevel||4),learned:false,deity:t.deity||""}});
    }

    const creates=[];
    let moved=0, removedDuplicates=0;
    for(const doc of desired){
      const matches=byName.get(libraryKey(doc))||[];
      const existing=matches.shift();
      if(existing){
        const patch={};
        if(itemFolderId(existing)!==doc.folder){patch.folder=doc.folder;moved++;}
        // 0.6.0 koryguje źródłową Ciężką Tarczę do +2 pancerza.
        // Synchronizujemy wyłącznie szablon w bibliotece podczas jawnego seeda — nie dotykamy
        // egzemplarzy na Actorach, które mogły zostać uszkodzone w trakcie gry.
        if(doc.type==="armor" && doc.name==="Ciężka Tarcza"){
          patch["system.armor"]=Number(doc.system?.armor||2);
          patch["system.traits"]=Array.isArray(doc.system?.traits)?doc.system.traits:[];
          patch["system.ignoreLow"]=Number(doc.system?.ignoreLow||2);
        }
        if(doc.type==="talent"){
          patch["system.description"]=String(doc.system?.description||"");
          patch["system.requirements"]=String(doc.system?.requirements||"");
          patch["system.costXP"]=Number(doc.system?.costXP||50);
          patch["system.maxLevel"]=Number(doc.system?.maxLevel||4);
        }
        if(Object.keys(patch).length) await existing.update(patch);
        // Stare seedy 0.4.0 mogły utworzyć drugi egzemplarz talentu boskiego.
        for(const duplicate of matches.splice(0)){
          if(duplicate.type===doc.type){await duplicate.delete();removedDuplicates++;}
        }
      }else{
        creates.push({...doc,flags:{"gahla-resurrected":{library:true}}});
      }
    }
    if(creates.length) await Item.createDocuments(creates);
    ui.notifications.info(`Gahla: biblioteka uporządkowana — ${creates.length} nowych, ${moved} przeniesionych${removedDuplicates?`, ${removedDuplicates} duplikatów usuniętych`:""}.`);
  }
}

export function registerSettings(){
  game.settings.register("gahla-resurrected","useCharacterCreator",{name:"Gahla — Kreator przy tworzeniu postaci",hint:"Gdy tworzysz nowego Aktora typu character, zamiast pustej karty otwiera Kreator postaci.",scope:"world",config:true,type:Boolean,default:true});
  game.settings.register("gahla-resurrected","groupFatePool",{name:"Gahla — Grupowe Punkty Losu",hint:"Wspólna pula Punktów Losu dla drużyny.",scope:"world",config:true,type:Number,default:0});
  game.settings.register("gahla-resurrected","useDeadlyCrits",{name:"Archiwalne Deadly CRITS (nieaktywne)",hint:"Zastąpione punktami jakości w 0.11.",scope:"world",config:false,type:Boolean,default:false});
  game.settings.register("gahla-resurrected","lingeringWounds",{name:"Gahla — Trwałe Rany",hint:"Włącza rzut LW po przekroczeniu ŻYW. Tabele kanoniczne i zapis trwałych skutków na karcie.",scope:"world",config:true,type:Boolean,default:true});
  game.settings.register("gahla-resurrected","itemDataVersion",{name:"Gahla — wersja danych Itemów",scope:"world",config:false,type:Number,default:0});
  game.settings.registerMenu("gahla-resurrected","tools",{name:"Gahla — Narzędzia",label:"Otwórz narzędzia Gahla",hint:"Kreator postaci, biblioteka, grupowe Punkty Losu i lista WIP.",icon:"fas fa-toolbox",type:GahlaSetupApp,restricted:true});
}
