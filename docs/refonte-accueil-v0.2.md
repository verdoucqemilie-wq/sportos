# Refonte de l'accueil — Athletic Wellness (code GitHub uniquement)

**Branche :** `feat/accueil-athletic-wellness`

**État :** développé sur la branche, **non fusionné dans main**, **non déployé dans Apps Script**. Le Google Sheet et les séances existantes ne sont pas modifiés.

## Objectifs UX
- Remettre la prochaine séance proposée au-dessus de la ligne de flottaison avec un CTA vers sa fiche et une action d'enregistrement distincte.
- Montrer séparément la semaine en cours (A, B, course, vélo) et les totaux historiques.
- Détecter les activités réellement enregistrées dans la semaine, sans attribuer une date aux anciennes séances sans date.
- Mettre en scène la dernière course déclarée, le défi Espiens (mai 2027, scénario en 2 jours) et une recommandation prudente.
- Utiliser une esthétique sportive/lifestyle premium : vert forêt, crème, tonalités sauge/citron, hiérarchie typographique nette.
- Optimiser téléphone et ordinateur, conserver les styles des autres écrans.

## Scénarios de validation

| Cas | Résultat attendu |
| --- | --- |
| Aucune activité enregistrée cette semaine | 0/4, séance A proposée, pas d'historique inventé |
| Une course enregistrée seulement | 1/4, course marquée réalisée, A proposée |
| A + course enregistrées | 2/4, B proposée |
| Quatre activités enregistrées | 4/4, proposition de bilan à la place de la séance |
| Première utilisation sans historique de course | État vide non culpabilisant |
| Douleurs anciennes signalées | Conseil de prudence affiché |
| Smartphone étroit | Hero, cartes et CTA sans débordement horizontal |

## Validation technique
- `npm run test:home` : vérifie 5 scénarios HTML dynamiques, le comportement historique/semaine et les sélecteurs.
- `npm run verify` : lance les contrôles historiques puis ceux de l'accueil.
- Cliquer **Découvrir la séance** : l'onglet du bon programme doit s'ouvrir.
- Cliquer **Enregistrer après l'avoir faite** : ouverture du formulaire existant, sans sauvegarde automatique.
- Cliquer **Faire mon bilan** : ouverture du formulaire existant.
- Après validation : fusion contrôlée dans `main`, puis **mise à jour de la publication Apps Script existante**, et jamais création d'une seconde WebApp.

**Non couvert à cette étape :** modification des autres pages, nouveau moteur de coaching, recherche d'itinéraire Espiens, déploiement ou saisie de séances d'essai dans le vrai Sheet.
