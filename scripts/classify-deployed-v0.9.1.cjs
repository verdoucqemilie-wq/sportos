'use strict';
// SportOS V0.9.1: immutable, file-by-file classification of Apps Script snapshots.
// No sensitive source output. Both script HEAD and published versions must be known.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {FILES,same,resolvePulledFiles}=require('./classify-deployed-v0.7.cjs');
const VERSIONS=[
  {label:'V0_9_1',ref:'5a8a3acfed1eb37aff492911fba7aa494609acea'},
  {label:'V0_9',ref:'a2ef04920403afe1531143f900dbca88986b3995'},
  {label:'V0_8',ref:'27e655ad4127292a6c55f523c5bbed05ea3b5893'},
  {label:'V0_7',ref:'d59bb2b3921590e9a15ede5effa52f321bb7cfd9'}
];
function classify(snapshot,repo){
  const resolved=resolvePulledFiles(snapshot);
  if(!resolved)return 'INCONNU';
  const got=Object.fromEntries(FILES.map(name=>[name,fs.readFileSync(path.join(snapshot,resolved[name]))]));
  for(const version of VERSIONS){
    if(FILES.every(name=>{
      const expected=cp.execFileSync('git',['show',version.ref+':src/'+name],{cwd:repo,maxBuffer:6e6});
      return same(got[name],expected,name);
    }))return version.label;
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
