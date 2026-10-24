# Publication contrôlée — SportOS V0.9 (préparation)

**Cible : WebApp personnelle existante, URL /exec inchangée.**
**État au 24/10/2026 : PR #17 fusionnée dans `main` (commit `3503ae46db91073e9faf102fde29d7a95f8b7fdc`) ; aucun déploiement Apps Script exécuté ici.**

## Préconditions
- Code V0.9 validé par CI/Chromium et fusionné dans `main`.
- Connexion Google Cloud Shell avec le **compte Google personnel propriétaire** de SportOS, pas le compte professionnel.
- Liaison `.clasp.json` vers le projet Apps Script existant. Pas de création de projet ni de nouvelle WebApp.
- Script `scripts/publier-v0.9-cloud-shell.sh` et classificateur `scripts/classify-deployed-v0.9.cjs` disponibles dans `main`.
- **Le script n’effectue aucune modification du Google Sheet directement** et aucun formulaire fictif n’est utilisé pour les tests.

## Phase 1 — Audit sans écriture (obligatoire)
```bash
cd ~/SportOS_deploiement_unique
git switch main
git pull --ff-only origin main
bash scripts/publier-v0.9-cloud-shell.sh --audit-only
```

**Sortie attendue** (numéro réel variable) :
```text
SPORTOS_CODE_DEPLOYE=V0_7   # ou V0_8
SPORTOS_CODE_DISTANT_HEAD=V0_7   # ou V0_8 / V0_9
SPORTOS_V0_9_AUDIT=PASS; CIBLE_AVANT=@N; DEPLOYE=V0_7; HEAD=V0_8; ECRITURES=0
```

Si un `STOP` survient, **ne rien forcer**. Analyser l’écart avant la suite. Le script refuse tout snapshot source ou HEAD non identifié. Aucun `clasp push` manuel n’est autorisé.

## Phase 2 — Publication dans le même déploiement
Exécuter seulement après un audit **PASS** et la validation visuelle du prototype :
```bash
cd ~/SportOS_deploiement_unique
bash scripts/publier-v0.9-cloud-shell.sh --publish
```
Le script recommence tous les contrôles (pas de confiance dans un audit ancien), vérifie `main`, le compte, le manifeste privé et la correspondance stricte des cinq fichiers sources avec le commit épinglé. Il relit la version `@N` de la WebApp et le HEAD distant dans des dossiers temporaires, vérifie l’absence de dérive, puis met à jour **le même deployment ID**.

Sortie de succès :
```text
SPORTOS_V0_9_VERSION_CIBLE=@N
SPORTOS_V0_9_DEPLOIEMENT_CIBLE=TERMINE
```

Sans ces marqueurs, la publication **n’est pas confirmée**.

## Phase 3 — QA réelle, sans écrire de séance fictive
Ouvrir l’URL `/exec` déjà connue. Vérifier :
1. Accueil : plus de bandeau permanent « 4 SUR 4 », compteur hebdomadaire toujours affiché, nouveau défi Toulouse → Espiens.
2. Programme : icône Renfo B, nouvelles consignes d’exercices, échauffement et étirements A/B/Course/Vélo.
3. Retour d’une séance WebApp existante : bouton « Modifier mon retour » avec crayon ; ouvrir et relire **sans enregistrer de changement fictif**.
4. Sur ordinateur, tablette et téléphone : navigation, textes, cartes, formulaires sans débordement horizontal.
5. Historique sportif : dates et retours précédents inchangés, deux renforcements et une sortie vélo réels de la semaine du 19/10/2026 préservés.

La preuve de modification *avec écriture réelle* attendra une correction d’une véritable séance par l’utilisatrice, jamais une création artificielle.

## Limitations et gouvernance
- Aucun chemin de restauration automatique n’est déclenché : si la version publiée diffère du snapshot approuvé, le script s’arrête et le diagnostic est nécessaire. Les versions précédentes restent disponibles comme référence dans Apps Script.
- En lecture seule, la version réellement en ligne n’a pas pu être interrogée depuis cette conversation : l’audit doit le faire depuis Cloud Shell.
- Le Sheet de gouvernance personnel a refusé l’écriture externe (`403`) ; les décisions et garde-fous sont versionnés dans GitHub en attendant la réconciliation du Sheet.
- Seules les séances réellement créées par la WebApp et datées dans la semaine active sont directement éditables depuis le bouton principal de chaque activité.
