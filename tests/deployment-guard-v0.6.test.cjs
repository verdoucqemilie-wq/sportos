'use strict';
// Pure unit tests: never connect to Apps Script or write to Sheets.
const assert=require('node:assert/strict');
const {findTarget,before,unchanged,after,EXPECTED_ID}=require('../scripts/deployment-version-guard-v0.6.cjs');
const head='AKfycbxhodmUXbKNA-LBAT4TZn21lU4RPjPYNQIk5oI9ZSus';
const other='AKfycbyvS8Q8XBecRZUJqMXnpYDN02kSVQSjzcDu4yDxEuXBF5ZUsfaQB4MVtt-b1Rw8xLPFvg';
const list=(version,description='',extra='')=>[
  'Found 3 deployments.',
  '- '+head+' @HEAD',
  '- '+EXPECTED_ID+' @'+version+(description?' - '+description:' '),
  '- '+other+' @2',
  extra
].join('\n');
assert.equal(before(list(6)),6,'ancienne version @6 acceptee');
assert.equal(before(list(7)),7,'V0.5 @7 sans description acceptee');
assert.equal(before(list(7,'SportOS v0.5.0 — Home')),7,'V0.5 @7 avec description acceptee');
assert.equal(findTarget(list(6)).description,'');
assert.equal(findTarget(list(7,'SportOS v0.5.0')).version,7);
assert.equal(unchanged(list(6),EXPECTED_ID,6),6);
assert.equal(unchanged(list(7),EXPECTED_ID,7),7);
assert.equal(after(list(7),EXPECTED_ID,6),7);
assert.equal(after(list(8),EXPECTED_ID,7),8);
assert.equal(after(list(10),EXPECTED_ID,7),10);
assert.throws(()=>before(list(5)),/inattendue/);
assert.throws(()=>before(list(8)),/inattendue/);
assert.throws(()=>before(list(7,'SportOS v0.6.0')),/V0.6 deja/);
assert.throws(()=>before(list(6)+'\n- '+EXPECTED_ID+' @6'),/plusieurs exemplaires/);
assert.throws(()=>before('Found 2 deployments.\n- '+head+' @HEAD\n- '+other+' @2'),/absent/);
assert.throws(()=>before(list(6),other),/ID Apps Script/);
assert.throws(()=>unchanged(list(7),EXPECTED_ID,6),/modifiee/);
assert.throws(()=>unchanged(list(6),other,6),/ID Apps Script/);
assert.throws(()=>after(list(6),EXPECTED_ID,6),/non augmentee/);
assert.throws(()=>after(list(7),EXPECTED_ID,7),/non augmentee/);
assert.throws(()=>after(list(7),EXPECTED_ID,5),/non autorisee/);
assert.throws(()=>after(list(8),other,7),/ID Apps Script/);
console.log('DEPLOYMENT_VERSION_GUARD_V0_6=PASS');
console.log('SCENARIOS=22 ; LIVE_SCRIPT_WRITES=0');
