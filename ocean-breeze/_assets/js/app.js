

var FALLBACK_DATA = FALLBACK["ocean-breeze"];

var _projectId = null;
var _apiBaseUrl = null;
var _isDataApplied = false;
var _countdownInstance = null;
var _lightGalleryInstance = null;

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
  if (str === null || str === undefined) return '';
  var d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
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

function formatDate(iso) {
  try {
    var d = new Date(iso);
    return DAYS_ID[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS_ID[d.getMonth()] + ' ' + d.getFullYear();
  } catch (e) { return iso; }
}

function formatTime(iso) {
  try {
    var d = new Date(iso);
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  } catch (e) { return ''; }
}

function showNotification(message, type) {
  var n = document.createElement('div');
  n.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;'
    + 'background:' + (type === 'success' ? '#10b981' : '#ef4444') + ';color:white;'
    + 'padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);'
    + 'font-size:14px;font-weight:500;max-width:90%;text-align:center;';
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(function () {
    if (n.parentNode) n.parentNode.removeChild(n);
  }, 3000);
}

function animateLetters(selector, baseDelay) {
  baseDelay = baseDelay || 0;
  document.querySelectorAll(selector).forEach(function (node, nodeIndex) {
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
    if (window.anime) {
      anime({
        targets: node.querySelectorAll('.letter'),
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutExpo',
        duration: 1000,
        delay: anime.stagger(60, { start: baseDelay + nodeIndex * 300 })
      });
    } else {
      node.querySelectorAll('.letter').forEach(function (s) { s.style.opacity = '1'; });
    }
  });
}

function updateCountdown(datetime) {
  var timer = el('timer');
  if (!timer || !datetime) return;

  if (!timer.querySelector('.cd-num')) {
    timer.innerHTML =
      '<div class="cd-item">' +
      '<span class="cd-num" id="cd-days">00</span>' +
      '<span class="cd-lbl">Hari</span>' +
      '</div>' +
      '<span class="cd-sep">:</span>' +
      '<div class="cd-item">' +
      '<span class="cd-num" id="cd-hours">00</span>' +
      '<span class="cd-lbl">Jam</span>' +
      '</div>' +
      '<span class="cd-sep">:</span>' +
      '<div class="cd-item">' +
      '<span class="cd-num" id="cd-minutes">00</span>' +
      '<span class="cd-lbl">Menit</span>' +
      '</div>' +
      '<span class="cd-sep">:</span>' +
      '<div class="cd-item">' +
      '<span class="cd-num" id="cd-seconds">00</span>' +
      '<span class="cd-lbl">Detik</span>' +
      '</div>';
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function tick() {
    var now = new Date().getTime();
    var target = new Date(datetime).getTime();
    var diff = Math.max(0, target - now);

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    var dEl = el('cd-days');
    var hEl = el('cd-hours');
    var mEl = el('cd-minutes');
    var sEl = el('cd-seconds');

    if (dEl) dEl.textContent = pad(days);
    if (hEl) hEl.textContent = pad(hours);
    if (mEl) mEl.textContent = pad(minutes);
    if (sEl) sEl.textContent = pad(seconds);
  }

  tick();
  if (_countdownInstance) clearInterval(_countdownInstance);
  _countdownInstance = setInterval(tick, 1000);
}

function renderGallery(galleryData) {
  var grid = el('galleryGrid');
  if (!grid || !galleryData || !galleryData.length) return;

  if (_lightGalleryInstance && _lightGalleryInstance.destroy) {
    try { _lightGalleryInstance.destroy(true); } catch (e) { }
    _lightGalleryInstance = null;
  }

  grid.innerHTML = galleryData.map(function (src, i) {
    return '<a href="' + sanitize(src) + '" class="gallery-item' + (i === 0 ? ' feature' : '') + '"'
      + ' data-aos="fade-up" data-aos-delay="' + (i * 100) + '" data-aos-duration="800">'
      + '<img src="' + sanitize(src) + '" alt="Gallery ' + (i + 1) + '" loading="lazy" />'
      + '</a>';
  }).join('');

  if (typeof lightGallery !== 'undefined') {
    _lightGalleryInstance = lightGallery(grid, { selector: 'a', download: false });
  }

  setTimeout(function () {
    if (typeof AOS !== 'undefined') AOS.refresh();
  }, 100);
}

function renderStory(storyItems) {
  var wrapDesktop = el('storyWrap');
  var wrapMobile = el('storyWrapMobile');
  if (!storyItems || !storyItems.length) return;

  if (wrapDesktop) {
    wrapDesktop.innerHTML = storyItems.map(function (it, i) {
      return '<div class="story-item' + (i % 2 === 1 ? ' alt' : '') + '">'
        + '<img src="' + sanitize(it.image || '') + '" alt="' + sanitize(it.title || '') + '" loading="lazy" />'
        + '<div class="story-card"><h4>' + sanitize(it.title || '') + '</h4><p>' + sanitize(it.description || '') + '</p></div>'
        + '</div>';
    }).join('');

    if ('IntersectionObserver' in window) {
      var ioDesktop = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          e.target.classList.toggle('in-view', e.isIntersecting);
        });
      }, { threshold: 0.15 });
      wrapDesktop.querySelectorAll('.story-item').forEach(function (r) { ioDesktop.observe(r); });
    } else {
      wrapDesktop.querySelectorAll('.story-item').forEach(function (r) { r.classList.add('in-view'); });
    }
  }

  if (wrapMobile) {
    wrapMobile.innerHTML = storyItems.map(function (it) {
      return '<div class="story-mobile-item">'
        + '<div class="story-mobile-img"><img src="' + sanitize(it.image || '') + '" alt="' + sanitize(it.title || '') + '" loading="lazy" /></div>'
        + '<div class="story-mobile-card"><h4>' + sanitize(it.title || '') + '</h4><p>' + sanitize(it.description || '') + '</p></div>'
        + '</div>';
    }).join('');

    if ('IntersectionObserver' in window) {
      var ioMobile = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          e.target.classList.toggle('in-view', e.isIntersecting);
        });
      }, { threshold: 0.1 });
      wrapMobile.querySelectorAll('.story-mobile-item').forEach(function (r) { ioMobile.observe(r); });
    } else {
      wrapMobile.querySelectorAll('.story-mobile-item').forEach(function (r) { r.classList.add('in-view'); });
    }
  }
}

function renderWishes(wishesData) {
  var grid = el('wishesGrid');
  if (!grid) return;

  if (!wishesData || !wishesData.length) {
    grid.innerHTML = '<p style="text-align:center;color:#777;grid-column:1/-1">Jadilah yang pertama mengirim ucapan!</p>';
    return;
  }

  grid.innerHTML = wishesData.map(function (w) {
    var initial = (w.guest_name || w.name || '?').charAt(0).toUpperCase();
    return '<div class="wish-card">'
      + '<div class="wish-avatar">' + sanitize(initial) + '</div>'
      + '<div class="wish-body">'
      + '<div class="wish-name">' + sanitize(w.guest_name || w.name || '') + '</div>'
      + '<div class="wish-msg">' + sanitize(w.message || '') + '</div>'
      + '</div></div>';
  }).join('');
}

function renderPayment(paymentData) {
  var sec = el('paymentSection');
  var flex = el('paymentFlex');
  if (!flex || !sec) return;

  if (!paymentData || !paymentData.length) {
    sec.style.display = 'none';
    return;
  }

  sec.style.display = '';
  flex.innerHTML = paymentData.map(function (p, idx) {
    return '<div class="payment-card" data-aos="fade-up" data-aos-delay="' + (idx * 100) + '" data-aos-duration="800">'
      + '<div class="bank"><img src="/payment/' + sanitize(p.method) + '.png" alt="' + sanitize(p.method) + '" /></div>'
      + '<div class="num">' + sanitize(p.value) + '</div>'
      + '<div class="holder">a.n. ' + sanitize(p.name) + '</div>'
      + '</div>';
  }).join('');

  setTimeout(function () {
    if (typeof AOS !== 'undefined') AOS.refresh();
  }, 100);
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
  var nameInput = form.querySelector('#rsvpName');
  var msgInput = form.querySelector('#rsvpMessage');
  var submitBtn = form.querySelector('button[type="submit"]');

  var name = nameInput ? nameInput.value.trim() : '';
  var message = msgInput ? msgInput.value.trim() : '';

  if (!name) { showNotification('Nama tidak boleh kosong', 'error'); if (nameInput) nameInput.focus(); return; }
  if (!message) { showNotification('Pesan tidak boleh kosong', 'error'); if (msgInput) msgInput.focus(); return; }

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
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Ucapan'; }
    });
}

function applyData(data) {
  var d = data;
  var f = FALLBACK_DATA;

  var groomName = d.groomName || f.groomName;
  var brideName = d.brideName || f.brideName;
  var couple = groomName + ' & ' + brideName;
  var coupleShort = groomName.split(' ')[0] + ' & ' + brideName.split(' ')[0];

  if (el('openingGuest')) el('openingGuest').textContent = d.guestName || f.guestName;
  var openingCouple = el('openingCouple');
  if (openingCouple) {
    var ogEl = openingCouple.querySelector('.cn-groom');
    var obEl = openingCouple.querySelector('.cn-bride');
    if (ogEl) ogEl.textContent = groomName;
    if (obEl) obEl.textContent = brideName;

    setTimeout(function () {
      animateLetters('#openingCouple .cn-groom', 400);
      animateLetters('#openingCouple .cn-bride', 800);
    }, 100);
  }
  if (el('openingDate')) el('openingDate').textContent = formatDate(d.akadDatetime || f.akadDatetime);

  if (el('brandCouple')) el('brandCouple').textContent = coupleShort;

  var heroCouple = el('heroCouple');
  if (heroCouple) {
    var hgEl = heroCouple.querySelector('.cn-groom');
    var hbEl = heroCouple.querySelector('.cn-bride');
    if (hgEl) hgEl.textContent = groomName;
    if (hbEl) hbEl.textContent = brideName;
  }
  if (el('heroDate')) el('heroDate').textContent = formatDate(d.akadDatetime || f.akadDatetime);

  if (el('groomName')) el('groomName').textContent = groomName;
  if (el('brideName')) el('brideName').textContent = brideName;
  if (el('groomRole')) el('groomRole').textContent = d.groomRole || f.groomRole || '';
  if (el('brideRole')) el('brideRole').textContent = d.brideRole || f.brideRole || '';
  if (el('groomParents')) el('groomParents').textContent = d.fatherGroom || f.fatherGroom || '';
  if (el('brideParents')) el('brideParents').textContent = d.fatherBride || f.fatherBride || '';
  if (el('groomPhoto') && (d.groomPhoto || f.groomPhoto)) el('groomPhoto').src = d.groomPhoto || f.groomPhoto;
  if (el('bridePhoto') && (d.bridePhoto || f.bridePhoto)) el('bridePhoto').src = d.bridePhoto || f.bridePhoto;

  if (el('galleryDesc')) el('galleryDesc').textContent = d.galleryDesc || f.galleryDesc || '';
  renderGallery((d.gallery && d.gallery.length) ? d.gallery : f.gallery);

  var isShowStory = d.isShowStory !== undefined ? d.isShowStory : (f.isShowStory !== undefined ? f.isShowStory : true);
  if (isShowStory) {
    renderStory(d.storyItems != null ? d.storyItems : f.storyItems);
  } else {
    var storySection = document.getElementById('story');
    if (storySection) storySection.style.display = 'none';
    var storyNav = document.querySelector('.nav-link[href="#story"]');
    if (storyNav && storyNav.parentElement) storyNav.parentElement.style.display = 'none';
  }

  var akadDatetime = d.akadDatetime || f.akadDatetime;
  if (el('akadDate')) el('akadDate').textContent = formatDate(akadDatetime);
  if (el('akadTime')) el('akadTime').textContent = formatTime(akadDatetime);
  if (el('akadVenue')) el('akadVenue').textContent = d.akadVenue || f.akadVenue || '';
  if (el('akadDesc')) el('akadDesc').textContent = d.akadDesc || f.akadDesc || '';

  var receptionDatetime = d.receptionDatetime || f.receptionDatetime;
  if (el('receptionDate')) el('receptionDate').textContent = formatDate(receptionDatetime);
  if (el('receptionTime')) el('receptionTime').textContent = formatTime(receptionDatetime);
  if (el('receptionVenue')) el('receptionVenue').textContent = d.receptionVenue || f.receptionVenue || '';
  if (el('receptionDesc')) el('receptionDesc').textContent = d.receptionDesc || f.receptionDesc || '';

  updateCountdown(receptionDatetime);

  if (el('mapsFrame')) el('mapsFrame').src = cleanMapsUrl(d.eventMapsUrl || f.eventMapsUrl) || '';

  if (el('rsvpPhoto') && (d.rsvpPhoto || f.rsvpPhoto)) el('rsvpPhoto').src = d.rsvpPhoto || f.rsvpPhoto;

  var cover = d.backgroundCover || f.backgroundCover;
  if (cover) {
    document.querySelectorAll('.opening-section, .hero-section, .schedule-section, .countdown-section, .wishes-section').forEach(function (node) {
      node.style.backgroundImage = "url('" + cover + "')";
    });
  }

  if (el('closingCouple')) el('closingCouple').textContent = couple;
  if (el('footerCouple')) el('footerCouple').textContent = couple;

  if (el('platformName')) el('platformName').textContent = d.platform || f.platform || '';
  if (el('footerYear')) el('footerYear').textContent = String(new Date().getFullYear());

  var music = d.music || f.music;
  if (music) {
    var bgAudio = el('bgAudio');
    if (bgAudio) { bgAudio.src = music; bgAudio.load(); }
  }

  if (!_projectId) {
    renderWishes((d.wishes && d.wishes.length) ? d.wishes : f.wishes);
  }

  renderPayment((d.payment && d.payment.length) ? d.payment : f.payment);

  setTimeout(function () {
    if (typeof AOS !== 'undefined') AOS.refreshHard();
  }, 150);
}

window.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'INVITATION_DATA') return;

  _isDataApplied = true;

  var payload = e.data.payload;
  var apiBaseUrl = payload.apiBaseUrl;
  var tenantSlug = payload.tenantSlug;
  var projectSlug = payload.projectSlug;
  var guest = payload.guestName || payload.guest;

  if (el('openingGuest')) el('openingGuest').textContent = guest || FALLBACK_DATA.guestName;

  if (payload.mode === 'preview') {
    applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
    renderTenant({});
    return;
  }

  if (!apiBaseUrl || !tenantSlug || !projectSlug) {
    applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
    renderTenant({});
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
      window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
    })
    .catch(function () {
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
      renderTenant({});
      window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
    });
});

var _url = new URL(window.location.href);
var _u = _url.searchParams.get('name') ? _url.searchParams.get('name').replace(/_/g, ' ') : '';
if (_u && el('openingGuest')) el('openingGuest').textContent = _u;

document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: false, offset: 80 });

  setTimeout(function () {
    if (!_isDataApplied) {
      _isDataApplied = true;
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
      renderTenant({});
      window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
    }
  }, 2000);

  var openBtn = el('openBtn');
  var bgAudio = el('bgAudio');
  var audioBtn = el('audioBtn');

  if (openBtn) {
    openBtn.addEventListener('click', function () {
      document.body.classList.add('opening-hide');

      if (bgAudio && bgAudio.src) {
        bgAudio.play().then(function () {
          if (audioBtn) audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }).catch(function () { });
      }

      setTimeout(function () {
        document.body.classList.remove('opening-show');
        document.body.classList.remove('opening-hide');
        var op = el('openingSection');
        if (op && op.parentNode) op.parentNode.removeChild(op);
        animateLetters('.hero-couple', 200);

        if (typeof AOS !== 'undefined') {
          setTimeout(function () { AOS.refreshHard(); }, 50);
        }
      }, 2000);
    });
  }

  if (audioBtn && bgAudio) {
    audioBtn.addEventListener('click', function () {
      if (bgAudio.paused) {
        bgAudio.play().catch(function () { });
        audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      } else {
        bgAudio.pause();
        audioBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      }
    });
  }

  var navbar = el('navbar');
  var scrollBtn = el('scrollTopBtn');

  function handleScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (navbar) navbar.classList.toggle('scrolled', y > 60);
    if (scrollBtn) scrollBtn.classList.toggle('show', y > 50);

    var sections = document.querySelectorAll('section[id]');
    var current = '';
    sections.forEach(function (s) {
      if (y + 100 >= s.offsetTop) current = s.id;
    });
    document.querySelectorAll('.navbar-ocean .nav-link').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  if (scrollBtn) {
    scrollBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
        var collapse = el('navMenu');
        if (collapse && collapse.classList.contains('show')) collapse.classList.remove('show');
      }
    });
  });

  var rsvpForm = el('rsvpForm');
  if (rsvpForm) rsvpForm.addEventListener('submit', handleCommentSubmit);
});
