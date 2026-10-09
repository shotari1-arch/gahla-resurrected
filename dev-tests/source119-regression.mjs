import assert from 'node:assert/strict';
import {install,actor,talent,NS} from './helpers/automation-fixtures.mjs';
import {powerSourceProfile} from '../module/canonical-rules.mjs';
import {calculateActorAbility} from '../module/ability-automation.mjs';
import {profile119} from '../module/talent-values119.mjs';
import {CANON119} from '../module/talent-canon119.mjs';
import {migrateItemData119,migrateLedger119} from '../module/migration119.mjs';
install();
for(const sourceTier of [1,2,3,4]){
 const source={id:'source',type:'powerSource',system:{equipped:true,sourceTier,enchantments:[]}};
 assert.equal(powerSourceProfile(source).test,5,'Source Tier never multiplies base casting bonus');
 source.system.enchantments=Array(sourceTier).fill('aura');assert.equal(powerSourceProfile(source).test,5);assert.equal(powerSourceProfile(source).aura,sourceTier);assert.deepEqual(powerSourceProfile(source).errors,[]);
 for(const [archetype,school]of [['kaplan','Kapłan'],['polmag','Półmag']]){const caster=actor([source,talent('Nasycenie Źródła Mocy',4)]);caster.system.archetype=archetype;const c=calculateActorAbility({mode:'spell',spellClass:school,tier:4,dmg:1,range:0,duration:0,extraAspects:{}},caster);assert(c.valid,c.errors.join(';'));assert.equal(c.sourceBonus,5,'Both actual spell/miracle calculators preserve +5 with talent T4');}
 const profile=profile119('Nasycenie Źródła Mocy',sourceTier);assert.equal(profile.sourceBaseCastingBonus,5);assert.equal(profile.creationTestPerTalentTier,5);assert.equal(profile.enchantmentChoicesPerSourceTier,1);assert.equal(profile.extraOptionsPerProcess,1);assert(!Object.hasOwn(profile,'sourceTestPerTier'));
}
const option={type:'powerSource',system:{sourceTier:4,enchantments:['test']}};assert.equal(powerSourceProfile(option).test,15,'Existing explicit +10 enchantment option unchanged; not a Tier bonus');
option.system.enchantments=Array(5).fill('aura');assert(powerSourceProfile(option).errors.length,'Existing extra-option structural conflict remains explicit');assert.equal(powerSourceProfile(option).test,5);
const old={_id:'source-talent',name:'Nasycenie Źródła Mocy',type:'talent',system:{rank:4,level:4,description:'Test ½ UM albo WIA + ½ ER + 5×Tier talentu. Każdy Tier źródła +5 testu rzucania i 1 opcja umagicznienia.'},flags:{[NS]:{talent119:true,custom:'keep'}}};const fixed=migrateItemData119(old)[0];assert(fixed.system.description.includes('bazowo stałe +5'));assert(!fixed.system.description.includes('Każdy Tier źródła +5'));const custom=migrateItemData119({...old,system:{...old.system,description:old.system.description+' Własna notatka.'}})[0];assert(custom.system.description.endsWith('Własna notatka.'));assert.equal(fixed._id,old._id);assert.equal(fixed.system.rank,4);assert.equal(fixed.flags[NS].custom,'keep');assert.deepEqual(migrateItemData119(fixed),[fixed]);
const ledger={canon119:true,entries:[{delta:-100,undo:{items:[{id:old._id,before:old,after:old}]}}]};const migrated=migrateLedger119(ledger);assert.equal(migrated.entries[0].delta,-100);assert.equal(migrated.entries[0].undo.items[0].after.system.description,fixed.system.description);assert.deepEqual(migrateLedger119(migrated),migrated);
console.log('PASS source T1–T4 constant +5; spell and miracle calculator; creation/casting separation; explicit enchantment unchanged; corrected description/history idempotence.');

