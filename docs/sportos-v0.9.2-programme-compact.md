# SportOS V0.9.2 — Densité de la page Programme et continuité hebdomadaire

**État : patch GitHub prêt à être évalué ; pas de mise en production ni de mutation du Sheet.**

## Demandes de design mises en œuvre

- **Ordinateur** : largeur utile plafonnée à 1 270 px, titre du programme limité à environ 43 px, fiche séance (« Des bases solides. » pour Renfo A) compacte, illustration secondaire réduite, espace et typographie maîtrisés.
- **Un seul endroit pour choisir l'activité** : le sélecteur A/B/Course/Vélo reste au-dessus de la fiche de séance ; le grand bloc « Semaine X / 4 cartes cliquables » et ses textes redondants sont supprimés intégralement. **Le choix de semaine reste séparé** en bande horizontale plus fine.
- **Félicitations** : suppression du grand panneau réapparaissant/disparaissant selon la semaine sélectionnée. Une ligne discrète « Bien joué : semaine N terminée, 4 activités réalisées » reste visible **tant qu'une semaine du cycle a été accomplie**, quelle que soit la semaine consultée.
- **Changements de semaine** : hauteur de navigation stabilisée, focus du clavier et position de la bande conservés, et position de défilement préservée lors du changement. Les propositions et détails continuent à être recalculés par semaine depuis les retours enregistrés.
- **Espacements de la fiche** : sous-titre (« Fessiers, jambes, gainage et technique. ») visiblement séparé du titre, des informations et des actions, au lieu d'être collé à la prochaine explication.
- **Responsive** : règles adaptées aux containers PC, tablette et mobile ; priorité à l'absence de défilement horizontal.

## Invariants protégés

- Source de vérité pour les données sportives : Google Sheet personnel `1_GX-1Fnsfq0XSAPoJy9UyHtA9Cca140_TEixjCSNmhQ`, **non modifié**.
- Détails des mouvements, échauffements et étirements préservés, de même que les retours WebApp modifiables.
- S1, S2, S3 et S4 restent navigables ; les séances futures restent conditionnelles.
- Aucun changement serveur : `src/Code.gs` n'est pas modifié.
- Classificateur V0.9.2 épinglé sur le commit source `92e1328976cab0b1672586ca16af249c73bbc8d9`, déploiements V0.7 à V0.9.1 reconnus, modifications distantes inconnues refusées.

## Contrôles et publication

Tests programmés : vérifications Node historiques, conformité des sources, garde-fous immuables, capture Playwright du programme à 320–1920 px, contrôle de l'encombrement sur ordinateur, absence de bloc en doublon, maintien de la félicitation après changement de semaine.

**Blocage technique observé le 25/10/2026** : GitHub Actions indique des jobs en échec avant initialisation du runner (`runner_id=0`, `steps=[]`, environ 2 secondes). Aucun verdict Playwright n'a pu être observé sur cette branche. Ne pas interpréter ces échecs d'infrastructure comme des résultats de tests applicatifs.

Après résolution du blocage, une fois les contrôles PASS et la PR fusionnée dans main :

```bash
cd ~/SportOS_deploiement_unique
git switch main
git pull --ff-only origin main
bash scripts/publier-v0.9.2-cloud-shell.sh --audit-only
```

Puis, uniquement si l'audit affiche `SPORTOS_V0_9_2_AUDIT=PASS` et `ECRITURES=0` :

```bash
bash scripts/publier-v0.9.2-cloud-shell.sh --publish
```

Ces commandes visent l'identifiant de déploiement déjà existant, sans créer une WebApp supplémentaire ; l'application en ligne n'est pas mise à jour tant que `SPORTOS_V0_9_2_DEPLOIEMENT_CIBLE=TERMINE` n'a pas été observé.
