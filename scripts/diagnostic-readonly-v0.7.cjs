'use strict';
// SportOS V0.7 deployment diagnostics — report metadata only.
// Does not expose source text, diff hunks, credentials, identifiers or user data.
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const {FILES,VERSIONS,same,classify,PULLED_SCRIPT_ALIAS}=require('./classify-deployed-v0.7.cjs');
const LABELS={ 'Code.gs':'BACKEND', 'Index.html':'SHELL', 'Styles.html':'STYLES', 'Client.html':'FRONTEND', 'appsscript.json':'MANIFEST' };
const NO_MATCH='AUCUNE';
function diagnose(snapshotDir,repoDir){
  const entries=fs.readdirSync(snapshotDir,{withFileTypes:true});
  const actualNames=entries.filter(x=>x.isFile()&&!x.name.startsWith('.')).map(x=>x.name);
  // clasp pull defaults to Code.js; treat it as a canonical Code.gs only if exclusive.
  const backendJs=actualNames.includes(PULLED_SCRIPT_ALIAS)&&!actualNames.includes('Code.gs');
  const canonicalName=name=>backendJs&&name==='Code.gs'?PULLED_SCRIPT_ALIAS:name;
  const unexpected=actualNames.filter(x=>!FILES.includes(x)&&!(backendJs&&x===PULLED_SCRIPT_ALIAS));
  const data={
    type:'SPORTOS_DIAGNOSTIC_READONLY_V1',
    snapshot:classify(snapshotDir,repoDir),
    expectedFiles:FILES.length,
    fileCount:actualNames.length,
    extraFiles:unexpected.length,
    missingFiles:FILES.filter(x=>!actualNames.includes(canonicalName(x))).length,
    backendPulledExtension:backendJs?'JS_PAR_CLASP':actualNames.includes('Code.gs')?'GS':'ABSENTE',
    files:[],
    privateManifest:'INCONNU'
  };
  for(const name of FILES){
    const source=path.join(snapshotDir,canonicalName(name));
    const exists=fs.existsSync(source) && fs.statSync(source).isFile();
    const matching=[];
    if(exists){
      const code=fs.readFileSync(source);
      for(const v of VERSIONS){
        const ref=cp.execFileSync('git',['show',v.ref+':src/'+name],{cwd:repoDir,maxBuffer:6e6});
        if(same(code,ref,name))matching.push(v.label);
      }
    }
    data.files.push({name:LABELS[name],present:exists,matching});
    if(name==='appsscript.json'&&exists){
      try{
        const m=JSON.parse(fs.readFileSync(source,'utf8'));
        data.privateManifest=m.webapp?.access==='MYSELF'&&m.webapp?.executeAs==='USER_DEPLOYING'?'OUI':'NON';
      }catch(_){data.privateManifest='INVALIDE'}
    }
  }
  return data;
}
function format(d,label){
  const lines=[
    'SPORTOS_DIAGNOSTIC='+label,
    'SOURCE_CLASSIFICATION='+d.snapshot,
    'EXPECTED_FILES='+d.expectedFiles,
    'ACTUAL_FILES='+d.fileCount,
    'EXTRA_FILES='+d.extraFiles,
    'MISSING_FILES='+d.missingFiles,
    'OWNER_ONLY_MANIFEST='+d.privateManifest,
    'BACKEND_LOCAL_EXTENSION='+d.backendPulledExtension,
    ...d.files.map(x=>'MATCH_'+x.name+'='+(x.present?(x.matching.length?x.matching.join(','):NO_MATCH):'ABSENT')),
    'SOURCE_EXPOSEE=NON',
    'APPS_SCRIPT_WRITE=NON',
    'GOOGLE_SHEETS_WRITE=NON'
  ];
  return lines.join('\n');
}
if(require.main===module){
  try{
    const [,,snap,repo,label='DISTANT']=process.argv;
    if(!snap||!repo||!/^[A-Z0-9_]{1,24}$/.test(label))throw Error('arguments de diagnostic invalides');
    console.log(format(diagnose(snap,repo),label));
  }catch(err){
    console.error('DIAGNOSTIC_STOP=ECHEC_LEC'+ 'TURE');
    process.exitCode=1;
  }
}
module.exports={diagnose,format};
