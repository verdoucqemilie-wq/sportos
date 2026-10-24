'use strict';
// V0.9 preflight and release contract, fully offline. NO Google Sheets or Apps Script writes.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const {classify,VERSIONS,FILES}=require('../scripts/classify-deployed-v0.9.cjs');
const root=path.resolve(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sportos-v09-deploy-'));
const script=fs.readFileSync(path.join(root,'scripts/publier-v0.9-cloud-shell.sh'),'utf8');
let count=0;
const check=(label,fn)=>{fn();count++;console.log('SPORTOS_V09_RELEASE_'+label+'=PASS')};
const clean=()=>{for(const entry of fs.readdirSync(tmp))fs.rmSync(path.join(tmp,entry),{recursive:true,force:true})};
const populate=(version,alias=false)=>{clean();for(const file of FILES){
  const name=alias&&file==='Code.gs'?'Code.js':file;
  fs.writeFileSync(path.join(tmp,name),cp.execFileSync('git',['show',version.ref+':src/'+file],{cwd:root,maxBuffer:6e6}));
}};
try{
  check('SOURCE_PINNED',()=>{
    assert.equal(classify(path.join(root,'src'),root),'V0_9');
    assert.equal(VERSIONS[0].ref,'955c3d03c80258b65c396b7c727ca1ee02556c5f');
    assert.deepEqual(VERSIONS.map(v=>v.label),['V0_9','V0_8','V0_7']);
  });
  for(const version of VERSIONS){
    check('SNAPSHOT_'+version.label,()=>{populate(version);assert.equal(classify(tmp,root),version.label)});
    check('CLASP_ALIAS_'+version.label,()=>{populate(version,true);assert.equal(classify(tmp,root),version.label)});
  }
  check('BLOCK_MODIFIED_REMOTE',()=>{
    populate(VERSIONS[0]);fs.appendFileSync(path.join(tmp,'Client.html'),'\n// unknown change');
    assert.equal(classify(tmp,root),'INCONNU');
  });
  check('BLOCK_EXTRA_CODE',()=>{
    populate(VERSIONS[0]);fs.writeFileSync(path.join(tmp,'Unknown.gs'),'var surprise = true;');
    assert.equal(classify(tmp,root),'INCONNU');
  });
  check('BLOCK_PUBLIC_WEBAPP',()=>{
    populate(VERSIONS[0]);const mf=path.join(tmp,'appsscript.json');
    const m=JSON.parse(fs.readFileSync(mf,'utf8'));m.webapp.access='ANYONE';
    fs.writeFileSync(mf,JSON.stringify(m));assert.equal(classify(tmp,root),'INCONNU');
  });
  check('GUARDED_AUDIT_MODE',()=>{
    assert(script.includes('MODE="${1:---audit-only}"'));
    assert(script.includes('--audit-only|--publish'));
    assert(script.includes('if [[ "$MODE" == "--audit-only" ]]'));
    assert(script.indexOf('if [[ "$MODE" == "--audit-only" ]]')<script.indexOf('clasp push'));
    assert(script.includes('SPORTOS_V0_9_AUDIT=PASS'));
  });
  check('PRIVATE_PERSONAL_ONLY',()=>{
    assert(script.includes('clasp show-authorized-user'));
    assert(script.includes('logged in as verdoucqemilie@gmail.com.'));
    assert(script.includes("manifest.webapp.access,'MYSELF'"));
    assert(script.includes("manifest.webapp.executeAs,'USER_DEPLOYING'"));
    assert(script.includes('1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ'));
  });
  check('EXISTING_DEPLOYMENT_ONLY',()=>{
    assert(script.includes('AKfycbx9CoVk8WioZ2a_IJl4CwBk6Mk23lLEf_9yJY_g-NBJ8Zxzog7TyXaoPAxS02PeOxZYCw'));
    assert(script.includes('clasp create-deployment --deploymentId "$DEPLOYMENT"'));
    assert(!/^\s*clasp\s+(?:create-script|delete-deployment)\b/m.test(script));
  });
  check('NO_UNKNOWN_OVERWRITE',()=>{
    assert(script.includes('V0_7|V0_8) echo'));
    assert(script.includes('V0_7|V0_8|V0_9) :;;'));
    assert(script.includes('STOP : code Apps Script HEAD inconnu'));
    assert(script.includes('[[ "$(snapshot_label "$TMP/verify")" == "V0_9" ]]'));
    assert(script.includes('[[ "$(target_version "$NOW")" == "$PREVIOUS_VERSION" ]]'));
    assert(script.includes('git rev-parse origin/main'));
    assert(script.includes('git status --porcelain'));
  });
  check('SIGNED_CODE_NO_SCHEMA_MIGRATION',()=>{
    assert(script.includes('955c3d03c80258b65c396b7c727ca1ee02556c5f:src/Code.gs'));
    assert(script.includes('classify-deployed-v0.9.cjs'));
    assert(!/SpreadsheetApp\.|sheets\.(?:update|append|batchUpdate)/.test(script));
    assert(script.includes('npm run verify'));
    assert(script.includes('clasp pull --versionNumber "$PREVIOUS_VERSION"'));
    assert(script.includes('clasp pull --versionNumber "$NEW_VERSION"'));
  });
  console.log('SPORTOS_V09_RELEASE_QA=PASS; CASES='+count+'; REMOTE_WRITES=0');
}finally{clean();fs.rmdirSync(tmp)}
