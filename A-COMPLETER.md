# Avant de diffuser le lien

Le site fonctionne tel quel. Ce fichier liste ce qu'il reste à **compléter** et ce qu'il faut **valider**.
- `python tools/pre-publication.py` affiche la liste à jour.
- Ajoute `?check=1` à l'adresse du site : chaque élément à valider est entouré de pointillés ambre.

## À valider (contenu ajouté ou reformulé, pas tiré mot pour mot du CV)
1. **19 M FCFA** (chiffre d'affaires d'EJS pendant ton mandat de DRH) : la mention « record à l'époque, deuxième de l'histoire d'EJS » de l'ancien CV a été retirée, faute de savoir si elle vaut pour 19 M.
2. **Projet « Observatoire sectoriel des ventes automobiles »** (plateforme du groupement automobile) : absent du CV, client non nommé. À valider avant diffusion, vu l'offre en cours.
3. **Deux phrases de ma plume** dans la Vision : « Côte d'Ivoire, Abidjan : c'est d'ici que je regarde les chiffres » et « Financer, bâtir, mesurer… ».
4. **Orange Money** : contenu à faire valider par ton encadrant.
5. **Traductions anglaises** à relire. Les intitulés des diplômes ENSEA restent en français dans la version anglaise.

## À compléter (dans `data/content.json`)
- `cfg.cv` : chemin du PDF déposé dans `assets/cv/` → le bouton « Télécharger mon CV » apparaît. Le PDF sera public : retire le téléphone si tu préfères.
- `ph[].s` / `.a` : photos (section Engagements) ; sans photo, la galerie reste masquée.
- Les 9 projets sont en mode « aperçu » : voir `FICHE-PROJET.md`.
- L'adresse `https://michhhel.github.io/Portefolio/` (index.html : canonical, og:url, og:image, JSON-LD ; robots.txt ; sitemap.xml) : à changer si le dépôt ou le domaine change.

## Liens par candidature (sans nommer personne)
- `https://michhhel.github.io/Portefolio/?v=dev` : accroche et ordre des projets orientés développement et institutions.
- `https://michhhel.github.io/Portefolio/?v=conseil` : orientés conseil, finance et risques.
- Sans paramètre : version équilibrée.
