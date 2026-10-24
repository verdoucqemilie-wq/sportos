const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const ROOT=path.join(__dirname,'..');
const names={
 '01_Profil':['Champ','Valeur'],
 '02_Objectifs':['ID','Axe','Résultat visé','Précision','Statut'],
 '11_Programmes':['Programme_ID','Version','Séance','Activité','Statut','Objectifs_ID'],
 '03_Programme':['Version','Semaine','Séance','Ordre','Exercice_ID','Nom','Séries','Rép_min','Rép_max','Temps_s','Charge_kg indicative','Tempo','Sécurité','Progression','Objectifs_ID','Programme_ID','Statut'],
 '04_Seances':['Seance_ID','Semaine','Date','Type','Statut','Durée prévue min','Durée réelle min','Effort global 1-10','Énergie avant','Énergie après','Notes','Origine'],
 '05_Exercices_Log':['Log_ID','Seance_ID','Exercice_ID','Exercice','Séries réelles','Rép réelles','Charge réelle kg','Maintien réel s','Difficulté','RIR','Douleur','Localisation','Note','Origine'],
 '06_Cardio':['Cardio_ID','Semaine','Date','Type','Durée min','Distance km','Effort 1-10','Aisance respiratoire','Douleur','Note','Statut','Origine','ID_externe','Statut_import','Programme_ID','Date_import','Course_sec_bloc','Marche_sec_bloc','Nb_blocs','Course_totale_min','Marche_totale_min','Echauffement_reel_min','Retour_calme_reel_min','Séance_plan_ID'],
 '07_Bilans':['Bilan_ID','Semaine','Renfo A','Renfo B','Vélo','Course','Marche min','Fatigue 1-10','Sommeil 1-10','Satisfaction 1-10','Retour libre','Semaine suivante','Date bilan'],
 '08_Coaching':['Conseil_ID','Date','Type','Exercice_ID','Déclencheur','Recommandation','Priorité','Statut','Validation','Révision'],
 '14_Cardio_Progression':['Plan_ID','Type','Séance_no','Période / cycle','Statut','Blocs'],
 '12_Mesures':['Mesure_ID','Date_mesure','Taille_cm','Poids_kg','Tour_taille_cm','Tour_hanches_cm','Énergie_1_10','Notes','Origine','Confidentialité']
};
const fixture=JSON.parse(fs.readFileSync(path.join(ROOT,'docs','demo-data.js'),'utf8').split('window.__SPORTOS_FIXTURE__=')[1].replace(/;\s*$/,''));
const map={'01_Profil':fixture.profile,'02_Objectifs':fixture.goals,'11_Programmes':fixture.programs,'03_Programme':fixture.exercises,'04_Seances':fixture.sessions,'05_Exercices_Log':fixture.logs,'06_Cardio':fixture.cardio,'07_Bilans':fixture.reviews,'08_Coaching':fixture.advice,'14_Cardio_Progression':fixture.steps,'12_Mesures':fixture.measurements};
const tables={};for(const [sheet,keys] of Object.entries(names))tables[sheet]=[keys,...map[sheet].map(x=>keys.map(k=>x[k]??''))];
class MockSheet{
 constructor(name){this.name=name;}getName(){return this.name;}getLastRow(){return tables[this.name].length;}
 getLastColumn(){return Math.max(names[this.name].length,tables[this.name][0].filter(v=>v!==''&&v!==undefined).length);}
 getRange(row,col,n=1,w=1){const display=()=>Array.from({length:n},(_,i)=>Array.from({length:w},(_,j)=>String(tables[this.name][row-1+i]?.[col-1+j]??'')));
 return {getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:w},(_,j)=>tables[this.name][row-1+i]?.[col-1+j]??'')),getDisplayValues:display,getDisplayValue:()=>display()[0][0],setValues:(data)=>{assert.equal(data.length,n);for(let i=0;i<n;i++){if(!tables[this.name][row-1+i])tables[this.name][row-1+i]=[];for(let j=0;j<w;j++)tables[this.name][row-1+i][col-1+j]=data[i][j];}}};}
}
const ctx={SpreadsheetApp:{openById:()=>({getSheetByName:n=>names[n]?new MockSheet(n):null})},LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},Utilities:{formatDate:(d,tz,f)=>d.toISOString().slice(0,10)},HtmlService:{},Date,console};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(ROOT,'src','Code.gs'),'utf8'),ctx);
const report=[];function test(label,fn){try{fn();report.push('PASS '+label)}catch(e){report.push('FAIL '+label+': '+e.stack);process.exitCode=1}}
test('Bootstrap required collections',()=>{let x=ctx.getBootstrap();assert.equal(x.exercises.length,10);assert.equal(x.cardio.length,1);assert.equal(x.programs.length,4)});
test('Reject invalid dates',()=>{assert.throws(()=>ctx.saveCardio({id:'TEST-CARDIO-001',type:'Course',date:'2026-02-31',duration:16,effort:2.5}),/Date invalide/)});
test('Reject oversize session',()=>{assert.throws(()=>ctx.saveCardio({id:'TEST-CARDIO-001',type:'Course',date:'2026-10-19',duration:10,effort:2.5,runSeconds:60,walkSeconds:60,rounds:8}),/Intervalles/)});
test('Correct ISO weeks across date boundaries',()=>{assert.equal(ctx.weekOf_('2026-10-19'),'2026-W43');assert.equal(ctx.weekOf_('2026-12-31'),'2026-W53');assert.equal(ctx.weekOf_('2027-01-01'),'2026-W53');});
test('Localized comma decimal input accepted',()=>{assert.equal(ctx.num_('2,5',0,10,false),2.5)});
test('Save cardio + retry is idempotent',()=>{const p={id:'TEST-CARDIO-001',type:'Course',date:'2026-10-19',duration:16,effort:2.5,runSeconds:60,walkSeconds:60,rounds:8,note:'ok'};ctx.saveCardio(p);ctx.saveCardio(p);assert.equal(tables['06_Cardio'].length,3);assert.equal(tables['06_Cardio'][2][19],8);assert.equal(tables['06_Cardio'][2][1],'2026-W43')});
test('Save strength + update same id without duplicate',()=>{const p={id:'TEST-STRENGTH-001',type:'A',date:'2026-10-19',week:'2026-W43',exercises:[{id:'EX-SQUAT',sets:2,reps:12,weight:5,difficulty:'Modéré',pain:'Non',rir:3}]};ctx.saveStrength(p);p.exercises[0].reps=13;ctx.saveStrength(p);assert.equal(tables['04_Seances'].length,4);assert.equal(tables['05_Exercices_Log'].length,4);assert.equal(tables['05_Exercices_Log'][3][5],13);assert.equal(tables['04_Seances'][3][1],'2026-W43')});
test('Reject strength unknown exercise',()=>{assert.throws(()=>ctx.saveStrength({id:'TEST-STRENGTH-002',type:'A',date:'2026-10-19',exercises:[{id:'ROGUE'}]}),/non conformes/)});
test('Save review + idempotent overwrite',()=>{ctx.saveReview({week:'2026-W43',fatigue:3,satisfaction:8,note:'Une bonne semaine'});ctx.saveReview({week:'2026-W43',fatigue:2,satisfaction:9,note:'Meilleure semaine'});assert.equal(tables['07_Bilans'].length,2);assert.equal(tables['07_Bilans'][1][7],2)});
test('Reject schema drift before writing rows',()=>{const hdr=tables['06_Cardio'][0];const saved=hdr[4];hdr[4]='broken';const before=tables['06_Cardio'].length;assert.throws(()=>ctx.saveCardio({id:'TEST-CARDIO-002',type:'Vélo',date:'2026-10-19',duration:35,effort:3}),/Structure modifiée/);assert.equal(tables['06_Cardio'].length,before);hdr[4]=saved;});
test('Gainage en secondes en réserve sans RIR : colonne additionnelle protégée',()=>{
 const p={id:'TEST-STRENGTH-GAIN-01',type:'B',date:'2026-10-19',
  exercises:[{id:'EX-GAINAGE',sets:2,seconds:40,secondsReserve:12,difficulty:'Modéré',pain:'Non'}]};
 ctx.saveStrength(p);ctx.saveStrength(p);
 const logs=tables['05_Exercices_Log'];const row=logs.find(x=>x[0]==='TEST-STRENGTH-GAIN-01_EX-GAINAGE');
 assert(row);assert.equal(row[9],'');assert.equal(row[14],12);
 assert.equal(logs[0][14],'Réserve tenue (s)');
 assert.equal(logs.filter(x=>x[0]==='TEST-STRENGTH-GAIN-01_EX-GAINAGE').length,1);
});
test('Vélo depuis Strava : dénivelé, vitesse et rejeu sans doublon',()=>{
 const p={id:'TEST-BIKE-20261019',type:'Vélo',date:'2026-10-19',duration:42,
  distance:12.4,effort:3,pain:'Non',elevationGain:'245',averageSpeed:'17,8'};
 ctx.saveCardio(p);ctx.saveCardio(p);
 const sheet=tables['06_Cardio'],row=sheet.find(x=>x[0]===p.id);
 assert(row);assert.equal(row[24],245);assert.equal(row[25],17.8);
 assert.equal(sheet[0][24],'Dénivelé positif (m)');
 assert.equal(sheet[0][25],'Vitesse moyenne (km/h)');
 assert.equal(sheet.filter(x=>x[0]===p.id).length,1);
});
test('Refuser métriques vélo hors limites sans aucune écriture',()=>{
 const before=tables['06_Cardio'].length;
 assert.throws(()=>ctx.saveCardio({id:'TEST-BIKE-HIGH-01',type:'Vélo',date:'2026-10-19',duration:40,effort:3,elevationGain:-1}),/Valeur/);
 assert.throws(()=>ctx.saveCardio({id:'TEST-BIKE-HIGH-02',type:'Vélo',date:'2026-10-19',duration:40,effort:3,averageSpeed:200}),/Valeur/);
 assert.equal(tables['06_Cardio'].length,before);
});
test('V0.9 cardio edit preserves recorded metadata and warmup',()=>{
 const p={id:'TEST-BIKE-META-001',type:'Vélo',date:'2026-10-19',duration:40,effort:4,
   distance:10.5,pain:'Non',note:'Avant correction',planStep:'BIKE-03'};
 ctx.saveCardio(p);
 const row=tables['06_Cardio'].find(x=>x[0]===p.id);
 row[7]='Respiration facile'; row[12]=''; row[13]='Non concerné';
 row[15]='2026-10-19'; row[21]=7; row[22]=5; row[23]='BIKE-03';
 ctx.saveCardio({...p,note:'Après correction',effort:3,duration:41,planStep:'BIKE-01'});
 const fresh=tables['06_Cardio'].filter(x=>x[0]===p.id);
 assert.equal(fresh.length,1,'Une modification ne doit pas créer un doublon');
 assert.equal(fresh[0][9],'Après correction');
 assert.equal(fresh[0][6],3);
 assert.equal(fresh[0][7],'Respiration facile','Aisance respiratoire conservée');
 assert.equal(fresh[0][15],'2026-10-19','Date d’import initiale conservée');
 assert.equal(fresh[0][21],7,'Ancien échauffement conservé');
 assert.equal(fresh[0][22],5,'Ancien retour au calme conservé');
 assert.equal(fresh[0][23],'BIKE-03','Étape initiale conservée');
});
test('V0.9 unauthorized edit cannot create optional headers',()=>{
 const sheet=tables['06_Cardio'],headers=sheet[0];
 const row=sheet.find(x=>x[0]==='TEST-BIKE-META-001');
 const origin=row[11],h24=headers[24],h25=headers[25];
 try{
  row[11]='Déclaré'; headers[24]='';headers[25]='';
  const before=JSON.stringify(row);
  assert.throws(()=>ctx.saveCardio({
    id:'TEST-BIKE-META-001',type:'Vélo',date:'2026-10-19',duration:45,
    effort:3,elevationGain:175,averageSpeed:15
  }),/Modification refusée/);
  assert.equal(headers[24],'');assert.equal(headers[25],'');
  assert.equal(JSON.stringify(row),before,'Pas de mutation d’une séance non modifiable');
 }finally{row[11]=origin;headers[24]=h24;headers[25]=h25}
});
test('Save measurement',()=>{ctx.saveMeasurement({id:'TEST-MEASURE-001',date:'2026-10-19',weight:53.1});assert.equal(tables['12_Mesures'].length,3)});
console.log(report.join('\n'));
