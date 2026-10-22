'use strict';
// Browser QA SportOS V0.6 — data demonstration fixture, NEVER live Sheets.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const preview=path.join(__dirname,'../docs/apercu-v0.6.html');
 assert(fs.existsSync(preview),'Aperçu autonome manquant');
 const browser=await chromium.launch({headless:true});
 const out=path.join(__dirname,'../artifacts/v0.6');
 fs.mkdirSync(out,{recursive:true});
 let done=0;
 try{
  for(const [w,h] of [[320,700],[375,812],[390,844],[768,1024],[1280,800],[1856,824]]){
   const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(pathToFileURL(preview).href,{waitUntil:'load'});
   await page.locator('.v3-dashboard').waitFor();
   const iconState=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth+2,
      a:document.querySelector('.v3-week-row[data-open-program="A"] svg')?.innerHTML,
      b:document.querySelector('.v3-week-row[data-open-program="B"] svg')?.innerHTML,
      run:!!document.querySelector('.so-icon-Course'),
      bike:!!document.querySelector('.so-icon-Vélo'),
      homeIcons:[...document.querySelectorAll('.v3-dashboard svg.so-icon')].length
   }));
   assert(!iconState.overflow,'Home overflow '+w);
   assert.notEqual(iconState.a,iconState.b,'A/B should have distinct symbols');
   assert(iconState.run&&iconState.bike,'Sport icons missing');
   assert(iconState.homeIcons>=12,'Insufficient icon system: '+iconState.homeIcons);
   await page.locator('.v3-top-cta').click();
   await page.locator('[data-choose-type="A"]').click();
   await page.locator('.so-session-page').waitFor();
   assert.equal(await page.locator('.so-exercise').count(),5,'5 planned exercise cards');
   assert.equal(await page.locator('.so-exercise[open]').count(),1,'first detail open');
   assert.equal(await page.locator('#so-feedback-progress').textContent(),'0 / 5 exercices renseignés');
   assert.equal(await page.locator('input[name="sets0"]').inputValue(),'','program value never counted as actual');
   assert.equal(await page.locator('input[name="weight0"]').inputValue(),'');
   await page.screenshot({path:path.join(out,'strength-'+w+'x'+h+'.png'),fullPage:false});
   const check=await page.evaluate(()=>{
     const box=document.querySelector('.so-session-page').getBoundingClientRect();
     const foot=document.querySelector('.so-session-actions').getBoundingClientRect();
     return {overflow:document.documentElement.scrollWidth>innerWidth+2,
       panel:box.right<=innerWidth+2&&box.left>=-2,
       footer:foot.bottom<=innerHeight+3&&foot.top>=0,
       saveLabel:document.querySelector('#modal-submit')?.textContent||''};
   });
   assert(!check.overflow&&check.panel&&check.footer,'Feedback workspace overflow '+w+': '+JSON.stringify(check));
   await page.locator('[data-effort-value="2"]').click();
   assert.equal(await page.locator('input[name="effort"]').inputValue(),'2');
   assert.equal(await page.locator('[data-effort-value="2"]').getAttribute('aria-pressed'),'true');
   await page.locator('input[name="effort"]').fill('2.5');
   assert.equal(await page.locator('[data-effort-value="2"]').getAttribute('aria-pressed'),'false');
   await page.locator('.so-exercise').nth(1).locator('summary').click();
   await page.locator('input[name="sets1"]').fill('2');
   assert.equal(await page.locator('#so-feedback-progress').textContent(),'1 / 5 exercices renseignés');
   // Save in isolated fixture; no server-side write. Tests integration payload/form behavior.
   await page.locator('#modal-submit').click();
   await page.locator('.so-session-page').waitFor({state:'detached'});
   await page.locator('#toast').waitFor({state:'visible'});
   assert.match(await page.locator('#toast').textContent(),/aucune écriture|non synchronisé/i);
   await page.close();done++;console.log('FEEDBACK_STRENGTH_'+w+'x'+h+'=PASS');
  }
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(pathToFileURL(preview).href,{waitUntil:'load'});
  await page.locator('.v3-dashboard').waitFor();
  await page.locator('.v3-top-cta').click();
  await page.locator('[data-choose-type="Course"]').click();
  await page.locator('.so-session-page').waitFor();
  for(const name of ['runSeconds','walkSeconds','rounds'])
    assert.equal(await page.locator('input[name="'+name+'"]').inputValue(),'','proposed intervals must not be prefilled as performed');
  await page.locator('input[name="duration"]').fill('16');
  await page.locator('[data-effort-value="2"]').click();
  await page.locator('input[name="effort"]').fill('2.5');
  await page.screenshot({path:path.join(out,'cardio-390x844.png')});
  await page.locator('#modal-submit').click();
  await page.locator('.so-session-page').waitFor({state:'detached'});
  assert.match(await page.locator('#toast').textContent(),/aucune écriture|non synchronisé/i);
  await page.close();
  console.log('FEEDBACK_CARDIO_REAL_FIELDS=PASS');
  const reduced=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  await reduced.goto(pathToFileURL(preview).href,{waitUntil:'load'});
  await reduced.locator('.v3-dashboard').waitFor();
  await reduced.locator('.v3-top-cta').click();
  await reduced.locator('[data-choose-type="B"]').click();
  await reduced.locator('.so-session-page').waitFor();
  const reducedCSS=await reduced.locator('.so-exercise-expand').first().evaluate(el=>getComputedStyle(el).transitionDuration);
  assert.equal(reducedCSS,'0s','Reduced motion must disable interactive transition');
  await reduced.close();
  console.log('FEEDBACK_REDUCED_MOTION=PASS');
  console.log('SPORTOS_V0_6_QA=PASS VIEWPORTS='+done+' LIVE_SHEET_WRITES=0');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
