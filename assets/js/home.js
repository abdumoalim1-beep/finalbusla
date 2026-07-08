// Busla — homepage behavior: preloader, video, wave canvas, work carousel, modal, booking calendar
(function(){
  const PROJECTS = window.BuslaData.PROJECTS;
  const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const WEEKDAYS_AR = ['أح','إث','ثل','أر','خم','جم','سب'];
  const WEEKDAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // ===== Preloader =====
  (function preloader(){
    const el = document.getElementById('preloader');
    const percentEl = document.getElementById('preloadPercent');
    if(!el) return;
    const dur = 2300, t0 = performance.now();
    let done = false;
    const finish = () => {
      if(done) return; done = true;
      clearInterval(iv);
      setTimeout(() => el.classList.add('is-open'), 480);
    };
    const iv = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      if(percentEl) percentEl.textContent = Math.round(p * 100);
      if(p >= 1) finish();
    }, 16);
    setTimeout(finish, dur + 1500);
  })();

  // ===== Video autoplay =====
  (function playVideo(){
    const v = document.getElementById('heroVideo');
    if(!v) return;
    v.muted = true; v.defaultMuted = true;
    const go = () => { const p = v.play(); if(p && p.catch) p.catch(()=>{}); };
    go();
    v.addEventListener('loadeddata', go);
    v.addEventListener('canplay', go);
  })();

  // ===== Wave canvas =====
  (function waveCanvas(){
    const canvas = document.getElementById('waveCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cols = 0, rows = 0, spacing = 26;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / spacing) + 1;
      rows = Math.ceil(h / spacing) + 1;
    };
    resize();
    window.addEventListener('resize', resize);
    let t = 0;
    const isLight = () => document.querySelector('.page-root').classList.contains('lightmode');
    setInterval(() => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for(let iy = 0; iy < rows; iy++){
        for(let ix = 0; ix < cols; ix++){
          const x = ix * spacing;
          const y = iy * spacing;
          const wave = Math.sin((ix * 0.35) + (iy * 0.22) + t) * 0.5 + Math.sin((ix * 0.18) - t * 1.3) * 0.5;
          const r = 1 + wave * 1.15;
          const alpha = isLight() ? (0.08 + wave * 0.09) : (0.14 + wave * 0.16);
          if(r <= 0.15) continue;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.4, r), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${isLight() ? '16,16,16' : '245,245,245'},${Math.max(0, alpha)})`;
          ctx.fill();
        }
      }
    }, 32);
  })();

  // ===== Work teaser stack carousel =====
  const stage = document.getElementById('workStage');
  const dotsEl = document.getElementById('workDots');
  let stackIndex = 0;
  let stackMoved = false;

  function renderStack(){
    const lang = window.Busla.getLang();
    const n = PROJECTS.length;
    const cardW = 320;
    stage.innerHTML = '';
    PROJECTS.forEach((p, i) => {
      let offset = i - stackIndex;
      if(offset > n/2) offset -= n;
      if(offset < -n/2) offset += n;
      const dir = lang === 'ar' ? -1 : 1;
      const absOff = Math.abs(offset);
      const visible = absOff <= 2;
      const scale = offset === 0 ? 1 : (absOff === 1 ? 0.82 : 0.68);
      const translateX = dir * offset * (cardW * 0.62);
      const opacity = offset === 0 ? 1 : (absOff === 1 ? 0.55 : 0.22);
      const blur = offset === 0 ? 0 : (absOff === 1 ? 1.5 : 3);
      const z = 10 - absOff;
      const card = document.createElement('div');
      card.style.cssText = `position:absolute;width:${cardW}px;height:100%;display:flex;flex-direction:column;border-radius:20px;overflow:hidden;background:var(--surface);border:1px solid var(--glass-border);box-shadow:${offset === 0 ? '0 24px 60px rgba(0,0,0,.35)' : 'none'};transform:translateX(${translateX}px) scale(${scale});opacity:${visible ? opacity : 0};filter:blur(${blur}px);z-index:${z};transition:transform .55s cubic-bezier(.16,1,.3,1),opacity .55s ease,filter .55s ease;cursor:pointer;pointer-events:${visible ? 'auto' : 'none'};`;
      const badgeSide = lang === 'ar' ? 'right' : 'left';
      card.innerHTML = `
        <div style="position:relative;width:100%;aspect-ratio:3/2;overflow:hidden;flex:none;">
          <img src="${p.image}" draggable="false" style="width:100%;height:100%;object-fit:cover;pointer-events:none;" alt="${p.title[lang]}">
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(10,10,10,.85) 100%);"></div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;padding:20px 20px 18px;background:var(--surface);">
          <h3 style="margin:0 0 8px;font-size:18px;font-weight:600;">${p.title[lang]}</h3>
          <p style="margin:0;font-size:13.5px;line-height:1.6;color:var(--text-dim);flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.short[lang]}</p>
          <div style="margin-top:12px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--accent);text-align:end;">${String(i+1).padStart(2,'0')} / ${String(n).padStart(2,'0')}</div>
        </div>`;
      card.addEventListener('click', () => {
        if(stackMoved) return;
        offset === 0 ? openModal(i) : goToCard(i);
      });
      stage.appendChild(card);
    });

    dotsEl.innerHTML = '';
    PROJECTS.forEach((p, i) => {
      const dot = document.createElement('span');
      dot.style.cssText = `width:${i === stackIndex ? 22 : 8}px;height:8px;border-radius:999px;background:${i === stackIndex ? 'var(--accent)' : 'var(--glass-border)'};cursor:pointer;transition:all .3s;display:inline-block;`;
      dot.addEventListener('click', () => goToCard(i));
      dotsEl.appendChild(dot);
    });
  }
  function goToCard(i){ stackIndex = i; renderStack(); }
  function prevCard(){ stackIndex = (stackIndex - 1 + PROJECTS.length) % PROJECTS.length; renderStack(); }
  function nextCard(){ stackIndex = (stackIndex + 1) % PROJECTS.length; renderStack(); }

  document.getElementById('workPrev').addEventListener('click', prevCard);
  document.getElementById('workNext').addEventListener('click', nextCard);
  document.addEventListener('busla:lang', renderStack);

  (function setupStackDrag(){
    let isDown = false, startX = 0;
    const down = (x) => { isDown = true; stackMoved = false; startX = x; };
    const move = (x) => { if(!isDown) return; if(Math.abs(x - startX) > 6) stackMoved = true; };
    const up = (x) => {
      if(!isDown) return; isDown = false;
      const dx = x - startX;
      if(Math.abs(dx) > 40){ dx < 0 ? nextCard() : prevCard(); }
    };
    stage.addEventListener('mousedown', (e) => down(e.pageX));
    window.addEventListener('mousemove', (e) => move(e.pageX));
    window.addEventListener('mouseup', (e) => up(e.pageX));
    stage.addEventListener('touchstart', (e) => down(e.touches[0].pageX), { passive:true });
    stage.addEventListener('touchmove', (e) => move(e.touches[0].pageX), { passive:true });
    stage.addEventListener('touchend', (e) => up(e.changedTouches[0].pageX));
  })();

  renderStack();

  // ===== Project modal =====
  const modal = document.getElementById('projectModal');
  function openModal(i){
    const lang = window.Busla.getLang();
    const p = PROJECTS[i];
    document.getElementById('modalImage').src = p.image;
    document.getElementById('modalImage').alt = p.title[lang];
    document.getElementById('modalTitle').textContent = p.title[lang];
    document.getElementById('modalDescription').textContent = p.description[lang];
    const ach = document.getElementById('modalAchievements');
    ach.innerHTML = '';
    p.achievements[lang].forEach(a => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:flex-start;gap:9px;';
      row.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex:none;margin-top:2px;"><path d="M20 6 9 17l-5-5"></path></svg><span style="font-size:14px;color:var(--text-dim);line-height:1.6;">${a}</span>`;
      ach.appendChild(row);
    });
    document.getElementById('modalLink').href = 'work.html#project-' + i;
    modal.style.display = 'flex';
  }
  window.Home = { closeModal: () => { modal.style.display = 'none'; } };

  // ===== Booking calendar =====
  let calMonth = new Date().getFullYear()*12 + new Date().getMonth();
  let selectedDay = null;
  function renderCalendar(){
    const lang = window.Busla.getLang();
    const y = Math.floor(calMonth / 12);
    const m = ((calMonth % 12) + 12) % 12;
    document.getElementById('calMonthLabel').textContent = `${lang === 'en' ? MONTHS_EN[m] : MONTHS_AR[m]} ${y}`;
    const weekdayLabels = lang === 'en' ? WEEKDAYS_EN : WEEKDAYS_AR;
    const weekdaysEl = document.getElementById('calWeekdays');
    weekdaysEl.innerHTML = '';
    weekdayLabels.forEach(w => {
      const d = document.createElement('div');
      d.style.cssText = 'text-align:center;font-size:12.5px;color:var(--text-faint);padding:6px 0;';
      d.textContent = w;
      weekdaysEl.appendChild(d);
    });

    const daysEl = document.getElementById('calDays');
    daysEl.innerHTML = '';
    const firstOfMonth = new Date(y, m, 1);
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const leadOffset = firstOfMonth.getDay();
    const today = new Date();
    const isToday = (d) => d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
    const isPastMonth = (y < today.getFullYear()) || (y === today.getFullYear() && m < today.getMonth());

    for(let i = 0; i < leadOffset; i++){
      const btn = document.createElement('button');
      btn.style.visibility = 'hidden';
      btn.disabled = true;
      daysEl.appendChild(btn);
    }
    for(let day = 1; day <= daysInMonth; day++){
      const dow = (leadOffset + day - 1) % 7;
      const isWeekend = dow === 5 || dow === 6;
      const isPastDay = isPastMonth || (y === today.getFullYear() && m === today.getMonth() && day < today.getDate());
      const disabled = isWeekend || isPastDay;
      const key = `${y}-${m}-${day}`;
      const selected = selectedDay === key;
      let style = 'aspect-ratio:1;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;background:transparent;border:1.5px solid transparent;cursor:pointer;transition:all .2s;';
      if(disabled) style += 'color:var(--text-faint);text-decoration:line-through;cursor:not-allowed;';
      else style += 'color:var(--text);';
      if(selected) style += 'border-color:var(--accent);color:var(--accent);font-weight:700;';
      else if(isToday(day) && !disabled) style += 'border-color:var(--glass-border);';
      const btn = document.createElement('button');
      btn.style.cssText = style;
      btn.textContent = String(day);
      btn.disabled = disabled;
      if(!disabled) btn.addEventListener('click', () => { selectedDay = key; renderCalendar(); });
      daysEl.appendChild(btn);
    }
  }
  document.getElementById('calPrev').addEventListener('click', () => { calMonth--; renderCalendar(); });
  document.getElementById('calNext').addEventListener('click', () => { calMonth++; renderCalendar(); });
  document.addEventListener('busla:lang', renderCalendar);
  renderCalendar();

  // ===== Keyboard navigation for carousel =====
  window.addEventListener('keydown', (e) => {
    if(modal.style.display === 'flex'){ if(e.key === 'Escape') window.Home.closeModal(); return; }
    const lang = window.Busla.getLang();
    if(e.key === 'ArrowLeft') lang === 'ar' ? nextCard() : prevCard();
    else if(e.key === 'ArrowRight') lang === 'ar' ? prevCard() : nextCard();
  });
})();
