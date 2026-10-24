'use strict';
// SportOS V0.9 acceptance checks on the source code only. No API, Sheet or deployment calls.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const client=read('src/Client.html');
const server=read('src/Code.gs');
const styles=read('src/Styles.html');
let count=0;
function check(label,fn){fn();count++;console.log('SPORTOS_V09_'+label+'=PASS')}
check('SYNTAX',()=>{
  new Function(client.replace(/^\s*<script>/,'').replace(/<\/script>\s*$/,''));
  new Function(server);
});
check('HOME_BANNER_REMOVED',()=>{
  const home=client.split('function home()')[1].split('function program()')[0];
  assert(!home.includes('so8CompletionBanner()'));
  assert(home.includes('v3-week-panel'));
  assert(client.split('function program()')[1].includes('so8CompletionBanner()'));
});
check('MOBILE_DESKTOP_TABLET',()=>{
  assert(styles.includes('@container sportmain (max-width:1150px)'));
  assert(styles.includes('@container sportmain (max-width:720px)'));
  assert(styles.includes('@media(max-width:767px)'));
  assert(styles.includes('@media(min-width:768px) and (max-width:1180px)'));
  assert(styles.includes('@media(max-width:420px)'));
  assert(styles.includes('@media(prefers-reduced-motion:reduce)'));
});
check('BRAND_AND_ICON',()=>{
  assert(client.includes('so9-challenge-graphic'));
  assert(client.includes("pencil:'<path"));
  assert(client.includes('so9-challenge-bike'));
  assert(client.includes("B:'<path d=\"M12.409"));
  assert(client.includes("currentEntry?'Modifier mon retour':'Enregistrer mon retour'"));
});
check('EXERCISE_INSTRUCTIONS',()=>{
  for(const id of ['EX-SQUAT','EX-HIP','EX-FENTE','EX-ROW-APPUI','EX-DEADBUG','EX-PONT-1J','EX-POMPE','EX-EPAULE','EX-CURL','EX-GAINAGE']){
    assert(client.includes("'"+id+"':["),'Missing exercise guide '+id);
  }
  assert(client.includes('Comment réaliser ce mouvement'));
  assert(client.includes('so9-journal-guide'));
});
check('FOUR_SPORT_WARMUP_COOLDOWN',()=>{
  for(const type of ['A','B','Course',"'Vélo'"]){assert(client.includes(type+':{warm:'))}
  assert(client.includes("so9Prep(type,'warm')"));
  assert(client.includes("so9Prep(type,'cool')"));
  assert(styles.includes('.so9-routine'));
});
check('PREFILL_STRENGTH_CARDIO',()=>{
  assert(client.includes('function strengthForm(type,recordId)'));
  assert(client.includes('function cardioForm(type,recordId)'));
  assert(client.includes('const prefill=saved?'));
  assert(client.includes("saved?saved.Seance_ID:key()"));
  assert(client.includes("saved?saved.Cardio_ID:key()"));
  assert(client.includes('opts.prefill'));
  assert(client.includes('form.elements.namedItem(name)'));
  assert(client.includes("opts.edit?'Enregistrer les modifications'"));
});
check('SAFE_EDITS',()=>{
  assert(server.includes('existingSessionRow'));
  assert(server.includes('existingRow'));
  assert(server.includes("Modification refusée : ce retour historique ne provient pas de la WebApp"));
  assert(server.includes('if (x.isTimed && oldRow)'));
  assert(server.includes("priorLog[5]"));
  assert(server.includes("priorLog[9]"));
  assert(!client.includes('SpreadsheetApp.'));
});
console.log('SPORTOS_V09_ACCEPTANCE=PASS; CASES='+count+'; REAL_WRITES=0');
