# SportOS V0.3 — Revue UX/UI du lot Shell + Accueil

**Statut** : code de la refonte sur branche, non publié. Le moteur sportif, la base personnelle Google Sheets et les autorisations Apps Script sont inchangés.

## Éléments livrés
- Sidebar foncée : identité SportOS, navigation, état actif et actions utiles. Mini-bloc objectif Espiens.
- Topbar : chemin de navigation, date, action globale « + Séance », accès Profil. Pas de bouton fictif (recherche/notifications).
- Bottom bar mobile : 4 pages actives, safe-area prise en compte.
- Accueil : intro éditoriale, hero sport typographique sans image tierce, prochaine séance proposée, CTA programme, enregistrement rapide.
- Semaine : 0–4 types d'activités distincts, enregistrés cette semaine uniquement, états « Réalisée / Proposée / À planifier ».
- Dernier mouvement : dernière activité datée, qu'il s'agisse de renforcement, course ou vélo ; champs inconnus affichés comme inconnus, sans chiffres inventés.
- Défi Espiens, conseil d'entraînement prudent, check-in hebdomadaire (état enregistré ou action).
- Sélecteur rapide de l'activité enregistrée : A, B, Course ou Vélo, renvoi aux **formulaires existants**, aucune écriture avant soumission.
- Nouveau design system typographique et chromatique. Breakpoints : mobile <761, tablette compacte 761–1050, medium ≤1220 et desktop.

## Revue & liens
- [Aperçu HTML autonome V0.3](./apercu-v0.3.html) — données locales **illustratives**, aucun accès ni écriture dans Google Sheets.
- [Blueprint détaillé](./ux-blueprint-v0.3.md).
- [Tests](../tests/homepage.test.cjs).

## Vérifications réalisées / restantes
- Contrôles pure JS des dates et semaines ISO, doublons type, dernière séance, 4/4 et bilan existant (GitHub Actions à valider sur la PR).
- Manifeste \`MYSELF\` / \`USER_DEPLOYING\` inchangé.
- **Reste avant fusion :** ouvrir l'aperçu local sur un navigateur réel (mobile 320,375,390 ; tablette 768 ; desktop 1280/1920), vérifier absence de débordement, qualité et contraste, interactions souris/clavier, focus modal, CTA et continuité des autres pages.
- **Reste avant production :** merge approuvé, \`clasp push\` ciblé sur le projet existant et mise à jour du déploiement \`AKfycbx9CoVk8WioZ2a_IJl4CwBk6Mk23lLEf_9yJY_g-NBJ8Zxzog7TyXaoPAxS02PeOxZYCw\` ; jamais création d'un nouveau projet ou déploiement.

## Améliorations délibérément différées
- Les pages Programme, Progrès et Profil ont le nouveau shell mais conservent leur contenu V0.2 ; leur refonte détaillée est séquencée en lots suivants.
- Aucune nouvelle photo de sportif tant qu'un asset original/licencié n'est pas validé ; l'alternative CSS est premium et autonome.
- Le bouton rapide permet de **journaliser** une séance, pas de chronométrer une séance en direct.
- Évolution coaching recommandée à partir des données historiques et règles santé, sans diagnostic ni décision médicale.
