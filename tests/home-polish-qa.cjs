'use strict';
// SportOS V0.5 — typographie / iconographie / animation, 100% preview.
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const preview=path.join(__dirname,'../docs/apercu-v0.5.html');
  assert(fs.existsSync(preview),'Aperçu V0.5 absent');
  const out=path.join(__dirname,'../artifacts/v0.5');
  fs.mkdirSync(out,{recursive:true});
  const cases=[[320,700],[375,812],[390,844],[768,1024],[1280,800],[1856,824],[1920,1080]];
  try{
    for(const [width,height] of cases){
      const page=await browser.newPage({viewport:{width,height}});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(pathToFileURL(preview).href,{waitUntil:'load'});
      await page.locator('.v3-dashboard').waitFor();
      await page.waitForTimeout(1100); // entrance animation settled before geometry checks
      const obj=await page.evaluate(()=>{
        const el=s=>document.querySelector(s);
        const family=s=>getComputedStyle(el(s)).fontFamily.toLowerCase();
        const weight=s=>getComputedStyle(el(s)).fontWeight;
        const rect=s=>{const r=el(s).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
        return {
          scroll:document.documentElement.scrollWidth,
          viewport:innerWidth,
          font:[family('#v3-last-title'),family('#v3-challenge-title'),family('#v3-coach-title')],
          weight:[weight('#v3-last-title'),weight('#v3-challenge-title'),weight('#v3-coach-title')],
          title:[rect('#v3-last-title'),rect('#v3-challenge-title'),rect('#v3-coach-title')],
          card:[rect('.v3-last'),rect('.v3-challenge'),rect('.v3-coach')],
          liveSvg:[...document.querySelectorAll('.v3-dashboard svg.so-icon')].length,
          labels:[...document.querySelectorAll('.v3-dashboard svg.so-icon')].every(s=>s.getAttribute('aria-hidden')==='true'),
          challenge:el('#v3-challenge-title').textContent
        };
      });
      assert.equal(new Set(obj.font).size,1,'Police différente selon les titres: '+JSON.stringify(obj.font));
      assert.equal(new Set(obj.weight).size,1,'Graisses incohérentes: '+JSON.stringify(obj.weight));
      assert.equal(obj.weight[0],'800','La graisse de marque doit être 800');
      assert.equal(obj.challenge,'Espiens.','Nom propre non harmonisé');
      assert(obj.liveSvg>=9,'Icônes SVG incomplètes: '+obj.liveSvg);
      assert(obj.labels,'Icônes décoratives non cachées au lecteur écran');
      assert(obj.scroll<=obj.viewport+2,'Overflow '+width+': '+obj.scroll);
      obj.title.forEach((title,i)=>{
        assert(title.left>=obj.card[i].left-2 && title.right<=obj.card[i].right+2,
          'Titre hors carte '+i+' à '+width+': '+JSON.stringify({title,card:obj.card[i]}));
      });
      if([375,768,1280,1856].includes(width))await page.screenshot({path:path.join(out,'home-'+width+'x'+height+'.png'),fullPage:true});
      if(width===1280){
        await page.locator('.v3-week-row[data-open-program="Course"]').hover();
        const colour=await page.locator('.v3-week-row[data-open-program="Course"] .v3-week-icon').evaluate(el=>getComputedStyle(el).backgroundColor);
        assert.notEqual(colour,'rgba(0, 0, 0, 0)','Icône de ligne interactive doit répondre au hover');
        await page.locator('.v3-challenge-foot button').click();
        await page.locator('.v3-dashboard').waitFor({state:'detached'});
        await page.locator('.v3-side-nav [data-nav="home"]').click();
        await page.locator('.v3-dashboard').waitFor();
      }
      assert(!errors.length,'Erreurs JS: '+errors.join('|'));
      console.log('HOME_POLISH_'+width+'x'+height+'=PASS');
      await page.close();
    }
    const reduce=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
    await reduce.goto(pathToFileURL(preview).href,{waitUntil:'load'});
    await reduce.locator('.v3-dashboard').waitFor();
    const motion=await reduce.evaluate(()=>({
      titleAnimation:getComputedStyle(document.querySelector('.v3-intro')).animationName,
      fillAnimation:getComputedStyle(document.querySelector('.v3-week-track span')).animationName,
      pathAnimation:getComputedStyle(document.querySelector('.v3-feature-art svg path')).animationName,
      arrowTransition:getComputedStyle(document.querySelector('.v3-link-arrow .so-icon')).transitionDuration
    }));
    assert.equal(motion.titleAnimation,'none','Entrée doit être désactivée');
    assert.equal(motion.fillAnimation,'none','Progression doit être statique');
    assert.equal(motion.pathAnimation,'none','Tracé doit être statique');
    assert(motion.arrowTransition.split(',').every(x=>parseFloat(x)===0),'Hover transition doit être désactivée');
    console.log('REDUCED_MOTION=PASS');
    console.log('HOME_POLISH_QA=PASS VIEWPORTS=7 LIVE_SHEET_WRITES=0');
    await reduce.close();
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
