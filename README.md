# SportOS — WebApp sportive personnelle

> **Gouvernance (29/10/2026)** — Le code GitHub est public ; les données, le classeur Google et la WebApp doivent rester privés. La sécurisation du code actuel est fusionnée, mais le nettoyage de l'historique, la vérification des accès Google et la préparation de la prochaine release restent ouverts. Voir [Gouvernance du projet](docs/GOUVERNANCE.md) et le [suivi SEC-01](https://github.com/verdoucqemilie-wq/sportos/issues/21).
>
> Les sections ci-dessous relatives à V0.7.0 / l'installation initiale sont des archives de versions ; elles ne constituent pas la procédure de déploiement validée de la nouvelle version sécurisée.

**Code GitHub : V0.7.0** — Refonte premium de la page « Mon programme », fusionnée dans `main` le 23 octobre 2026 via la [PR #8](https://github.com/verdoucqemilie-wq/sportos/pull/8). Backend sportif, Google Sheet personnel et permissions Apps Script inchangés.

**Publication Apps Script : à exécuter depuis Cloud Shell avec le compte personnel.** Le dernier déploiement connu était `@8`, mais son contenu n'a pas encore été identifié de façon certaine.

## Publier la V0.7 sur la WebApp existante

```bash
cd ~/SportOS_deploiement_unique
git switch main
git pull --ff-only origin main
bash scripts/publier-v0.7-cloud-shell.sh
```

**Le script ne crée pas de nouvelle WebApp** et n’utilise que l'identifiant du déploiement actuel. Avant de publier, il :
- vérifie le code GitHub, les permissions `MYSELF`/`USER_DEPLOYING`, la base sportive unique et les tests ;
- télécharge **en lecture seule et en dossier temporaire** le snapshot de la version effectivement déployée, puis le code distant HEAD ;
- compare chacun des cinq fichiers Apps Script à V0.5, V0.6 et V0.7 connues (commits Git immuables) ;
- si V0.7 est déjà déployée, s'arrête **sans aucun push** ;
- si le déploiement ou HEAD contient une modification inconnue, **s'arrête avant toute écriture** ;
- si la cible actuelle et HEAD sont reconnues, ne synchronise que si nécessaire, actualise **l'identifiant existant** et vérifie la nouvelle version par lecture seule.

`clasp push` remplace tous les fichiers du projet Apps Script ; ne jamais lancer cette commande isolément ni contourner un STOP. La mise à jour du déploiement ne crée pas de nouvelle URL `/exec`. Aucune séance sportive fictive ne doit être créée pour tester.

**Après publication attendue :** `SPORTOS_V0_7_DEPLOIEMENT_CIBLE=TERMINE` avec un numéro numérique `@N`, ou `SPORTOS_V0_7_DEJA_DEPLOYEE=@N` si la V0.7 est déjà présente. Si le script s'arrête, transmettre sa sortie et analyser la version inconnue.

Design : [Spécifications Mon programme V0.7](docs/design-programme-v0.7.md) · [Aperçu autonome](docs/apercu-programme-v0.7.html) · [Garde-fous de publication](tests/release-v0.7.test.cjs).


---

## Installation initiale / Historique V0.1.1



**Statut au 20/10/2026 :** le dépôt GitHub (initialement privé) est créé et les 5 fichiers ont été poussés dans Apps Script. Le déploiement WebApp `@1` a été créé par Cloud Shell. **L'ouverture effective de la WebApp, les paramètres d'accès du déploiement et la lecture des données en navigateur restent à confirmer.** Aucune saisie sportive de test n'a été effectuée.

## Source de vérité

La base Google Sheets personnelle reste privée. Son identifiant n'est plus stocké dans le code actuel : il doit être renseigné dans les propriétés du script Apps Script (`SPORTOS_SPREADSHEET_ID`). Le code GitHub est public, pas la WebApp ni la base.

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

## Sécurité du dépôt public

- L'identifiant du Google Sheet doit être placé dans Apps Script > Paramètres du projet > Propriétés du script, clé `SPORTOS_SPREADSHEET_ID`. Ne pas le commiter.
- Les scripts de publication utilisent des variables privées locales `SPORTOS_SPREADSHEET_ID`, `SPORTOS_DEPLOYMENT_ID` et `SPORTOS_GOOGLE_ACCOUNT`.
- Aucun commit GitHub ne déploie la WebApp. La version existante n'est pas modifiée par ce correctif.
- **L'historique Git antérieur peut contenir ces informations** : le retrait du HEAD ne le purge pas. Une opération séparée de nettoyage d'historique est indispensable.

## Sécurité historique

- `src/appsscript.json` impose la WebApp réservée au propriétaire (`MYSELF` et `USER_DEPLOYING`). Si le déploiement propose une visibilité publique, **ne pas publier**.
- `.gitignore` exclut le fichier `.clasp.json`, les identifiants OAuth, et les fichiers locaux sensibles. Le code GitHub peut être public, mais les identifiants, les données et la WebApp doivent rester privés.
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
