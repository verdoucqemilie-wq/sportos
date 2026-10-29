# SportOS — configuration privée après ouverture du dépôt

Le dépôt de code est public, **pas** la WebApp Google Apps Script et **pas** le Google Sheet de production.

## Paramètre Apps Script indispensable avant une future publication

Dans le projet Apps Script existant : **Paramètres du projet → Propriétés du script → Ajouter une propriété**. Nom : `SPORTOS_SPREADSHEET_ID`. Valeur : l'identifiant du Google Sheet privé existant (à récupérer dans son URL, sans le recopier dans GitHub). Ne jamais modifier les autorisations du classeur pour le rendre public.

Cette configuration n'est pas nécessaire pour continuer à utiliser la WebApp actuellement déployée : un commit GitHub ne déploie pas Apps Script. En revanche, toute future publication du nouveau backend sans la propriété doit échouer fermement.

## Variables des scripts Cloud Shell (locales uniquement)

Configurer `SPORTOS_SPREADSHEET_ID`, `SPORTOS_DEPLOYMENT_ID`, `SPORTOS_GOOGLE_ACCOUNT` dans l'environnement de **la session Cloud Shell privée**, sans les écrire dans un fichier suivi par Git. Ne pas transmettre leurs valeurs en issue, PR ou logs publics.

Le verrou de version V0.9.2 protège contre un `clasp push` sur code non reconnu. **Ne pas contourner ce verrou** : créer ensuite une procédure de release approuvée pour la version sécurisée.

## Historique du dépôt public

Les commits anciens conservent les identifiants qui y figuraient. Supprimer ces valeurs dans le dernier commit **ne nettoie pas l'historique, les forks, les clones, les éventuels artifacts et les caches**. Une purge de l'historique et une revue des accès Google restent nécessaires. Un ID de Google Sheet seul n'octroie pas l'accès ; garder les partages privés. Tout véritable secret exposé doit être révoqué / régénéré indépendamment.

## Garde-fous continus

`npm run verify` exécute `scripts/security-scan.cjs` en premier. La vérification refuse le manifeste WebApp public, les identifiants de déploiement, liens Sheets, e-mails personnels et jetons connus dans les fichiers suivis du dernier commit. Elle ne vérifie **pas** l'historique ni les paramètres réels de partage Google.
