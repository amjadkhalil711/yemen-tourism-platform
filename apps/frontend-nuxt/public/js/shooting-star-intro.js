/**
 * ✦ Shooting Star Intro — Yemen Tourism Website
 * Professional shooting star that flies across the screen once,
 * scatters golden light particles, then points at the chatbot button
 * with a tooltip message before gracefully fading away.
 * Uses sessionStorage so it only runs once per visit.
 */
(function () {
  'use strict';

  // Show on every refresh / homepage entry
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path !== '/' && path !== '') return;

  // Wait for DOM
  function onReady(fn) {
    if (document.readyState !== 'loading') { setTimeout(fn, 600); }
    else { document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 600); }); }
  }

  onReady(function () {
    // ── Inject styles ──
    var style = document.createElement('style');
    style.textContent = [
      '/* Shooting Star Intro */',

      '.ss-overlay{position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden}',

      /* The star itself */
      '.ss-star{position:absolute;width:18px;height:18px;border-radius:50%;',
      'background:radial-gradient(circle,#fff 0%,#FFE17D 40%,#F0C84C 70%,transparent 100%);',
      'box-shadow:0 0 28px 12px rgba(255,225,125,.7),0 0 60px 20px rgba(240,200,76,.4),0 0 90px 30px rgba(212,168,67,.2);',
      'filter:blur(0.5px);',
      'will-change:transform,opacity;}',

      /* Glow halo around star */
      '.ss-star::before{content:"";position:absolute;inset:-14px;border-radius:50%;',
      'background:radial-gradient(circle,rgba(255,225,125,.5) 0%,transparent 70%);',
      'animation:ss-pulse .4s ease-in-out infinite alternate;}',

      /* Tail / trail */
      '.ss-tail{position:absolute;width:120px;height:3px;',
      'background:linear-gradient(90deg,transparent,rgba(255,225,125,.8),#FFE17D);',
      'border-radius:2px;filter:blur(1.2px);',
      'transform-origin:right center;will-change:transform,opacity;}',

      /* Particles */
      '.ss-particle{position:absolute;border-radius:50%;pointer-events:none;will-change:transform,opacity;}',

      /* Tooltip bubble pointing at chatbot */
      '.ss-tooltip{position:fixed;z-index:100000;',
      'background:linear-gradient(135deg,rgba(30,45,100,.92),rgba(18,28,68,.96));',
      'border:1.5px solid rgba(245,209,111,.55);border-radius:18px;',
      'padding:16px 26px;color:#FFE8B0;font-family:inherit;font-size:1rem;font-weight:700;',
      'text-align:center;direction:rtl;line-height:1.7;',
      'box-shadow:0 12px 40px rgba(0,0,0,.4),0 0 30px rgba(240,200,92,.15);',
      'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);',
      'opacity:0;transform:translateY(12px) scale(.92);',
      'transition:opacity .5s ease,transform .5s ease;pointer-events:none;}',

      '.ss-tooltip.ss-show{opacity:1;transform:translateY(0) scale(1);}',

      /* Small arrow pointing up */
      '.ss-tooltip::before{content:"";position:absolute;top:-8px;left:50%;transform:translateX(-50%);',
      'border-left:9px solid transparent;border-right:9px solid transparent;',
      'border-bottom:9px solid rgba(245,209,111,.55);}',
      '.ss-tooltip::after{content:"";position:absolute;top:-6px;left:50%;transform:translateX(-50%);',
      'border-left:8px solid transparent;border-right:8px solid transparent;',
      'border-bottom:8px solid rgba(30,45,100,.92);}',

      /* Chatbot highlight ring */
      '.ss-chatbot-ring{position:fixed;z-index:99998;border-radius:50%;',
      'border:2.5px solid rgba(245,209,111,.7);',
      'box-shadow:0 0 20px rgba(240,200,92,.4),inset 0 0 12px rgba(240,200,92,.15);',
      'opacity:0;pointer-events:none;',
      'transition:opacity .5s ease;',
      'animation:ss-ring-pulse 1.2s ease-in-out infinite;}',

      '@keyframes ss-pulse{0%{opacity:.6;transform:scale(1)}100%{opacity:1;transform:scale(1.15)}}',
      '@keyframes ss-ring-pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.18);opacity:1}}',
    ].join('\n');
    document.head.appendChild(style);

    // ── Build overlay ──
    var overlay = document.createElement('div');
    overlay.className = 'ss-overlay';
    document.body.appendChild(overlay);

    var star = document.createElement('div');
    star.className = 'ss-star';
    overlay.appendChild(star);

    var tail = document.createElement('div');
    tail.className = 'ss-tail';
    overlay.appendChild(tail);

    // ── Find chatbot button position ──
    var chatbotBtn = document.querySelector('.chatbot-btn');
    if (!chatbotBtn) {
      overlay.remove();
      style.remove();
      return;
    }

    var btnRect = chatbotBtn.getBoundingClientRect();
    var targetX = btnRect.left + btnRect.width / 2;
    var targetY = btnRect.top + btnRect.height / 2;

    // ── Animation path ──
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    // Start from bottom-right, fly to chatbot (top-center-ish)
    var startX = vw + 40;
    var startY = vh * 0.75;

    // Control point for a nice arc
    var cpX = vw * 0.45;
    var cpY = vh * 0.08;

    var duration = 1600; // ms
    var startTime = null;
    var particles = [];

    function bezier(t, p0, p1, p2) {
      var u = 1 - t;
      return u * u * p0 + 2 * u * t * p1 + t * t * p2;
    }

    function spawnParticle(x, y) {
      var p = document.createElement('div');
      p.className = 'ss-particle';
      var size = 2 + Math.random() * 5;
      var hue = 38 + Math.random() * 22; // gold range
      var brightness = 70 + Math.random() * 30;
      p.style.cssText = [
        'width:' + size + 'px',
        'height:' + size + 'px',
        'left:' + x + 'px',
        'top:' + y + 'px',
        'background:radial-gradient(circle,hsla(' + hue + ',' + brightness + '%,72%,1),hsla(' + hue + ',80%,50%,.4))',
        'box-shadow:0 0 ' + (size * 2) + 'px hsla(' + hue + ',80%,60%,.6)',
        'opacity:1',
      ].join(';');
      overlay.appendChild(p);

      var vx = (Math.random() - 0.5) * 80;
      var vy = (Math.random() - 0.5) * 80 - 20;
      var life = 600 + Math.random() * 500;

      particles.push({ el: p, x: x, y: y, vx: vx, vy: vy, life: life, age: 0 });
    }

    var lastParticleTime = 0;

    function animateStar(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var t = Math.min(elapsed / duration, 1);

      // Ease-in-out
      var eased = t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;

      var cx = bezier(eased, startX, cpX, targetX);
      var cy = bezier(eased, startY, cpY, targetY);

      star.style.transform = 'translate(' + (cx - 9) + 'px,' + (cy - 9) + 'px)';
      star.style.opacity = t < 0.9 ? '1' : String(1 - (t - 0.9) / 0.1);

      // Tail
      var prevT = Math.max(0, eased - 0.05);
      var px = bezier(prevT, startX, cpX, targetX);
      var py = bezier(prevT, startY, cpY, targetY);
      var angle = Math.atan2(cy - py, cx - px);
      tail.style.transform = 'translate(' + (cx - 110) + 'px,' + (cy - 1.5) + 'px) rotate(' + angle + 'rad)';
      tail.style.opacity = t < 0.85 ? String(0.3 + t * 0.7) : String(1 - (t - 0.85) / 0.15);

      // Spawn particles along the path
      if (timestamp - lastParticleTime > 25 && t < 0.92) {
        lastParticleTime = timestamp;
        var count = 2 + Math.floor(Math.random() * 3);
        for (var i = 0; i < count; i++) {
          spawnParticle(cx + (Math.random() - 0.5) * 12, cy + (Math.random() - 0.5) * 12);
        }
      }

      // Big burst near the end
      if (t > 0.88 && t < 0.92) {
        for (var j = 0; j < 5; j++) {
          spawnParticle(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 20);
        }
      }

      // Update particles
      var dt = 16 / 1000;
      for (var k = particles.length - 1; k >= 0; k--) {
        var part = particles[k];
        part.age += 16;
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        part.vy += 40 * dt; // gravity
        var alpha = Math.max(0, 1 - part.age / part.life);
        part.el.style.transform = 'translate(' + part.x + 'px,' + part.y + 'px)';
        part.el.style.opacity = String(alpha);
        if (part.age >= part.life) {
          part.el.remove();
          particles.splice(k, 1);
        }
      }

      if (t < 1) {
        requestAnimationFrame(animateStar);
      } else {
        // Star reached chatbot — show tooltip
        showChatbotTooltip();
      }
    }

    function showChatbotTooltip() {
      // Remove star and tail
      star.style.display = 'none';
      tail.style.display = 'none';

      // Clean remaining particles after a bit
      setTimeout(function () {
        particles.forEach(function (p) { p.el.remove(); });
        particles = [];
      }, 800);

      // Highlight ring around chatbot
      var ring = document.createElement('div');
      ring.className = 'ss-chatbot-ring';
      var rect = chatbotBtn.getBoundingClientRect();
      var pad = 8;
      ring.style.left = (rect.left - pad) + 'px';
      ring.style.top = (rect.top - pad) + 'px';
      ring.style.width = (rect.width + pad * 2) + 'px';
      ring.style.height = (rect.height + pad * 2) + 'px';
      document.body.appendChild(ring);

      setTimeout(function () { ring.style.opacity = '1'; }, 50);

      // Tooltip
      var tooltip = document.createElement('div');
      tooltip.className = 'ss-tooltip';
      tooltip.innerHTML = '✨ مرحباً! يمكنك التحدث مع <strong style="color:#FFD976;">مساعد سياحة اليمن AI</strong><br>اضغط هنا للبدء';
      document.body.appendChild(tooltip);

      // Position tooltip below the chatbot button
      var ttWidth = 280;
      tooltip.style.width = ttWidth + 'px';
      var ttLeft = rect.left + rect.width / 2 - ttWidth / 2;
      // Keep within viewport
      if (ttLeft < 12) ttLeft = 12;
      if (ttLeft + ttWidth > vw - 12) ttLeft = vw - 12 - ttWidth;
      tooltip.style.left = ttLeft + 'px';
      tooltip.style.top = (rect.bottom + 14) + 'px';

      setTimeout(function () { tooltip.classList.add('ss-show'); }, 200);

      // Make chatbot button clickable through pointer events
      tooltip.style.pointerEvents = 'auto';
      tooltip.style.cursor = 'pointer';
      tooltip.addEventListener('click', function () {
        if (chatbotBtn) chatbotBtn.click();
        cleanup();
      });

      // Auto-dismiss after 5 seconds
      setTimeout(function () { cleanup(); }, 5000);

      function cleanup() {
        tooltip.classList.remove('ss-show');
        ring.style.opacity = '0';
        setTimeout(function () {
          tooltip.remove();
          ring.remove();
          overlay.remove();
        }, 600);
      }
    }

    // ── Start animation ──
    requestAnimationFrame(animateStar);
  });
})();
