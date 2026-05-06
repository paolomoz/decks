/* ══════════════════════════════════════════════════════════════════
   EMA v3 — visual effects library
   - Stardust starfield (cover, lab)
   - Adobe-piñata particle shader (cover, optional)
   - Counters, typewriter, reveal-on-scroll, cursor glow
   ══════════════════════════════════════════════════════════════════ */

/* ── Starfield ─────────────────────────────────────────────────── */
function startStarfield(canvasId, opts = {}) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const cfg = Object.assign({
    density: 1, color1: '#FFD98A', color2: '#E8B95E', color3: '#9b8aff',
    twinkle: true, drift: 0.04
  }, opts);

  let stars = [], dust = [], W, H;
  function resize() {
    W = c.width = c.clientWidth * devicePixelRatio;
    H = c.height = c.clientHeight * devicePixelRatio;
    const count = Math.min(220, Math.floor((W * H) / 18000)) * cfg.density;
    stars = Array.from({ length: count }, spawnStar);
    const dustCount = Math.min(80, Math.floor((W * H) / 50000));
    dust = Array.from({ length: dustCount }, spawnDust);
  }
  function spawnStar() {
    const palette = [cfg.color1, cfg.color2, cfg.color3];
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.6 * devicePixelRatio + 0.3, a: Math.random(),
      ad: (Math.random() * 0.012 + 0.002) * (Math.random() < 0.5 ? -1 : 1),
      vx: (Math.random() - 0.5) * cfg.drift, vy: (Math.random() - 0.5) * cfg.drift,
      c: palette[Math.floor(Math.random() * palette.length)]
    };
  }
  function spawnDust() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 18 + 6) * devicePixelRatio,
      a: Math.random() * 0.06 + 0.02,
      vx: (Math.random() - 0.5) * 0.08, vy: (Math.random() - 0.5) * 0.08
    };
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const d of dust) {
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 6);
      g.addColorStop(0, `rgba(232, 185, 94, ${d.a})`);
      g.addColorStop(1, 'rgba(232, 185, 94, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 6, 0, Math.PI * 2); ctx.fill();
      d.x += d.vx; d.y += d.vy;
      if (d.x < -200) d.x = W + 200; if (d.x > W + 200) d.x = -200;
      if (d.y < -200) d.y = H + 200; if (d.y > H + 200) d.y = -200;
    }
    for (const s of stars) {
      if (cfg.twinkle) { s.a += s.ad; if (s.a < 0.1 || s.a > 1) s.ad *= -1; }
      ctx.fillStyle = s.c; ctx.globalAlpha = s.a;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = s.a * 0.18;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      s.x += s.vx; s.y += s.vy;
      if (s.x < -10) s.x = W + 10; if (s.x > W + 10) s.x = -10;
      if (s.y < -10) s.y = H + 10; if (s.y > H + 10) s.y = -10;
    }
    requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener('resize', resize);
  frame();
}

/* ── Embers shader (AI Factory style) ─────────────────────────── */
/* Embers + orbs + streaks with mouse attraction. Adapted for stardust palette. */
function startEmbers(canvasId, opts = {}) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const cfg = Object.assign({
    palette: ['#FFD98A', '#E8B95E', '#C9822D', '#fff5d6', '#ffffff', '#9b8aff'],
    count: 140
  }, opts);

  let W, H, pts = [];
  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  function mkPt() {
    const t = Math.random();
    const color = cfg.palette[Math.floor(Math.random() * cfg.palette.length)];
    if (t < 0.55) {
      return { type: 'ember', x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: -Math.random() * 0.45 - 0.08,
        r: Math.random() * 2.4 + 0.8, a: Math.random() * 0.5 + 0.18,
        decay: Math.random() * 0.0028 + 0.0009, c: color,
        wobble: Math.random() * 0.02, wobbleOffset: Math.random() * Math.PI * 2 };
    } else if (t < 0.85) {
      return { type: 'orb', x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18, vy: -Math.random() * 0.22 - 0.04,
        r: Math.random() * 4.5 + 2.2, a: Math.random() * 0.27 + 0.07,
        decay: Math.random() * 0.0018 + 0.0005, c: color };
    } else {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
      const speed = Math.random() * 1.4 + 0.4;
      return { type: 'streak', x: Math.random() * W, y: H + 10,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        len: Math.random() * 28 + 14, r: 1,
        a: Math.random() * 0.55 + 0.28,
        decay: Math.random() * 0.0045 + 0.0018, c: color };
    }
  }

  for (let i = 0; i < cfg.count; i++) pts.push(mkPt());

  let frame = 0;
  (function loop() {
    frame++;
    ctx.clearRect(0, 0, W, H);
    if (frame % 50 === 0) for (let i = 0; i < 4; i++) pts.push(mkPt());

    pts.forEach((p, i) => {
      if (p.type === 'ember') {
        if (window.mouseX > 0) {
          const mdx = window.mouseX - p.x, mdy = window.mouseY - p.y;
          const md = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
          const att = Math.min(500 / (md * md), 0.10);
          p.vx += mdx / md * att; p.vy += mdy / md * att;
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > 1.4) { p.vx = p.vx / spd * 1.4; p.vy = p.vy / spd * 1.4; }
        }
        p.x += p.vx + Math.sin(frame * p.wobble + p.wobbleOffset) * 0.5;
        p.y += p.vy; p.a -= p.decay;
        if (p.a <= 0 || p.y < -20) { pts[i] = mkPt(); return; }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        g.addColorStop(0, p.c); g.addColorStop(0.4, p.c); g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.globalAlpha = p.a * 0.3; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
      } else if (p.type === 'orb') {
        if (window.mouseX > 0) {
          const mdx = window.mouseX - p.x, mdy = window.mouseY - p.y;
          const md = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
          const att = Math.min(500 / (md * md), 0.10);
          p.vx += mdx / md * att; p.vy += mdy / md * att;
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > 1.4) { p.vx = p.vx / spd * 1.4; p.vy = p.vy / spd * 1.4; }
        }
        p.x += p.vx; p.y += p.vy; p.a -= p.decay;
        if (p.a <= 0 || p.y < -30) { pts[i] = mkPt(); return; }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, 'rgba(255,255,255,0.9)');
        g.addColorStop(0.2, p.c);
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.globalAlpha = p.a * 0.5; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.globalAlpha = p.a * 0.85; ctx.fill();
      } else {
        p.x += p.vx; p.y += p.vy; p.a -= p.decay;
        if (p.a <= 0 || p.y < -50) { pts[i] = mkPt(); return; }
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * (p.len / Math.abs(p.vy || 1)), p.y - p.vy * (p.len / Math.abs(p.vy || 1)));
        const sg = ctx.createLinearGradient(p.x, p.y, p.x - p.vx * p.len, p.y - p.vy * p.len);
        sg.addColorStop(0, p.c); sg.addColorStop(1, 'transparent');
        ctx.strokeStyle = sg; ctx.lineWidth = 1.4;
        ctx.globalAlpha = p.a; ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mousemove', e => { window.mouseX = e.clientX; window.mouseY = e.clientY; });
}

/* ── Counter ─────────────────────────────────────────────────── */
function animateCounter(el, target, duration = 1800, suffix = '', prefix = '', decimals = 0) {
  const start = performance.now();
  function step(t) {
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = target * eased;
    el.textContent = prefix + (decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function autoCount() {
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        const target = parseFloat(e.target.dataset.count);
        const decimals = parseInt(e.target.dataset.decimals || '0');
        const dur = parseInt(e.target.dataset.duration || '1600');
        const suffix = e.target.dataset.suffix || '';
        const prefix = e.target.dataset.prefix || '';
        animateCounter(e.target, target, dur, suffix, prefix, decimals);
      }
    }
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

/* ── Typewriter ────────────────────────────────────────────── */
function typewriter(el, lines, opts = {}) {
  const cfg = Object.assign({ charDelay: 28, lineDelay: 280, loop: false, onLine: null, onDone: null }, opts);
  let i = 0;
  function nextLine() {
    if (i >= lines.length) {
      if (cfg.loop) { i = 0; el.innerHTML = ''; setTimeout(nextLine, 800); }
      else if (cfg.onDone) cfg.onDone();
      return;
    }
    const line = lines[i++];
    const span = document.createElement('div');
    span.className = 'tw-line';
    el.appendChild(span);
    let j = 0;
    function tick() {
      if (j <= line.length) {
        span.innerHTML = line.slice(0, j) + '<span class="tw-cursor">▌</span>';
        j++;
        setTimeout(tick, cfg.charDelay);
      } else {
        span.innerHTML = line;
        if (cfg.onLine) cfg.onLine(i - 1, line, span);
        setTimeout(nextLine, cfg.lineDelay);
      }
    }
    tick();
  }
  nextLine();
}
function autoTypewriter() {
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !e.target.dataset.typed) {
        e.target.dataset.typed = '1';
        try {
          const lines = JSON.parse(e.target.dataset.lines);
          typewriter(e.target, lines, {
            charDelay: parseInt(e.target.dataset.charDelay || '24'),
            lineDelay: parseInt(e.target.dataset.lineDelay || '240'),
            loop: e.target.dataset.loop === '1'
          });
        } catch (err) { console.error(err); }
      }
    }
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-lines]').forEach(el => observer.observe(el));
}

/* ── Reveal on scroll (fires on enter even if no scroll) ─── */
function autoReveal() {
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
      }
    }
  }, { threshold: 0.05 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── Cursor glow ─────────────────────────────────────────── */
function attachCursorGlow(color = 'rgba(255, 217, 138, 0.07)') {
  let glow = document.getElementById('cursor-glow');
  if (!glow) {
    glow = document.createElement('div');
    glow.id = 'cursor-glow';
    glow.style.cssText = `
      position:fixed;width:600px;height:600px;border-radius:50%;
      background:radial-gradient(circle, ${color} 0%, transparent 70%);
      pointer-events:none;z-index:0;transform:translate(-50%,-50%);
      transition:left .12s,top .12s;left:50%;top:50%;`;
    document.body.appendChild(glow);
  }
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

/* ── Confetti burst on click ──────────────────────────── */
function confettiBurst(originEl, palette = ['#FFD98A', '#E8B95E', '#C9822D', '#fff', '#9b8aff']) {
  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  for (let i = 0; i < 26; i++) {
    const c = document.createElement('div');
    const dx = (Math.random() - 0.5) * 360;
    const dy = -Math.random() * 280 - 80;
    const rot = (Math.random() - 0.5) * 720;
    const dur = Math.random() * 1.4 + 1.2;
    const del = Math.random() * 0.18;
    c.style.cssText = `
      position:fixed;left:${cx}px;top:${cy}px;width:7px;height:11px;
      background:${palette[Math.floor(Math.random() * palette.length)]};
      border-radius:2px;pointer-events:none;z-index:9998;
      transform:translate(0,0) rotate(0);opacity:1;
      animation:confDrop ${dur}s ease-in ${del}s forwards;
      --dx:${dx}px;--dy:${dy}px;--rot:${rot}deg;`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), (dur + del) * 1000 + 200);
  }
}

/* ── Auto-init ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  autoCount();
  autoTypewriter();
  autoReveal();
});
