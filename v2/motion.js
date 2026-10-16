/* Solutions Entreprises 972 — mouvement partagé : nav, apparitions, parallaxe douce */
window.SE972 = (function () {
  const E = 'cubic-bezier(.22,1,.36,1)';
  function init(opts) {
    opts = opts || {};
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const anim = opts.animations !== false && !reduced;
    const navAt = opts.navAt || 480;
    const nav = document.getElementById('nav'), brand = document.getElementById('nav-brand'), links = document.getElementById('nav-links');
    let navSolid = null;
    function navUpdate(y) {
      if (!nav) return;
      const s = y > navAt; if (s === navSolid) return; navSolid = s;
      nav.classList.toggle('solid', s);
      nav.style.background = s ? 'rgba(255,255,255,.86)' : 'transparent';
      nav.style.backdropFilter = s ? 'blur(18px)' : 'none';
      nav.style.borderColor = s ? 'rgba(11,32,39,.06)' : 'rgba(255,255,255,.28)';
      nav.style.boxShadow = s ? '0 10px 36px rgba(11,32,39,.14)' : 'none';
      if (brand) brand.style.color = s ? '#0B2027' : '#fff';
      if (links) links.style.color = s ? '#41545A' : 'rgba(255,255,255,.82)';
    }
    // Parallaxe : la valeur de scroll est lissée (lerp) pour que les images glissent sans à-coups
    const px = anim ? [...document.querySelectorAll('[data-parallax]')] : [];
    px.forEach(el => { el.style.willChange = 'transform'; el.style.transition = 'none'; });
    let target = scrollY, current = scrollY, raf = null;
    function frame() {
      current += (target - current) * 0.09;
      if (Math.abs(target - current) < 0.15) current = target;
      const lag = target - current;
      px.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        const box = el.parentElement.getBoundingClientRect();
        const center = box.top + box.height / 2 - innerHeight / 2 + lag;
        const scale = 1 + speed * 2.2;
        const max = box.height * (scale - 1) / 2;
        const shift = Math.max(-max, Math.min(max, -center * speed));
        el.style.transform = 'translate3d(0,' + shift.toFixed(2) + 'px,0) scale(' + scale.toFixed(3) + ')';
      });
      navUpdate(current);
      raf = current !== target ? requestAnimationFrame(frame) : null;
    }
    function onScroll() { target = scrollY; if (!raf) raf = requestAnimationFrame(frame); }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll(); frame();

    // Apparitions : lentes, courtes en distance, avec un léger décalage entre enfants
    let io = null;
    if (anim) {
      const els = [...document.querySelectorAll('[data-reveal]')];
      els.forEach(el => {
        el.style.opacity = '0'; el.style.transform = 'translateY(18px)';
        el.style.transition = 'opacity 1.3s ease, transform 1.5s ' + E;
        if (el.hasAttribute('data-stagger')) [...el.children].forEach(c => {
          c.style.opacity = '0'; c.style.transform = 'translateY(14px)';
          c.dataset.omKeep = c.style.transition || '';
          const cs = getComputedStyle(c).transition;
          const keep = c.style.transition || (cs && !/^all 0s/.test(cs) ? cs : '');
          c.style.transition = (keep ? keep + ', ' : '') + 'opacity 1.1s ease, transform 1.3s ' + E;
        });
      });
      io = new IntersectionObserver(entries => entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target; el.style.opacity = '1'; el.style.transform = 'none';
        if (el.hasAttribute('data-stagger')) [...el.children].forEach((c, i) => setTimeout(() => {
          c.style.opacity = '1'; c.style.transform = '';
          setTimeout(() => { c.style.transition = c.dataset.omKeep || ''; c.style.opacity = ''; }, 1400);
        }, 160 + i * 120));
        io.unobserve(el);
      }), { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
      els.forEach(el => io.observe(el));
      setTimeout(() => els.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { el.style.opacity = '1'; el.style.transform = 'none'; } }), 1200);
    }
    return { destroy() { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); if (io) io.disconnect(); } };
  }
  return { init };
})();
