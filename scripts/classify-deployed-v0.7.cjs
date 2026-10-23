'use strict';
// Pure, read-only 5-file comparison for an immutable Apps Script deployment or HEAD.
// Deliberately fail closed if files differ or the working repository changed.
// Never print remote source or expose user data.
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const FILES=['Code.gs','Index.html','Styles.html','Client.html','appsscript.json'];
const PULLED_SCRIPT_ALIAS='Code.js';
function resolvePulledFiles(snapshot){
  const list=fs.readdirSync(snapshot,{withFileTypes:true}).filter(x=>x.isFile()&&!x.name.startsWith('.')).map(x=>x.name).sort();
  const hasG= list.includes('Code.gs'),hasJ=list.includes(PULLED_SCRIPT_ALIAS);
  // clasp defaults to .js on pull. Either is safe, but never both and never unknown files.
  if(hasG===hasJ)return null;
  const expected=FILES.map(f=>f==='Code.gs'&&hasJ?PULLED_SCRIPT_ALIAS:f).sort();
  if(JSON.stringify(list)!==JSON.stringify(expected))return null;
  return Object.fromEntries(FILES.map(f=>[f,f==='Code.gs'&&hasJ?PULLED_SCRIPT_ALIAS:f]));
}
const VERSIONS=[
  {label:'V0_7',ref:'d59bb2b3921590e9a15ede5effa52f321bb7cfd9'},
  {label:'V0_6',ref:'8e92bd7'},
  {label:'V0_5',ref:'6e3837e'}
];
const normalized=s=>String(s).replace(/\r\n?/g,'\n').replace(/\n+$/,'');
function canonical(obj){
  if(Array.isArray(obj))return obj.map(canonical);
  if(obj&&typeof obj==='object')return Object.fromEntries(Object.keys(obj).sort().map(k=>[k,canonical(obj[k])]));
  return obj;
}
function same(a,b,file){
  if(file==='appsscript.json'){
    try{return JSON.stringify(canonical(JSON.parse(String(a))))===JSON.stringify(canonical(JSON.parse(String(b))))}
    catch(_){return false}
  }
  return normalized(a)===normalized(b);
}
function classify(snapshot,repo){
  const resolved=resolvePulledFiles(snapshot);
  if(!resolved)return 'INCONNU';
  const fileContents=Object.fromEntries(FILES.map(name=>[name,fs.readFileSync(path.join(snapshot,resolved[name]))]));
  for(const v of VERSIONS){
    const equal=FILES.every(name=>{
      const expected=cp.execFileSync('git',['show',v.ref+':src/'+name],{cwd:repo,maxBuffer:6e6});
      return same(fileContents[name],expected,name);
    });
    if(equal)return v.label;
  }
  return 'INCONNU';
}
if(require.main===module){
  try{
    const [, ,snapshot,repo]=process.argv;
    if(!snapshot||!repo)throw Error('dossier source ou dépôt absent');
    console.log('SPORTOS_SNAPSHOT='+classify(snapshot,repo));
  }catch(err){
    console.error('STOP : classification inaccessible ('+err.message+')');
    process.exitCode=1;
  }
}
module.exports={classify,same,FILES,VERSIONS,resolvePulledFiles,PULLED_SCRIPT_ALIAS};
