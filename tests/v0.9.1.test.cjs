'use strict';
// V0.9.1 week model tests using synthetic completed S1; no Google data or APIs.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/Client.html'),'utf8');
const model=source.match(/\n  function homeModel\(data\) \{[\s\S]*?(?=\n  \/\/ V0\.8:)/);
const adapt=source.match(/\n  function so8WeeklyPlan\(type, weekStart\)\{[\s\S]*?(?=\n  function so8CompletionBanner\(\))/);
const cycle=source.match(/\n  const so91Types=\['A','B','Course','Vélo'\];[\s\S]*?(?=\n  function program\(\))/);
assert(model&&adapt&&cycle,'Expected isolated week model functions missing');
const S={data:{
  today:'2026-10-24',
  sessions:[
    {Seance_ID:'HIST-A',Type:'A',Statut:'Terminée',Date:'',Origine:'Déclaré'},
    {Seance_ID:'S1-A',Type:'A',Statut:'Terminée',Date:'2026-10-20','Effort global 1-10':'4',Origine:'WebApp'},
    {Seance_ID:'S1-B',Type:'B',Statut:'Terminée',Date:'2026-10-23','Effort global 1-10':'4',Origine:'WebApp'}
  ],cardio:[
    {Cardio_ID:'S1-RUN',Type:'Course',Statut:'Terminée',Date:'2026-10-19','Effort 1-10':'2,5',Douleur:'Non renseignée',Course_sec_bloc:'60',Marche_sec_bloc:'60',Nb_blocs:'8'},
    {Cardio_ID:'S1-BIKE',Type:'Vélo',Statut:'Terminée',Date:'2026-10-22','Effort 1-10':'6',Douleur:'Non','Durée min':'38'}
  ],
  logs:[{Seance_ID:'HIST-A',Exercice_ID:'EX-RDL',Douleur:'Oui'}],reviews:[],
  exercises:[]
},programWeek:undefined};
const ctx={S,Date,toNum:v=>Number(String(v??0).replace(',','.')),niceDate:s=>s,activeEx:()=>[]};
vm.createContext(ctx);vm.runInContext(model[0]+'\n'+adapt[0]+'\n'+cycle[0]+'\nthis.cycle=so91Cycle;this.plan=so8WeeklyPlan;this.entries=so91Entries;',ctx);
let n=0;const test=(label,fn)=>{fn();n++;console.log('SPORTOS_V091_'+label+'=PASS')};
test('FOUR_ACTIVITIES_FROM_DATED_WEEK',()=>{const v=ctx.cycle();assert.equal(v.anchor,'2026-10-19');assert.equal(v.weeks[0].done.length,4);assert.equal(v.selected,1);assert.equal(v.week.start,'2026-10-26');assert.equal(v.week.done.length,0)});
test('PAST_AND_FUTURE_SEPARATED',()=>{const v=ctx.cycle();assert.equal(v.weeks[0].rows.length,4);assert.equal(v.weeks[2].rows.length,0);assert.equal(v.weeks[3].rows.length,0);assert.equal(v.weeks[2].status,'À venir')});
test('BIKE_NOT_FORCE_PROGRESSED',()=>{const p=ctx.plan('Vélo','2026-10-26');assert(p.hasPrior);assert.equal(p.proposed,'');assert.match(p.reason,/confort|récupération/i)});
test('RUN_UNKNOWN_PAIN_NOT_PROGRESSED',()=>{const p=ctx.plan('Course','2026-10-26');assert(p.hasPrior);assert.equal(p.proposed,'');assert.match(p.reason,/Douleur non renseignée/)});
test('FUTURE_WEEKS_CONDITIONAL',()=>{assert.equal(ctx.plan('A','2026-11-02').hasPrior,false);assert.equal(ctx.plan('Course','2026-11-09').hasPrior,false)});
test('USER_CAN_VIEW_HISTORIC_WEEK',()=>{S.programWeek=0;assert.equal(ctx.cycle().week.start,'2026-10-19');assert.equal(ctx.cycle().week.done.length,4)});
test('AFTER_DATE_ROLLOVER_S2_CURRENT',()=>{S.data.today='2026-10-26';S.programWeek=undefined;assert.equal(ctx.cycle().selected,1);assert.equal(ctx.cycle().week.isCurrent,true)});
const noText=['TA SEMAINE / OBJECTIFS RÉALISÉS','Le bouton ouvre ton journal : il ne démarre pas de chronomètre.'];
test('REDUNDANT_COPY_REMOVED',()=>noText.forEach(x=>assert(!source.includes(x))));
test('OFFICIAL_ICON_EMBEDDED',()=>assert(source.includes("B:'<path d=\"M12.409 13.017")));
console.log('SPORTOS_V091_MODEL=PASS; CASES='+n+'; REAL_WRITES=0');
