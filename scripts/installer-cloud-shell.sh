#!/usr/bin/env bash
# SPORTOS: INSTALLATION UNIQUE — Google Sheet personnel, GitHub privé, Apps Script propriétaire.
# Ce script ne crée aucun Google Sheet de recette et ne soumet aucune séance fictive.
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SHEET_ID='1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ'
REPO='verdoucqemilie-wq/sportos'
APP_NAME='SportOS'
STATE_DIR="$HOME/.config/sportos"
cd "$ROOT"
trap 'echo; echo "Installation interrompue. Aucun historique sportif n’a été modifié par ce script." >&2' ERR

echo 'SPORTOS — Installation sur UN SEUL environnement personnel'
echo "Base cible : https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit"
echo "Dépôt GitHub cible : ${REPO} (privé)"
echo 'Rappel : authentifie Google avec ton compte personnel et GitHub avec ton compte privé.'
echo 'Apps Script API : https://script.google.com/home/usersettings (activer avant clasp)'
echo

command -v node >/dev/null || { echo 'Node.js >=20 nécessaire dans Cloud Shell.' >&2; exit 1; }
node -e 'if(Number(process.versions.node.split(".")[0])<20) {console.error("Node.js 20+ requis"); process.exit(1);}'
command -v npm >/dev/null || { echo 'npm requis.' >&2; exit 1; }
command -v git >/dev/null || { echo 'git requis.' >&2; exit 1; }
if ! command -v gh >/dev/null; then
  echo 'Installation de GitHub CLI (gh)...'
  sudo apt-get update -qq
  sudo apt-get install -y gh
fi
if ! command -v clasp >/dev/null; then
  echo 'Installation de Google clasp...'
  if ! npm install --global @google/clasp; then
    mkdir -p "$STATE_DIR/tools"
    npm install --prefix "$STATE_DIR/tools" @google/clasp
    export PATH="$STATE_DIR/tools/node_modules/.bin:$PATH"
  fi
fi

# Vérifier les sources et le manifeste AVANT toute action distante.
node scripts/verify-local.cjs
npm test

echo
echo '===== ÉTAPE 1 : GITHUB PRIVÉ ====='
if ! gh auth status >/dev/null 2>&1; then
  echo 'Authentification GitHub nécessaire. Une autorisation dans le navigateur va s’ouvrir.'
  gh auth login --hostname github.com --git-protocol https --web
fi
GH_LOGIN="$(gh api user --jq .login)"
if [[ "$GH_LOGIN" != 'verdoucqemilie-wq' ]]; then
  echo "Compte GitHub inattendu : ${GH_LOGIN}. Se connecter à verdoucqemilie-wq avant de continuer." >&2
  exit 1
fi

if [[ ! -d .git ]]; then
  git init -b main
fi
if [[ -z "$(git config user.name || true)" ]]; then git config user.name "$GH_LOGIN"; fi
if [[ -z "$(git config user.email || true)" ]]; then git config user.email '313347559+verdoucqemilie-wq@users.noreply.github.com'; fi

git add README.md package.json .gitignore src/ scripts/ tests/ docs/
if ! git diff --cached --quiet; then
  git commit -m 'SportOS v0.1.1 — première WebApp privée pour Google Sheets'
fi
if gh repo view "$REPO" >/dev/null 2>&1; then
  VISIBILITY="$(gh repo view "$REPO" --json visibility --jq .visibility)"
  [[ "$VISIBILITY" == 'PRIVATE' ]] || { echo 'Dépôt GitHub existant NON PRIVÉ. Arrêt.' >&2; exit 1; }
  ORIGIN="$(git remote get-url origin 2>/dev/null || true)"
  if [[ -z "$ORIGIN" ]]; then
    git remote add origin "https://github.com/${REPO}.git"
  elif [[ "$ORIGIN" != *"github.com/${REPO}"* ]]; then
    echo "Remote inattendu ($ORIGIN) : arrêt pour ne pas pousser au mauvais endroit." >&2
    exit 1
  fi
  git push -u origin main
else
  gh repo create "$REPO" --private --description 'SportOS — coaching sportif personnel, WebApp Apps Script + Google Sheets' --source=. --remote=origin --push
fi
[[ "$(gh repo view "$REPO" --json visibility --jq .visibility)" == 'PRIVATE' ]] || { echo 'Visibilité GitHub non conforme.' >&2; exit 1; }
echo "GitHub prêt : https://github.com/${REPO} (privé)"

echo
echo '===== ÉTAPE 2 : GOOGLE APPS SCRIPT (MÊME SHEET) ====='
mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR"
if ! clasp show-authorized-user >/dev/null 2>&1; then
  echo 'Authentification Google nécessaire : UTILISER LE COMPTE PERSONNEL PROPRIÉTAIRE DU SHEET.'
  clasp login --no-localhost
fi
if [[ -f "$STATE_DIR/.clasp.json" ]]; then
  cp "$STATE_DIR/.clasp.json" .clasp.json
  echo 'Association Apps Script existante retrouvée : aucun nouveau projet créé.'
elif [[ -f .clasp.json ]]; then
  cp .clasp.json "$STATE_DIR/.clasp.json"
  chmod 600 "$STATE_DIR/.clasp.json"
else
  echo "Création d’un projet Apps Script lié au Google Sheet EXISTANT."
  INIT="$(mktemp -d)"
  (
    cd "$INIT"
    clasp create-script --title "$APP_NAME" --parentId "$SHEET_ID"
  )
  [[ -f "$INIT/.clasp.json" ]] || { echo 'Aucun ID Apps Script reçu.' >&2; exit 1; }
  cp "$INIT/.clasp.json" .clasp.json
  node -e 'const fs=require("fs");const p=".clasp.json";let x=JSON.parse(fs.readFileSync(p,"utf8"));x.rootDir="src";fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");'
  cp .clasp.json "$STATE_DIR/.clasp.json"
  chmod 600 "$STATE_DIR/.clasp.json"
  rm -rf "$INIT"
fi
# On restaure systématiquement le répertoire source et on vérifie la cible.
node - <<'JS'
const fs=require('fs');
const x=JSON.parse(fs.readFileSync('.clasp.json','utf8'));
if(!x.scriptId || x.rootDir!=='src'){throw Error('Mapping clasp incomplet : scriptId ou rootDir inattendu');}
const manifest=JSON.parse(fs.readFileSync('src/appsscript.json','utf8'));
if(manifest.webapp?.access!=='MYSELF' || manifest.webapp?.executeAs!=='USER_DEPLOYING'){
 throw Error('Déploiement privé obligatoire');
}
console.log('Apps Script ID obtenu (conservé localement, non envoyé sur GitHub).');
JS

echo 'Synchronisation du code vers le projet Apps Script attaché au Sheet...'
clasp show-file-status
clasp push

echo
echo '===== ÉTAPE 3 : PUBLICATION WEBAPP PRIVÉE ====='
echo 'IMPORTANT : accès MYSELF / Exécuter en tant que propriétaire, spécifié dans le manifeste.'
if [[ -s "$STATE_DIR/deployment-id.txt" ]]; then
  DEPLOYMENT="$(cat "$STATE_DIR/deployment-id.txt")"
  clasp create-deployment --deploymentId "$DEPLOYMENT" --description 'SportOS v0.1.1 — installation directe privée' | tee "$STATE_DIR/last-deployment.log"
else
  clasp create-deployment --description 'SportOS v0.1.1 — installation directe privée' | tee "$STATE_DIR/last-deployment.log"
fi
clasp list-deployments | tee "$STATE_DIR/deployments.txt"

echo
echo '===== FIN ====='
echo "Code GitHub privé : https://github.com/${REPO}"
echo "Base unique : https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit"
echo 'Ouvre Déployer > Gérer les déploiements dans Apps Script pour obtenir et vérifier l’URL /exec.'
echo 'Contrôle la lecture des programmes avant de saisir une nouvelle VRAIE séance.'
echo 'Si aucun /exec n’apparaît ou si accès ≠ Moi uniquement : arrête et vérifie le manifeste / déploiement.'
echo 'Aucun faux historique sportif n’a été écrit par ce script.'
