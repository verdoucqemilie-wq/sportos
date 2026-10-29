# SportOS — Gouvernance du projet

> **Dernière mise à jour : 29 octobre 2026** · Document public, sans identifiants personnels.
>
> **Statut sécurité : PARTIELLEMENT SÉCURISÉ — ACTIONS OUVERTES (SEC-01).**
> La présence de garde-fous dans le code ne vaut pas validation des accès réels à Google ni purge de l'historique Git.

## 1. Périmètre et sources de vérité

- **Code source :** dépôt GitHub public `verdoucqemilie-wq/sportos` ; branche de référence `main`.
- **Application personnelle et données sportives :** une WebApp Google Apps Script et un Google Sheet de production **privés**. L'ouverture du dépôt GitHub ne doit jamais élargir l'accès à ces ressources.
- **Backend et interface :** `src/` ; **tests et contrôles :** `tests/`, `scripts/`, `.github/workflows/verify.yml`.
- **Référence des paramètres privés et précautions de déploiement :** [security-public-repo.md](security-public-repo.md).
- **Suivi des risques et tâches :** [SEC-01 — sécurisation à finaliser](https://github.com/verdoucqemilie-wq/sportos/issues/21).

## 2. Registre des décisions

| ID | Décision | État au 29/10/2026 | Justification |
| --- | --- | --- | --- |
| GOV-SEC-01 | Le **code peut être public**, mais le Sheet, les données et la WebApp de production restent privés. | **Acté** ; accès Google effectifs **à contrôler** | Ne pas confondre visibilité du dépôt et autorisation d'accès aux données. |
| GOV-SEC-02 | Ne stocker **aucun identifiant personnel, compte, jeton ou secret** dans les fichiers suivis de Git, les tests, les logs ou les artifacts publics. Utiliser des propriétés Apps Script et une configuration locale privée. | **Correctif du code courant fusionné** ; surveillance continue | Réduire l'exposition involontaire de l'environnement personnel. |
| GOV-SEC-03 | Toute publication Apps Script doit cibler le **déploiement déjà existant**, vérifier l'identité du compte et les protections `MYSELF` / `USER_DEPLOYING`, puis respecter les verrouillages de version. **Aucun `clasp push` direct ni contournement d'un STOP.** | **Règle obligatoire** ; prochaine release à qualifier | `clasp push` peut écraser le code distant ; pas de modification PROD sans preuve. |
| GOV-SEC-04 | Les tests automatisés s'exécutent **sans écriture sur la base réelle**, avec données de démonstration ; CI de sécurité + tests métier + tests visuels avant fusion. | **Actif** | Éviter la création de fausses données sportives et les régressions. |
| GOV-SEC-05 | Le retrait de données du code actuel **ne purge pas les commits antérieurs** ; le nettoyage d'historique doit être traité comme une opération à risque et documenté séparément. | **Ouvert — SEC-01A** | Les SHA épinglés, forks, clones, PR et artifacts peuvent rester concernés. |

## 3. Journal de changement — sécurité du dépôt public

| Date | Changement / preuve | État |
| --- | --- | --- |
| 29/10/2026 | Dépôt SportOS rendu public. | **Confirmé sur GitHub** |
| 29/10/2026 | [PR #20](https://github.com/verdoucqemilie-wq/sportos/pull/20) fusionnée sur `main` (commit `9d4e352`) : identifiant Sheet retiré du backend actuel ; utilisation de `SPORTOS_SPREADSHEET_ID` via `PropertiesService` ; identifiants déplacés des scripts de publication vers les variables locales ; fixtures et documentation publiques assainies. | **Fusionné** |
| 29/10/2026 | `scripts/security-scan.cjs` exécuté en premier par `npm run verify` ; [CI `main`](https://github.com/verdoucqemilie-wq/sportos/actions/runs/40887855985) : tests métier/sécurité et contrôles navigateur réussis. | **Validé pour le code courant** |
| 29/10/2026 | Aucune mise à jour de la WebApp Apps Script ni du Google Sheet effectuée par cette sécurisation GitHub. | **Aucun déploiement PROD** |
| 29/10/2026 | Historique Git, paramètres réels Google, secrets potentiellement exposés et nouvelle procédure de release : [SEC-01](https://github.com/verdoucqemilie-wq/sportos/issues/21). | **Non résolu / à vérifier** |

## 4. Risques ouverts et conditions de levée

| Risque / travail | État | Critère de validation |
| --- | --- | --- |
| **SEC-01A — Ancien historique public** | **Ouvert** | Inventaire des références sensibles et des copies accessibles ; plan de nettoyage validé (sauvegarde, dépendances aux SHA, branches, PR, artifacts). Ne jamais forcer une réécriture sans procédure de reprise. |
| **SEC-01B — Permissions Google réelles** | **Non vérifié ici** | Contrôle dans Google des partages du classeur, du projet et du déploiement ; preuves sans valeurs secrètes ; rotation des vrais secrets si nécessaire. Un ID de document seul n'est pas un jeton d'accès. |
| **SEC-01C — Configuration privée Apps Script** | **Non confirmée** | Propriété `SPORTOS_SPREADSHEET_ID` configurée dans le projet existant et lue sans l'afficher ; variables privées de Cloud Shell préparées. |
| **SEC-01D — Nouvelle publication sécurisée** | **Bloquée en attente de recette** | Nouvelle version explicitement approuvée ; vérification de la source immuable, de HEAD, de l'identité et de la cible ; tests + déploiement contrôlé, sans changer d'URL ni écraser du code inconnu. |
| **SEC-01E — Artifacts et CI publics** | **À surveiller** | Aucun contenu personnel dans les captures, journaux et artifacts ; scan de confidentialité + tests obligatoires. |

## 5. Gates de livraison et règles d'exploitation

1. **Avant fusion du code :** CI métier et sécurité réussie, manifeste Apps Script en mode propriétaire uniquement, aucune valeur sensible dans le diff ou les artifacts.
2. **Avant toute publication PROD :** traiter la configuration privée `SPORTOS_SPREADSHEET_ID` et vérifier les accès Google ; procédure de release adaptée à la version sécurisée, contrôle des SHA et du déploiement cible. **Tout STOP bloque la publication**.
3. **Pendant la recette :** vérifier le comportement avec prudence, sans créer de séance fictive dans la base unique ; conserver une preuve non sensible.
4. **Après publication :** vérifier la version réellement en service, l'URL et les permissions ; consigner le résultat dans ce registre et dans l'issue concernée.
5. **Toute modification d'historique Git :** changement distinct, préparé et traçable ; ne jamais assimiler la suppression dans `main` à une purge des copies et des commits anciens.

## 6. Règle de mise à jour de la gouvernance

Chaque changement sensible doit préciser : **date, décision, périmètre GitHub / Apps Script / Google Sheets, risque, preuve, statut (validé / à vérifier / bloqué), et prochaine action**. Ne jamais inscrire de valeur de compte, d'identifiant privé ou de token dans ce document public. Les tâches non closes restent dans [SEC-01](https://github.com/verdoucqemilie-wq/sportos/issues/21) jusqu'à vérification effective.
