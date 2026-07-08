// Busla — shared behavior: theme, language, header menu, scroll reveal, counters
(function(){
  const PAL = {
    dark:{
      '--bg':'#0a0a0a','--bg-2':'#0e0e0e','--surface':'#141414',
      '--glass-card':'rgba(255,255,255,.04)','--glass-border':'rgba(255,255,255,.1)',
      '--text':'#f5f5f5','--text-dim':'rgba(245,245,245,.6)','--text-faint':'rgba(245,245,245,.38)',
      '--line':'rgba(255,255,255,.1)','--line-strong':'rgba(255,255,255,.18)',
      '--accent-soft':'rgba(239,74,35,.14)',
      '--page-bg':'radial-gradient(130% 110% at 50% -10%, #141414 0%, #0a0a0a 55%, #050505 100%)'
    },
    light:{
      '--bg':'#f4f4f4','--bg-2':'#ececec','--surface':'#ffffff',
      '--glass-card':'rgba(255,255,255,.7)','--glass-border':'rgba(16,16,16,.08)',
      '--text':'#101010','--text-dim':'rgba(16,16,16,.6)','--text-faint':'rgba(16,16,16,.4)',
      '--line':'rgba(16,16,16,.1)','--line-strong':'rgba(16,16,16,.18)',
      '--accent-soft':'rgba(239,74,35,.1)',
      '--page-bg':'radial-gradient(130% 110% at 50% -10%, #ffffff 0%, #f1f1f1 45%, #e6e6e6 100%)'
    }
  };

  const root = document.querySelector('.page-root');
  const themeBtn = document.getElementById('themeToggle');
  const langBtn = document.getElementById('langToggle');
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  function applyTheme(theme){
    if(!root) return;
    const p = PAL[theme] || PAL.dark;
    for(const k in p) root.style.setProperty(k, p[k]);
    root.classList.toggle('lightmode', theme === 'light');
    if(themeBtn) themeBtn.textContent = theme === 'dark' ? '☀' : '☮';
  }

  function setLang(lang){
    document.querySelectorAll('[data-en]').forEach(el=>{
      if(el.dataset.arsaved === undefined) el.dataset.arsaved = el.textContent;
      el.textContent = (lang === 'en') ? el.getAttribute('data-en') : el.dataset.arsaved;
    });
    document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
    document.documentElement.setAttribute('lang', lang);
    if(root){
      root.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
      root.setAttribute('lang', lang);
    }
    if(langBtn) langBtn.textContent = lang === 'ar' ? 'EN' : 'ع';
    localStorage.setItem('busla-lang', lang);
    document.dispatchEvent(new CustomEvent('busla:lang', { detail:{ lang } }));
  }

  function toggleLang(){
    const cur = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'ar';
    setLang(cur === 'en' ? 'ar' : 'en');
  }
  function toggleTheme(){
    const cur = root && root.classList.contains('lightmode') ? 'light' : 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('busla-theme', next);
  }

  const savedTheme = localStorage.getItem('busla-theme') === 'light' ? 'light' : 'dark';
  const savedLang = localStorage.getItem('busla-lang') === 'en' ? 'en' : 'ar';
  applyTheme(savedTheme);
  if(savedLang === 'en') setLang('en');

  if(themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if(langBtn) langBtn.addEventListener('click', toggleLang);
  if(burgerBtn && mobileMenu){
    burgerBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      burgerBtn.innerHTML = open
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });
  }

  // ===== fade-in (data-fade) =====
  document.querySelectorAll('[data-fade]').forEach(el=>{
    const d = el.getAttribute('data-delay') || 0;
    el.style.animation = `blurFadeUp .9s ease-out ${d}ms forwards`;
  });

  // ===== scroll reveal + counters (data-reveal / data-count) =====
  function countUp(el){
    const target = parseFloat(el.getAttribute('data-count'));
    const suf = el.getAttribute('data-suffix') || '';
    const dur = 1700, t0 = performance.now();
    const iv = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(e * target) + suf;
      if(p >= 1) clearInterval(iv);
    }, 16);
  }
  function reveal(el){
    if(el.dataset.shown) return;
    el.dataset.shown = '1';
    el.classList.add('is-shown');
    if(el.hasAttribute('data-count')) countUp(el);
  }
  function checkReveals(){
    const vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('[data-reveal],[data-count]').forEach(el=>{
      if(el.dataset.shown) return;
      const r = el.getBoundingClientRect();
      if(r.top < vh * 0.92) reveal(el);
    });
  }
  window.addEventListener('scroll', checkReveals, { passive:true });
  window.addEventListener('resize', checkReveals, { passive:true });
  checkReveals();
  [200, 600, 1400, 2600, 4000].forEach(ms => setTimeout(checkReveals, ms));

  window.Busla = window.Busla || {};
  window.Busla.applyTheme = applyTheme;
  window.Busla.setLang = setLang;
  window.Busla.getLang = () => (document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'ar');
  window.Busla.checkReveals = checkReveals;
})();
