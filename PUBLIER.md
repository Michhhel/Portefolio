# Publier le portfolio sur GitHub (une seule fois)

Dépôt à créer sur GitHub : **`Portefolio`** (public), avec exactement cette orthographe et cette casse.
Adresse du site : **https://michhhel.github.io/Portefolio/**, déjà inscrite dans le site (aperçu de partage, référencement, page 404).
Si tu changes le nom du dépôt, l'adresse change aussi : préviens-moi pour mettre le site à jour.

## 1. Créer le dépôt
Sur https://github.com/new :
- Repository name : `Portefolio`
- Public
- **Ne coche rien** (ni README, ni .gitignore, ni licence) : le dossier les contient déjà.

## 2. Envoyer le dossier

### Option A — GitHub Desktop (le plus simple sous Windows)
1. File → Add local repository → choisir `D:\LET'S CONQUER THE WORLD\Portefolio`.
2. Il propose « create a repository » : accepter (branche `main`).
3. Résumé du commit : `Portfolio : première version` → Commit to main.
4. Publish repository → décocher « Keep this code private » → nom `Portefolio` → Publish.

### Option B — Ligne de commande (PowerShell ou Git Bash)
```
cd "D:\LET'S CONQUER THE WORLD\Portefolio"
git init -b main
git add .
git commit -m "Portfolio : première version"
git remote add origin https://github.com/Michhhel/Portefolio.git
git push -u origin main
```

## 3. Activer GitHub Pages
Sur le dépôt : Settings → Pages → Source « Deploy from a branch » → Branch `main` / `(root)` → Save.
Le site est en ligne après 1 à 2 minutes : https://michhhel.github.io/Portefolio/

## 4. Vérifier
- Ouvrir le site sur téléphone et ordinateur, dans les deux thèmes et les deux langues.
- `https://michhhel.github.io/Portefolio/?check=1` : les éléments encore à valider sont entourés de pointillés.
- Aperçu de partage : coller le lien dans https://www.linkedin.com/post-inspector/

## Mettre à jour plus tard
Modifier les fichiers (le plus souvent `data/content.json`), puis :
- GitHub Desktop : Commit to main → Push origin
- ou `git add . && git commit -m "Mise à jour" && git push`
Le site se met à jour en 1 à 2 minutes.

## Tester en local avant d'envoyer
Dans le dossier : `python -m http.server 8000`, puis http://localhost:8000
(le double-clic sur index.html ne charge pas le contenu).
