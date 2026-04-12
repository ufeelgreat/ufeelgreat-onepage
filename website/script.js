/* ============================================================
   script.js — Gaël Tréfeu OnePage v3
   - Chargement du contenu depuis content.json
   - Hero : avatar + emoji wrapping + mosaïque
   - Filtres expertise (multi-sélection + reflow)
   - Accordion soft skills (un toujours ouvert)
   - Témoignages pleine largeur
   - Portfolio : cartes visuelles + modale + carousel
   - Scroll reveal (Intersection Observer)
   - Navigation pill active state
   ============================================================ */

(async function () {

  /* ----------------------------------------------------------
     1. CHARGEMENT DU CONTENU
  ---------------------------------------------------------- */
  let content;

  try {
    const contentSrc = document.documentElement.dataset.contentSrc || './content/content.json';
    const res = await fetch(contentSrc);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    content = await res.json();
  } catch (err) {
    console.error('[content.json] Erreur de chargement :', err);
    return;
  }


  /* ----------------------------------------------------------
     Helpers
  ---------------------------------------------------------- */

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
  }

  function setHTML(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.innerHTML = value;
  }

  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  /** Met la première phrase d'une citation en <strong>, le reste en régulier */
  function boldFirstSentence(text) {
    const match = text.match(/^(.*?[.!?])(\s+[\s\S]*)?$/);
    if (match && match[2]) {
      return `<strong>${match[1]}</strong>${match[2]}`;
    }
    return `<strong>${text}</strong>`;
  }

  /**
   * Wrap emoji characters in a <span class="hero__emoji"> pour contourner
   * le bug où -webkit-text-fill-color: transparent masque les emojis.
   */
  function wrapEmojis(str) {
    return str.replace(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu,
      '<span class="hero__emoji">$1</span>'
    );
  }


  /* ----------------------------------------------------------
     2. HERO — Titre (emoji fix) + highlights + image avatar
  ---------------------------------------------------------- */

  setText('[data-content="hero.badge"]',       content.hero.badge);
  setText('[data-content="hero.description"]', content.hero.description);

  // Titre : injection HTML pour protéger les emojis du gradient
  const titleEl = document.querySelector('[data-content="hero.title"]');
  if (titleEl && content.hero.title) {
    titleEl.innerHTML = wrapEmojis(content.hero.title);
  }

  // Highlights
  const highlightsList = document.querySelector('[data-content="hero.highlights"]');
  if (highlightsList) {
    highlightsList.innerHTML = content.hero.highlights
      .map(h => `<li>${h}</li>`)
      .join('');
  }

  // Image hero : avatar grand format uniquement
  const heroImages = document.querySelector('[data-content="hero.images"]');
  if (heroImages) {
    heroImages.innerHTML = `<img src="assets/images/profile/avatar-grand-gael-trefeu.png" alt="Gaël Tréfeu" loading="eager" />`;
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
    filtersEl.innerHTML = content.expertise.filters
      .map(f => `<button class="filter-btn" data-filter="${f}">${f}</button>`)
      .join('');

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
     6. TÉMOIGNAGES — Layout pleine largeur
  ---------------------------------------------------------- */
  const testimonialsContainer = document.querySelector('[data-content="testimonials"]');
  if (testimonialsContainer) {
    testimonialsContainer.innerHTML = content.testimonials
      .map(t => {
        const photoEl = t.photo
          ? `<img class="testimonial-card__photo" src="${t.photo}" alt="Photo de ${t.author}" loading="lazy" />`
          : `<div class="testimonial-card__avatar" aria-hidden="true">${initials(t.author)}</div>`;

        return `
          <article class="testimonial-card">
            <div class="testimonial-card__header">
              <span class="testimonial-card__quotemark" aria-hidden="true">"</span>
              <div class="testimonial-card__author-row">
                ${photoEl}
                <div>
                  <p class="testimonial-card__author">${t.author}</p>
                  <p class="testimonial-card__title-label">${t.title}</p>
                </div>
              </div>
            </div>
            <blockquote class="testimonial-card__quote">${boldFirstSentence(t.quote)}</blockquote>
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
     9. PORTFOLIO — Cartes visuelles + Modale
  ---------------------------------------------------------- */
  setText('[data-content="portfolio.intro"]', content.portfolio.intro);

  const portfolioGrid = document.querySelector('[data-content="portfolio.projects"]');
  if (portfolioGrid) {
    portfolioGrid.innerHTML = content.portfolio.projects
      .map(project => {
        const thumbEl = project.thumbnail
          ? `<img class="portfolio-card__thumb" src="${project.thumbnail}" alt="${project.title}" loading="lazy" />`
          : `<div class="portfolio-card__thumb-placeholder">🎞️</div>`;

        return `
          <article
            class="portfolio-card"
            role="button"
            tabindex="0"
            data-project-id="${project.id}"
            aria-label="Voir le projet ${project.title}"
          >
            <div class="portfolio-card__thumb-wrap">
              ${thumbEl}
              <div class="portfolio-card__overlay">
                <h3 class="portfolio-card__title">${project.title}</h3>
              </div>
              <span class="portfolio-card__hint" aria-hidden="true">↗</span>
            </div>
          </article>
        `;
      }).join('');

    initPortfolioModal(portfolioGrid, content.portfolio.projects);
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
        const isExternal = link.icon === 'linkedin' || link.icon === 'instagram';
        return `
          <a class="contact-link" href="${link.url}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>
            <span class="contact-link__icon">${iconEl}</span>
            <span class="contact-link__text">
              <span class="contact-link__label">${link.label}</span>
              <span class="contact-link__handle">${link.handle}</span>
            </span>
          </a>
        `;
      }).join('');
  }

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

  /* --- Filtres Expertise --- */
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
        if (isOpen) return;

        items.forEach(other => {
          other.classList.remove('open');
          other.querySelector('.accordion-item__trigger').setAttribute('aria-expanded', 'false');
        });

        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      });
    });
  }


  /* --- Portfolio — Modale + Carousel --- */
  function initPortfolioModal(gridEl, projects) {
    const modal    = document.getElementById('portfolio-modal');
    const backdrop = document.getElementById('portfolio-modal-backdrop');
    const closeBtn = document.getElementById('modal-close');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !backdrop) return;

    // Map rapide id → projet
    const projectMap = {};
    projects.forEach(p => { projectMap[p.id] = p; });

    let lastFocusedCard = null;

    // Ouvrir la modale
    function openModal(projectId) {
      const project = projectMap[projectId];
      if (!project) return;

      modalBody.innerHTML = buildModalContent(project);
      modal.classList.add('is-open');
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      // Focus sur le bouton fermer
      closeBtn.focus();

      // Initialiser carousel si nécessaire
      const carouselEl = modalBody.querySelector('.modal-carousel');
      if (carouselEl) {
        initCarousel(carouselEl);
      }
    }

    // Fermer la modale
    function closeModal() {
      modal.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      modalBody.innerHTML = '';

      if (lastFocusedCard) {
        lastFocusedCard.focus();
        lastFocusedCard = null;
      }
    }

    // Clic sur une carte
    gridEl.addEventListener('click', e => {
      const card = e.target.closest('.portfolio-card');
      if (!card) return;
      lastFocusedCard = card;
      openModal(card.dataset.projectId);
    });

    // Clavier sur une carte
    gridEl.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.portfolio-card');
      if (!card) return;
      e.preventDefault();
      lastFocusedCard = card;
      openModal(card.dataset.projectId);
    });

    // Fermeture
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }


  /* --- Contenu HTML de la modale --- */
  function buildModalContent(project) {
    // Image principale ou carousel
    let mediaSection = '';

    if (project.display === 'carousel' && project.gallery?.length) {
      const slides = project.gallery
        .map(src => `
          <div class="modal-carousel__slide">
            <img src="${src}" alt="${project.title}" loading="lazy" />
          </div>
        `).join('');

      const dots = project.gallery
        .map((_, i) => `<button class="modal-carousel__dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Image ${i + 1}"></button>`)
        .join('');

      mediaSection = `
        <div class="modal-carousel">
          <div class="modal-carousel__viewport">
            <div class="modal-carousel__track">${slides}</div>
          </div>
          <div class="modal-carousel__controls">
            <button class="modal-carousel__btn modal-carousel__btn--prev" aria-label="Image précédente">←</button>
            <div class="modal-carousel__dots">${dots}</div>
            <button class="modal-carousel__btn modal-carousel__btn--next" aria-label="Image suivante">→</button>
          </div>
        </div>
      `;
    } else if (project.display === 'gallery' && project.gallery?.length) {
      // Même layout carousel pour les galeries
      const slides = project.gallery
        .map(src => `
          <div class="modal-carousel__slide">
            <img src="${src}" alt="${project.title}" loading="lazy" />
          </div>
        `).join('');

      const dots = project.gallery
        .map((_, i) => `<button class="modal-carousel__dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Image ${i + 1}"></button>`)
        .join('');

      mediaSection = `
        <div class="modal-carousel">
          <div class="modal-carousel__viewport">
            <div class="modal-carousel__track">${slides}</div>
          </div>
          <div class="modal-carousel__controls">
            <button class="modal-carousel__btn modal-carousel__btn--prev" aria-label="Image précédente">←</button>
            <div class="modal-carousel__dots">${dots}</div>
            <button class="modal-carousel__btn modal-carousel__btn--next" aria-label="Image suivante">→</button>
          </div>
        </div>
      `;
    } else if (project.thumbnail) {
      mediaSection = `<img class="modal-project__thumb" src="${project.thumbnail}" alt="${project.title}" />`;
    }

    // Tags
    const tags = (project.tags || [])
      .map(t => `<span class="modal-project__tag">${t}</span>`)
      .join('');

    // CTA — supporte links[] (tableau) ou link (string unique)
    let cta = '';
    if (project.links?.length) {
      cta = project.links.map(l =>
        `<a class="modal-project__link" href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label} ↗</a>`
      ).join('');
    } else if (project.display === 'link' && project.link) {
      cta = `<a class="modal-project__link" href="${project.link}" target="_blank" rel="noopener noreferrer">Voir le projet ↗</a>`;
    } else if (project.display === 'coming-soon') {
      cta = `<span class="modal-project__badge">⏳ En cours de développement</span>`;
    } else if (project.linkOnRequest) {
      cta = `<span class="modal-project__on-request">Lien disponible sur demande</span>`;
    }

    return `
      ${mediaSection}
      <h2 class="modal-project__title">${project.title}</h2>
      <p class="modal-project__subtitle">${project.subtitle || ''}</p>
      <p class="modal-project__description">${project.description || ''}</p>
      <div class="modal-project__tags">${tags}</div>
      ${cta ? `<div class="modal-project__cta">${cta}</div>` : ''}
    `;
  }


  /* --- Carousel --- */
  function initCarousel(carouselEl) {
    const track  = carouselEl.querySelector('.modal-carousel__track');
    const slides = carouselEl.querySelectorAll('.modal-carousel__slide');
    const dots   = carouselEl.querySelectorAll('.modal-carousel__dot');
    const prevBtn = carouselEl.querySelector('.modal-carousel__btn--prev');
    const nextBtn = carouselEl.querySelector('.modal-carousel__btn--next');

    if (!track || slides.length === 0) return;

    let current = 0;
    const total = slides.length;
    let autoplayTimer = null;
    let userHasInteracted = false;

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function stopAutoplay() {
      userHasInteracted = true;
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    prevBtn?.addEventListener('click', () => { stopAutoplay(); goTo(current - 1); });
    nextBtn?.addEventListener('click', () => { stopAutoplay(); goTo(current + 1); });

    dots.forEach(dot => {
      dot.addEventListener('click', () => { stopAutoplay(); goTo(Number(dot.dataset.index)); });
    });

    // Swipe tactile
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { stopAutoplay(); goTo(diff > 0 ? current + 1 : current - 1); }
    });

    // Autoplay — démarre automatiquement, s'arrête dès interaction utilisateur
    autoplayTimer = setInterval(() => {
      if (!userHasInteracted) goTo(current + 1);
    }, 3500);
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

      if (!form.dataset.netlify) return;

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
        submitBtn.textContent = 'Message envoyé ✓';
        submitBtn.disabled    = true;
      } catch {
        success.textContent   = 'Une erreur est survenue. Réessayez ou écrivez à gael.trefeu@gmail.com';
        submitBtn.textContent  = 'Envoyer le message →';
        submitBtn.disabled     = false;
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
