# Guide de mise à jour du site

Ce guide couvre les opérations courantes pour maintenir et faire évoluer le site sans toucher au code.

---

## 1. Modifier un texte

Tout le contenu du site est dans un seul fichier :

```
website/content/content.json
```

Ouvrir ce fichier dans VSCode, trouver le texte à modifier, le changer, sauvegarder.

**Exemples de modifications courantes :**
- Changer un titre de section → chercher la clé `"title"` ou `"label"` correspondante
- Modifier un paragraphe → chercher quelques mots du texte avec Ctrl+F
- Ajouter un lien → voir section 4 ci-dessous

> **Note :** Les balises `<mark>texte</mark>` dans le JSON correspondent aux mots surlignés sur le site. Tu peux en ajouter ou en retirer librement.

---

## 2. Remplacer une image

### Étapes
1. Préparer la nouvelle image (même nom, même format si possible)
2. Copier le fichier dans le bon sous-dossier :

| Type d'image | Dossier |
|---|---|
| Photo profil / avatar | `website/assets/images/profile/` |
| Témoignages (portraits) | `website/assets/images/testimonials/` |
| Thumbnails projets portfolio | `website/assets/images/portfolio/` |
| Images du ticker (bandeau animé) | `website/assets/images/ticker/` |
| Photos hero (Instagram) | `website/assets/images/hero/` |

3. Si le **nom de fichier change**, mettre à jour le chemin dans `content.json` (cherche l'ancien nom)
4. Si le nom est identique → rien d'autre à faire

### Formats recommandés
- WebP (meilleure performance) ou PNG/JPG
- Thumbnails portfolio : rapport 16/9 recommandé
- Avatar : carré, minimum 400×400px

---

## 3. Ajouter ou retirer une image d'un carousel

Les carousels (Prototype IA, Twitch) utilisent un tableau `"gallery"` dans `content.json`.

**Exemple — Prototype IA :**
```json
"gallery": [
  "assets/images/portfolio/portfolio-crakmedia-ai-00.png",
  "assets/images/portfolio/portfolio-crakmedia-ai-01.png",
  "assets/images/portfolio/portfolio-crakmedia-ai-03.png"
]
```

- **Ajouter une image** : copier le fichier dans `assets/images/portfolio/` puis ajouter son chemin dans le tableau
- **Retirer une image** : supprimer la ligne correspondante dans le tableau (attention aux virgules JSON)
- **Réordonner** : changer l'ordre des lignes dans le tableau

---

## 4. Modifier un lien YouTube (ou autre) dans le portfolio

Dans `content.json`, trouver le projet concerné et modifier la valeur `"link"` ou `"links"`.

**Projet avec un seul lien :**
```json
"link": "https://www.youtube.com/watch?v=XXXXX"
```

**Projet avec plusieurs liens (ex. Twitch) :**
```json
"links": [
  { "label": "Voir les jingles", "url": "https://youtu.be/XXXXX" },
  { "label": "Replay d'un live", "url": "https://youtu.be/YYYYY" }
]
```

Pour changer le texte du bouton, modifier la valeur `"label"`.

---

## 5. Ajouter un nouveau projet au portfolio

Dans `content.json`, section `"portfolio" > "projects"`, ajouter un objet à la position souhaitée :

```json
{
  "id": "mon-projet",
  "title": "Titre du projet",
  "subtitle": "Sous-titre · Contexte",
  "description": "Description du projet...",
  "tags": ["Tag1", "Tag2"],
  "display": "link",
  "link": "https://...",
  "thumbnail": "assets/images/portfolio/mon-projet.png"
}
```

Valeurs possibles pour `"display"` :
- `"link"` → bouton "Voir le projet" vers une URL
- `"carousel"` → carousel d'images (ajouter un tableau `"gallery"`)
- `"modal"` → modale sans carousel (juste la description)
- `"coming-soon"` → badge "En cours de développement"

Pour un projet avec lien sur demande, ajouter `"linkOnRequest": true` (et mettre `"link": null`).

---

## 6. Déployer après une modification

> **Important :** Ce dossier a son propre repo Git. Toujours travailler depuis `h:/_ufeelgreat-projects/projets/ufeelgreat-onepage/`, pas depuis le dossier parent.

Dans le terminal — **3 commandes dans l'ordre, aucune ne peut être sautée** :

```bash
cd h:/_ufeelgreat-projects/projets/ufeelgreat-onepage

# 1. Préparer les fichiers modifiés
git add website/

# 2. Créer le point de sauvegarde (OBLIGATOIRE — sans ça, push n'envoie rien)
git commit -m "Description courte de la modification"

# 3. Envoyer vers GitHub → déclenche le déploiement Netlify
git push
```

**Ce que fait chaque étape :**
- `git add` → sélectionne les fichiers à inclure dans la sauvegarde
- `git commit` → **crée réellement la sauvegarde** avec un message
- `git push` → envoie cette sauvegarde vers GitHub → Netlify déploie

> Si tu fais `add` + `push` sans `commit`, Git n'a rien à envoyer — les fichiers restent en attente indéfiniment sur ta machine.

Netlify détecte le push automatiquement → déploiement en ~30 secondes.

**Configuration Netlify (à faire une seule fois) :**
- Dashboard → Site configuration → Build & deploy → Build settings
- **Base directory** : laisser vide
- **Publish directory** : `website` (géré par `netlify.toml`, pas besoin de le saisir manuellement)

**Vérifier le déploiement :**
- Dashboard Netlify → onglet "Deploys" → voir l'état du build
- Site en ligne : `https://gael-trefeu.netlify.app/`

---

## 7. Pages CV cachées

Les CV ne sont pas accessibles depuis le menu du site, mais accessibles directement par URL :

| URL | Fichier |
|---|---|
| `https://gael-trefeu.netlify.app/cv1.html` | CV Grandes institutions |
| `https://gael-trefeu.netlify.app/cv2.html` | CV Coordination & production |
| `https://gael-trefeu.netlify.app/cv3.html` | CV Digital & tech |

Pour mettre à jour un CV : modifier le fichier `.html` correspondant dans `website/`, puis déployer (étape 6).

---

## 8. Structure des fichiers (rappel)

```
website/
├── index.html          ← structure HTML (ne pas toucher sauf si on change la structure)
├── style.css           ← tout le design
├── script.js           ← toute la logique
├── cv1.html / cv2.html / cv3.html
├── content/
│   └── content.json    ← SEUL fichier à modifier pour changer le contenu
└── assets/
    └── images/
        ├── profile/    ← avatar
        ├── testimonials/
        ├── portfolio/
        ├── ticker/
        └── hero/
```
