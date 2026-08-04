
var FALLBACK_DATA = FALLBACK["simple-ricefield"];

var _projectId = null;
var _apiBaseUrl = null;

var PLACEHOLDER_LOGO = '/placeholder-image.png';

function el(id) { return document.getElementById(id); }
function getPaymentImage(method) { return '/payment/' + method + '.png'; }

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

function applyData(data) {
  var d = data;
  var f = FALLBACK_DATA;

  if (el('guest')) el('guest').innerHTML = d.guestName || f.guestName;
  if (el('groom-name')) el('groom-name').innerHTML = d.groomName || f.groomName;
  if (el('groom-name-2')) el('groom-name-2').innerHTML = d.groomName || f.groomName;
  if (el('bride-name')) el('bride-name').innerHTML = d.brideName || f.brideName;
  if (el('bride-name-2')) el('bride-name-2').innerHTML = d.brideName || f.brideName;
  if (el('quote')) el('quote').innerHTML = d.quote || f.quote;
  if (el('akad-venue')) el('akad-venue').innerHTML = (d.akadVenue || f.akadVenue) + '<br>' + (d.akadAddress || f.akadAddress);

  if (el('groom-photo') && (d.groomPhoto || f.groomPhoto)) el('groom-photo').src = d.groomPhoto || f.groomPhoto;
  if (el('bride-photo') && (d.bridePhoto || f.bridePhoto)) el('bride-photo').src = d.bridePhoto || f.bridePhoto;

  var akad = new Date(d.akadDatetime || f.akadDatetime);
  var days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  var months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
  if (el('akad-day')) el('akad-day').innerHTML = days[akad.getDay()];
  if (el('akad-month')) el('akad-month').innerHTML = months[akad.getMonth()];
  if (el('akad-date-num')) el('akad-date-num').innerHTML = akad.getDate();
  if (el('akad-year')) el('akad-year').innerHTML = akad.getFullYear();
  if (el('akad-time')) el('akad-time').innerHTML = akad.getHours().toString().padStart(2, '0') + '.' + akad.getMinutes().toString().padStart(2, '0');

  var recep = new Date(d.receptionDatetime || f.receptionDatetime);
  if (el('reception-day')) el('reception-day').innerHTML = days[recep.getDay()];
  if (el('reception-month')) el('reception-month').innerHTML = months[recep.getMonth()];
  if (el('reception-date-num')) el('reception-date-num').innerHTML = recep.getDate();
  if (el('reception-year')) el('reception-year').innerHTML = recep.getFullYear();
  if (el('reception-time')) el('reception-time').innerHTML = recep.getHours().toString().padStart(2, '0') + '.' + recep.getMinutes().toString().padStart(2, '0');
  if (el('reception-date-short')) el('reception-date-short').innerHTML = days[recep.getDay()] + ', ' + recep.getDate() + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear() + ', pukul ' + recep.getHours().toString().padStart(2, '0') + '.' + recep.getMinutes().toString().padStart(2, '0');

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

  var mapFrame = el('gmap_canvas');
  if (mapFrame) mapFrame.src = cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) || '';

  var music = d.music || f.music;
  var audioSource = document.querySelector('#audio source');
  if (audioSource && music) {
    audioSource.setAttribute('src', music);
    audioSource.parentElement.load();
  }

  var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
  renderGallery(gallery);

  var payment = (d.payment && d.payment.length) ? d.payment : f.payment;
  if (payment.length) renderPayment(payment);

  if (!_projectId) {
    var wishes = (d.wishes && d.wishes.length) ? d.wishes : f.wishes;
    renderWishes(wishes);
  }
}

window.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'INVITATION_DATA') return;

  var payload = e.data.payload;
  var apiBaseUrl = payload.apiBaseUrl;
  var tenantSlug = payload.tenantSlug;
  var projectSlug = payload.projectSlug;
  var guest = payload.guestName || payload.guest;

  if (el('guest')) el('guest').innerHTML = guest || FALLBACK_DATA.guestName;

  if (payload.mode === "preview") {
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

      var content = (response.data && response.data.content) ? response.data.content : {};
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
    });
});

function animateLetters(selector, baseDelay) {
  baseDelay = baseDelay || 0;
  document.querySelectorAll(selector).forEach(function (node, nodeIndex) {
    node.innerHTML = node.textContent.replace(/\S/g, function (char) {
      return '<span class="letter" style="display:inline-block;">' + char + '</span>';
    });
    anime({
      targets: node.querySelectorAll('.letter'),
      scale: [4, 1],
      opacity: [0, 1],
      translateZ: 0,
      easing: 'easeOutExpo',
      duration: 950,
      delay: function (_, i) { return baseDelay + (nodeIndex * 300) + 100 * i; }
    });
  });
}

function renderPayment(paymentData) {
  var section = el('payment-section');
  var list = el('payment-list');
  if (!section || !list) return;

  list.innerHTML = paymentData.map(function (p) {
    return '<div class="payment-card">'
      + '<img src="' + getPaymentImage(p.method) + '" alt="' + p.method + '">'
      + '<p class="payment-value">' + p.value + '</p>'
      + '<p class="payment-name">a.n ' + p.name + '</p>'
      + '</div>';
  }).join('');

  section.style.display = 'block';
}

function renderGallery(galleryData) {
  var slides = el('gallery-slides');
  var preview = document.querySelector('#glide-gallery-preview img');
  if (!slides || !galleryData.length) return;

  slides.innerHTML = galleryData.map(function (src) {
    return '<div class="col-3"><div class="glide-gallery-slide glide__slide"><img src="' + src + '" alt=""></div></div>';
  }).join('');

  if (preview) preview.src = galleryData[0];
}

function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function renderWishes(wishesData) {
  var list = el('wishes-list');
  if (!list) return;

  if (!wishesData || !wishesData.length) {
    list.innerHTML = '<div class="text-center py-5"><p class="text-light font-light">Belum ada ucapan</p></div>';
    return;
  }

  list.innerHTML = wishesData.map(function (w) {
    return '<div class="mb-5">'
      + '<h6 class="text-white font-bold">' + sanitize(w.guest_name || w.name) + '</h6>'
      + '<div class="text-light">' + sanitize(w.message) + '</div>'
      + '</div>';
  }).join('');
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

function showNotification(message, type) {
  var notification = document.createElement('div');
  notification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;'
    + 'background:' + (type === 'success' ? '#10b981' : '#ef4444') + ';color:white;'
    + 'padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);'
    + 'font-size:14px;font-weight:500;max-width:90%;text-align:center;'
    + 'animation:slideDown 0.3s ease-out;';
  notification.textContent = message;

  if (!document.getElementById('notification-style')) {
    var style = document.createElement('style');
    style.id = 'notification-style';
    style.textContent = '@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  setTimeout(function () {
    notification.style.animation = 'slideDown 0.3s ease-out reverse';
    setTimeout(function () {
      if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 300);
  }, 3000);
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

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';
  }

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
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Jawab Undangan';
      }
    });
}

var url = new URL(window.location.href);
var u = url.searchParams.get("name") ? url.searchParams.get("name").replace(/_/g, " ") : "";
if (u && el('guest')) el('guest').innerHTML = u;

document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  applyData(FALLBACK_DATA);

  AOS.init();

  if (document.querySelector('.spouse-text')) {
    animateLetters('.spouse-text');
  }

  var btn_open = document.querySelector('#btn-open-opening');
  var btn_play = document.querySelector('#btn-play');
  var audio = document.querySelector('#audio');

  if (btn_open) {
    btn_open.addEventListener('click', function () {
      document.body.classList.remove('opening-show');
      document.body.classList.add('opening-hide');
      for (var aos of document.querySelectorAll('.aos-init')) aos.classList.remove('aos-animate');
      setTimeout(function () {
        var opening = document.querySelector('section#opening');
        if (opening) opening.remove();
        AOS.refresh();
      }, 1500);
      if (audio && audio.querySelector('source') && audio.querySelector('source').src) {
        audio.play().catch(function () { });
        if (btn_play) btn_play.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      }
    });
  }

  if (btn_play && audio) {
    btn_play.addEventListener('click', function () {
      if (audio.paused) {
        btn_play.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        audio.play();
      } else {
        btn_play.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        audio.pause();
      }
    });
  }

  var rsvpForm = document.querySelector('#rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', handleCommentSubmit);
  }

  var glideGallery = null;
  var carousel = document.getElementById('carouselExampleFade');
  if (carousel) {
    carousel.addEventListener('slide.bs.carousel', function () {
      for (var aos of document.querySelectorAll('.aos-init')) aos.classList.remove('aos-animate');
    });
    carousel.addEventListener('slid.bs.carousel', function (event) {
      if (event.relatedTarget.querySelector('#section-3') !== null && glideGallery === null) {
        glideGallery = new Glide('.glide', {
          type: 'carousel',
          perView: 3,
          focusAt: 0,
          gap: 20,
          peek: { before: 10, after: 50 }
        }).on('run.after', function () {
          var active = document.querySelector('.glide__slide--active img');
          var preview = document.querySelector('#glide-gallery-preview');
          if (active && preview) {
            preview.classList.add('active');
            preview.querySelector('img').src = active.src;
          }
        }).on('run.before', function () {
          var preview = document.querySelector('#glide-gallery-preview');
          if (preview) preview.classList.remove('active');
        }).mount();
      }
      AOS.refresh();
    });
  }
});
