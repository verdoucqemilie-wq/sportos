# SportOS V0.8 — Retours, Strava manuel et coaching hebdomadaire

**Statut : proposition en PR. Aucune écriture sur la WebApp ou le Google Sheet de production.** La V0.7 publiée sur Apps Script `@11` reste inchangée tant que la mise en production V0.8 n'est pas expressément autorisée.

## Journal de séance

### Gainage / exercice chronométré
- La question « répétitions en réserve (RIR) » disparaît lorsque le mouvement est chronométré (`Temps_s` renseigné, `Rép_min` vide). Le champ « répétitions » est également masqué.
- Elle devient **« Secondes encore possibles (estimation) »**, entre 0 et 120 secondes, facultatif, avec un rappel sur le maintien de la posture.
- La valeur est enregistrée dans une **colonne distincte O : `Réserve tenue (s)`** dans `05_Exercices_Log`. La colonne `RIR` (J) reste vide pour le gainage et signifie toujours des répétitions pour les autres exercices.
- La colonne O est créée automatiquement lors du premier enregistrement renseignant ce champ, seulement si son en-tête est vide. Si l'en-tête a un contenu inattendu, l'écriture échoue avant toute séance.

### Vélo et relevés Strava
- Deux champs **facultatifs à saisir manuellement** : dénivelé positif (m), vitesse moyenne (km/h). Aucune connexion Strava/OAuth, aucun import externe et aucune donnée synthétique.
- Stockage dans `06_Cardio` : **Y `Dénivelé positif (m)`** et **Z `Vitesse moyenne (km/h)`**, ajoutées uniquement si au moins une donnée est fournie et que ces en-têtes sont libres.
- Le programme affiche les unités. La vitesse n'est pas recalculée à partir de distance / durée, pour conserver la valeur Strava ; la durée totale peut différer de la durée de déplacement Strava.
- Les anciennes lignes et les 24 colonnes existantes restent inchangées. Écriture idempotente sur la clé de séance déjà utilisée.

## Semaine complète : quatre activités distinctes

Le système compte uniquement les **activités terminées et datées de la semaine civile locale** : Renfo A, Renfo B, Course et Vélo. Plusieurs séances d'un même type comptent pour un type unique.

Au passage de 3 à 4 catégories différentes enregistrées, une notification félicite l'utilisatrice. Le tableau de bord et Programme affichent aussi un bandeau durable tant que la semaine active est complétée. Le lundi suivant, l'indicateur repart à zéro. Une semaine incomplète ne déclenche jamais de félicitations artificielles.

## Programme réévalué chaque lundi

Le calcul est **déterministe et dérivé**, pas une réécriture de `03_Programme`. Il considère la dernière séance réellement terminée **du type concerné lors de la semaine civile immédiatement précédente**, ses exercices, douleur, réserve, difficulté, effort global et le dernier bilan sommeil/fatigue de cette semaine.

| Discipline | Conditions | Modification proposée |
|---|---|---|
| Renforcement | Dernier exercice réalisé au niveau objectif, douleur explicitement « Non », difficulté Facile/Modéré, réserve ≥ 2 répétitions | +1 répétition sur les mouvements admissibles, hausse bornée |
| Gainage | Maintien atteint, douleur « Non », difficulté Facile/Modéré, au moins 10 secondes encore possibles | +5 secondes proposées, hausse bornée |
| Course | Effort ≤ 4/10, douleur « Non », 8 blocs ou plus renseignés, course ≥ 60 s, marche ≥ 30 s | +10 s par bloc course, plafond 180 s |
| Vélo | Effort ≤ 4/10, douleur « Non », durée ≥ 20 min | +5 min de sortie confortable, plafond 120 min |

**Veto automatique :** douleur, effort ≥ 7/10, fatigue ≥ 7/10, sommeil ≤ 4/10, sensations manquantes ou dernier retour insuffisant -> pas de progression forcée. L'évolution ne s'applique jamais aux activités non effectuées la semaine précédente. Les autres paramètres de sécurité restent ceux des plans validés. Les objectifs sont présentés comme propositions ; l'utilisatrice peut faire moins.

Les données historiques et les programmes de référence ne sont pas modifiés ; la cible affichée change automatiquement au fil des retours hebdomadaires, mais **aucune nouvelle ligne de programme ni notification push n'est générée**.

## Identité graphique

Icône Course redessinée en pictogramme de coureuse plus lisible, Vélo avec vrai cadre, selles/guidon et roues distinctes. Trait et proportions harmonisés à la famille de pictogrammes SportOS. Bandeau 4/4 forest green, accent lime, objectifs adaptatifs et entrée Strava intégrés aux composants existants, mobiles.

## Tests et mise en production

- Tests back-end isolés dans `tests/backend.test.cjs` : colonnes facultatives, idempotence, RIR séparé des secondes, limites d'entrée.
- Tests Chromium `tests/feedback-qa-v0.8.cjs` sur l'aperçu autonome, sans connexion à Google Sheets : formulaires, célébration 4/4, adaptation, blocage douleur, quatre formats responsive.
- Aperçu [SportOS V0.8](apercu-sportos-v0.8.html).
- **Déploiement ultérieur** : nécessitera une revue du schéma et une procédure V0.8 spécifique qui audite l'identifiant WebApp existant. Ne pas utiliser le script `publier-v0.7-cloud-shell.sh` pour pousser V0.8.

Les évolutions correspondent à un accompagnement sportif progressif, pas à un avis médical ni à une prescription automatisée. En cas de douleur persistante, interrompre l'augmentation et demander un avis professionnel.
