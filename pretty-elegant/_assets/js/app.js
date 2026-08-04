

var FALLBACK_DATA = FALLBACK["pretty-elegant"];
var _projectId = null;
var _apiBaseUrl = null;
var _isDataApplied = false;

function el(id) { return document.getElementById(id); }

var PLACEHOLDER_LOGO = '/placeholder-image.png';

function renderTenant(data) {
  data = data || {};

  var logoNode = el('tenant-logo');
  if (logoNode) {
    var src = data.logo_url || (FALLBACK_DATA.logoUrl || '') || PLACEHOLDER_LOGO;
    logoNode.src = src;
    logoNode.onerror = function () {
      logoNode.onerror = null;
      logoNode.src = PLACEHOLDER_LOGO;
    };
  }

  var socialNode = el('tenant-social');
  if (socialNode) {
    var fb = data.facebook_url || '#';
    var ig = data.instagram_url || '#';
    socialNode.innerHTML = ''
      + '<a href="' + fb + '" target="_blank" rel="noopener noreferrer" class="tenant-social-btn" aria-label="Facebook">'
      + '<i class="fa-brands fa-facebook-f"></i></a>'
      + '<a href="' + ig + '" target="_blank" rel="noopener noreferrer" class="tenant-social-btn" aria-label="Instagram">'
      + '<i class="fa-brands fa-instagram"></i></a>';
  }
}

function pad(n) { n = String(n); return n.length < 2 ? '0' + n : n; }
function sanitize(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function cleanMapsUrl(str) {
  if (!str) return '';

  var iframeMatch = String(str).match(/src=["']([^"']+)["']/);
  if (iframeMatch) {
    str = iframeMatch[1];
  }

  var textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  str = textarea.value;

  if (str.indexOf('/maps/embed') !== -1) {
    return str;
  }

  var coordMatch = str.match(/[\/@](-?\d+\.\d+),(-?\d+\.\d+)/) ||
    str.match(/3d(-?\d+\.\d+)[^!]*!4d(-?\d+\.\d+)/);
  if (coordMatch) {
    return 'https://maps.google.com/maps?q=' + coordMatch[1] + ',' + coordMatch[2] + '&output=embed';
  }

  if (str.indexOf('google.com/maps') !== -1 || str.indexOf('maps.google') !== -1) {
    if (str.indexOf('output=embed') === -1) {
      return str + (str.indexOf('?') !== -1 ? '&' : '?') + 'output=embed';
    }
  }

  return str;
}
function getPaymentImage(method) {
  return '/payment/' + method.toLowerCase() + '.png';
}

function spawnDecorations() {
  var dec = [
    {
      sel: '#opening .floating-layer', list: [
        { src: '_assets/img/decoration/butterfly.svg', count: 5, size: [40, 60], anim: 'float-y', dur: [3, 6] },
        { src: '_assets/img/decoration/heart-outline.svg', count: 8, size: [22, 40], anim: 'pulse', dur: [2, 4] },
        { src: '_assets/img/decoration/flower-minimal.svg', count: 10, size: [28, 50], anim: 'spin', dur: [8, 16] }
      ]
    },
    { sel: '#hero .sparkle-layer', list: [{ src: 'sparkle', count: 14 }] },
    { sel: '#opening .sparkle-layer', list: [{ src: 'sparkle', count: 18 }] },
    { sel: '#closing .sparkle-layer', list: [{ src: 'sparkle', count: 16 }] },
    {
      sel: '#closing .floating-layer', list: [
        { src: '_assets/img/decoration/heart-outline.svg', count: 8, size: [22, 40], anim: 'pulse', dur: [2, 4] },
        { src: '_assets/img/decoration/butterfly.svg', count: 5, size: [40, 60], anim: 'float-y', dur: [3, 6] }
      ]
    }
  ];
  dec.forEach(function (group) {
    var host = document.querySelector(group.sel);
    if (!host) return;
    group.list.forEach(function (g) {
      for (var i = 0; i < g.count; i++) {
        var node;
        if (g.src === 'sparkle') {
          node = document.createElement('div');
          node.className = 'sparkle';
        } else {
          node = document.createElement('img');
          node.className = 'floating';
          node.src = g.src; node.alt = '';
          var size = g.size[0] + Math.random() * (g.size[1] - g.size[0]);
          node.style.width = size + 'px';
          var dur = g.dur[0] + Math.random() * (g.dur[1] - g.dur[0]);
          node.style.animation = g.anim + ' ' + dur.toFixed(2) + 's ease-in-out infinite';
        }
        node.style.top = (Math.random() * 90) + '%';
        node.style.left = (Math.random() * 95) + '%';
        node.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
        host.appendChild(node);
      }
    });
  });
}

function confettiBurst() {
  var host = document.querySelector('.confetti-container'); if (!host) return;
  var colors = ['#FF6B9D', '#C77DFF', '#4ECDC4', '#FFB3CA', '#7FE5DE'];
  for (var i = 0; i < 60; i++) {
    var p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = (Math.random() * 100) + '%';
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = (6 + Math.random() * 8) + 'px';
    p.style.height = (10 + Math.random() * 10) + 'px';
    host.appendChild(p);
    (function (node) {
      anime({
        targets: node,
        translateY: [0, window.innerHeight + 100],
        translateX: [0, (Math.random() - 0.5) * 300],
        rotate: [0, Math.random() * 720],
        opacity: [1, 0],
        duration: 2000 + Math.random() * 1500,
        easing: 'easeOutCubic',
        complete: function () { node.parentNode && node.parentNode.removeChild(node); }
      });
    })(p);
  }
}

function animateLetters(selector, baseDelay) {
  baseDelay = baseDelay || 0;
  var nodes = document.querySelectorAll(selector);
  Array.prototype.forEach.call(nodes, function (node, idx) {
    node.innerHTML = node.textContent.replace(/\S/g, function (c) {
      return '<span class="letter">' + c + '</span>';
    });
    anime({
      targets: node.querySelectorAll('.letter'),
      scale: [0, 1], opacity: [0, 1],
      easing: 'easeOutExpo', duration: 1200,
      delay: function (_, i) { return baseDelay + idx * 300 + 50 * i; }
    });
  });
}

function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.parallax-slow').forEach(function (elm) {
    gsap.to(elm, {
      yPercent: 40, ease: 'none',
      scrollTrigger: { trigger: elm, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  var navbar = document.getElementById('main-navbar');
  var lastScroll = 0;
  window.addEventListener('scroll', function () {
    var cur = window.pageYOffset;
    if (!navbar) return;
    if (cur > lastScroll && cur > 120) navbar.style.transform = 'translateY(-100%)';
    else navbar.style.transform = 'translateY(0)';
    lastScroll = cur;
  });
}

function updateCountdown(d, h, m, s) {
  setNum('countdown-days', d);
  setNum('countdown-hours', h);
  setNum('countdown-minutes', m);
  setNum('countdown-seconds', s);
}
function setNum(id, val) {
  var elem = el(id); if (!elem) return;
  var v = pad(val);
  if (elem.textContent === v) return;
  anime({
    targets: elem, rotateX: [0, 90], duration: 250, easing: 'easeInCubic',
    complete: function () {
      elem.textContent = v;
      anime({ targets: elem, rotateX: [90, 0], duration: 250, easing: 'easeOutCubic' });
    }
  });
}

function renderStory(stories) {
  var host = el('timeline-container'); if (!host) return;
  host.innerHTML = stories.map(function (s, i) {
    return '<div class="tl-item ' + (i % 2 === 0 ? 'left' : 'right') + '" data-aos="fade-up">'
      + '<div class="tl-card">'
      + (s.image ? '<img src="' + sanitize(s.image) + '" alt="">' : '')
      + '<div class="tl-date">' + sanitize(s.year) + '</div>'
      + '<h4>' + sanitize(s.title) + '</h4>'
      + '<p>' + sanitize(s.description) + '</p>'
      + '</div></div>';
  }).join('');
}
function renderGallery(items) {
  var host = el('gallery-container'); if (!host) return;
  host.innerHTML = items.map(function (src) {
    return '<a class="gallery-item" data-src="' + sanitize(src) + '" data-aos="zoom-in"><img src="' + sanitize(src) + '" alt="moment"/></a>';
  }).join('');
  if (typeof lightGallery !== 'undefined') {
    try { lightGallery(host, { selector: '.gallery-item', download: false, mode: 'lg-fade', speed: 500 }); } catch (e) { }
  }
}
function renderPayment(items) {
  var host = el('payment-container'); if (!host) return;
  host.innerHTML = items.map(function (p, i) {
    return '<div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="' + (i * 100) + '">'
      + '<div class="payment-card">'
      + '<img src="' + getPaymentImage(p.method) + '" alt="' + sanitize(p.method) + '" class="pay-logo">'
      + '<div class="pay-number">' + sanitize(p.value) + '</div>'
      + '<div class="pay-name">a.n. ' + sanitize(p.name) + '</div>'
      + '<button type="button" class="pay-copy" data-copy="' + sanitize(p.value) + '"><i class="fa-regular fa-copy"></i> Copy</button>'
      + '</div></div>';
  }).join('');
}
function renderWishes(items) {
  var host = el('wishes-container'); if (!host) return;
  if (!items || !items.length) { host.innerHTML = '<p class="muted text-center">Belum ada ucapan.</p>'; return; }
  host.innerHTML = items.map(function (w) {
    var nm = w.name || w.guest_name || 'Tamu';
    return '<div class="wish-item">'
      + '<div class="wish-avatar">' + sanitize(nm.charAt(0).toUpperCase()) + '</div>'
      + '<div class="wish-body"><strong>' + sanitize(nm) + '</strong><p>' + sanitize(w.message) + '</p></div>'
      + '</div>';
  }).join('');
}

function applyData(d) {
  var f = FALLBACK_DATA;
  var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function txt(id, v) { var n = el(id); if (n) n.innerHTML = v; }
  function src(id, v) { var n = el(id); if (n && v) n.src = v; }
  function attr(id, a, v) { var n = el(id); if (n && v) n.setAttribute(a, v); }

  txt('guest', sanitize(d.guestName || f.guestName));
  txt('groom-name', sanitize(d.groomName || f.groomName));
  txt('bride-name', sanitize(d.brideName || f.brideName));
  txt('groom-name-2', sanitize(d.groomFullName || d.groomName || f.groomFullName || f.groomName));
  txt('bride-name-2', sanitize(d.brideFullName || d.brideName || f.brideFullName || f.brideName));
  txt('groom-desc', sanitize(d.groomDesc || f.groomDesc));
  txt('bride-desc', sanitize(d.brideDesc || f.brideDesc));
  txt('hero-groom', sanitize(d.groomFullName || d.groomName || f.groomFullName || f.groomName));
  txt('hero-bride', sanitize(d.brideFullName || d.brideName || f.brideFullName || f.brideName));
  txt('closing-groom', sanitize(d.groomName || f.groomName));
  txt('closing-bride', sanitize(d.brideName || f.brideName));
  txt('quote', sanitize(d.quote || f.quote));

  src('groom-photo', d.groomPhoto || f.groomPhoto);
  src('bride-photo', d.bridePhoto || f.bridePhoto);
  src('opening-photo-groom', d.groomPhoto || f.groomPhoto);
  src('opening-photo-bride', d.bridePhoto || f.bridePhoto);
  src('hero-photo-groom', d.groomPhoto || f.groomPhoto);
  src('hero-photo-bride', d.bridePhoto || f.bridePhoto);

  var akad = new Date(d.akadDatetime || f.akadDatetime);
  var rec = new Date(d.receptionDatetime || f.receptionDatetime);
  txt('akad-day', days[akad.getDay()]); txt('akad-date', akad.getDate());
  txt('akad-month', months[akad.getMonth()]); txt('akad-year', akad.getFullYear());
  txt('akad-time', pad(akad.getHours()) + ':' + pad(akad.getMinutes()));
  txt('akad-venue', sanitize(d.akadVenue || f.akadVenue)); txt('akad-address', sanitize(d.akadAddress || f.akadAddress));
  attr('akad-map', 'src', cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl));

  txt('rec-day', days[rec.getDay()]); txt('rec-date', rec.getDate());
  txt('rec-month', months[rec.getMonth()]); txt('rec-year', rec.getFullYear());
  txt('rec-time', pad(rec.getHours()) + ':' + pad(rec.getMinutes()));
  txt('rec-venue', sanitize(d.receptionVenue || f.receptionVenue)); txt('rec-address', sanitize(d.receptionAddress || f.receptionAddress));
  attr('rec-map', 'src', cleanMapsUrl(d.receptionMapsUrl || f.receptionMapsUrl));

  txt('opening-date', days[akad.getDay()] + ', ' + akad.getDate() + ' ' + months[akad.getMonth()] + ' ' + akad.getFullYear());

  var bgCover = el('opening-bg');
  if (bgCover) {
    var bgUrl = d.backgroundCover || f.backgroundCover || '_assets/img/bg/bg-hero.jpg';
    bgCover.style.backgroundImage = 'url(' + bgUrl + ')';
  }

  startCountdown(rec);

  renderStory(d.stories != null ? d.stories : f.stories);
  renderGallery((d.gallery && d.gallery.length) ? d.gallery : f.gallery);
  renderPayment((d.payment && d.payment.length) ? d.payment : f.payment);

  if (!_projectId) {
    renderWishes((d.wishes && d.wishes.length) ? d.wishes : f.wishes);
  }

  var audio = el('audio');
  if (audio && (d.music || f.music)) {
    var srcEl = audio.querySelector('source');
    if (srcEl) { srcEl.src = d.music || f.music; audio.load(); }
  }

  if (el('platform-name')) el('platform-name').innerHTML = d.platform || f.platform || 'Daimov';
}

function startCountdown(target) {
  if (window.__cdTimer) clearInterval(window.__cdTimer);
  function tick() {
    var now = new Date();
    var diff = Math.max(0, target.getTime() - now.getTime());
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    updateCountdown(d, h, m, s);
  }
  tick();
  window.__cdTimer = setInterval(tick, 1000);
}

function showNotification(message, type) {
  var n = document.createElement('div');
  n.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;'
    + 'background:' + (type === 'success' ? '#10b981' : '#ef4444') + ';color:white;'
    + 'padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);'
    + 'font-size:14px;font-weight:500;max-width:90%;text-align:center;'
    + 'animation:slideDown 0.3s ease-out;';
  n.textContent = message;

  if (!document.getElementById('notif-style')) {
    var style = document.createElement('style');
    style.id = 'notif-style';
    style.textContent = '@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(style);
  }

  document.body.appendChild(n);
  setTimeout(function () {
    n.style.animation = 'slideDown 0.3s ease-out reverse';
    setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 300);
  }, 3000);
}

function copyHandler(e) {
  var btn = e.target.closest && e.target.closest('[data-copy]'); if (!btn) return;
  var val = btn.getAttribute('data-copy');
  var done = function () {
    var orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(function () { btn.innerHTML = orig; }, 1800);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(val).then(done).catch(done);
  } else {
    var ta = document.createElement('textarea'); ta.value = val; document.body.appendChild(ta);
    ta.select(); try { document.execCommand('copy'); } catch (_) { }
    document.body.removeChild(ta); done();
  }
}

function loadComments() {
  if (!_projectId || !_apiBaseUrl) return;

  getComments(_apiBaseUrl, _projectId, 100, 0)
    .then(function (response) {
      if (response && response.data && response.data.comments) {
        renderWishes(response.data.comments);
      } else {
        renderWishes([]);
      }
    })
    .catch(function () {
      renderWishes([]);
    });
}

function handleRSVP(e) {
  e.preventDefault();
  var form = e.target;
  var name = form.name.value.trim();
  var msg = form.message.value.trim();
  if (!name || !msg) { showNotification('Nama dan ucapan harus diisi', 'error'); return; }

  if (!_projectId || !_apiBaseUrl) {
    showNotification('Tidak dapat mengirim ucapan saat ini', 'error');
    return;
  }

  var submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';
  }

  postComment(_apiBaseUrl, {
    project_id: _projectId,
    guest_name: sanitize(name),
    message: sanitize(msg)
  })
    .then(function (response) {
      if (response && response.success) {
        form.reset();
        loadComments();
        showNotification('Ucapan berhasil dikirim!', 'success');
        confettiBurst();
      } else {
        showNotification('Gagal mengirim ucapan. Silakan coba lagi.', 'error');
      }
    })
    .catch(function () {
      showNotification('Gagal mengirim ucapan. Silakan coba lagi.', 'error');
    })
    .finally(function () {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Ucapan';
      }
    });
}

window.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'INVITATION_DATA') return;

  _isDataApplied = true;

  var payload = e.data.payload;
  var apiBaseUrl = payload.apiBaseUrl;
  var tenantSlug = payload.tenantSlug;
  var projectSlug = payload.projectSlug;
  var guest = payload.guestName || payload.guest;

  if (el('guest')) el('guest').innerHTML = guest || FALLBACK_DATA.guestName;

  if (payload.mode === 'preview') {
    applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
    renderTenant({});
    notifyLoaded();
    return;
  }

  if (!apiBaseUrl || !tenantSlug || !projectSlug) {
    applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
    renderTenant({});
    notifyLoaded();
    return;
  }

  Promise.all([
    getInvitation(apiBaseUrl, tenantSlug, projectSlug).catch(function () { return null; }),
    getTenantLogo(apiBaseUrl, tenantSlug).catch(function () { return null; })
  ])
    .then(function (results) {
      var response = results[0];
      var logoResp = results[1];

      var tenantData = (logoResp && logoResp.data) ? logoResp.data : {};
      renderTenant(tenantData);

      if (!response) {
        applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
        notifyLoaded();
        return;
      }

      var content = (response && response.data && response.data.content) ? response.data.content : {};
      var merged = {};
      Object.keys(FALLBACK_DATA).forEach(function (key) {
        var apiVal = content[key];
        merged[key] = (apiVal !== null && apiVal !== undefined && apiVal !== '') ? apiVal : FALLBACK_DATA[key];
      });
      merged.guestName = guest || content.guest_name || FALLBACK_DATA.guestName;
      if (response.data && response.data.song_url) merged.music = response.data.song_url;

      if (response.data && response.data.id) {
        _projectId = response.data.id;
        _apiBaseUrl = apiBaseUrl;
        loadComments();
      }

      applyData(merged);
      notifyLoaded();
    })
    .catch(function () {
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
      renderTenant({});
      notifyLoaded();
    });
});

var _url = new URL(window.location.href);
var _u = _url.searchParams.get('name') ? _url.searchParams.get('name').replace(/_/g, ' ') : '';
if (_u && el('guest')) el('guest').innerHTML = _u;

document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  setTimeout(function () {
    if (!_isDataApplied) {
      _isDataApplied = true;
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
      renderTenant({}); // Populate default logo/social segera; diperbarui oleh API jika tersedia
    }
  }, 2000);

  if (typeof AOS !== 'undefined') AOS.init({ duration: 900, once: false, mirror: true });

  spawnDecorations();
  initGSAP();
  animateLetters('.couple-name', 400);

  el('year') && (el('year').textContent = new Date().getFullYear());

  var btnOpen = el('btn-open-opening');
  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      confettiBurst();
      anime({
        targets: '#opening', opacity: [1, 0], scale: [1, .92],
        duration: 1600, easing: 'easeInCubic',
        complete: function () {
          var op = el('opening');
          op && op.parentNode && op.parentNode.removeChild(op);
          document.body.classList.remove('opening-show');
          if (typeof AOS !== 'undefined') AOS.refresh();
        }
      });
      var audio = el('audio');
      if (audio) { audio.play().catch(function () { }); var btn = el('btn-audio'); if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i>'; }
    });
  }

  var btnAudio = el('btn-audio'); var audio = el('audio');
  if (btnAudio && audio) {
    btnAudio.addEventListener('click', function () {
      if (audio.paused) { audio.play().catch(function () { }); btnAudio.innerHTML = '<i class="fa-solid fa-pause"></i>'; }
      else { audio.pause(); btnAudio.innerHTML = '<i class="fa-solid fa-music"></i>'; }
    });
  }

  var rsvp = el('rsvp-form');
  if (rsvp) rsvp.addEventListener('submit', handleRSVP);

  document.addEventListener('click', copyHandler);

  var stop = el('btn-scroll-top');
  if (stop) {
    stop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      stop.style.display = window.pageYOffset > 500 ? 'flex' : 'none';
    });
  }

  var burger = el('nav-burger'); var menu = el('nav-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      menu.classList.toggle('open');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        burger.classList.remove('open'); menu.classList.remove('open');
      }
    });
  }
});
