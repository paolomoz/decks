/* ══════════════════════════════════════════════════════════════════
   Digital Insights — effects library
   - Constellation shader (cyan/violet network of nodes + edges)
   - Radar ping (concentric rings burst on click)
   - Reveal-on-scroll, cursor glow
   ══════════════════════════════════════════════════════════════════ */

/* ── Constellation ───────────────────────────────────────────── */
function startConstellation(canvasId, opts = {}) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const cfg = Object.assign({
    density: 1, linkDist: 160, drift: 0.15,
    colorA: '#5fd4ff', colorB: '#c084fc'
  }, opts);

  let nodes = [], W, H;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = c.width = c.clientWidth * dpr;
    H = c.height = c.clientHeight * dpr;
    const count = Math.min(140, Math.floor((W * H) / 28000)) * cfg.density;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * cfg.drift * dpr,
      vy: (Math.random() - 0.5) * cfg.drift * dpr,
      r: (Math.random() * 1.4 + 0.6) * dpr,
      c: Math.random() < 0.55 ? cfg.colorA : cfg.colorB
    }));
  }

  let pulseGlobal = 0;
  window.constellationPulse = () => { pulseGlobal = 1; };

  function frame() {
    ctx.clearRect(0, 0, W, H);
    const linkDistPx = cfg.linkDist * dpr;
    /* edges */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < linkDistPx) {
          const op = (1 - d / linkDistPx) * 0.32;
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, a.c);
          grad.addColorStop(1, b.c);
          ctx.strokeStyle = grad;
          ctx.globalAlpha = Math.min(1, op + pulseGlobal * 0.55);
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    /* nodes */
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -10) n.x = W + 10; if (n.x > W + 10) n.x = -10;
      if (n.y < -10) n.y = H + 10; if (n.y > H + 10) n.y = -10;
      const radius = n.r * (1 + pulseGlobal * 1.6);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = n.c;
      ctx.beginPath(); ctx.arc(n.x, n.y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.18 + pulseGlobal * 0.4;
      ctx.beginPath(); ctx.arc(n.x, n.y, radius * 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    pulseGlobal *= 0.94;
    requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener('resize', resize);
  frame();
}

/* ── Radar ping ─────────────────────────────────────────────── */
function radarPing(originEl, palette = ['#5fd4ff', '#c084fc']) {
  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  for (let i = 0; i < 4; i++) {
    const ring = document.createElement('div');
    const color = palette[i % palette.length];
    ring.style.cssText = `
      position:fixed;left:${cx}px;top:${cy}px;
      width:60px;height:60px;border-radius:50%;
      border:2px solid ${color};
      transform:translate(-50%,-50%) scale(0);
      opacity:1;pointer-events:none;z-index:9998;
      box-shadow:0 0 24px ${color};
      animation:radarRing ${1.6 + i * 0.22}s cubic-bezier(0.22,1,0.36,1) ${i * 0.16}s forwards;`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 2400);
  }
  if (typeof window.constellationPulse === 'function') window.constellationPulse();
}

/* ── Reveal on intersect ─────────────────────────────────── */
function autoReveal() {
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add('revealed');
    }
  }, { threshold: 0.05 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── Cursor glow ────────────────────────────────────────── */
function attachCursorGlow(color = 'rgba(95, 212, 255, 0.06)') {
  let glow = document.getElementById('cursor-glow');
  if (!glow) {
    glow = document.createElement('div');
    glow.id = 'cursor-glow';
    glow.style.cssText = `position:fixed;width:600px;height:600px;border-radius:50%;
      background:radial-gradient(circle,${color} 0%,transparent 70%);
      pointer-events:none;z-index:0;transform:translate(-50%,-50%);
      transition:left .12s,top .12s;left:50%;top:50%;`;
    document.body.appendChild(glow);
  }
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

document.addEventListener('DOMContentLoaded', autoReveal);
