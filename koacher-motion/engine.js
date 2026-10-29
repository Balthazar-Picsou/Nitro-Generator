// Deterministic timeline: every frame is a pure function of (scene, local time).
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const E = {
    lin: t => t,
    out: t => 1 - Math.pow(1 - t, 4),
    expo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inout: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    back: t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  };
  const prog = (lt, d, dur) => clamp((lt - d) / dur);
  const fmt = (v, dec = 0) => {
    let [i, d] = Math.abs(v).toFixed(dec).split('.');
    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (v < 0 ? '−' : '') + (d ? i + ',' + d : i);
  };
  Object.assign(window, { clamp, lerp, E, prog, fmt });

  const LIGHT = '#f4f2f3', DARK = '#14020a';
  const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${(window.ICONS || {})[n] || ''}</svg>`;
  window.icon = icon;

  const SEAMS = {
    bdx: '<path d="M50 0C38 30 38 70 50 100M0 50h100M14 13c22 22 22 52 0 74M86 13c-22 22-22 52 0 74" stroke="rgba(0,0,0,.38)" stroke-width="1.6" fill="none"/>',
    blk: '<path d="M50 0C38 30 38 70 50 100M0 50h100M14 13c22 22 22 52 0 74M86 13c-22 22-22 52 0 74" stroke="rgba(255,255,255,.10)" stroke-width="1.6" fill="none"/>',
    wht: '<path d="M50 50C50 26 36 10 18 13M50 50c22-10 40-3 46 12M50 50C40 72 44 89 56 99M44 3c8 14 9 30 6 47M95 40c-16-6-31-4-45 10M8 72c14 2 28-6 42-22" stroke="rgba(120,90,95,.35)" stroke-width="1.4" fill="none"/>',
    pnk: '<path d="M12 18c26 14 26 50 0 64M88 18c-26 14-26 50 0 64" stroke="rgba(255,255,255,.75)" stroke-width="2.6" fill="none"/>',
    lil: '<path d="M12 18c26 14 26 50 0 64M88 18c-26 14-26 50 0 64" stroke="rgba(255,255,255,.9)" stroke-width="2.6" fill="none"/>',
  };

  const stage = document.getElementById('stage');
  const underlay = document.getElementById('underlay');

  // ---- static decoration ----
  document.querySelectorAll('[data-icon]').forEach(n => { n.innerHTML = icon(n.dataset.icon); });
  document.querySelectorAll('.ball').forEach(b => {
    const k = Object.keys(SEAMS).find(c => b.classList.contains(c));
    b.innerHTML = `<svg viewBox="0 0 100 100"><g class="seam">${SEAMS[k] || ''}</g></svg>`;
  });

  const scenes = [...document.querySelectorAll('.scene')];
  let acc = 0;
  const S = scenes.map((el, i) => {
    const dur = parseFloat(el.dataset.dur);
    const s = { el, i, dur, start: acc, name: el.dataset.name || `scene_${i + 1}`, theme: el.classList.contains('dark') ? 'dark' : 'light', items: [], counts: [], floats: [], spins: [], hook: el.dataset.hook };
    acc += dur;

    // background: padel court line art (20 m x 10 m, net and service lines) + bordeaux disc
    const bg = document.createElement('div');
    bg.className = 'bg';
    bg.innerHTML = '<svg class="court" viewBox="0 0 2000 1000"><rect x="0" y="0" width="2000" height="1000"/>' +
      '<line class="net" x1="1000" y1="0" x2="1000" y2="1000"/><line x1="305" y1="0" x2="305" y2="1000"/>' +
      '<line x1="1695" y1="0" x2="1695" y2="1000"/><line x1="305" y1="500" x2="1695" y2="500"/></svg>' +
      '<div class="ring"></div><div class="disc"></div><div class="grain"></div>';
    s.disc = bg.querySelector('.disc');
    el.prepend(bg);

    // chrome
    if (el.dataset.chrome !== 'none') {
      const [num, txt] = (el.dataset.label || '').split('|');
      const ch = document.createElement('div');
      ch.className = 'chrome';
      ch.innerHTML = `<div class="logo"></div>` +
        (txt ? `<div class="seclabel"><b>${num}</b>${txt}</div>` : num ? `<div class="seclabel">${num}</div>` : '') +
        `<div class="pill"><div class="tk">${icon('ticket')}</div><div>Le ticket resto du <span>sport &amp; du bien-être</span></div></div>`;
      el.insertBefore(ch, el.querySelector('.content'));
    }
    s.content = el.querySelector('.content');

    // word splitting
    el.querySelectorAll('[data-w]').forEach(h => {
      const d = parseFloat(h.dataset.w), st = parseFloat(h.dataset.ws || '0.055'), ty = h.dataset.wt || 'blur';
      const words = [];
      const walk = node => {
        [...node.childNodes].forEach(ch => {
          if (ch.nodeType === 3) {
            const frag = document.createDocumentFragment();
            ch.textContent.split(/([ \n\t]+)/).forEach(p => {
              if (!p) return;
              if (/^[ \n\t]+$/.test(p)) frag.appendChild(document.createTextNode(' '));
              else { const sp = document.createElement('span'); sp.className = 'wd'; sp.textContent = p; frag.appendChild(sp); words.push(sp); }
            });
            node.replaceChild(frag, ch);
          } else if (ch.nodeType === 1 && ch.tagName !== 'BR') {
            if (ch.hasAttribute('data-unit')) { ch.classList.add('wd'); words.push(ch); }
            else walk(ch);
          }
        });
      };
      walk(h);
      words.forEach((w, k) => s.items.push({ n: w, type: ty, d: d + k * st, dur: 0.7 }));
    });

    // staggered children
    el.querySelectorAll('[data-st]').forEach(p => {
      const [ty, d, step, dur] = p.dataset.st.split(/\s+/);
      [...p.children].forEach((c, k) => s.items.push({ n: c, type: ty, d: +d + k * +step, dur: +dur || 0.7 }));
    });

    el.querySelectorAll('[data-a]').forEach(n => {
      const [ty, d, dur] = n.dataset.a.split(/\s+/);
      s.items.push({ n, type: ty, d: +d || 0, dur: +dur || (ty === 'draw' ? 1.2 : 0.75) });
    });
    el.querySelectorAll('[data-count]').forEach(n => {
      s.counts.push({ n, to: +n.dataset.count, from: +(n.dataset.from || 0), d: +(n.dataset.cd || 0), dur: +(n.dataset.cdur || 1.6), dec: +(n.dataset.dec || 0), pre: n.dataset.pre || '', suf: n.dataset.suf || '' });
    });
    el.querySelectorAll('[data-float]').forEach(n => {
      const [amp, per, ph, rot] = n.dataset.float.split(/\s+/).map(Number);
      s.floats.push({ n, amp, per, ph: ph || 0, rot: rot || 0 });
    });
    el.querySelectorAll('.ball .seam').forEach((g, k) => s.spins.push({ g, sp: (k % 2 ? -1 : 1) * (8 + (k * 7) % 11) }));
    return s;
  });

  function apply(it, lt) {
    const { n, type } = it;
    const raw = prog(lt, it.d, it.dur);
    const st = n.style;
    let p;
    switch (type) {
      case 'fade': st.opacity = E.out(raw); break;
      case 'up': p = E.out(raw); st.opacity = clamp(raw * 2); st.transform = `translate3d(0,${(1 - p) * 44}px,0)`; break;
      case 'down': p = E.out(raw); st.opacity = clamp(raw * 2); st.transform = `translate3d(0,${-(1 - p) * 44}px,0)`; break;
      case 'left': p = E.out(raw); st.opacity = clamp(raw * 2); st.transform = `translate3d(${-(1 - p) * 70}px,0,0)`; break;
      case 'right': p = E.out(raw); st.opacity = clamp(raw * 2); st.transform = `translate3d(${(1 - p) * 70}px,0,0)`; break;
      case 'blur': p = E.out(raw); st.opacity = clamp(raw * 1.6); st.transform = `translate3d(0,${(1 - p) * 0.4}em,0)`; st.filter = p < 1 ? `blur(${(1 - p) * 14}px)` : 'none'; break;
      case 'cardin': p = E.out(raw); st.opacity = clamp(raw * 1.8); st.transform = `translate3d(0,${(1 - p) * 60}px,0) scale(${0.96 + 0.04 * p})`; st.filter = p < 1 ? `blur(${(1 - p) * 10}px)` : 'none'; break;
      case 'pop': p = E.back(raw); st.opacity = clamp(raw * 3); st.transform = `scale(${lerp(0.4, 1, p)})`; break;
      case 'scale': p = E.out(raw); st.opacity = clamp(raw * 2); st.transform = `scale(${lerp(0.85, 1, p)})`; break;
      case 'wipe': p = E.inout(raw); st.clipPath = p < 1 ? `inset(-20% ${(1 - p) * 100}% -20% 0)` : 'none'; break;
      case 'wipeup': p = E.out(raw); st.clipPath = p < 1 ? `inset(${(1 - p) * 100}% -10% -10% -10%)` : 'none'; st.transform = `translate3d(0,${(1 - p) * 30}px,0)`; break;
      case 'grow': p = E.inout(raw); st.transform = `scaleX(${p})`; st.transformOrigin = 'left center'; break;
      case 'growY': p = E.inout(raw); st.transform = `scaleY(${p})`; st.transformOrigin = 'center bottom'; break;
      case 'draw': {
        if (it.len == null) it.len = n.getTotalLength ? n.getTotalLength() : 0;
        p = E.inout(raw); st.strokeDasharray = it.len; st.strokeDashoffset = it.len * (1 - p); break;
      }
    }
  }

  function renderScene(i, lt, exitP = 0) {
    S.forEach((s, j) => { s.el.style.display = j === i ? 'block' : 'none'; });
    const s = S[i];
    s.items.forEach(it => apply(it, lt));
    s.counts.forEach(c => {
      const p = E.expo(prog(lt, c.d, c.dur));
      c.n.textContent = c.pre + fmt(lerp(c.from, c.to, p), c.dec) + c.suf;
    });
    s.floats.forEach(f => {
      const a = Math.PI * 2 * (lt / f.per) + f.ph;
      f.n.style.transform = `translate3d(0,${Math.sin(a) * f.amp}px,0) rotate(${Math.sin(a * 0.8) * f.rot}deg)`;
    });
    s.spins.forEach(sp => { sp.g.setAttribute('transform', `rotate(${lt * sp.sp} 50 50)`); });
    s.disc.style.transform = `translate3d(${Math.sin(lt * 0.25) * 14}px,${Math.cos(lt * 0.2) * 10}px,0)`;
    if (s.hook && window.HOOKS && HOOKS[s.hook]) HOOKS[s.hook](lt, s.el, s);

    // theme change: iris reveal over the previous background
    const prev = S[i - 1];
    if (prev && prev.theme !== s.theme && lt < 0.9) {
      underlay.style.background = prev.theme === 'dark' ? DARK : LIGHT;
      const p = E.inout(clamp(lt / 0.9));
      s.el.style.clipPath = `circle(${p * 76}% at 50% 55%)`;
    } else {
      underlay.style.background = s.theme === 'dark' ? DARK : LIGHT;
      s.el.style.clipPath = 'none';
    }

    // exit tail (used only for the continuous master video)
    if (s.content) {
      const p = E.inout(exitP);
      s.content.style.opacity = 1 - p;
      s.content.style.filter = p > 0 ? `blur(${p * 12}px)` : 'none';
      s.content.style.transform = p > 0 ? `translate3d(0,${-p * 26}px,0)` : 'none';
    }
  }

  function seek(t) {
    let i = S.findIndex(s => t < s.start + s.dur);
    if (i < 0) i = S.length - 1;
    renderScene(i, t - S[i].start);
  }

  window.SCENES = S.map(s => ({ name: s.name, dur: s.dur, start: s.start }));
  window.TOTAL = acc;
  Object.assign(window, { renderScene, seek });

  // preview helpers: ?scene=3&t=5  |  ?t=42  |  ?play
  const q = new URLSearchParams(location.search);
  if (q.has('scene')) renderScene(+q.get('scene') - 1, +(q.get('t') || 99));
  else if (q.has('play')) {
    const t0 = performance.now() - (+(q.get('t') || 0)) * 1000;
    const loop = () => { seek(((performance.now() - t0) / 1000) % acc); requestAnimationFrame(loop); };
    loop();
  } else seek(+(q.get('t') || 0));
})();
