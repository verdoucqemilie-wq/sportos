# SportOS V0.9.1 — Navigation de cycle et progression explicable

**Statut : implémentation sur branche `feat/v0.9.1-cycle-navigation`. Aucun déploiement Apps Script ni écriture dans les données sportives réelles.**

## Corrections UX
- Accueil, héro « BRAVO. ET RESPIRE. » : disparition complète de la ligne redondante « TA SEMAINE / OBJECTIFS RÉALISÉS » et de sa coche ; conserver le titre, « Semaine accomplie », CTA bilan.
- Pictogramme Renfo B remplacé par l’icône **Lucide biceps-flexed** (licence ISC ; SVG natif local, aucun chargement réseau). Licence/documentation : https://lucide.dev/icons/biceps-flexed
- Suppression de « Le bouton ouvre ton journal : il ne démarre pas de chronomètre. » ; CTA d’enregistrement et CTA de modification inchangés sur la semaine active.

## Cycle basé sur la première semaine datée
- La première activité datée terminée (dans une des quatre disciplines) définit le lundi de la S1 du cycle ; les activités non datées historiques sont conservées, mais ne sont pas affectées arbitrairement à une semaine.
- Une semaine réelle va du lundi au dimanche ; le compteur est **le nombre de types d’activités terminées distincts**, pas le nombre de clics.
- Le sélecteur horizontal S1/S2/S3/S4 (puis semaines ultérieures) indique statut, dates, compteur ; il permet de consulter les semaines et leurs quatre activités.
- Si la semaine courante est complète, afficher par défaut la **semaine suivante** en aperçu ; l’activité enregistrée de la semaine courante reste consultable et modifiable depuis la S1.
- Les semaines futures n’offrent **pas** de bouton « Enregistrer » qui daterait la séance d’aujourd’hui. Le CTA renvoie vers l’historique ; l’enregistrement redevient disponible quand la semaine arrive.
- S3 et S4 ne présentent jamais un ajustement automatique déjà validé ; elles affichent des projections conditionnelles et sont recalculées à partir de la semaine précédente dès qu’un nouveau retour daté est enregistré.

## Données personnelles qui orientent la proposition au 24 octobre 2026
Référentiel vivant en lecture seule : `04_Seances`, `05_Exercices_Log`, `06_Cardio`, `07_Bilans`, `03_Programme`, `14_Cardio_Progression` (Google Sheet personnel, non dupliqué dans le dépôt).

Pour la période S1 du 19–25 octobre 2026 :
- A, séance du 20/10 : effort global 4/10, 30 min ; séries/répétitions réelles lacunaires → ne pas majorer de manière automatique les exercices insuffisamment documentés.
- B, séance du 23/10 : effort 4/10, 23 min ; progression individuelle éventuelle sur mouvements bien renseignés, sans douleur ; tenir compte des anciennes douleurs lombaires déclarées sur RDL et rowing, ne pas réintroduire de charge/progression douloureuse.
- Course du 19/10 : 16 min, 8 × (60 s course + 60 s marche), effort 2,5/10, douleur non renseignée → répétition conservatrice, pas d’augmentation des fractions tant que la sécurité et la récupération ne sont pas confirmées.
- Vélo du 22/10 : 38 min, 9,67 km, effort 6/10, douleur « Non » → consolider la durée, sans +5 min automatique.
- Revue `BIL-S1` non datée au calendrier ISO : conservée pour la vigilance historique, **non** fusionnée automatiquement avec W43.

Le moteur V0.8 `so8WeeklyPlan` est rendu paramétrable par début de semaine. Il ne persiste pas ses propositions et ne modifie ni la programmation de base dans le Sheet ni les retours passés.

## Déploiement dans la WebApp privée existante
Après revue de la PR, fusion et tests CI **verts**, connecter le Cloud Shell au **compte Google personnel** de SportOS. Ne pas utiliser le script V0.9 pour les sources V0.9.1.

Audit uniquement :
```bash
cd ~/SportOS_deploiement_unique
git switch main
git pull --ff-only origin main
bash scripts/publier-v0.9.1-cloud-shell.sh --audit-only
```

Si `SPORTOS_V0_9_1_AUDIT=PASS` et `ECRITURES=0`, l’utilisatrice peut déclencher la publication sur le **même déploiement WebApp** avec :
```bash
bash scripts/publier-v0.9.1-cloud-shell.sh --publish
```
La version effectivement déployée ne sera confirmée qu'avec `SPORTOS_V0_9_1_DEPLOIEMENT_CIBLE=TERMINE` et un contrôle manuel sur l’URL `/exec` habituelle.
Aucun déploiement nouveau ni modification de Sheet n’est nécessaire pour ce patch.
