'use strict';
// V0.9.2 Chromium regression: only the synthetic HTML preview, never the personal Sheet.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const file=path.join(__dirname,'../docs/apercu-sportos-v0.9.html');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const dir=path.join(__dirname,'../artifacts/v0.9.2');fs.mkdirSync(dir,{recursive:true});
 try{
  await page.goto(pathToFileURL(file).href,{waitUntil:'load'});
  await page.locator('[data-nav="program"]').first().click();
  await page.locator('.so91-week').first().waitFor();
  assert.equal(await page.locator('.so91-week').count(),4);
  assert.equal(await page.locator('.so91-week.is-selected').getAttribute('data-program-week'),'1');
  assert.equal(await page.locator('.so92-milestone').count(),1,'Completion must remain discreet and fixed');
  assert.match(await page.locator('.so92-milestone').innerText(),/semaine 1/i);
  assert.equal(await page.locator('.so8-celebration').count(),0,'Old oversized banner still visible');
  assert.equal(await page.locator('.so91-outlook').count(),0,'Redundant giant week overview');
  assert.equal(await page.locator('.so91-preview').count(),0,'Redundant second set of exercise buttons');
  assert.equal(await page.locator('.sp7-selector [data-program-tab]').count(),4,'One activity selector');
  assert.match(await page.locator('#sp7-hero-title').innerText(),/Des bases solides/);
  const h2=await page.locator('#sp7-hero-title').evaluate(x=>parseFloat(getComputedStyle(x).fontSize));
  assert(h2<=49,'Hero headline too large on laptop: '+h2);
  const header=await page.locator('.sp7-head h1').evaluate(x=>parseFloat(getComputedStyle(x).fontSize));
  assert(header<=50,'Program header too large: '+header);
  const subtitleMargin=await page.locator('.so92-hero-lede').evaluate(x=>parseFloat(getComputedStyle(x).marginTop));
  assert(subtitleMargin>=12,'Subtitle too close to the title: '+subtitleMargin);
  const heroHeight=(await page.locator('.sp7-hero').boundingBox()).height;
  assert(heroHeight<400,'Card remains excessively tall: '+heroHeight);
  assert.equal(await page.locator('.sp7-hero .sp7-hero-actions [data-nav-go="progress"]').count(),1,'Duplicate historical CTA');
  const before=(await page.locator('.sp7-hero').boundingBox()).y;
  await page.locator('[data-program-week="2"]').click();
  assert.match(await page.locator('.so92-week-context').innerText(),/SEMAINE 3/);
  assert.equal(await page.locator('.so92-milestone').count(),1,'Milestone disappears during week change');
  assert.equal(await page.locator('.sp7-selector [data-program-tab]').count(),4);
  const after=(await page.locator('.sp7-hero').boundingBox()).y;
  assert(Math.abs(after-before)<10,'Layout shifts on week switch: '+(after-before));
  assert.match(await page.locator('.so8-adaptation').innerText(),/évolution à confirmer|suite dépend|progression/i);
  await page.locator('[data-program-week="0"]').click();
  await page.locator('.sp7-selector [data-program-tab="Course"]').click();
  assert.equal(await page.locator('.sp7-hero-primary [data-log]').count(),0,'Historical declared run must not duplicate');
  await page.locator('.sp7-selector [data-program-tab="B"]').click();
  assert.match(await page.locator('.sp7-primary').innerText(),/Modifier mon retour/);
  assert.match(await page.locator('.sp7-switch-icon .so-icon-B').first().evaluate(el=>el.outerHTML),/M12\.409/);
  await page.locator('[data-nav="home"]').first().click();
  assert.equal(await page.locator('.v3-feature-kicker').count(),0,'Homepage duplicate label');
  await page.locator('[data-nav="program"]').first().click();
  for(const width of [320,375,390,430,768,1024,1280,1440,1600,1920]){
   await page.setViewportSize({width,height:850});
   const sizes=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert(sizes.doc<=sizes.viewport+2,'Horizontal overflow at '+width+': '+JSON.stringify(sizes));
   if([320,390,768,1280,1600].includes(width))
    await page.screenshot({path:path.join(dir,'compact-program-'+width+'.png'),fullPage:true});
  }
  assert.equal(errors.length,0,'JS errors: '+errors.join('; '));
  console.log('SPORTOS_V092_PROGRAM_UI=PASS; RESPONSIVE=10; PERSONAL_SHEET_WRITES=0');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
