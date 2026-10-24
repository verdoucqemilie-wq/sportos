'use strict';
// V0.9.1 browser acceptance using synthetic data only; never writes to real Google Sheets.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const file=path.join(__dirname,'../docs/apercu-sportos-v0.9.html');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const dir=path.join(__dirname,'../artifacts/v0.9.1');fs.mkdirSync(dir,{recursive:true});
  try{
    await page.goto(pathToFileURL(file).href,{waitUntil:'load'});
    await page.locator('[data-nav="program"]').first().click();
    await page.locator('.so91-week').first().waitFor();
    assert.equal(await page.locator('.so91-week').count(),4);
    assert.match(await page.locator('.so91-week').nth(0).innerText(),/4\/4/);
    assert.equal(await page.locator('.so91-week.is-selected').getAttribute('data-program-week'),'1','Completed S1 should propose S2');
    assert.match(await page.locator('.so91-outlook h2').innerText(),/Semaine 2/i);
    assert.equal(await page.locator('.so91-preview').count(),4);
    const weeks=await page.locator('.so91-week').allInnerTexts();
    assert(weeks[2].toLocaleLowerCase('fr-FR').includes('à venir')&&weeks[3].toLocaleLowerCase('fr-FR').includes('à venir'),'S3 and S4 conditional: '+weeks.join(' | '));
    assert.match(await page.locator('.so91-conditional').innerText(),/recalculées après tes prochains retours/);
    await page.locator('.sp7-selector [data-program-tab="Vélo"]').click();
    assert.match(await page.locator('.so8-adaptation').innerText(),/conservée|récupération|confort/);
    assert.equal(await page.locator('.sp7-hero-primary [data-log]').count(),0,'No edit of future session');
    await page.locator('[data-program-week="2"]').click();
    assert.match(await page.locator('.so91-outlook h2').innerText(),/Semaine 3/);
    assert.match(await page.locator('.so8-adaptation').innerText(),/évolution à confirmer|suite dépend|progression/i);
    await page.locator('[data-program-week="0"]').click();
    await page.locator('.sp7-selector [data-program-tab="Course"]').click();
    assert.equal(await page.locator('.sp7-hero-primary [data-log]').count(),0,'Declared run must not offer duplicate write');
    assert.match(await page.locator('.sp7-primary').innerText(),/historique/i);
    await page.locator('.sp7-selector [data-program-tab="B"]').click();
    assert.match(await page.locator('.sp7-primary').innerText(),/Modifier mon retour/,'S1 real edit accessible in current week');
    await page.locator('[data-nav="home"]').first().click();
    assert.equal(await page.locator('.v3-feature-kicker').count(),0,'Redundant completed-week kicker');
    await page.locator('[data-nav="program"]').first().click();
    assert.equal(await page.locator('.sp7-hero-disclaimer').count(),0,'Unhelpful timer microcopy');
    assert.match(await page.locator('.sp7-switch-icon .so-icon-B').first().evaluate(el=>el.outerHTML),/M12\.409/);
    for(const width of [320,375,390,768,1024,1280,1920]){
      await page.setViewportSize({width,height:850});
      const [scroll,viewport]=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
      assert(scroll<=viewport+2,'Overflow at '+width+': '+scroll+'/'+viewport);
      if([320,390,768,1280].includes(width))await page.screenshot({path:path.join(dir,'cycle-'+width+'.png'),fullPage:true});
    }
    assert.equal(errors.length,0,'Browser errors: '+errors.join(' | '));
    console.log('SPORTOS_V091_CYCLE_UI=PASS; RESPONSIVE=7; REAL_SHEET_WRITES=0');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
