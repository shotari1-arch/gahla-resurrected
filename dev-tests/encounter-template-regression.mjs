import assert from 'node:assert/strict';
import fs from 'node:fs';
import {install} from './helpers/automation-fixtures.mjs';
install();
const {executeTool}=await import('../module/session-tools.mjs');
const {GahlaEncounterBuilder}=await import('../module/encounter-builder.mjs');
let opened=0;game.gahla.openEncounterBuilder=async()=>{opened++;return 'opened';};
for(const action of ['encounter','npc'])assert.equal(await executeTool(action),'opened');
assert.equal(opened,2);
assert(GahlaEncounterBuilder.PARTS.form.template.endsWith('/encounter-builder.hbs'));
const html=fs.readFileSync(new URL('../templates/apps/encounter-builder.hbs',import.meta.url),'utf8');
assert.match(html.trimStart(),/^<div class="gahla-encounter-form"/,'The main form must own the toolbar, not follow it as a sibling');
for(const action of ['deploy','saveTemplate','createActors']){
 assert.equal((html.match(new RegExp('data-action="'+action+'"','g'))??[]).length,1);
 assert.equal(typeof GahlaEncounterBuilder.DEFAULT_OPTIONS.actions[action],'function');
}
console.log('Encounter/NPC entry points and toolbar regression: PASS');
