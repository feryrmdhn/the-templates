var FALLBACK_DATA = FALLBACK["everlasting"];

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

function formatDate(iso) {
  try {
    var d = new Date(iso);
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  } catch (e) { return iso; }
}

function formatTime(iso) {
  try {
    var d = new Date(iso);
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
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

function animateLetters(selector, baseDelay) {
  baseDelay = baseDelay || 0;
  document.querySelectorAll(selector).forEach(function (node, nodeIndex) {
    var children = Array.from(node.childNodes);
    var newHTML = '';
    children.forEach(function (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        newHTML += child.textContent.replace(/\S/g, function (char) {
          return '<span class="letter" style="display:inline-block;">' + char + '</span>';
        });
      } else if (child.nodeName === 'BR') {
        newHTML += '<br>';
      } else {
        newHTML += child.outerHTML;
      }
    });
    node.innerHTML = newHTML;
    if (window.anime) {
      anime({
        targets: node.querySelectorAll('.letter'),
        scale: [4, 1],
        opacity: [0, 1],
        translateZ: 0,
        easing: 'easeOutExpo',
        duration: 950,
        delay: function (_, i) { return baseDelay + (nodeIndex * 300) + 100 * i; }
      });
    }
  });
}

var _countdownInstance = null;

function updateCountdown(datetime) {
  if (_countdownInstance) {
    try { _countdownInstance.destroy(); } catch (e) { }
    _countdownInstance = null;
  }
  if (typeof timezz === 'undefined') return;
  _countdownInstance = timezz('#timer', {
    date: new Date(datetime),
    stop: false,
    canContinue: false,
    withYears: false,
    beforeCreate: function () { },
    beforeDestroy: function () { },
    update: function () { },
  });
}

function renderGallery(galleryData) {
  var grid = document.getElementById('galleryGrid');
  if (!grid) return;

  var items = ['gallery-item-1', 'gallery-item-2', 'gallery-item-3', 'gallery-item-4', 'gallery-item-5'];
  items.forEach(function (id, i) {
    var el2 = document.getElementById(id);
    if (!el2) return;
    if (galleryData && galleryData[i]) {
      el2.setAttribute('href', galleryData[i]);
      el2.setAttribute('data-src', galleryData[i]);
      el2.innerHTML = '<img src="' + galleryData[i] + '" alt="Gallery ' + (i + 1) + '" loading="lazy" />';
    } else {
      el2.removeAttribute('href');
      el2.removeAttribute('data-src');
      el2.innerHTML = '';
    }
  });

  if (typeof lightGallery !== 'undefined' && galleryData && galleryData.length) {
    lightGallery(grid, { selector: 'a[data-src]' });
  }

  if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderStory(storyItems) {
  var sl = document.getElementById('storyList');
  if (!sl || !storyItems || !storyItems.length) return;

  sl.innerHTML = storyItems.map(function (it, i) {
    return '<div class="story-item' + (i % 2 ? ' reverse' : '') + '" data-aos="' + (i % 2 ? 'fade-left' : 'fade-right') + '" data-aos-duration="1200">'
      + '<img src="' + sanitize(it.image) + '" alt="' + sanitize(it.title) + '" loading="lazy" />'
      + '<div class="story-card">'
      + '<h3 class="font-secondary text-primary">' + sanitize(it.title) + '</h3>'
      + '<p class="mb-0">' + sanitize(it.description) + '</p>'
      + '</div></div>';
  }).join('');

  if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderWishes(wishesData) {
  var list = document.getElementById('wishesList');
  if (!list) return;

  if (!wishesData || !wishesData.length) {
    list.innerHTML = '<p class="text-muted m-0">Be the first to send your wishes!</p>';
    return;
  }

  list.innerHTML = wishesData.map(function (w) {
    var initial = (w.guest_name || w.name || '?').charAt(0).toUpperCase();
    return '<div class="wish">'
      + '<div class="avatar">' + sanitize(initial) + '</div>'
      + '<div><div class="name">' + sanitize(w.guest_name || w.name) + '</div>'
      + '<p class="msg">' + sanitize(w.message) + '</p></div>'
      + '</div>';
  }).join('');
}

function renderPayment(paymentData) {
  if (!paymentData || !paymentData.length) return;

  var section = document.getElementById('payment-section');
  var list = document.getElementById('payment-list');
  if (!section || !list) return;

  list.innerHTML = paymentData.map(function (p) {
    return '<div class="payment-card">'
      + '<div class="payment-logo-wrap">'
      + '<img src="/payment/' + p.method + '.png" alt="' + p.method + '">'
      + '</div>'
      + '<p class="payment-value">' + p.value + '</p>'
      + '<p class="payment-name">a.n ' + p.name + '</p>'
      + '</div>';
  }).join('');

  section.style.display = 'block';
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

function applyData(data) {
  var d = data;
  var f = FALLBACK_DATA;

  var groomName = d.groomName || f.groomName;
  var brideName = d.brideName || f.brideName;
  var couple = groomName + ' &amp; ' + brideName;

  if (el('openingCouple')) el('openingCouple').innerHTML = groomName + '<br>&amp;<br>' + brideName;
  if (el('openingGuest')) el('openingGuest').textContent = d.guestName || f.guestName;
  if (el('openingDate')) el('openingDate').textContent = formatDate(d.akadDatetime || f.akadDatetime);

  if (el('heroCouple')) el('heroCouple').innerHTML = groomName + '<br>&amp;<br>' + brideName;
  if (el('heroDate')) el('heroDate').textContent = formatDate(d.akadDatetime || f.akadDatetime);

  if (el('groomName')) el('groomName').textContent = groomName;
  if (el('brideName')) el('brideName').textContent = brideName;
  if (el('groomRole')) el('groomRole').textContent = d.groomRole || f.groomRole || '';
  if (el('brideRole')) el('brideRole').textContent = d.brideRole || f.brideRole || '';
  if (el('fatherGroom')) el('fatherGroom').textContent = d.fatherGroom || f.fatherGroom || '';
  if (el('fatherBride')) el('fatherBride').textContent = d.fatherBride || f.fatherBride || '';
  if (el('groomPhoto') && (d.groomPhoto || f.groomPhoto)) el('groomPhoto').src = d.groomPhoto || f.groomPhoto;
  if (el('bridePhoto') && (d.bridePhoto || f.bridePhoto)) el('bridePhoto').src = d.bridePhoto || f.bridePhoto;

  var isShowGallery = d.isShowGallery !== undefined ? d.isShowGallery : (f.isShowGallery !== undefined ? f.isShowGallery : true);
  if (isShowGallery) {
    var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
    renderGallery(gallery);
  } else {
    var gallerySection = document.getElementById('gallery');
    if (gallerySection) gallerySection.style.display = 'none';
    var galleryNav = document.querySelector('.nav-link[href="#gallery"]');
    if (galleryNav && galleryNav.parentElement) galleryNav.parentElement.style.display = 'none';
  }

  var isShowStory = d.isShowStory !== undefined ? d.isShowStory : (f.isShowStory !== undefined ? f.isShowStory : true);
  if (isShowStory) {
    var storyItems = d.storyItems != null ? d.storyItems : f.storyItems;
    renderStory(storyItems);
  } else {
    var storySection = document.getElementById('story');
    if (storySection) storySection.style.display = 'none';
    var storyNav = document.querySelector('.nav-link[href="#story"]');
    if (storyNav && storyNav.parentElement) storyNav.parentElement.style.display = 'none';
  }

  var akadDatetime = d.akadDatetime || f.akadDatetime;
  if (akadDatetime) {
    if (el('akadDate')) el('akadDate').textContent = formatDate(akadDatetime);
    if (el('akadTime')) el('akadTime').textContent = formatTime(akadDatetime);
  }
  if (el('akadDesc')) el('akadDesc').textContent = d.akadDesc || f.akadDesc || '';

  var receptionDatetime = d.receptionDatetime || f.receptionDatetime;
  if (receptionDatetime) {
    if (el('receptionDate')) el('receptionDate').textContent = formatDate(receptionDatetime);
    if (el('receptionTime')) el('receptionTime').textContent = formatTime(receptionDatetime);
    updateCountdown(receptionDatetime);
  }
  if (el('receptionDesc')) el('receptionDesc').textContent = d.receptionDesc || f.receptionDesc || '';

  if (el('mapsFrame')) el('mapsFrame').src = cleanMapsUrl(d.eventMapsUrl || f.eventMapsUrl) || '';

  if (el('rsvpPhoto') && (d.rsvpPhoto || f.rsvpPhoto)) el('rsvpPhoto').src = d.rsvpPhoto || f.rsvpPhoto;

  var music = d.music || f.music;
  if (el('bgMusic') && music) el('bgMusic').src = music;

  var backgroundCover = d.backgroundCover || f.backgroundCover;
  if (backgroundCover) {
    var openingBg = document.querySelector('.opening-bg');
    var heroBg = document.querySelector('.hero-bg');
    if (openingBg) openingBg.style.backgroundImage = "url('" + backgroundCover + "')";
    if (heroBg) heroBg.style.backgroundImage = "url('" + backgroundCover + "')";
  }

  if (el('closingCouple')) el('closingCouple').innerHTML = couple;

  if (el('platformName')) el('platformName').textContent = d.platform || f.platform || 'Wedding Platform';
  if (el('year')) el('year').textContent = new Date().getFullYear();

  if (!_projectId) {
    var wishes = (d.wishes && d.wishes.length) ? d.wishes : f.wishes;
    renderWishes(wishes);
  }

  var payment = (d.payment && d.payment.length) ? d.payment : f.payment;
  if (payment && payment.length) renderPayment(payment);
}

function handleCommentSubmit(e) {
  e.preventDefault();

  var form = e.target;
  var nameInput = form.querySelector('input[name="name"]');
  var messageInput = form.querySelector('textarea[name="message"]');
  var submitBtn = form.querySelector('button[type="submit"]');

  var name = nameInput ? nameInput.value.trim() : '';
  var message = messageInput ? messageInput.value.trim() : '';

  if (!name) {
    showNotification('Nama tidak boleh kosong', 'error');
    if (nameInput) nameInput.focus();
    return;
  }
  if (!message) {
    showNotification('Pesan tidak boleh kosong', 'error');
    if (messageInput) messageInput.focus();
    return;
  }
  if (!_projectId || !_apiBaseUrl) {
    showNotification('Tidak dapat mengirim ucapan saat ini', 'error');
    return;
  }

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

  postComment(_apiBaseUrl, {
    project_id: _projectId,
    guest_name: sanitize(name),
    message: sanitize(message)
  })
    .then(function (response) {
      if (response && response.success) {
        if (nameInput) nameInput.value = '';
        if (messageInput) messageInput.value = '';
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
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send RSVP'; }
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

  if (el('openingGuest')) el('openingGuest').textContent = guest || FALLBACK_DATA.guestName;

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

var url = new URL(window.location.href);
var u = url.searchParams.get('name') ? url.searchParams.get('name').replace(/_/g, ' ') : '';
if (u && el('openingGuest')) el('openingGuest').textContent = u;

document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  setTimeout(function () {
    if (!_isDataApplied) {
      _isDataApplied = true;
      applyData(Object.assign({}, FALLBACK_DATA, { guestName: u || FALLBACK_DATA.guestName }));
      renderTenant({});
    }
  }, 2000);

  AOS.init();

  var btnOpen = document.getElementById('btnOpen');
  var btnAudio = document.getElementById('btnAudio');
  var audioIcon = document.getElementById('audioIcon');
  var bgMusic = document.getElementById('bgMusic');

  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      var op = document.getElementById('opening');
      document.body.classList.add('opening-hide');

      if (bgMusic && bgMusic.src) {
        bgMusic.play().then(function () {
          if (audioIcon) audioIcon.className = 'fa-solid fa-volume-high';
        }).catch(function () { });
      }

      setTimeout(function () {
        document.body.classList.remove('opening-show');
        document.body.classList.remove('opening-hide');
        if (op) op.remove();
        animateLetters('.couple-anim', 200);
        AOS.refresh();
      }, 2000);
    });
  }

  if (btnAudio && bgMusic) {
    btnAudio.addEventListener('click', function () {
      if (bgMusic.paused) {
        bgMusic.play().then(function () {
          if (audioIcon) audioIcon.className = 'fa-solid fa-volume-high';
        }).catch(function () { });
      } else {
        bgMusic.pause();
        if (audioIcon) audioIcon.className = 'fa-solid fa-volume-xmark';
      }
    });
  }

  var mainNav = document.getElementById('mainNav');
  var btnScrollTop = document.getElementById('btnScrollTop');
  var sections = document.querySelectorAll('section[id], header[id]');

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (mainNav) mainNav.classList.toggle('scrolled', y > 50);
    if (btnScrollTop) btnScrollTop.classList.toggle('show', y > 50);

    var current = '';
    sections.forEach(function (s) {
      if (y + 120 >= s.offsetTop) current = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });

  if (btnScrollTop) {
    btnScrollTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('.page-scroll').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
        }

        var collapse = document.getElementById('navMenu');
        if (collapse && collapse.classList.contains('show')) {
          collapse.classList.remove('show');
        }
      }
    });
  });

  var rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) rsvpForm.addEventListener('submit', handleCommentSubmit);
});
