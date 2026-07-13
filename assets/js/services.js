// Busla — services page: stack cards, scroll shrink motion, service detail overlay
(function(){
  const SERVICES = window.BuslaData.SERVICES;
  const ICONS = {
    compass:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
    rocket:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>',
    code:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    deck:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="m7 11 3-3 2 2 4-4"></path></svg>'
  };
  const CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex:none;"><path d="M20 6 9 17l-5-5"></path></svg>';

  const stackEl = document.getElementById('servicesStack');
  const detailEl = document.getElementById('serviceDetail');
  const cardEls = [];

  function priceBlockHtml(s, big){
    if(s.priceOnRequest){
      return `<div style="font-size:12px;color:var(--text-faint);margin-bottom:4px;">السعر</div>
        <div style="font-size:${big?22:20}px;font-weight:700;color:var(--accent);letter-spacing:-.01em;">يعتمد على المشروع — تواصل معنا</div>`;
    }
    return `<div style="font-size:12px;color:var(--text-faint);margin-bottom:4px;">ابتداءً من</div>
      <div style="display:flex;align-items:baseline;gap:10px;">
        <span style="font-size:${big?16:15}px;color:var(--text-faint);text-decoration:line-through;">${s.oldPrice}</span>
        <span style="font-size:${big?26:24}px;font-weight:700;color:var(--accent);letter-spacing:-.01em;">${s.price}</span>
      </div>`;
  }

  SERVICES.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'stack-card';
    card.style.cssText = `z-index:${i+1};margin-bottom:22px;background:var(--surface);border:1px solid var(--glass-border);border-radius:24px;padding:clamp(32px,5vw,56px);min-height:min(70vh,560px);box-shadow:0 30px 70px rgba(0,0,0,.35);display:flex;flex-direction:column;cursor:pointer;transition:transform .3s,border-color .3s,filter .3s;`;
    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:28px;">
        <div style="width:52px;height:52px;border-radius:14px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;flex:none;">${ICONS[s.icon]}</div>
        <div style="font-family:'IBM Plex Mono',monospace;color:var(--text-faint);font-size:13px;">${String(i+1).padStart(2,'0')} / ${String(SERVICES.length).padStart(2,'0')}</div>
      </div>
      <h2 style="margin:0 0 14px;font-weight:500;font-size:clamp(26px,3.6vw,42px);letter-spacing:-.03em;">${s.title}</h2>
      <p style="margin:0 0 28px;color:var(--text-dim);line-height:1.8;font-size:16px;max-width:56ch;">${s.short}</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:auto;padding-top:20px;border-top:1px solid var(--line);">
        ${s.bullets.map(b => `<div style="display:flex;align-items:center;gap:10px;">${CHECK}<span style="font-size:14.5px;color:var(--text-dim);">${b}</span></div>`).join('')}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;background:var(--glass-card);border:1px solid var(--glass-border);border-radius:16px;padding:18px 22px;margin-top:20px;">
        <div>${priceBlockHtml(s, false)}</div>
        <div style="display:flex;align-items:center;gap:8px;color:var(--text-dim);font-size:14px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex:none;"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15.5 14"></polyline></svg>
          <span>${s.duration}</span>
        </div>
      </div>
      <div style="margin-top:24px;display:flex;align-items:center;gap:8px;color:var(--accent);font-size:14px;font-weight:600;">
        <span>التفاصيل الكاملة</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </div>`;
    card.addEventListener('click', () => openService(i));
    stackEl.appendChild(card);
    cardEls.push(card);
  });

  // ===== scroll-driven stack shrink =====
  const shrinkDistance = 170;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  let raf = null;
  function updateStackMotion(){
    if(detailEl.style.display === 'block') { raf = null; return; }
    const stickyTop = window.innerWidth <= 760 ? 70 : 96;
    for(let i = 0; i < cardEls.length - 1; i++){
      const nextRect = cardEls[i+1].getBoundingClientRect();
      const gap = nextRect.top - stickyTop;
      const progress = 1 - clamp01(gap / shrinkDistance);
      const scale = 1 - progress * 0.055;
      const translateY = -progress * 10;
      const brightness = 1 - progress * 0.35;
      cardEls[i].style.transform = `translateY(${translateY}px) scale(${scale})`;
      cardEls[i].style.filter = `brightness(${brightness})`;
    }
    if(cardEls.length){
      const last = cardEls[cardEls.length - 1];
      last.style.transform = 'none';
      last.style.filter = 'none';
    }
    raf = null;
  }
  function onScroll(){ if(raf) return; raf = requestAnimationFrame(updateStackMotion); }
  window.addEventListener('scroll', onScroll, { passive:true });
  document.addEventListener('scroll', onScroll, { passive:true, capture:true });
  window.addEventListener('resize', onScroll, { passive:true });
  updateStackMotion();

  // ===== service detail overlay =====
  function renderDetail(i){
    const s = SERVICES[i];
    document.getElementById('svcIndexLabel').textContent = String(i+1).padStart(2,'0') + ' / ' + String(SERVICES.length).padStart(2,'0');
    document.getElementById('svcTitle').textContent = s.title;
    document.getElementById('svcDescription').textContent = s.description;
    document.getElementById('svcAudience').textContent = s.audience;
    document.getElementById('svcDuration').textContent = s.duration;
    document.getElementById('svcOutcome').textContent = s.outcomeSummary;
    document.getElementById('svcIncludes').innerHTML = s.includes.map(inc => `<span style="font-size:14px;color:var(--text-dim);line-height:1.6;">${inc}</span>`).join('');
    document.getElementById('svcReviewRounds').textContent = s.reviewRounds;
    document.getElementById('svcDeliveryFormat').textContent = s.deliveryFormat;
    document.getElementById('svcPriceBlock').innerHTML = priceBlockHtml(s, true);
    document.getElementById('svcDeliverables').innerHTML = s.deliverables.map(d => `<span style="padding:10px 18px;border-radius:999px;font-size:14px;color:var(--text);background:var(--surface);border:1px solid var(--glass-border);">${d}</span>`).join('');
    document.getElementById('svcHow').innerHTML = s.how.map((st, idx) => `
      <div style="display:flex;gap:20px;padding:22px 0;border-bottom:1px solid var(--line);">
        <div style="font-family:'IBM Plex Mono',monospace;color:var(--accent);font-size:14px;flex:none;width:32px;">${String(idx+1).padStart(2,'0')}</div>
        <div>
          <div style="font-weight:600;font-size:16px;margin-bottom:6px;">${st.title}</div>
          <div style="color:var(--text-dim);font-size:14.5px;line-height:1.7;">${st.desc}</div>
        </div>
      </div>`).join('');
    document.getElementById('svcFaq').innerHTML = s.faq.map(f => `
      <div style="padding:20px 0;border-bottom:1px solid var(--line);">
        <div style="font-weight:600;font-size:15.5px;margin-bottom:8px;">${f.q}</div>
        <div style="color:var(--text-dim);font-size:14px;line-height:1.7;">${f.a}</div>
      </div>`).join('');
  }

  function openService(i, pushHistory){
    renderDetail(i);
    detailEl.style.display = 'block';
    detailEl.style.animation = 'blurFadeUp .4s ease-out';
    window.scrollTo(0,0);
    if(pushHistory !== false) history.pushState({ service:i }, '', '#service-' + i);
  }
  function closeService(){
    detailEl.style.display = 'none';
    if(location.hash) history.back();
  }
  document.getElementById('closeServiceBtn').addEventListener('click', closeService);
  window.addEventListener('popstate', () => {
    const m = /^#service-(\d+)$/.exec(location.hash);
    if(m) openService(parseInt(m[1],10), false);
    else detailEl.style.display = 'none';
  });

  const hashMatch = /^#service-(\d+)$/.exec(location.hash);
  if(hashMatch){
    const idx = parseInt(hashMatch[1], 10);
    if(idx >= 0 && idx < SERVICES.length) openService(idx, false);
  }
})();
