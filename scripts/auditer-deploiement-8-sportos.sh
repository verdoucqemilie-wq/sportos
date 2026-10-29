#!/usr/bin/env bash
# AUDIT IMMUTABLE @8 ONLY — no clasp push, no deploy, no remote writes.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
DEPLOYMENT="${SPORTOS_DEPLOYMENT_ID:?Configurer SPORTOS_DEPLOYMENT_ID dans le shell local}"
command -v clasp >/dev/null || { echo "STOP : clasp introuvable" >&2; exit 1; }
[[ -f .clasp.json ]] || {
  if [[ -f "$HOME/.config/sportos/.clasp.json" ]]; then
    cp "$HOME/.config/sportos/.clasp.json" .clasp.json
    chmod 600 .clasp.json
  else
    echo "STOP : liaison au projet SportOS introuvable" >&2; exit 1
  fi
}
node - <<'JS'
const fs=require('fs'),assert=require('node:assert/strict');
const clasp=JSON.parse(fs.readFileSync('.clasp.json','utf8'));
assert.equal(typeof clasp.scriptId,'string');
assert(clasp.scriptId.length>15);
assert.equal(clasp.rootDir,'src');
JS
BEFORE="$(clasp list-deployments)"
node - "$BEFORE" "$DEPLOYMENT" <<'JS'
const {findTarget}=require('./scripts/deployment-version-guard-v0.6.cjs');
const [,,out,id]=process.argv;
const target=findTarget(out,id);
if(target.version!==8)throw Error('STOP : audit valable uniquement pour la version @8 ; trouvé @'+target.version);
console.log('SPORTOS_SNAPSHOT_AUDIT_CIBLE=@8');
JS
TMP="$(mktemp -d "${TMPDIR:-/tmp}/sportos-readonly-XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
# On crée une liaison uniquement LOCALE dans le répertoire temporaire.
# Pas de copie du dépôt, aucune modification de l Apps Script existante.
mkdir -p "$TMP/src"
node - "$ROOT/.clasp.json" "$TMP/.clasp.json" <<'JS'
const fs=require('fs');
const [,,from,to]=process.argv;
const cfg=JSON.parse(fs.readFileSync(from,'utf8'));
fs.writeFileSync(to,JSON.stringify({scriptId:cfg.scriptId,rootDir:'src'}),{mode:0o600});
JS
echo "Lecture du snapshot Apps Script immuable @8, en dossier temporaire isolé..."
(cd "$TMP" && clasp pull --versionNumber 8 >/dev/null)
node "$ROOT/scripts/classify-deployed-v0.6.cjs" "$TMP/src" "$ROOT"
echo "AUDIT_EN_LECTURE_SEULE=TERMINE"
