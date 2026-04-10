/* ============================================================
   script.js — Gaël Tréfeu OnePage
   - Chargement du contenu depuis content.json
   - Injection HTML par section (innerHTML pour les <mark>)
   - Mosaïque hero images
   - Filtres expertise (multi-sélection + reflow réel + orange)
   - Accordion soft skills (un toujours ouvert)
   - Portfolio cards reveal au clic
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
     Helpers
  ---------------------------------------------------------- */

  /** Injecte du texte brut (textContent) */
  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
  }

  /** Injecte du HTML (supporte les <mark>) */
  function setHTML(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.innerHTML = value;
  }

  /** Initiales pour avatar fallback */
  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }


  /* ----------------------------------------------------------
     2. HERO
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

  // Mosaïque photos Instagram
  const heroImages = document.querySelector('[data-content="hero.images"]');
  if (heroImages && content.hero.images?.length) {
    heroImages.innerHTML = content.hero.images
      .map((src, i) => `<img src="${src}" alt="Photo Instagram de Gaël Tréfeu ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" />`)
      .join('');
  }


  /* ----------------------------------------------------------
     3. VISION (innerHTML pour les <mark>)
  ---------------------------------------------------------- */
  setHTML('[data-html="vision.intro"]', content.vision.intro);

  const visionBody = document.querySelector('[data-html-list="vision.body"]');
  if (visionBody) {
    visionBody.innerHTML = content.vision.body
      .map(p => `<p>${p}</p>`)
      .join('');
  }


  /* ----------------------------------------------------------
     4. EXPERTISE — Filtres + Cartes
  ---------------------------------------------------------- */
  setText('[data-content="expertise.intro"]', content.expertise.intro);

  const filtersEl = document.querySelector('[data-content="expertise.filters"]');
  const gridEl    = document.querySelector('[data-content="expertise.cards"]');

  if (filtersEl && gridEl) {
    // Boutons filtres
    filtersEl.innerHTML = content.expertise.filters
      .map(f => `<button class="filter-btn" data-filter="${f}">${f}</button>`)
      .join('');

    // Cartes
    gridEl.innerHTML = content.expertise.cards
      .map(card => `
        <article class="expertise-card" data-categories='${JSON.stringify(card.categories)}'>
          <h3 class="expertise-card__title">${card.title}</h3>
          <p class="expertise-card__body">${card.body}</p>
        </article>
      `).join('');

    initFilters(filtersEl, gridEl);
  }


  /* ----------------------------------------------------------
     5. SOFT SKILLS — Accordion
  ---------------------------------------------------------- */
  setText('[data-content="softSkills.intro"]', content.softSkills.intro);

  const accordionEl = document.querySelector('[data-content="softSkills.items"]');
  if (accordionEl) {
    accordionEl.innerHTML = content.softSkills.items
      .map((item, i) => `
        <div class="accordion-item${i === 0 ? ' open' : ''}" role="listitem">
          <button class="accordion-item__trigger" aria-expanded="${i === 0}" aria-controls="acc-body-${i}">
            <div>
              <p class="accordion-item__label">${item.label}</p>
              <p class="accordion-item__detail-preview">${item.detail}</p>
            </div>
            <span class="accordion-item__icon" aria-hidden="true">+</span>
          </button>
          <div class="accordion-item__body" id="acc-body-${i}" role="region">
            <div class="accordion-item__body-inner">${item.extra}</div>
          </div>
        </div>
      `).join('');

    initAccordion(accordionEl);
  }


  /* ----------------------------------------------------------
     6. TÉMOIGNAGES
  ---------------------------------------------------------- */
  const testimonialsGrid = document.querySelector('[data-content="testimonials"]');
  if (testimonialsGrid) {
    testimonialsGrid.innerHTML = content.testimonials
      .map(t => {
        const photoEl = t.photo
          ? `<img class="testimonial-card__photo" src="${t.photo}" alt="Photo de ${t.author}" loading="lazy" />`
          : `<div class="testimonial-card__avatar" aria-hidden="true">${initials(t.author)}</div>`;

        return `
          <article class="testimonial-card">
            <p class="testimonial-card__quote">${t.quote}</p>
            <div class="testimonial-card__author-row">
              ${photoEl}
              <div>
                <p class="testimonial-card__author">${t.author}</p>
                <p class="testimonial-card__title-label">${t.title}</p>
              </div>
            </div>
          </article>
        `;
      }).join('');
  }


  /* ----------------------------------------------------------
     7. TIMELINE (innerHTML pour les <mark>)
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
     8. CE QUE J'AIME
  ---------------------------------------------------------- */
  setText('[data-content="loves.intro"]', content.loves.intro);

  const lovesList = document.querySelector('[data-content="loves.items"]');
  if (lovesList) {
    lovesList.innerHTML = content.loves.items
      .map(item => `<li>${item}</li>`)
      .join('');
  }


  /* ----------------------------------------------------------
     9. PORTFOLIO — Cards avec reveal au clic
  ---------------------------------------------------------- */
  setText('[data-content="portfolio.intro"]', content.portfolio.intro);

  const portfolioGrid = document.querySelector('[data-content="portfolio.projects"]');
  if (portfolioGrid) {
    portfolioGrid.innerHTML = content.portfolio.projects
      .map(project => {
        // Thumbnail (compact dans la preview)
        const thumbEl = project.thumbnail
          ? `<img class="portfolio-card__thumbnail" src="${project.thumbnail}" alt="${project.title}" loading="lazy" />`
          : `<div class="portfolio-card__placeholder-thumb">🎞️</div>`;

        // CTA dans le panneau révélé
        let cta = '';
        if (project.display === 'link' && project.link) {
          cta = `<a class="portfolio-card__link" href="${project.link}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Voir ↗</a>`;
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
          <article class="portfolio-card" role="button" tabindex="0" aria-expanded="false">
            <!-- Toujours visible : thumbnail + titre + chevron -->
            <div class="portfolio-card__preview">
              ${thumbEl}
              <div class="portfolio-card__preview-text">
                <h3 class="portfolio-card__title">${project.title}</h3>
              </div>
              <span class="portfolio-card__chevron" aria-hidden="true">⌄</span>
            </div>
            <!-- Révélé au clic -->
            <div class="portfolio-card__details">
              <div class="portfolio-card__details-inner">
                <p class="portfolio-card__subtitle">${project.subtitle}</p>
                <p class="portfolio-card__description">${project.description}</p>
                <div class="portfolio-card__tags">${tags}</div>
                <div class="portfolio-card__cta">${cta}</div>
              </div>
            </div>
          </article>
        `;
      }).join('');

    initPortfolioCards(portfolioGrid);
  }


  /* ----------------------------------------------------------
     10. CONTACT
  ---------------------------------------------------------- */
  setText('[data-content="contact.intro"]',        content.contact.intro);
  setText('[data-content="contact.cta"]',          content.contact.cta);
  setText('[data-content="contact.availability"]', content.contact.availability);

  const linksWrapper = document.querySelector('[data-content="contact.links"]');
  if (linksWrapper) {
    linksWrapper.innerHTML = content.contact.links
      .map(link => {
        const iconEl = getContactIcon(link.icon);
        return `
          <a class="contact-link" href="${link.url}"${link.icon === 'linkedin' || link.icon === 'instagram' ? ' target="_blank" rel="noopener noreferrer"' : ''}>
            <span class="contact-link__icon">${iconEl}</span>
            <span class="contact-link__text">
              <span class="contact-link__label">${link.label}</span>
              <span class="contact-link__handle">${link.handle}</span>
            </span>
          </a>
        `;
      }).join('');
  }

  // Formulaire — gestion envoi (en complément de Netlify Forms natif)
  initContactForm();


  /* ----------------------------------------------------------
     11. SCROLL REVEAL
  ---------------------------------------------------------- */
  initScrollReveal();


  /* ----------------------------------------------------------
     12. NAVIGATION PILL — Active state
  ---------------------------------------------------------- */
  initNavPill();


  /* ==========================================================
     FONCTIONS
  ========================================================== */

  /* --- Filtres Expertise (multi-sélection + reflow + orange) --- */
  function initFilters(filtersEl, gridEl) {
    const buttons = filtersEl.querySelectorAll('.filter-btn');
    const cards   = gridEl.querySelectorAll('.expertise-card');
    const active  = new Set();

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
          // Aucun filtre → tout visible, sans mise en avant
          card.classList.remove('hidden');
          card.classList.remove('highlighted');
        } else {
          const matches = categories.some(c => active.has(c));
          card.classList.toggle('hidden',      !matches);
          card.classList.toggle('highlighted',  matches);
        }
      });
    }
  }


  /* --- Accordion (un toujours ouvert) --- */
  function initAccordion(container) {
    const items = container.querySelectorAll('.accordion-item');

    items.forEach(item => {
      const trigger = item.querySelector('.accordion-item__trigger');

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Si déjà ouvert : ne rien faire (toujours un bloc ouvert)
        if (isOpen) return;

        // Fermer tous les autres
        items.forEach(other => {
          other.classList.remove('open');
          other.querySelector('.accordion-item__trigger').setAttribute('aria-expanded', 'false');
        });

        // Ouvrir celui-ci
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      });
    });
  }


  /* --- Portfolio cards reveal au clic --- */
  function initPortfolioCards(container) {
    const cards = container.querySelectorAll('.portfolio-card');

    cards.forEach(card => {
      const toggle = () => {
        const isOpen = card.classList.contains('open');
        card.classList.toggle('open', !isOpen);
        card.setAttribute('aria-expanded', String(!isOpen));
      };

      card.addEventListener('click', toggle);

      // Accessibilité clavier
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }


  /* --- Icônes de contact (SVG inline ou emoji) --- */
  function getContactIcon(type) {
    switch (type) {
      case 'linkedin':
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;

      case 'instagram':
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;

      case 'phone':
        return `📞`;

      case 'email':
        return `✉️`;

      default:
        return '';
    }
  }


  /* --- Formulaire de contact --- */
  function initContactForm() {
    const form    = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      const submitBtn = form.querySelector('.contact-form__submit');

      // Netlify Forms gère la soumission nativement.
      // Ce handler optionnel affiche un message de confirmation en AJAX.
      if (!form.dataset.netlify) return; // laisser le comportement par défaut si pas sur Netlify

      e.preventDefault();

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Envoi en cours…';

      try {
        const formData = new FormData(form);
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString(),
        });

        form.reset();
        success.textContent  = '✓ Message envoyé — je vous réponds rapidement.';
        submitBtn.textContent = 'Envoyer le message →';
        submitBtn.disabled    = false;
      } catch {
        success.textContent  = 'Une erreur est survenue. Réessayez ou écrivez directement à gael.trefeu@gmail.com';
        submitBtn.textContent = 'Envoyer le message →';
        submitBtn.disabled    = false;
      }
    });
  }


  /* --- Scroll Reveal --- */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  }


  /* --- Navigation Pill — Active state --- */
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
    }, { rootMargin: '-35% 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));
  }

})();
