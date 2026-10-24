'use strict';
// V0.9 Chromium integration test against synthetic standalone preview ONLY.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const html=path.join(__dirname,'../docs/apercu-sportos-v0.9.html');
(async()=>{
  assert(fs.existsSync(html));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const out=path.join(__dirname,'../artifacts/v0.9');fs.mkdirSync(out,{recursive:true});
  const choose=async type=>{await page.locator('[data-nav="program"]').first().click();await page.locator('[data-program-tab="'+type+'"]').click()};
  const checkOverflow=async(width,part)=>{
    await page.setViewportSize({width,height:780});
    const [scroll,inner]=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
    assert(scroll<=inner+2,part+' horizontal overflow at '+width+': '+scroll+' > '+inner);
    if([320,390,768,1280,1920].includes(width))
      await page.screenshot({path:path.join(out,'sportos-v09-'+part+'-'+width+'.png'),fullPage:true});
  };
  try{
    await page.goto(pathToFileURL(html).href,{waitUntil:'load'});
    await page.locator('.sp7-page').waitFor();
    for(const type of ['A','B','Course','Vélo']){
      await choose(type);
      assert.equal(await page.locator('.so9-routine').count(),2,type+': missing warmup or cooldown');
      assert.match(await page.locator('.so9-routine').first().innerText(),/Échauffement/);
      assert.match(await page.locator('.so9-routine').last().innerText(),/étirements/);
      if(['A','B'].includes(type)){
        assert.equal(await page.locator('.sp7-ex').count(),5);
        assert.equal(await page.locator('.so9-movement').count(),5,'Missing technique guidance');
      }
    }
    await choose('B');
    assert.match(await page.locator('.sp7-primary').innerText(),/Modifier mon retour/);
    assert.equal(await page.locator('.sp7-primary .so-icon-pencil').count(),1);
    await page.locator('.sp7-primary').click();
    await page.locator('.so-session-page').waitFor();
    assert.equal(await page.locator('#f-sets0').inputValue(),'2','Existing sets not prefilled');
    assert.equal(await page.locator('#f-seconds4').inputValue(),'40','Existing gainage hold not prefilled');
    assert.equal(await page.locator('#f-note').inputValue(),'Démonstration : séance fictive et modifiable.');
    assert.equal(await page.locator('.so9-journal-guide').count(),5);
    assert.equal(await page.locator('.so-session-page .so9-routine').count(),2);
    const original=await page.evaluate(()=>window.__SPORTOS_FIXTURE__.sessions.filter(x=>x.Seance_ID==='SODEMO20261023B').length);
    await page.locator('#f-note').fill('Mon retour a été modifié dans l’aperçu.');
    await page.locator('#modal-submit').click();
    await page.locator('.so-session-page').waitFor({state:'detached'});
    const saved=await page.evaluate(()=>{
      const a=window.__SPORTOS_FIXTURE__.sessions.filter(x=>x.Seance_ID==='SODEMO20261023B');
      return {count:a.length,note:a[0].Notes};
    });
    assert.equal(original,1);assert.equal(saved.count,1,'Edit duplicated existing record');
    assert.equal(saved.note,'Mon retour a été modifié dans l’aperçu.');
    assert.match(await page.locator('.sp7-primary').innerText(),/Modifier mon retour/);
    console.log('SPORTOS_V09_EDIT_PREFILL_IDEMPOTENT=PASS');
    await page.locator('[data-nav="home"]').first().click();
    assert.equal(await page.locator('.so8-celebration').count(),0,'Homepage completion banner must be removed');
    assert.equal(await page.locator('.so9-challenge-bike').count(),1,'New challenge graphic missing');
    assert.match(await page.locator('#v3-challenge-title').innerText(),/Espiens/);
    console.log('SPORTOS_V09_HOME_AND_ICON=PASS');
    for(const width of [320,375,390,430,768,1024,1280,1600,1920])await checkOverflow(width,'home');
    await choose('B');
    for(const width of [320,375,390,430,768,1024,1280,1600,1920])await checkOverflow(width,'program');
    await page.locator('.sp7-primary').click();await page.locator('.so-session-page').waitFor();
    for(const width of [320,390,768,1280])await checkOverflow(width,'feedback');
    assert.equal(errors.length,0,'Javascript errors: '+errors.join(' ; '));
    console.log('SPORTOS_V09_CHROMIUM=PASS; RESPONSIVE=22; REAL_SHEET_WRITES=0');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
