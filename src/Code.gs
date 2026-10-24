/**
 * SportOS v0.1.1 — Apps Script server.
 * Deployment: Execute as me / Who has access: Only myself.
 * This is a private personal app, not a public API.
 * Single existing personal SportOS spreadsheet; no separate test environment.
 */
const SPORTOS = Object.freeze({
  spreadsheetId: '1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ',
  timezone: 'Europe/Paris',
  version: '0.1.1',
  maxRowsReturned: 350,
});

function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('SportOS — Mon coaching')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function include(filename) {
  if (['Styles', 'Client'].indexOf(filename) === -1) throw Error('Fichier non autorisé');
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function db_() { return SpreadsheetApp.openById(SPORTOS.spreadsheetId); }
function tab_(name) {
  const tab = db_().getSheetByName(name);
  if (!tab) throw Error('Onglet manquant : ' + name);
  return tab;
}
function read_(name) {
  const tab = tab_(name);
  const rows = Math.min(tab.getLastRow(), SPORTOS.maxRowsReturned + 1);
  if (!rows) return [];
  return tab.getRange(1, 1, rows, Math.min(tab.getLastColumn(), 26))
    .getValues().map(row => row.map(v => v instanceof Date
      ? Utilities.formatDate(v, SPORTOS.timezone, 'yyyy-MM-dd')
      : String(v == null ? '' : v)));
}
function objects_(name) {
  const values = read_(name);
  if (!values.length) return [];
  const keys = values[0].map(s => s.trim());
  return values.slice(1).filter(r => r[0]).map(r => {
    const result = {};
    keys.forEach((key, i) => { if (key) result[key] = r[i] || ''; });
    return result;
  });
}
function today_() { return Utilities.formatDate(new Date(), SPORTOS.timezone, 'yyyy-MM-dd'); }
/** ISO week determined from the actual activity date, not from form submission day. */
function weekOf_(isoDate) {
  const date = new Date(isoDate + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const year = date.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((date - jan1) / 86400000 + 1) / 7);
  return year + '-W' + String(week).padStart(2, '0');
}
/** Fail closed if the personal Sheet's columns were rearranged. */
function requireColumns_(name, required) {
  const sheet = tab_(name);
  if (sheet.getLastColumn() < required.length) throw Error('Structure incomplète : ' + name);
  const headers = sheet.getRange(1, 1, 1, required.length).getDisplayValues()[0];
  required.forEach((title, i) => {
    if (headers[i] !== title) throw Error('Structure modifiée : ' + name + ', colonne ' + (i + 1));
  });
  return sheet;
}

function isoDate_(value) {
  const v = String(value || '');
  if (!/^\d{4}-\d\d-\d\d$/.test(v) || Number.isNaN(new Date(v + 'T12:00:00Z').getTime())
      || new Date(v + 'T12:00:00Z').toISOString().slice(0, 10) !== v || v > today_())
    throw Error('Date invalide');
  return v;
}
function num_(value, min, max, allowBlank) {
  if (allowBlank && (value === '' || value === null || value === undefined)) return '';
  const n = Number(typeof value === 'string' ? value.replace(',', '.') : value);
  if (!Number.isFinite(n) || n < min || n > max) throw Error('Valeur numérique non autorisée');
  return n;
}
function str_(value, max) { return String(value == null ? '' : value).trim().slice(0, max); }
function yesNo_(value) {
  if (value === 'Oui' || value === true) return 'Oui';
  if (value === 'Non' || value === false) return 'Non';
  return 'Non renseigné';
}
function validKey_(value, max) {
  const v = str_(value, max);
  if (!/^[A-Za-z0-9_-]{8,120}$/.test(v)) throw Error('Identifiant de saisie invalide');
  return v;
}
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function findRow_(sheet, key) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const ids = sheet.getRange(2, 1, last - 1, 1).getDisplayValues();
  const idx = ids.findIndex(row => row[0] === key);
  return idx < 0 ? 0 : idx + 2;
}
function upsert_(sheet, key, values) {
  if (sheet.getLastColumn() < values.length) throw Error('Schéma inattendu : ' + sheet.getName());
  const row = findRow_(sheet, key) || (sheet.getLastRow() + 1);
  sheet.getRange(row, 1, 1, values.length).setValues([values]);
  return row;
}

/** Optional V0.8 columns. Never overwrite an existing non-empty header, formula or user value. */
function optionalColumns_(sheet, firstColumn, titles, needed) {
  const current = sheet.getRange(1, firstColumn, 1, titles.length).getDisplayValues()[0];
  const ready = titles.every((title, i) => current[i] === title);
  if (ready) return true;
  if (current.some(v => v !== '')) throw Error('Colonnes réservées non conformes : ' + sheet.getName());
  if (!needed) return false;
  // The change is limited to previously blank header cells and is done before session writes.
  sheet.getRange(1, firstColumn, 1, titles.length).setValues([titles]);
  return true;
}

function getBootstrap() {
  const profile = objects_('01_Profil');
  const goals = objects_('02_Objectifs');
  const programs = objects_('11_Programmes');
  const exercises = objects_('03_Programme');
  const sessions = objects_('04_Seances');
  const logs = objects_('05_Exercices_Log');
  const cardio = objects_('06_Cardio');
  const steps = objects_('14_Cardio_Progression');
  const advice = objects_('08_Coaching');
  const reviews = objects_('07_Bilans');
  const measurements = objects_('12_Mesures');
  return { version: SPORTOS.version, today: today_(), profile, goals, programs, exercises,
    sessions, logs, cardio, steps, advice, reviews, measurements };
}

/** Write exactly the planned 5 exercise slots. Client cannot inject arbitrary exercise IDs. */
function saveStrength(payload) {
  if (!payload || ['A', 'B'].indexOf(payload.type) < 0) throw Error('Séance invalide');
  const id = validKey_(payload.id, 120);
  const date = isoDate_(payload.date);
  const type = payload.type;
  const duration = num_(payload.duration, 0, 240, true);
  const effort = num_(payload.effort, 0, 10, true);
  const planned = objects_('03_Programme').filter(e =>
    e.Séance === type && e.Statut === 'Proposé — S2' && e.Version === 'V1-S2');
  if (planned.length !== 5) throw Error('Programme actif incomplet, sauvegarde refusée');
  const provided = Array.isArray(payload.exercises) ? payload.exercises : [];
  if (!provided.length || provided.length > 5) throw Error('Au moins un exercice à renseigner');
  const ids = planned.map(e => e.Exercice_ID);
  if (new Set(provided.map(x => x.id)).size !== provided.length || provided.some(x => ids.indexOf(x.id) < 0))
    throw Error('Exercices non conformes au programme');
  const items = planned.map(ex => {
    const input = provided.find(p => p.id === ex.Exercice_ID);
    if (!input) return null;
    const isTimed = String(ex.Temps_s || '').trim() !== '' && String(ex.Rép_min || '').trim() === '';
    return {
      id: ex.Exercice_ID, name: ex.Nom, isTimed,
      sets: num_(input.sets, 0, 8, true), reps: num_(input.reps, 0, 100, true),
      weight: num_(input.weight, 0, 150, true), seconds: num_(input.seconds, 0, 1200, true),
      difficulty: ['Facile', 'Modéré', 'Difficile', 'Très difficile', ''].includes(input.difficulty) ? input.difficulty : '',
      rir: isTimed ? '' : num_(input.rir, 0, 10, true),
      secondsReserve: isTimed ? num_(input.secondsReserve, 0, 120, true) : '',
      pain: yesNo_(input.pain),
      painWhere: str_(input.painWhere, 120), note: str_(input.note, 300)
    };
  }).filter(Boolean);
  if (!items.length) throw Error('Aucun exercice enregistré');
  return withLock_(() => {
    // Both target schemas validated before the first real write.
    const logs = requireColumns_('05_Exercices_Log', ['Log_ID', 'Seance_ID', 'Exercice_ID', 'Exercice', 'Séries réelles', 'Rép réelles', 'Charge réelle kg', 'Maintien réel s', 'Difficulté', 'RIR', 'Douleur', 'Localisation', 'Note', 'Origine']);
    const sessions = requireColumns_('04_Seances', ['Seance_ID', 'Semaine', 'Date', 'Type', 'Statut', 'Durée prévue min', 'Durée réelle min', 'Effort global 1-10', 'Énergie avant', 'Énergie après', 'Notes', 'Origine']);
    // New optional timed-hold feedback is stored separately: RIR remains repetitions only.
    const existingSessionRow = findRow_(sessions, id);
    if (existingSessionRow) {
      const prior = sessions.getRange(existingSessionRow, 1, 1, 12).getDisplayValues()[0];
      if (prior[3] !== type || prior[4] !== 'Terminée' || !/^WebApp/.test(prior[11]))
        throw Error('Modification refusée : ce retour historique ne provient pas de la WebApp');
    }
    const holdColumn = optionalColumns_(logs, 15, ['Réserve tenue (s)'], items.some(x => x.secondsReserve !== ''));
    // Log IDs are stable. Retries overwrite the same records instead of duplicating them.
    items.forEach(x => {
      const values = [id + '_' + x.id, id, x.id, x.name,
        x.sets, x.reps, x.weight, x.seconds, x.difficulty, x.rir, x.pain, x.painWhere, x.note, 'WebApp'];
      // Preserve legacy gainage entries formerly entered as repetitions or RIR.
      // They must not be silently converted into seconds, nor erased by an edit.
      const oldRow = existingSessionRow ? findRow_(logs, id + '_' + x.id) : 0;
      if (x.isTimed && oldRow) {
        const priorLog = logs.getRange(oldRow, 1, 1, 14).getValues()[0];
        if (x.reps === '' && priorLog[5] !== '') values[5] = priorLog[5];
        if (x.rir === '' && priorLog[9] !== '') values[9] = priorLog[9];
      }
      if (holdColumn) values.push(x.secondsReserve);
      upsert_(logs, id + '_' + x.id, values);
    });
    const sessionExists = !!findRow_(sessions, id);
    upsert_(sessions, id, [id, weekOf_(date), date, type, 'Terminée', 40, duration,
      effort, num_(payload.energyBefore, 0, 10, true), num_(payload.energyAfter, 0, 10, true),
      str_(payload.note, 500), 'WebApp v0.1']);
    return { ok: true, id, updated: sessionExists };
  });
}

function saveCardio(payload) {
  if (!payload || ['Course', 'Vélo'].indexOf(payload.type) === -1) throw Error('Activité inconnue');
  const id = validKey_(payload.id, 120);
  const date = isoDate_(payload.date);
  const duration = num_(payload.duration, 1, 1440, false);
  const rpe = num_(payload.effort, 0, 10, false);
  const distance = num_(payload.distance, 0, 600, true);
  // Strava figures are optional manual observations, not imported or calculated.
  const elevation = payload.type === 'Vélo' ? num_(payload.elevationGain, 0, 10000, true) : '';
  const averageSpeed = payload.type === 'Vélo' ? num_(payload.averageSpeed, 0, 150, true) : '';
  const run = payload.type === 'Course';
  const secsRun = run ? num_(payload.runSeconds, 0, 3600, true) : '';
  const secsWalk = run ? num_(payload.walkSeconds, 0, 3600, true) : '';
  const rounds = run ? num_(payload.rounds, 0, 200, true) : '';
  let runTotal = '', walkTotal = '';
  if (run && secsRun !== '' && secsWalk !== '' && rounds !== '') {
    if ((secsRun + secsWalk) * rounds > duration * 60 + 60) throw Error('Intervalles plus longs que la durée totale');
    runTotal = Math.round((secsRun * rounds / 60) * 100) / 100;
    walkTotal = Math.round((secsWalk * rounds / 60) * 100) / 100;
  }
  return withLock_(() => {
    const sheet = requireColumns_('06_Cardio', ['Cardio_ID', 'Semaine', 'Date', 'Type', 'Durée min', 'Distance km', 'Effort 1-10', 'Aisance respiratoire', 'Douleur', 'Note', 'Statut', 'Origine', 'ID_externe', 'Statut_import', 'Programme_ID', 'Date_import', 'Course_sec_bloc', 'Marche_sec_bloc', 'Nb_blocs', 'Course_totale_min', 'Marche_totale_min', 'Echauffement_reel_min', 'Retour_calme_reel_min', 'Séance_plan_ID']);
    const extended = optionalColumns_(sheet, 25,
      ['Dénivelé positif (m)', 'Vitesse moyenne (km/h)'], elevation !== '' || averageSpeed !== '');
    const existingRow = findRow_(sheet, id);
    if (existingRow) {
      const prior = sheet.getRange(existingRow, 1, 1, 12).getDisplayValues()[0];
      if (prior[3] !== payload.type || prior[10] !== 'Terminée' || !/^WebApp/.test(prior[11]))
        throw Error('Modification refusée : ce retour historique ne provient pas de la WebApp');
    }
    const existing = !!existingRow;
    const values = [id, weekOf_(date), date, payload.type, duration, distance,
      rpe, str_(payload.breath, 100), yesNo_(payload.pain), str_(payload.note, 500),
      'Terminée', 'WebApp', '', 'Non concerné', run ? 'P-COURSE-2026' : 'P-VELO-ESPIENS-2027',
      today_(), secsRun, secsWalk, rounds, runTotal, walkTotal,
      num_(payload.warmup, 0, 120, true), num_(payload.cooldown, 0, 120, true),
      str_(payload.planStep, 30)];
    if (extended) values.push(elevation, averageSpeed);
    upsert_(sheet, id, values);
    return { ok: true, id, updated: existing };
  });
}

function saveReview(payload) {
  if (!payload) throw Error('Bilan vide');
  const week = str_(payload.week, 32);
  if (!/^\d{4}-W\d{2}$/.test(week)) throw Error('Semaine invalide');
  const id = 'BIL-APP-' + week;
  return withLock_(() => {
    const sheet = requireColumns_('07_Bilans', ['Bilan_ID', 'Semaine', 'Renfo A', 'Renfo B', 'Vélo', 'Course', 'Marche min', 'Fatigue 1-10', 'Sommeil 1-10', 'Satisfaction 1-10', 'Retour libre', 'Semaine suivante', 'Date bilan']);
    upsert_(sheet, id, [id, week, '', '', '', '', '',
      num_(payload.fatigue, 0, 10, true), num_(payload.sleep, 0, 10, true),
      num_(payload.satisfaction, 0, 10, true), str_(payload.note, 1200),
      str_(payload.next, 600), today_()]);
    return {ok:true,id};
  });
}

function saveMeasurement(payload) {
  if (!payload) throw Error('Mesure vide');
  const id = validKey_(payload.id, 120);
  const date = isoDate_(payload.date);
  const weight = num_(payload.weight, 20, 250, false);
  return withLock_(() => {
    const sheet = requireColumns_('12_Mesures', ['Mesure_ID', 'Date_mesure', 'Taille_cm', 'Poids_kg', 'Tour_taille_cm', 'Tour_hanches_cm', 'Énergie_1_10', 'Notes', 'Origine', 'Confidentialité']);
    upsert_(sheet, id, [id, date, '', weight, '', '', '',
      str_(payload.note, 300), 'WebApp', 'Privé']);
    return {ok:true,id};
  });
}
