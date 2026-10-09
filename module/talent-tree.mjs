import { buildTalentTree } from "./talent-tree-rules.mjs";
import { captureApplicationScroll, restoreApplicationScroll } from "./ui-state.mjs";

const { HandlebarsApplicationMixin, ApplicationV2, DialogV2 } = foundry.applications.api;

export class GahlaTalentTree extends HandlebarsApplicationMixin(ApplicationV2){
  static DEFAULT_OPTIONS={
    classes:["gahla","talent-tree"],
    position:{width:1080,height:820},
    window:{title:"Gahla Resurrected — Drzewko talentów",icon:"fas fa-sitemap"},
    actions:{buy:GahlaTalentTree.#buy,close:GahlaTalentTree.#close}
  };
  static PARTS={form:{template:"systems/gahla-resurrected/templates/apps/talent-tree.hbs"}};

  constructor(options={}){
    const {actor=null,...appOptions}=options;
    super(appOptions);
    this.actor=actor||game.user?.character||game.gahla?.lastActor||null;
  }

  async _prepareContext(options){
    captureApplicationScroll(this);
    const context=await super._prepareContext(options);
    if(!this.actor) throw new Error("GahlaTalentTree: brak aktora.");
    const tree=buildTalentTree(this.actor);
    return {...context,actor:this.actor,tree,groups:tree.groups};
  }

  async _onRender(context,options){
    await super._onRender(context,options);
    const root=this.element;
    const search=root.querySelector("[data-talent-search]");
    const onlyAvailable=root.querySelector("[data-only-available]");
    const onlyKnown=root.querySelector("[data-only-known]");
    const showAll=root.querySelector("[data-show-all]");
    const categoryButtons=[...root.querySelectorAll("[data-tree-category]")];
    let activeCategory="all";
    const apply=()=>{
      const q=String(search?.value||"").trim().toLocaleLowerCase("pl");
      const avail=Boolean(onlyAvailable?.checked), known=Boolean(onlyKnown?.checked), all=Boolean(showAll?.checked);
      for(const group of root.querySelectorAll("[data-tree-group]")){
        const category=group.dataset.treeGroup;
        const catVisible=activeCategory==="all"||activeCategory===category;
        let shown=0;
        for(const node of group.querySelectorAll("[data-talent-node]")){
          const matchesText=!q||String(node.dataset.search||"").includes(q);
          const matchesAvail=!avail||node.dataset.available==="true";
          const matchesKnown=!known||Number(node.dataset.level||0)>0;
          const matchesRelevant=all||node.dataset.relevant==="true"||Number(node.dataset.level||0)>0;
          const show=catVisible&&matchesText&&matchesAvail&&matchesKnown&&matchesRelevant;
          node.hidden=!show;if(show)shown++;
        }
        group.hidden=!catVisible||shown===0;
      }
      categoryButtons.forEach(b=>b.classList.toggle("active",b.dataset.treeCategory===activeCategory));
    };
    search?.addEventListener("input",apply);
    onlyAvailable?.addEventListener("change",apply);
    onlyKnown?.addEventListener("change",apply);
    showAll?.addEventListener("change",apply);
    categoryButtons.forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();activeCategory=btn.dataset.treeCategory||"all";apply();}));
    apply();
    restoreApplicationScroll(this);
  }

  static async #buy(_event,target){
    if(!this.actor) return;
    const name=target.dataset.name;
    const current=Number(target.dataset.current||0);
    const maxLevel=Math.max(1,Math.min(4,Number(target.dataset.maxLevel||4)));
    const next=current?current+1:1;
    if(next>maxLevel) return ui.notifications.warn(`Gahla: talent ma już maksymalny ${maxLevel}. poziom.`);
    const normal=Number(target.dataset.cost||0);
    const fd=await DialogV2.input({
      window:{title:current?"Ulepszenie talentu":"Nauka talentu"},
      position:{width:560,height:"auto"},
      content:`<p><b>${foundry.utils.escapeHTML(name)}</b> — ranga ${next}</p><p>Koszt: <b>${normal} EXP</b>. Nauczyciel redukuje koszt o połowę.</p><label><input type="checkbox" name="teacher" value="1"> Korzystam z nauczyciela (−50%)</label>`,
      ok:{label:current?"Ulepsz":"Kup"}
    });
    if(!fd) return;
    const ok=await this.actor.buyTalent(name,next,{teacher:Boolean(fd.teacher)});
    if(ok){
      captureApplicationScroll(this);
      await this.render({force:true});
      try{await this.actor.sheet?.render?.({force:true});}catch(_e){}
    }
  }

  static async #close(){ await this.close(); }
}
