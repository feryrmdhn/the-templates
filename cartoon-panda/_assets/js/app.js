

var FALLBACK_DATA = FALLBACK['cartoon-panda'];
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
  if (!hasAnime) return;

  var SVG = {
    bamboo: function (variant) {
      var green = variant !== 'yellow';
      var stalk = green ? '#4E8B33' : '#C4A635';
      var node = green ? '#3D6E27' : '#9E8228';
      var leaf = green ? '#6BAF4A' : '#E0C94A';
      return '<svg class="deco deco--bamboo" viewBox="0 0 44 120" style="width:36px"><rect x="16" y="2" width="12" height="30" rx="5" fill="' + stalk + '"/><rect x="16" y="38" width="12" height="30" rx="5" fill="' + stalk + '"/><rect x="16" y="74" width="12" height="44" rx="5" fill="' + stalk + '"/><ellipse cx="22" cy="34" rx="8" ry="3" fill="' + node + '"/><ellipse cx="22" cy="70" rx="8" ry="3" fill="' + node + '"/><path d="M16 14 Q4 6 10-2 Q14 6 16 14Z" fill="' + leaf + '" opacity=".85"/><path d="M28 50 Q40 42 38 32 Q34 44 28 50Z" fill="' + leaf + '" opacity=".85"/><path d="M16 86 Q4 78 10 68 Q14 78 16 86Z" fill="' + leaf + '" opacity=".85"/><path d="M28 18 Q38 14 36 6 Q34 14 28 18Z" fill="' + leaf + '" opacity=".7"/></svg>';
    },
    cloud: function () {
      return '<svg class="deco deco--cloud" viewBox="0 0 130 70" style="width:130px;opacity:0.9"><g fill="#fff"><ellipse cx="35" cy="45" rx="28" ry="18"/><ellipse cx="70" cy="35" rx="34" ry="22"/><ellipse cx="100" cy="48" rx="22" ry="15"/></g></svg>';
    },
    star: function (color) {
      return '<svg class="deco deco--star" viewBox="0 0 24 24" style="width:22px"><path fill="' + (color || '#FFD93D') + '" d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1z"/></svg>';
    },
    confetti: function (color) {
      return '<svg class="deco deco--confetti" viewBox="0 0 16 16" style="width:22px"><rect width="8" height="3" rx="1" fill="' + color + '" transform="rotate(35 4 1.5)"/></svg>';
    }
  };

  var COLORS = ['#FF6B9D', '#FFD93D', '#6BCB77', '#FF8FB3', '#FFE066', '#FFB8D1'];

  var openLayer = document.getElementById('opening-deco');
  if (openLayer) {
    for (var i = 0; i < 8; i++) {
      var balloon = document.createElement('div');
      balloon.style.cssText = 'position:absolute;left:' + (5 + i * 12) + '%;top:' + (60 + Math.random() * 30) + '%;';
      balloon.innerHTML = SVG.bamboo(i % 2 === 0 ? 'green' : 'yellow');
      openLayer.appendChild(balloon);
      balloon.style.animation = 'bamboo-rise ' + (9 + Math.random() * 6) + 's ' + (i * 0.8) + 's linear infinite';
    }
    for (var c = 0; c < 3; c++) {
      var cloud = document.createElement('div');
      cloud.style.cssText = 'position:absolute;left:-15%;top:' + (8 + c * 18) + '%;';
      cloud.innerHTML = SVG.cloud();
      openLayer.appendChild(cloud);
      anime({ targets: cloud, translateX: [0, window.innerWidth + 200], duration: 28000 + c * 6000, delay: c * 4000, loop: true, easing: 'linear' });
    }
    for (var cf = 0; cf < 14; cf++) {
      var confetti = document.createElement('div');
      confetti.style.cssText = 'position:absolute;left:' + (Math.random() * 100) + '%;top:-5%;';
      confetti.innerHTML = SVG.confetti(COLORS[cf % COLORS.length]);
      openLayer.appendChild(confetti);
      anime({ targets: confetti, translateY: [-20, window.innerHeight + 40], rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)], duration: 6000 + Math.random() * 5000, delay: cf * 500, loop: true, easing: 'linear' });
    }
  }

  var heroLayer = document.getElementById('hero-deco');
  if (heroLayer) {
    for (var h = 0; h < 5; h++) {
      var hBalloon = document.createElement('div');
      hBalloon.style.cssText = 'position:absolute;left:' + (10 + h * 18) + '%;top:' + (70 + Math.random() * 20) + '%;';
      hBalloon.innerHTML = SVG.bamboo(h % 2 === 0 ? 'green' : 'yellow');
      heroLayer.appendChild(hBalloon);
      hBalloon.style.animation = 'bamboo-rise ' + (12 + h * 1.5) + 's ' + (h * 1.2) + 's linear infinite';
    }
  }

  var storyLayer = document.getElementById('story-deco');
  if (storyLayer) {
    for (var s = 0; s < 14; s++) {
      var sConfetti = document.createElement('div');
      sConfetti.style.cssText = 'position:absolute;left:' + (Math.random() * 100) + '%;top:-5%;';
      sConfetti.innerHTML = SVG.confetti(COLORS[s % COLORS.length]);
      storyLayer.appendChild(sConfetti);
      anime({ targets: sConfetti, translateY: [-20, 1200], rotate: [0, 360], duration: 8000 + Math.random() * 4000, delay: s * 600, loop: true, easing: 'linear' });
    }
    for (var st = 0; st < 8; st++) {
      var star = document.createElement('div');
      star.style.cssText = 'position:absolute;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;';
      star.innerHTML = SVG.star();
      storyLayer.appendChild(star);
      anime({ targets: star, opacity: [1, 0.2], scale: [1, 0.6], direction: 'alternate', duration: 1200 + Math.random() * 1000, loop: true, easing: 'easeInOutSine' });
    }
  }

  var closingLayer = document.getElementById('closing-deco');
  if (closingLayer) {
    for (var cl = 0; cl < 12; cl++) {
      var clStar = document.createElement('div');
      clStar.style.cssText = 'position:absolute;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;opacity:0.6;';
      clStar.innerHTML = SVG.star('#FFE066');
      closingLayer.appendChild(clStar);
    }
    for (var clb = 0; clb < 4; clb++) {
      var clBalloon = document.createElement('div');
      clBalloon.style.cssText = 'position:absolute;left:' + (10 + clb * 22) + '%;top:' + (80 + Math.random() * 15) + '%;';
      clBalloon.innerHTML = SVG.bamboo(clb % 2 === 0 ? 'green' : 'yellow');
      closingLayer.appendChild(clBalloon);
      clBalloon.style.animation = 'bamboo-rise ' + (12 + clb * 1.5) + 's ' + (clb * 1.5) + 's linear infinite';
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
    item.className = 'tl-item tl-item--' + (idx % 2 === 0 ? 'left' : 'right');
    item.setAttribute('data-aos', idx % 2 === 0 ? 'fade-right' : 'fade-left');
    item.innerHTML = '<div class="card-tl">'
      + '<div class="year">' + sanitize(s.year) + '</div>'
      + '<h4>' + sanitize(s.title) + '</h4>'
      + '<p>' + sanitize(s.description) + '</p>'
      + '</div>';
    c.appendChild(item);
  });
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderEvents(data) {
  var c = el('event-list');
  if (!c) return;
  var d = data || FALLBACK_DATA;
  var f = FALLBACK_DATA;

  var akadHtml = '<div class="event-card" data-aos="zoom-in">'
    + '<div class="ic"><i class="fa-solid fa-mosque"></i></div>'
    + '<h3>Akad Nikah</h3>'
    + '<p class="meta">' + fmtDate(d.akadDatetime || f.akadDatetime) + '<br/>' + fmtTime(d.akadDatetime || f.akadDatetime) + '</p>'
    + '<p class="venue">' + sanitize(d.akadVenue || f.akadVenue || '') + '</p>'
    + '<p class="addr">' + sanitize(d.akadAddress || f.akadAddress || '') + '</p>'
    + '<iframe loading="lazy" src="' + cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) + '" allowfullscreen></iframe>'
    + '</div>';

  var recHtml = '<div class="event-card" data-aos="zoom-in" data-aos-delay="120">'
    + '<div class="ic"><i class="fa-solid fa-champagne-glasses"></i></div>'
    + '<h3>Resepsi</h3>'
    + '<p class="meta">' + fmtDate(d.receptionDatetime || f.receptionDatetime) + '<br/>' + fmtTime(d.receptionDatetime || f.receptionDatetime) + '</p>'
    + '<p class="venue">' + sanitize(d.receptionVenue || f.receptionVenue || '') + '</p>'
    + '<p class="addr">' + sanitize(d.receptionAddress || f.receptionAddress || '') + '</p>'
    + '<iframe loading="lazy" src="' + cleanMapsUrl(d.receptionMapsUrl || f.receptionMapsUrl) + '" allowfullscreen></iframe>'
    + '</div>';

  c.innerHTML = akadHtml + recHtml;
  if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderWishes(wishesData) {
  var c = el('wishes-list');
  if (!c) return;
  c.innerHTML = '';
  if (!wishesData || !wishesData.length) {
    c.innerHTML = '<p class="text-muted p-3">Belum ada ucapan.</p>';
    return;
  }
  wishesData.forEach(function (w) {
    var nm = w.guest_name || w.name || '?';
    var initial = nm.charAt(0).toUpperCase();
    var item = document.createElement('div');
    item.className = 'wish';
    item.innerHTML = '<div class="avatar">' + sanitize(initial) + '</div>'
      + '<div class="body">'
      + '<div class="name">' + sanitize(nm) + '</div>'
      + '<p class="msg">' + sanitize(w.message) + '</p>'
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
    item.setAttribute('data-aos-delay', (idx * 120) + '');
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

  startCountdown(d.receptionDatetime || f.receptionDatetime);

  renderStory(d.stories != null ? d.stories : f.stories);

  renderEvents(d);

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
  document.body.classList.add('opening-show');
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

  var nav = document.querySelector('.navbar-cz');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 50);
    });
  }

  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () { menu.classList.toggle('open'); });
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
