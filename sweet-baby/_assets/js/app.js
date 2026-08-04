

var FALLBACK_DATA = FALLBACK['sweet-baby'];
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

function capitalizeFirst(str) {
  if (!str) return '';
  var s = String(str).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function showNotification(message, type) {
  var n = document.createElement('div');
  n.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:100000;'
    + 'background:' + (type === 'success' ? 'linear-gradient(135deg, #E74C3C, #6BBF59)' : '#C0392B') + ';color:white;'
    + 'padding:16px 24px;border-radius:50px;box-shadow:0 4px 12px rgba(0,0,0,0.15);'
    + 'font-size:14px;font-weight:600;font-family:Poppins,sans-serif;max-width:90%;text-align:center;';
  n.textContent = message;
  document.body.appendChild(n);
  if (typeof anime !== 'undefined') {
    anime({ targets: n, translateY: ['-100%', '0%'], opacity: [0, 1], duration: 500, easing: 'easeOutCubic' });
  }
  setTimeout(function () {
    if (typeof anime !== 'undefined') {
      anime({
        targets: n, translateY: ['0%', '-100%'], opacity: [1, 0], duration: 500, easing: 'easeInCubic',
        complete: function () { if (n.parentNode) n.parentNode.removeChild(n); }
      });
    } else {
      if (n.parentNode) n.parentNode.removeChild(n);
    }
  }, 3000);
}

function animateLetters(selector, baseDelay) {
  baseDelay = baseDelay || 0;
  document.querySelectorAll(selector).forEach(function (node) {
    var text = node.textContent.trim();
    if (!text) return;
    node.innerHTML = '';
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement('span');
      s.className = 'letter';
      s.style.cssText = 'display:inline-block;opacity:0;';
      s.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      node.appendChild(s);
    }
    if (typeof anime !== 'undefined') {
      anime({
        targets: node.querySelectorAll('.letter'),
        scale: [0, 1],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 950,
        delay: function (_, i) { return baseDelay + 50 * i; }
      });
    } else {
      node.querySelectorAll('.letter').forEach(function (s) { s.style.opacity = '1'; });
    }
  });
}

function renderWishes(wishesData) {
  var c = el('wishes-list');
  if (!c) return;
  c.innerHTML = '';
  if (!wishesData || !wishesData.length) {
    c.innerHTML = '<div class="wish-empty">'
      + '<img src="_assets/img/decoration/strawberry-fruit.svg" alt="" width="40" height="40" />'
      + '<p>Belum ada ucapan. Jadilah yang pertama!</p>'
      + '</div>';
    return;
  }
  wishesData.forEach(function (w) {
    var nm = w.guest_name || w.name || '?';
    var initial = nm.charAt(0).toUpperCase();
    var item = document.createElement('div');
    item.className = 'wish-item';
    item.innerHTML = '<div class="wish-avatar">' + sanitize(initial) + '</div>'
      + '<div class="wish-body">'
      + '<p class="wish-name">' + sanitize(nm) + '</p>'
      + '<p class="wish-message">' + sanitize(w.message) + '</p>'
      + '</div>';
    c.appendChild(item);
  });
}

function renderPayment(paymentData) {
  var c = el('payment-list');
  var sec = el('gift');
  if (!c) return;
  c.innerHTML = '';
  if (!paymentData || !paymentData.length) {
    if (sec) sec.style.display = 'none';
    return;
  }
  if (sec) sec.style.display = '';
  paymentData.forEach(function (p, idx) {
    var item = document.createElement('div');
    item.className = 'payment-card';
    item.setAttribute('data-aos', 'fade-up');
    item.setAttribute('data-aos-delay', (idx * 100) + '');
    item.innerHTML = '<img src="/payment/' + sanitize(p.method) + '.png" alt="' + sanitize(p.method) + '" class="payment-logo"'
      + ' onerror="this.onerror=null;this.outerHTML=\'<p class=&quot;payment-method-label&quot;>' + sanitize(String(p.method).toUpperCase()) + '</p>\';">'
      + '<p class="payment-value">' + sanitize(p.value) + '</p>'
      + '<p class="payment-name">a.n. ' + sanitize(p.name) + '</p>'
      + '<button type="button" class="payment-copy-btn" data-copy="' + sanitize(p.value) + '"><i class="fa-solid fa-copy"></i> Salin</button>';
    c.appendChild(item);
  });
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function applyData(data) {
  var d = data;
  var f = FALLBACK_DATA;

  if (el('guest')) el('guest').textContent = d.guestName || f.guestName;

  var babyName = d.babyName || f.babyName;
  if (el('baby-name')) {
    el('baby-name').textContent = babyName;
    animateLetters('#baby-name', 600);
  }
  if (el('baby-name-2')) el('baby-name-2').textContent = babyName;
  if (el('nav-baby-name')) el('nav-baby-name').textContent = babyName;
  if (el('baby-photo') && (d.babyPhoto || f.babyPhoto)) el('baby-photo').src = d.babyPhoto || f.babyPhoto;
  if (el('baby-birthdate')) el('baby-birthdate').textContent = fmtDate(d.birthDatetime || f.birthDatetime);
  if (el('baby-place-of-born')) el('baby-place-of-born').textContent = d.placeOfBorn || f.placeOfBorn || '';
  if (el('baby-gender')) el('baby-gender').textContent = capitalizeFirst(d.gender || f.gender || '');

  if (el('father-name')) el('father-name').textContent = d.fatherName || f.fatherName || '';
  if (el('mother-name')) el('mother-name').textContent = d.motherName || f.motherName || '';

  var fullDate = fmtDate(d.eventDatetime || f.eventDatetime);
  var parts = fullDate.split(', ');
  if (el('event-day')) el('event-day').textContent = parts[0] || '';
  if (el('event-date')) el('event-date').textContent = parts[1] || '';
  if (el('event-time')) el('event-time').textContent = d.eventTime || f.eventTime || '';
  if (el('event-venue')) el('event-venue').innerHTML = sanitize(d.eventVenue || f.eventVenue);
  if (el('event-address')) el('event-address').innerHTML = sanitize(d.eventAddress || f.eventAddress);
  if (el('event-date-short')) el('event-date-short').textContent = fullDate;
  if (el('event-name')) el('event-name').innerHTML = sanitize(d.eventName || f.eventName || '');

  var mapsUrl = cleanMapsUrl(d.eventMapsUrl || f.eventMapsUrl);
  if (el('gmap_canvas')) el('gmap_canvas').src = mapsUrl;

  if (el('family-name')) el('family-name').innerHTML = sanitize(d.familyName || f.familyName);
  if (el('platform-name')) el('platform-name').textContent = d.platform || f.platform || '';

  if (el('prayer-quote')) el('prayer-quote').textContent = d.prayerQuote || f.prayerQuote || '';
  if (el('prayer-name')) el('prayer-name').textContent = d.babyName || f.babyName || '';

  if (!_projectId) {
    renderWishes((d.wishes && d.wishes.length) ? d.wishes : f.wishes);
  }

  renderPayment((d.payment && d.payment.length) ? d.payment : f.payment);

  var audio = el('audio');
  if (audio && (d.music || f.music)) {
    var newSrc = d.music || f.music;
    if (!audio.src || audio.src.indexOf(newSrc) === -1) {
      audio.src = newSrc;
      audio.load();
    }
  }

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

function handleCommentSubmit(e) {
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

var _strawberryRainActive = false;
var _strawberryRainSpawnTimer = null;
var _strawberryRainDecayTimer = null;
var _strawberryRainCount = 0;
var _strawberryRainMax = window.innerWidth < 576 ? 12 : 22;
var _strawberryRainDecaying = false;

var _strawberryImages = [
  '_assets/img/decoration/strawberry-fruit.svg',
  '_assets/img/decoration/strawberry-half.svg',
  '_assets/img/decoration/confetti-strawberry.svg'
];

function createStrawberryRainPiece() {
  if (_strawberryRainCount >= _strawberryRainMax) return;
  var container = document.querySelector('.strawberry-rain-container');
  if (!container) return;

  var piece = document.createElement('div');
  piece.className = 'strawberry-rain-piece';

  var size = 20 + Math.random() * 50;
  var startX = Math.random() * 100;
  var sway = (Math.random() - 0.5) * 120;
  var rotateEnd = (Math.random() - 0.5) * 720;
  var duration = 2500 + Math.random() * 3500;
  var imgSrc = _strawberryImages[Math.floor(Math.random() * _strawberryImages.length)];
  var op = 0.75 + Math.random() * 0.25;

  piece.style.cssText = 'left:' + startX + '%;width:' + size + 'px;height:' + size + 'px;opacity:' + op + ';';
  piece.innerHTML = '<img src="' + imgSrc + '" alt="">';
  container.appendChild(piece);
  _strawberryRainCount++;

  if (typeof anime !== 'undefined') {
    anime({
      targets: piece,
      translateY: [-80, window.innerHeight + 100],
      translateX: [0, sway],
      rotate: [0, rotateEnd],
      opacity: [op, op, 0],
      duration: duration,
      easing: 'easeInQuad',
      complete: function () {
        if (piece.parentNode) piece.parentNode.removeChild(piece);
        _strawberryRainCount = Math.max(0, _strawberryRainCount - 1);
      }
    });
  } else {
    piece.style.transition = 'transform ' + duration + 'ms ease-in, opacity ' + duration + 'ms ease-in';
    requestAnimationFrame(function () {
      piece.style.transform = 'translate(' + sway + 'px,' + (window.innerHeight + 100) + 'px) rotate(' + rotateEnd + 'deg)';
      piece.style.opacity = '0';
    });
    setTimeout(function () {
      if (piece.parentNode) piece.parentNode.removeChild(piece);
      _strawberryRainCount = Math.max(0, _strawberryRainCount - 1);
    }, duration);
  }
}

function startStrawberryRain() {
  if (_strawberryRainActive) return;
  _strawberryRainActive = true;

  var container = document.querySelector('.strawberry-rain-container');
  if (container) {
    if (container.parentNode !== document.body) {
      document.body.appendChild(container);
    }
    container.style.display = 'block';
  }

  var spawnInterval = window.innerWidth < 576 ? 600 : 380;
  _strawberryRainSpawnTimer = setInterval(function () {
    if (_strawberryRainActive) createStrawberryRainPiece();
  }, spawnInterval);

  for (var i = 0; i < 3; i++) {
    setTimeout(createStrawberryRainPiece, i * 120);
  }

  _strawberryRainDecayTimer = setTimeout(function () {
    _strawberryRainDecaying = true;
    if (_strawberryRainSpawnTimer) clearInterval(_strawberryRainSpawnTimer);
    var decayInterval = window.innerWidth < 576 ? 1200 : 800;
    _strawberryRainSpawnTimer = setInterval(function () {
      if (_strawberryRainActive) createStrawberryRainPiece();
    }, decayInterval);
  }, 8000);
}

function stopStrawberryRain() {
  _strawberryRainActive = false;
  if (_strawberryRainSpawnTimer) { clearInterval(_strawberryRainSpawnTimer); _strawberryRainSpawnTimer = null; }
  if (_strawberryRainDecayTimer) { clearTimeout(_strawberryRainDecayTimer); _strawberryRainDecayTimer = null; }
  var container = document.querySelector('.strawberry-rain-container');
  if (container) { container.innerHTML = ''; container.style.display = 'none'; }
}

function initFloatingAnimations() {
  if (typeof anime === 'undefined') return;

  anime({
    targets: '.floating-balloon',
    translateY: [-10, -25, -10],
    rotate: [-5, 5, -5],
    duration: 4000,
    easing: 'easeInOutSine',
    loop: true,
    delay: function (_, i) { return i * 500; }
  });

  anime({
    targets: '.floating-leaf',
    translateX: ['-3%', '3%'],
    rotate: [-8, 8, -8],
    duration: 6000,
    easing: 'easeInOutSine',
    direction: 'alternate',
    loop: true,
    delay: function (_, i) { return i * 700; }
  });

  anime({
    targets: '.floating-star',
    opacity: [0.3, 1, 0.3],
    scale: [0.8, 1.2, 0.8],
    duration: 2000,
    easing: 'easeInOutSine',
    loop: true,
    delay: function (_, i) { return i * 300; }
  });

  anime({
    targets: '.floating-cloud',
    translateX: ['0%', '3%'],
    duration: 8000,
    easing: 'easeInOutSine',
    direction: 'alternate',
    loop: true,
    delay: function (_, i) { return i * 1000; }
  });

  anime({
    targets: '.floating-blossom',
    translateY: [0, -12, 0],
    rotate: [-10, 10, -10],
    duration: 5000,
    easing: 'easeInOutSine',
    loop: true,
    delay: function (_, i) { return i * 400; }
  });

  anime({
    targets: '.opening-basket',
    translateY: [-8, 8],
    translateX: [-6, 6],
    duration: 5000,
    direction: 'alternate',
    easing: 'easeInOutSine',
    loop: true
  });

  anime({
    targets: '.opening-crown',
    translateY: [0, -10],
    duration: 1200,
    direction: 'alternate',
    easing: 'easeInOutQuad',
    loop: true
  });
}

function confettiBurst() {
  var container = document.querySelector('.confetti-container');
  if (!container) return;

  var shapes = ['confetti-star', 'confetti-circle', 'confetti-strawberry'];

  for (var i = 0; i < 40; i++) {
    var confetti = document.createElement('div');
    confetti.className = 'confetti-piece ' + shapes[i % shapes.length];
    confetti.style.left = Math.random() * 100 + '%';
    container.appendChild(confetti);

    if (typeof anime !== 'undefined') {
      anime({
        targets: confetti,
        translateY: [0, window.innerHeight],
        translateX: [0, (Math.random() - 0.5) * 300],
        rotate: [0, Math.random() * 720],
        opacity: [1, 0],
        duration: 2000 + Math.random() * 1500,
        easing: 'easeOutCubic',
        complete: function (animInstance) {
          var t = animInstance.animatables[0] && animInstance.animatables[0].target;
          if (t && t.parentNode) t.parentNode.removeChild(t);
        }
      });
    }
  }
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
if (_u && el('guest')) el('guest').textContent = _u;

(function () {
  var f = FALLBACK_DATA;
  if (!f) return;
  var babyName = f.babyName || '';
  var set = function (id, val) { var n = document.getElementById(id); if (n) n.textContent = val; };
  set('baby-name', babyName);
  set('baby-name-2', babyName);
  set('nav-baby-name', babyName);
  set('event-date-short', fmtDate(f.eventDatetime));
  set('father-name', f.fatherName || '');
  set('mother-name', f.motherName || '');
  set('family-name', f.familyName || '');
  set('platform-name', f.platform || '');
})();

document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  var yearNode = el('year');
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  setTimeout(function () {
    if (!_isDataApplied) {
      _isDataApplied = true;
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
      renderTenant({});
      window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
    }
  }, 2000);

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: false, mirror: true, offset: 50 });
  }

  initFloatingAnimations();

  var btnOpen = el('btn-open-opening');
  if (btnOpen) {
    btnOpen.addEventListener('click', function () {

      startStrawberryRain();

      confettiBurst();

      document.body.classList.remove('opening-show');
      document.body.classList.add('opening-hide');

      var audio = el('audio');
      if (audio && audio.src) {
        audio.play().then(function () {
          var btnAudio = el('btn-audio');
          if (btnAudio) btnAudio.innerHTML = '<i class="fa-solid fa-music"></i>';
        }).catch(function () { });
      }

      setTimeout(function () {
        var opening = document.querySelector('section#opening');
        if (opening && opening.parentNode) opening.parentNode.removeChild(opening);
        document.body.classList.remove('opening-hide');
        if (typeof AOS !== 'undefined') AOS.refresh();

        var babyPhotoFrame = document.querySelector('.baby-photo-frame');
        if (babyPhotoFrame) {
          setTimeout(function () {
            if (typeof anime !== 'undefined') {
              anime({
                targets: '.baby-photo-frame',
                scale: [0.3, 1],
                opacity: [0, 1],
                duration: 900,
                easing: 'easeOutCubic',
                begin: function () {
                  babyPhotoFrame.classList.remove('baby-photo-hidden');
                }
              });
            } else {
              babyPhotoFrame.classList.remove('baby-photo-hidden');
              babyPhotoFrame.style.opacity = '1';
              babyPhotoFrame.style.transform = 'scale(1)';
            }
          }, 200);
        }
      }, 1500);
    });
  }

  var btnAudio = el('btn-audio');
  var audio = el('audio');
  if (btnAudio && audio) {
    btnAudio.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().then(function () {
          btnAudio.innerHTML = '<i class="fa-solid fa-music"></i>';
        }).catch(function () { });
      } else {
        audio.pause();
        btnAudio.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      }
    });
  }

  var btnScrollTop = el('btn-scroll-top');
  if (btnScrollTop) {
    btnScrollTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      btnScrollTop.style.display = window.scrollY > 500 ? 'flex' : 'none';
    });
  }

  var navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
    });
  }

  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  function onScroll() {
    var y = window.pageYOffset;
    var current = sections.length ? sections[0].getAttribute('id') : '';
    sections.forEach(function (section) {
      if (y >= section.offsetTop - 120) {
        current = section.getAttribute('id');
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

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-copy]');
    if (!btn) return;
    var val = btn.getAttribute('data-copy');
    var done = function () {
      var orig = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
      btn.style.background = '#6BBF59';
      btn.style.color = '#FFFFFF';
      setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; }, 1800);
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
  if (rsvpForm) rsvpForm.addEventListener('submit', handleCommentSubmit);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && _strawberryRainActive && _strawberryRainDecaying) {
      stopStrawberryRain();
    }
  });
});
