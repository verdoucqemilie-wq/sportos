'use strict';
// Visual QA local/offline: aperçu autonome SportOS, sans Google Sheets.
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const preview=path.join(__dirname,'../docs/apercu-v0.3.html');
 assert(fs.existsSync(preview),'Aperçu non disponible');
 const browser=await chromium.launch({headless:true});
 const states=[{name:'mobile-320',w:320,h:740},{name:'mobile-375',w:375,h:812},{name:'mobile-390',w:390,h:844},
 {name:'tablet-768',w:768,h:1024},{name:'desktop-1280',w:1280,h:900},{name:'desktop-1920',w:1920,h:1080}];
 const dir=path.join(__dirname,'../artifacts/v0.3');
 fs.mkdirSync(dir,{recursive:true});
 try {
  for(const state of states){
    const page=await browser.newPage({viewport:{width:state.w,height:state.h},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(preview).href,{waitUntil:'load'});
    await page.locator('.v3-dashboard').waitFor({timeout:12000});
    const result=await page.evaluate(()=>({
      width:document.documentElement.scrollWidth,
      viewport:window.innerWidth,
      home:!!document.querySelector('.v3-feature'),
      nav:document.querySelectorAll('[data-nav="program"]').length
    }));
    assert(result.home,'Hero absent '+state.name);
    assert(result.width<=result.viewport+2,'Débordement horizontal '+state.name+': '+JSON.stringify(result));
    assert(result.nav>0,'Navigation absente '+state.name);
    assert(!errors.length,'Erreur JavaScript '+state.name+': '+errors.join(' | '));
    await page.screenshot({path:path.join(dir,state.name+'.png'),fullPage:true});
    if(state.name==='mobile-375'||state.name==='desktop-1280'){
      await page.locator('.v3-top-cta').click();
      await page.locator('[role="dialog"] #v3-quick-title').waitFor();
      assert.equal(await page.locator('[data-choose-type]').count(),4,'Activités du menu rapide');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#quick-root [role="dialog"]').count(),0,'Escape ferme quick modal');
      await page.locator('.v3-top-cta').click();
      await page.locator('[data-choose-type="Course"]').click();
      await page.locator('#form-modal').waitFor();
      await page.locator('#modal-close').click();
      assert.equal(await page.locator('#modal-root [role="dialog"]').count(),0);
    }
    if(state.name==='desktop-1280'){
      await page.locator('.v3-side-nav [data-nav="program"]').click();
      await page.locator('.page-title').waitFor();
      assert.match(await page.locator('.page-title').textContent(),/Mon programme/);
      await page.locator('.v3-side-nav [data-nav="home"]').click();
      await page.locator('.v3-dashboard').waitFor();
    }
    console.log('VISUAL_'+state.name.toUpperCase().replace('-','_')+'=PASS width='+result.width);
    await page.close();
  }
  console.log('SPORTOS_VISUAL_QA=PASS');
  console.log('SIZES=6 ; LIVE_SHEET_WRITES=0');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
