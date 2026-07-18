(() => {
  'use strict';

  // Scroll-reveal
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 6) * 60 + 'ms';
      obs.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // Animated stat counters
  document.querySelectorAll('[data-count]').forEach((el) => {
    const to = parseFloat(el.dataset.count) || 0;
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    el.textContent = pre + '0' + suf;
    const run = () => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        let p = Math.min(1, (now - start) / dur);
        p = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + (to * p).toFixed(0) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const o = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { run(); o.unobserve(e.target); } });
      }, { threshold: 0.4 });
      o.observe(el);
    } else run();
  });

  // Cycling hero headline
  const cycle = document.querySelectorAll('[data-cycle] span');
  if (cycle.length > 1) {
    let i = 0;
    setInterval(() => {
      cycle[i].style.opacity = '0';
      cycle[i].style.transform = 'translateY(-24px)';
      i = (i + 1) % cycle.length;
      cycle[i].style.opacity = '1';
      cycle[i].style.transform = 'none';
    }, 2400);
  }

  // Mobile nav toggle
  const navEl = document.getElementById('nav');
  const navToggle = navEl && navEl.querySelector('.nav-toggle');
  if (navEl && navToggle) {
    const setOpen = (open) => {
      navEl.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };
    navToggle.addEventListener('click', () => setOpen(!navEl.classList.contains('open')));
    navEl.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // Scroll progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      progressBar.style.width = (scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0) + '%';
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // Back-to-top
  const toTop = document.querySelector('.to-top');
  if (toTop) {
    const toggleToTop = () => toTop.classList.toggle('show', window.scrollY > 700);
    document.addEventListener('scroll', toggleToTop, { passive: true });
    toggleToTop();
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Copy-link share button (article pages)
  document.querySelectorAll('[data-copy-link]').forEach((btn) => {
    const label = btn.querySelector('[data-copy-label]');
    const original = label ? label.textContent : '';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = location.href;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      btn.classList.add('copied');
      if (label) label.textContent = 'Link copiado!';
      setTimeout(() => { btn.classList.remove('copied'); if (label) label.textContent = original; }, 2000);
    });
  });

  // Blog category filter + search (client-side, combined)
  const chipRow = document.querySelector('[data-cat-filter]');
  const searchInput = document.querySelector('[data-search]');
  if (chipRow) {
    const chips = chipRow.querySelectorAll('.chip');
    const cards = Array.from(document.querySelectorAll('[data-card-cat]'));
    const featured = document.querySelector('[data-featured]');
    const noResults = document.querySelector('[data-no-results]');
    let activeCat = 'Todos';

    const applyFilters = () => {
      const q = (searchInput && searchInput.value || '').trim().toLowerCase();
      let visibleCount = 0;
      cards.forEach((card) => {
        const inCat = activeCat === 'Todos' ? !card.hasAttribute('data-featured-dup') : card.dataset.cardCat === activeCat;
        const haystack = (card.dataset.searchText || '').toLowerCase();
        const inSearch = !q || haystack.includes(q);
        const show = inCat && inSearch;
        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });
      if (featured) featured.style.display = (activeCat === 'Todos' && !q) ? '' : 'none';
      if (noResults) noResults.classList.toggle('show', visibleCount === 0);
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        activeCat = chip.dataset.cat;
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        applyFilters();
        history.replaceState(null, '', activeCat === 'Todos' ? location.pathname : '?cat=' + encodeURIComponent(activeCat));
      });
    });
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    const params = new URLSearchParams(location.search);
    const initialCat = params.get('cat');
    if (initialCat) {
      const match = Array.from(chips).find((c) => c.dataset.cat === initialCat);
      if (match) match.click();
    }
  }
})();
