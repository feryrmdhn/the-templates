var FALLBACK_DATA = FALLBACK["brown-casual"];

var _sliderGallery1 = null;
var _sliderMessage = null;
var _countdownInstance = null;
var _isDataApplied = false;
var _projectId = null;
var _apiBaseUrl = null;

function el(id) { return document.getElementById(id); }
function getPaymentImage(method) { return '/payment/' + method + '.png'; }

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

function applyData(data) {
    var d = data;
    var f = FALLBACK_DATA;
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    if (el('groom-name')) el('groom-name').innerHTML = d.groomName || f.groomName;
    if (el('groom-name-2')) el('groom-name-2').innerHTML = d.groomName || f.groomName;
    if (el('groom-name-3')) el('groom-name-3').innerHTML = d.groomName || f.groomName;
    if (el('bride-name')) el('bride-name').innerHTML = d.brideName || f.brideName;
    if (el('bride-name-2')) el('bride-name-2').innerHTML = d.brideName || f.brideName;
    if (el('bride-name-3')) el('bride-name-3').innerHTML = d.brideName || f.brideName;
    if (el('guest')) el('guest').innerHTML = d.guestName || f.guestName;
    if (el('groom-photo')) el('groom-photo').src = d.groomPhoto || f.groomPhoto;
    if (el('bride-photo')) el('bride-photo').src = d.bridePhoto || f.bridePhoto;
    if (el('father-groom')) el('father-groom').innerHTML = d.fatherGroom || f.fatherGroom || '';
    if (el('father-bride')) el('father-bride').innerHTML = d.fatherBride || f.fatherBride || '';

    var akad = new Date(d.akadDatetime || f.akadDatetime);
    if (el('akad-date')) el('akad-date').innerHTML = days[akad.getDay()] + ', ' + akad.getDate() + ' ' + months[akad.getMonth()] + ' ' + akad.getFullYear();
    if (el('akad-time')) el('akad-time').innerHTML = 'Pukul ' + akad.getHours().toString().padStart(2, '0') + '.' + akad.getMinutes().toString().padStart(2, '0');
    if (el('akad-venue')) el('akad-venue').innerHTML = d.akadVenue || f.akadVenue;

    var recep = new Date(d.receptionDatetime || f.receptionDatetime);
    if (el('reception-date')) el('reception-date').innerHTML = days[recep.getDay()] + ', ' + recep.getDate() + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();
    if (el('reception-time')) el('reception-time').innerHTML = 'Pukul ' + recep.getHours().toString().padStart(2, '0') + '.' + recep.getMinutes().toString().padStart(2, '0');
    if (el('reception-venue')) el('reception-venue').innerHTML = d.receptionVenue || f.receptionVenue;

    if (el('gmap_canvas')) el('gmap_canvas').src = cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) || '';

    var music = d.music || f.music;
    var audioSource = document.querySelector('#audio source');
    if (audioSource && music) {
        audioSource.setAttribute('src', music);
        audioSource.parentElement.load();
    }

    var isShowStory = d.isShowStory !== undefined ? d.isShowStory : (f.isShowStory !== undefined ? f.isShowStory : true);
    if (isShowStory) {
        var stories = d.storyItems != null ? d.storyItems : f.storyItems;
        renderStory(stories);
    } else {
        var storySection = document.getElementById('section-3');
        if (storySection) storySection.style.display = 'none';
        var storyNav = document.querySelector('.nav-link[href="#section-3"]');
        if (storyNav && storyNav.parentElement) storyNav.parentElement.style.display = 'none';
    }

    var isShowGallery = d.isShowGallery !== undefined ? d.isShowGallery : (f.isShowGallery !== undefined ? f.isShowGallery : true);
    if (isShowGallery) {
        var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
        renderGallery(gallery);
    } else {
        var gallerySection = document.getElementById('section-4');
        if (gallerySection) gallerySection.style.display = 'none';
        var galleryNav = document.querySelector('.nav-link[href="#section-4"]');
        if (galleryNav && galleryNav.parentElement) galleryNav.parentElement.style.display = 'none';
    }

    if (!_projectId) {
        var wishes = (d.wishes && d.wishes.length) ? d.wishes : f.wishes;
        renderWishes(wishes);
    }

    var payment = (d.payment && d.payment.length) ? d.payment : f.payment;
    if (payment.length) renderPayment(payment);

    updateCountdown(d.receptionDatetime || f.receptionDatetime);
    updateCoverNames(d.groomName || f.groomName, d.brideName || f.brideName);

    var backgroundCover = d.backgroundCover || f.backgroundCover;
    if (backgroundCover) {
        var headerSection = document.querySelector('#header');
        if (headerSection) {
            var headerBg = window.getComputedStyle(headerSection).backgroundImage;
            var newHeaderBg = headerBg.replace(/url\([^)]*\)(?!.*url\([^)]*\))/, 'url("' + backgroundCover + '")');
            headerSection.style.backgroundImage = newHeaderBg;
        }
    }

    if (el('platform-name')) el('platform-name').innerHTML = d.platform || f.platform || 'Your platform';
}

window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'INVITATION_DATA') return;
    _isDataApplied = true; 

    var payload = e.data.payload;
    var guest = payload.guestName || payload.guest;

    if (el('guest')) el('guest').innerHTML = guest || FALLBACK_DATA.guestName;

    if (payload.mode === "preview") {
        applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
        renderTenant({});
        notifyLoaded();
        return;
    }

    var apiBaseUrl = payload.apiBaseUrl;
    var tenantSlug = payload.tenantSlug;
    var projectSlug = payload.projectSlug;

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

function renderStory(storyItems) {
    var list = el('story-list');
    if (!list) return;
    if (!storyItems || !storyItems.length) {
        list.innerHTML = '';
        return;
    }
    var mid = Math.ceil(storyItems.length / 2);
    var left = storyItems.slice(0, mid);
    var right = storyItems.slice(mid);
    var makeCards = function (items, dir, isRightCol) {
        return items.map(function (s, i) {
            var mtStyle = '';
            if (isRightCol) {
                mtStyle = ' style="margin-top:25rem"';
            } else if (i > 0) {
                mtStyle = ' style="margin-top:20rem"';
            }
            return '<div class="card"' + mtStyle + ' data-aos="fade-' + dir + '" data-aos-duration="1200">'
                + '<div class="card-body">'
                + (s.year ? '<div class="text-md text-dark-500 mb-2">' + s.year + '</div>' : '')
                + '<div class="text-md text-dark mb-4">' + (s.title || '') + '</div>'
                + '<p class="text-dark-500">' + (s.description || '') + '</p></div></div>';
        }).join('');
    };
    list.innerHTML = '<div class="col-md-6 col-lg-4">' + makeCards(left, 'right', false) + '</div>'
        + '<div class="col-auto d-none d-lg-block" data-aos="fade-up" data-aos-duration="1200"><img src="/examples/brown-casual/_assets/img/decoration/list-decoration.svg" alt=""></div>'
        + '<div class="col-md-6 col-lg-4">' + makeCards(right, 'left', true) + '</div>';
    if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderGallery(galleryData) {
    if (!galleryData || !galleryData.length) return;

    var wrapper = document.querySelector('#section-4 .tinyslider-container-wrapper');
    if (!wrapper) return;

    if (_sliderGallery1) {
        try { _sliderGallery1.destroy(); } catch (e) { }
        _sliderGallery1 = null;
    }

    wrapper.innerHTML = '';

    var newContainer = document.createElement('div');
    newContainer.id = 'tinyslider-container-gallery-1';
    newContainer.className = 'tinyslider-container';
    newContainer.innerHTML = galleryData.map(function (src) {
        return '<div class="tinyslider-item"><img src="' + src + '" alt=""></div>';
    }).join('');

    wrapper.appendChild(newContainer);

    if (typeof tns === 'undefined') {
        _galleryInitializing = false;
        setTimeout(function () { renderGallery(galleryData); }, 100);
        return;
    }

    var images = newContainer.querySelectorAll('img');
    var total = images.length;
    var loaded = 0;

    function onLoad() {
        loaded++;
        if (loaded >= total) initSlider();
    }

    function initSlider() {
        
        if (newContainer.offsetWidth === 0) {
            setTimeout(initSlider, 200);
            return;
        }

        try {
            _sliderGallery1 = tns({
                container: '#tinyslider-container-gallery-1',
                controlsContainer: '#tinyslider-controls-gallery-1',
                items: 1,
                nav: false,
                mouseDrag: true,
                touch: true,
                swipeAngle: false,
                gutter: 0,
                edgePadding: 0,
                responsive: { 768: { items: 2, gutter: 20 } }
            });
        } catch (err) { }
    }

    if (total === 0) {
        initSlider();
    } else {
        images.forEach(function (img) {
            if (img.complete) {
                onLoad();
            } else {
                img.addEventListener('load', onLoad);
                img.addEventListener('error', onLoad);
            }
        });
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

function renderWishes(wishesData) {
    var wrapper = document.querySelector('#section-5 .tinyslider-container-wrapper');
    if (!wrapper) return;

    if (!wishesData || !wishesData.length) {
        wrapper.innerHTML = '<div class="text-center py-5"><p class="font-light">Belum ada ucapan</p></div>';
        return;
    }

    if (_sliderMessage) {
        try { _sliderMessage.destroy(); } catch (e) { }
        _sliderMessage = null;
    }

    wrapper.innerHTML = '';

    var newContainer = document.createElement('div');
    newContainer.id = 'tinyslider-container-message';
    newContainer.className = 'tinyslider-container';
    newContainer.innerHTML = wishesData.map(function (w) {
        return '<div class="tinyslider-item tinyslider-item-message">'
            + '<div>' + sanitize(w.guest_name || w.name) + '</div>'
            + '<div class="text-sm text-gray">Baru saja</div>'
            + '<div class="text-sm">' + sanitize(w.message) + '</div>'
            + '</div>';
    }).join('');

    wrapper.appendChild(newContainer);

    if (typeof tns === 'undefined') {
        setTimeout(function () { renderWishes(wishesData); }, 100);
        return;
    }

    function initSlider() {
        if (newContainer.offsetWidth === 0) {
            setTimeout(initSlider, 200);
            return;
        }

        try {
            _sliderMessage = tns({
                container: '#tinyslider-container-message',
                controlsContainer: "#tinyslider-controls-message",
                items: 1.2, nav: false, mouseDrag: true, gutter: 30, swipeAngle: false,
                responsive: { 568: { items: 2.2, gutter: 20 }, 992: { items: 2.6, gutter: 30 } }
            });
        } catch (err) {
            console.error('Error initializing message slider:', err);
        }
    }

    initSlider();
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

function updateCountdown(datetime) {
    if (_countdownInstance) {
        try { _countdownInstance.destroy(); } catch (e) { }
        _countdownInstance = null;
    }
    _countdownInstance = timezz('#countdown-row-1, #countdown-row-2', {
        date: new Date(datetime),
        stop: false, canContinue: false, withYears: false,
        beforeCreate() { }, beforeDestroy() { }, update() { },
    });
}

function updateCoverNames(groomName, brideName) {
    if (el('groom-name-2')) el('groom-name-2').textContent = groomName;
    if (el('bride-name-2')) el('bride-name-2').textContent = brideName;

    var headerH1 = document.querySelector('#header h1');
    if (headerH1) {
        var coupleText = groomName + ' & ' + brideName;
        if (headerH1.querySelector('.letter')) {
            headerH1.innerHTML = coupleText.replace(/\S/g, function (c) {
                return '<span class="letter" style="display:inline-block;">' + c + '</span>';
            });
            anime.timeline().add({
                targets: '#header h1 .letter',
                scale: [4, 1], opacity: [0, 1], translateZ: 0,
                easing: "easeOutExpo", duration: 950,
                delay: function (_, i) { return 150 * i; }
            });
        } else {
            headerH1.textContent = coupleText;
        }
    }
}

function startLeaves() {
    var overlay = document.getElementById('leavesOverlay');
    if (!overlay) return;
    overlay.innerHTML = '';
    overlay.classList.add('is-active');

    var count = window.innerWidth < 576 ? 10 : 20;
    var vh = window.innerHeight;
    var leafClasses = ['leaf-1', 'leaf-2', 'leaf-3', 'leaf-4', 'leaf-5'];

    for (var i = 0; i < count; i++) {
        var leaf = document.createElement('span');
        leaf.className = 'leaf ' + leafClasses[i % leafClasses.length];
        var size = 10 + Math.random() * 14;
        leaf.style.width = size + 'px';
        leaf.style.height = (size * 1.4) + 'px';
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.opacity = (0.5 + Math.random() * 0.4).toFixed(2);
        overlay.appendChild(leaf);

        if (typeof anime !== 'undefined') {
            var dur = anime.random(8000, 15000);
            var swayDir = Math.random() > 0.5 ? 1 : -1;
            anime({
                targets: leaf,
                translateY: [-30, vh + 50],
                translateX: [
                    { value: swayDir * anime.random(50, 120), duration: dur * 0.33, easing: 'easeInOutSine' },
                    { value: swayDir * anime.random(-120, -50), duration: dur * 0.34, easing: 'easeInOutSine' },
                    { value: swayDir * anime.random(40, 100), duration: dur * 0.33, easing: 'easeInOutSine' }
                ],
                rotate: anime.random(-360, 360),
                scale: [1, 0.7 + Math.random() * 0.4],
                duration: dur,
                delay: Math.random() * dur,
                loop: true,
                easing: 'linear'
            });
        }
    }
}

var url = new URL(window.location.href);
var u = url.searchParams.get("name") ? url.searchParams.get("name").replace(/_/g, " ") : "";
if (u && el('guest')) el('guest').innerHTML = u;

document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    AOS.init();

    var btn_open = document.querySelector('#btn-open-opening');
    var btn_play = document.querySelector('#btn-play');
    var audio = document.querySelector('#audio');

    if (btn_open) {
        btn_open.addEventListener('click', function () {
            for (var aos of document.querySelectorAll('.aos-init')) aos.classList.remove('aos-animate');
            setTimeout(function () { AOS.refresh(); }, 2000);
            startLeaves();
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

    setTimeout(function () {
        if (!_isDataApplied) {
            _isDataApplied = true;
            applyData(Object.assign({}, FALLBACK_DATA, { guestName: u || FALLBACK_DATA.guestName }));
        }
    }, 2000);

    var headerH1 = document.querySelector('#header h1');
    if (headerH1) {
        headerH1.innerHTML = headerH1.textContent.replace(/\S/g, function (c) {
            return '<span class="letter" style="display:inline-block;">' + c + '</span>';
        });
        anime.timeline().add({
            targets: '#header h1 .letter',
            scale: [4, 1], opacity: [0, 1], translateZ: 0,
            easing: "easeOutExpo", duration: 950,
            delay: function (_, i) { return 150 * i; }
        });
    }

    for (var btn of document.querySelectorAll('.page-scroll')) {
        btn.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            e.preventDefault();
        });
    }

    var rsvpForm = document.querySelector('#rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', handleCommentSubmit);
    }

    var btn_to_top = document.querySelector('#btn-to-top');
    var navbar = document.querySelector('.navbar');
    var navlinks = document.querySelectorAll('.nav-link.page-scroll');
    var str_section_query = "";
    for (var i = 0; i < navlinks.length; i++) {
        str_section_query += navlinks[i].getAttribute('href') + (i < navlinks.length - 1 ? ', ' : '');
    }
    var sectionlistener = document.querySelectorAll(str_section_query);

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
            if (btn_to_top) btn_to_top.style.display = 'flex';
        } else {
            navbar.classList.remove('navbar-scrolled');
            if (btn_to_top) btn_to_top.style.display = 'none';
        }
        for (var s of sectionlistener) {
            if (window.scrollY > (s.offsetTop - 100) && window.scrollY < (s.offsetTop + s.offsetHeight)) {
                for (var link of document.querySelectorAll('.nav-link')) link.classList.remove('active');
                var activeLink = document.querySelector('.nav-link[href="#' + s.id + '"]');
                if (activeLink) activeLink.classList.add('active');
            }
        }
    });
});
