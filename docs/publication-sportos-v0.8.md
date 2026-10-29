# Publication contrôlée — SportOS V0.8

**GO utilisateur : 23 octobre 2026. Code V0.8 fusionné : commit `27e655ad4127292a6c55f523c5bbed05ea3b5893`.**

## Situation avant lancement

- La dernière version personnellement contrôlée de la WebApp est **SportOS V0.7 sur Apps Script @11**. Le numéro de déploiement peut évoluer ; il est relu au démarrage.
- Le Google Sheet sportif unique existe sur le **compte personnel** ; `05_Exercices_Log` (colonne O) et `06_Cardio` (colonnes Y et Z) ont des en-têtes libres et aucune donnée historique présente dans ces champs lors du contrôle.
- Aucun script ni formulaire ne doit fabriquer de séances de recette dans le Google Sheet réel.

## Publier

Ouvrir **Google Cloud Shell** avec le compte Google personnel propriétaire du Sheet, puis :

```bash
cd ~/SportOS_deploiement_unique
git switch main
git pull --ff-only origin main
bash scripts/publier-v0.8-cloud-shell.sh
```

Le script effectue des vérifications locales, `npm run verify`, puis des lectures distantes en dossiers temporaires.
Il ne publie que si **l'identifiant de déploiement cible** est celui de la WebApp existante, si la version publiée est **V0.7** et que le **HEAD distant** est strictement V0.7 ou V0.8, fichier par fichier, avec les permissions `MYSELF` / `USER_DEPLOYING`.
Un déploiement déjà en V0.8 est un **no-op**.

Pour le premier passage, il synchronise le **projet Apps Script existant** via `clasp push`, contrôle ensuite le code HEAD et actualise **le même ID de déploiement**, sans créer de nouvelle URL `/exec`. Il vérifie le nouveau snapshot publié avant d'afficher :

```text
SPORTOS_V0_8_VERSION_CIBLE=@N
SPORTOS_V0_8_DEPLOIEMENT_CIBLE=TERMINE
```

Si `INCONNU` ou `STOP` s'affiche, interrompre l'opération, conserver la sortie et revoir l'écart. Ne **jamais** forcer un `clasp push` manuel.

## Contrôles post-publication sans écriture

1. Ouvrir l'**URL `/exec` existante**, pas l'aperçu HTML.
2. Ouvrir **Renforcement B → Enregistrer mon retour → Gainage** : la question est en secondes encore possibles, RIR répétitions absent.
3. Ouvrir **Vélo → Enregistrer mon retour** : dénivelé positif et vitesse moyenne manuels visibles ; ne pas valider de fausse sortie.
4. Ouvrir **Mon programme** : carte « Ton programme évolue », calcul dérivé de la semaine précédente sans modifier `03_Programme`.
5. Vérifier les icônes sur ordinateur et mobile.
6. Vérifier qu'une séance antérieure enregistrée apparaît toujours dans l'historique, sans la modifier.

Les **nouvelles colonnes** sont volontairement initialisées par l'application uniquement à la première saisie concernée, si les cellules d'en-tête sont libres :
- `05_Exercices_Log!O1` : `Réserve tenue (s)`
- `06_Cardio!Y1:Z1` : `Dénivelé positif (m)`, `Vitesse moyenne (km/h)`.

L'adaptation hebdomadaire **est un calcul affiché** qui ne réécrit pas les plans source. Une mesure absente reste absente ; un signal de douleur bloque la progression automatique sur le mouvement. Strava n'est pas connecté par API : la saisie reste manuelle.

## Journal

- PR #15 : 5 changements fonctionnels et UX/UI, suite de tests complète PASS.
- Script de publication V0.8 et audit : tests de sécurité séparés dans `tests/release-v0.8.test.cjs`.
- **Ne pas annoncer « publié » avant le retour Cloud Shell indiquant @N et le snapshot V0.8 confirmé.**
