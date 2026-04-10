/* ============================================================
   script.js — Gaël Tréfeu OnePage
   - Chargement du contenu depuis content.json
   - Injection HTML par section
   - Filtres expertise (multi-sélection)
   - Scroll reveal (Intersection Observer)
   - Navigation pill active state
   ============================================================ */

(async function () {

  /* ----------------------------------------------------------
     1. CHARGEMENT DU CONTENU
  ---------------------------------------------------------- */
  let content;

  try {
    const res = await fetch('./content/content.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    content = await res.json();
  } catch (err) {
    console.error('[content.json] Erreur de chargement :', err);
    return;
  }


  /* ----------------------------------------------------------
     2. INJECTION — Hero
  ---------------------------------------------------------- */
  setText('[data-content="hero.badge"]',       content.hero.badge);
  setText('[data-content="hero.title"]',       content.hero.title);
  setText('[data-content="hero.description"]', content.hero.description);

  const highlightsList = document.querySelector('[data-content="hero.highlights"]');
  if (highlightsList) {
    highlightsList.innerHTML = content.hero.highlights
      .map(h => `<li>${h}</li>`)
      .join('');
  }


  /* ----------------------------------------------------------
     3. INJECTION — Vision
  ---------------------------------------------------------- */
  setText('[data-content="vision.intro"]', content.vision.intro);

  const visionBody = document.querySelector('[data-content="vision.body"]');
  if (visionBody) {
    visionBody.innerHTML = content.vision.body
      .map(p => `<p>${p}</p>`)
      .join('');
  }


  /* ----------------------------------------------------------
     4. INJECTION — Expertise (filtres + cartes)
  ---------------------------------------------------------- */
  setText('[data-content="expertise.intro"]', content.expertise.intro);

  const filtersEl  = document.querySelector('[data-content="expertise.filters"]');
  const gridEl     = document.querySelector('[data-content="expertise.cards"]');

  if (filtersEl && gridEl) {
    // --- Boutons filtres ---
    filtersEl.innerHTML = content.expertise.filters
      .map(f => `<button class="filter-btn" data-filter="${f}">${f}</button>`)
      .join('');

    // --- Cartes ---
    gridEl.innerHTML = content.expertise.cards
      .map(card => `
        <article class="expertise-card" data-categories='${JSON.stringify(card.categories)}'>
          <h3 class="expertise-card__title">${card.title}</h3>
          <p class="expertise-card__body">${card.body}</p>
        </article>
      `).join('');

    // --- Logique filtres (multi-sélection) ---
    initFilters(filtersEl, gridEl);
  }


  /* ----------------------------------------------------------
     5. INJECTION — Soft Skills
  ---------------------------------------------------------- */
  setText('[data-content="softSkills.intro"]', content.softSkills.intro);

  const softSkillsList = document.querySelector('[data-content="softSkills.items"]');
  if (softSkillsList) {
    softSkillsList.innerHTML = content.softSkills.items
      .map(item => `
        <li class="softskill-item">
          <p class="softskill-item__label">${item.label}</p>
          <p class="softskill-item__detail">${item.detail}</p>
        </li>
      `).join('');
  }


  /* ----------------------------------------------------------
     6. INJECTION — Témoignages
  ---------------------------------------------------------- */
  const testimonialsGrid = document.querySelector('[data-content="testimonials"]');
  if (testimonialsGrid) {
    testimonialsGrid.innerHTML = content.testimonials
      .map(t => `
        <article class="testimonial-card">
          <p class="testimonial-card__quote">${t.quote}</p>
          <p class="testimonial-card__author">${t.author}</p>
          <p class="testimonial-card__title">${t.title}</p>
        </article>
      `).join('');
  }


  /* ----------------------------------------------------------
     7. INJECTION — Timeline
  ---------------------------------------------------------- */
  const timelineList = document.querySelector('[data-content="timeline"]');
  if (timelineList) {
    timelineList.innerHTML = content.timeline
      .map(item => {
        const parallel = item.parallel ? `
          <div class="timeline-item__parallel">
            <p class="timeline-item__parallel-period">${item.parallel.period}</p>
            <p class="timeline-item__parallel-title">${item.parallel.title}</p>
            <p class="timeline-item__parallel-company">${item.parallel.company}</p>
            <p class="timeline-item__parallel-detail">${item.parallel.detail}</p>
          </div>
        ` : '';

        return `
          <li class="timeline-item">
            <p class="timeline-item__period">${item.period}</p>
            <h3 class="timeline-item__title">${item.title}</h3>
            <p class="timeline-item__company">${item.company}</p>
            <p class="timeline-item__impact">${item.impact}</p>
            ${parallel}
          </li>
        `;
      }).join('');
  }


  /* ----------------------------------------------------------
     8. INJECTION — Ce que j'aime
  ---------------------------------------------------------- */
  setText('[data-content="loves.intro"]', content.loves.intro);

  const lovesList = document.querySelector('[data-content="loves.items"]');
  if (lovesList) {
    lovesList.innerHTML = content.loves.items
      .map(item => `<li>${item}</li>`)
      .join('');
  }


  /* ----------------------------------------------------------
     9. INJECTION — Portfolio
  ---------------------------------------------------------- */
  setText('[data-content="portfolio.intro"]', content.portfolio.intro);

  const portfolioGrid = document.querySelector('[data-content="portfolio.projects"]');
  if (portfolioGrid) {
    portfolioGrid.innerHTML = content.portfolio.projects
      .map(project => {
        // Thumbnail ou placeholder
        const thumbnail = project.thumbnail
          ? `<img class="portfolio-card__thumbnail" src="${project.thumbnail}" alt="${project.title}" />`
          : `<div class="portfolio-card__placeholder">À venir</div>`;

        // CTA selon display type
        let cta = '';
        if (project.display === 'link' && project.link) {
          cta = `<a class="portfolio-card__link" href="${project.link}" target="_blank" rel="noopener noreferrer">Voir ↗</a>`;
        } else if (project.display === 'coming-soon') {
          cta = `<span class="portfolio-card__badge">En cours</span>`;
        } else if (project.linkOnRequest) {
          cta = `<span class="portfolio-card__on-request">Disponible sur demande</span>`;
        }

        // Tags
        const tags = project.tags
          .map(t => `<span class="portfolio-card__tag">${t}</span>`)
          .join('');

        return `
          <article class="portfolio-card">
            ${thumbnail}
            <p class="portfolio-card__subtitle">${project.subtitle}</p>
            <h3 class="portfolio-card__title">${project.title}</h3>
            <p class="portfolio-card__description">${project.description}</p>
            <div class="portfolio-card__tags">${tags}</div>
            ${cta}
          </article>
        `;
      }).join('');
  }


  /* ----------------------------------------------------------
     10. INJECTION — Contact
  ---------------------------------------------------------- */
  setText('[data-content="contact.intro"]',        content.contact.intro);
  setText('[data-content="contact.cta"]',          content.contact.cta);
  setText('[data-content="contact.availability"]', content.contact.availability);

  const contactLinks = document.querySelector('[data-content="contact.links"]');
  if (contactLinks) {
    contactLinks.innerHTML = content.contact.links
      .map(link => `
        <li>
          <a class="contact-link" href="${link.url}">
            <span class="contact-link__label">${link.label}</span>
            <span class="contact-link__handle">${link.handle}</span>
          </a>
        </li>
      `).join('');
  }


  /* ----------------------------------------------------------
     11. SCROLL REVEAL (Intersection Observer)
  ---------------------------------------------------------- */
  initScrollReveal();


  /* ----------------------------------------------------------
     12. NAVIGATION PILL — Active state au scroll
  ---------------------------------------------------------- */
  initNavPill();


  /* ==========================================================
     FONCTIONS UTILITAIRES
  ========================================================== */

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
  }


  /* ----------------------------------------------------------
     Filtres Expertise (multi-sélection)
  ---------------------------------------------------------- */
  function initFilters(filtersEl, gridEl) {
    const buttons = filtersEl.querySelectorAll('.filter-btn');
    const cards   = gridEl.querySelectorAll('.expertise-card');
    let active    = new Set(); // filtres actifs

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        if (active.has(filter)) {
          active.delete(filter);
          btn.classList.remove('active');
        } else {
          active.add(filter);
          btn.classList.add('active');
        }

        applyFilters();
      });
    });

    function applyFilters() {
      cards.forEach(card => {
        const categories = JSON.parse(card.dataset.categories || '[]');

        if (active.size === 0) {
          // Aucun filtre actif → tout visible
          card.classList.remove('dimmed');
        } else {
          // La carte match si elle appartient à au moins un filtre actif
          const matches = categories.some(c => active.has(c));
          card.classList.toggle('dimmed', !matches);
        }
      });
    }
  }


  /* ----------------------------------------------------------
     Scroll Reveal
  ---------------------------------------------------------- */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // une seule fois
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(el => observer.observe(el));
  }


  /* ----------------------------------------------------------
     Navigation Pill — Active state
  ---------------------------------------------------------- */
  function initNavPill() {
    const navLinks = document.querySelectorAll('#nav-pill a');
    const sections = document.querySelectorAll('section[id]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
  }

})();
