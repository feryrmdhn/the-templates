

var FALLBACK_DATA = FALLBACK['wayang'];
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

function startCountdown(target) {
  if (!target) return;
  var elD = el('cd-d'), elH = el('cd-h'), elM = el('cd-m'), elS = el('cd-s');
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
  var icons = ["wayang-arjuna.svg", "wayang-sumbadra.svg", "wayang-krishna.svg", "wayang-hanoman.svg"];
  (stories || []).forEach(function (s, idx) {
    var item = document.createElement('div');
    item.className = 'tl-item';
    item.setAttribute('data-aos', idx % 2 === 0 ? 'fade-right' : 'fade-left');
    item.innerHTML = '<span class="tl-node"><img src="_assets/img/decoration/' + icons[idx % icons.length] + '" alt=""></span>'
      + '<div class="tl-card">'
      + '<span class="year">' + sanitize(s.year) + '</span>'
      + '<h4>' + sanitize(s.title) + '</h4>'
      + '<p>' + sanitize(s.description) + '</p>'
      + '</div>';
    c.appendChild(item);
  });
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderEvents(data) {
  var d = data || FALLBACK_DATA;
  var f = FALLBACK_DATA;

  if (el('akad-date')) el('akad-date').textContent = fmtDate(d.akadDatetime || f.akadDatetime);
  if (el('akad-time')) el('akad-time').textContent = fmtTime(d.akadDatetime || f.akadDatetime);
  if (el('akad-venue')) el('akad-venue').textContent = d.akadVenue || f.akadVenue || '';
  if (el('akad-address')) el('akad-address').textContent = d.akadAddress || f.akadAddress || '';
  var akadMap = el('akad-map');
  if (akadMap) akadMap.src = cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) || '';

  if (el('resepsi-date')) el('resepsi-date').textContent = fmtDate(d.receptionDatetime || f.receptionDatetime);
  if (el('resepsi-time')) el('resepsi-time').textContent = fmtTime(d.receptionDatetime || f.receptionDatetime);
  if (el('resepsi-venue')) el('resepsi-venue').textContent = d.receptionVenue || f.receptionVenue || '';
  if (el('resepsi-address')) el('resepsi-address').textContent = d.receptionAddress || f.receptionAddress || '';
  var resepsiMap = el('resepsi-map');
  if (resepsiMap) resepsiMap.src = cleanMapsUrl(d.receptionMapsUrl || f.receptionMapsUrl) || '';
}

function renderWishes(wishesData) {
  var c = el('wishesList');
  if (!c) return;
  c.innerHTML = '';
  if (!wishesData || !wishesData.length) {
    c.innerHTML = '<p style="text-align:center;color:#8B7D6B;font-style:italic;padding:2rem;">Belum ada ucapan. Jadilah yang pertama!</p>';
    return;
  }
  wishesData.forEach(function (w) {
    var nm = w.guest_name || w.name || '?';
    var initial = nm.charAt(0).toUpperCase();
    var item = document.createElement('li');
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
  var c = el('giftList');
  if (!c) return;
  c.innerHTML = '';
  (paymentData || []).forEach(function (p, idx) {
    var col = document.createElement('div');
    col.className = 'col-md-4';
    col.setAttribute('data-aos', 'fade-up');
    col.setAttribute('data-aos-delay', (idx * 120) + '');
    col.innerHTML = '<div class="gift-card">'
      + '<img src="/payment/' + sanitize(p.method) + '.png" alt="' + sanitize(p.method) + '" class="gift-card__logo">'
      + '<div class="acc-no">' + sanitize(p.value) + '</div>'
      + '<div class="acc-name">a.n. ' + sanitize(p.name) + '</div>'
      + '<button type="button" class="btn-copy" data-copy="' + sanitize(p.value) + '"><i class="fa-regular fa-copy"></i> Salin</button>'
      + '</div>';
    c.appendChild(col);
  });
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function applyData(data) {
  var d = data;
  var f = FALLBACK_DATA;

  var groomName = d.groomName || f.groomName;
  var brideName = d.brideName || f.brideName;

  var groomFirstName = groomName.split(' ')[0];
  var brideFirstName = brideName.split(' ')[0];

  if (el('guest')) el('guest').textContent = d.guestName || f.guestName;
  document.querySelectorAll('[data-groom]').forEach(function (node) {
    node.textContent = groomName;
  });
  document.querySelectorAll('[data-bride]').forEach(function (node) {
    node.textContent = brideName;
  });
  if (el('opening-date')) el('opening-date').textContent = fmtDate(d.receptionDatetime || f.receptionDatetime);

  if (el('nav-brand')) {
    el('nav-brand').textContent = groomFirstName + ' & ' + brideFirstName;
  }

  document.querySelectorAll('[data-groom-short]').forEach(function (node) {
    node.textContent = groomFirstName;
  });
  document.querySelectorAll('[data-bride-short]').forEach(function (node) {
    node.textContent = brideFirstName;
  });
  if (el('hero-date')) {
    var hd = new Date(d.receptionDatetime || f.receptionDatetime);
    el('hero-date').textContent = ('0' + hd.getDate()).slice(-2) + ' . ' + ('0' + (hd.getMonth() + 1)).slice(-2) + ' . ' + hd.getFullYear();
  }

  if (el('hero-tagline')) {
    var tagline = d.tagline || f.tagline || '';
    el('hero-tagline').innerHTML = '<em>"' + sanitize(tagline) + '"</em>';
  }

  if (el('groom-parents')) el('groom-parents').textContent = d.groomDesc || f.groomDesc || '';
  if (el('bride-parents')) el('bride-parents').textContent = d.brideDesc || f.brideDesc || '';

  if (el('quote')) el('quote').textContent = d.quote || f.quote || '';
  document.querySelectorAll('.platform-name').forEach(function (node) {
    node.textContent = d.platform || f.platform || 'Your platform';
  });

  if (el('year')) el('year').textContent = new Date().getFullYear();

  startCountdown(d.receptionDatetime || f.receptionDatetime);

  renderStory(d.stories != null ? d.stories : f.stories);

  renderEvents(d);

  if (!_projectId) {
    renderWishes((d.wishes && d.wishes.length) ? d.wishes : f.wishes);
  }

  renderPayment((d.payment && d.payment.length) ? d.payment : f.payment);

  var audio = el('bgAudio');
  if (audio && (d.music || f.music)) {
    var newSrc = d.music || f.music;
    if (audio.src !== newSrc && audio.src.indexOf(newSrc) === -1) {
      var wasPlaying = !audio.paused;
      audio.src = newSrc;
      if (wasPlaying) {
        audio.load();
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
        submitBtn.innerHTML = '<i class="fa-regular fa-paper-plane"></i> Kirim';
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

  if (el('guest')) el('guest').textContent = guest || FALLBACK_DATA.guestName;

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
if (_u && el('guest')) el('guest').textContent = _u;

(function () {
  var f = FALLBACK_DATA;
  if (!f) return;
  var groomName = f.groomName || '';
  var brideName = f.brideName || '';
  var groomFirstName = groomName.split(' ')[0];
  var brideFirstName = brideName.split(' ')[0];

  document.querySelectorAll('[data-groom]').forEach(function (n) { n.textContent = groomName; });
  document.querySelectorAll('[data-bride]').forEach(function (n) { n.textContent = brideName; });
  document.querySelectorAll('[data-groom-short]').forEach(function (n) { n.textContent = groomFirstName; });
  document.querySelectorAll('[data-bride-short]').forEach(function (n) { n.textContent = brideFirstName; });

  if (document.getElementById('nav-brand')) {
    document.getElementById('nav-brand').textContent = groomFirstName + ' & ' + brideFirstName;
  }
})();

function spawnParticles() {
  var hosts = document.querySelectorAll('[data-particles]');
  hosts.forEach(function (host) {
    for (var i = 0; i < 14; i++) {
      var p = document.createElement('span');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.width = p.style.height = (4 + Math.random() * 8) + 'px';
      host.appendChild(p);
      if (typeof anime !== 'undefined') {
        anime({
          targets: p,
          translateY: [0, -40 - Math.random() * 60],
          opacity: [{ value: .9 }, { value: 0 }],
          duration: 3000 + Math.random() * 3000,
          easing: 'easeInOutSine',
          loop: true,
          delay: Math.random() * 2000
        });
      }
    }
  });
}

function spawnMelati() {
  var hosts = document.querySelectorAll('[data-melati]');
  hosts.forEach(function (host) {
    for (var i = 0; i < 10; i++) {
      var f = document.createElement('span');
      f.className = 'melati';
      f.style.left = Math.random() * 100 + '%';
      f.style.top = '-20px';
      host.appendChild(f);
      if (typeof anime !== 'undefined') {
        anime({
          targets: f,
          translateY: [0, window.innerHeight * 0.8 + Math.random() * 200],
          translateX: [0, (Math.random() - 0.5) * 120],
          rotate: [0, 360 + Math.random() * 360],
          opacity: [{ value: .8 }, { value: 0 }],
          duration: 8000 + Math.random() * 6000,
          easing: 'linear',
          loop: true,
          delay: Math.random() * 5000
        });
      }
    }
  });
}

function decorAnims() {
  if (typeof anime === 'undefined') return;
  anime({ targets: '.kayon-float', translateY: [-8, 8], duration: 3500, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
  anime({ targets: '.wayang-swing--left', rotate: [-4, 4], duration: 4000, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
  anime({ targets: '.wayang-swing--right', rotate: [4, -4], duration: 4200, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
  anime({ targets: '.mm-1', translateX: ['-200px', '110vw'], duration: 42000, loop: true, easing: 'linear' });
  anime({ targets: '.mm-2', translateX: ['110vw', '-200px'], duration: 52000, loop: true, easing: 'linear' });
  anime({ targets: '.corner', scale: [1, 1.04], duration: 5000, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
}

document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.body.style.overflow = 'hidden';

  setTimeout(function () {
    if (!_isDataApplied) {
      _isDataApplied = true;
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
      renderTenant({}); // Populate default logo/social segera; diperbarui oleh API jika tersedia
    }
  }, 2000);

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 900, easing: 'ease-out-cubic', once: false, offset: 80 });
  }

  spawnParticles();
  spawnMelati();
  decorAnims();

  if (el('year')) el('year').textContent = new Date().getFullYear();

  var btnOpen = el('btnOpen');
  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      var opening = el('opening');
      if (opening) opening.classList.add('is-open');
      document.body.style.overflow = 'auto';

      var audio = el('bgAudio');
      if (audio) {
        if (!audio.src && FALLBACK_DATA && FALLBACK_DATA.music) {
          audio.src = FALLBACK_DATA.music;
        }
        if (audio.src) {
          audio.play().then(function () {
            var fabAudio = el('fabAudio');
            if (fabAudio) fabAudio.querySelector('i').className = 'fa-solid fa-pause';
          }).catch(function () { });
        }
      }

      setTimeout(function () {
        var hero = el('hero');
        if (hero) hero.scrollIntoView({ behavior: 'smooth' });
        if (typeof anime !== 'undefined') {
          anime({
            targets: '.hero__names span',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(200),
            duration: 900,
            easing: 'easeOutExpo'
          });
        }
      }, 300);
    });
  }

  var fabAudio = el('fabAudio');
  var audio = el('bgAudio');
  if (fabAudio && audio) {
    fabAudio.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().then(function () {
          fabAudio.querySelector('i').className = 'fa-solid fa-pause';
        }).catch(function () { });
      } else {
        audio.pause();
        fabAudio.querySelector('i').className = 'fa-solid fa-music';
      }
    });
  }

  var fabTop = el('fabTop');
  if (fabTop) {
    fabTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      fabTop.classList.toggle('is-visible', window.scrollY > 500);
    });
  }

  var nav = el('navbar');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 60);
    });
  }

  var toggle = el('navToggle');
  var menu = el('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () { menu.classList.toggle('is-open'); });
    document.querySelectorAll('.nav-menu a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
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
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
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
