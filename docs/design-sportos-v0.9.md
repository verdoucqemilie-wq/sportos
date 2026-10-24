# SportOS V0.9 — Responsive, retours modifiables et séances guidées

**Statut : branche de fonctionnalité / revue. Aucune publication Apps Script et aucune écriture sportive réelle.**

## 1. UX responsive
- Barre latérale et navigation existantes conservées sur PC et tablette ; navigation basse maintenue sur téléphone.
- Adaptation des grilles, panneaux, cartes et formulaires aux largeurs étroites : desktop, tablette, téléphone 320 à 1920 px.
- Dimensions tactiles et changements de colonnes adaptés, aucun contenu masqué de manière à inventer des statistiques.
- Respect de `prefers-reduced-motion`, focus visible et zones tactiles.

## 2. Icônes et accueil
- Nouveau pictogramme Renfo B en SVG cohérent avec la famille SportOS et bouton « Modifier » avec crayon.
- Nouvelle carte « Le Grand Défi », parcours Toulouse → Espiens et vélo intégré, titre plus naturel et CTA.
- Suppression du bandeau durable « 4 SUR 4 / SEMAINE ACCOMPLIE » **sur l’accueil uniquement** ; les statistiques de la semaine restent visibles.
- La félicitation ponctuelle à l'enregistrement du quatrième type reste disponible et le bandeau du programme demeure ; aucun changement de calcul.

## 3. Retour de séance rééditable
- Une séance du type correspondant, terminée et datée dans la semaine active, **créée depuis la WebApp**, donne accès à « Modifier mon retour » et à son crayon.
- Le formulaire rouvre la séance réelle avec la date, les sensations, notes et valeurs d'exercices ou données cardio/Strava enregistrées.
- Enregistrement sur **l'ID existant** (`Seance_ID` ou `Cardio_ID`) ; les journaux d'exercices conservent leur clé `Seance_ID_Exercice_ID`.
- Vérification serveur préalable de l'ID, du type, du statut terminé et de l'origine WebApp ; refus de modifier les séances historiques déclarées dans le chat.
- Les anciennes valeurs de répétitions/RIR du gainage ne sont pas converties ni effacées silencieusement.
- En semaine suivante, le CTA propose une nouvelle séance plutôt que d'écraser le retour de la semaine précédente.

## 4. Pédagogie de chaque séance
- **Avant** : échauffement progressif spécifique à A, B, Course et Vélo.
- **Pendant** : description concrète, séquencée en 3 étapes, de chacun des 10 mouvements de renforcement actifs.
- **Après** : retour au calme et étirements doux de confort, spécifiques à l'activité.
- Consignes accessibles depuis Mon programme **et** dans le journal d'entraînement.
- Les exercices douloureux doivent être adaptés/interrompus ; les repères ne sont pas des obligations. Les amplitudes et charges restent ajustables, sans progression forcée des lombaires.

## 5. QA, révision et publication
- `npm run verify` inclut les contrôles V0.9 sans accès à Google Sheets.
- `tests/visual-qa-v0.9.cjs` vérifie avec Chromium 22 combinaisons de viewport/vue, le préremplissage et la modification idempotente d'une **séance de démonstration**.
- [Aperçu autonome V0.9](apercu-sportos-v0.9.html) : fixture fictive, sans accès Google Sheets ; ouvrir la rubrique Programme puis Renfo B pour tester le bouton.
- **Ne pas exécuter le script de publication V0.8 ni pousser manuellement le code Apps Script V0.9** : un dispositif de publication versionné et contrôlé sera nécessaire après revue et confirmation de la version réellement déployée.
- Pas de modification du schéma du Sheet, aucune séance fictive dans la base personnelle, aucune mise en ligne automatique.
