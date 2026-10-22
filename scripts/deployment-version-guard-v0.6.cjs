'use strict';
// SportOS V0.6: strictly read existing private deployment, never create or modify here.
// Last confirmed deployment was @6; @7 is also permitted if V0.5 was deployed meanwhile.
// Refuse other versions and unexpected IDs, even when clasp omits descriptions.
const EXPECTED_ID='AKfycbx9CoVk8WioZ2a_IJl4CwBk6Mk23lLEf_9yJY_g-NBJ8Zxzog7TyXaoPAxS02PeOxZYCw';
const APPROVED_SOURCE_VERSIONS=new Set([6,7]);
function findTarget(output,id=EXPECTED_ID){
  const deployments=String(output).split(/\r?\n/).map(line=>{
    const m=line.trim().match(/^-\s+(\S+)\s+@(\d+)(?:\s+-\s+(.+))?\s*$/);
    return m?{id:m[1],version:Number(m[2]),description:(m[3]||'').trim()}:null;
  }).filter(Boolean);
  const target=deployments.filter(d=>d.id===id);
  if(target.length!==1)throw Error('STOP : deploiement cible absent ou en plusieurs exemplaires ('+target.length+')');
  if(!Number.isSafeInteger(target[0].version))throw Error('STOP : numero de version invalide');
  return target[0];
}
function before(output,id=EXPECTED_ID){
  if(id!==EXPECTED_ID)throw Error('STOP : ID Apps Script cible incorrect');
  const current=findTarget(output,id);
  if(current.description.includes('SportOS v0.6.0'))throw Error('STOP : V0.6 deja indiquee, ne pas publier deux fois');
  if(!APPROVED_SOURCE_VERSIONS.has(current.version))
    throw Error('STOP : version distante @'+current.version+' inattendue (versions autorisees @6 et @7 uniquement)');
  return current.version;
}
function unchanged(output,id,version){
  if(id!==EXPECTED_ID)throw Error('STOP : ID Apps Script cible incorrect');
  const current=findTarget(output,id);
  if(current.version!==version)throw Error('STOP : version distante modifiee pendant preparation (@'+current.version+')');
  return current.version;
}
function after(output,id,previous){
  if(id!==EXPECTED_ID)throw Error('STOP : ID Apps Script cible incorrect');
  if(!APPROVED_SOURCE_VERSIONS.has(previous))throw Error('STOP : version de depart non autorisee');
  const current=findTarget(output,id);
  if(current.version<=previous)throw Error('STOP : version du deploiement non augmentee apres publication (@'+current.version+')');
  return current.version;
}
if(require.main===module){
  try{
    const [phase,id,output,version]=process.argv.slice(2);
    if(phase==='before')console.log(before(output,id));
    else if(phase==='unchanged')console.log(unchanged(output,id,Number(version)));
    else if(phase==='after')console.log(after(output,id,Number(version)));
    else throw Error('Usage : before|unchanged|after <id> <clasp output> [version]');
  }catch(err){console.error(err.message);process.exitCode=1;}
}
module.exports={findTarget,before,unchanged,after,EXPECTED_ID,APPROVED_SOURCE_VERSIONS};
