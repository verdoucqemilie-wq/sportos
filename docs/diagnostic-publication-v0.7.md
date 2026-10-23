# SportOS — diagnostic du déploiement Apps Script @9

**Contexte :** la WebApp privée existante est en version Apps Script `@9`. La publication V0.7 a renvoyé `SPORTOS_CODE_DEPLOYE=INCONNU` et s'est arrêtée avant `clasp push` le 23/10/2026.

**Important :** `@9` n'est pas une version produit SportOS. Le résultat `INCONNU` ne permet pas de conclure à une erreur, à un déploiement de V0.7 ou à une modification malveillante : il manque les différences de fichiers.

## Correctif apporté après le diagnostic HEAD (23 octobre 2026)

La sortie `EXTRA_FILES=1`, `MISSING_FILES=1`, `MATCH_BACKEND=ABSENT` avec les quatre autres fichiers reconnus correspond très probablement à la conversion normale du backend `Code.gs` en `Code.js` par `clasp pull`.

La documentation officielle de `clasp` indique que `scriptExtensions` vaut `[".js", ".gs"]` par défaut et que la première extension sert lors d'un `pull`. Le comparateur a été corrigé pour reconnaître **uniquement** cette substitution de nom, et exige toujours une correspondance **exacte du contenu** pour autoriser une publication. Les doublons `Code.js`+`Code.gs`, tout autre fichier supplémentaire et toute mutation du backend sont bloquants.

**Prochaine action recommandée :** relancer le script de publication V0.7 après mise à jour GitHub (`git pull --ff-only origin main`). Celui-ci relira les snapshots `@9` et `HEAD` en lecture seule avant de décider. Si l’un est réellement inconnu, il s'arrêtera encore **avant** `clasp push`.

## Prochaine opération : diagnostic UNIQUEMENT
Depuis le Cloud Shell **personnel** où SportOS et clasp sont déjà liés :

```bash
cd ~/SportOS_deploiement_unique
git switch main
git pull --ff-only origin main
bash scripts/diagnostiquer-deploiement-v0.7.sh
```

- Contrôle de l'ID exact et de `@9`, avant toute lecture du code.
- Deux appels `clasp pull` dans des répertoires temporaires : version immuable déployée `@9` puis code de travail `HEAD`.
- Ne fait **aucun** `clasp push`, `clasp create-deployment`, modification Google Sheets ou migration.
- Comparaison des cinq fichiers à des commits Git épinglés représentant V0.5, V0.6 et V0.7.
- Seules les étiquettes BACKEND, SHELL, STYLES, FRONTEND, MANIFEST, le nombre de fichiers non reconnus et la confidentialité du manifeste sont imprimés. Aucun code source, diff, email ou identifiant n'est imprimé.
- En fin de diagnostic : `DIAGNOSTIC_READONLY=TERMINE`. Transmettre les deux blocs `DEPLOYE_9` et `HEAD_DISTANT`.

### Interprétation
- **Tous les fichiers d'un même commit correspondants** : vérifier pourquoi le classificateur strict précédent n'y arrivait pas. Aucun remplacement sans contrôle.
- **Manifeste non privé** : STOP, revue de sécurité avant toute publication.
- **BACKEND modifié ou fichiers supplémentaires** : ne pas écraser ; analyser d'où viennent ces différences.
- **Styles ou client modifiés seuls** : déterminer s'il s'agit de changements de format/ligne ou de véritables modifications visuelles ; ne pas contourner la vérification.
- **HEAD déjà V0.7 mais @9 inconnu** : ne pas incrémenter automatiquement ; il faut déterminer le contenu de la version @9.

## Statut
- V0.7 UI et script de publication : code fusionné dans GitHub `main`, pas de preuve de publication Apps Script.
- Version actuellement déployée : `@9` identifiée, **contenu encore inconnu**.
- Toutes les données sportives et le Google Sheet personnel demeurent inchangés par ces diagnostics.
