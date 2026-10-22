# SportOS — Contrôle de la version Apps Script @8 (22 octobre 2026)

**Observation réelle** : le déploiement SportOS privé habituel est en `@8` sans description. La V0.6 n'a pas été poussée lors de cette tentative (STOP avant `clasp push`).

## Objectif et statut
- Aucun autre ID de déploiement accepté ; pas de création d'Apps Script, WebApp ou Google Sheet.
- `scripts/auditer-deploiement-8-sportos.sh` exécute `clasp pull --versionNumber 8` dans un dossier **temporaire**, ne modifie pas le projet distant. Le dossier temporaire est effacé automatiquement.
- `scripts/classify-deployed-v0.6.cjs` compare les cinq fichiers source récupérés à la V0.5 connue (Git `6e3837e`) puis à la V0.6 présente sur GitHub `main`.
- `SPORTOS_SNAPSHOT_8=V0_6` : déjà publié, **ne pas pousser** une version identique.
- `SPORTOS_SNAPSHOT_8=V0_5` : précondition stricte satisfaite ; publication autorisée avec garde de version et de confidentialité.
- `SPORTOS_SNAPSHOT_8=INCONNU` ou erreur d'accès/permissions : **STOP avant push** ; analyser manuellement les différences plutôt que contourner.
- Aucun fichier de santé ni identifiant OAuth n'est imprimé par le comparateur.

## Exécution
Depuis `~/SportOS_deploiement_unique` :
```bash
git switch main
git pull --ff-only origin main
bash scripts/publier-v0.6-cloud-shell.sh
```

Il faut lire la sortie `SPORTOS_SNAPSHOT_8=` et `SPORTOS_V0_6_DEPLOIEMENT_CIBLE=TERMINE` ou `SPORTOS_V0_6_DEJA_PRESENTE=@8`. Toute autre sortie `STOP` doit être rapportée ; ne pas forcer la publication.

## Tests
- `npm run verify` inclut le classificateur sur les versions Git V0.5/V0.6 ainsi que la version @8 sans preuve et les cas de dérive.
- `bash -n` valide syntaxe audit + publication.
- Pas d'appel aux données utilisateur dans les tests. 
