'use strict';
// Diagnostic acceptance: pure local snapshots from pinned git history.
// Never connects to Apps Script, never writes sporting data.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const cp=require('node:child_process');
const {diagnose,format}=require('../scripts/diagnostic-readonly-v0.7.cjs');
const {FILES,VERSIONS}=require('../scripts/classify-deployed-v0.7.cjs');
const repo=path.resolve(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sportos-diagnostic-test-'));
function load(ref){
 for(const f of FILES)fs.writeFileSync(path.join(tmp,f),cp.execFileSync('git',['show',ref+':src/'+f],{cwd:repo}));
}
let count=0;
const check=(fn,label)=>{fn();count++;console.log('DIAG_'+label+'=PASS')};
try{
 for(const v of VERSIONS){
   check(()=>{
     load(v.ref);
     const d=diagnose(tmp,repo);
     assert.equal(d.snapshot,v.label);
     assert.equal(d.extraFiles,0);
     assert.equal(d.missingFiles,0);
     assert.equal(d.privateManifest,'OUI');
     for(const x of d.files)assert(x.matching.includes(v.label),x.name+' should match '+v.label);
     const out=format(d,'TEST_'+v.label);
     assert(out.includes('SOURCE_EXPOSEE=NON')&&out.includes('APPS_SCRIPT_WRITE=NON'));
     assert(!out.includes('function '));
     assert(!out.includes('1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ'));
   },'KNOWN_'+v.label);
 }
 for(const v of VERSIONS){
   check(()=>{
     load(v.ref);
     fs.renameSync(path.join(tmp,'Code.gs'),path.join(tmp,'Code.js'));
     const d=diagnose(tmp,repo);
     assert.equal(d.snapshot,v.label,'Clasp alias must classify as '+v.label);
     assert.equal(d.extraFiles,0);
     assert.equal(d.missingFiles,0);
     assert.equal(d.backendPulledExtension,'JS_PAR_CLASP');
     assert(d.files.find(x=>x.name==='BACKEND').matching.includes(v.label));
     fs.renameSync(path.join(tmp,'Code.js'),path.join(tmp,'Code.gs'));
   },'CLASP_JS_'+v.label);
 }
 check(()=>{
   load(VERSIONS[0].ref);
   fs.copyFileSync(path.join(tmp,'Code.gs'),path.join(tmp,'Code.js'));
   const d=diagnose(tmp,repo);
   assert.equal(d.snapshot,'INCONNU');
   assert.equal(d.extraFiles,1);
   fs.rmSync(path.join(tmp,'Code.js'));
 },'DUPLICATE_BACKEND_REJECTED');
 check(()=>{
   load(VERSIONS[0].ref);
   fs.appendFileSync(path.join(tmp,'Styles.html'),'\n/* UNKNOWN CSS */');
   const d=diagnose(tmp,repo);
   assert.equal(d.snapshot,'INCONNU');
   assert.deepEqual(d.files.find(x=>x.name==='STYLES').matching,[]);
   assert(d.files.find(x=>x.name==='BACKEND').matching.includes('V0_7'));
 },'CSS_DIFFERENCE_ONLY');
 check(()=>{
   load(VERSIONS[0].ref);
   fs.writeFileSync(path.join(tmp,'Another.gs'),'sensitive source');
   const d=diagnose(tmp,repo);
   assert.equal(d.snapshot,'INCONNU');
   assert.equal(d.extraFiles,1);
   assert(!format(d,'TEST').includes('Another.gs'));
   assert(!format(d,'TEST').includes('sensitive source'));
   fs.rmSync(path.join(tmp,'Another.gs'));
 },'EXTRA_FILE_PRIVATE');
 check(()=>{
   load(VERSIONS[0].ref);
   fs.rmSync(path.join(tmp,'Client.html'));
   const d=diagnose(tmp,repo);
   assert.equal(d.missingFiles,1);
   assert.equal(d.files.find(x=>x.name==='FRONTEND').present,false);
   assert(format(d,'TEST').includes('MATCH_FRONTEND=ABSENT'));
 },'MISSING_FILE');
 check(()=>{
   load(VERSIONS[0].ref);
   const manifest=JSON.parse(fs.readFileSync(path.join(tmp,'appsscript.json'),'utf8'));
   manifest.webapp.access='ANYONE';
   fs.writeFileSync(path.join(tmp,'appsscript.json'),JSON.stringify(manifest));
   const d=diagnose(tmp,repo);
   assert.equal(d.privateManifest,'NON');
   assert.equal(d.snapshot,'INCONNU');
 },'PRIVATE_CONFIG_CHANGED');
 const shell=fs.readFileSync(path.join(repo,'scripts/diagnostiquer-deploiement-v0.7.sh'),'utf8');
 check(()=>{
   assert(shell.includes('clasp pull --versionNumber "$VERSION"'));
   assert(shell.includes('clasp pull >/dev/null'));
   assert(!/^\s*clasp\s+(push|create-deployment|delete-deployment|deploy)\b/m.test(shell));
   assert(shell.includes('DIAGNOSTIC_READONLY=TERMINE'));
   assert(shell.includes('diagnostic-readonly-v0.7.cjs'));
 },'READONLY_SHELL');
 console.log('SPORTOS_DIAGNOSTIC_V0_7=PASS; CASES='+count+'; REMOTE_WRITES=0');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
