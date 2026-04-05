(function () {
  'use strict';

  var GA_ID = 'G-85GNEL3LRV';
  var GTM_ID = 'GTM-PZR9FSVF';
  var COOKIE_NAME = 'noveather_consent';
  var COOKIE_DAYS = 395; // 13 months max (CNIL)

  // ── dataLayer + gtag helper ───────────────────────────────────────────────
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag; // expose globally for triggerConsentUpdate compatibility

  // ── Consent Mode v2 default (before any tag fires) ────────────────────────
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  // ── Load gtag.js (GA4) ────────────────────────────────────────────────────
  var gs = document.createElement('script');
  gs.async = true;
  gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(gs);

  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });

  // ── Cookie helpers ────────────────────────────────────────────────────────
  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + expires + '; path=/; SameSite=Lax; Secure';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  // ── GTM loader ────────────────────────────────────────────────────────────
  function loadGTM(consentChoice) {
    if (window._gtmLoaded) return;
    window._gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    // Re-envoyer le consent update UNE FOIS que GTM est chargé
    s.onload = function () {
      if (consentChoice === 'accepted') {
        gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted'
        });
      }
    };
    document.head.appendChild(s);
    // noscript fallback already absent when JS runs — add iframe for completeness
    var ns = document.createElement('noscript');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.googletagmanager.com/ns.html?id=' + GTM_ID;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    ns.appendChild(iframe);
    document.body.insertBefore(ns, document.body.firstChild);
  }

  // ── Apply consent ─────────────────────────────────────────────────────────
  function applyConsent(choice) {
    if (choice === 'accepted') {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted'
      });
      loadGTM('accepted');
    } else {
      gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied'
      });
    }
  }

  // ── Global triggerConsentUpdate (backward compat) ─────────────────────────
  window.triggerConsentUpdate = function () {
    applyConsent('accepted');
    setCookie(COOKIE_NAME, 'accepted', COOKIE_DAYS);
  };

  // ── Banner HTML & CSS ─────────────────────────────────────────────────────
  var STYLES = [
    '#ncb{position:fixed;bottom:0;left:0;right:0;z-index:99999;',
    'background:#0f1623;border-top:1px solid rgba(59,130,246,.3);',
    'padding:20px 24px;font-family:Inter,system-ui,sans-serif;',
    'font-size:.875rem;color:#c9d3e0;box-shadow:0 -4px 24px rgba(0,0,0,.5);}',
    '#ncb .ncb-inner{max-width:1100px;margin:0 auto;}',
    '#ncb h3{margin:0 0 6px;font-size:1rem;font-weight:700;color:#f0f4f8;}',
    '#ncb p{margin:0 0 14px;line-height:1.55;}',
    '#ncb .ncb-btns{display:flex;flex-wrap:wrap;gap:10px;}',
    '#ncb button{padding:9px 20px;border-radius:10px;border:none;cursor:pointer;',
    'font-size:.875rem;font-weight:600;transition:opacity .15s;}',
    '#ncb button:hover{opacity:.85;}',
    '#ncb .ncb-accept{background:#3b82f6;color:#fff;}',
    '#ncb .ncb-refuse{background:#1e2d42;color:#c9d3e0;border:1px solid rgba(255,255,255,.15);}',
    '#ncb .ncb-custom{background:transparent;color:#60a5fa;border:1px solid rgba(96,165,250,.4);}',
    '#ncb-detail{display:none;margin-top:14px;padding:16px;background:#080d14;',
    'border-radius:12px;border:1px solid rgba(255,255,255,.08);}',
    '#ncb-detail.open{display:block;}',
    '#ncb-detail .ncb-row{display:flex;justify-content:space-between;align-items:center;',
    'padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);}',
    '#ncb-detail .ncb-row:last-child{border-bottom:none;}',
    '#ncb-detail .ncb-row-info{flex:1;margin-right:12px;}',
    '#ncb-detail .ncb-row-info strong{display:block;color:#f0f4f8;margin-bottom:2px;}',
    '#ncb .ncb-toggle{position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;}',
    '#ncb .ncb-toggle input{opacity:0;width:0;height:0;}',
    '#ncb .ncb-slider{position:absolute;inset:0;background:#1e2d42;border-radius:24px;',
    'transition:.2s;border:1px solid rgba(255,255,255,.15);}',
    '#ncb .ncb-slider:before{content:"";position:absolute;width:18px;height:18px;',
    'left:3px;bottom:2px;background:#6b7280;border-radius:50%;transition:.2s;}',
    '#ncb .ncb-toggle input:checked+.ncb-slider{background:#10b981;}',
    '#ncb .ncb-toggle input:checked+.ncb-slider:before{transform:translateX(18px);background:#fff;}',
    '#ncb .ncb-toggle input:disabled+.ncb-slider{opacity:.6;cursor:not-allowed;}',
    '@media(max-width:600px){#ncb .ncb-btns{flex-direction:column;}',
    '#ncb button{width:100%;text-align:center;}}'
  ].join('');

  function createBanner() {
    var style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);

    var div = document.createElement('div');
    div.id = 'ncb';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-modal', 'true');
    div.setAttribute('aria-label', 'Gestion des cookies');
    div.innerHTML = [
      '<div class="ncb-inner">',
      '<h3>🍪 Ce site utilise des cookies</h3>',
      '<p>Nous utilisons des cookies analytiques (Google Analytics via GTM) pour mesurer notre audience.',
      ' Les cookies strictement nécessaires ne peuvent pas être désactivés.',
      ' Votre consentement est valable 13 mois.</p>',
      '<div class="ncb-btns">',
      '<button class="ncb-accept" id="ncb-btn-accept">Tout accepter</button>',
      '<button class="ncb-refuse" id="ncb-btn-refuse">Tout refuser</button>',
      '<button class="ncb-custom" id="ncb-btn-custom" aria-expanded="false">Personnaliser</button>',
      '</div>',
      '<div id="ncb-detail" role="region" aria-label="Détail des cookies">',
      '<div class="ncb-row">',
      '<div class="ncb-row-info">',
      '<strong>Cookies nécessaires</strong>',
      'Indispensables au fonctionnement du site (session, sécurité). Aucune donnée de tracking.',
      '</div>',
      '<label class="ncb-toggle"><input type="checkbox" checked disabled><span class="ncb-slider"></span></label>',
      '</div>',
      '<div class="ncb-row">',
      '<div class="ncb-row-info">',
      '<strong>Cookies analytiques</strong>',
      'Google Analytics (via GTM) — mesure d\'audience anonymisée (pages visitées, durée, source).',
      '</div>',
      '<label class="ncb-toggle"><input type="checkbox" id="ncb-analytics-toggle"><span class="ncb-slider"></span></label>',
      '</div>',
      '<div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">',
      '<button class="ncb-accept" id="ncb-btn-save">Enregistrer mes choix</button>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(div);

    document.getElementById('ncb-btn-accept').addEventListener('click', function () {
      saveConsent('accepted');
    });
    document.getElementById('ncb-btn-refuse').addEventListener('click', function () {
      saveConsent('refused');
    });
    document.getElementById('ncb-btn-custom').addEventListener('click', function () {
      var detail = document.getElementById('ncb-detail');
      var open = detail.classList.toggle('open');
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.getElementById('ncb-btn-save').addEventListener('click', function () {
      var analytics = document.getElementById('ncb-analytics-toggle').checked;
      saveConsent(analytics ? 'accepted' : 'refused');
    });
  }

  function removeBanner() {
    var el = document.getElementById('ncb');
    if (el) el.remove();
  }

  function saveConsent(choice) {
    setCookie(COOKIE_NAME, choice, COOKIE_DAYS);
    applyConsent(choice);
    removeBanner();
  }

  // ── Open banner (for "Gérer les cookies" footer link) ─────────────────────
  window.openCookieBanner = function () {
    if (!document.getElementById('ncb')) {
      createBanner();
    }
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  var stored = getCookie(COOKIE_NAME);
  if (stored) {
    applyConsent(stored);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createBanner);
    } else {
      createBanner();
    }
  }
})();
