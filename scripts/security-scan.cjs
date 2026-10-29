'use strict';
/* Fail closed if a public commit contains known classes of personal identifiers. */
const fs = require('node:fs');
const cp = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/appsscript.json'), 'utf8'));
if (manifest.webapp?.access !== 'MYSELF' || manifest.webapp?.executeAs !== 'USER_DEPLOYING') {
  throw Error('SECURITY FAIL: Apps Script must remain owner-only.');
}
const files = cp.execFileSync('git', ['ls-files', '-z'], {cwd: root}).toString().split('\0').filter(Boolean);
const checks = [
  ['Apps Script deployment identifier', /AKfycb[A-Za-z0-9_-]{20,}/],
  ['Personal Google Sheets link', /https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]{20,}/],
  ['Hard-coded Sheets identifier', /(?:spreadsheetId|SHEET|SHEET_ID)\s*[:=]\s*['"]1[A-Za-z0-9_-]{35,}['"]/],
  ['Personal e-mail', /[A-Za-z0-9._%+-]+@(?:gmail|hotmail|outlook|yahoo|protonmail)\.[A-Za-z]{2,}/i],
  ['GitHub token', /(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})/],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/]
];
const failures = [];
for (const filename of files) {
  const full = path.join(root, filename);
  if (!fs.statSync(full).isFile()) continue;
  const data = fs.readFileSync(full, 'utf8');
  for (const [kind, regex] of checks) {
    if (regex.test(data)) failures.push(filename + ': ' + kind);
  }
}
if (failures.length) {
  console.error('SPORTOS_PUBLIC_SECURITY=FAIL\n' + failures.join('\n'));
  process.exit(1);
}
console.log('SPORTOS_PUBLIC_SECURITY=PASS (' + files.length + ' tracked files, no private configuration exposed in HEAD)');
