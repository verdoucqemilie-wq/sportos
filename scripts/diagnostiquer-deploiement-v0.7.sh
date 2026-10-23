#!/usr/bin/env bash
# SportOS: diagnosis of CURRENT immutable deployed version and mutable remote HEAD.
# Strictly read-only against Google Apps Script. No push, deploy, Sheet reads/writes.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
TARGET="AKfycbx9CoVk8WioZ2a_IJl4CwBk6Mk23lLEf_9yJY_g-NBJ8Zxzog7TyXaoPAxS02PeOxZYCw"
for command in git node clasp; do
  command -v "$command" >/dev/null || { echo "DIAGNOSTIC_STOP=OUTIL_MANQUANT" >&2; exit 1; }
done
[[ "$(git branch --show-current)" == "main" ]] || { echo "DIAGNOSTIC_STOP=MAUVAISE_BRANCHE" >&2; exit 1; }
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || { echo "DIAGNOSTIC_STOP=DEPOT_NON_SYNCHRONISE" >&2; exit 1; }
if [[ ! -f .clasp.json && -f "$HOME/.config/sportos/.clasp.json" ]]; then
  cp "$HOME/.config/sportos/.clasp.json" .clasp.json
  chmod 600 .clasp.json
fi
[[ -f .clasp.json ]] || { echo "DIAGNOSTIC_STOP=LIAISON_ABSENTE" >&2; exit 1; }
node - <<'JS'
const fs=require('node:fs'),assert=require('node:assert/strict');
const cfg=JSON.parse(fs.readFileSync('.clasp.json','utf8'));
assert.equal(cfg.rootDir,'src');
assert.equal(typeof cfg.scriptId,'string');
assert(cfg.scriptId.length>15);
JS
OUT="$(clasp list-deployments)"
# Deployment-version-guard parses the exact ID; never guess if another WebApp changed.
VERSION="$(node - "$OUT" "$TARGET" <<'JS'
const {findTarget}=require('./scripts/deployment-version-guard-v0.6.cjs');
const target=findTarget(process.argv[2],process.argv[3]);
console.log(target.version);
JS
)"
[[ "$VERSION" =~ ^[1-9][0-9]*$ ]] || {
  echo "DIAGNOSTIC_STOP=VERSION_INVALIDE" >&2
  exit 1
}
echo "CIBLE_VERIFIEE=@$VERSION"
TEMP="$(mktemp -d "/tmp/sportos-inspect-XXXXXX")"
trap 'rm -rf "$TEMP"' EXIT
node - "$ROOT/.clasp.json" "$TEMP" <<'JS'
const fs=require('node:fs'),path=require('node:path');
const [,,source,destination]=process.argv;
const cfg=JSON.parse(fs.readFileSync(source,'utf8'));
for(const part of ['published','head']){
  const base=path.join(destination,part);
  fs.mkdirSync(path.join(base,'src'),{recursive:true});
  fs.writeFileSync(path.join(base,'.clasp.json'),JSON.stringify({scriptId:cfg.scriptId,rootDir:'src'}),{mode:0o600});
}
JS
# Both pulls are from the remote, exclusively into temporary directories.
(cd "$TEMP/published" && clasp pull --versionNumber "$VERSION" >/dev/null)
echo "==== Version immuable déployée : diagnostic sans contenu source ===="
node "$ROOT/scripts/diagnostic-readonly-v0.7.cjs" "$TEMP/published/src" "$ROOT" "DEPLOYE_${VERSION}"
(cd "$TEMP/head" && clasp pull >/dev/null)
echo "==== Projet de travail Apps Script HEAD : diagnostic sans contenu source ===="
node "$ROOT/scripts/diagnostic-readonly-v0.7.cjs" "$TEMP/head/src" "$ROOT" "HEAD_DISTANT"
AFTER="$(clasp list-deployments)"
LATEST="$(node - "$AFTER" "$TARGET" <<'JS'
const {findTarget}=require('./scripts/deployment-version-guard-v0.6.cjs');
console.log(findTarget(process.argv[2],process.argv[3]).version);
JS
)"
[[ "$LATEST" == "$VERSION" ]] || { echo "DIAGNOSTIC_STOP=DEPLOIEMENT_MODIFIE_PENDANT_INSPECTION"; exit 1; }
echo "DIAGNOSTIC_READONLY=TERMINE"
