

var FALLBACK_DATA = FALLBACK['clear-sky'];
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

var BASE = '_assets/img/decoration/';
function mkImg(name, cls) {
  var i = document.createElement('img');
  i.src = BASE + name;
  i.className = 'deco ' + (cls || '');
  i.alt = '';
  i.setAttribute('aria-hidden', 'true');
  return i;
}

function spawnDecorations() {
  var hasAnime = typeof anime !== 'undefined';

  var openLayer = document.getElementById('opening-deco');
  if (openLayer) {
    var c1 = mkImg('cloud-1.svg', 'cloud');
    c1.style.cssText = 'top:12%;left:-15%;width:24rem;';
    var c2 = mkImg('cloud-2.svg', 'cloud');
    c2.style.cssText = 'top:30%;right:-10%;width:18rem;';
    var c3 = mkImg('cloud-3.svg', 'cloud');
    c3.style.cssText = 'bottom:18%;left:-10%;width:30rem;';
    var sun = mkImg('sun-ray.svg', 'sun-ray');
    sun.style.cssText = 'top:-8rem;right:-8rem;width:30rem;';
    openLayer.appendChild(c1); openLayer.appendChild(c2); openLayer.appendChild(c3); openLayer.appendChild(sun);

    var bird = mkImg('bird-2.svg', 'bird');
    bird.style.cssText = 'top:25%;left:-10%;width:8rem;';
    openLayer.appendChild(bird);

    for (var p = 0; p < 8; p++) {
      var pt = mkImg(p % 2 ? 'petal-1.svg' : 'petal-2.svg', 'petal');
      pt.style.cssText = 'top:-5%;left:' + (Math.random() * 100) + '%;width:' + (1.6 + Math.random() * 1.4) + 'rem;';
      openLayer.appendChild(pt);
    }

    if (hasAnime) {
      anime({ targets: c1, translateX: ['-15vw', '115vw'], duration: 30000, easing: 'linear', loop: true });
      anime({ targets: c2, translateX: ['115vw', '-15vw'], duration: 45000, easing: 'linear', loop: true });
      anime({ targets: c3, translateX: ['-15vw', '115vw'], duration: 60000, easing: 'linear', loop: true, delay: 5000 });
      anime({ targets: sun, rotate: '1turn', duration: 60000, easing: 'linear', loop: true });
      anime({ targets: bird, translateX: ['-10vw', '110vw'], translateY: [{ value: -20, duration: 2000 }, { value: 20, duration: 2000 }], duration: 18000, easing: 'linear', loop: true });
      anime({
        targets: openLayer.querySelectorAll('.petal'),
        translateY: ['-10vh', '110vh'],
        translateX: function () { return anime.random(-80, 80); },
        rotate: function () { return anime.random(0, 360); },
        duration: function () { return anime.random(8000, 14000); },
        delay: anime.stagger(800),
        easing: 'linear',
        loop: true
      });
    }
  }

  var heroLayer = document.getElementById('hero-deco');
  if (heroLayer) {
    var h1 = mkImg('cloud-1.svg', 'cloud');
    h1.style.cssText = 'top:10%;left:-15%;width:28rem;';
    var h2 = mkImg('cloud-2.svg', 'cloud');
    h2.style.cssText = 'top:35%;right:-12%;width:22rem;';
    var hb = mkImg('bird-1.svg', 'bird');
    hb.style.cssText = 'top:20%;left:-8%;width:4rem;opacity:.55;';
    heroLayer.appendChild(h1); heroLayer.appendChild(h2); heroLayer.appendChild(hb);
    if (hasAnime) {
      anime({ targets: h1, translateX: ['-15vw', '115vw'], duration: 50000, easing: 'linear', loop: true });
      anime({ targets: h2, translateX: ['115vw', '-15vw'], duration: 70000, easing: 'linear', loop: true });
      anime({ targets: hb, translateX: ['-8vw', '110vw'], translateY: [{ value: -15, duration: 2500 }, { value: 15, duration: 2500 }], duration: 22000, easing: 'linear', loop: true });
    }
  }

  var coupleLayer = document.getElementById('couple-deco');
  if (coupleLayer) {
    for (var cp = 0; cp < 16; cp++) {
      var cpt = mkImg(cp % 2 ? 'petal-1.svg' : 'petal-2.svg', 'petal');
      cpt.style.cssText = 'top:-5%;left:' + (Math.random() * 100) + '%;width:' + (1.2 + Math.random() * 1.2) + 'rem;';
      coupleLayer.appendChild(cpt);
    }
    if (hasAnime) {
      anime({
        targets: coupleLayer.querySelectorAll('.petal'),
        translateY: ['-10vh', '110vh'],
        translateX: function () { return anime.random(-60, 60); },
        rotate: function () { return anime.random(0, 360); },
        duration: function () { return anime.random(8000, 15000); },
        delay: anime.stagger(500, { from: 'first' }),
        easing: 'linear',
        loop: true
      });
    }
  }

  var storyLayer = document.getElementById('story-deco');
  if (storyLayer) {
    for (var i = 0; i < 16; i++) {
      var pt2 = mkImg(i % 2 ? 'petal-1.svg' : 'petal-2.svg', 'petal');
      pt2.style.cssText = 'top:-5%;left:' + (Math.random() * 100) + '%;width:' + (1.2 + Math.random() * 1.2) + 'rem;';
      storyLayer.appendChild(pt2);
    }
    for (var s = 0; s < 8; s++) {
      var st = mkImg('star-small.svg', 'star');
      st.style.cssText = 'top:' + (Math.random() * 90) + '%;left:' + (Math.random() * 100) + '%;width:1.2rem;';
      storyLayer.appendChild(st);
    }
    if (hasAnime) {
      anime({
        targets: storyLayer.querySelectorAll('.petal'),
        translateY: ['-10vh', '110vh'],
        rotate: function () { return anime.random(0, 360); },
        duration: function () { return anime.random(10000, 16000); },
        delay: anime.stagger(1000),
        easing: 'linear',
        loop: true
      });
      anime({
        targets: storyLayer.querySelectorAll('.star'),
        opacity: [{ value: .2 }, { value: 1 }, { value: .2 }],
        scale: [{ value: .8 }, { value: 1.3 }, { value: .8 }],
        duration: function () { return anime.random(2000, 4000); },
        delay: anime.stagger(300),
        easing: 'easeInOutSine',
        loop: true
      });
    }
  }

  var rsvpLayer = document.getElementById('rsvp-deco');
  if (rsvpLayer) {
    for (var rp = 0; rp < 16; rp++) {
      var rpt = mkImg(rp % 2 ? 'petal-1.svg' : 'petal-2.svg', 'petal');
      rpt.style.cssText = 'top:-5%;left:' + (Math.random() * 100) + '%;width:' + (1.2 + Math.random() * 1.2) + 'rem;';
      rsvpLayer.appendChild(rpt);
    }
    if (hasAnime) {
      anime({
        targets: rsvpLayer.querySelectorAll('.petal'),
        translateY: ['-10vh', '110vh'],
        translateX: function () { return anime.random(-60, 60); },
        rotate: function () { return anime.random(0, 360); },
        duration: function () { return anime.random(8000, 15000); },
        delay: anime.stagger(500, { from: 'first' }),
        easing: 'linear',
        loop: true
      });
    }
  }

  var closingLayer = document.getElementById('closing-deco');
  if (closingLayer) {
    for (var s2 = 0; s2 < 12; s2++) {
      var st2 = mkImg('star-small.svg', 'star');
      st2.style.cssText = 'top:' + (Math.random() * 80) + '%;left:' + (Math.random() * 100) + '%;width:1rem;';
      closingLayer.appendChild(st2);
    }
    var cb = mkImg('bird-2.svg', 'bird');
    cb.style.cssText = 'top:30%;left:-10%;width:6rem;opacity:.85;';
    closingLayer.appendChild(cb);
    var sr = mkImg('sun-ray.svg', 'sun-ray');
    sr.style.cssText = 'bottom:-10rem;left:-10rem;width:36rem;opacity:.2;';
    closingLayer.appendChild(sr);
    if (hasAnime) {
      anime({
        targets: closingLayer.querySelectorAll('.star'),
        opacity: [{ value: .2 }, { value: 1 }, { value: .2 }],
        duration: function () { return anime.random(1800, 3500); },
        delay: anime.stagger(250),
        easing: 'easeInOutSine',
        loop: true
      });
      anime({ targets: cb, translateX: ['-10vw', '110vw'], translateY: [{ value: -20 }, { value: 10 }], duration: 24000, easing: 'linear', loop: true });
      anime({ targets: sr, rotate: '1turn', duration: 80000, easing: 'linear', loop: true });
    }
  }
}

function animateLetters(selector, baseDelay) {
  if (typeof anime === 'undefined') return;
  baseDelay = baseDelay || 0;
  document.querySelectorAll(selector).forEach(function (node, nodeIndex) {
    node.innerHTML = node.textContent.replace(/\S/g, function (char) {
      return '<span class="letter" style="display:inline-block;">' + char + '</span>';
    });
    anime({
      targets: node.querySelectorAll('.letter'),
      opacity: [0, 1],
      translateY: [20, 0],
      easing: 'easeOutExpo',
      duration: 1000,
      delay: anime.stagger(50, { start: baseDelay + nodeIndex * 300 })
    });
  });
}

function startCountdown(target) {
  if (!target) return;
  var elD = el('cd-days'), elH = el('cd-hours'), elM = el('cd-mins'), elS = el('cd-secs');
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
  var c = el('story-list');
  if (!c) return;
  c.innerHTML = '';
  (stories || []).forEach(function (s, idx) {
    var item = document.createElement('div');
    item.className = 'tl-item';
    item.setAttribute('data-aos', 'fade-up');
    item.setAttribute('data-aos-delay', (idx * 100) + '');
    item.innerHTML = '<span class="tl-item__node"></span>'
      + '<div class="tl-card">'
      + '<div class="tl-year">' + sanitize(s.year) + '</div>'
      + '<h4 class="tl-title">' + sanitize(s.title) + '</h4>'
      + '<p class="tl-desc">' + sanitize(s.description) + '</p>'
      + '</div>';
    c.appendChild(item);
  });
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderWishes(wishesData) {
  var c = el('wishes-list');
  if (!c) return;
  c.innerHTML = '';
  if (!wishesData || !wishesData.length) {
    c.innerHTML = '<p style="text-align:center;color:#8AAFC8;font-style:italic;padding:2rem;">Belum ada ucapan. Jadilah yang pertama!</p>';
    return;
  }
  wishesData.forEach(function (w) {
    var nm = w.guest_name || w.name || '?';
    var initial = nm.charAt(0).toUpperCase();
    var item = document.createElement('div');
    item.className = 'wish-item';
    item.innerHTML = '<div class="wish-avatar">' + sanitize(initial) + '</div>'
      + '<div class="wish-body">'
      + '<div class="wish-name">' + sanitize(nm) + '</div>'
      + '<div class="wish-msg">' + sanitize(w.message) + '</div>'
      + '</div>';
    c.appendChild(item);
  });
}

function renderPayment(paymentData) {
  var c = el('gift-list');
  if (!c) return;
  c.innerHTML = '';
  (paymentData || []).forEach(function (p, idx) {
    var item = document.createElement('div');
    item.className = 'gift-card';
    item.setAttribute('data-aos', 'fade-up');
    item.setAttribute('data-aos-delay', (idx * 100) + '');
    item.innerHTML = '<img src="/payment/' + sanitize(p.method) + '.png" alt="' + sanitize(p.method) + '" class="gift-card__logo">'
      + '<div class="gift-card__num">' + sanitize(p.value) + '</div>'
      + '<div class="gift-card__name">a.n. ' + sanitize(p.name) + '</div>'
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

  if (el('guest')) el('guest').textContent = d.guestName || f.guestName;
  if (el('groom-name')) el('groom-name').textContent = groomName;
  if (el('bride-name')) el('bride-name').textContent = brideName;
  if (el('opening-date')) el('opening-date').textContent = fmtDate(d.receptionDatetime || f.receptionDatetime);

  if (el('nav-brand')) el('nav-brand').textContent = groomName.split(' ')[0] + ' & ' + brideName.split(' ')[0];

  if (el('hero-groom')) el('hero-groom').textContent = groomName;
  if (el('hero-bride')) el('hero-bride').textContent = brideName;
  if (el('hero-date')) el('hero-date').textContent = fmtDate(d.receptionDatetime || f.receptionDatetime);

  if (el('groom-parents')) el('groom-parents').textContent = d.groomDesc || f.groomDesc || '';
  if (el('bride-parents')) el('bride-parents').textContent = d.brideDesc || f.brideDesc || '';
  if (el('hero-groom-2')) el('hero-groom-2').textContent = groomName;
  if (el('hero-bride-2')) el('hero-bride-2').textContent = brideName;

  if (el('closing-groom')) el('closing-groom').textContent = groomName;
  if (el('closing-bride')) el('closing-bride').textContent = brideName;

  if (el('quote')) el('quote').textContent = d.quote || f.quote || '';
  document.querySelectorAll('.platform-name').forEach(function (node) {
    node.textContent = d.platform || f.platform || 'Your platform';
  });

  if (el('year')) el('year').textContent = new Date().getFullYear();

  if (el('akad-date')) el('akad-date').textContent = fmtDate(d.akadDatetime || f.akadDatetime);
  if (el('akad-time')) el('akad-time').textContent = fmtTime(d.akadDatetime || f.akadDatetime);
  if (el('akad-venue')) el('akad-venue').textContent = d.akadVenue || f.akadVenue || '';
  if (el('akad-address')) el('akad-address').textContent = d.akadAddress || f.akadAddress || '';
  var akadMap = el('akad-map');
  if (akadMap) akadMap.src = cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) || '';

  if (el('rec-date')) el('rec-date').textContent = fmtDate(d.receptionDatetime || f.receptionDatetime);
  if (el('rec-time')) el('rec-time').textContent = fmtTime(d.receptionDatetime || f.receptionDatetime);
  if (el('rec-venue')) el('rec-venue').textContent = d.receptionVenue || f.receptionVenue || '';
  if (el('rec-address')) el('rec-address').textContent = d.receptionAddress || f.receptionAddress || '';
  var recMap = el('rec-map');
  if (recMap) recMap.src = cleanMapsUrl(d.receptionMapsUrl || f.receptionMapsUrl) || '';

  startCountdown(d.receptionDatetime || f.receptionDatetime);

  renderStory(d.stories != null ? d.stories : f.stories);

  if (!_projectId) {
    renderWishes((d.wishes && d.wishes.length) ? d.wishes : f.wishes);
  }

  renderPayment((d.payment && d.payment.length) ? d.payment : f.payment);

  var audio = el('bg-audio');
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
  var set = function (id, val) { var n = document.getElementById(id); if (n) n.textContent = val; };
  set('groom-name', groomName);
  set('bride-name', brideName);
  set('hero-groom', groomName);
  set('hero-bride', brideName);
  set('hero-groom-2', groomName);
  set('hero-bride-2', brideName);
  set('nav-brand', (groomName.split(' ')[0] || '') + ' & ' + (brideName.split(' ')[0] || ''));
})();

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
    AOS.init({ duration: 900, easing: 'ease-out-cubic', once: false, offset: 80 });
  }

  spawnDecorations();
  animateLetters('.couple-name', 200);

  el('year') && (el('year').textContent = new Date().getFullYear());

  var btnOpen = el('btn-open');
  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      var opening = el('opening');
      if (opening) opening.classList.add('opening-hide');
      document.body.classList.remove('opening-show');

      var audio = el('bg-audio');
      if (audio && audio.src) {
        audio.play().then(function () {
          var fabAudio = el('fab-audio');
          if (fabAudio) fabAudio.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }).catch(function () { });
      }

      setTimeout(function () {
        if (opening && opening.parentNode) opening.parentNode.removeChild(opening);
        animateLetters('#hero-groom, #hero-bride', 200);
        if (typeof AOS !== 'undefined') AOS.refresh();
      }, 2000);
    });
  }

  var fabAudio = el('fab-audio');
  var audio = el('bg-audio');
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

  var fabTop = el('fab-top');
  if (fabTop) {
    fabTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      fabTop.classList.toggle('show', window.scrollY > 500);
    });
  }

  var nav = document.querySelector('.nav-cs');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  var toggle = document.querySelector('.nav-cs__toggle');
  var menu = document.querySelector('.nav-cs__menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () { menu.classList.toggle('open'); });
    document.querySelectorAll('.nav-cs__menu a').forEach(function (a) {
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
      setTimeout(function () { btn.innerHTML = orig; }, 1800);
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
