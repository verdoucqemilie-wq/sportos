#!/usr/bin/env bash
# SportOS V0.5 — publication sur le déploiement privé EXISTANT.
set -Eeuo pipefail

REPO="verdoucqemilie-wq/sportos"
SHEET="1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ"
DEPLOYMENT="AKfycbx9CoVk8WioZ2a_IJl4CwBk6Mk23lLEf_9yJY_g-NBJ8Zxzog7TyXaoPAxS02PeOxZYCw"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==== SPORTOS V0.5 — publication contrôlée ===="
echo "Code GitHub : $REPO"
echo "Base unique : $SHEET"
echo "Déploiement à mettre à jour : $DEPLOYMENT"

for executable in git node npm clasp; do
  command -v "$executable" >/dev/null || {
    echo "STOP : outil requis absent : $executable" >&2; exit 1;
  }
done
[[ "$(git branch --show-current)" == "main" ]] || {
  echo "STOP : choisir la branche main." >&2; exit 1;
}
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || {
  echo "STOP : fichiers suivis modifiés localement." >&2; exit 1;
}
ORIGIN="$(git remote get-url origin)"
[[ "$ORIGIN" =~ ^(https://github\.com/|git@github\.com:)verdoucqemilie-wq/sportos(\.git)?$ ]] || {
  echo "STOP : origine GitHub inattendue : $ORIGIN" >&2; exit 1;
}
git fetch origin main
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || {
  echo "STOP : checkout local non à jour par rapport à main." >&2; exit 1;
}

# Réutiliser une liaison existante, ne jamais créer de projet Apps Script.
if [[ ! -f .clasp.json && -f "$HOME/.config/sportos/.clasp.json" ]]; then
  cp "$HOME/.config/sportos/.clasp.json" .clasp.json
  chmod 600 .clasp.json
fi
[[ -f .clasp.json ]] || {
  echo "STOP : liaison au projet Apps Script introuvable (.clasp.json)." >&2; exit 1;
}

node - <<'JS'
const fs=require('fs');
const assert=require('node:assert/strict');
const clasp=JSON.parse(fs.readFileSync('.clasp.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('src/appsscript.json','utf8'));
const code=fs.readFileSync('src/Code.gs','utf8');
const index=fs.readFileSync('src/Index.html','utf8');
const styles=fs.readFileSync('src/Styles.html','utf8');
const client=fs.readFileSync('src/Client.html','utf8');
assert.equal(typeof clasp.scriptId,'string');
assert(clasp.scriptId.length>15,'Projet Apps Script non lié');
assert.equal(clasp.rootDir,'src','Racine clasp inattendue');
assert.equal(manifest.webapp.access,'MYSELF','WebApp doit rester privée');
assert.equal(manifest.webapp.executeAs,'USER_DEPLOYING','Exécution propriétaire obligatoire');
assert(code.includes('1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ'),'Base SportOS unique incorrecte');
assert(index.includes('sport-v3 sport-v4'),'Shell V0.5 absent');
assert(index.includes('v4-brand-mark'),'Nouveau logo manquant');
assert(styles.includes('SPORTOS V0.4'),'Responsive V0.4 absent');
assert(styles.includes('SPORTOS V0.5'),'Polish V0.5 absent');
assert(styles.includes('so-home-reveal') && styles.includes('prefers-reduced-motion:reduce'),'Animations accessibles V0.5 absentes');
assert(styles.includes('@container sportmain'),'Container queries absentes');
assert(client.includes('v4-intro-index'),'Hero V0.4 absent');
assert(client.includes('id="v3-challenge-title">Espiens'),'Typographie Espiens V0.5 absente');
assert(client.includes("v3Icon('route')"),'Iconographie V0.5 absente');
console.log('SPORTOS_V0_5_SOURCE_ET_SECURITE=PASS');
JS

echo "==== Tests locaux obligatoires ===="
npm run verify

echo "==== Inspection du déploiement existant ===="
BEFORE="$(clasp list-deployments)"
printf '%s\n' "$BEFORE"
MATCHES="$(printf '%s\n' "$BEFORE" | grep -F -c -- "$DEPLOYMENT @" || true)"
[[ "$MATCHES" == "1" ]] || {
  echo "STOP : déploiement cible introuvable ou ambigu." >&2; exit 1;
}
TARGET_LINE="$(printf '%s\n' "$BEFORE" | grep -F -- "$DEPLOYMENT @")"
if [[ "$TARGET_LINE" == *"SportOS v0.5.0"* ]]; then
  echo "SPORTOS_V0_5_DEJA_PUBLIE — aucun push ni nouveau déploiement.";
  exit 0
fi
# La version distante n'est pas confirmée ici. Le code V0.5 inclut les versions 0.3 et 0.4.
if [[ "$TARGET_LINE" == *"SportOS v0.3.0"* ]]; then
  echo "PRECHECK=PASS — déploiement actuel V0.3, migration cumulative vers V0.5"
elif [[ "$TARGET_LINE" == *"SportOS v0.4.0"* ]]; then
  echo "PRECHECK=PASS — déploiement actuel V0.4, mise à jour vers V0.5"
else
  echo "STOP : version Apps Script inattendue. Aucune écriture sur le projet." >&2
  echo "Ligne observée : $TARGET_LINE" >&2
  exit 1
fi
echo "==== Fichiers à synchroniser ===="
clasp show-file-status
echo "==== Synchronisation du code (sans saisie sportive) ===="
clasp push
echo "==== Actualisation de la WebApp existante, même URL ===="
clasp create-deployment --deploymentId "$DEPLOYMENT" --description "SportOS v0.5.0 — Brand System & Adaptive Experience"
echo "==== Contrôle final ===="
AFTER="$(clasp list-deployments)"
printf '%s\n' "$AFTER"
FINAL_LINE="$(printf '%s\n' "$AFTER" | grep -F -- "$DEPLOYMENT @" || true)"
[[ "$FINAL_LINE" == *"SportOS v0.5.0"* ]] || {
  echo "ATTENTION : version cible non confirmée, contrôler Apps Script." >&2; exit 1;
}
echo "SPORTOS_V0_5_DEPLOIEMENT_CIBLE=TERMINE"
echo "Vérifier /exec sur téléphone et PC, ainsi que l'accès Moi uniquement."
