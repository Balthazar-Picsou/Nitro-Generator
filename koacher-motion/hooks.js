// Builds the data-driven parts of the DOM (before engine.js parses animations)
// and defines per-frame hooks for scenes that need custom motion.
(() => {
  const D = window.DATA;
  const $ = s => document.querySelector(s);
  const h = (tag, cls, html, attrs = {}) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const C = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const P = (lt, d, dur) => C((lt - d) / dur);
  const L = (a, b, p) => a + (b - a) * p;
  const inout = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const expo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const back = t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const fr = v => String(v).replace('.', ',');

  // ---------- 07 : CA & répartition ----------
  {
    const chart = $('#ca-chart');
    const known = D.ca.every(c => c.value != null);
    if (known) $('#ca-todo').remove();
    const max = known ? Math.max(...D.ca.map(c => c.value)) : 1;
    const W = 564, H = 466, slot = W / D.ca.length;
    chart.appendChild(h('div', 'caaxis'));
    D.ca.forEach((c, k) => {
      const ratio = known ? c.value / max : [0.42, 0.62, 0.85][k] || 0.6;
      const bh = (H - 110) * ratio;
      const x = slot * k + (slot - 120) / 2;
      const bar = h('div', 'cabar' + (known ? '' : ' ph'), null, { 'data-a': `growY ${1.3 + k * 0.2} 0.9`, style: `left:${x}px;height:${bh}px` });
      const val = h('div', 'caval', known ? `${fr(c.value)} ${D.caUnit}` : `— ${D.caUnit}`, { 'data-a': `up ${1.9 + k * 0.2} 0.6`, style: `left:${x - 20}px;bottom:${44 + bh + 12}px;color:${known ? 'var(--bdx)' : '#b3a8ad'}` });
      chart.append(bar, val, h('div', 'cayear', c.year, { style: `left:${x}px` }));
    });

    const box = $('#donut');
    const rk = D.repartition.every(r => r.value != null);
    if (rk) $('#rep-todo').remove();
    const R = 110, SW = 44, CIRC = 2 * Math.PI * R;
    let acc = 0, segs = '';
    D.repartition.forEach((r, k) => {
      const frac = rk ? r.value / 100 : 1 / D.repartition.length;
      const len = Math.max(0, frac * CIRC - 6);
      segs += `<circle cx="140" cy="140" r="${R}" fill="none" stroke="${rk ? r.color : ['#ead7df', '#dcc3cd', '#cfb2be'][k]}" stroke-width="${SW}" stroke-dasharray="${len} ${CIRC}" stroke-dashoffset="${-acc}" transform="rotate(-90 140 140)" data-a="fade ${1.4 + k * 0.25} 0.6"/>`;
      acc += frac * CIRC;
    });
    box.innerHTML = `<svg width="280" height="280" viewBox="0 0 280 280">${segs}<text x="140" y="134" text-anchor="middle" font-family="Plus Jakarta Sans" font-weight="800" font-size="30" fill="#141214">CA</text><text x="140" y="164" text-anchor="middle" font-family="Plus Jakarta Sans" font-weight="600" font-size="17" fill="#625b5f">par typologie</text></svg>`;
    const leg = h('div', null, null, { style: 'margin-top:26px', 'data-st': 'left 2.0 0.12 0.5' });
    D.repartition.forEach((r, k) => {
      leg.appendChild(h('div', 'dleg', `<div class="sw" style="background:${rk ? r.color : ['#ead7df', '#dcc3cd', '#cfb2be'][k]}"></div>${r.label}<div class="v"${rk ? '' : ' style="color:#b3a8ad"'}>${rk ? fr(r.value) : '—'}&nbsp;%</div>`));
    });
    box.appendChild(leg);
  }

  // ---------- 13 : Gantt ----------
  const G = { x0: 610, x1: 1630, top: 72, pitch: 53 };
  const gx = d => G.x0 + (d + 30) / 40 * (G.x1 - G.x0);
  const gantt = $('#gantt');
  const gEls = [];
  {
    D.ganttTicks.forEach(t => {
      gantt.appendChild(h('div', 'g-vline', null, { style: `left:${gx(t)}px` }));
      gantt.appendChild(h('div', 'g-axis' + (t === 0 ? ' j' : ''), t === 0 ? 'J' : (t > 0 ? `J+${t}` : `J${t}`), { style: `left:${gx(t)}px`, 'data-a': 'fade 1.0 0.6' }));
    });
    D.gantt.forEach((r, k) => {
      const row = h('div', 'g-row', `<div class="g-band"></div>`, { style: `top:${G.top + k * G.pitch}px` });
      row.appendChild(h('div', 'g-lab', `<span class="n">${k + 1}</span>${r.label}`, { 'data-a': `left ${0.9 + k * 0.08} 0.6` }));
      if (r.start != null) {
        const w = gx(r.end) - gx(r.start);
        const b = h('div', 'g-bar' + (r.kind ? ' ' + r.kind : ''), r.text || '', { style: `left:${gx(r.start)}px;width:0px` });
        row.appendChild(b);
        gEls.push({ type: 'bar', n: b, s: r.start, e: r.end, w });
        if (r.note) {
          const nt = h('div', 'g-note', r.note, { style: `left:${gx(r.end) + 12}px` });
          row.appendChild(nt);
          gEls.push({ type: 'note', n: nt, s: r.end });
        }
      }
      (r.ms || []).forEach(d => {
        const m = h('div', 'g-ms' + (r.dark ? ' d' : ''), null, { style: `left:${gx(d)}px` });
        row.appendChild(m);
        gEls.push({ type: 'ms', n: m, s: d });
      });
      if (r.star != null) {
        const s = h('div', 'g-star', `<i data-icon="star"></i>KOACHER Club`, { style: `left:${gx(r.star)}px` });
        row.appendChild(s);
        gEls.push({ type: 'star', n: s, s: r.star });
      }
      gantt.appendChild(row);
    });
    gantt.appendChild(h('div', 'g-now', '<span>J-30</span>', { id: 'g-now' }));
  }

  // ---------- 14 : flow dots ----------
  const flowSvg = $('.flow-svg');
  const flowPaths = [...flowSvg.querySelectorAll('.fl')];
  const flowDots = flowPaths.map(() => { const d = h('div', 'flow-dot'); flowSvg.parentNode.appendChild(d); return d; });

  // ---------- 29 : SIC cycle dots ----------
  const cycPaths = [...document.querySelectorAll('.cyc-svg .cyc')];
  const cycDots = cycPaths.map(() => { const d = h('div', 'flow-dot'); document.querySelector('.cyc-svg').parentNode.appendChild(d); return d; });

  // ---------- 15 : jour J ----------
  document.querySelectorAll('.dstop').forEach(s => s.setAttribute('data-a', `cardin ${0.7 + 0.72 * +s.dataset.k} 0.8`));

  // ---------- 17 : funnel ----------
  {
    const f = $('#funnel');
    const max = D.funnel[0].n, trackW = 470;
    D.funnel.forEach((r, k) => {
      const d = 1.0 + k * 0.38;
      const row = h('div', 'fn-row', null, { style: `top:${92 + k * 84}px`, 'data-a': `left ${d} 0.6` });
      const w = Math.max(18, trackW * r.n / max);
      row.innerHTML = `<div class="fn-lab"><div class="num"><span data-count="${r.n}" data-cd="${d}" data-cdur="1.1">0</span></div><div class="h3">${r.label}</div></div>` +
        `<div class="fn-track"><div class="fn-bar" style="width:${w}px" data-a="grow ${d + 0.1} 0.8"></div>` +
        (r.rate ? `<div class="fn-rate" style="left:${w + 16}px" data-a="pop ${d + 0.6} 0.5">${Math.round(r.n / D.funnel[k - 1].n * 100)}&nbsp;% <span>${r.rate}</span></div>` : '') + `</div>`;
      f.appendChild(row);
    });
  }

  // ---------- 18 : KPI table ----------
  {
    const t = $('#kpi-table');
    t.appendChild(h('div', 'kt-row hd', '<div>Indicateur</div><div>Objectif</div><div>Résultat</div><div>Atteinte</div><div>Statut</div>'));
    const ST = { good: ['check', 'Atteint'], mid: ['circle-alert', 'Presque'], bad: ['x', 'Non atteint'] };
    const COL = { good: 'var(--ok)', mid: 'var(--warn)', bad: 'var(--ko)' };
    D.kpis.forEach((r, k) => {
      const d = 1.0 + k * 0.32;
      const fill = r.pct == null ? '' : `<div class="kt-track"><div class="kt-fill" style="width:${Math.min(r.pct, 125) / 125 * 300}px;background:${COL[r.status]}" data-a="grow ${d + 0.3} 0.9"></div><div class="kt-ref" style="left:${100 / 125 * 300}px"></div></div><span class="kt-pct" style="color:${COL[r.status]}">${r.pct}&nbsp;%</span>`;
      const res = `<div class="res"${r.res.length > 8 ? ' style="font-size:19px"' : ''}>${r.res}</div>`;
      t.appendChild(h('div', 'kt-row',
        `<div class="ind"><i data-icon="${r.icon}"></i>${r.label}</div><div class="obj">${r.obj}</div>${res}<div>${fill || '<span class="muted" style="font-size:17px">mobilisés pendant la prospection</span>'}</div>` +
        `<div><span class="st ${r.status}" data-a="pop ${d + 0.6} 0.5"><i data-icon="${ST[r.status][0]}"></i>${ST[r.status][1]}</span></div>`,
        { 'data-a': `left ${d} 0.6` }));
    });
  }

  // ---------- per-frame hooks ----------
  window.HOOKS = {
    portfolio(lt) {
      const up = expo(P(lt, 0.9, 1.4));
      const down = inout(P(lt, 2.2, 3.2));
      const v = down > 0 ? L(7000, 30, down) : L(0, 7000, up);
      $('#pf-count').textContent = window.fmt(Math.round(v)) + (down === 0 && up > 0.98 ? '+' : '');
      $('#pf-fill').style.transform = `scaleX(${Math.max(0.006, v / 7000)})`;
      // caption crossfades: départ -> filtrage -> cible finale
      const CAPS = [
        ['contacts au départ', 'Base Pipedrive + extraction LinkedIn Sales Navigator'],
        ['contacts après filtrage', 'Doublons et hors cible retirés, filtres appliqués'],
        ['décideurs ciblés', 'qualifiés et suivis dans Pipedrive'],
      ];
      const s1 = P(lt, 2.0, 0.5), s2 = P(lt, 5.3, 0.6);
      const sw = s2 > 0 ? s2 : s1;
      const k = s2 >= 0.5 ? 2 : s1 >= 0.5 ? 1 : 0;
      const cap = $('#pf-cap'), cap2 = $('#pf-cap2');
      cap.textContent = CAPS[k][0];
      cap2.textContent = CAPS[k][1];
      cap.style.opacity = cap2.style.opacity = sw > 0 && sw < 1 ? Math.abs(sw - 0.5) * 2 : 1;
    },

    gantt(lt) {
      const day = L(-30.5, 10.5, inout(P(lt, 1.3, 6.0)));
      const now = $('#g-now');
      now.style.left = gx(day) + 'px';
      now.style.opacity = C(P(lt, 1.1, 0.3)) * (1 - P(lt, 7.6, 0.6));
      const r = Math.round(day);
      now.firstChild.textContent = r === 0 ? 'Jour J' : r > 0 ? `J+${r}` : `J${r}`;
      gEls.forEach(g => {
        if (g.type === 'bar') {
          g.n.style.width = C((day - g.s) / (g.e - g.s)) * g.w + 'px';
          g.n.style.opacity = day > g.s ? 1 : 0;
        } else if (g.type === 'note') {
          g.n.style.opacity = C((day - g.s) / 2);
        } else {
          const p = C((day - g.s) / 1.4);
          const sc = p > 0 ? back(p) : 0;
          g.n.style.opacity = C(p * 3);
          g.n.style.transform = (g.type === 'ms' ? 'rotate(45deg) ' : '') + `scale(${sc})`;
        }
      });
    },

    flow(lt) {
      flowPaths.forEach((p, k) => {
        const start = +p.dataset.a.split(' ')[1] + 0.8;
        const len = p.getTotalLength();
        const t = lt - start;
        const dot = flowDots[k];
        if (t < 0) { dot.style.opacity = 0; return; }
        const f = (t / 1.6) % 1;
        const pt = p.getPointAtLength(inout(f) * len);
        dot.style.left = pt.x + 'px';
        dot.style.top = pt.y + 'px';
        dot.style.opacity = Math.sin(f * Math.PI);
      });
    },

    dayline(lt) {
      const p = inout(P(lt, 0.7, 3.6));
      $('#dl-fill').style.transform = `scaleX(${p})`;
      const dot = $('#dl-dot');
      dot.style.left = 251 + 1418 * p + 'px';
      dot.style.opacity = C(P(lt, 0.5, 0.3));
    },

    cycle(lt) {
      cycPaths.forEach((p, k) => {
        const start = +p.dataset.a.split(' ')[1] + 0.7;
        const t = lt - start;
        const dot = cycDots[k];
        if (t < 0) { dot.style.opacity = 0; return; }
        const f = (t / 1.8) % 1;
        const pt = p.getPointAtLength(inout(f) * p.getTotalLength());
        dot.style.left = pt.x + 'px';
        dot.style.top = pt.y + 'px';
        dot.style.opacity = Math.sin(f * Math.PI);
      });
    },

    network(lt) {
      const c = document.querySelector('.ncenter');
      const s = 14 + 8 * (0.5 + 0.5 * Math.sin(lt * 2.2));
      c.style.boxShadow = `0 0 0 ${s}px rgba(214,45,90,.08), 0 24px 50px -20px rgba(113,0,29,.5)`;
    },
  };
})();
