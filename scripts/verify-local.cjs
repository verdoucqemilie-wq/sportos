const fs = require('fs');
const assert = require('assert');
const root=require('path').join(__dirname,'..');
const src=fs.readFileSync(root+'/src/Code.gs','utf8');
new Function(src);
const manifest=JSON.parse(fs.readFileSync(root+'/src/appsscript.json','utf8'));
assert.equal(manifest.webapp.access,'MYSELF','WebApp must be owner-only');
assert.equal(manifest.webapp.executeAs,'USER_DEPLOYING','WebApp must run as owner');
assert(src.includes('1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ'),'Unexpected target Sheet');
for(const file of ['Index.html','Styles.html','Client.html']) {
 const html=fs.readFileSync(root+'/src/'+file,'utf8');
 assert(html.length>100, 'Missing HTML '+file);
 if(file==='Client.html') new Function(html.replace(/^<script>/,'').replace(/<\/script>\s*$/,'') );
}
console.log('PASS Apps Script JS syntax, private manifest and unique target Google Sheet');
