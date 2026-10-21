'use strict';
// Responsive and brand acceptance checks in browser; 100% offline fixture.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const preview=path.join(__dirname,'../docs/apercu-v0.4.html');
 const browser=await chromium.launch({headless:true});
 const cases=[
  [320,700],[360,740],[375,812],[390,844],[430,900],[600,800],
  [760,800],[761,800],[767,800],[768,800],[820,800],[1024,768],
  [1280,720],[1440,800],[1856,824],[1920,1080],[2560,1080]
 ];
 const output=path.join(__dirname,'../artifacts/v0.4');
 fs.mkdirSync(output,{recursive:true});
 let count=0;
 try{
  for(const [width,height] of cases){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(preview).href,{waitUntil:'load'});
    await page.locator('.v3-dashboard').waitFor({timeout:12000});
    const m=await page.evaluate(()=>{
      const by=s=>document.querySelector(s),bounds=s=>{const r=by(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}};
      const visible=s=>{const el=by(s);return !!el&&getComputedStyle(el).display!=='none'};
      const inner=by('.v3-sidebar-inner');
      return{
        width:document.documentElement.scrollWidth,viewport:window.innerWidth,
        brandVisible:visible('.v3-sidebar')||visible('.v4-mobile-brand-mark'),
        sidebarVisible:visible('.v3-sidebar'),mobileNavVisible:visible('.v3-mobile-nav'),
        marks:document.querySelectorAll('.v4-brand-mark').length,
        nestedScroll:inner.scrollHeight>inner.clientHeight+3,
        sideAction:bounds('.v3-side-cta'),heroAction:bounds('.v3-btn-acid'),
        hero:bounds('.v3-feature'),topbar:bounds('.v3-topbar'),
        headingWidth:by('.v3-feature h2').scrollWidth,headingBox:by('.v3-feature h2').clientWidth,
        label:by('.v3-wordmark small')?.textContent,
        actionVisible:visible('.v3-top-cta'),
        pageHeading:by('.v3-dashboard h1')?.textContent
      };
    });
    assert(m.width<=m.viewport+2,'Horizontal overflow at '+width+'x'+height+': '+m.width+' vs '+m.viewport);
    assert(m.marks===2,'Brand mark must be duplicated exactly in desktop & mobile');
    assert(m.brandVisible&&m.actionVisible,'Logo or session CTA hidden');
    assert(m.label==='MOVE WITH INTENTION','Brand tagline mismatch');
    assert(m.heroAction.right<=width+2&&m.heroAction.left>=-2,'Hero CTA offscreen');
    assert(m.headingWidth<=m.headingBox+4,'Headline exceeds own box');
    assert(m.nestedScroll===false,'Sidebar inner has forbidden nested scrollbar');
    assert(m.sidebarVisible===(width>=768),'Sidebar breakpoint '+width);
    assert(m.mobileNavVisible===(width<768),'Mobile nav breakpoint '+width);
    if(width===1856&&height===824){
      assert(m.sideAction.top>=0&&m.sideAction.bottom<=height,'Sidebar quick action clipped on reference laptop');
      assert(m.heroAction.top>=0&&m.heroAction.top<=height,'Hero action below fold on reference screenshot');
    }
    assert(!errors.length,'Uncaught JS errors: '+errors.join(' ; '));
    if([320,375,767,768,1024,1280,1856,1920,2560].includes(width)){
      await page.screenshot({path:path.join(output,'sportos-'+width+'x'+height+'.png'),fullPage:true});
    }
    if([320,767,768,1856].includes(width)){
      await page.locator('.v3-top-cta').click();
      await page.locator('#v3-quick-title').waitFor({timeout:2500});
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#quick-root [role="dialog"]').count(),0);
    }
    await page.close();
    count++;
    console.log('ADAPTIVE_'+width+'x'+height+'=PASS');
  }
  for(const [zoom,width,height] of [[1.25,1280,900],[1.5,1280,900],[2,1024,768]]){
    const page=await browser.newPage({viewport:{width,height}});
    await page.goto(pathToFileURL(preview).href,{waitUntil:'load'});
    await page.locator('.v3-dashboard').waitFor();
    await page.evaluate(z=>document.body.style.zoom=String(z),zoom);
    const data=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert(data.scroll<=data.viewport+3,'Zoom overflow '+zoom+': '+JSON.stringify(data));
    await page.close();
    console.log('ZOOM_'+zoom+'=PASS');
  }
  console.log('V0_4_ADAPTIVE_QA=PASS');
  console.log('VIEWPORTS='+count+' ; ZOOM_TESTS=3 ; LIVE_SHEET_WRITES=0');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
