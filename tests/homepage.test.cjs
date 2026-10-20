'use strict';
// Tests purs de l'accueil SportOS — aucune connexion Google, aucune écriture Sheets.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const client = fs.readFileSync(path.join(__dirname, '../src/Client.html'), 'utf8');
const styles = fs.readFileSync(path.join(__dirname, '../src/Styles.html'), 'utf8');
const source = client.match(/\n  function home\(\)\{[\s\S]*?(?=\n  function program\(\))/);
assert.ok(source, 'La fonction home doit être repérable dans Client.html');
assert.match(client, /\[data-open-program\]/, 'Les liens contextuels doivent être câblés');
assert.match(styles, /@media\(max-width:760px\)/, 'Le mobile doit être pris en compte');
assert.match(styles, /\.ath-home/, 'Style accueil absent');

const escapeHtml = value => String(value == null ? '' : value)
  .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const format = value => Number(value || 0).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
const number = value => Number(String(value || 0).replace(',', '.'));
const prettyDate = value => new Date(value + 'T12:00:00')
  .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

function render(types, options = {}) {
  const cardio = options.cardio === false ? [] : [{
    Type: 'Course', Statut: 'Terminée', Date: '2026-10-19',
    'Durée min': '16', 'Effort 1-10': '2,5'
  }];
  const S = {
    data: {
      today: '2026-10-20',
      sessions: [{Type: 'A', Statut: 'Terminée', Date: ''},
                 {Type: 'B', Statut: 'Terminée', Date: ''}],
      cardio,
      logs: options.pain === false ? [] : [{ Douleur: 'Oui' }]
    }
  };
  const ctx = {
    S,
    currentWeekActivities: () => types.map(Type => ({ Type })),
    toNum: number,
    fmt: format,
    esc: escapeHtml,
    niceDate: prettyDate
  };
  const home = vm.runInNewContext('(' + source[0].trim() + ')', ctx);
  return home();
}

const none = render([]);
assert.match(none, /Renforcement A/);
assert.match(none, /data-log="A"/);
assert.match(none, /0<\/b><span> \/ 4/);
assert.match(none, /2,5\/10/);
assert.match(none, /douleurs ont déjà été signalées/);
assert.doesNotMatch(none, /Espiենս/);

const oneRun = render(['Course']);
assert.match(oneRun, /1<\/b><span> \/ 4/);
assert.match(oneRun, /data-open-program="Course"/);
assert.match(oneRun, /16 min/);
assert.match(oneRun, /20 octobre 2026/);

const afterA = render(['A','Course']);
assert.match(afterA, /Renforcement B/);
assert.match(afterA, /data-log="B"/);
assert.match(afterA, /2<\/b><span> \/ 4/);

const all = render(['A','B','Course','Vélo']);
assert.match(all, /Quel beau chemin/);
assert.match(all, /data-review="1"/);
assert.doesNotMatch(all, /data-log="A"/);
assert.match(all, /aria-valuenow="4"/);

const noRun = render([], {cardio:false, pain:false});
assert.match(noRun, /Ta première sortie/);
assert.match(noRun, /La technique, la récupération/);
assert.doesNotMatch(noRun, /Effort ressenti/);

console.log('ACCUEIL_TESTS=PASS');
console.log('SCENARIOS=5 ; DATASHEET_WRITE=NONE');
