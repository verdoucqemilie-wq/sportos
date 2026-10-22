# SportOS V0.6 — Icônes de l'accueil et retour de séance premium

**Périmètre** : page d'accueil + interface de saisie du retour de séance. GitHub uniquement, non déployé.

## Audit
Les icônes ont été introduites par étapes ; Renforcement A et Renforcement B partageaient le même symbole. Dans l'accueil, des flèches étaient encore textuelles à côté des SVG. Le retour de séance était une fenêtre étroite, avec les formulaires de cinq exercices empilés sans hiérarchie.

## Décisions V0.6
- Nouvelle famille d'icônes vectorielles 24×24, trait homogène : deux pictogrammes différents pour Renforcement A/B, Course, Vélo, itinéraire, coaching, effort, temps, date, notes, prudence, fermeture et actions.
- Sur l'accueil, les icônes servent à identifier la prochaine séance, les lignes du programme, la dernière activité et les accès directs. Les couleurs restent les tokens SportOS ; pas d'emoji.
- Le **retour de séance** est désormais un espace de travail plein écran sur mobile et deux colonnes sur ordinateur. Ce n'est pas une page supplémentaire dans le menu : la saisie s'ouvre depuis « + Séance », les programmes ou la page Progrès, sans rupture de navigation.
- Informations essentielles en haut, ressenti ensuite, puis détails d'exercices repliables et notes personnelles.
- Effort /10 avec boutons de choix rapides 2, 4, 6, 8, 10 ; la saisie numérique reste libre pour 2,5/10 ou une autre valeur autorisée.
- Progression **0 / 5 exercices renseignés** basée uniquement sur la saisie actuelle, jamais sur les valeurs proposées du programme.
- Saisie du cardio : les intervalles proposés restent décrits mais ne sont **pas préremplis comme réellement effectués**.
- Douleur conservée au niveau de chaque exercice pour renforcement et au niveau de la sortie cardio.
- Sauvegarde sur les fonctions Apps Script **existantes**, sans migration de colonnes. Une seule soumission, CTA fixe, message d'erreur visible, conservation des données si échec, confirmation avant fermeture avec saisie non enregistrée.
- Accessibilité : labels réels, clavier, focus visible, dialogue modal, touches de sortie, réduction des animations.
- Les autres formulaires (bilan hebdomadaire, poids) restent fonctionnels et sans rebranding forcé.

## Qualité
Tester en Chromium 320, 375, 390, 768, 1280, 1856 px, pour deux activités, sauvegarde en mode démo, inputs réels préservés, touches focus, absence de débordement et reduced-motion.
Les tests de la V0.3–V0.5 sont conservés. **Aucune écriture dans Google Sheets pendant les tests.**

## Livrables
- [Aperçu interactif V0.6](./apercu-v0.6.html) — HTML local, données fictives.
- [QA retour de séance](../tests/feedback-qa.cjs).
- Sources de composants : `src/Client.html` et `src/Styles.html`.

## Publication
Pas de fusion, pas de clasp push, pas de nouveau déploiement à cette étape. Revue de design avant décision.
