'use strict';
// Compare the IMMUTABLE pulled Apps Script version with known Git snapshots.
// Never upload code, never write Google Sheets, never expose source file content.
// Usage: node scripts/classify-deployed-v0.6.cjs <temp/src> <repo-root>
const fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const FILES=['Code.gs','Index.html','Styles.html','Client.html','appsscript.json'];
const V05_COMMIT='6e3837e';
function norm(buf){return String(buf).replace(/\r\n/g,'\n').replace(/\n+$/,'');}
function equivalent(a,b,file){
  if(file==='appsscript.json'){
    try{
      const pa=JSON.parse(String(a)),pb=JSON.parse(String(b));
      const canonical=x=>JSON.stringify(Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,v&&typeof v==='object'&&!Array.isArray(v)?JSON.parse(canonical(v)):v])));
      return canonical(pa)===canonical(pb);
    }catch(_){return false}
  }
  return norm(a)===norm(b);
}
function inspect(snapshotDir,repoDir){
  const observed=fs.readdirSync(snapshotDir,{withFileTypes:true})
    .filter(x=>x.isFile()&&!x.name.startsWith('.'))
    .map(x=>x.name).sort();
  if(JSON.stringify(observed)!==JSON.stringify([...FILES].sort()))return 'INCONNU';
  const get=(f)=>fs.readFileSync(path.join(snapshotDir,f));
  const at=(ref,f)=>execFileSync('git',['show',ref+':src/'+f],{cwd:repoDir,encoding:'buffer',maxBuffer:4e6});
  const allMatch=ref=>FILES.every(f=>equivalent(get(f),at(ref,f),f));
  // Current main at runtime includes the V0.6 screens. Guard against a future main.
  const client=fs.readFileSync(path.join(repoDir,'src/Client.html'),'utf8');
  const styles=fs.readFileSync(path.join(repoDir,'src/Styles.html'),'utf8');
  if(!client.includes('so-session-page')||!styles.includes('SPORTOS V0.6'))throw Error('STOP : checkout local non V0.6');
  if(allMatch('HEAD'))return 'V0_6';
  if(allMatch(V05_COMMIT))return 'V0_5';
  return 'INCONNU';
}
if(require.main===module){
  try{
    const [, ,dir,repo]=process.argv;
    if(!dir||!repo)throw Error('Chemins de vérification manquants');
    console.log('SPORTOS_SNAPSHOT_8='+inspect(dir,repo));
  }catch(err){console.error('STOP : inspection du snapshot impossible : '+err.message);process.exitCode=1;}
}
module.exports={inspect,equivalent,FILES,V05_COMMIT};
