import assert from "node:assert/strict";
import { effectiveSegments, normalizeTrackerState, applyTrackerAction, applyTrackerReaction, startTrackerRound, cancelTrackerLong } from "../module/tracker-rules.mjs";

let s={currentSegments:10,reservedSZ:0,reactionMax:1,reactionLeft:1,trackerBoss:false,normalDebt:0,longDebt:0,justActed:false,done:false};
let r=applyTrackerReaction(s,3); assert.equal(r.ok,true); assert.equal(r.state.reservedSZ,3); assert.equal(effectiveSegments(r.state),7); assert.equal(r.state.reactionLeft,0);
r=applyTrackerAction(r.state,4,"n"); assert.equal(r.ok,true); assert.equal(r.state.currentSegments,6); assert.equal(r.state.reservedSZ,3);

s={currentSegments:4,reservedSZ:0,reactionMax:1,reactionLeft:1,trackerBoss:false,normalDebt:0,longDebt:0,justActed:false,done:false};
r=applyTrackerAction(s,7,"c"); assert.equal(r.ok,true); assert.equal(r.state.currentSegments,0); assert.equal(r.state.normalDebt,0); assert.equal(r.state.reactionLeft,0); assert.equal(r.state.transferSegments,4);

s={currentSegments:8,reservedSZ:0,reactionMax:3,reactionLeft:3,trackerBoss:true,normalDebt:0,longDebt:0,justActed:false,done:false};
r=applyTrackerAction(s,12,"l"); assert.equal(r.ok,true); assert.equal(r.state.currentSegments,0); assert.equal(r.state.longDebt,4); assert.equal(r.state.justActed,false);
r=startTrackerRound(r.state,10); assert.equal(r.currentSegments,6); assert.equal(r.longDebt,0); assert.equal(r.reactionLeft,0); assert.equal(r.done,false);
assert.equal(r.longReady,true); r=cancelTrackerLong(r); assert.equal(r.ok,true);

assert.equal(normalizeTrackerState({reactionMax:0,reactionLeft:0}).reactionMax,0,"Płotka może mieć 0 Reakcji.");
console.log("Gahla tracker regression: PASS");
