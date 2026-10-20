# SportOS — Blueprint UX/UI V0.3
## Direction : Athletic Editorial / Private Training Club

**Statut : spécification de conception — aucun code V0.3 déployé.**  
**Périmètre : shell (sidebar, topbar, navigation mobile) + page Accueil.**  
**Socle : Apps Script / HtmlService / \`getBootstrap()\` / Google Sheet privé unique.**  
**Objectif : effet « marque sportive premium » inspiré des codes éditoriaux de Nike, sans imitation de marque, de photographie ou de composants propriétaires.**

### 0 — Décisions produit non négociables
1. L'accueil répond en 5 secondes à : « Quel est mon prochain mouvement ? Qu'ai-je fait ? Où en suis-je ? »
2. Plus d'effet « logiciel métier composé de boîtes blanches identiques » : hiérarchie éditoriale, blocs asymétriques, intensités de fond différenciées.
3. La progression reste factuelle : aucune séance historique sans date ne compte dans la semaine courante ; aucune activité proposée n'est présentée comme obligatoire.
4. Les indicateurs sport, sécurité (douleur), progrès et récupération sont distincts ; pas de culpabilisation ni de diagnostic médical.
5. Le mode personnel reste privé. Le système source Google Sheets, les IDs, les écritures et les formulaires sont conservés.
6. Le design desktop est spectaculaire ; l'UX mobile est prioritaire pour consulter et enregistrer une séance.
7. Ne jamais afficher un contrôle factice : recherche, notification, avatar paramétrable, « commencer l'activité » et filtres n'existent que si un comportement opérationnel est implémenté.
8. Ne jamais prétendre connaître l'état du jour, l'humeur, le sommeil ou la disponibilité sans donnée explicitement saisie.

## 1 — Identité « Athletic Editorial »
**Territoire** : énergie du mouvement + sophistication du bien-être + densité minimale d'un SaaS personnel. SportOS reste une marque propre.

**Palette cible** (ajustable après revue WCAG) :

| Token | Hex | Usage |
| --- | --- | --- |
| Ink | \`#151915\` | Titres, navigation active, hero sombre |
| Forest | \`#153C30\` | Accent secondaire identitaire |
| Bone | \`#F5F4EF\` | Toile principale |
| Paper | \`#FFFFFF\` | Supports fonctionnels |
| Acid | \`#D4F17B\` | Unique accent énergique : CTA ou indicateur |
| Sage | \`#E4EBE1\` | Modules contextuels |
| Sand | \`#EDE6DB\` | Coaching / récupération |
| Muted | \`#58635D\` | Secondaire lisible |
| Line | \`#DEE3DC\` | Bordures fonctionnelles très rares |
| Warning | \`#8B5637\` | Prudence et douleurs, sur fond adapté |

**Typographie** :
- Display : condensée/athlétique, graisses 750–900 ; proposition Barlow Condensed / Archivo Narrow sous licence compatible, repli système robuste.
- Texte d'interface : famille neutre et hautement lisible (Inter ou système), 14–16 px et interlignage 1.45–1.6.
- Headlines non systématiquement en capitales ; micro-labels uppercase seulement pour le rythme graphique.
- Ne pas charger de police tierce sans examen de licence, performance et confidentialité.

**Rythme** : espace 8/12/16/24/32/48/64 ; très grands titres (desktop ~64–84 px, mobile ~38–48 px) réservés au premier tiers de la page. Un seul grand élément immersif. Rayon : 12px controles, 18–22px panneaux, 24–28px hero ; pas de micro-card sur chaque information. Ombres légères et rares.

**Imagerie** :
- Un visuel de mouvement athlétique contextualisé (photographie éditoriale originale ou correctement licenciée) sur le hero, cadré avec directionnalité et dégradé assurant le contraste du texte ; éviter les photos stock génériques ou l'image d'une personne supposée représenter l'utilisatrice.
- Aucun logo, slogan ou produit Nike utilisé. Aucune photographie non licenciée.
- Solution de repli sans image disponible dès la V0.3 : composition CSS éditoriale, lignes/typographie grand format, sans rectangle vide ni visuel artificiel.
- Budget de performance : image WebP/AVIF compressée, dimensions adaptées, alt text approprié si informationnel sinon décorative.

## 2 — Architecture / shell
### Desktop ≥ 1200 px
**Grille** : sidebar 224px, topbar 72px, main fluide, largeur utile max ~1440 px. Gouttières 28–42px. La sidebar est fixe à gauche ; elle ne devient pas une colonne vide de 100vh.

**Sidebar** :
- En-tête (hauteur 80px) : sigle SportOS + mot-symbole compact ; sobre, typographie affirmative.
- Section principale : ACCUEIL, PROGRAMME, PROGRESSION, PROFIL, avec une famille d'icônes cohérente (outline 20px, épaisseur 1.8–2 px) et \`aria-current="page"\` pour l'état sélectionné.
- Lien actif : surface sombre / liseré chartreuse, texte fortement contrasté ; hover et focus visibles.
- Section action : bouton « + Enregistrer une séance »; ouvre un sélecteur A/B/Course/Vélo, puis le formulaire existant. Pas d'enregistrement immédiat.
- Pied utile : mini espace « En préparation » → Espiens, mai 2027 / scénario sur 2 jours, lien vers programme Vélo. Pas de répétition de slogan vide.
- Pas de menu « Coach » tant que l'écran correspondant n'existe pas ; conseils intégrés à l'accueil.

**Topbar** :
- À gauche : fil de navigation léger \`SportOS / Accueil\` et titre contextuel ou « Aujourd'hui ». Ne pas répéter le grand titre de la page.
- À droite : date locale, bouton principal « + Séance », accès Profil (vrai lien), sans cloche ni loupe inertes.
- Taille ~72px ; fond bone translucide ou paper, bordure inférieure discrète ; sticky si l'espace le justifie.
- Bouton global disponible partout dans SportOS via action existante \`openLog\`; si un sélecteur d'activité est nécessaire, il doit être réellement fonctionnel.
- Un seul \`<h1>\` par page dans le contenu ; le titre topbar est un libellé de navigation, pas un deuxième H1.

### Tablette 768–1199 px
- Sidebar compacte 72px avec icônes et info-bulles accessibles au clavier, ou drawer explicite si largeur restreinte.
- Barre d'action conserve « + Séance ».
- Colonnes d'accueil basculent sur une grille 60/40 puis empilée selon largeur réelle, sans débordement.
- Aucun contenu masqué pour obtenir une fausse propreté.

### Mobile < 768 px
- Barre haute compacte ~56–64px : logo, date courte ou état, bouton action « + » avec \`aria-label\`.
- Bottom navigation fixe : Accueil, Programme, Progrès, Profil ; icônes et labels, repère actif fort, safe-area iOS/Android.
- Pas de sidebar desktop. La carte Espiens du pied de sidebar est accessible depuis le dashboard/programme.
- Le hero s'adapte sur une colonne ; headline, séance, CTA visibles avant le premier scroll sur un écran courant quand possible.
- Interactions tactiles ≥ 44×44px ; contraste et taille de police testés à 320, 375, 390, 768px ; pas de défilement horizontal.
- Les formulaires existants restent navigables avec clavier mobile ouvert ; empêcher la barre du bas de recouvrir le bouton d'enregistrement.

## 3 — Accueil V0.3 : structure éditoriale

### Zone 0 : bandeau identitaire sans redondance
Label « TON ESPACE D'ENTRAÎNEMENT » + date dans la barre haute ; premier H1 court fort, par exemple :
**« LE MOUVEMENT / TE VA BIEN. »** 
Message secondaire contextualisé, non intrusif : « Avance à ton rythme. Voici ce qui t'attend. »
Ne pas afficher un prénom, une météo, ou une humeur non expressément fournie.

### Zone 1 : hero sportif principal, pleine largeur éditoriale
**Placement** : 60–68% de largeur utile sur grand desktop ; hauteur ~430–500px. La direction photo (si asset validé) occupe ~40–50% à droite, texte à gauche avec contraste robuste.

**Éléments** :
- Sur-titre : \`À LA UNE · PROCHAINE SÉANCE PROPOSÉE\`
- Titre sport / éditorial en très grand corps, maximum 3 lignes
- Libellé secondaire réel : Renforcement A · Fessiers & full body · 35–45 min environ · 5 exercices.
- CTA primaire chartreuse « Voir ma séance » → \`navigate('program')\` avec \`S.programTab='A'\`.
- CTA secondaire « Enregistrer une activité » → sélecteur du type / formulaire actuel, jamais enregistrement automatique.
- Mini disclaimer : « Proposition flexible · aucune séance imposée ».

**Variantes dynamiques** :
- Si A terminée dans semaine, choisir une autre activité disponible selon priorité explicitée, sans inventer un horaire. Ne pas réduire l'algorithme à une attribution de date fictive.
- Si 4/4 : « Belle semaine en mouvement » + CTA Bilan / récupération, pas de prochaine séance imposée.
- Si aucun programme actif : « Choisir mon programme ».
- Si activité suspendue par douleur signalée sur exercice spécifique, conserver consigne sécurité visible et ne pas pousser à la surcharger.
- Un badge « Fait » représente une saisie factuelle, pas une date proposée.

### Zone 2 : panneau « Cette semaine »
**Placement** : colonne secondaire accolée au hero, hauteur harmonisée.
- H2 « Ta semaine »
- \`1 sur 4\` + progression accessible textuellement, jamais cercle « succès » factice.
- 4 lignes ou tuiles sans mini-cartes imbriquées : A, B, Course, Vélo ; icônes cohérentes.
- États : **Réalisée** (donnée enregistrée + date valide dans semaine), **Proposée** (suggestion), **À planifier** (pas de séance prévue), **Adaptée** (progression différée pour prudence). Ne pas utiliser « Prochaine » pour plusieurs activités.
- Chaque ligne ouvre le bon programme, et peut proposer l'enregistrement sur son menu secondaire.
- Totaux historiques placés sous forme de micro-lien vers Progrès, pas dans le comptage hebdomadaire.

### Zone 3 : section « Ton élan »
Au lieu de trois cartes identiques :
- **Dernier mouvement** (format large 55–60%) : dernier événement daté réellement enregistré, tous types confondus, date, durée et effort si connus. Si course du 19/10 dernier événement, afficher « 16 min · course/marche · effort 2,5/10 ». Si une séance est plus récente, mettre celle-ci en avant.
- **Ton défi** (format 40–45%) : « ESPIENS / MAI 2027 », traitement visuel très affirmé (mots géants, topographie/ligne sportive abstraite non géographique), sous-texte « cap vélo sur 2 jours » ; CTA « Voir la préparation ».
- Une asymétrie lisible prime sur l'accumulation de cartes arrondies.

### Zone 4 : « Le regard du coach »
Bande éditoriale horizontale fine ou module au contraste propre. Un seul conseil dominant, **2–3 phrases max**, avec raison visible et action :
- Exemple réel : « Ta course du 19 octobre a été facile (2,5/10). On consolide encore 8×(1 min course / 1 min marche). » → Voir le programme course.
- Si une douleur a été déclarée, encart de sécurité distinct (pas un diagnostic).
- Si historique insuffisant, phrase sobre « Quelques sorties de plus permettront d'adapter les recommandations. »
- Ne jamais générer une recommandation incompatible avec les règles du moteur de coaching.

### Zone 5 : « Ton check-in »
Bande claire + CTA \`Faire mon bilan\` : lance le formulaire actuel. Montrer s'il est déjà enregistré dans la semaine (sans proposer de doublon ou action inutile).
- Aucun questionnaire visible en permanence sur l'accueil.
- Après sauvegarde, mise à jour visuelle et retour non culpabilisant.
- « Je peux commencer / continuer » plutôt que « Tu dois ».

### Zone 6 : secondaire
Une seule ligne discrète : historique total renforcement / cardio avec lien « Mes progrès ». Pas de petite note technique apparente comme « les séances sans date ne sont pas comptabilisées » en permanence ; cette règle sera présentée par tooltip/aide lors d'une incompréhension.

## 4 — Règles de données et de priorisation
**Source** : \`getBootstrap()\`, sans changement de schéma V0.3.
- \`04_Seances\` : renforcement réalisé avec une date ISO valide et statut Terminé.
- \`06_Cardio\` : course/vélo réalisé avec date ISO valide.
- \`11_Programmes\` et \`03_Programme\` : intitulé, durée, exercice, objectifs et contraintes ; ne pas présenter un programme comme « Actif » s'il n'est que « Proposé » dans le Sheet.
- \`14_Cardio_Progression\` : prochaine étape de course / préparation Espiens, ne pas augmenter sans bilan de tolérance.
- \`05_Exercices_Log\` : signaux de douleur et précision de l'exercice ; ne pas assimiler une douleur historique à un diagnostic ni déclarer l'ensemble de l'activité interdite.
- \`07_Bilans\` : existence du bilan hebdomadaire.
- Identifier une vraie dernière activité par tri date, pas par ordre des lignes. Si aucune date, ne pas fabriquer un horodatage.
- Semaine ISO Europe/Paris cohérente ; attention aux changements d'année et dates de dimanche. Éviter la double conversion TZ dans le navigateur.
- Distinct : historique, semaine en cours, suggestion, saisie, coaching.

**Algorithme de prochaine activité V0.3, version prudente** :
1. Si 4/4 activités enregistrées : proposer récupération/bilan.
2. Sinon lire préférences/jours proposés ; afficher l'activité prioritaire non réalisée comme **suggestion**, pas comme réservation d'agenda.
3. Donner priorité à un objectif de régularité en évitant de sélectionner systématiquement A si B est déjà réalisée et A non faite, ou de pousser vélo/course de façon inappropriée.
4. En cas d'absence de données ou de douleur sur des mouvements, afficher un conseil de prudence plutôt qu'une prescription automatique.
5. Présenter toujours une alternative « Choisir une autre activité » ; la proposition ne pilote pas une écriture.

## 5 — Architecture technique pour le lot de code suivant
**Pas de migration de données.** Apps Script HtmlService maintenu.
- \`Index.html\` : shell accessible et responsive ; barre d'actions globales.
- \`Styles.html\` : tokens, typography/layout, design du shell, responsive ; styles des pages non encore refondues protégés.
- \`Client.html\` : séparer (fonctions ou includes compatibles Apps Script) composants \`renderSidebar\`, \`renderTopbar\`, \`renderHome\`, \`renderHero\`, \`renderWeek\`, \`renderLastActivity\`, \`renderChallenge\`, \`renderCoach\`, \`renderCheckin\`.
- Couche \`selectors\` dédiée aux données métier ; une fonction purifiée pour priorités et progression, et tests unitaires.
- Réutiliser \`navigate\`, \`openLog\`, \`openReview\` et \`server('getBootstrap')\` ; ne pas casser \`A/B/Course/Vélo\` ni modifier \`Code.gs\`.
- Icônes SVG inline avec labels et rôle accessible ; éviter les emoji comme icônes de navigation.
- Skeleton de chargement, empty states et erreurs réseau, même navigation au retour.
- Ne pas dupliquer CTA mobile/desktop sans comportement partagé.

## 6 — États et critères QA
1. **Première visite sans séances** : hero utile, 0/4, états vides, aucun KPI inventé.
2. **Données réelles actuelles** : 2 renfo historiques sans date, 1 course 19/10/2026, 0 vélo ; dans semaine du 19/10 le compte = 1/4.
3. **Plusieurs séances même type** : activité hebdomadaire comptée 1 seule fois ; total historique reflète le nombre réel.
4. **4/4** : hero alternatif récupération/bilan.
5. **Une activité après l'autre** : toutes les actions ouvrent le bon programme et le bon formulaire sans écrire avant validation.
6. **Douleur déclarée** : message factuel spécifique, pas de diagnostic ni progression automatique.
7. **Bilan enregistré** : CTA devient consultation/édition si implémentée ou « Bilan enregistré », sans duplication.
8. **Manque de dates / durées / RPE** : espaces et textes adaptatifs, pas de \`NaN\` ni valeurs inventées.
9. **Dates iso fin/début d'année** : pas de semaine fausse, pas de changement de jour dû à TZ.
10. **Mobile 320/375/390px, tablette 768px, desktop 1280/1920px** : aucun overflow, priorité CTA, nav accessible.
11. **WCAG** : contraste lisible, labels visibles, cible tactile ≥44px, tabulation/focus, interactions clavier, \`prefers-reduced-motion\`.
12. **Performance** : un chargement de données, pas de rafraîchissement de toutes les vues à chaque petit état ; compression/lazy loading visuel.
13. **Protection** : manifeste Apps Script \`MYSELF\` et \`USER_DEPLOYING\`, pas de fuite des données dans le dépôt, pas de données fictives dans Sheets.
14. **Publication** : branche dédiée, CI, screenshot mobile+desktop, revue de design, fusion, \`clasp push\` et actualisation ciblée du déploiement existant (même ID).

## 7 — Livrables, ordre et règles de validation
- **P0 / A : Design system du shell** : sidebar, topbar, mobile nav, CTA, tokens, typographies et composants.
- **P0 / B : Homepage éditoriale** : hero, semaine, dernier mouvement, Espiens, coach, bilan.
- **P0 / C : État métier** : sélecteurs de semaine, priorité réelle, états d'accessibilité et sécurité.
- **P0 / D : Preview** : fichier HTML autonome fondé sur vrais composants sans compte Google ; captures desktop/tablette/mobile.
- **P0 / E : QA + PR** : tests automatiques + audit visuel + validation humaine.
- **P0 / F : Déploiement** : GitHub main → clasp → déploiement @ existant, et vérification de l'URL existante.

**Décision de la présente phase :** documentation seulement, aucune mutation du moteur sportif, aucun Apps Script touché, aucune commande de publication. La phase suivante est le développement UI/UX sur branche dédiée.

## 8 — Hors périmètre
- Nouveau moteur de coaching IA, nouvelles données médicales ou suivi de santé.
- Strava OAuth ou import de données.
- Refonte complète des pages Programme, Progrès, Profil : elles devront recevoir le shell partagé mais leur contenu détaillé sera conçu lors de leurs lots successifs.
- Calendrier automatique avec notifications, géolocalisation, parcours vélo réel Toulouse–Espiens.
- Toute publication avec accès public.
