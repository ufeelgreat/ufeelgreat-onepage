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
- Hébergement : Netlify
- Aucun framework CSS (Bootstrap, Tailwind) sauf décision explicite et validée

---

## Architecture fichiers cible
```
ufeelgreat-onepage/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── images/
│   └── fonts/
├── content/
│   └── content.json       ← tout le texte externalisé ici
├── brief.md               ← guide de style + contenu validé
└── CLAUDE.md
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

## Sections du site (ordre)
1. Hero
2. Vision
3. Expertise & Méthodologie (avec Toggle switch Production / Management)
4. Soft Skills & Maîtrise technique
5. Témoignages
6. Timeline expériences
7. Ce que j'aime dans ces métiers
8. Contact & Réseaux
9. *(À venir)* Portfolio / Projets

---

## TO DO

### Phase 0 — Contenu & Storytelling (PRIORITAIRE avant tout dev)
- [x] Extraction brute du contenu Framer (via Gemini) ✓
- [ ] **Travail storytelling & valorisation profil** → voir epic-contenu.md
- [ ] Valider le contenu final section par section
- [ ] Produire content.json finalisé

### Phase 1 — Fondations techniques
- [x] Décision stack : HTML/CSS/JS + Netlify ✓
- [x] Init Git + repo GitHub + connect Netlify ✓
- [x] Structuration brief.md + CLAUDE.md + epic-contenu.md ✓
- [ ] Créer index.html — structure HTML de base (toutes sections)
- [ ] Créer style.css — design system (variables, typographie, reset)

### Phase 2 — Mise en forme
- [ ] Layout de chaque section (desktop + mobile)
- [ ] Hero gradient, cartes, témoignages, timeline

### Phase 3 — Interactivité
- [ ] Toggle Switch (Vue Production / Vue Management)
- [ ] Scroll reveal animations (Intersection Observer)
- [ ] Navigation pill sticky

### Phase 4 — Portfolio + finalisation
- [ ] Section Portfolio/Projets (film Cancun, Snaaake, Motion Twitch)
- [ ] Optimisation images (WebP, compression)
- [ ] Deploy domaine custom
