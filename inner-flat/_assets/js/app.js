var FALLBACK_DATA = FALLBACK["inner-flat"];

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

var _countdownInstance = null;

function sanitize(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function formatDate(datetime) {
    var d = new Date(datetime);
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function formatTime(datetime) {
    var d = new Date(datetime);
    return d.getHours().toString().padStart(2, '0') + '.' + d.getMinutes().toString().padStart(2, '0');
}

function applyData(data) {
    var d = data;
    var f = FALLBACK_DATA;

    var groomName = d.groomName || f.groomName;
    var brideName = d.brideName || f.brideName;
    var coupleText = groomName + ' & ' + brideName;

    if (el('guest')) el('guest').innerHTML = d.guestName || f.guestName;
    if (el('groom-name-opening')) el('groom-name-opening').innerHTML = groomName;
    if (el('bride-name-opening')) el('bride-name-opening').innerHTML = brideName;
    if (el('groom-name')) el('groom-name').innerHTML = groomName;
    if (el('bride-name')) el('bride-name').innerHTML = brideName;
    if (el('header-couple')) el('header-couple').innerHTML = coupleText;
    if (el('footer-couple')) el('footer-couple').innerHTML = coupleText;
    if (el('father-groom')) el('father-groom').innerHTML = d.fatherGroom || f.fatherGroom || '';
    if (el('father-bride')) el('father-bride').innerHTML = d.fatherBride || f.fatherBride || '';
    if (el('groom-role')) el('groom-role').innerHTML = d.groomRole || f.groomRole || '';
    if (el('bride-role')) el('bride-role').innerHTML = d.brideRole || f.brideRole || '';
    if (el('quote')) el('quote').innerHTML = d.quote || f.quote || '';
    if (el('platform-name')) el('platform-name').innerHTML = d.platform || f.platform || '';

    if (el('groom-photo') && (d.groomPhoto || f.groomPhoto)) el('groom-photo').src = d.groomPhoto || f.groomPhoto;
    if (el('bride-photo') && (d.bridePhoto || f.bridePhoto)) el('bride-photo').src = d.bridePhoto || f.bridePhoto;

    var akadDatetime = d.akadDatetime || f.akadDatetime;
    if (akadDatetime) {
        if (el('akad-date')) el('akad-date').innerHTML = formatDate(akadDatetime);
        if (el('akad-time')) el('akad-time').innerHTML = formatTime(akadDatetime);
        if (el('save-the-date')) el('save-the-date').innerHTML = formatDate(akadDatetime);
        if (el('header-date')) el('header-date').innerHTML = formatDate(akadDatetime);
    }
    if (el('akad-venue')) el('akad-venue').innerHTML = (d.akadVenue || f.akadVenue || '') + (d.akadAddress || f.akadAddress ? ', ' + (d.akadAddress || f.akadAddress) : '');

    var receptionDatetime = d.receptionDatetime || f.receptionDatetime;
    if (receptionDatetime) {
        if (el('reception-date')) el('reception-date').innerHTML = formatDate(receptionDatetime);
        if (el('reception-time')) el('reception-time').innerHTML = formatTime(receptionDatetime);
        updateCountdown(receptionDatetime);
    }
    if (el('reception-venue')) el('reception-venue').innerHTML = (d.receptionVenue || f.receptionVenue || '') + (d.receptionAddress || f.receptionAddress ? ', ' + (d.receptionAddress || f.receptionAddress) : '');

    var mapFrame = el('gmap_canvas');
    if (mapFrame) mapFrame.src = cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) || '';

    var backgroundCover = d.backgroundCover || f.backgroundCover;
    if (backgroundCover) {
        var openingSection = document.querySelector('#opening');
        var headerSection = document.querySelector('#header');
        if (openingSection) {
            var openingBg = window.getComputedStyle(openingSection).backgroundImage;
            var newOpeningBg = openingBg.replace(/url\([^)]*\)(?!.*url\([^)]*\))/, 'url("' + backgroundCover + '")');
            openingSection.style.backgroundImage = newOpeningBg;
        }
        if (headerSection) {
            var headerBg = window.getComputedStyle(headerSection).backgroundImage;
            var newHeaderBg = headerBg.replace(/url\([^)]*\)(?!.*url\([^)]*\))/, 'url("' + backgroundCover + '")');
            headerSection.style.backgroundImage = newHeaderBg;
        }
    }

    var music = d.music || f.music;
    var audioSource = document.querySelector('#audio source');
    if (audioSource && music) {
        audioSource.setAttribute('src', music);
        audioSource.parentElement.load();
    }

    var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
    renderGallery(gallery);

    var payment = (d.payment && d.payment.length) ? d.payment : f.payment;
    if (payment && payment.length) renderPayment(payment);

    if (!_projectId) {
        var wishes = (d.wishes && d.wishes.length) ? d.wishes : f.wishes;
        renderWishes(wishes);
    }
}

function updateCountdown(datetime) {
    if (_countdownInstance) {
        try { _countdownInstance.destroy(); } catch (e) { }
        _countdownInstance = null;
    }
    if (typeof timezz === 'undefined') return;
    _countdownInstance = timezz('#countdown-row', {
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
    var container = el('row-lightgallery');
    if (!container || !galleryData || !galleryData.length) return;

    container.innerHTML = galleryData.map(function (src, i) {
        var colClass = (i % 3 === 0) ? 'col-lg-8' : 'col-lg-4';
        return '<div class="' + colClass + ' col-md-6 col-12">'
            + '<div class="gallery-thumb image-hover-thumb" data-src="' + src + '">'
            + '<img src="' + src + '" class="gallery-image img-fluid" alt="">'
            + '</div></div>';
    }).join('');

    if (typeof lightGallery !== 'undefined') {
        lightGallery(container, { selector: '.gallery-thumb' });
    }
}

function renderPayment(paymentData) {
    var section = el('payment-section');
    var list = el('payment-list');
    if (!section || !list) return;

    list.innerHTML = paymentData.map(function (p) {
        return '<div class="payment-card">'
            + '<img src="/payment/' + p.method + '.png" alt="' + p.method + '">'
            + '<p class="payment-value">' + p.value + '</p>'
            + '<p class="payment-name">a.n ' + p.name + '</p>'
            + '</div>';
    }).join('');

    section.style.display = 'block';
}

function renderWishes(wishesData) {
    var list = el('wishes-list');
    if (!list) return;

    if (!wishesData || !wishesData.length) {
        list.innerHTML = '<p class="text-muted">Belum ada ucapan</p>';
        return;
    }

    list.innerHTML = wishesData.map(function (w) {
        return '<div class="wish-item mb-4">'
            + '<div class="fw-bold">' + sanitize(w.guest_name || w.name) + '</div>'
            + '<div class="text-muted">' + sanitize(w.message) + '</div>'
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
                submitBtn.textContent = 'Kirim Ucapan';
            }
        });
}

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

var url = new URL(window.location.href);
var u = url.searchParams.get('name') ? url.searchParams.get('name').replace(/_/g, ' ') : '';
if (u && el('guest')) el('guest').innerHTML = u;

function startSnow() {
    var overlay = document.getElementById('snowOverlay');
    if (!overlay) return;
    overlay.innerHTML = '';
    overlay.classList.add('is-active');

    var count = window.innerWidth < 576 ? 30 : 50;
    var vh = window.innerHeight;

    for (var i = 0; i < count; i++) {
        var flake = document.createElement('span');
        flake.className = 'snowflake';
        var size = 3 + Math.random() * 6;
        flake.style.width = size + 'px';
        flake.style.height = size + 'px';
        flake.style.left = Math.random() * 100 + '%';
        overlay.appendChild(flake);

        if (typeof anime !== 'undefined') {
            var dur = anime.random(6000, 12000);
            anime({
                targets: flake,
                translateY: [-20, vh + 40],
                translateX: [
                    { value: anime.random(-40, 40), duration: dur * 0.35, easing: 'easeInOutSine' },
                    { value: anime.random(-40, 40), duration: dur * 0.35, easing: 'easeInOutSine' },
                    { value: anime.random(-30, 30), duration: dur * 0.30, easing: 'easeInOutSine' }
                ],
                opacity: [
                    { value: 0, duration: 300 },
                    { value: 0.4 + Math.random() * 0.5, duration: 800 },
                    { value: 0.4 + Math.random() * 0.5, duration: dur - 1500 },
                    { value: 0, duration: 700 }
                ],
                rotate: anime.random(0, 360),
                scale: [1, 0.6 + Math.random() * 0.6],
                duration: dur,
                delay: Math.random() * dur,
                loop: true,
                easing: 'linear'
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    setTimeout(function () {
        if (!_isDataApplied) {
            _isDataApplied = true;
            applyData(Object.assign({}, FALLBACK_DATA, { guestName: u || FALLBACK_DATA.guestName }));
            renderTenant({}); // Populate default logo/social segera; diperbarui oleh API jika tersedia
        }
    }, 2000);

    AOS.init();

    if (document.querySelector('.spouse-text')) {
        animateLetters('.spouse-text');
    }

    var btn_open = document.querySelector('#btn-open-opening');
    var btn_play = document.querySelector('#btn-play');
    var audio = document.querySelector('#audio');

    if (btn_open) {
        btn_open.addEventListener('click', function () {
            document.body.classList.add('opening-hide');
            setTimeout(function () {
                document.body.classList.remove('opening-show');
                document.body.classList.remove('opening-hide');
                var opening = document.querySelector('section#opening');
                if (opening) opening.remove();
                AOS.refresh();
                startSnow();
            }, 2000);
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

    window.addEventListener('scroll', function () {
        var navbar = el('navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('is-sticky');
            } else {
                navbar.classList.remove('is-sticky');
            }
        }
    });

    var commentForm = document.querySelector('#comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }

    document.querySelectorAll('.page-scroll').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    var navbarHeight = (el('navbar') ? el('navbar').offsetHeight : 0) + 10;
                    window.scrollTo({ top: target.offsetTop - navbarHeight, behavior: 'smooth' });
                }
            }
            var navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        });
    });
});
