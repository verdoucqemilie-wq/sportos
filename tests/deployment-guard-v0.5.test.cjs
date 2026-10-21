'use strict';
// Régression de la publication privée: clasp peut ne renvoyer AUCUNE description.
// Aucune connexion Apps Script; pure lecture de chaînes.
const assert=require('node:assert/strict');
const {checkBefore,checkAfter,findTarget,EXPECTED_ID}=require('../scripts/deployment-version-guard-v0.5.cjs');
const head='AKfycbxhodmUXbKNA-LBAT4TZn21lU4RPjPYNQIk5oI9ZSus';
const other='AKfycbyvS8Q8XBecRZUJqMXnpYDN02kSVQSjzcDu4yDxEuXBF5ZUsfaQB4MVtt-b1Rw8xLPFvg';
const output=(number,description='')=>[
 'Found 3 deployments.',
 '- '+head+' @HEAD ',
 '- '+EXPECTED_ID+' @'+number+(description?' - '+description:' ') ,
 '- '+other+' @2 '
].join('\n');
assert.equal(checkBefore(output(6)),6,'version @6 sans description doit être acceptée');
assert.equal(checkBefore(output(6,'SportOS v0.4.0 — Branding')),6,'description non obligatoire');
assert.equal(checkAfter(output(7),EXPECTED_ID,6),7,'@7 sans description après déploiement');
assert.equal(checkAfter(output(9,'SportOS v0.5.0'),EXPECTED_ID,6),9);
assert.equal(findTarget(output(6)).version,6);
assert.throws(()=>checkBefore(output(5)),/@5 inattendue/,'ne jamais pousser depuis une autre version');
assert.throws(()=>checkBefore(output(7)),/@7 inattendue/,'ne jamais publier deux fois sur une version postérieure');
assert.throws(()=>checkBefore(output(6,'SportOS v0.5.0')), /déjà déployée/);
assert.throws(()=>checkBefore('Found 2 deployments.\n- '+head+' @HEAD\n- '+other+' @2'), /exactement une fois/);
assert.throws(()=>checkBefore(output(6)+'\n- '+EXPECTED_ID+' @6'),/exactement une fois/);
assert.throws(()=>checkBefore(output(6),other),/identifiant cible inattendu/);
assert.throws(()=>checkAfter(output(6),EXPECTED_ID,6),/n.a pas progressé/);
assert.throws(()=>checkAfter(output(5),EXPECTED_ID,6),/n.a pas progressé/);
console.log('DEPLOYMENT_VERSION_GUARD_V0_5=PASS');
console.log('CASES=13 ; LIVE_SCRIPT_WRITES=0');
