#!/usr/bin/env bash
# SportOS V0.9.2 — post-publication verification only.
# Never pushes, redeploys, creates versions or writes any Google Sheet.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
TARGET="AKfycbx9CoVk8WioZ2a_IJl4CwBk6Mk23lLEf_9yJY_g-NBJ8Zxzog7TyXaoPAxS02PeOxZYCw"
EXPECTED_VERSION="${1:-17}"
[[ "$EXPECTED_VERSION" =~ ^[1-9][0-9]*$ ]] || { echo "STOP : numéro de version attendu invalide." >&2; exit 2; }
for cmd in git node clasp; do command -v "$cmd" >/dev/null || { echo "STOP : outil manquant : $cmd" >&2; exit 2; }; done
[[ -f .clasp.json ]] || { echo "STOP : liaison .clasp.json manquante (ne pas recréer de projet)." >&2; exit 2; }
node - <<'JS'
const fs=require('node:fs'),assert=require('node:assert/strict');
const cfg=JSON.parse(fs.readFileSync('.clasp.json','utf8'));
assert(cfg.scriptId&&typeof cfg.scriptId==='string'&&cfg.scriptId.length>15,'Script ID manquant');
assert.equal(cfg.rootDir,'src','Projet clasp inattendu : rootDir');
JS
echo "==== SportOS : lecture du déploiement existant, aucune écriture ===="
LIST="$(clasp list-deployments)"
printf '%s\n' "$LIST"
ACTUAL="$(node - "$TARGET" "$LIST" <<'JS'
const {findTarget}=require('./scripts/deployment-version-guard-v0.6.cjs');
const [,,id,output]=process.argv;
console.log(findTarget(output,id).version);
JS
)"
echo "SPORTOS_CIBLE_DEPLOYEE=@$ACTUAL"
if [[ "$ACTUAL" != "$EXPECTED_VERSION" ]]; then
  echo "SPORTOS_V0_9_2_POSTDEPLOY=NON_CONFIRME; ATTENDU=@$EXPECTED_VERSION; ACTUEL=@$ACTUAL; ECRITURES=0"
  echo "Le déploiement n'est pas sur la version attendue. Ne pas republier sans diagnostic."
  exit 3
fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/src"
node - "$ROOT/.clasp.json" "$TMP/.clasp.json" <<'JS'
const fs=require('node:fs');
const [,,from,to]=process.argv;
const cfg=JSON.parse(fs.readFileSync(from,'utf8'));
fs.writeFileSync(to,JSON.stringify({scriptId:cfg.scriptId,rootDir:'src'}),{mode:0o600});
JS
echo "==== Téléchargement en lecture seule de la version @$ACTUAL, dans un dossier temporaire ===="
(cd "$TMP" && clasp pull --versionNumber "$ACTUAL" >/dev/null)
RESULT="$(node scripts/classify-deployed-v0.9.2.cjs "$TMP/src" "$ROOT")"
echo "$RESULT"
if [[ "$RESULT" == "SPORTOS_SNAPSHOT=V0_9_2" ]]; then
  echo "SPORTOS_V0_9_2_POSTDEPLOY=PASS; VERSION=@$ACTUAL; ID_CIBLE=OK; ECRITURES=0"
else
  echo "SPORTOS_V0_9_2_POSTDEPLOY=ECHEC; VERSION=@$ACTUAL; CODE_NON_CONFORME; ECRITURES=0" >&2
  exit 4
fi
