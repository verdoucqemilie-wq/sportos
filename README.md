# SportOS — WebApp personnelle

**Version de code préparée : V0.4.0 (21/10/2026).** Branding SportOS et responsive adaptatif validés ; **GitHub `main` fusionné**, synchronisation Apps Script encore à lancer dans Cloud Shell. La V0.3 est visible sur la dernière capture de la WebApp ; la version du déploiement doit être vérifiée avant mise à jour. La seule base sportive reste le Sheet personnel existant.

**Publier V0.4 depuis Cloud Shell, après connexion avec le compte Google personnel :**

```bash
cd ~/SportOS_deploiement_unique
git switch main
git pull --ff-only origin main
bash scripts/publier-v0.4-cloud-shell.sh
```

Le script vérifie la cible, la confidentialité, les tests et la version existante avant d'exécuter `clasp push` et de mettre à jour **l'identifiant de déploiement déjà en service**. Si le déploiement n'annonce pas `SportOS v0.3.0`, il s'arrête sans publier : transmettre le message d'erreur et ne pas contourner les gardes. Aucun nouveau projet ni aucun nouveau déploiement n'est créé.

**Documentation de la charte :** [Identité V0.4](docs/brand-guidelines-v0.4.md) · [Planche de marque](docs/brand-board-v0.4.html) · [Contrôles responsive](tests/adaptive-qa.cjs).

---

## Installation initiale / Historique V0.1.1



**Statut au 20/10/2026 :** le dépôt GitHub privé est créé et les 5 fichiers ont été poussés dans Apps Script. Le déploiement WebApp `@1` a été créé par Cloud Shell. **L'ouverture effective de la WebApp, les paramètres d'accès du déploiement et la lecture des données en navigateur restent à confirmer.** Aucune saisie sportive de test n'a été effectuée.

## Source de vérité

Google Sheet personnel déjà existant : [SportOS — Base sportive & gouvernance](https://docs.google.com/spreadsheets/d/1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ/edit). Aucun autre Google Sheet ni environnement de recette. Le projet Apps Script est lié à ce classeur ; code versionné dans **un dépôt GitHub privé** `verdoucqemilie-wq/sportos` (créé, privé).

## Installation initiale (déjà effectuée le 20/10/2026) depuis Google Cloud Shell

1. Ouvrir [Google Cloud Shell](https://shell.cloud.google.com/) et se connecter avec le compte Google **personnel** qui possède SportOS.
2. Depuis ce chat, télécharger le fichier `SportOS_deploiement_unique.zip`. Dans Cloud Shell, utiliser le bouton **Importer un fichier** pour importer le ZIP à la racine de son dossier utilisateur.
3. Dans Cloud Shell, exécuter :

```bash
cd ~
unzip -o SportOS_deploiement_unique.zip
cd SportOS_deploiement_unique
bash scripts/installer-cloud-shell.sh
```

4. Lors du passage `gh auth login`, autoriser le compte GitHub `verdoucqemilie-wq`. Lors du passage `clasp login --no-localhost`, autoriser le compte **Google personnel**, pas le compte professionnel.
5. Si `clasp` dit que l'API Google Apps Script est désactivée, l'activer dans les [paramètres Apps Script](https://script.google.com/home/usersettings) puis relancer la commande ci-dessus. Les fichiers de liaison Apps Script sont stockés dans `~/.config/sportos/` et **jamais dans GitHub**.
6. Récupérer l'URL `/exec` de la WebApp en ouvrant le projet Apps Script depuis le Sheet (**Extensions > Apps Script**, puis **Déployer > Gérer les déploiements**). Vérifier que le déploiement est `Exécuter en tant que : Moi` / `Accès : Moi uniquement`.
7. Première vérification : ouvrir la WebApp sur ordinateur puis téléphone, s'assurer qu'elle affiche **2 séances de renforcement, 1 course (19/10/2026) et 0 vélo** ; consulter les quatre programmes et le profil. **N'enregistrer aucune séance fictive**, mais seulement sa prochaine véritable séance.


**Important pour les prochaines versions :** ne relance pas `scripts/installer-cloud-shell.sh` pour publier un correctif sans supervision. Si `~/.config/sportos/deployment-id.txt` n'existe pas, cette commande peut créer un **nouveau déploiement**, plutôt que de mettre à jour `@1`. Pour une évolution, contrôler la liaison `.clasp.json` et cibler explicitement le déploiement existant. Ne pas faire de saisies fictives dans le Sheet unique.

## Sécurité

- `src/appsscript.json` impose la WebApp réservée au propriétaire (`MYSELF` et `USER_DEPLOYING`). Si le déploiement propose une visibilité publique, **ne pas publier**.
- `.gitignore` exclut le fichier `.clasp.json`, les identifiants OAuth, et les fichiers locaux sensibles. Le dépôt GitHub doit rester privé ; le script en vérifie la visibilité.
- Le script n'ajoute aucune donnée sportive au Sheet. Les tests fonctionnels automatisés utilisent des tableaux simulés en mémoire.
- `clasp push` **remplace tout le code** du projet Apps Script ciblé ; ici il ne doit cibler que le projet SportOS fraîchement associé à ce Sheet. Ne pas réutiliser ce fichier `.clasp.json` pour une autre application.
- `~/.config/sportos/.clasp.json` conserve la liaison au projet Apps Script pour les installations suivantes, afin de ne pas créer un nouveau projet par erreur.
- Ne jamais envoyer dans le chat le fichier `~/.clasprc.json` ni des tokens Google/GitHub : ce sont des secrets.

## Fonctionnalités disponibles

Accueil, programme de renforcement A/B, progression course-marche, jalons vélo Espiens en 2 jours, saisie cardio et renforcement, bilan hebdomadaire, historique, mesures facultatives, premières recommandations de progression et profil.

Non inclus pour l'instant : notifications, Strava, import GPX/CSV, montage de vidéo, géolocalisation, mode hors-ligne, édition avancée des séances anciennes.

## Qualité

`npm run verify` vérifie la syntaxe, les deux paramètres de confidentialité et le ciblage du Google Sheet ; `npm test` exécute les tests serveur simulés, sans toucher à Google Sheets. L'enregistrement réel sur le Google Sheet et les droits du déploiement doivent être vérifiés dans Cloud Shell / Apps Script avant usage courant.

## Architecture

- `src/Code.gs` : lecture Sheets, contrôle des structures et écritures protégées par verrou.
- `src/Index.html`, `src/Styles.html`, `src/Client.html` : interface responsive.
- `src/appsscript.json` : configuration Apps Script (privée).
- `scripts/installer-cloud-shell.sh` : orchestration de GitHub CLI, Git, clasp, Google Apps Script.
- `scripts/verify-local.cjs`, `tests/backend.test.cjs` : contrôles locaux.
- `docs/apercu.html` et `docs/demo-data.js` : aperçu sans aucune connexion au Sheet.
