'use strict';
// Validate exactly one existing SportOS Apps Script deployment by ID and numerical version.
// clasp may omit descriptions entirely; never rely on labels for write authorization.
// No API, files, network or mutation: pure parsing + command line.
const EXPECTED_ID='AKfycbx9CoVk8WioZ2a_IJl4CwBk6Mk23lLEf_9yJY_g-NBJ8Zxzog7TyXaoPAxS02PeOxZYCw';
const APPROVED_SOURCE_VERSION=6;
function findTarget(text,id=EXPECTED_ID){
  const records=String(text).split(/\r?\n/).map(line=>{
    const m=line.trim().match(/^-\s+(\S+)\s+@(\d+)(?:\s+-\s+(.+))?\s*$/);
    return m?{id:m[1],version:Number(m[2]),description:(m[3]||'').trim()}:null;
  }).filter(Boolean).filter(x=>x.id===id);
  if(records.length!==1)throw new Error('STOP : le déploiement cible doit apparaître exactement une fois ; trouvé '+records.length);
  if(!Number.isSafeInteger(records[0].version))throw new Error('STOP : numéro de version invalide');
  return records[0];
}
function checkBefore(output,id=EXPECTED_ID){
  if(id!==EXPECTED_ID)throw new Error('STOP : identifiant cible inattendu');
  const target=findTarget(output,id);
  if(target.description.includes('SportOS v0.5.0'))throw new Error('STOP : V0.5 paraît déjà déployée ; ne pas rejouer');
  if(target.version!==APPROVED_SOURCE_VERSION){
    throw new Error('STOP : version actuelle @'+target.version+' inattendue ; version approuvée @'+APPROVED_SOURCE_VERSION);
  }
  return target.version;
}
function checkAfter(output,id=EXPECTED_ID,before=APPROVED_SOURCE_VERSION){
  if(id!==EXPECTED_ID)throw new Error('STOP : identifiant cible inattendu');
  if(!Number.isSafeInteger(before)||before!==APPROVED_SOURCE_VERSION)throw new Error('STOP : numéro initial inattendu');
  const target=findTarget(output,id);
  if(target.version<=before)throw new Error('STOP : la version cible n\'a pas progressé après mise à jour (@'+target.version+')');
  return target.version;
}
if(require.main===module){
  try{
    const [phase,id,output,initial]=process.argv.slice(2);
    if(phase==='before')console.log(checkBefore(output,id));
    else if(phase==='after')console.log(checkAfter(output,id,Number(initial)));
    else throw new Error('Utilisation : before|after <deployment-id> <sortie clasp> [version initiale]');
  }catch(err){console.error(err.message);process.exitCode=1}
}
module.exports={findTarget,checkBefore,checkAfter,EXPECTED_ID,APPROVED_SOURCE_VERSION};
