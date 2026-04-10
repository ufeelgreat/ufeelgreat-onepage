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

### Phase 0 — Contenu & Storytelling ✓
- [x] Extraction brute du contenu Framer (via Gemini)
- [x] Travail storytelling & valorisation profil → docs/epic-contenu.md
- [x] Valider le contenu final section par section
- [x] Produire content.json finalisé → content/content.json

### Phase 1 — Fondations techniques ✓
- [x] Décision stack : HTML/CSS/JS + Netlify
- [x] Init Git + repo GitHub + connect Netlify
- [x] Structuration brief.md + CLAUDE.md + epic-contenu.md
- [x] index.html — structure HTML sémantique complète (9 sections)
- [x] style.css — design system (custom properties, mobile-first, responsive 768/1024px)
- [x] script.js — fetch content.json, toutes les injections
- [x] Mosaïque hero 4 photos Instagram (grille 2×2)
- [x] Filtres expertise : reflow réel (hide/show) + cartes orange + emojis titres
- [x] Accordion soft skills (un bloc toujours ouvert, texte enrichi)
- [x] Témoignages avec portraits + guillemets fermants
- [x] Portfolio cards click-to-reveal
- [x] Formulaire contact Netlify Forms (→ activer notif email dans dashboard Netlify)
- [x] Liens contact 2×2 avec icônes SVG LinkedIn/Instagram + emojis 📞 ✉️
- [x] Mots-clés surlignés via <mark> orange (vision, timeline)
- [x] Restructuration dossiers : assets/images/{hero,testimonials,portfolio,profile} + docs/

### Phase 2 — Mise en forme ← PROCHAINE ÉTAPE
- [ ] Revoir layout Hero (proportions texte / mosaïque, espacements)
- [ ] Affiner chaque section visuellement (desktop + mobile)
- [ ] Photo de profil de Gaël dans le Hero ou la section Vision
- [ ] Vérifier rendu réel via Live Server sur toutes les sections

### Phase 3 — Interactivité avancée
- [ ] Scroll reveal — affiner timing et décalages entre éléments
- [ ] Navigation pill — vérifier active state sur toutes les sections
- [ ] Portfolio — modales ou galeries pour projets multi-images (Twitch, Crakmedia IA)

### Phase 4 — Portfolio + finalisation
- [ ] Optimisation images (WebP, compression)
- [ ] Activer notifications email formulaire dans dashboard Netlify
- [ ] Deploy domaine custom
