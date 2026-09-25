/* =========================================================
   KOACHER — Landing page
   Interactions + tracking Meta (Pixel) / dataLayer.
   ========================================================= */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var body = document.body;
  // Configuration : injectée par WordPress (window.KOACHER_CONFIG) ou, en statique,
  // lue sur les attributs data- de la balise <body>.
  var CFG = window.KOACHER_CONFIG || {};
  var PIXEL_ID = CFG.pixelId || body.getAttribute('data-pixel-id') || '';
  var ENDPOINT = CFG.bookingEndpoint || body.getAttribute('data-booking-endpoint') || '';

  /* ---------- 1. Meta Pixel (chargé seulement si un ID est fourni) ---------- */
  function loadPixel(id) {
    if (!id || window.fbq) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }
  loadPixel(PIXEL_ID);

  /* ---------- 2. Helper de tracking unifié ---------- */
  function track(eventName, params) {
    params = params || {};
    if (window.fbq) window.fbq('track', eventName, params);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: 'koacher_' + eventName }, params));
  }

  /* ---------- 3. Navigation ---------- */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.nav__burger');
  var mobileMenu = document.getElementById('mobile-menu');

  function onScroll() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 40);
    var sticky = document.querySelector('.sticky-cta');
    if (sticky) sticky.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      mobileMenu.hidden = open;
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        mobileMenu.hidden = true;
      });
    });
  }

  /* ---------- 4. Tracking des CTA ---------- */
  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('ViewContent', { content_name: el.getAttribute('data-track'), content_category: 'cta' });
    });
  });

  /* ---------- 5. Formulaire de réservation ---------- */
  var form = document.getElementById('booking-form');
  if (form) {
    var success = form.querySelector('.booking__success');
    var started = false;

    form.addEventListener('input', function () {
      if (started) return;
      started = true;
      track('InitiateCheckout', { content_category: 'booking_form_start' });
    }, { once: false });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var data = Object.fromEntries(new FormData(form).entries());
      track('Lead', {
        content_category: 'booking',
        content_name: data.sport || 'non précisé',
        value: 19,
        currency: 'EUR'
      });

      var done = function () {
        form.querySelectorAll('.field, .btn, .booking__legal').forEach(function (n) { n.style.display = 'none'; });
        if (success) success.hidden = false;
      };

      if (ENDPOINT) {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(done).catch(done);
      } else {
        done();
      }
    });
  }

  /* ---------- 6. Vidéo de la pub (case study) ---------- */
  var adVideo = document.getElementById('ad-video');
  var adPlay = document.getElementById('ad-play');
  if (adVideo && adPlay) {
    var phone = adPlay.closest('.phone');
    adPlay.addEventListener('click', function () {
      adVideo.muted = false;
      adVideo.currentTime = 0;
      adVideo.play();
      phone.classList.add('is-playing');
      track('ViewContent', { content_name: 'meta_ad_creative', content_category: 'video' });
    });
    adVideo.addEventListener('pause', function () { phone.classList.remove('is-playing'); });
    adVideo.addEventListener('ended', function () { phone.classList.remove('is-playing'); });
  }

  /* ---------- 7. Apparition au scroll ---------- */
  var revealTargets = document.querySelectorAll(
    '.section > .wrap > *, .stats__grid, .card, .step, .coach, .quote, .price, .final__inner > *'
  );
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });

    // Filet de sécurité : quoi qu'il arrive, tout est visible au bout de 4 s.
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { el.classList.add('is-in'); });
    }, 4000);
  }

  /* ---------- 8. Compteurs ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var start = performance.now();
    var dur = 1400;
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('fr-FR') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- 9. Divers ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Scroll profond = signal d'intérêt (utile pour les audiences Meta)
  var deepScrollSent = false;
  window.addEventListener('scroll', function () {
    if (deepScrollSent) return;
    var pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
    if (pct > 0.7) {
      deepScrollSent = true;
      track('ViewContent', { content_name: 'scroll_70', content_category: 'engagement' });
    }
  }, { passive: true });
})();
