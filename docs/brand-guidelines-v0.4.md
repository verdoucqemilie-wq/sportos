# SPORTOS — IDENTITÉ DE MARQUE V0.4 (CANDIDATE)

**Positionnement** : une application privée, sport + lifestyle, qui valorise la régularité et le mouvement plutôt que la performance obligatoire. Inspirée des principes éditoriaux des marques sportives, **sans copier de signature visuelle, slogan, pictogramme ou contenu protégé**.

**Statut : candidate à valider**. Version opérationnelle préparée sur la branche \`feat/v0.4-adaptive-brand-system\`. Ne pas mettre en production sans validation.

## 1. Plateforme de marque

- **Nom** : SportOS (en interface, logo écrit \`sportOS\`).
- **Promesse** : « Mon entraînement, mon rythme. »
- **Signature** : MOVE WITH INTENTION (facultative et réservée au logo complet / branding, jamais comme obligation personnelle).
- **Ton** : énergisant sans injonction. Direct, chaleureux, précis ; jamais « tu dois » ou « tu as échoué ».
- **Architecture** : la marque est dominante sur l'accueil, discrète dans le suivi de séance. Les données restent au centre.

## 2. Symbole « La Piste »

Le sigle n'est plus un caractère typographique \`✳\` susceptible de varier selon le système. Il s'agit d'un SVG propriétaire à échelle 48×48 : une trajectoire en S, continue et arrondie, évoquant à la fois « Sport » et une piste d'entraînement, terminée par un repère circulaire. Il ne représente aucune performance normée.

**Assets source éditables** :
- \`assets/brand/sportos-mark.svg\` : symbole seul carré.
- \`assets/brand/sportos-lockup-horizontal.svg\` : mot-symbole complet et signature.

**Variantes** : sur fond sombre, pictogramme citron et texte blanc ; sur fond clair, pictogramme citron et texte encre. Aucun effet de flou, relief, gradient interne ou ombre portée au logo. Ne pas étirer, tourner ou déformer les caractères.

**Espace de protection** : minimum 25% de la largeur du pictogramme. Taille minimale du symbole : 28 px écran. Version mot-symbole complète : largeur >160px.

**Accessibilité** : logo image décoratif dans un bouton déjà libellé, titre accessible unique pour l'asset autonome. Jamais utiliser la couleur du logo comme seul indice de navigation.

## 3. Système chromatique

| Jeton | Hex | Rôle |
| --- | --- | --- |
| \`--brand-ink\` | \`#151915\` | Noir-vert / grands titres / menu |
| \`--brand-forest\` | \`#153C30\` | SportOS secondaire |
| \`--brand-bone\` | \`#F5F4EF\` | Fond chaud |
| \`--brand-paper\` | \`#FFFFFF\` | Surfaces de lecture |
| \`--brand-acid\` | \`#D4F17B\` | Énergie, interaction principale |
| \`--brand-sage\` | \`#E4EBE1\` | Récupération, panels calmes |
| \`--brand-sand\` | \`#EDE6DB\` | Conseils/bilans |
| \`--brand-muted\` | \`#58635D\` | Texte secondaire |
| \`--brand-line\` | \`#DEE3DC\` | Bordures et séparateurs |
| \`--brand-caution\` | \`#87412D\` | Prudence / douleur |

Tests de contraste de référence, ratios calculés (WCAG) : ink/bone **16,14:1**, forest/bone **11,08:1**, ink/acid **14,10:1**, muted/bone **5,68:1**, muted/sage **5,14:1**, blanc/forest **12,20:1**, caution/sand **6,00:1**. Les petites légendes sur fonds spéciaux restent à contrôler individuellement.

Règle : une seule surface très sombre et un seul accent citron majeur visibles à la fois. La charte n'est pas un nuancier pour remplir toutes les cartes.

## 4. Typographie (stabilisée, sans service externe)

- **Titres éditoriaux** : police Arial ou Helvetica, poids 800–900 (synthétisé selon OS), hiérarchie à grande échelle, interlettrage entre \`-0.035em\` et \`-0.015em\`, jamais étirement horizontal forcé. **L'apparence dépendra légèrement des polices installées** ; variante future self-hosted sous licence open source à étudier séparément.
- **Interface et formulaires** : \`Arial, Helvetica, sans-serif\`, 400/600/700. Texte courant 14–16 px, interlignage 1.4–1.6.
- **Chiffres et données** : \`font-variant-numeric: tabular-nums\`, seulement pour tableaux et comparaisons.
- **Micro-labels** : 11–12px, capitales espacées \`0.08em\` à \`0.12em\`, pas de petits corps très espacés à 9px.
- **Grand display desktop** : 46–66px selon conteneur ; hero 52–74px. Mobile titre 33–42px ; hero 44–60px. Éviter 3 lignes incontrôlées dans le hero.

La préférence d'une future police en licence libre sera arbitrée après inspection sur appareils réels : **on ne charge aucun fournisseur externe de polices dans une application privée** sans décision de confidentialité.

## 5. Éléments d'interface

- **Bouton principal** : fond acid + texte ink, rayon 8–10px, hauteur ≥44px ; hover par changement de couleur, pas translation de surface.
- **Bouton secondaire** : contour/fond transparent contrasté, focus visible.
- **Navigation active** : surface acid + texte ink dans le menu ; sur mobile focus et état non fondés uniquement sur la couleur.
- **Cartes** : 12–18px de rayon, ombre seulement si utile, pas sur tous les panels ; espacement d'au moins 12px.
- **Icônes** : grille cohérente 20–24px, stroke environ 1.8–2, SVG inline si nécessaire.
- **Mouvement** : transitions d'opacité et de couleur 120–180ms, aucune animation de carte non cliquable ; respect \`prefers-reduced-motion\`.
- **Footer / secondary** : jamais de contrôle bloqué sous la navigation mobile.

## 6. Responsive & accessibilité

La charte doit tenir en **320, 360, 375, 390, 430, 600, 768, 820, 1024, 1280, 1440, 1920, 2560px**, mais aussi en hauteurs **600, 700, 800, 900px** et en zoom navigateur. Contrôler le reflow, pas seulement l'absence d'overflow.

- Desktop large ≥1320 : menu 232–248px, 2 colonnes hero/semaine.
- Desktop intermédiaire 1060–1319 : menu 208–224px ; 2 colonnes seulement si largeur utile et titre restent lisibles.
- Tablette 768–1059 : menu icon-only 72px ou bascule en bas à ≤820 selon besoin de place ; tableau de bord sur une colonne si pertinent.
- Mobile ≤767 : topbar compacte, nav en bas, CTA prioritaire lisible avant le premier scroll si hauteur disponible.
- **Hauteur courte** : supprimer le *nested scroll* de la sidebar, adapter ses marges, autoriser un défilement de l'ensemble du menu seulement si nécessaire ; ne jamais couper le bouton « Enregistrer ».
- Zones tactiles ≥44×44px, navigation clavier/écran lecteur, zoom à 200 %, erreurs non silencieuses, contrastes AA.

## 7. Critères de validation V0.4

1. Logo identique dans sidebar et topbar mobile ; SVG et lockup disponibles comme sources.
2. Les quatre vues du produit héritent des mêmes tokens, boutons, titres et navigation, sans refonte de leur logique.
3. Aucun scroll interne de sidebar à 1856×824 et 1440×800 (capture utilisateur) ; lien de saisie visible.
4. Aucune commande perdue, aucune carte qui dépasse et aucun titre superposé de 320 à 2560 px.
5. Test Playwright : captures multiples, absence de débordement, taille/cliquabilité CTA, état de la nav, scroll, contraste manuel final.
6. Tests existants du moteur \`getBootstrap\`, \`saveStrength\`, \`saveCardio\`, \`saveReview\` restent verts. **Aucune écriture Sheets en QA**.
7. PR en brouillon, validation visuelle avant merge, aucune mise à jour Apps Script avant GO explicite.

## 8. Risques / questions laissés ouverts

- Nom et signature : proposés, pas déposés légalement ni validés commercialement. Projet privé.
- Police system-ui : rendu presque constant mais non identique au pixel près ; à surveiller.
- Les captures testées dans Chromium ne valident pas à elles seules VoiceOver, Safari iOS, ni les interactions sur téléphone physique.
