'use strict';
// Regression for V0.7 classification and fail-closed publication contract.
// Never reads remote Google data or performs any network/Apps Script write.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const cp=require('node:child_process');
const {classify,same,FILES,VERSIONS}=require('../scripts/classify-deployed-v0.7.cjs');
const root=path.resolve(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sportos-v07-'));
let count=0;
const expect=(f,expected,label)=>{f();count++;console.log(label+'=PASS')};
function populate(ref){
  for(const name of FILES)
    fs.writeFileSync(path.join(tmp,name),cp.execFileSync('git',['show',ref+':src/'+name],{cwd:root}));
}
try{
 for(const item of VERSIONS){
   expect(()=>{populate(item.ref);assert.equal(classify(tmp,root),item.label)},'CLASSIFY_'+item.label);
 }
 for(const item of VERSIONS){
   expect(()=>{
     populate(item.ref);
     fs.renameSync(path.join(tmp,'Code.gs'),path.join(tmp,'Code.js'));
     assert.equal(classify(tmp,root),item.label);
     fs.renameSync(path.join(tmp,'Code.js'),path.join(tmp,'Code.gs'));
   },'ALLOW_CLASP_JS_ALIAS_'+item.label);
 }
 expect(()=>{
   populate(VERSIONS[0].ref);
   fs.renameSync(path.join(tmp,'Code.gs'),path.join(tmp,'Code.js'));
   fs.writeFileSync(path.join(tmp,'Another.js'),'// unknown additional script');
   assert.equal(classify(tmp,root),'INCONNU');
   fs.rmSync(path.join(tmp,'Another.js'));
   fs.renameSync(path.join(tmp,'Code.js'),path.join(tmp,'Code.gs'));
 },'REJECT_EXTRA_JS_EVEN_WITH_VALID_ALIAS');
 expect(()=>{
   populate(VERSIONS[0].ref);
   fs.copyFileSync(path.join(tmp,'Code.gs'),path.join(tmp,'Code.js'));
   assert.equal(classify(tmp,root),'INCONNU');
   fs.rmSync(path.join(tmp,'Code.js'));
 },'REJECT_DUPLICATE_BACKEND_EXTENSIONS');
 expect(()=>{
   populate(VERSIONS[0].ref);
   fs.renameSync(path.join(tmp,'Code.gs'),path.join(tmp,'Code.js'));
   fs.appendFileSync(path.join(tmp,'Code.js'),'\n// remote backend changed');
   assert.equal(classify(tmp,root),'INCONNU');
   fs.rmSync(path.join(tmp,'Code.js'));
 },'REJECT_MODIFIED_CLASP_JS');
 expect(()=>{populate(VERSIONS[0].ref);fs.appendFileSync(path.join(tmp,'Styles.html'),'\n/* remote mutation */');assert.equal(classify(tmp,root),'INCONNU')},'REJECT_CHANGED_CSS');
 expect(()=>{populate(VERSIONS[0].ref);fs.writeFileSync(path.join(tmp,'Untracked.gs'),'x');assert.equal(classify(tmp,root),'INCONNU');fs.rmSync(path.join(tmp,'Untracked.gs'))},'REJECT_EXTRA_FILE');
 expect(()=>{populate(VERSIONS[0].ref);fs.rmSync(path.join(tmp,'Client.html'));assert.equal(classify(tmp,root),'INCONNU')},'REJECT_MISSING_FILE');
 expect(()=>{populate(VERSIONS[0].ref);fs.appendFileSync(path.join(tmp,'appsscript.json'),'\n');assert.equal(classify(tmp,root),'V0_7')},'ALLOW_MANIFEST_WHITESPACE');
 expect(()=>{populate(VERSIONS[0].ref);const v=JSON.parse(fs.readFileSync(path.join(tmp,'appsscript.json'),'utf8'));v.webapp.access='ANYONE';fs.writeFileSync(path.join(tmp,'appsscript.json'),JSON.stringify(v));assert.equal(classify(tmp,root),'INCONNU')},'REJECT_PRIVACY_CHANGE');
 expect(()=>assert(same('a\r\nb\n','a\nb','Client.html')),'ALLOW_LINE_ENDINGS');
 expect(()=>assert(!same('function a(){}','function b(){}','Client.html')),'REJECT_SOURCE_MISMATCH');
 const shell=fs.readFileSync(path.join(root,'scripts/publier-v0.7-cloud-shell.sh'),'utf8');
 expect(()=>assert(shell.includes('clasp pull --versionNumber "$PREVIOUS_VERSION"') && shell.includes('clasp pull --versionNumber "$NEW_VERSION"')),'IMMUTABLE_PRE_AND_POST_AUDITS');
 expect(()=>assert(shell.includes('clasp push')&&shell.includes('SPORTOS_CODE_DISTANT_HEAD=')),'REMOTE_HEAD_BEFORE_PUSH');
 expect(()=>assert(shell.includes('clasp create-deployment --deploymentId "$DEPLOYMENT"')),'EXISTING_DEPLOYMENT_ONLY');
 expect(()=>assert(shell.includes("manifest.webapp.access,'MYSELF'")),'PRIVATE_WEBAPP_GATE');
 console.log('SPORTOS_V0_7_RELEASE_GUARDS=PASS ; CASES='+count+' ; REMOTE_WRITES=0');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
