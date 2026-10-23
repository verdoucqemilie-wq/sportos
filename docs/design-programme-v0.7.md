# SportOS V0.7 — Refonte complète de « Mon programme »

**Périmètre** : UX/UI de la page Programme uniquement. Le moteur Apps Script `src/Code.gs`, le manifeste privé et toutes les données historiques restent inchangés. **Statut : candidate à valider, GitHub branche seulement.**

## Problèmes d'origine
- Une page à onglets avec petites cartes génériques, emojis mélangés au design system SVG, hiérarchie faible et lecture difficile des charges/temps/technique.
- Quatre catégories de programme traitées de façon presque identique, alors qu'elles ont des objectifs, repères et parcours de consultation différents.
- Programme prévu et activités réellement réalisées pas assez dissociés ; pas de statut daté visible par activité.
- Informations de sécurité / historique / objectifs déconnectées des actions de saisie.

## Direction V0.7 : « Training System »
1. Grand en-tête éditorial typographique « Construis ton élan. » et compteur strict des **types d'activités datées réellement terminées cette semaine**.
2. Un sélecteur de quatre activités — Renforcement A, Renforcement B, Course et Vélo — avec icônes SVG SportOS, un vrai état sélectionné (`aria-pressed`) et un état « réalisé cette semaine » uniquement si enregistré.
3. Un hero sombre spécifique à chaque activité, avec titre, promesse, repères vérifiables et CTA « Enregistrer mon retour ». **Aucun faux bouton Lancer/Chronomètre** : l'action ouvre le journal V0.6 existant.
4. Musculation : liste de mouvements en accordéons natifs clavier-accessibles ; par exercice, séries, répétitions/tenue, charge indicative ou « À adapter », repère technique et sécurité. **Les valeurs suggérées ne sont jamais affichées comme performances réelles.**
5. Course/vélo : frise des étapes existantes du Sheet, les statuts apparaissent tels que réellement stockés. Les durées et le détail du trajet restent conditionnels ; ne jamais inventer kilométrage Toulouse → Espiens ou réalisation non datée.
6. Colonne « Ton horizon » : objectifs personnels *existants* de la base, coach contextualisé, dernier retour daté uniquement et lien vers la page Progression.
7. Fluidité : grille adaptative par container queries, focus clavier, motion sobre réservée aux boutons, `prefers-reduced-motion`.
8. Préservation des autres pages et de la connexion unique au Google Sheet SportOS.

## Garde-fous des données
- `homeModel(S.data).done` compte uniquement les types distincts présents dans les activités **Terminée** avec dates dans la semaine ISO.
- Renforcement ancien sans date : jamais compté comme terminé cette semaine ; aucune date inventée.
- Dernière activité : enregistrement le plus récent **avec date valide** pour le type sélectionné ; la page n'en déduit aucune performance de la future séance.
- Les séances restent suggérées même si le type a déjà été enregistré ; aucun blocage artificiel.
- Douleur ancienne : rappel prudent dans la partie renforcement. Pas de conseil médical ni de progression de charge automatique.

## QA et validation
- 9 formats navigateur : 320/375/390/430/768/1024/1280/1856/1920 px.
- Sélecteur A/B/Course/Vélo, cinq exercices A et B en accordéons, frise course et vélo, statut semaine honnête, saisie retour V0.6 fonctionnelle.
- Aucun débordement horizontal, respect du mode mouvement réduit et continuité des autres pages.
- [Aperçu autonome](./apercu-programme-v0.7.html) (Raw → télécharger puis ouvrir) utilisant les seules données de démonstration.
- [Tests Chromium V0.7](../tests/program-qa-v0.7.cjs).
- **Pas de fusion ou de déploiement Apps Script avant validation de l’interface par l'utilisatrice**.
