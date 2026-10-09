import assert from "node:assert/strict";

let nextRoundCalls=0;
globalThis.Combat = class {
  async nextRound(){ nextRoundCalls++; return this; }
  async _onEnter(){ }
};
globalThis.Hooks = {on() {}};
globalThis.foundry = {applications:{sidebar:{tabs:{CombatTracker:class {}}}},utils:{escapeHTML:s=>String(s)}};
globalThis.game = {gahla:{},combat:null};

const { GahlaCombat } = await import("../module/combat.mjs");

function actor(id,segments,zr=20){
  return {
    id,type:"character",
    system:{combat:{currentSegments:segments,reservedSZ:0,trackerBoss:false,normalDebt:0,reactionPenalty:0,done:false,justActed:false},stats:{zr}},
    async update(changes){
      for(const [path,value] of Object.entries(changes)){
        const parts=path.split("."); let cur=this;
        for(let i=0;i<parts.length-1;i++) cur=cur[parts[i]];
        cur[parts.at(-1)]=value;
      }
    }
  };
}

const a1=actor("a1",10,20), a2=actor("a2",8,30);
const c1={id:"c1",actor:a1,initiative:10,isVisible:true,defeated:false,name:"A1"};
const c2={id:"c2",actor:a2,initiative:8,isVisible:true,defeated:false,name:"A2"};
const list=[c1,c2];
const combat=Object.create(GahlaCombat.prototype);
combat.started=true; combat.turn=0;
combat.combatants={contents:list,get:id=>list.find(c=>c.id===id),find:fn=>list.find(fn),[Symbol.iterator]:function*(){yield* list;}};
combat.turns=list;
combat.updateEmbeddedDocuments=async(_type,updates)=>{for(const u of updates){const c=list.find(x=>x.id===u._id);if(c)c.initiative=u.initiative;}};
combat.setInitiative=async(id,value)=>{const c=list.find(x=>x.id===id);if(c)c.initiative=value;};
combat.update=async changes=>{if(changes.turn!==undefined)combat.turn=changes.turn;};
globalThis.game.combat=combat;

// Samo wejście wskaźnika tury nie może odnawiać SZ. Re-sort initiative może
// wywołać _onEnter wiele razy w jednej rundzie.
let accidentalRoundReset=0;
a1.system.combat.currentSegments=0;
a1.trackerStartRound=async()=>{ accidentalRoundReset++; a1.system.combat.currentSegments=10; };
c1.initiative=0;
await combat._onEnter(c1);
assert.equal(accidentalRoundReset,0,"_onEnter nie może uruchamiać nowej rundy ani odnawiać SZ.");
assert.equal(a1.system.combat.currentSegments,0);
// Odtwórz stan początkowy właściwego testu kolejki.
a1.system.combat.currentSegments=10;c1.initiative=10;

// Reakcja spala dolne segmenty i nie obniża initiative.
a1.system.combat.reservedSZ=3;
await combat.syncCombatantFromActor(c1);
assert.equal(c1.initiative,10);

// Akcja rozlicza wyłącznie własny koszt, ale nie zaczyna nowej rundy, jeśli ktoś nadal ma SZ.
await combat.spendSegments(4,"c1",{advance:true});
assert.equal(a1.system.combat.currentSegments,6);
assert.equal(a1.system.combat.reservedSZ,3);
assert.equal(c1.initiative,6);
assert.equal(nextRoundCalls,0);
assert.equal(combat.turn,1,"Po akcji A1 aktywny powinien zostać A2 z większą pozostałą SZ.");

await combat.spendSegments(5,"c2",{advance:true});
assert.equal(c2.initiative,3);
assert.equal(nextRoundCalls,0,"Nie wolno resetować rundy po przejściu przez listę Combatantów.");

await combat.spendSegments(3,"c1",{advance:true});
assert.equal(c1.initiative,3); // Position remains 3; lower boundary 3 leaves no segments.
assert.equal(nextRoundCalls,0,"A2 nadal ma SZ, więc runda trwa.");

await combat.spendSegments(3,"c2",{advance:true});
assert.equal(c2.initiative,0);
assert.equal(nextRoundCalls,1,"Nowa runda dopiero po wyzerowaniu wszystkich uczestników.");

// Final-round long cast waits until the countdown reaches its position.
a1.system.combat={currentSegments:7,reservedSZ:0,longReady:true,longDebt:0,done:false};c1.initiative=7;
a2.system.combat={currentSegments:9,reservedSZ:0,done:false};c2.initiative=9;let castCount=0;
a1.resolveLongAction=async()=>{castCount++;a1.system.combat.longReady=false;a1.system.combat.done=true;};
await combat.advanceGahlaTurn({allowRoundAdvance:false});assert.equal(castCount,0);assert.equal(combat.turn,1);
await combat.spendSegments(3,'c2');assert.equal(castCount,1);assert(a1.system.combat.done);assert.equal(a1.system.combat.currentSegments,7);
await combat.advanceGahlaTurn({allowRoundAdvance:false});assert.equal(castCount,1);
console.log("Gahla combat integration regression: PASS");
