'use strict';
// Strict read-only classification for SportOS V0.8 release.
// Five complete files must match a pinned commit, including normalized clasp Code.js alias.
// Never print remote source contents, patch hunks, credentials, or private data.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {FILES,same,resolvePulledFiles}=require('./classify-deployed-v0.7.cjs');
const VERSIONS=[
  {label:'V0_8',ref:'27e655ad4127292a6c55f523c5bbed05ea3b5893'},
  {label:'V0_7',ref:'d59bb2b3921590e9a15ede5effa52f321bb7cfd9'}
];
function classify(snapshot,repo){
  const resolved=resolvePulledFiles(snapshot);
  if(!resolved)return 'INCONNU';
  const got=Object.fromEntries(FILES.map(name=>[name,fs.readFileSync(path.join(snapshot,resolved[name]))]));
  for(const version of VERSIONS){
    const matches=FILES.every(name=>{
      const expected=cp.execFileSync('git',['show',version.ref+':src/'+name],{cwd:repo,maxBuffer:6e6});
      return same(got[name],expected,name);
    });
    if(matches)return version.label;
  }
  return 'INCONNU';
}
if(require.main===module){
  try{
    const [,,snapshot,repo]=process.argv;
    if(!snapshot||!repo)throw Error('snapshot ou dépôt manquant');
    console.log('SPORTOS_SNAPSHOT='+classify(snapshot,repo));
  }catch(err){
    console.error('STOP : snapshot inaccessible ou inconnu ('+err.message+')');
    process.exitCode=1;
  }
}
module.exports={classify,VERSIONS,FILES};
