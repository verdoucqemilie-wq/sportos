'use strict';
// V0.8 release protocol tests; all snapshots are local and pinned. NO Apps Script/Sheet writes.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const {classify,VERSIONS,FILES}=require('../scripts/classify-deployed-v0.8.cjs');
const root=path.resolve(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sportos-v08-release-'));
let count=0;
const check=(name,test)=>{test();count++;console.log('SPORTOS_V08_'+name+'=PASS')};
function populate(version,js=false){
  for(const name of FILES){
    fs.writeFileSync(path.join(tmp,js&&name==='Code.gs'?'Code.js':name),
      cp.execFileSync('git',['show',version.ref+':src/'+name],{cwd:root,maxBuffer:6e6}));
  }
}
try{
  for(const version of VERSIONS){
    check('SNAPSHOT_'+version.label,()=>{populate(version);assert.equal(classify(tmp,root),version.label)});
    check('CLASP_JS_'+version.label,()=>{
      fs.rmSync(path.join(tmp,'Code.gs'));
      populate(version,true);
      assert.equal(classify(tmp,root),version.label);
      fs.rmSync(path.join(tmp,'Code.js'));
    });
  }
  check('REJECT_CODE_CHANGED',()=>{
    populate(VERSIONS[0]);fs.appendFileSync(path.join(tmp,'Code.gs'),'\n// changed remote code');
    assert.equal(classify(tmp,root),'INCONNU');
  });
  check('REJECT_UNKNOWN_FILE',()=>{
    populate(VERSIONS[0]);fs.writeFileSync(path.join(tmp,'Other.gs'),'unsanctioned');
    assert.equal(classify(tmp,root),'INCONNU');fs.rmSync(path.join(tmp,'Other.gs'));
  });
  check('REJECT_MANIFEST_PUBLIC',()=>{
    populate(VERSIONS[0]);
    const filename=path.join(tmp,'appsscript.json');
    const manifest=JSON.parse(fs.readFileSync(filename,'utf8'));manifest.webapp.access='ANYONE';
    fs.writeFileSync(filename,JSON.stringify(manifest));
    assert.equal(classify(tmp,root),'INCONNU');
  });
  const script=fs.readFileSync(path.join(root,'scripts/publier-v0.8-cloud-shell.sh'),'utf8');
  check('EXPECTED_DEPLOYMENT_ID',()=>assert(script.includes('AKfycbx9CoVk8WioZ2a_IJl4CwBk6Mk23lLEf_9yJY_g-NBJ8Zxzog7TyXaoPAxS02PeOxZYCw')));
  check('ACCOUNT_PRIVATE_AND_SCOPE',()=>{
    assert(script.includes('clasp show-authorized-user'));
    assert(script.includes('logged in as verdoucqemilie@gmail.com.'));
    assert(script.includes('manifest.webapp.access,\'MYSELF\''));
    assert(script.includes('manifest.webapp.executeAs,\'USER_DEPLOYING\''));
  });
  check('PINNED_AND_TARGETED',()=>{
    assert(script.includes('classify-deployed-v0.8.cjs'));
    assert(script.includes('git show 27e655ad4127292a6c55f523c5bbed05ea3b5893:src/Code.gs'));
    assert(script.includes('clasp create-deployment --deploymentId "$DEPLOYMENT"'));
    assert(!/^\s*clasp\s+delete-deployment\b/m.test(script));
    assert(!/^\s*clasp\s+create-script\b/m.test(script));
  });
  check('BLOCK_UNKNOWN_HEAD',()=>{
    assert(script.includes('SPORTOS_CODE_DISTANT_HEAD='));
    assert(script.includes('V0_7|V0_8) :;;'));
    assert(script.includes('STOP : code Apps Script HEAD inconnu'));
    assert(script.includes('[[ "$(snapshot_label "$TMP/verify")" == "V0_8" ]]'));
  });
  check('IMMUTABLE_BEFORE_AND_AFTER',()=>{
    assert(script.includes('clasp pull --versionNumber "$PREVIOUS_VERSION"'));
    assert(script.includes('clasp pull --versionNumber "$NEW_VERSION"'));
    assert(script.includes('[[ "$(target_version "$NOW")" == "$PREVIOUS_VERSION" ]]'));
  });
  check('NO_SHEET_MIGRATION',()=>{
    assert(!/SpreadsheetApp\.|sheets\.(?:update|append|batchUpdate)|SpreadsheetApp\.openById/.test(script));
    assert(script.includes('npm run verify'));
  });
  console.log('SPORTOS_V08_RELEASE_QA=PASS; CASES='+count+'; REMOTE_WRITES=0');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
