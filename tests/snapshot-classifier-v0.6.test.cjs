'use strict';
// No live API calls. Validate immutable @8 classifier against actual Git history.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {inspect,equivalent,FILES,V05_COMMIT,V06_COMMIT}=require('../scripts/classify-deployed-v0.6.cjs');
const root=path.resolve(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sportos-snapshot-test-'));
function populate(ref){
  for(const file of FILES){
    const content=execFileSync('git',['show',ref+':src/'+file],{cwd:root});
    fs.writeFileSync(path.join(tmp,file),content);
  }
}
try{
  populate(V05_COMMIT);
  assert.equal(inspect(tmp,root),'V0_5','Legacy V0.5 must classify as V0_5');
  populate(V06_COMMIT);
  assert.equal(inspect(tmp,root),'V0_6','Pinned V0.6 must be classified accurately');
  fs.appendFileSync(path.join(tmp,'Client.html'),'\n// UNKNOWN CHANGE');
  assert.equal(inspect(tmp,root),'INCONNU','Changed code must stop publication');
  populate(V06_COMMIT);
  fs.writeFileSync(path.join(tmp,'Extra.gs'),'unknown');
  assert.equal(inspect(tmp,root),'INCONNU','Unexpected remote file must stop publication');
  fs.rmSync(path.join(tmp,'Extra.gs'));
  populate(V06_COMMIT);
  const json=JSON.parse(fs.readFileSync(path.join(tmp,'appsscript.json'),'utf8'));
  const reformatted=JSON.stringify(json,null,4)+'\n';
  assert(equivalent(reformatted,fs.readFileSync(path.join(tmp,'appsscript.json')), 'appsscript.json'),'Manifest format only may differ');
  assert(equivalent('a\r\nb\r\n','a\nb\n','Client.html'),'Line endings should not matter');
  assert(!equivalent('a','b','Client.html'),'Code mismatch must be detected');
  console.log('SNAPSHOT_CONTENT_CLASSIFIER_V0_6=PASS');
  console.log('SCENARIOS=8 ; LIVE_SCRIPT_WRITES=0');
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
