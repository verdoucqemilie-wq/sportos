#!/usr/bin/env bash
# SportOS v0.2.0 — publication sur LE déploiement Apps Script EXISTANT.
# À lancer uniquement dans Cloud Shell déjà authentifié, depuis le dépôt local SportOS.
set -Eeuo pipefail

REPO="verdoucqemilie-wq/sportos"
SHEET="1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ"
DEPLOYMENT="AKfycbx9CoVk8WioZ2a_IJl4CwBk6Mk23lLEf_9yJY_g-NBJ8Zxzog7TyXaoPAxS02PeOxZYCw"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "SportOS — mise à jour V0.2 de la WebApp existante (sans nouvelle URL)"
echo "Cible : $REPO"
echo "Base unique : $SHEET"
echo "Déploiement à actualiser : $DEPLOYMENT"

for bin in git node npm clasp; do
  command -v "$bin" >/dev/null || { echo "Outil manquant : $bin" >&2; exit 1; }
done
[[ "$(git branch --show-current)" == "main" ]] || { echo "STOP : se placer sur main." >&2; exit 1; }
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || { echo "STOP : modifications locales suivies non sauvegardées." >&2; exit 1; }
ORIGIN="$(git remote get-url origin)"
[[ "$ORIGIN" =~ ^(https://github\.com/|git@github\.com:)verdoucqemilie-wq/sportos(\.git)?$ ]] || { echo "STOP : dépôt distant non conforme." >&2; exit 1; }

git fetch origin main
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || { echo "STOP : branche locale non alignée sur GitHub. Faire git pull --ff-only." >&2; exit 1; }

if [[ ! -f .clasp.json && -f "$HOME/.config/sportos/.clasp.json" ]]; then
  cp "$HOME/.config/sportos/.clasp.json" .clasp.json
  chmod 600 .clasp.json
fi
[[ -f .clasp.json ]] || { echo "STOP : liaison Apps Script (.clasp.json) absente." >&2; exit 1; }

node - <<'JS'
const fs=require('fs'), assert=require('assert');
const clasp=JSON.parse(fs.readFileSync('.clasp.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('src/appsscript.json','utf8'));
const backend=fs.readFileSync('src/Code.gs','utf8');
const client=fs.readFileSync('src/Client.html','utf8');
const styles=fs.readFileSync('src/Styles.html','utf8');
assert.equal(typeof clasp.scriptId,'string');
assert(clasp.scriptId.length>15,'Script Apps Script non associé');
assert.equal(clasp.rootDir,'src');
assert.equal(manifest.webapp.access,'MYSELF');
assert.equal(manifest.webapp.executeAs,'USER_DEPLOYING');
assert(backend.includes('1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ'));
assert(client.includes('ath-home-heading') && styles.includes('ath-home-heading'), 'Refonte accueil V0.2 absente');
console.log('CONTROLE_CIBLE_ET_CONFIDENTIALITE=PASS');
JS

echo "=== Vérification locale obligatoire ==="
npm run verify
echo "=== Contrôle du déploiement existant ==="
BEFORE="$(clasp list-deployments)"
printf '%s\n' "$BEFORE"
COUNT="$(printf '%s\n' "$BEFORE" | grep -F -c -- "$DEPLOYMENT @")"
[[ "$COUNT" == "1" ]] || { echo "STOP : déploiement attendu introuvable ou ambigu." >&2; exit 1; }
echo "=== Prévisualisation des fichiers à synchroniser ==="
clasp show-file-status

echo "=== Synchronisation Apps Script : seul le code est remplacé, pas les données Sheets ==="
clasp push
echo "=== Mise à jour ciblée de la WebApp existante (même URL) ==="
clasp create-deployment --deploymentId "$DEPLOYMENT" --description "SportOS v0.2.0 — Accueil Athletic Wellness"
echo "=== Contrôle final ==="
AFTER="$(clasp list-deployments)"
printf '%s\n' "$AFTER"
printf '%s\n' "$AFTER" | grep -F -- "$DEPLOYMENT @" >/dev/null || {
  echo "ATTENTION : le déploiement ciblé ne figure plus dans la liste." >&2; exit 1;
}
echo "SPORTOS_V0_2_DEPLOIEMENT_CIBLE=TERMINE"
echo "Ouvrir l'URL /exec existante, vérifier confidentialité et accueil sur téléphone/ordinateur."
