'use strict';
// SportOS V0.3 — QA selectors/shell. Exécution isolée, sans Google Sheets.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const cli=fs.readFileSync(root+'/src/Client.html','utf8');
const idx=fs.readFileSync(root+'/src/Index.html','utf8');
const css=fs.readFileSync(root+'/src/Styles.html','utf8');

const modelSource=cli.match(/\n  function homeModel\(data\) \{[\s\S]*?(?=\n  \/\/ V0\.8:)/);
const homeSource=cli.match(/\n  function home\(\) \{[\s\S]*?(?=\n  function program\(\))/);
const iconSource=cli.match(/\n  function v3Icon\(type\)\s*\{[\s\S]*?(?=\n  function homeModel\(data\))/);
const adaptiveSource=cli.match(/\n  function so8WeeklyPlan\(type\)\{[\s\S]*?(?=\n  function home\(\))/);
assert.ok(adaptiveSource,'Fonctions V0.8 absentes');
for(const [name,s] of [['homeModel',modelSource],['home',homeSource],['v3Icon',iconSource]])
  assert.ok(s,'Fonction '+name+' introuvable');
const evaluate=(src,ctx)=>vm.runInNewContext('('+src[0].trim()+')',ctx);
const model=evaluate(modelSource,{});
const icon=evaluate(iconSource,{});
const format=n=>Number(n||0).toLocaleString('fr-FR',{maximumFractionDigits:1});
const num=x=>Number(String(x||0).replace(',','.'));
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const niceDate=s=>{const x=new Date(s+'T12:00:00');return x.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})};

function fixture({today='2026-10-20',sessions=[],cardio=[],logs=[],reviews=[]}={}){
 return {today,sessions,cardio,logs,reviews};
}
const oldA={Type:'A',Statut:'Terminée',Date:'',Seance_ID:'STR-S1-A'};
const oldB={Type:'B',Statut:'Terminée',Date:'',Seance_ID:'STR-S1-B'};
const run={Type:'Course',Statut:'Terminée',Date:'2026-10-19','Durée min':'16','Effort 1-10':'2,5'};
const base=fixture({sessions:[oldA,oldB],cardio:[run],logs:[{Douleur:'Oui'}]});
const m=model(base);
assert.equal(m.done.length,1,'Course = une activité de cette semaine');
assert.equal(m.done[0],'Course');
assert.equal(m.next,'A');
assert.equal(m.totals.strength,2);
assert.equal(m.totals.cardio,1);
assert.equal(m.last.Type,'Course');
assert.equal(m.pain,true);

function render(data){
  const modelFor=data=>model(data);
  const ctx={S:{data},homeModel:modelFor,v3Icon:icon,esc,fmt:format,toNum:num,niceDate,
    activeEx:()=>[]};
  vm.runInNewContext(adaptiveSource[0],ctx);
  return evaluate(homeSource,ctx)();
}
const current=render(base);
for(const s of ['v3-dashboard','v3-feature','v3-week-panel','v3-coach','v3-checkin','Espiens','data-open-program="A"'])
 assert.ok(current.includes(s),'Bloc manquant: '+s);
assert.match(current,/aria-valuenow="1"/);
assert.match(current,/2,5/);
assert.match(current,/douleurs ont été signalées/);
assert.match(current,/Dernier mouvement|DERNIER MOUVEMENT/);
assert.doesNotMatch(current,/NaN/);
assert.match(current,/so-icon-Course/,'Icône course absente');
assert.match(current,/so-icon-route/,'Icône route vers Espiens absente');
assert.match(current,/so-icon-sparkle/,'Icône coaching absente');
assert.match(current,/so-icon-arrow/,'Flèches de navigation unifiées absentes');
assert.match(current,/v3-challenge-title">En route vers <em>Espiens\.<\/em>/,'Titre du défi vélo V0.9 absent');
assert.ok(!current.includes('ESPIENS<span>'),'Ancien titre massif en capitales');
assert.match(css,/so-home-reveal/,'Transition d’entrée absente');
assert.match(css,/prefers-reduced-motion:reduce/,'Mode réduit absent');


const zero=render(fixture());
assert.match(zero,/aria-valuenow="0"/);
assert.match(zero,/Ta première séance datée/);
assert.match(zero,/Enregistrer une activité/);

const doubleRun=fixture({cardio:[run,{...run,Date:'2026-10-20','Effort 1-10':'3'}]});
assert.equal(model(doubleRun).done.length,1,'Deux courses ne valent pas 2/4');

const newerStrength=fixture({sessions:[{Type:'B',Statut:'Terminée',Date:'2026-10-20','Durée réelle min':'39','Effort global 1-10':'4'}],cardio:[run]});
assert.equal(model(newerStrength).last.Type,'B','La dernière activité inclut les renforcements');
assert.match(render(newerStrength),/Renforcement B/);
assert.match(render(newerStrength),/39/);

const all=fixture({sessions:[{Type:'A',Statut:'Terminée',Date:'2026-10-19'},{Type:'B',Statut:'Terminée',Date:'2026-10-20'}],
cardio:[run,{Type:'Vélo',Statut:'Terminée',Date:'2026-10-20','Durée min':'25'}]});
assert.equal(model(all).done.length,4);
assert.equal(model(all).next,null);
assert.match(render(all),/aria-valuenow="4"/);
assert.match(render(all),/BRAVO/);

const sunday=fixture({today:'2026-10-25',cardio:[run]});
assert.equal(model(sunday).done.length,1);
const monday=fixture({today:'2026-10-26',cardio:[run]});
assert.equal(model(monday).done.length,0,'La course de la semaine précédente ne remonte pas');
const boundary=fixture({today:'2027-01-01',sessions:[{Type:'A',Date:'2026-12-28',Statut:'Terminée'}],reviews:[{Semaine:'2026-W53'}]});
assert.equal(model(boundary).done.length,1,'Passage nouvelle année');
assert.equal(model(boundary).isAppReview,true,'ISO week à cheval sur deux années');

const withReview=fixture({today:'2026-10-20',reviews:[{Semaine:'2026-W43'}]});
assert.equal(model(withReview).isAppReview,true);
assert.match(render(withReview),/Ton bilan est enregistré/);

assert.ok(idx.includes('id="quick-root"')&&idx.includes('data-quick-log'),'Quick action globale absente');
assert.ok(idx.includes('data-nav="home"')&&idx.includes('v3-mobile-nav'),'Navigation mobile absente');
assert.ok(cli.includes('function openQuickLog()')&&cli.includes('openLog(type)'),'Quick log non fonctionnel');
assert.ok(cli.includes("b.setAttribute('aria-current','page')"),'État nav accessible absent');
assert.ok(css.includes('v3-feature')&&css.includes('@media(max-width:760px)'),'Design responsive absent');
assert.ok(!idx.includes('data-search')&&!idx.includes('data-notifications'),'Contrôle inerte non souhaité');

console.log('V0_3_SHELL_HOME_QA=PASS');
console.log('SCENARIOS=9 ; DATA_SHEET_WRITES=0');
