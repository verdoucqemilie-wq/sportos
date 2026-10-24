'use strict';
// V0.9.1 guarded release suite. Reads only fixture files and trusted Git commits.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const {classify,VERSIONS,FILES}=require('../scripts/classify-deployed-v0.9.1.cjs');
const root=path.resolve(__dirname,'..'),script=fs.readFileSync(path.join(root,'scripts/publier-v0.9.1-cloud-shell.sh'),'utf8');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sportos-v091-release-'));let checked=0;
const test=(name,fn)=>{fn();checked++;console.log('SPORTOS_V091_RELEASE_'+name+'=PASS')};
const populate=(v,alias=false)=>{for(const f of fs.readdirSync(tmp))fs.rmSync(path.join(tmp,f),{recursive:true,force:true});for(const name of FILES)
  fs.writeFileSync(path.join(tmp,alias&&name==='Code.gs'?'Code.js':name),cp.execFileSync('git',['show',v.ref+':src/'+name],{cwd:root,maxBuffer:6e6}));
};
try{
  test('PINNED_SOURCE',()=>{assert.equal(classify(path.join(root,'src'),root),'V0_9_1');assert.equal(VERSIONS[0].ref,'81b9056038013b0b48431e25873a2f664b1bb707')});
  for(const v of VERSIONS){
    test(v.label,()=>{populate(v);assert.equal(classify(tmp,root),v.label)});
    test(v.label+'_CODE_JS',()=>{populate(v,true);assert.equal(classify(tmp,root),v.label)});
  }
  test('REJECT_UNKNOWN_CHANGES',()=>{populate(VERSIONS[0]);fs.appendFileSync(path.join(tmp,'Client.html'),'// unknown');assert.equal(classify(tmp,root),'INCONNU')});
  test('REJECT_PUBLIC',()=>{populate(VERSIONS[0]);const p=path.join(tmp,'appsscript.json'),cfg=JSON.parse(fs.readFileSync(p,'utf8'));cfg.webapp.access='ANYONE';fs.writeFileSync(p,JSON.stringify(cfg));assert.equal(classify(tmp,root),'INCONNU')});
  test('NO_NEW_DEPLOYMENT',()=>{
    assert(script.includes('clasp create-deployment --deploymentId "$DEPLOYMENT"'));
    assert(!/^\s*clasp\s+(?:create-script|delete-deployment)\b/m.test(script));
    assert(script.includes("manifest.webapp.access,'MYSELF'"));
    assert(script.includes("manifest.webapp.executeAs,'USER_DEPLOYING'"));
    assert(script.includes('logged in as verdoucqemilie@gmail.com.'));
  });
  test('AUDIT_NO_WRITES',()=>{
    assert(script.includes('MODE="${1:---audit-only}"'));
    assert(script.indexOf('if [[ "$MODE" == "--audit-only" ]]')<script.indexOf('\n  clasp push\n'));
    assert(script.includes('SPORTOS_V0_9_1_AUDIT=PASS'));
  });
  test('UNKNOWN_HEAD_BLOCKED',()=>{
    assert(script.includes('V0_7|V0_8|V0_9|V0_9_1) :;;'));
    assert(script.includes('STOP : code Apps Script HEAD inconnu'));
    assert(script.includes('[[ "$(snapshot_label "$TMP/verify")" == "V0_9_1" ]]'));
    assert(script.includes('[[ "$(target_version "$NOW")" == "$PREVIOUS_VERSION" ]]'));
  });
  test('ZERO_REAL_SHEET_MUTATION',()=>{assert(!/SpreadsheetApp\.|sheets\.(?:update|append|batchUpdate)/.test(script));assert(script.includes('npm run verify'))});
  console.log('SPORTOS_V091_RELEASE=PASS; CASES='+checked+'; REAL_WRITES=0');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
