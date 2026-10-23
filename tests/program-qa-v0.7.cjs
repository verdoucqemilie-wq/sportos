'use strict';
// SportOS V0.7 — real Chromium QA on isolated offline fixture; no Sheets reads/writes.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const preview=path.join(__dirname,'../docs/apercu-programme-v0.7.html');
 assert(fs.existsSync(preview),'Programme preview must exist');
 const browser=await chromium.launch({headless:true});
 const output=path.join(__dirname,'../artifacts/v0.7');
 fs.mkdirSync(output,{recursive:true});
 const formats=[[320,700],[375,812],[390,844],[430,900],[768,1024],[1024,768],[1280,800],[1856,824],[1920,1080]];
 try{
  for(const [width,height] of formats){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(pathToFileURL(preview).href,{waitUntil:'load'});
   await page.locator('.sp7-page').waitFor({timeout:12000});
   const state=await page.evaluate(()=>({
    viewport:innerWidth,scroll:document.documentElement.scrollWidth,
    tabs:document.querySelectorAll('.sp7-switch').length,
    selected:document.querySelectorAll('.sp7-switch[aria-pressed="true"]').length,
    exercises:document.querySelectorAll('.sp7-ex').length,
    heads:document.querySelectorAll('.sp7-page h1').length,
    finishLabel:document.querySelector('.sp7-hero-brow')?.textContent,
    progress:document.querySelector('.sp7-head-stat strong')?.textContent,
    ctas:document.querySelectorAll('.sp7-primary[data-log]').length,
    detailWidths:[...document.querySelectorAll('.sp7-ex-heading')].map(e=>e.getBoundingClientRect().right)
   }));
   assert(state.scroll<=state.viewport+2,'Page overflow '+width+': '+JSON.stringify(state));
   assert.equal(state.tabs,4,'Four interactive sport tabs');
   assert.equal(state.selected,1,'Single selected sport');
   assert.equal(state.exercises,5,'Strength A plan contains 5 proposed exercises');
   assert.equal(state.heads,1,'Unique semantic H1');
   assert.equal(state.ctas,1,'Exactly one log CTA');
   assert(!/RÉALISÉE CETTE SEMAINE/.test(state.finishLabel),'A undated strength history must not count as done');
   assert.match(state.progress,/1.*04/,'Actual dated course should count as one weekly activity');
   assert(state.detailWidths.every(x=>x<=width+2),'Exercise summary offscreen at '+width);
   if([320,375,768,1280,1856].includes(width))await page.screenshot({path:path.join(output,'programme-A-'+width+'x'+height+'.png'),fullPage:true});
   const first=page.locator('.sp7-ex').first();
   assert.equal(await first.getAttribute('open'),'','First exercise detail initially open');
   await first.locator('summary').click();
   assert.equal(await first.getAttribute('open'),null,'Native accordion closes');
   await first.locator('summary').click();
   assert.equal(await first.getAttribute('open'),'','Native accordion opens');
   await page.locator('[data-program-tab="B"]').click();
   assert.match(await page.locator('#sp7-hero-title').textContent(),/force en mouvement/i);
   assert.equal(await page.locator('.sp7-ex').count(),5);
   assert.equal(await page.locator('.sp7-switch[aria-pressed="true"]').getAttribute('data-program-tab'),'B');
   await page.locator('[data-program-tab="Course"]').click();
   assert.equal(await page.locator('.sp7-ex').count(),0);
   assert(await page.locator('.sp7-milestone').count()>0,'Course steps should be shown');
   const completeLabels=await page.locator('.sp7-milestone.is-complete').count();
   assert(completeLabels>0,'Completed course step from fixture retained');
   await page.locator('[data-program-tab="Vélo"]').click();
   assert.match(await page.locator('#sp7-hero-title').textContent(),/route/i);
   assert.equal(await page.locator('.sp7-ex').count(),0);
   assert(await page.locator('.sp7-milestone').count()>0,'Bike planning steps');
   await page.locator('[data-program-tab="A"]').click();
   await page.locator('.sp7-primary').click();
   await page.locator('.so-session-page').waitFor({timeout:5000});
   assert.match(await page.locator('#modal-title').textContent(),/Renforcement A/);
   await page.keyboard.press('Escape');
   await page.locator('.so-session-page').waitFor({state:'detached'});
   assert(!errors.length,'JavaScript errors '+width+': '+errors.join(' ; '));
   console.log('PROGRAM_V0_7_'+width+'x'+height+'=PASS');
   await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  await reduced.goto(pathToFileURL(preview).href,{waitUntil:'load'});
  await reduced.locator('.sp7-page').waitFor();
  const motion=await reduced.locator('.sp7-switch').first().evaluate(el=>getComputedStyle(el).transitionDuration);
  assert(motion.split(',').every(t=>parseFloat(t)===0),'Reduced motion must remove transitions');
  console.log('PROGRAM_V0_7_REDUCED_MOTION=PASS');
  console.log('PROGRAM_V0_7_QA=PASS FORMATS='+formats.length+' LIVE_SHEET_WRITES=0');
  await reduced.close();
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exit(1)});
