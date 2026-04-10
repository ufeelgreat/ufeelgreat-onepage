# EPIC PROJET — Site OnePage Gaël Tréfeu
> Vision macro du projet, de l'écriture au lancement.

---

## Vue d'ensemble

```
PHASE 0 — Contenu & Storytelling
    ↓
PHASE 1 — Fondations techniques
    ↓
PHASE 2 — Design & Mise en forme
    ↓
PHASE 3 — Interactivité & Animations
    ↓
PHASE 4 — Assets (vidéo, images, projets)
    ↓
PHASE 5 — Finalisation & Launch
```

---

## PHASE 0 — Contenu & Storytelling
> Détail opérationnel → epic-contenu.md

**Objectif** : produire un contenu validé, orienté recruteur, qui valorise le profil avant de toucher au code.

**Livrable** : `content.json` finalisé et validé section par section.

**Dépendances** : rien — c'est le point de départ de tout.

**Questions ouvertes**
- Quelle est la cible principale : production audiovisuelle, coordination/management, ou les deux en parallèle ?
- Le Toggle switch est-il le bon device pour présenter la double compétence, ou est-ce qu'on risque de diluer le message ?

---

## PHASE 1 — Fondations techniques
> Détail opérationnel → CLAUDE.md (Phase 1)

**Objectif** : structure HTML sémantique + design system CSS. Rien de visuel — les rails.

**Livrable** : `index.html` + `style.css` (variables uniquement) + `content.json`.

**Dépendances** : Phase 0 terminée (contenu validé).

---

## PHASE 2 — Design & Mise en forme

**Objectif** : appliquer le guide de style section par section. Le site doit être lisible et cohérent sur desktop et mobile.

**Livrable** : site complet visuellement, sans JS interactif.

**Sections à designer** :
- Hero (gradient signature, typographie, localisation pill)
- Vision (layout texte + accroche)
- Expertise + Toggle (layout des deux vues — sans la logique JS)
- Soft Skills / Outils (grille de compétences)
- Témoignages (cartes, citations)
- Timeline (layout vertical)
- Ce que j'aime (layout)
- Contact (footer gradient)

**Dépendances** : Phase 1 terminée.

---

## PHASE 3 — Interactivité & Animations

**Objectif** : rendre la consultation ludique et fluide.

**Livrable** : `script.js` avec tous les comportements interactifs.

**Composants à développer** :
- Toggle switch Production / Management (fade ou slide entre les deux vues)
- Scroll reveal : Slide-up + Fade-in sur chaque section (Intersection Observer)
- Navigation pill sticky avec scroll-spy (highlight de la section active)
- Éventuellement : hover effects sur les cartes témoignages / projets

**Dépendances** : Phase 2 terminée (le JS s'appuie sur les classes CSS en place).

---

## PHASE 4 — Assets (vidéo, images, projets)

**Objectif** : intégrer tous les médias et construire la section Portfolio.

### Projets à présenter (à définir ensemble)

| Projet | Format envisagé | Questions ouvertes |
|--------|----------------|-------------------|
| Film Cancun — CrakMedia | Vidéo embed (YouTube/Vimeo ?) ou thumbnail + lien | A-t-on accès à une version publiée ? |
| Snaaake-the-game | Iframe intégré ? Lien vers le jeu ? Screenshot animé ? | Où est hébergé le jeu actuellement ? |
| Animations Motion (période Twitch) | Galerie d'images ou vidéo courte | Quels fichiers sont disponibles ? Format ? |

**Questions ouvertes sur le Portfolio**
- Combien de projets max à afficher ? (3 recommandé pour ne pas diluer)
- Est-ce qu'on montre le process ou juste le résultat final ?
- Format des cartes projet : thumbnail + titre + tags + lien ? ou modal avec détail ?

**Autres assets**
- Photo de profil (Hero) : existe ? format ? à optimiser en WebP
- Favicon
- Open Graph image (pour partage LinkedIn/réseaux)

**Dépendances** : Phase 2 terminée. Phase 3 peut avancer en parallèle.

---

## PHASE 5 — Finalisation & Launch

**Objectif** : site prêt à envoyer à des recruteurs.

**Checklist**
- [ ] Relecture complète du contenu (typos, cohérence)
- [ ] Test responsive : mobile (375px), tablette (768px), desktop (1280px+)
- [ ] Performance : images WebP, pas de ressources bloquantes
- [ ] SEO : title, meta description, Open Graph, sitemap
- [ ] Accessibilité : contrastes, alt images, focus keyboard
- [ ] Domaine custom (si souhaité) connecté sur Netlify
- [ ] Test de partage LinkedIn (aperçu Open Graph)
- [ ] Analytics (optionnel : Plausible ou Netlify Analytics — sans cookie)

**Dépendances** : toutes les phases précédentes.

---

## Décisions & Questions ouvertes (global)

| # | Question | Statut |
|---|----------|--------|
| 1 | Cible principale du site (poste visé) | ⏳ À définir en Phase 0 |
| 2 | Le Toggle est-il le bon device narratif ? | ⏳ À valider en Phase 0 |
| 3 | Nombre de projets Portfolio | ⏳ À définir en Phase 4 |
| 4 | Format présentation Snaaake (iframe / lien / screenshot) | ⏳ À définir en Phase 4 |
| 5 | Hébergement vidéos (YouTube, Vimeo, ou fichier direct) | ⏳ À définir en Phase 4 |
| 6 | Domaine custom souhaité ? | ⏳ À décider en Phase 5 |
| 7 | Analytics sur le site ? | ⏳ À décider en Phase 5 |
