(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const animate = root.classList.contains('js') && window.gsap && window.ScrollTrigger && window.SplitText;
  if (!animate) root.classList.remove('js');

  // Carrossel contínuo dos resultados (mobile): trilha com os cards duplicados
  $$('.tab-panel').forEach((panel) => {
    const track = document.createElement('div');
    track.className = 'track';
    const slots = [...panel.children];
    slots.forEach((slot) => track.appendChild(slot));
    slots.forEach((slot) => {
      const clone = slot.cloneNode(true);
      clone.classList.add('is-clone');
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    panel.appendChild(track);
  });

  // Abas de resultados
  const tabs = $$('.tab');
  const selectTab = (tab) => {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (!panel.hidden) return;
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    panel.scrollLeft = 0;
    if (animate) {
      gsap.fromTo(panel.children, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'expo.out' });
    }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  if (!animate) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  const ease = 'expo.out';
  // Revela o título linha a linha; autoSplit refaz as linhas se a largura mudar
  const revealLines = (el, vars) => SplitText.create(el, {
    type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
    onSplit: (self) => gsap.from(self.lines, { yPercent: 110, ease: 'expo.out', ...vars }),
  });

  const countUp = (el, delay = 0) => {
    const obj = { v: 0 };
    gsap.to(obj, {
      v: +el.dataset.count, duration: 1.8, delay, ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.v); },
    });
  };

  const rise = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 30, autoAlpha: 0, duration: 1.1, ease, ...vars,
    scrollTrigger: { trigger: trigger || targets, start: 'top 88%' },
  });

  document.fonts.ready.then(() => {
    // Dobra 1 — entrada
    const header = $('.header');
    const photo = $('.hero-photo');
    const photoImg = $('.hero-photo img');

    gsap.set([header, ...$('.hero-text').children, photo], { autoAlpha: 1 });

    gsap.timeline({ defaults: { ease } })
      .from(photo, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
      .from(photoImg, { scale: 1.6, duration: 2.2 }, '<')
      .from(header, { yPercent: -100, duration: 1.1 }, '-=1.2')
      .from('.hero .kicker', { y: 20, autoAlpha: 0, duration: 1 }, '<')
      .from('.hero .lede', { y: 30, autoAlpha: 0, duration: 1.1 }, '<0.4')
      .from('.hero-actions > *', { y: 24, autoAlpha: 0, duration: 1, stagger: 0.1 }, '<0.15')
      .from('.hero-meta', { y: 24, autoAlpha: 0, duration: 1 }, '<0.15')
      .add(() => $('.hero-meta [data-count]').forEach((el) => countUp(el)), '<');
    revealLines($('.hero h1'), { duration: 1.3, stagger: 0.1, delay: 0.5 });

    gsap.to(photoImg, {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.matchMedia().add('(min-width: 981px)', () => {
      gsap.to('.hero-text', {
        y: -60, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    });

    // Header: barra de progresso e esconder ao rolar pra baixo
    const bar = document.createElement('span');
    bar.className = 'progress';
    header.appendChild(bar);
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    const showHeader = (show) => gsap.to(header, { yPercent: show ? 0 : -100, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    ScrollTrigger.create({
      start: 200, end: 'max',
      onUpdate: (self) => showHeader(self.direction === -1),
      onLeaveBack: () => showHeader(true),
    });

    // Títulos de seção linha a linha
    $$('main h2').forEach((h) => {
      revealLines(h, { duration: 1.2, stagger: 0.1, scrollTrigger: { trigger: h, start: 'top 88%' } });
    });
    $$('main section:not(.hero) .kicker, .section-head .lede, .about-text p, .contact .lede').forEach((el) => rise(el));

    // Sobre
    const panel = $('.about-photo');
    const panelImg = $('.about-photo img');
    gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 80%' } })
      .from(panel, { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
      .from(panelImg, { scale: 1.3, duration: 2, ease }, '<');
    gsap.fromTo(panelImg, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.from('.signature', {
      clipPath: 'inset(0% 100% 0% 0%)', duration: 2.2, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.signature', start: 'top 92%' },
    });

    // Como funciona
    const steps = $('.steps');
    gsap.timeline({ scrollTrigger: { trigger: steps, start: 'top 85%' } })
      .fromTo(steps, { '--draw': 0 }, { '--draw': 1, duration: 1.4, ease: 'expo.inOut' })
      .from('.step', { y: 40, autoAlpha: 0, duration: 1.1, stagger: 0.15, ease }, '-=0.9');

    // Avaliações
    gsap.from('.g-summary', {
      y: 30, autoAlpha: 0, duration: 1.1, ease,
      scrollTrigger: {
        trigger: '.g-summary', start: 'top 90%',
        onEnter: () => $$('.g-summary [data-count]').forEach((el) => countUp(el, 0.2)),
      },
    });
    rise('.review', '.review-list', { y: 70, duration: 1.2, stagger: 0.14 });

    // Resultados
    rise('.tab', '.tabs', { y: 16, stagger: 0.06 });
    rise('.tab-panel:not([hidden]) .result-slot', '.results .tab-panel', { y: 60, stagger: 0.12 });

    // Contato
    rise('.info > div', '.info', { y: 26, stagger: 0.1 });
    rise('.contact .btn', '.contact .btn', { y: 26 });
    gsap.from('.map', {
      clipPath: 'inset(0% 0% 0% 100%)', duration: 1.6, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.contact', start: 'top 70%' },
    });

    // WhatsApp flutuante: aparece só depois do hero, que já tem o próprio botão
    const wa = $('.wa-float');
    gsap.set(wa, { scale: 0, autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: '.hero', start: 'bottom 85%',
      onEnter: () => gsap.to(wa, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2)', overwrite: true }),
      onLeaveBack: () => gsap.to(wa, { scale: 0, autoAlpha: 0, duration: 0.3, ease: 'power2.in', overwrite: true }),
    });

    // Botões magnéticos (só mouse)
    if (matchMedia('(pointer: fine)').matches) {
      $$('.btn, .wa-float').forEach((btn) => {
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.25);
          yTo((e.clientY - r.top - r.height / 2) * 0.35);
        });
        btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
      });
    }

    ScrollTrigger.refresh();
  });
})();
