# SportOS V0.5 — Accueil : Typographie, icônes, animations

## Audit de la capture (21 octobre 2026)
Sur l'accueil V0.4, les titres "Course", "ESPIENS" et "La suite se construit" sont issus de plusieurs règles héritées de V0.3 et V0.4. Même si la charte cible Arial/Helvetica, les poids CSS (implicite pour Course et coach, explicite 900 pour ESPIENS), les tailles (55/75/37px), le traitement des capitales et l'interlettrage sont incohérents.

## Décisions design
- Famille d'affichage commune : `Arial, Helvetica, sans-serif` sans police externe.
- Graisse commune aux titres de cartes : 800 ; interlettrage `-.035em`; hauteur de ligne ~1.07.
- Les titres "Course" et "Espiens." partagent la même taille de référence, ajustable à la largeur ; le titre du coach conserve une taille secondaire, mais **exactement la même famille et la même graisse**.
- Le défi ne crie plus en capitales ; la capitale initiale demeure celle du nom propre Espiens.
- Icônes d'interface : SVG inline 24×24, trait uniforme 1.8, accessibles (`aria-hidden="true"` pour les éléments décoratifs), sans emojis. Ajout d'un symbole itinéraire et harmonisation des flèches de lien.
- Animations **une fois à l'apparition** : fondu + déplacement vertical de 10px sur 420ms, progression 760ms, tracé du hero ~1050ms. Survol uniquement sur éléments **cliquables** (couleurs, flèche 2px). Aucune carte passive qui bouge au survol.
- `prefers-reduced-motion: reduce` coupe les animations et transitions de l'accueil, y compris la barre et les flèches.
- Pas de nouveau paquet, de script de tracking, de CDN, de photo ou de police téléchargée. Données et backend inchangés.

## Hors périmètre
Autres pages, moteur métier, refonte globale du menu ou de la topbar, synchronisation Google Sheets, déploiement Apps Script. Ces éléments ne doivent pas changer dans ce lot.

## Critères qualité
1. Comparaison des polices calculées, graisse **800** identique sur les trois titres.
2. Pas de débordement ou texte sortant de sa carte à 320, 375, 390, 768, 1280, 1856 et 1920 pixels.
3. Statut et aria-label restent transmis correctement ; pictogrammes SVG décoratifs masqués aux lecteurs d'écran.
4. Navigation et entrée d'activité toujours fonctionnelles.
5. Tests à mouvement réduit valident `animation-name:none`, progression statique et transitions annulées.
6. Toutes les captures en GitHub Actions ; revue visuelle avant fusion.
7. PR non fusionnée et **aucune publication Apps Script avant validation utilisateur**.

## Liens
- [Aperçu HTML V0.5](./apercu-v0.5.html) — cliquer Raw / enregistrer / ouvrir localement ; données simulées.
- Tests navigateur : `tests/home-polish-qa.cjs`, avec régression V0.4.
