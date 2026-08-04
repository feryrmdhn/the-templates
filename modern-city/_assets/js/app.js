

var FALLBACK_DATA = FALLBACK['modern-city'];
var _projectId = null;
var _apiBaseUrl = null;
var _isDataApplied = false;
var _countdownInstance = null;

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

function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
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

var MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
var DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function fmtDate(iso) {
  if (!iso) return '';
  try {
    var d = new Date(iso);
    return DAYS_ID[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS_ID[d.getMonth()] + ' ' + d.getFullYear();
  } catch (e) { return iso; }
}

function fmtTime(iso) {
  if (!iso) return '';
  try {
    var d = new Date(iso);
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  } catch (e) { return ''; }
}

function showNotification(message, type) {
  var t = el('toastMc');
  if (!t) return;
  t.textContent = message;
  t.classList.toggle('error', type === 'error');
  t.classList.add('is-show');
  setTimeout(function () { t.classList.remove('is-show'); }, 3000);
}

function startCountdown(target) {
  if (!target) return;
  var elD = el('cdD'), elH = el('cdH'), elM = el('cdM'), elS = el('cdS');
  if (!elD) return;
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  var end = new Date(target).getTime();
  if (isNaN(end)) return;
  if (_countdownInstance) clearInterval(_countdownInstance);
  function tick() {
    var diff = end - Date.now();
    if (diff <= 0) {
      elD.textContent = '00'; elH.textContent = '00'; elM.textContent = '00'; elS.textContent = '00';
      clearInterval(_countdownInstance);
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    elD.textContent = pad(d); elH.textContent = pad(h); elM.textContent = pad(m); elS.textContent = pad(s);
  }
  tick();
  _countdownInstance = setInterval(tick, 1000);
}

function renderStory(stories) {
  var c = el('timeline');
  if (!c) return;
  c.innerHTML = '';
  (stories || []).forEach(function (s, idx) {
    var item = document.createElement('div');
    item.className = 'tl-item';
    item.setAttribute('data-aos', idx % 2 === 0 ? 'fade-right' : 'fade-left');
    item.innerHTML = '<div class="tl-node"></div>'
      + '<div class="tl-card">'
      + '<div class="year">' + sanitize(s.year) + '</div>'
      + '<h4>' + sanitize(s.title) + '</h4>'
      + '<p>' + sanitize(s.description) + '</p>'
      + '</div>';
    c.appendChild(item);
  });
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderWishes(wishesData) {
  var c = el('wishesList');
  if (!c) return;
  c.innerHTML = '';
  if (!wishesData || !wishesData.length) {
    c.innerHTML = '<p style="text-align:center;color:#94A3B8;font-style:italic;padding:2rem;">Belum ada ucapan. Jadilah yang pertama!</p>';
    return;
  }
  wishesData.forEach(function (w) {
    var nm = w.guest_name || w.name || '?';
    var initial = nm.charAt(0).toUpperCase();
    var item = document.createElement('div');
    item.className = 'wish';
    item.innerHTML = '<div class="avatar">' + sanitize(initial) + '</div>'
      + '<div class="body">'
      + '<strong>' + sanitize(nm) + '</strong>'
      + '<p>' + sanitize(w.message) + '</p>'
      + '</div>';
    c.appendChild(item);
  });
}

function renderPayment(paymentData) {
  var c = el('giftGrid');
  if (!c) return;
  c.innerHTML = '';
  (paymentData || []).forEach(function (p, idx) {
    var item = document.createElement('div');
    item.className = 'gift-card';
    item.setAttribute('data-aos', 'fade-up');
    item.setAttribute('data-aos-delay', (idx * 80) + '');
    item.innerHTML = '<img src="/payment/' + sanitize(p.method) + '.png" alt="' + sanitize(p.method) + '" class="gift-card__logo">'
      + '<div class="number">' + sanitize(p.value) + '</div>'
      + '<div class="owner">a.n. ' + sanitize(p.name) + '</div>'
      + '<button type="button" class="btn-copy" data-copy="' + sanitize(p.value) + '"><i class="fa-regular fa-copy"></i> Salin</button>';
    c.appendChild(item);
  });
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function applyData(data) {
  var d = data;
  var f = FALLBACK_DATA;

  var groomName = d.groomName || f.groomName;
  var brideName = d.brideName || f.brideName;
  var groomFirst = groomName.split(' ')[0];
  var brideFirst = brideName.split(' ')[0];

  if (el('guestName')) el('guestName').textContent = d.guestName || f.guestName;
  if (el('open-groom')) el('open-groom').textContent = groomName;
  if (el('open-bride')) el('open-bride').textContent = brideName;
  if (el('openDate')) el('openDate').textContent = fmtDate(d.receptionDatetime || f.receptionDatetime);

  if (el('navBrand')) el('navBrand').textContent = groomFirst + ' & ' + brideFirst;

  if (el('hero-groom')) el('hero-groom').textContent = groomName;
  if (el('hero-bride')) el('hero-bride').textContent = brideName;
  if (el('heroDate')) el('heroDate').textContent = fmtDate(d.receptionDatetime || f.receptionDatetime);
  if (el('heroTagline')) {
    var tagline = d.tagline || f.tagline || '';
    el('heroTagline').innerHTML = '<em>"' + sanitize(tagline) + '"</em>';
  }

  if (el('coupleGroom')) el('coupleGroom').textContent = groomName;
  if (el('coupleBride')) el('coupleBride').textContent = brideName;
  if (el('groomParents')) el('groomParents').textContent = d.groomDesc || f.groomDesc || '';
  if (el('brideParents')) el('brideParents').textContent = d.brideDesc || f.brideDesc || '';

  if (el('closingQuote')) el('closingQuote').textContent = d.quote || f.quote || '';
  if (el('closingNames')) el('closingNames').textContent = groomFirst + ' & ' + brideFirst;
  document.querySelectorAll('.platform-name').forEach(function (node) {
    node.textContent = d.platform || f.platform || 'Your platform';
  });

  if (el('year')) el('year').textContent = new Date().getFullYear();

  if (el('akadDate')) el('akadDate').textContent = fmtDate(d.akadDatetime || f.akadDatetime);
  if (el('akadTime')) el('akadTime').textContent = fmtTime(d.akadDatetime || f.akadDatetime);
  if (el('akadVenue')) el('akadVenue').textContent = d.akadVenue || f.akadVenue || '';
  if (el('akadAddress')) el('akadAddress').textContent = d.akadAddress || f.akadAddress || '';
  var akadMap = el('akadMap');
  if (akadMap) akadMap.src = cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) || '';

  if (el('resDate')) el('resDate').textContent = fmtDate(d.receptionDatetime || f.receptionDatetime);
  if (el('resTime')) el('resTime').textContent = fmtTime(d.receptionDatetime || f.receptionDatetime);
  if (el('resVenue')) el('resVenue').textContent = d.receptionVenue || f.receptionVenue || '';
  if (el('resAddress')) el('resAddress').textContent = d.receptionAddress || f.receptionAddress || '';
  var resMap = el('resMap');
  if (resMap) resMap.src = cleanMapsUrl(d.receptionMapsUrl || f.receptionMapsUrl) || '';

  startCountdown(d.receptionDatetime || f.receptionDatetime);

  renderStory(d.stories != null ? d.stories : f.stories);

  if (!_projectId) {
    renderWishes((d.wishes && d.wishes.length) ? d.wishes : f.wishes);
  }

  renderPayment((d.payment && d.payment.length) ? d.payment : f.payment);

  var audio = el('bgAudio');
  if (audio && (d.music || f.music)) {
    var newSrc = d.music || f.music;
    if (!audio.src || audio.src !== newSrc) {
      var wasPlaying = !audio.paused;
      audio.src = newSrc;
      audio.load();
      if (wasPlaying) {
        audio.play().catch(function () { });
      }
    }
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
    .catch(function () { renderWishes([]); });
}

function handleRSVP(e) {
  e.preventDefault();
  var form = e.target;
  var nameInput = form.querySelector('[name="name"]');
  var msgInput = form.querySelector('[name="message"]');
  var submitBtn = form.querySelector('button[type="submit"]');

  var name = nameInput ? nameInput.value.trim() : '';
  var message = msgInput ? msgInput.value.trim() : '';

  if (!name) { showNotification('Nama tidak boleh kosong', 'error'); if (nameInput) nameInput.focus(); return; }
  if (!message) { showNotification('Ucapan tidak boleh kosong', 'error'); if (msgInput) msgInput.focus(); return; }

  if (!_projectId || !_apiBaseUrl) {
    showNotification('Tidak dapat mengirim ucapan saat ini', 'error');
    return;
  }

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Mengirim...'; }

  postComment(_apiBaseUrl, {
    project_id: _projectId,
    guest_name: sanitize(name),
    message: sanitize(message)
  })
    .then(function (response) {
      if (response && response.success) {
        if (nameInput) nameInput.value = '';
        if (msgInput) msgInput.value = '';
        loadComments();
        showNotification('Ucapan berhasil dikirim!', 'success');
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
        submitBtn.innerHTML = '<span>Kirim Ucapan</span> <i class="fa-solid fa-paper-plane"></i>';
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

  if (el('guestName')) el('guestName').textContent = guest || FALLBACK_DATA.guestName;

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

      notifyLoaded();
      applyData(merged);
    })
    .catch(function () {
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
      notifyLoaded();
      renderTenant({});
    });
});

var _url = new URL(window.location.href);
var _u = _url.searchParams.get('to') || _url.searchParams.get('name') || '';
if (_u) _u = _u.replace(/_/g, ' ');
if (_u && el('guestName')) el('guestName').textContent = _u;

(function () {
  var f = FALLBACK_DATA;
  if (!f) return;
  var groomName = f.groomName || '';
  var brideName = f.brideName || '';
  var groomFirst = groomName.split(' ')[0];
  var brideFirst = brideName.split(' ')[0];
  var set = function (id, val) { var n = document.getElementById(id); if (n) n.textContent = val; };
  set('open-groom', groomName);
  set('open-bride', brideName);
  set('hero-groom', groomName);
  set('hero-bride', brideName);
  set('coupleGroom', groomName);
  set('coupleBride', brideName);
  set('navBrand', groomFirst + ' & ' + brideFirst);
  set('closingNames', groomFirst + ' & ' + brideFirst);
  set('openDate', fmtDate(f.receptionDatetime));
  set('heroDate', fmtDate(f.receptionDatetime));
  set('akadDate', fmtDate(f.akadDatetime));
  set('akadTime', fmtTime(f.akadDatetime));
  set('resDate', fmtDate(f.receptionDatetime));
  set('resTime', fmtTime(f.receptionDatetime));
  set('akadVenue', f.akadVenue || '');
  set('akadAddress', f.akadAddress || '');
  set('resVenue', f.receptionVenue || '');
  set('resAddress', f.receptionAddress || '');
  set('groomParents', f.groomDesc || '');
  set('brideParents', f.brideDesc || '');
  if (f.tagline) {
    var ht = document.getElementById('heroTagline');
    if (ht) ht.innerHTML = '<em>"' + sanitize(f.tagline) + '"</em>';
  }
  set('closingQuote', f.quote || '');
})();

function spawnLights(containerId, count) {
  var container = document.getElementById(containerId);
  if (!container) return;
  count = count || 60;
  var frag = document.createDocumentFragment();
  for (var i = 0; i < count; i++) {
    var d = document.createElement('i');
    d.style.left = Math.random() * 100 + '%';
    d.style.top = (60 + Math.random() * 40) + '%';
    frag.appendChild(d);
  }
  container.appendChild(frag);
  if (typeof anime !== 'undefined') {
    anime({
      targets: container.querySelectorAll('i'),
      opacity: [{ value: .15, duration: 600 }, { value: 1, duration: 600 }],
      delay: anime.stagger(80, { from: 'random' }),
      direction: 'alternate', loop: true, easing: 'easeInOutSine'
    });
  }
}

function spawnNeon(containerId, count) {
  var container = document.getElementById(containerId);
  if (!container) return;
  count = count || 18;
  var frag = document.createDocumentFragment();
  for (var i = 0; i < count; i++) {
    var d = document.createElement('i');
    d.style.left = Math.random() * 100 + '%';
    d.style.top = Math.random() * 100 + '%';
    frag.appendChild(d);
  }
  container.appendChild(frag);
  if (typeof anime !== 'undefined') {
    anime({
      targets: container.querySelectorAll('i'),
      translateY: function () { return anime.random(-80, -200); },
      translateX: function () { return anime.random(-30, 30); },
      opacity: [{ value: 0, duration: 200 }, { value: .7, duration: 1200 }, { value: 0, duration: 1200 }],
      duration: function () { return anime.random(4000, 8000); },
      delay: anime.stagger(220),
      loop: true, easing: 'easeInOutQuad'
    });
  }
}

function injectSkyline() {
  var svg = document.querySelector('.opening-skyline');
  if (!svg) return;
  svg.innerHTML = '<defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1">'
    + '<stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#0F172A"/>'
    + '</linearGradient></defs>'
    + '<path fill="url(#g)" d="M0,320 L0,200 L40,200 L40,140 L70,140 L70,200 L110,200 L110,100 L150,100 L150,60 L180,60 L180,200 L230,200 L230,160 L260,160 L260,120 L300,120 L300,200 L350,200 L350,80 L390,80 L390,200 L440,200 L440,140 L490,140 L490,180 L540,180 L540,90 L580,90 L580,160 L640,160 L640,200 L700,200 L700,110 L740,110 L740,200 L800,200 L800,150 L860,150 L860,90 L900,90 L900,200 L960,200 L960,170 L1020,170 L1020,110 L1060,110 L1060,200 L1120,200 L1120,140 L1180,140 L1180,200 L1240,200 L1240,80 L1290,80 L1290,200 L1360,200 L1360,160 L1440,160 L1440,320 Z"/>';
}

document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  setTimeout(function () {
    if (!_isDataApplied) {
      _isDataApplied = true;
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
      renderTenant({}); // Populate default logo/social segera; diperbarui oleh API jika tersedia
    }
  }, 2000);

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 900, once: false, easing: 'ease-out-cubic' });
  }

  injectSkyline();
  spawnLights('cityLights', 80);
  spawnLights('heroLights', 60);
  spawnLights('closingLights', 60);
  spawnNeon('neonParticlesOpen', 75);
  spawnNeon('neonParticlesHero', 75);
  spawnNeon('neonParticlesStory', 50);
  spawnNeon('neonParticlesClosing', 50);

  el('year') && (el('year').textContent = new Date().getFullYear());

  var btnOpen = el('btnOpen');
  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      var opening = el('opening');
      if (opening) opening.classList.add('is-open');
      document.body.classList.remove('opening-show');

      var audio = el('bgAudio');
      if (audio && audio.src) {
        audio.play().then(function () {
          var fabAudio = el('fabAudio');
          if (fabAudio) fabAudio.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }).catch(function () { });
      }

      setTimeout(function () {
        if (opening && opening.parentNode) opening.parentNode.removeChild(opening);
        if (typeof anime !== 'undefined') {
          anime({ targets: '.hero-names span', opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(200), duration: 1200, easing: 'easeOutExpo' });
        }
        if (typeof AOS !== 'undefined') AOS.refresh();
      }, 1200);
    });
  }

  var fabAudio = el('fabAudio');
  var audio = el('bgAudio');
  if (fabAudio && audio) {
    fabAudio.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().then(function () {
          fabAudio.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }).catch(function () { });
      } else {
        audio.pause();
        fabAudio.innerHTML = '<i class="fa-solid fa-music"></i>';
      }
    });
  }

  var fabTop = el('fabTop');
  if (fabTop) {
    fabTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      fabTop.classList.toggle('is-show', window.scrollY > 500);
    });
  }

  var nav = el('navMc');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    });
  }

  var toggle = el('navToggle');
  var menu = el('navList');
  if (toggle && menu) {
    toggle.addEventListener('click', function () { menu.classList.toggle('is-open'); });
    document.querySelectorAll('.nav-list a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('is-open'); });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
      }
    });
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-copy]');
    if (!btn) return;
    var val = btn.getAttribute('data-copy');
    var done = function () {
      var orig = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin';
      btn.classList.add('copied');
      setTimeout(function () { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val).then(done).catch(done);
    } else {
      var ta = document.createElement('textarea'); ta.value = val; document.body.appendChild(ta);
      ta.select(); try { document.execCommand('copy'); } catch (_) { }
      document.body.removeChild(ta); done();
    }
  });

  var rsvpForm = el('rsvpForm');
  if (rsvpForm) rsvpForm.addEventListener('submit', handleRSVP);
});
