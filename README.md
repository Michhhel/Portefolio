# Portfolio — Michel YAO · « Du bruit au signal »

Site statique, bilingue FR/EN, thèmes sombre (« Nuit ») et clair (« Papier millimétré »).
Un nuage de particules raconte le parcours au défilement : bruit → carte de l'Afrique → monde → clusters (atouts) → série temporelle (parcours) → grille → convergence (contact).

## Structure
- `index.html` : squelette ; tout le texte est dans `data/content.json` (blocs `fr` et `en`)
- `css/style.css` : styles et thèmes
- `js/signal.js` : moteur de particules (Canvas 2D) piloté par le défilement
- `js/geo.js` : points des cartes Afrique et monde (générés depuis Natural Earth, domaine public)
- `js/app.js` : contenu, langue, thème, navigation, réseau des compétences, pages projet
- `js/vendor/` : GSAP (animations des titres et compteurs) et Lenis (défilement fluide), en local
- `assets/` : `img/` (og.jpg, icônes, photos), `cv/`, `docs/`
- `404.html`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `.nojekyll`
- `A-COMPLETER.md` (à compléter / à valider), `FICHE-PROJET.md`, `tools/pre-publication.py`

## Tester en local
`python -m http.server 8000` puis http://localhost:8000 (le double-clic sur index.html bloque le chargement du JSON).

## Publier (GitHub Pages) — détail pas à pas dans PUBLIER.md
1. Dépôt **public** nommé exactement `Portefolio` (avec cette casse : P majuscule).
2. Y envoyer le contenu de ce dossier à la racine.
3. Settings → Pages → Deploy from a branch → `main` / `(root)`.
4. En ligne après 1 à 2 minutes : https://michhhel.github.io/Portefolio/
Après publication, tester l'aperçu de partage : https://www.linkedin.com/post-inspector/

## Accessibilité et performances
- Animations désactivées si le visiteur a choisi « réduire les animations » dans son système.
- Moins de particules sur téléphone ; animation en pause quand l'onglet est caché.
- Pages projet = vues internes (`#/projet/identifiant`) : partageables, non indexées séparément.
- Noms de fichiers en minuscules, sans accents ni espaces (GitHub Pages distingue la casse).
