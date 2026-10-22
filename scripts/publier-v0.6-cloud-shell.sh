#!/usr/bin/env bash
# SportOS V0.6 — published to existing private WebApp only, no new deployment.
set -Eeuo pipefail

REPO="verdoucqemilie-wq/sportos"
SHEET="1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ"
DEPLOYMENT="AKfycbx9CoVk8WioZ2a_IJl4CwBk6Mk23lLEf_9yJY_g-NBJ8Zxzog7TyXaoPAxS02PeOxZYCw"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==== SPORTOS V0.6 — publication contrôlée ===="
echo "Repo : $REPO"
echo "Google Sheet unique : $SHEET"
echo "Déploiement existant : $DEPLOYMENT"

for cmd in git node npm clasp; do
  command -v "$cmd" >/dev/null || { echo "STOP : outil absent : $cmd" >&2; exit 1; }
done
[[ "$(git branch --show-current)" == "main" ]] || { echo "STOP : branche main obligatoire." >&2; exit 1; }
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || { echo "STOP : modifications locales non publiées." >&2; exit 1; }
ORIGIN="$(git remote get-url origin)"
[[ "$ORIGIN" =~ ^(https://github\.com/|git@github\.com:)verdoucqemilie-wq/sportos(\.git)?$ ]] || {
  echo "STOP : remote GitHub inattendu : $ORIGIN" >&2; exit 1;
}
git fetch origin main
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || {
  echo "STOP : local main non synchronisé avec GitHub." >&2; exit 1;
}
if [[ ! -f .clasp.json && -f "$HOME/.config/sportos/.clasp.json" ]]; then
  cp "$HOME/.config/sportos/.clasp.json" .clasp.json
  chmod 600 .clasp.json
fi
[[ -f .clasp.json ]] || { echo "STOP : liaison .clasp.json introuvable." >&2; exit 1; }

node - <<'JS'
const fs=require('fs'),assert=require('node:assert/strict');
const clasp=JSON.parse(fs.readFileSync('.clasp.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('src/appsscript.json','utf8'));
const code=fs.readFileSync('src/Code.gs','utf8');
const client=fs.readFileSync('src/Client.html','utf8');
const styles=fs.readFileSync('src/Styles.html','utf8');
const index=fs.readFileSync('src/Index.html','utf8');
assert.equal(clasp.rootDir,'src','clasp rootDir doit être src');
assert.equal(typeof clasp.scriptId,'string');
assert(clasp.scriptId.length>15,'scriptId non valide');
assert.equal(manifest.webapp.access,'MYSELF','WebApp non privée');
assert.equal(manifest.webapp.executeAs,'USER_DEPLOYING','WebApp doit être exécutée par sa propriétaire');
assert(code.includes('1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ'),'Mauvaise base Google Sheets');
assert(index.includes('sport-v3 sport-v4'),'Shell SportOS absent');
assert(styles.includes('SPORTOS V0.6'),'Styles V0.6 absents');
assert(client.includes('so-session-page'),'Espace de retour V0.6 absent');
assert(client.includes('soEffortScale'),'Échelle d’effort V0.6 absente');
assert(client.includes("server('saveCardio',p)"),'Contrat cardio non vérifié');
assert(client.includes("server('saveStrength'"),'Contrat renforcement non vérifié');
assert(client.includes("v3Icon(type)"),'Icônes sport absentes');
console.log('SPORTOS_V0_6_SOURCE_ET_CONFIDENTIALITE=PASS');
JS

echo "==== Vérifications locales — aucune écriture Sheets ===="
npm run verify

echo "==== Contrôle de la cible AVANT toute écriture Apps Script ===="
BEFORE="$(clasp list-deployments)"
printf '%s\n' "$BEFORE"
PREVIOUS_VERSION="$(node scripts/deployment-version-guard-v0.6.cjs before "$DEPLOYMENT" "$BEFORE")"
echo "SPORTOS_V0_6_PRECHECK=@$PREVIOUS_VERSION"
echo "==== État des fichiers du projet existant ===="
clasp show-file-status

# Second preflight guards against a deployment version changing during checks.
BEFORE_PUSH="$(clasp list-deployments)"
node scripts/deployment-version-guard-v0.6.cjs unchanged "$DEPLOYMENT" "$BEFORE_PUSH" "$PREVIOUS_VERSION" >/dev/null

echo "==== Synchronisation code sur le projet Apps Script déjà lié ===="
clasp push

# If another deployment was published while pushing source, STOP without overwriting its deployment.
BEFORE_DEPLOY="$(clasp list-deployments)"
node scripts/deployment-version-guard-v0.6.cjs unchanged "$DEPLOYMENT" "$BEFORE_DEPLOY" "$PREVIOUS_VERSION" >/dev/null

echo "==== Mise à jour du déploiement EXISTANT, sans nouveau projet ni URL ===="
clasp create-deployment --deploymentId "$DEPLOYMENT" --description "SportOS v0.6.0 — Home icons & Premium Session Feedback"
echo "==== Contrôle final par identifiant et numéro ===="
AFTER="$(clasp list-deployments)"
printf '%s\n' "$AFTER"
NEW_VERSION="$(node scripts/deployment-version-guard-v0.6.cjs after "$DEPLOYMENT" "$AFTER" "$PREVIOUS_VERSION")"
echo "SPORTOS_V0_6_VERSION_CIBLE=@$NEW_VERSION"
echo "SPORTOS_V0_6_DEPLOIEMENT_CIBLE=TERMINE"
echo "Ouvrir l'URL /exec existante ; confirmer Moi uniquement, page d'accueil et retour de séance."
