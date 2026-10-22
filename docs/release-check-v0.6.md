# Contrôle de livraison SportOS V0.6 — 22 octobre 2026

Ce document ouvre une revue indépendante de la publication V0.6. Il n'autorise aucun changement de données ni déploiement automatique.

- Code source de la V0.6 déjà fusionné dans `main` via PR #5.
- `src/Code.gs` et `src/appsscript.json` inchangés lors de la refonte.
- WebApp privée (`MYSELF` / `USER_DEPLOYING`) à préserver.
- Cible Apps Script existante explicitement identifiée dans `scripts/publier-v0.6-cloud-shell.sh`.
- Précontrôles numériques autorisent **@6 ou @7 uniquement**, sans description ; arrêt pour toute autre version.
- Nouveau test `tests/deployment-guard-v0.6.test.cjs` dans `npm run verify`.
- Publication manuelle depuis Cloud Shell avec la session Google personnelle, sans nouvelle URL, après tests.
- Contrôle de réussite attendu : `SPORTOS_V0_6_DEPLOIEMENT_CIBLE=TERMINE`.
- Statut courant : **code fusionné, attente de sortie de publication Cloud Shell**.
