# CLAUDE.md — Site OnePage Gaël Tréfeu

## Contexte du projet
Site web personnel one-page pour la recherche d'emploi 2026.
Remplacement du site Framer existant : https://gael-trefeu.framer.website/

---

## Rôles de Claude sur ce projet

Claude intervient en **trois rôles simultanés** :

### 🗂 Product Owner
- Guider un développeur débutant (Gaël) à chaque étape
- Expliquer les décisions techniques simplement, sans jargon non défini
- Proposer un plan clair avant chaque phase de développement
- **Toujours valider ensemble avant de coder** pour éviter les itérations coûteuses

### 🎨 Designer
- Garantir la cohérence visuelle avec le guide de style (brief.md)
- Concevoir des animations fluides et agréables — expérience de consultation ludique
- Penser l'UX mobile-first à chaque composant
- Challenger les choix esthétiques si nécessaire

### 💻 Développeur
- Écrire du code propre, structuré, commenté
- HTML5 sémantique + CSS3 custom properties + JS vanilla
- Mobile-first, performant, accessible

---

## Méthode de travail

1. **Proposer → Valider → Coder** : jamais de code sans alignement préalable
2. Chaque session commence par rappeler où on en est (TO DO)
3. Les choix importants sont documentés dans ce fichier
4. Optimiser l'usage des tokens : lire uniquement ce qui est nécessaire, ne pas tout charger en bloc

---

## Stack technique retenue
- HTML5 + CSS3 (custom properties) + JavaScript vanilla
- Hébergement : Netlify (`netlify.toml` → `publish = "website"`) — Base directory Netlify = vide
- Aucun framework CSS (Bootstrap, Tailwind) sauf décision explicite et validée

---

## Architecture fichiers

```
ufeelgreat-onepage/
├── netlify.toml             ← publish = "website"
├── CLAUDE.md
├── brief.md
├── docs/
│   └── epic-contenu.md
├── references/              ← captures Framer + assets ref (NON déployé)
└── website/                 ← SEUL dossier déployé sur Netlify
    ├── index.html
    ├── style.css
    ├── script.js
    ├── cv1.html             ← CV cachés (accès direct URL)
    ├── cv2.html
    ├── cv3.html
    ├── assets/
    │   └── images/
    │       ├── profile/     ← avatar-gael-trefeu.png + avatar-grand-gael-trefeu.png
    │       ├── testimonials/
    │       ├── portfolio/   ← 14 thumbnails projets
    │       └── ticker/      ← ticker-01.png à ticker-14.png
    └── content/
        └── content.json     ← tout le texte externalisé ici
```

---

## Règles de développement
- Mobile-first obligatoire
- Pas de librairies JS tierces sauf décision explicite (pas de jQuery, GSAP possible si justifié)
- Animations : CSS transitions + Intersection Observer API (vanilla) par défaut
- Images optimisées avant intégration (WebP préféré)
- Accessibilité : alt sur toutes les images, contraste WCAG AA minimum
- Tout le texte du site passe par `content.json` — jamais hardcodé dans le HTML

---

## Palette de couleurs
```css
--color-coral:   #FF7163   /* accent principal */
--color-lime:    #E7FF63   /* accent secondaire */
--color-olive:   #475346   /* accent tertiaire */
--color-bg:      #0d0d0d
--gradient-contact: linear-gradient(160deg, #FF7163 0%, #FF8C42 55%, #FFB347 100%)
```

---

## Sections du site (ordre actuel)
1. Hero — badge + titre + highlights + photo profil
2. Vision — intro + corps en blocs
3. Ticker — défilement continu 2 lignes (directions opposées)
4. Expertise ("Ma boîte à outils 🛠️") — filtres + cartes
5. Profil ("L'humain derrière le CV") — accordion, fond gradient sur item ouvert
6. Témoignages ("Ils en parlent mieux que moi ✍️")
7. Parcours ("D'où je viens 📍") — timeline
8. Ce que j'aime ("Ce que j'💛 dans ces métiers")
9. Portfolio ("Ce que j'ai fait 🎬") — carousel horizontal, modal overlay
10. Contact ("Vous avez scrollé jusqu'ici 🤩") — fond coral gradient

---

## Portfolio — ordre des projets
1. Film Cancun
2. Snaaake The Game
3. Prototype IA
4. Mango RX (lien YouTube)
5. Émission Twitch (carousel autoplay)
6. FansRevenue (lien sur demande)
7. App Piknic (PEMTL)

---

## TO DO

### Phase 0 — Contenu & Storytelling ✓
- [x] Extraction brute du contenu Framer
- [x] Travail storytelling & valorisation profil
- [x] Valider le contenu final section par section
- [x] Produire content.json finalisé

### Phase 1 — Fondations techniques ✓
- [x] Init Git + repo GitHub + connect Netlify
- [x] index.html — structure HTML sémantique complète
- [x] style.css — design system (custom properties, mobile-first, responsive)
- [x] script.js — fetch content.json, toutes les injections
- [x] Accordion soft skills, filtres expertise, timeline, formulaire contact

### Phase 2 — Mise en forme visuelle ✓
- [x] Palette étendue : coral, lime, olive
- [x] Fix emoji hero (background-clip bug)
- [x] Photo profil dans le Hero (avatar-grand-gael-trefeu.png)
- [x] Ticker animé (2 lignes, directions opposées)
- [x] Portfolio : grille responsive (3/2/1 col) + modal overlay
- [x] Carousel Twitch & Prototype IA : autoplay jusqu'à interaction utilisateur
- [x] Section Contact : fond coral gradient
- [x] Fonds de sections différenciés
- [x] Accordion : fond gradient sur item ouvert
- [x] Titre section "Ce que j'💛 dans ces métiers"
- [x] Titres sections fun
- [x] Pages CV cachées : cv1.html, cv2.html, cv3.html
- [x] Structure website/ comme dossier de publication Netlify
- [x] netlify.toml → publish = "website"

### Phase 3 — Corrections & contenu ✓ (2026-04-11)
- [x] Bullets hero en minuscules
- [x] Accordion "Je livre" : retirer phrase négative
- [x] Accordion "Je suis rigoureux" : réécriture naturelle
- [x] Timeline Aktua Prod : valoriser développement commercial
- [x] Timeline Arcanes : ajouter terrain (tournages, lives, événementiels)
- [x] Loves : emojis sur les bullets
- [x] Portfolio : titre "Talents hybrides 🛠️" pour expertise, "Une sélection de projets 🎬"
- [x] Portfolio : section déplacée après Testimonials (avant Timeline)
- [x] Portfolio : grille remplace le slider horizontal
- [x] Portfolio Prototype IA : retirer image 02 du carousel
- [x] Portfolio Twitch : 2 liens YouTube + déplacé avant MangoRX
- [x] Bouton formulaire : texte "Message envoyé ✓" après envoi
- [x] Mobile : nav pill masquée
- [x] Mobile : touch-action: manipulation (prévenir zoom double-tap)
- [x] Avatar : border-radius 2rem
- [x] Créer website/guide.md (guide maintenance autonome)

### Phase 4 — Corrections & contenu (2026-04-11)
- [x] Hero : fix "n'attendent personne"
- [x] Piknic : orthographe → "Piknic Electronik" + placeholder thumbnail
- [x] MangoRX : réécriture description (retrait "marché adulte", fix dernière phrase)
- [x] FansRevenue : retrait mention Crakmedia du subtitle + ajout "de ce Let's Learn"
- [x] Bullet hero mobile : fix alignement (flex-start sur mobile, center sur desktop)
- [x] Expertise : 3 nouvelles cartes (Production événementielle, Réalisation en direct, Orchestration de LLMs)

### Phase 5 — Version anglaise & corrections (2026-04-12) ✓
- [x] Version anglaise `/en` : site complet + content-en.json + i18n dans script.js
- [x] CVs anglais : cv1.html (Project Coordinator), cv2.html (Production Coordinator), cv3.html (Digital & AI Project Manager)
- [x] Architecture fichiers `website/en/` — réutilise style.css et script.js existants
- [x] Modale portfolio : fermeture au clic en dehors du dialog
- [x] Bullets hero mobile : alignement corrigé (margin-top 0.6rem sur ::before)
- [x] Icône accordion : centrage corrigé (padding-bottom: 2px)
- [x] Avatar hero : path dynamique via content.hero.avatar (fix /en/)

### Architecture i18n
- `script.js` détecte `data-content-src` sur `<html>` → charge le bon JSON
- `website/content/content.json` → FR (chemins relatifs)
- `website/content/content-en.json` → EN (chemins absolus `/assets/...`)
- `website/en/index.html` → `data-content-src="../content/content-en.json"`
- Formulaire EN : `name="contact-en"` (séparé du formulaire FR dans Netlify)

### Phase 6 — À venir
- [ ] Optimisation images (WebP, compression)
- [ ] Image portfolio Piknic Electronik (portfolio-pemtl.png)
- [ ] Activer notifications email formulaires (FR + EN) dans dashboard Netlify
- [ ] Deploy domaine custom
- [ ] Vérification rendu mobile complet (375px + 768px)
