#!/usr/bin/env bash
# SportOS V0.9.1: safely UPDATE existing personal Apps Script WebApp only.
# Immutable deployed snapshot + mutable remote HEAD must both match trusted Git code.
# A clasp push replaces the whole script project, so unknown HEAD MUST block publishing.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DEPLOYMENT="${SPORTOS_DEPLOYMENT_ID:?Configurer SPORTOS_DEPLOYMENT_ID dans le shell local}"
REPO="verdoucqemilie-wq/sportos"
SHEET="${SPORTOS_SPREADSHEET_ID:?Configurer SPORTOS_SPREADSHEET_ID dans le shell local}"
MODE="${1:---audit-only}"
case "$MODE" in --audit-only|--publish) :;; *) echo 'Utilisation : bash scripts/publier-v0.9.1-cloud-shell.sh [--audit-only|--publish]' >&2; exit 2;; esac
echo "==== SportOS V0.9.1 : mode $MODE ; déploiement existant ===="
for cmd in git node npm clasp; do
  command -v "$cmd" >/dev/null || { echo "STOP : commande absente : $cmd" >&2; exit 1; }
done
[[ "$(git branch --show-current)" == "main" ]] || { echo "STOP : branche main obligatoire." >&2; exit 1; }
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || {
  echo "STOP : fichiers suivis modifiés dans Cloud Shell." >&2; exit 1;
}
ORIGIN="$(git remote get-url origin)"
[[ "$ORIGIN" =~ ^(https://github\.com/|git@github\.com:)verdoucqemilie-wq/sportos(\.git)?$ ]] || {
  echo "STOP : le dépôt Git distant ne correspond pas à SportOS." >&2; exit 1;
}
# Only the account owning the private personal Sheet may publish this deployment.
AUTHORIZED="$(clasp show-authorized-user)"
[[ -n "${SPORTOS_GOOGLE_ACCOUNT:-}" && "$AUTHORIZED" == *"logged in as ${SPORTOS_GOOGLE_ACCOUNT}."* ]] || {
  echo "STOP : le compte clasp n'est pas le compte personnel propriétaire." >&2; exit 1;
}
git fetch origin main
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || {
  echo "STOP : le code local doit être égal à GitHub main." >&2; exit 1;
}
[[ "$(git show 31a9dde8803171b3de053e8933f8297ff25c3993:src/Code.gs | sha256sum | cut -d' ' -f1)" == "$(sha256sum src/Code.gs | cut -d' ' -f1)" ]] || {
  echo "STOP : le moteur SportOS ne correspond pas à la version V0.9.1 approuvée." >&2; exit 1;
}
if [[ ! -f .clasp.json && -f "$HOME/.config/sportos/.clasp.json" ]]; then
  cp "$HOME/.config/sportos/.clasp.json" .clasp.json
  chmod 600 .clasp.json
fi
[[ -f .clasp.json ]] || { echo "STOP : liaison Apps Script existante introuvable." >&2; exit 1; }
node - <<'JS'
const fs=require('node:fs'),assert=require('node:assert/strict');
const cfg=JSON.parse(fs.readFileSync('.clasp.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('src/appsscript.json','utf8'));
const code=fs.readFileSync('src/Code.gs','utf8');
const client=fs.readFileSync('src/Client.html','utf8');
const styles=fs.readFileSync('src/Styles.html','utf8');
assert.equal(cfg.rootDir,'src','Clasp doit cibler src');
assert.equal(typeof cfg.scriptId,'string');
assert(cfg.scriptId.length>15,'Identifiant Apps Script manquant');
assert.equal(manifest.webapp.access,'MYSELF','Application non privée');
assert.equal(manifest.webapp.executeAs,'USER_DEPLOYING','Exécution propriétaire obligatoire');
assert(code.includes("spreadsheetPropertyKey: 'SPORTOS_SPREADSHEET_ID'"),'Mauvaise base sportive');
assert(client.includes('function program(){')&&client.includes('sp7-page'),'Page Programme V0.7 absente');
assert(styles.includes('SPORTOS V0.7'),'Styles Programme V0.7 absents');
assert(client.includes('so-session-page'),'Journal de séance absent');
assert(client.includes('function so8WeeklyPlan('),'Programme hebdomadaire V0.9.1 absent');
assert(client.includes('so8CompletionBanner()'),'Félicitations V0.9.1 absentes');
assert(client.includes('secondsReserve')&&client.includes('elevationGain')&&client.includes('averageSpeed'),'Champs V0.9.1 absents');
assert(code.includes("Réserve tenue (s)")&&code.includes("Dénivelé positif (m)")&&code.includes("Vitesse moyenne (km/h)"),'Écriture V0.9.1 absente');
assert(styles.includes('SportOS v0.9'),'Styles V0.9 absents');
assert(styles.includes('.so91-week-rail'),'Navigation hebdomadaire V0.9.1 absente');
assert(client.includes('so91Cycle()')&&client.includes('data-program-week'),'Navigation des 4 semaines absente');
assert(client.includes('M12.409 13.017'),'Icône Lucide officielle B absente');
assert(client.includes('so9Prep('),'Préparation et récupération V0.9.1 absentes');
assert(client.includes('Modifier mon retour')&&client.includes("pencil:'<path"),'Édition de retours V0.9.1 absente');
assert(code.includes('existingSessionRow')&&code.includes('existingRow'),'Protections d’édition serveur absentes');
assert(manifest.oauthScopes.includes('https://www.googleapis.com/auth/spreadsheets'),'Permissions Sheets absentes');
console.log('SPORTOS_V0_9_1_LOCAL_ET_PRIVACY=PASS');
JS
echo "==== Tests métier, sécurité et responsive ===="
npm run verify
# All pulls below happen strictly in disposable folders, never inside the Git checkout.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
node - "$ROOT/.clasp.json" "$TMP" <<'JS'
const fs=require('node:fs'),path=require('node:path');
const [,,configFile,base]=process.argv;
const cfg=JSON.parse(fs.readFileSync(configFile,'utf8'));
for(const name of ['deployed','head','verify']){
  const root=path.join(base,name);
  fs.mkdirSync(path.join(root,'src'),{recursive:true});
  fs.writeFileSync(path.join(root,'.clasp.json'),JSON.stringify({scriptId:cfg.scriptId,rootDir:'src'}),{mode:0o600});
}
JS
target_version(){
  node - "$1" "$DEPLOYMENT" <<'JS'
const {findTarget}=require('./scripts/deployment-version-guard-v0.6.cjs');
const [,,output,id]=process.argv;
const target=findTarget(output,id);
if(!Number.isSafeInteger(target.version)||target.version<1)throw Error('STOP : version déployée invalide');
console.log(target.version);
JS
}
snapshot_label(){
  node "$ROOT/scripts/classify-deployed-v0.9.1.cjs" "$1/src" "$ROOT" | cut -d= -f2
}
[[ "$(snapshot_label "$ROOT")" == "V0_9_1" ]] || { echo 'STOP : les sources locales ne correspondent pas au commit V0.9.1 approuvé' >&2; exit 1; }
echo "==== Lecture du déploiement et de HEAD, aucune écriture distante ===="
BEFORE="$(clasp list-deployments)"
printf '%s\n' "$BEFORE"
PREVIOUS_VERSION="$(target_version "$BEFORE")"
echo "SPORTOS_CIBLE_AVANT=@$PREVIOUS_VERSION"
(cd "$TMP/deployed" && clasp pull --versionNumber "$PREVIOUS_VERSION" >/dev/null)
DEPLOYED="$(snapshot_label "$TMP/deployed")"
echo "SPORTOS_CODE_DEPLOYE=$DEPLOYED"
case "$DEPLOYED" in
  V0_9_1)
    echo "SPORTOS_V0_9_1_DEJA_DEPLOYEE=@$PREVIOUS_VERSION — aucune publication nécessaire."
    exit 0;;
  V0_7|V0_8|V0_9) echo "Version précédente reconnue, publication V0.9.1 autorisable.";;
  *) echo "STOP : contenu du déploiement inconnu ; aucun push." >&2; exit 1;;
esac
(cd "$TMP/head" && clasp pull >/dev/null)
HEAD_LABEL="$(snapshot_label "$TMP/head")"
echo "SPORTOS_CODE_DISTANT_HEAD=$HEAD_LABEL"
case "$HEAD_LABEL" in
  V0_7|V0_8|V0_9|V0_9_1) :;;
  *) echo "STOP : code Apps Script HEAD inconnu ; clasp push écraserait des changements." >&2; exit 1;;
esac

# Verify that the WebApp deployment did not move during the audit.
NOW="$(clasp list-deployments)"
[[ "$(target_version "$NOW")" == "$PREVIOUS_VERSION" ]] || {
  echo "STOP : la version déployée a changé pendant l'audit." >&2; exit 1;
}

if [[ "$MODE" == "--audit-only" ]]; then
  echo "SPORTOS_V0_9_1_AUDIT=PASS; CIBLE_AVANT=@$PREVIOUS_VERSION; DEPLOYE=$DEPLOYED; HEAD=$HEAD_LABEL; ECRITURES=0"
  echo 'Pour publier après ce contrôle : relancer le même script avec --publish.'
  exit 0
fi

if [[ "$HEAD_LABEL" == "V0_9_1" ]]; then
  echo "SPORTOS_CODE_HEAD_DEJA_V0_9_1 — aucune synchronisation de code."
else
  # Re-pull HEAD immediately before push to detect concurrent edits.
  (cd "$TMP/verify" && clasp pull >/dev/null)
  [[ "$(snapshot_label "$TMP/verify")" == "$HEAD_LABEL" ]] || {
    echo "STOP : HEAD Apps Script modifié entre les contrôles." >&2; exit 1;
  }
  echo "==== Push sur le projet existant (pas de nouvelle WebApp) ===="
  clasp show-file-status
  clasp push
fi

# A push writes HEAD; confirm the live HEAD is exactly the approved V0.9.1 sources.
(cd "$TMP/verify" && clasp pull >/dev/null)
[[ "$(snapshot_label "$TMP/verify")" == "V0_9_1" ]] || {
  echo "STOP : HEAD distant différent de V0.9.1 ; déploiement conservé." >&2; exit 1;
}
NOW="$(clasp list-deployments)"
[[ "$(target_version "$NOW")" == "$PREVIOUS_VERSION" ]] || {
  echo "STOP : le déploiement a changé ; ne pas écraser l'autre version." >&2; exit 1;
}
echo "==== Nouvelle version de l'ID existant : l'URL /exec est conservée ===="
clasp create-deployment --deploymentId "$DEPLOYMENT" --description "SportOS v0.9.1 — Responsive, retours modifiables et coaching guidé"
AFTER="$(clasp list-deployments)"
NEW_VERSION="$(target_version "$AFTER")"
[[ "$NEW_VERSION" -gt "$PREVIOUS_VERSION" ]] || {
  echo "STOP : impossible de confirmer l'incrément de la version cible." >&2; exit 1;
}
echo "==== Contrôle de l'instantané effectivement publié ===="
(cd "$TMP/deployed" && clasp pull --versionNumber "$NEW_VERSION" >/dev/null)
[[ "$(snapshot_label "$TMP/deployed")" == "V0_9_1" ]] || {
  echo "ATTENTION : nouvelle version publiée mais snapshot ne correspond pas à V0.9.1." >&2; exit 1;
}
echo "SPORTOS_V0_9_1_VERSION_CIBLE=@$NEW_VERSION"
echo "SPORTOS_V0_9_1_DEPLOIEMENT_CIBLE=TERMINE"
echo "Vérifier l'URL /exec habituelle et le menu Programme sans créer de fausse séance."
