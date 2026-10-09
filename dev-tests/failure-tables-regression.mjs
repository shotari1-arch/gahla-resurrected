import assert from "node:assert/strict";
import { FAILURE_TABLES } from "../module/content.mjs";

for (const key of ["magic","divine","maneuver","ranged"]) {
  const rows=FAILURE_TABLES[key];
  assert.ok(Array.isArray(rows) && rows.length===6, `${key}: expected 6 mishap bands`);
  let next=1;
  for (const [min,max,title,effect] of rows) {
    assert.equal(min,next,`${key}: bands must be continuous`);
    assert.ok(max>=min,`${key}: invalid range ${min}-${max}`);
    assert.ok(String(title).trim(),`${key}: missing title`);
    assert.ok(String(effect).trim(),`${key}: missing effect`);
    next=max+1;
  }
  assert.equal(next,101,`${key}: table must cover 1-100`);
}
const serialized=JSON.stringify(FAILURE_TABLES);
assert.doesNotMatch(serialized,/\bd10\b/i,"Pech tables use Gahla k-dice notation");
assert.doesNotMatch(serialized,/\b(?:WW|SW|WT|PŻ|PB)\b/,"No foreign-system stat abbreviations in Pech tables");
assert.match(serialized,/pustą stratą 5 segmentów/i,"Oszołomienie wording follows current Gahla rule");
console.log("Gahla failure tables regression: PASS");
