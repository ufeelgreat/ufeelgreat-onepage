/* ============================================================
   script.js — Gaël Tréfeu OnePage v4
   - i18n client-side : FR / EN sans rechargement de page
   - Chargement parallèle des deux JSONs au démarrage
   - Langue détectée : ?lang=en > localStorage > FR par défaut
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
     1. CHARGEMENT PARALLÈLE DES DEUX CONTENUS
  ---------------------------------------------------------- */
  let contentFR, contentEN;

  try {
    [contentFR, contentEN] = await Promise.all([
      fetch('./content/content.json').then(r => { if (!r.ok) throw r; return r.json(); }),
      fetch('./content/content-en.json').then(r => { if (!r.ok) throw r; return r.json(); }),
    ]);
  } catch (err) {
    console.error('[content] Erreur de chargement :', err);
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

  function boldFirstSentence(text) {
    const match = text.match(/^(.*?[.!?])(\s+[\s\S]*)?$/);
    if (match && match[2]) return `<strong>${match[1]}</strong>${match[2]}`;
    return `<strong>${text}</strong>`;
  }

  function wrapEmojis(str) {
    return str.replace(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu,
      '<span class="hero__emoji">$1</span>'
    );
  }

  // Karaoké — découpe la citation en blocs <span> alignés sur les timestamps
  // Fallback sur boldFirstSentence si aucun bloc n'est défini
  function wrapQuoteBlocks(quote, blocks) {
    if (!blocks || !blocks.length) return boldFirstSentence(quote);
    const firstDotIdx = quote.search(/[.!?]/);
    let result = '';
    let pos = 0;
    for (let i = 0; i < blocks.length; i++) {
      const idx = quote.indexOf(blocks[i].text, pos);
      if (idx === -1) continue;
      if (idx > pos) result += quote.substring(pos, idx);
      const isBold = firstDotIdx >= 0 && idx <= firstDotIdx;
      result += `<span class="kb${isBold ? ' kb--bold' : ''}" data-idx="${i}">${blocks[i].text}</span>`;
      pos = idx + blocks[i].text.length;
    }
    if (pos < quote.length) result += quote.substring(pos);
    return result;
  }


  /* ----------------------------------------------------------
     2. DÉTECTION DE LA LANGUE INITIALE
  ---------------------------------------------------------- */
  const urlLang   = new URLSearchParams(location.search).get('lang');
  const savedLang = localStorage.getItem('lang');
  let currentLang = (urlLang === 'en' || (!urlLang && savedLang === 'en')) ? 'en' : 'fr';

  // Contrôleur audio global — déclaré ici pour être accessible avant applyContent()
  // Un seul élément <audio> persistant pour compatibilité mobile (iOS bloque new Audio() dynamiques)
  const sharedPlayer = document.createElement('audio');
  sharedPlayer.preload = 'auto';
  sharedPlayer.style.display = 'none';
  document.body.appendChild(sharedPlayer);
  const audioCtrl = { player: null, btn: null, quoteEl: null, karaokeBlocks: null, timeupdateHandler: null };


  /* ----------------------------------------------------------
     3. RENDU INITIAL
  ---------------------------------------------------------- */
  applyContent(currentLang === 'en' ? contentEN : contentFR, currentLang);
  document.documentElement.lang = currentLang;

  // Scroll vers l'ancre initiale après injection du contenu (les sections sont vides avant ce point)
  if (location.hash) {
    setTimeout(() => {
      const target = document.querySelector(location.hash);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }


  /* ----------------------------------------------------------
     4. INITIALISATIONS UNIQUES (DOM statique — sections fixes)
  ---------------------------------------------------------- */
  initScrollReveal();
  initNavPill();
  initContactForms();


  /* ----------------------------------------------------------
     5. SÉLECTEUR DE LANGUE
  ---------------------------------------------------------- */
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === currentLang) return;
      currentLang = lang;
      localStorage.setItem('lang', lang);

      // Mettre à jour l'URL sans rechargement
      const url = new URL(location.href);
      if (lang === 'en') url.searchParams.set('lang', 'en');
      else url.searchParams.delete('lang');
      history.replaceState(null, '', url.toString());

      // Mettre à jour html[lang]
      document.documentElement.lang = lang;

      // Réinjecter tout le contenu
      applyContent(lang === 'en' ? contentEN : contentFR, lang);
    });
  });


  /* ==========================================================
     APPLYCONTENT — Réinjection complète sans rechargement
  ========================================================== */

  function applyContent(content, lang) {
    stopTestimonialAudio();
    renderHero(content, lang);
    renderVision(content);
    renderExpertise(content);
    renderSoftSkills(content);
    renderTestimonials(content);
    renderTimeline(content);
    renderLoves(content);
    renderPortfolio(content, lang);
    renderContactText(content, lang);
    renderStaticText(content);
    renderCvModal(content);
    updateLangPills(lang);
    showForm(lang);
  }


  /* ----------------------------------------------------------
     HERO
  ---------------------------------------------------------- */
  function renderHero(content, lang) {
    setText('[data-content="hero.badge"]', content.hero.badge);
    setText('[data-content="hero.description"]', content.hero.description);
    setText('[data-content="hero.openToWork"]', content.hero.openToWork);

    const titleEl = document.querySelector('[data-content="hero.title"]');
    if (titleEl && content.hero.title) {
      titleEl.innerHTML = wrapEmojis(content.hero.title);
    }

    const highlightsList = document.querySelector('[data-content="hero.highlights"]');
    if (highlightsList) {
      highlightsList.innerHTML = content.hero.highlights.map(h => `<li>${h}</li>`).join('');
    }

    const heroImages = document.querySelector('[data-content="hero.images"]');
    if (heroImages && content.hero.avatar) {
      const isTouch = navigator.maxTouchPoints > 0;
      const hintText = lang === 'en'
        ? (isTouch ? 'double tap' : 'double click')
        : (isTouch ? 'taper deux fois' : 'double clic');
      heroImages.innerHTML = `
        <img src="${content.hero.avatar}" alt="Gaël Tréfeu" loading="eager" />
        <span class="hero__heart-hint">${hintText}</span>
      `;
    }
  }


  /* ----------------------------------------------------------
     VISION
  ---------------------------------------------------------- */
  function renderVision(content) {
    setHTML('[data-html="vision.intro"]', content.vision.intro);
    const visionBody = document.querySelector('[data-html-list="vision.body"]');
    if (visionBody) {
      visionBody.innerHTML = content.vision.body.map(p => `<p>${p}</p>`).join('');
    }
  }


  /* ----------------------------------------------------------
     EXPERTISE
  ---------------------------------------------------------- */
  function renderExpertise(content) {
    setText('[data-content="expertise.intro"]', content.expertise.intro);

    const filtersEl = document.querySelector('[data-content="expertise.filters"]');
    const gridEl    = document.querySelector('[data-content="expertise.cards"]');

    if (filtersEl && gridEl) {
      /* Plus de boutons filtre — on cache le conteneur */
      filtersEl.style.display = 'none';

      /* Construire les 4 piles */
      const filters = content.expertise.filters;
      const cards   = content.expertise.cards;

      /* Assigner chaque carte à sa 1ère catégorie uniquement */
      const piles = {};
      filters.forEach(f => { piles[f] = []; });
      cards.forEach(card => {
        const primary = card.categories[0];
        if (piles[primary]) piles[primary].push(card);
      });

      gridEl.className = 'expertise__piles';
      gridEl.innerHTML = filters.map(filter => {
        const pileCards = piles[filter];
        const total = pileCards.length;
        const stackHTML = pileCards.map((card, i) => {
          const rot = (Math.random() * 10 - 5).toFixed(1);
          const zIndex = total - i;
          const isTop = i === 0;
          return `<article class="expertise-pile__card${isTop ? ' expertise-pile__card--top' : ''}"
                    style="z-index:${zIndex}; --pile-rot:${rot}deg"
                    data-pile-index="${i}" data-pile-num="${i + 1}" data-pile-total="${total}">
              <h3 class="expertise-pile__card__title">${card.title}</h3>
              <p class="expertise-pile__card__body">${card.body}</p>
              <span class="expertise-pile__card__num">${i + 1}/${total}</span>
            </article>`;
        }).join('');

        return `<div class="expertise-pile">
          <div class="expertise-pile__stack" aria-label="${filter} — swipe pour parcourir">${stackHTML}</div>
          <span class="expertise-pile__label">${filter}</span>
        </div>`;
      }).join('');

      /* Hauteur unique pour toutes les piles : la carte la plus haute toutes piles confondues */
      const allStacks = gridEl.querySelectorAll('.expertise-pile__stack');
      let globalMaxH = 0;
      allStacks.forEach(stack => {
        stack.querySelectorAll('.expertise-pile__card').forEach(card => {
          card.style.position = 'static';
          card.style.transform = 'none';
          const h = card.offsetHeight;
          if (h > globalMaxH) globalMaxH = h;
          card.style.position = '';
          card.style.transform = '';
        });
      });
      allStacks.forEach(stack => { stack.style.height = globalMaxH + 'px'; });

      initPileSwipe(gridEl);
    }
  }


  /* ----------------------------------------------------------
     SOFT SKILLS
  ---------------------------------------------------------- */
  function renderSoftSkills(content) {
    setText('[data-content="softSkills.intro"]', content.softSkills.intro);

    const accordionEl = document.querySelector('[data-content="softSkills.items"]');
    if (accordionEl) {
      accordionEl.innerHTML = content.softSkills.items
        .map((item, i) => `
          <div class="accordion-item${i === 0 ? ' open' : ''}" role="listitem">
            <button class="accordion-item__trigger" aria-expanded="${i === 0}" aria-controls="acc-content-${i}">
              <div class="accordion-item__content" id="acc-content-${i}">
                <p class="accordion-item__label">${item.label}</p>
                <p class="accordion-item__text">${item.extra}</p>
              </div>
            </button>
          </div>
        `).join('');

      initAccordion(accordionEl);
    }
  }


  /* ----------------------------------------------------------
     TÉMOIGNAGES
  ---------------------------------------------------------- */

  function stopTestimonialAudio() {
    if (audioCtrl.timeupdateHandler && audioCtrl.player) {
      audioCtrl.player.removeEventListener('timeupdate', audioCtrl.timeupdateHandler);
    }
    audioCtrl.timeupdateHandler = null;
    if (audioCtrl.quoteEl) {
      audioCtrl.quoteEl.querySelectorAll('.kb--active').forEach(s => s.classList.remove('kb--active'));
      audioCtrl.quoteEl = null;
    }
    audioCtrl.karaokeBlocks = null;
    if (audioCtrl.player) {
      audioCtrl.player.pause();
      audioCtrl.player.removeEventListener('ended', stopTestimonialAudio);
      audioCtrl.player.removeEventListener('error', stopTestimonialAudio);
      audioCtrl.player = null;
    }
    if (audioCtrl.btn) {
      audioCtrl.btn.classList.remove('playing');
      audioCtrl.btn = null;
    }
    document.querySelectorAll('.testimonial-card__audio-btn')
      .forEach(b => { b.disabled = false; });
  }

  function renderTestimonials(content) {
    const container = document.querySelector('[data-content="testimonials"]');
    if (!container) return;

    // Icône speaker avec 3 ondes — overflow visible pour que les arcs ne soient pas coupés
    const speakerSVG = `
      <svg class="audio-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" overflow="visible" aria-hidden="true">
        <path d="M3 9v6h4l5 5V4L7 9H3z"/>
        <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M15.5 8.5a5 5 0 0 1 0 7"/>
        <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M18 6a9 9 0 0 1 0 12"/>
        <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M20.5 3.5a13 13 0 0 1 0 17"/>
      </svg>`;

    container.innerHTML = content.testimonials.map(t => {
      const photoEl = t.photo
        ? `<img class="testimonial-card__photo" src="${t.photo}" alt="Photo de ${t.author}" loading="lazy" />`
        : `<div class="testimonial-card__avatar" aria-hidden="true">${initials(t.author)}</div>`;
      const audioBtn = (t.audioFR || t.audioEN)
        ? `<button class="testimonial-card__audio-btn" data-audio-fr="${t.audioFR || ''}" data-audio-en="${t.audioEN || ''}" data-volume="${t.volume ?? 1}" aria-label="Écouter le témoignage">${speakerSVG}</button>`
        : '';
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
            ${audioBtn}
          </div>
          <blockquote class="testimonial-card__quote">${wrapQuoteBlocks(t.quote, t.karaoke)}</blockquote>
        </article>
      `;
    }).join('');

    // Attacher les handlers audio
    // Stocker les blocs karaoké sur chaque bouton pour accès rapide
    const allBtns = container.querySelectorAll('.testimonial-card__audio-btn');
    const testimonials = content.testimonials.filter(t => t.audioFR || t.audioEN);
    allBtns.forEach((btn, i) => {
      btn._karaokeBlocks = testimonials[i]?.karaoke || null;
      btn.addEventListener('click', () => {
        // Toggle : clic sur le bouton actif → stop
        if (audioCtrl.btn === btn) { stopTestimonialAudio(); return; }
        stopTestimonialAudio();
        const lang = document.documentElement.lang || 'fr';
        const src  = lang === 'en' ? btn.dataset.audioEn : btn.dataset.audioFr;
        if (!src) return;
        // Réutiliser le player partagé (compatibilité mobile iOS)
        sharedPlayer.src = src;
        sharedPlayer.load();
        const player = sharedPlayer;
        audioCtrl.player = player;
        audioCtrl.btn    = btn;
        btn.classList.add('playing');
        // Désactiver les autres boutons pendant la lecture
        container.querySelectorAll('.testimonial-card__audio-btn')
          .forEach(b => { if (b !== btn) b.disabled = true; });
        player.volume = parseFloat(btn.dataset.volume) || 1;
        player.play().catch(() => {});
        player.addEventListener('ended',  stopTestimonialAudio, { once: true });
        player.addEventListener('error',  stopTestimonialAudio, { once: true });

        // Karaoké — blocs définis dans content.json
        const blocks  = btn._karaokeBlocks;
        const card    = btn.closest('.testimonial-card');
        const quoteEl = card ? card.querySelector('.testimonial-card__quote') : null;
        if (blocks && quoteEl) {
          audioCtrl.quoteEl = quoteEl;
          audioCtrl.karaokeBlocks = blocks;
          const handler = () => {
            const t = player.currentTime;
            quoteEl.querySelectorAll('.kb').forEach(span => {
              const idx   = parseInt(span.dataset.idx);
              const block = blocks[idx];
              span.classList.toggle('kb--active', block && t >= block.start && t < block.end);
            });
          };
          audioCtrl.timeupdateHandler = handler;
          player.addEventListener('timeupdate', handler);
        }
      });
    });
  }


  /* ----------------------------------------------------------
     TIMELINE
  ---------------------------------------------------------- */
  function renderTimeline(content) {
    const timelineList = document.querySelector('[data-content="timeline"]');
    if (timelineList) {
      timelineList.innerHTML = content.timeline.map(item => {

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
  }


  /* ----------------------------------------------------------
     CE QUE J'AIME
  ---------------------------------------------------------- */
  function renderLoves(content) {
    setText('[data-content="loves.intro"]', content.loves.intro);
    const lovesList = document.querySelector('[data-content="loves.items"]');
    if (!lovesList) return;

    const items = content.loves.items;
    const total = items.length;

    /* Séparer emoji du texte (premier caractère graphème) */
    function splitEmoji(str) {
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const seg = new Intl.Segmenter('fr', { granularity: 'grapheme' });
        const first = [...seg.segment(str)][0]?.segment || '';
        return { emoji: first, text: str.slice(first.length).trim() };
      }
      const m = str.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
      return m ? { emoji: m[1], text: str.slice(m[0].length) } : { emoji: '', text: str };
    }

    /* Structure : carte masque + dots */
    lovesList.className = 'loves__carousel';
    lovesList.setAttribute('role', 'region');
    lovesList.setAttribute('aria-label', 'Carrousel');

    const slidesHTML = items.map((item, i) => {
      const { emoji, text } = splitEmoji(item);
      return `<div class="loves__slide${i === 0 ? ' loves__slide--active' : ''}" data-index="${i}">
        <span class="loves__emoji">${emoji}</span>
        <div class="loves__separator"></div>
        <p class="loves__text">${text}</p>
      </div>`;
    }).join('');

    const dotsHTML = items.map((_, i) =>
      `<button class="loves__dot${i === 0 ? ' loves__dot--active' : ''}" data-index="${i}" aria-label="Élément ${i + 1}"></button>`
    ).join('');

    lovesList.innerHTML = `
      <div class="loves__mask">
        <div class="loves__track">${slidesHTML}</div>
      </div>
      <div class="loves__dots">${dotsHTML}</div>
    `;

    initLovesCarousel(lovesList, total);
  }

  function initLovesCarousel(container, total) {
    const mask  = container.querySelector('.loves__mask');
    const track = container.querySelector('.loves__track');
    const dots  = container.querySelectorAll('.loves__dot');
    const slides = container.querySelectorAll('.loves__slide');
    let current = 0;
    let autoplayTimer = null;

    // Égaliser toutes les slides à la hauteur de la plus grande, puis adapter le masque
    function equalizeSlideHeights() {
      slides.forEach(s => { s.style.height = ''; });
      const maxH = Math.max(...Array.from(slides).map(s => s.offsetHeight));
      slides.forEach(s => { s.style.height = maxH + 'px'; });
      mask.style.height = maxH + 'px';
    }
    equalizeSlideHeights();
    window.addEventListener('resize', equalizeSlideHeights, { passive: true });

    function goTo(index) {
      slides[current].classList.remove('loves__slide--active');
      dots[current].classList.remove('loves__dot--active');
      current = ((index % total) + total) % total;
      slides[current].classList.add('loves__slide--active');
      dots[current].classList.add('loves__dot--active');
      track.style.transform = `translateY(-${slides[current].offsetTop}px)`;
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => goTo(current + 1), 4000);
    }

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    /* Clic sur les dots */
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.index));
        stopAutoplay();
        setTimeout(startAutoplay, 6000);
      });
    });

    /* Clic sur la carte pour passer au suivant */
    track.parentElement.addEventListener('click', () => {
      goTo(current + 1);
      stopAutoplay();
      setTimeout(startAutoplay, 6000);
    });

    startAutoplay();
  }


  /* ----------------------------------------------------------
     PORTFOLIO
  ---------------------------------------------------------- */
  function renderPortfolio(content, lang) {
    setText('[data-content="portfolio.intro"]', content.portfolio.intro);

    const portfolioGrid = document.querySelector('[data-content="portfolio.projects"]');
    if (portfolioGrid) {
      const ariaPrefix = lang === 'en' ? 'View project' : 'Voir le projet';
      portfolioGrid.innerHTML = content.portfolio.projects
        .map(project => {
          const thumbEl = project.thumbnail
            ? `<img class="portfolio-card__thumb" src="${project.thumbnail}" alt="${project.title}" loading="lazy" />`
            : `<div class="portfolio-card__thumb-placeholder">🎞️</div>`;
          return `
            <article class="portfolio-card" role="button" tabindex="0" data-project-id="${project.id}" aria-label="${ariaPrefix} ${project.title}">
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

      initPortfolioModal(portfolioGrid, content.portfolio.projects, content.ui);
    }
  }


  /* ----------------------------------------------------------
     CONTACT — texte + liens
  ---------------------------------------------------------- */
  function renderContactText(content, lang) {
    setText('[data-content="contact.intro"]',        content.contact.intro);
    setText('[data-content="contact.cta"]',          content.contact.cta);
    setText('[data-content="contact.availability"]', content.contact.availability);

    const linksWrapper = document.querySelector('[data-content="contact.links"]');
    if (linksWrapper) {
      linksWrapper.innerHTML = content.contact.links.map(link => {
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

    // Divider
    setText('.contact__divider span', content.ui?.divider);

    // Labels + placeholders du formulaire actif
    const ui = content.ui?.form;
    if (ui) {
      const formId = lang === 'en' ? 'contact-form-en' : 'contact-form-fr';
      const form   = document.getElementById(formId);
      if (form) {
        const setLabel = (forAttr, val) => {
          const el = form.querySelector(`label[for="${forAttr}"]`);
          if (el && val) el.textContent = val;
        };
        const setAttr = (sel, attr, val) => {
          const el = form.querySelector(sel);
          if (el && val) el[attr] = val;
        };
        const prefix = lang === 'en' ? 'cf-en' : 'cf-fr';
        setLabel(`${prefix}-name`,    ui.name);
        setLabel(`${prefix}-email`,   ui.email);
        setLabel(`${prefix}-subject`, ui.subject);
        setLabel(`${prefix}-message`, ui.message);
        setAttr('input[name="name"]',      'placeholder', ui.namePlaceholder);
        setAttr('input[name="email"]',     'placeholder', ui.emailPlaceholder);
        setAttr('input[name="subject"]',   'placeholder', ui.subjectPlaceholder);
        setAttr('textarea[name="message"]','placeholder', ui.messagePlaceholder);
        const btn = form.querySelector('.contact-form__submit');
        if (btn && !btn.disabled) btn.textContent = ui.submit;
      }
    }
  }


  /* ----------------------------------------------------------
     TEXTE STATIQUE — nav + titres de section + meta
  ---------------------------------------------------------- */
  function renderStaticText(content) {
    const { nav, sections, meta } = content;

    // Navigation pill
    if (nav) {
      const navMap = {
        '#hero':         nav.home,
        '#vision':       nav.vision,
        '#expertise':    nav.expertise,
        '#softskills':   nav.profile,
        '#testimonials': nav.testimonials,
        '#portfolio':    nav.portfolio,
        '#timeline':     nav.timeline,
        '#loves':        nav.loves,
        '#contact':      nav.contact,
      };
      Object.entries(navMap).forEach(([href, label]) => {
        const el = document.querySelector(`#nav-pill a[href="${href}"]`);
        if (el && label) el.textContent = label;
      });
    }

    // Titres de section
    if (sections) {
      setText('.section--expertise .section__title',    sections.expertise);
      setText('.section--softskills .section__title',   sections.softSkills);
      setText('.section--testimonials .section__title', sections.testimonials);
      setText('.section--portfolio .section__title',    sections.portfolio);
      setText('.section--timeline .section__title',     sections.timeline);
      setText('.section--loves .section__title',        sections.loves);
    }

    // Balises meta
    if (meta) {
      if (meta.title) document.title = meta.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && meta.description) metaDesc.content = meta.description;
    }
  }


  /* ----------------------------------------------------------
     LANG PILLS — état actif
  ---------------------------------------------------------- */
  function updateLangPills(lang) {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('lang-pill--active', btn.dataset.lang === lang);
    });
  }


  /* ----------------------------------------------------------
     FORMULAIRES — affichage selon la langue
  ---------------------------------------------------------- */
  function showForm(lang) {
    const formFR = document.getElementById('contact-form-fr');
    const formEN = document.getElementById('contact-form-en');
    if (formFR) formFR.style.display = lang === 'fr' ? '' : 'none';
    if (formEN) formEN.style.display = lang === 'en' ? '' : 'none';
  }

  function initContactForms() {
    ['contact-form-fr', 'contact-form-en'].forEach(formId => {
      const form = document.getElementById(formId);
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        if (!form.dataset.netlify) return;
        e.preventDefault();

        const lang      = formId.endsWith('-en') ? 'en' : 'fr';
        const ui        = (lang === 'en' ? contentEN : contentFR).ui?.form || {};
        const submitBtn = form.querySelector('.contact-form__submit');
        const successEl = form.querySelector('.contact-form__success');

        submitBtn.disabled    = true;
        submitBtn.textContent = ui.sending || 'Envoi en cours…';

        try {
          const formData = new FormData(form);
          await fetch('/', {
            method:  'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body:    new URLSearchParams(formData).toString(),
          });
          form.reset();
          submitBtn.textContent = ui.sent || 'Message envoyé ✓';
        } catch {
          if (successEl) successEl.textContent = ui.error || 'Une erreur est survenue.';
          submitBtn.textContent = ui.submit || 'Envoyer →';
          submitBtn.disabled    = false;
        }
      });
    });
  }


  /* ==========================================================
     FONCTIONS INTERACTIVES
  ========================================================== */

  /* --- Piles de cartes Expertise (clic pour défiler) --- */
  function initPileSwipe(container) {
    const stacks = container.querySelectorAll('.expertise-pile__stack');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    stacks.forEach(stack => {
      const cardEls = () => Array.from(stack.querySelectorAll('.expertise-pile__card'));
      let animating = false;

      function refreshZIndexes() {
        const cards = cardEls();
        const total = cards.length;
        cards.forEach((card, i) => {
          card.style.zIndex = total - i;
          card.classList.toggle('expertise-pile__card--top', i === 0);
          if (i !== 0) {
            const rot = (Math.random() * 10 - 5).toFixed(1);
            card.style.setProperty('--pile-rot', rot + 'deg');
          }
        });
      }

      function advance() {
        if (animating) return;
        const top = cardEls().find(c => c.classList.contains('expertise-pile__card--top'));
        if (!top) return;

        if (reducedMotion) {
          top.classList.remove('expertise-pile__card--top');
          stack.appendChild(top);
          refreshZIndexes();
          return;
        }

        animating = true;
        top.style.transition = 'opacity 0.25s ease';
        top.style.opacity = '0';

        setTimeout(() => {
          top.style.transition = 'none';
          top.style.opacity = '1';
          top.classList.remove('expertise-pile__card--top');
          stack.appendChild(top);
          refreshZIndexes();
          animating = false;
        }, 260);
      }

      stack.addEventListener('click', advance);
    });
  }


  /* --- Accordion (un toujours ouvert) --- */
  function initAccordion(container) {
    const items = container.querySelectorAll('.accordion-item');
    /* aria-hidden initial sur les blocs fermés */
    items.forEach(item => {
      const content = item.querySelector('.accordion-item__content');
      if (content) content.setAttribute('aria-hidden', item.classList.contains('open') ? 'false' : 'true');
    });
    items.forEach(item => {
      const trigger = item.querySelector('.accordion-item__trigger');
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        if (isOpen) return;
        items.forEach(other => {
          other.classList.remove('open');
          other.querySelector('.accordion-item__trigger').setAttribute('aria-expanded', 'false');
          const otherContent = other.querySelector('.accordion-item__content');
          if (otherContent) otherContent.setAttribute('aria-hidden', 'true');
        });
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        const content = item.querySelector('.accordion-item__content');
        if (content) content.setAttribute('aria-hidden', 'false');
      });
    });
  }


  /* --- Portfolio — Modale + Carousel --- */
  function initPortfolioModal(gridEl, projects, ui) {
    const modal    = document.getElementById('portfolio-modal');
    const backdrop = document.getElementById('portfolio-modal-backdrop');
    const closeBtn = document.getElementById('modal-close');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !backdrop) return;

    const projectMap = {};
    projects.forEach(p => { projectMap[p.id] = p; });

    let lastFocusedCard = null;

    function openModal(projectId) {
      const project = projectMap[projectId];
      if (!project) return;
      modalBody.innerHTML = buildModalContent(project, ui);
      modal.classList.add('is-open');
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
      const carouselEl = modalBody.querySelector('.modal-carousel');
      if (carouselEl) initCarousel(carouselEl);
    }

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

    gridEl.addEventListener('click', e => {
      const card = e.target.closest('.portfolio-card');
      if (!card) return;
      lastFocusedCard = card;
      openModal(card.dataset.projectId);
    });

    gridEl.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.portfolio-card');
      if (!card) return;
      e.preventDefault();
      lastFocusedCard = card;
      openModal(card.dataset.projectId);
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
      if (!e.target.closest('.portfolio-modal__dialog')) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }


  /* --- Contenu HTML de la modale --- */
  function buildModalContent(project, ui) {
    const m = ui?.modal || {};
    const prevLabel = m.prevImage || 'Image précédente';
    const nextLabel = m.nextImage || 'Image suivante';

    let mediaSection = '';

    if ((project.display === 'carousel' || project.display === 'gallery') && project.gallery?.length) {
      const slides = project.gallery
        .map(src => `<div class="modal-carousel__slide"><img src="${src}" alt="${project.title}" loading="lazy" /></div>`)
        .join('');
      const dots = project.gallery
        .map((_, i) => `<button class="modal-carousel__dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Image ${i + 1}"></button>`)
        .join('');
      mediaSection = `
        <div class="modal-carousel">
          <div class="modal-carousel__viewport">
            <div class="modal-carousel__track">${slides}</div>
          </div>
          <div class="modal-carousel__controls">
            <button class="modal-carousel__btn modal-carousel__btn--prev" aria-label="${prevLabel}">←</button>
            <div class="modal-carousel__dots">${dots}</div>
            <button class="modal-carousel__btn modal-carousel__btn--next" aria-label="${nextLabel}">→</button>
          </div>
        </div>
      `;
    } else if (project.thumbnail) {
      mediaSection = `<img class="modal-project__thumb" src="${project.thumbnail}" alt="${project.title}" />`;
    }

    const tags = (project.tags || []).map(t => `<span class="modal-project__tag">${t}</span>`).join('');

    let cta = '';
    if (project.links?.length) {
      cta = project.links.map(l =>
        `<a class="modal-project__link" href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label} ↗</a>`
      ).join('');
    } else if (project.display === 'link' && project.link) {
      cta = `<a class="modal-project__link" href="${project.link}" target="_blank" rel="noopener noreferrer">${m.viewProject || 'Voir le projet ↗'}</a>`;
    } else if (project.display === 'coming-soon') {
      cta = `<span class="modal-project__badge">${m.comingSoon || '⏳ En cours de développement'}</span>`;
    } else if (project.linkOnRequest) {
      cta = `<span class="modal-project__on-request">${m.onRequest || 'Lien disponible sur demande'}</span>`;
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
    const track   = carouselEl.querySelector('.modal-carousel__track');
    const slides  = carouselEl.querySelectorAll('.modal-carousel__slide');
    const dots    = carouselEl.querySelectorAll('.modal-carousel__dot');
    const prevBtn = carouselEl.querySelector('.modal-carousel__btn--prev');
    const nextBtn = carouselEl.querySelector('.modal-carousel__btn--next');

    if (!track || slides.length === 0) return;

    let current = 0;
    const total = slides.length;
    let autoplayTimer = null;

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function stopAutoplay() {
      clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }

    // Défilement automatique : 0,75 s avant la 1re transition, puis 1,5 s entre chaque image.
    // S'arrête définitivement dès qu'un utilisateur interagit avec les flèches ou les dots.
    function scheduleNext(delay) {
      autoplayTimer = setTimeout(() => {
        goTo(current + 1);
        scheduleNext(1500);
      }, delay);
    }
    scheduleNext(750);

    prevBtn?.addEventListener('click', () => { stopAutoplay(); goTo(current - 1); });
    nextBtn?.addEventListener('click', () => { stopAutoplay(); goTo(current + 1); });
    dots.forEach(dot => {
      dot.addEventListener('click', () => { stopAutoplay(); goTo(Number(dot.dataset.index)); });
    });

    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { stopAutoplay(); goTo(diff > 0 ? current + 1 : current - 1); }
    });
  }


  /* --- Icônes de contact (SVG inline) --- */
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


  /* ----------------------------------------------------------
     EASTER EGG — Double-clic / Double-tap : explosion de cœurs
  ---------------------------------------------------------- */
  function spawnHearts(x, y) {
    const COUNT = Math.floor(Math.random() * 3) + 3; // 3, 4 ou 5
    const STEPS = 10;

    for (let i = 0; i < COUNT; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-burst';
      heart.textContent = '♥';
      heart.style.left = x + 'px';
      heart.style.top  = y + 'px';

      // Taille variable : 85–115 % de la taille de base
      const sizeFactor = 0.85 + Math.random() * 0.30;
      heart.style.fontSize = (2.4 * sizeFactor).toFixed(2) + 'rem';

      // Couleur : gradient, coral foncé, ou orange clair
      const colorVariant = Math.floor(Math.random() * 3);
      if (colorVariant === 0) {
        heart.style.background = 'linear-gradient(135deg, #FF7163, #FFB347)';
        heart.style.webkitBackgroundClip = 'text';
        heart.style.webkitTextFillColor  = 'transparent';
        heart.style.backgroundClip       = 'text';
      } else if (colorVariant === 1) {
        heart.style.color = '#FF7163'; // coral foncé
      } else {
        heart.style.color = '#FFB347'; // orange clair
      }

      const angle    = (i / COUNT) * 360 + Math.random() * 40;
      const distance = 50 + Math.random() * 60;
      const rad      = angle * (Math.PI / 180);
      const tx       = Math.cos(rad) * distance;
      const ty       = Math.sin(rad) * distance;

      // Point de contrôle Bézier quadratique : perpendiculaire à mi-chemin
      const curve = (Math.random() - 0.5) * 80;
      const cpx   = tx / 2 + (-Math.sin(rad)) * curve;
      const cpy   = ty / 2 + ( Math.cos(rad)) * curve;

      const rotEnd  = (Math.random() - 0.5) * 50; // ±25°
      const duration = 500 + Math.random() * 500;
      const delay    = Math.random() * 100;

      // Précalcul de la courbe de Bézier quadratique
      const keyframes = [];
      for (let s = 0; s <= STEPS; s++) {
        const t  = s / STEPS;
        const mt = 1 - t;
        const bx = 2 * mt * t * cpx + t * t * tx;
        const by = 2 * mt * t * cpy + t * t * ty;
        const scale   = 1 - t * 0.7;
        const opacity = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
        const rot     = rotEnd * t;
        keyframes.push({
          transform: `translate(${bx}px, ${by}px) scale(${scale}) rotate(${rot}deg)`,
          opacity
        });
      }

      document.body.appendChild(heart);
      const anim = heart.animate(keyframes, { duration, delay, easing: 'linear', fill: 'forwards' });
      anim.finished.then(() => heart.remove());
    }
  }

  /* ==========================================================
     MODALE CACHÉE — CVs (7 clics sur la photo Contact)
  ========================================================== */
  function renderCvModal(content) {
    const list = document.getElementById('cv-modal-list');
    const cv = content?.ui?.cvModal;
    if (!list || !cv) return;
    list.innerHTML = cv.items.map(item => `
      <li class="cv-modal__item">
        <a class="cv-modal__link" href="${item.href}" rel="noopener noreferrer">
          <span class="cv-modal__icon" aria-hidden="true">📄</span>
          <span class="cv-modal__text">
            <span class="cv-modal__label">${item.label}</span>
            <span class="cv-modal__desc">${item.desc}</span>
          </span>
        </a>
      </li>
    `).join('');
    // Ouverture dans l'overlay in-app (évite la navigation hors du WebView en mode PWA iOS)
    list.querySelectorAll('.cv-modal__link').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        openCvViewer(a.href);
      });
    });
  }

  /* ==========================================================
     VISIONNEUSE CV IN-APP
  ========================================================== */
  (function initCvViewer() {
    const viewer = document.getElementById('cv-viewer');
    const frame  = document.getElementById('cv-viewer-frame');
    const close  = document.getElementById('cv-viewer-close');
    if (!viewer || !frame || !close) return;

    window.openCvViewer = function(href) {
      frame.src = href;
      viewer.classList.add('is-open');
      viewer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      close.focus();
    };

    function closeCvViewer() {
      viewer.classList.remove('is-open');
      viewer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      frame.src = '';
    }

    close.addEventListener('click', closeCvViewer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && viewer.classList.contains('is-open')) closeCvViewer();
    });
  }());

  (function initCvModalTrigger() {
    const modal = document.getElementById('cv-modal');
    const backdrop = document.getElementById('cv-modal-backdrop');
    if (!modal || !backdrop) return;

    function openModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    let clickCount = 0;
    let resetTimer = null;
    const REQUIRED_CLICKS = 7;
    const RESET_DELAY_MS = 1500;

    document.addEventListener('click', e => {
      const avatar = e.target.closest('.contact__avatar');
      if (!avatar) return;
      clickCount += 1;
      clearTimeout(resetTimer);
      if (clickCount >= REQUIRED_CLICKS) {
        clickCount = 0;
        openModal();
        return;
      }
      resetTimer = setTimeout(() => { clickCount = 0; }, RESET_DELAY_MS);
    });

    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  })();


  /* Desktop */
  document.addEventListener('dblclick', e => {
    spawnHearts(e.clientX, e.clientY);
  });

  /* Mobile : double-tap manuel (dblclick peu fiable sur touch) */
  let lastTap = 0, lastTapX = 0, lastTapY = 0;
  document.addEventListener('touchstart', e => {
    const now = Date.now();
    const t   = e.changedTouches[0];
    const dx  = Math.abs(t.clientX - lastTapX);
    const dy  = Math.abs(t.clientY - lastTapY);
    if (now - lastTap < 300 && dx < 30 && dy < 30) {
      spawnHearts(t.clientX, t.clientY);
      lastTap = 0;
    } else {
      lastTap   = now;
      lastTapX  = t.clientX;
      lastTapY  = t.clientY;
    }
  }, { passive: true });


})();
