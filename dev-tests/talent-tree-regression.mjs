import assert from "node:assert/strict";
import { ALL_TALENTS } from "../module/content.mjs";
import { explicitTalentPrerequisites, buildTalentTree } from "../module/talent-tree-rules.mjs";

const byName=name=>ALL_TALENTS.find(t=>t.name===name);
assert.deepEqual(explicitTalentPrerequisites(byName("Medycyna Zaawansowana")).map(x=>[x.name,x.level]),[["Pierwsza Pomoc",2]]);
assert.equal(explicitTalentPrerequisites(byName("Mistrz Sekwencji")).some(x=>x.name==="Walka Wręcz"),true);
assert.equal(explicitTalentPrerequisites(byName("Sokole Oko")).some(x=>x.name==="Przycelowanie"),true);
assert.equal(explicitTalentPrerequisites(byName("Celny Strzał")).some(x=>x.name==="Sokole Oko"),true);

const items={contents:[
  {type:"talent",name:"Pierwsza Pomoc",system:{learned:true,level:2}},
  {type:"talent",name:"Przycelowanie",system:{learned:true,level:1}}
],[Symbol.iterator](){return this.contents[Symbol.iterator]();}};
const actor={items,system:{species:"human",archetype:"lowca",derived:{tier:3},xp:500,deity:"Gida"}};
const tree=buildTalentTree(actor);
assert.equal(tree.knownCount,2);
const general=tree.groups.find(g=>g.key==="general");
const medicine=general.nodes.find(n=>n.name==="Medycyna Zaawansowana");
assert.equal(medicine.missingPrereqs.length,0);
const archetype=tree.groups.find(g=>g.key==="archetype");
const eagle=archetype.nodes.find(n=>n.name==="Sokole Oko");
assert.equal(eagle.parent,"Przycelowanie");
assert.equal(eagle.relevant,true,"Sokole Oko should be relevant to Łowca");
const special=tree.groups.find(g=>g.key==="special");
assert.equal(special.label,"Specjalne");
assert.equal(special.nodes.some(n=>n.category==="deity"),false,"Non-clerics must not see deity talents at all");
const cleric={items,system:{species:"human",archetype:"kaplan",derived:{tier:3},xp:500,deity:"Gida"}};
const clericTree=buildTalentTree(cleric);
const clericSpecial=clericTree.groups.find(g=>g.key==="special");
assert.equal(clericSpecial.nodes.some(n=>n.category==="deity"&&n.deity==="Gida"),true,"Cleric should see deity talents of their own deity");
assert.equal(clericSpecial.nodes.some(n=>n.category==="deity"&&n.deity!=="Gida"),false,"Cleric must not see deity talents of other deities");
assert.equal(tree.groups.length,4,"Talent browser should expose four visual branches");
console.log("Gahla talent-tree regression: PASS");
