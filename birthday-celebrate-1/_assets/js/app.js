

var FALLBACK_DATA = FALLBACK['birthday-celebrate-1'];
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

function sanitize(str) {
  if (str == null) return '';
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

function showNotification(message, type) {
  var n = document.createElement('div');
  n.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;'
    + 'background:' + (type === 'success' ? 'linear-gradient(135deg, #FF6B6B, #FFD93D)' : '#E85D5D') + ';color:white;'
    + 'padding:16px 24px;border-radius:50px;box-shadow:0 4px 12px rgba(0,0,0,0.15);'
    + 'font-size:14px;font-weight:600;font-family:Nunito,sans-serif;max-width:90%;text-align:center;transition:all .4s ease;';
  n.textContent = message;
  document.body.appendChild(n);
  requestAnimationFrame(function () { n.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(function () {
    n.style.opacity = '0';
    n.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 400);
  }, 3000);
}

var _lgInstance = null;

function destroyGallery() {
  if (_lgInstance && typeof _lgInstance.destroy === 'function') {
    try { _lgInstance.destroy(true); } catch (e) { }
  }
  _lgInstance = null;
}

function renderGallery(galleryData) {
  destroyGallery();

  var slots = 5;
  var container = el('row-lightgallery');
  var hasAny = galleryData && galleryData.length;

  for (var i = 1; i <= slots; i++) {
    var imgEl = el('gallery-img-' + i);
    var itemEl = el('gallery-item-' + i);
    var col = itemEl ? itemEl.closest('.gallery-col') : null;

    if (hasAny && galleryData[i - 1]) {
      var src = galleryData[i - 1];
      if (imgEl) imgEl.src = src;
      if (itemEl) itemEl.setAttribute('data-src', src);
      if (col) col.style.display = '';
    } else {
      if (imgEl) imgEl.removeAttribute('src');
      if (itemEl) itemEl.removeAttribute('data-src');
      if (col) col.style.display = 'none';
    }
  }

  if (container) {
    var empty = container.querySelector('.gallery-empty');
    if (!hasAny) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'gallery-empty';
        empty.innerHTML = '<p>Belum ada foto galeri.</p>';
        container.appendChild(empty);
      }
      empty.style.display = '';
    } else if (empty) {
      empty.style.display = 'none';
    }
  }

  if (hasAny && container && typeof lightGallery === 'function') {
    _lgInstance = lightGallery(container, {
      mode: 'lg-fade',
      cssEasing: 'ease-in',
      speed: 1000,
      backdropDuration: 500,
      hideBarsDelay: 500,
      selector: '[data-src]',
      download: false
    });
  }

  if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderWishes(wishesData) {
  var c = el('wishes-list');
  if (!c) return;
  c.innerHTML = '';
  if (!wishesData || !wishesData.length) {
    c.innerHTML = '<div class="wishes-empty"><p>Belum ada ucapan. Jadilah yang pertama!</p></div>';
    return;
  }
  wishesData.forEach(function (w, i) {
    var nm = w.guest_name || w.name || 'Anonim';
    var initial = String(nm).charAt(0).toUpperCase();
    var item = document.createElement('div');
    item.className = 'wish-card';
    item.setAttribute('data-aos', 'fade-up');
    item.setAttribute('data-aos-delay', (i * 80) + '');
    item.innerHTML = '<div class="wish-avatar">' + sanitize(initial) + '</div>'
      + '<div><div class="wish-name">' + sanitize(nm) + '</div>'
      + '<div class="wish-msg">' + sanitize(w.message) + '</div></div>';
    c.appendChild(item);
  });
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderPayment(paymentData) {
  var c = el('payment-list');
  if (!c) return;
  c.innerHTML = '';
  if (!paymentData || !paymentData.length) return;
  paymentData.forEach(function (p, i) {
    var item = document.createElement('div');
    item.className = 'pay-card';
    item.setAttribute('data-aos', 'fade-up');
    item.setAttribute('data-aos-delay', (i * 100) + '');
    var methodUpper = sanitize(String(p.method).toUpperCase());
    item.innerHTML = '<img src="/payment/' + sanitize(p.method) + '.png" alt="' + sanitize(p.method) + '" class="pay-logo"'
      + ' onerror="this.onerror=null;this.outerHTML=\'<div class=&quot;pay-method&quot;>' + methodUpper + '</div>\';">'
      + '<div class="pay-value">' + sanitize(p.value) + '</div>'
      + '<div class="pay-name">a.n. ' + sanitize(p.name) + '</div>'
      + '<button type="button" class="btn-copy" data-copy="' + sanitize(p.value) + '"><i class="fa-solid fa-copy"></i> Salin</button>';
    c.appendChild(item);
  });
  if (typeof AOS !== 'undefined') AOS.refresh();
}

var _countdownTimer = null;
function startCountdown(target) {
  if (_countdownTimer) clearInterval(_countdownTimer);
  function tick() {
    var diff = Math.max(0, target - Date.now());
    var d = Math.floor(diff / 86400000);
    var h = Math.floor(diff % 86400000 / 3600000);
    var m = Math.floor(diff % 3600000 / 60000);
    var s = Math.floor(diff % 60000 / 1000);
    if (el('cd-d')) el('cd-d').textContent = ('0' + d).slice(-2);
    if (el('cd-h')) el('cd-h').textContent = ('0' + h).slice(-2);
    if (el('cd-m')) el('cd-m').textContent = ('0' + m).slice(-2);
    if (el('cd-s')) el('cd-s').textContent = ('0' + s).slice(-2);
  }
  tick();
  _countdownTimer = setInterval(tick, 1000);
}

function applyData(data) {
  var d = data;
  var f = FALLBACK_DATA;

  if (el('guest')) el('guest').innerHTML = sanitize(d.guestName || f.guestName);

  var birthdayName = d.birthdayName || f.birthdayName;
  if (el('birthday-name-opening')) el('birthday-name-opening').textContent = birthdayName;
  if (el('birthday-name')) el('birthday-name').textContent = birthdayName;
  if (el('closing-name')) el('closing-name').textContent = birthdayName;

  var eventDatetime = d.eventDatetime || f.eventDatetime;
  if (el('save-the-date')) el('save-the-date').textContent = fmtDate(eventDatetime);

  if (el('birthday-photo') && (d.birthdayPhoto || f.birthdayPhoto)) el('birthday-photo').src = d.birthdayPhoto || f.birthdayPhoto;
  if (el('birthday-parents')) el('birthday-parents').textContent = d.birthdayParents || f.birthdayParents || '';
  if (el('birthday-quote')) el('birthday-quote').textContent = d.birthdayQuote || f.birthdayQuote || '';
  if (el('birth-date')) el('birth-date').textContent = fmtDate(d.birthDate || f.birthDate);

  renderGallery((d.gallery && d.gallery.length) ? d.gallery : f.gallery);

  if (el('event-desc')) el('event-desc').textContent = d.eventDesc || f.eventDesc || '';
  if (el('event-date')) el('event-date').textContent = fmtDate(eventDatetime);
  if (el('event-time')) el('event-time').textContent = d.eventTime || f.eventTime || '';
  if (el('event-venue')) el('event-venue').textContent = d.eventVenue || f.eventVenue || '';

  if (el('event-address')) el('event-address').textContent = d.eventAddress || f.eventAddress || '';
  var mapsUrl = cleanMapsUrl(d.eventMapsUrl || f.eventMapsUrl);
  if (el('gmap_canvas')) el('gmap_canvas').src = mapsUrl;
  if (el('btn-open-maps')) {
    var q = encodeURIComponent((d.eventVenue || f.eventVenue || '') + ' ' + (d.eventAddress || f.eventAddress || ''));
    el('btn-open-maps').href = 'https://www.google.com/maps/search/' + q;
  }

  if (el('rsvp-photo') && (d.rsvpPhoto || f.rsvpPhoto)) el('rsvp-photo').src = d.rsvpPhoto || f.rsvpPhoto;

  if (el('platform-name')) el('platform-name').textContent = d.platform || f.platform || '';
  if (el('year')) el('year').textContent = new Date().getFullYear();

  if (!_projectId) {
    renderWishes((d.wishes && d.wishes.length) ? d.wishes : f.wishes);
  }

  renderPayment((d.payment && d.payment.length) ? d.payment : f.payment);

  var audio = el('audio');
  if (audio && (d.music || f.music)) {
    var newSrc = d.music || f.music;
    if (!audio.src || audio.src.indexOf(newSrc) === -1) {
      var srcEl = audio.querySelector('source');
      if (srcEl) {
        srcEl.setAttribute('src', newSrc);
        audio.load();
      } else {
        audio.src = newSrc;
        audio.load();
      }
    }
  }

  startCountdown(new Date(eventDatetime).getTime());

  setTimeout(function () {
    if (typeof AOS !== 'undefined') AOS.refresh();
  }, 150);
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
        window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
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
      window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
    })
    .catch(function () {
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
      notifyLoaded();
      renderTenant({});
      window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
    });
});

var _url = new URL(window.location.href);
var _u = _url.searchParams.get('to') || _url.searchParams.get('name') || '';
if (_u) _u = _u.replace(/_/g, ' ');
if (_u && el('guest')) el('guest').innerHTML = sanitize(_u);

(function () {
  var f = FALLBACK_DATA;
  if (!f) return;
  var set = function (id, val) { var n = document.getElementById(id); if (n) n.textContent = val; };
  set('guest', f.guestName);
  set('birthday-name-opening', f.birthdayName);
  set('save-the-date', fmtDate(f.eventDatetime));
  set('birthday-name', f.birthdayName);
  set('closing-name', f.birthdayName);
  set('platform-name', f.platform || '');
})();

function initFallingConfetti() {
  var c = el('confetti-rain');
  if (!c) return;

  var colors = ['#FF6B6B', '#FFD93D', '#4ECDC4', '#A78BFA', '#FF6B9D', '#6BCB77'];
  var shapes = ['circle', 'star', 'ribbon'];

  for (var i = 0; i < 28; i++) {
    var piece = document.createElement('div');
    piece.className = 'falling-confetti';
    var shape = shapes[i % shapes.length];
    var color = colors[i % colors.length];
    var size = 6 + Math.random() * 8;
    piece.style.left = (Math.random() * 100) + '%';
    piece.style.animationDuration = (6 + Math.random() * 7) + 's';
    piece.style.animationDelay = (Math.random() * 8) + 's';
    if (shape === 'circle') {
      piece.style.width = size + 'px';
      piece.style.height = size + 'px';
      piece.style.background = color;
      piece.style.borderRadius = '50%';
    } else if (shape === 'ribbon') {
      piece.style.width = (size * .4) + 'px';
      piece.style.height = (size * 2) + 'px';
      piece.style.background = color;
      piece.style.borderRadius = '2px';
    } else {
      piece.innerHTML = '<svg width="' + (size * 1.5) + '" height="' + (size * 1.5) + '" viewBox="0 0 20 20"><polygon points="10,1 12,7 19,7 13,11 15,18 10,14 5,18 7,11 1,7 8,7" fill="' + color + '"/></svg>';
    }
    c.appendChild(piece);
  }

  var balloonColors = ['#FF6B6B', '#FFD93D', '#4ECDC4', '#A78BFA', '#FF6B9D', '#6BCB77'];
  for (var b = 0; b < 6; b++) {
    var balloon = document.createElement('div');
    balloon.className = 'floating-balloon-deco';
    balloon.style.left = (5 + Math.random() * 90) + '%';
    balloon.style.animationDuration = (10 + Math.random() * 8) + 's';
    balloon.style.animationDelay = (Math.random() * 10) + 's';
    var col = balloonColors[b % balloonColors.length];
    balloon.innerHTML = '<svg width="40" height="60" viewBox="0 0 40 60"><ellipse cx="20" cy="20" rx="16" ry="20" fill="' + col + '"/><polygon points="17,38 23,38 20,44" fill="' + col + '"/><line x1="20" y1="44" x2="20" y2="60" stroke="#666" stroke-width="1"/></svg>';
    c.appendChild(balloon);
  }
}

document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  setTimeout(function () {
    if (!_isDataApplied) {
      _isDataApplied = true;
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
      renderTenant({});
      window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
    }
  }, 2000);

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 1000, once: false, mirror: true, offset: -30 });
  }

  var btnOpen = el('btn-open-opening');
  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      var opening = el('opening');
      if (opening) opening.classList.add('hide');

      if (typeof AOS !== 'undefined') {
        document.querySelectorAll('.aos-init').forEach(function (aos) {
          aos.classList.remove('aos-animate');
        });
      }

      document.body.classList.remove('no-scroll');
      initFallingConfetti();

      setTimeout(function () {
        var op = el('opening');
        if (op && op.parentNode) op.parentNode.removeChild(op);
        if (typeof AOS !== 'undefined') AOS.refresh();
      }, 1000);

      var audio = el('audio');
      if (audio) audio.play().catch(function () { });
      if (el('btn-play')) el('btn-play').innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    });
  }

  var btnPlay = el('btn-play');
  var audio = el('audio');
  if (btnPlay && audio) {
    btnPlay.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().catch(function () { });
        btnPlay.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      } else {
        audio.pause();
        btnPlay.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      }
    });
  }

  var btnToTop = el('btn-to-top');
  if (btnToTop) {
    btnToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      btnToTop.style.display = window.scrollY > 200 ? 'flex' : 'none';
    });
  }

  var sections = document.querySelectorAll('section[id^="section-"]');
  var navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  function onScroll() {
    var y = window.pageYOffset;
    var current = '';
    sections.forEach(function (section) {
      if (y >= section.offsetTop - 140) {
        current = section.id;
      }
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll);
  onScroll();

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var collapse = document.querySelector('.navbar-collapse');
      if (collapse && collapse.classList.contains('show') && typeof bootstrap !== 'undefined') {
        bootstrap.Collapse.getOrCreateInstance(collapse).hide();
      }
    });
  });

  document.querySelectorAll('.attendance-row').forEach(function (row) {
    row.addEventListener('change', function () {
      row.querySelectorAll('.att-opt').forEach(function (o) { o.classList.remove('selected'); });
      var checked = row.querySelector('input:checked');
      if (checked && checked.closest('.att-opt')) checked.closest('.att-opt').classList.add('selected');
    });
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-copy]');
    if (!btn) return;
    var val = btn.getAttribute('data-copy');
    var done = function () {
      var orig = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
      btn.style.background = 'var(--accent)';
      btn.style.color = 'var(--dark)';
      setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val).then(done).catch(done);
    } else {
      var ta = document.createElement('textarea'); ta.value = val; document.body.appendChild(ta);
      ta.select(); try { document.execCommand('copy'); } catch (_) { }
      document.body.removeChild(ta); done();
    }
  });

  var rsvpForm = el('rsvp-form');
  if (rsvpForm) rsvpForm.addEventListener('submit', handleRSVP);
});
