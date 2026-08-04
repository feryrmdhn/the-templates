var FALLBACK_DATA = FALLBACK["sweet-flower"];
var _projectId = null;
var _apiBaseUrl = null;
var _isDataApplied = false;

var _sliderGallery = null;
var _sliderMessages = null;

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

function applyData(data) {
    var d = data;
    var f = FALLBACK_DATA;
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    if (el('guest')) el('guest').innerHTML = d.guestName || f.guestName;
    if (el('groom-name-opening')) el('groom-name-opening').innerHTML = d.groomName || f.groomName;
    if (el('bride-name-opening')) el('bride-name-opening').innerHTML = d.brideName || f.brideName;
    if (el('groom-name-header')) el('groom-name-header').innerHTML = d.groomName || f.groomName;
    if (el('bride-name-header')) el('bride-name-header').innerHTML = d.brideName || f.brideName;
    if (el('groom-name')) el('groom-name').innerHTML = d.groomName || f.groomName;
    if (el('bride-name')) el('bride-name').innerHTML = d.brideName || f.brideName;
    if (el('groom-role')) el('groom-role').innerHTML = d.groomRole || f.groomRole;
    if (el('bride-role')) el('bride-role').innerHTML = d.brideRole || f.brideRole;
    if (el('father-groom')) el('father-groom').innerHTML = d.fatherGroom || f.fatherGroom || '';
    if (el('father-bride')) el('father-bride').innerHTML = d.fatherBride || f.fatherBride || '';
    if (el('groom-photo')) el('groom-photo').src = d.groomPhoto || f.groomPhoto;
    if (el('bride-photo')) el('bride-photo').src = d.bridePhoto || f.bridePhoto;
    if (el('rsvp-photo')) el('rsvp-photo').src = d.rsvpPhoto || f.rsvpPhoto;

    if (el('closing-couple')) el('closing-couple').innerHTML = (d.groomName || f.groomName) + '<br>&<br>' + (d.brideName || f.brideName);

    var akad = new Date(d.akadDatetime || f.akadDatetime);
    if (el('akad-date')) el('akad-date').innerHTML = days[akad.getDay()] + ', ' + akad.getDate() + ' ' + months[akad.getMonth()] + ' ' + akad.getFullYear();
    if (el('akad-time')) el('akad-time').innerHTML = 'Pukul ' + akad.getHours().toString().padStart(2, '0') + '.' + akad.getMinutes().toString().padStart(2, '0');
    if (el('akad-venue')) el('akad-venue').innerHTML = d.akadVenue || f.akadVenue;

    var recep = new Date(d.receptionDatetime || f.receptionDatetime);
    if (el('reception-date')) el('reception-date').innerHTML = days[recep.getDay()] + ', ' + recep.getDate() + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();
    if (el('reception-time')) el('reception-time').innerHTML = 'Pukul ' + recep.getHours().toString().padStart(2, '0') + '.' + recep.getMinutes().toString().padStart(2, '0');
    if (el('reception-venue')) el('reception-venue').innerHTML = d.receptionVenue || f.receptionVenue;

    if (el('save-the-date')) el('save-the-date').innerHTML = recep.getDate().toString().padStart(2, '0') + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();
    if (el('header-date')) el('header-date').innerHTML = recep.getDate().toString().padStart(2, '0') + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();

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

    timezz('#countdown-row', {
        date: recep,
        stop: false, canContinue: false, withYears: false,
        beforeCreate() { }, beforeDestroy() { }, update() { },
    });

    var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
    var galleryLabels = (d.galleryLabels && d.galleryLabels.length) ? d.galleryLabels : f.galleryLabels;
    renderGallery(gallery, galleryLabels);

    var isShowStory = d.isShowStory !== undefined ? d.isShowStory : (f.isShowStory !== undefined ? f.isShowStory : true);
    if (isShowStory) {
        var stories = d.storyItems != null ? d.storyItems : f.storyItems;
        renderStories(stories);
    } else {
        var storySection = document.getElementById('section-5');
        if (storySection) storySection.style.display = 'none';
        var storyNav = document.querySelector('.nav-link[href="#section-5"]');
        if (storyNav && storyNav.parentElement) storyNav.parentElement.style.display = 'none';
    }

    var music = d.music || f.music;
    var audioSource = document.querySelector('#audio source');
    if (audioSource && music) {
        audioSource.setAttribute('src', music);
        audioSource.parentElement.load();
    }

    if (!_projectId) {
        var wishes = (d.wishes && d.wishes.length) ? d.wishes : f.wishes;
        renderWishes(wishes);
    }

    var payment = (d.payment && d.payment.length) ? d.payment : f.payment;
    if (payment.length) renderPayment(payment);

    if (el('platform-name')) el('platform-name').innerHTML = d.platform || f.platform || 'Your platform';

    var coverImg = d.coverImage || f.coverImage;
    if (coverImg) {
        var openingSection = el('opening');
        if (openingSection) {
            openingSection.style.backgroundImage = "url('_assets/img/decoration/brush-opening.png'), linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%), url('" + coverImg + "')";
        }
        var headerSection = el('header');
        if (headerSection) {
            headerSection.style.backgroundImage = "url('_assets/img/decoration/brush-header.png'), linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%), url('" + coverImg + "')";
        }
    }
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

function animateLetters(selector, baseDelay) {
    baseDelay = baseDelay || 0;
    document.querySelectorAll(selector).forEach(function (node, nodeIndex) {
        node.innerHTML = node.textContent.replace(/\S/g, function (char) {
            return '<span class="letter" style="display:inline-block;">' + char + '</span>';
        });
        anime({
            targets: node.querySelectorAll('.letter'),
            scale: [4, 1], opacity: [0, 1], translateZ: 0,
            easing: 'easeOutExpo', duration: 950,
            delay: function (_, i) { return baseDelay + (nodeIndex * 300) + 100 * i; }
        });
    });
}

function renderGallery(galleryData, labels) {
    var wrapper = el('tinyslider-container-gallery');
    if (!wrapper) return;

    var parentWrapper = wrapper.parentElement;
    if (!parentWrapper) return;

    if (_sliderGallery) {
        try { _sliderGallery.destroy(); } catch (e) { }
        _sliderGallery = null;
    }
    var tnsOuter = parentWrapper.querySelector('.tns-outer');
    if (tnsOuter) tnsOuter.remove();

    if (!galleryData || !galleryData.length) {
        wrapper.innerHTML = '<div class="text-center py-5"><p class="text-muted">Belum ada galeri</p></div>';
        return;
    }

    var newContainer = document.createElement('div');
    newContainer.id = 'tinyslider-container-gallery';
    newContainer.className = 'tinyslider-container';
    newContainer.innerHTML = galleryData.map(function (src, i) {
        var label = (labels && labels[i]) ? labels[i] : '';
        return '<div class="tinyslider-item">'
            + '<img id="gallery-img-' + (i + 1) + '" src="' + src + '" alt="" class="tinyslider-item-img">'
            + (label ? '<div class="tinyslider-item-label"><div class="row"><div class="col-auto"><img src="_assets/img/icons/pin-white.svg" alt="" class="mr-1"></div><div class="col">' + label + '</div></div></div>' : '')
            + '</div>';
    }).join('');

    parentWrapper.replaceChild(newContainer, wrapper);

    function initSlider() {
        if (typeof tns === 'undefined') {
            setTimeout(initSlider, 100);
            return;
        }

        if (newContainer.offsetWidth === 0) {
            setTimeout(initSlider, 200);
            return;
        }

        try {
            _sliderGallery = tns({
                container: '#tinyslider-container-gallery',
                controlsContainer: "#tinyslider-controls-gallery",
                items: 1.2, nav: false, center: true, mouseDrag: true,
                gutter: 10, swipeAngle: false, loop: false, preventScrollOnTouch: 'force',
            });
        } catch (err) { console.warn('Gallery slider init error:', err); }
    }

    setTimeout(initSlider, 100);
}

function renderStories(stories) {
    var container = el('story-list');
    if (!container) return;
    if (!stories || !stories.length) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = stories.map(function (s, i) {
        var isEven = i % 2 === 0;
        var anim = isEven ? 'fade-left' : 'fade-right';
        var orderClass = isEven ? '' : ' order-lg-2';
        var html = '<div class="row gx-0 mb-10 mb-lg-16" data-aos="' + anim + '" data-aos-offset="-50" data-aos-duration="1400">';
        html += '<div class="col-lg-4' + orderClass + '">';
        html += '<div class="obj-fit obj-fit-cover obj-pos-top w-100 h-24rem h-sm-32rem h-lg-50rem">';
        html += '<img src="' + (s.image || '') + '" alt=""></div></div>';
        html += '<div class="col-lg"><div class="card bg-black-500 rounded-0"><div class="card-body text-white p-lg-8">';
        html += '<h4 class="font-type-secondary fw-bold mb-6">' + (s.title || '') + '</h4>';
        html += '<h6 class="fw-light text-height-2">' + (s.description || '') + '</h6>';
        html += '</div></div></div>';
        html += '</div>';
        return html;
    }).join('');
    if (typeof AOS !== 'undefined') AOS.refresh();
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
    var wrapper = document.querySelector('#section-7 .pl-lg-10');
    if (!wrapper) return;

    if (!wishesData || !wishesData.length) {
        if (_sliderMessages) {
            try { _sliderMessages.destroy(); } catch (e) { }
            _sliderMessages = null;
        }
        wrapper.innerHTML = '<div id="tinyslider-container-messages" class="row"><div class="col-12 text-center py-5"><p class="text-muted">Belum ada ucapan</p></div></div>';
        return;
    }

    if (_sliderMessages) {
        try { _sliderMessages.destroy(); } catch (e) { }
        _sliderMessages = null;
    }

    wrapper.innerHTML = '';

    var newContainer = document.createElement('div');
    newContainer.id = 'tinyslider-container-messages';
    newContainer.className = 'row';
    newContainer.innerHTML = wishesData.map(function (w) {
        return '<div class="col-auto">'
            + '<div class="card card-message bg-black-500" style="min-width:280px;"><div class="card-body text-white">'
            + '<h6 class="fw-light text-height-2 mb-4" style="overflow-wrap:break-word;word-wrap:break-word;hyphens:auto;">"' + sanitize(w.message) + '"</h6>'
            + '<div class="row align-items-center"><div class="col-auto"><div class="obj-fit obj-fit-cover w-5rem h-5rem"><img src="_assets/img/icons/avatar.svg" alt=""></div></div>'
            + '<div class="col pt-2"><h6 class="fw-bold" style="overflow-wrap:break-word;word-wrap:break-word;">' + sanitize(w.guest_name || w.name) + '</h6></div></div>'
            + '</div></div></div>';
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
            _sliderMessages = tns({
                container: '#tinyslider-container-messages',
                controlsContainer: "#tinyslider-controls-messages",
                items: 1.1,
                nav: false,
                mouseDrag: true,
                gutter: 15,
                swipeAngle: false,
                loop: false,
                preventScrollOnTouch: 'force',
                responsive: {
                    568: { items: 2.2, gutter: 15 },
                    992: { items: 3.2, gutter: 20 }
                }
            });
        } catch (err) {
            console.warn('Messages slider init error:', err);
        }
    }

    initSlider();
}

function renderPayment(paymentData) {
    var section = el('payment-section');
    var list = el('payment-list');
    if (!section || !list) return;
    list.innerHTML = paymentData.map(function (p) {
        return '<div class="text-center p-3" style="min-width:16rem;">'
            + '<img src="' + getPaymentImage(p.method) + '" alt="' + p.method + '" style="width:80px;height:50px;object-fit:contain;">'
            + '<div class="fw-bold mt-2">' + p.value + '</div>'
            + '<div class="fw-light">a.n ' + p.name + '</div>'
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
    var messageInput = form.querySelector('input[name="message"]');
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

var url = new URL(window.location.href);
var u = url.searchParams.get("name") ? url.searchParams.get("name").replace(/_/g, " ") : "";
if (u && el('guest')) el('guest').innerHTML = u;

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
        var size = 6 + Math.random() * 8;
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
                translateY: [-20, vh + 40],
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

document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    AOS.init();

    setTimeout(function () {
        if (!_isDataApplied) {
            _isDataApplied = true;
            applyData(Object.assign({}, FALLBACK_DATA, { guestName: u || FALLBACK_DATA.guestName }));
            renderTenant({}); // Populate default logo/social segera; diperbarui oleh API jika tersedia
        }
    }, 2000);

    if (document.querySelector('.spouse-text')) {
        animateLetters('.spouse-text');
    }

    var btn_open = document.querySelector('#btn-open-opening');
    var btn_play = document.querySelector('#btn-play');
    var audio = document.querySelector('#audio');

    if (btn_open) {
        btn_open.addEventListener('click', function () {
            document.body.classList.add('opening-hide');
            document.body.classList.remove('opening-show');
            for (var aos of document.querySelectorAll('.aos-init')) aos.classList.remove('aos-animate');
            setTimeout(function () {
                var opening = document.querySelector('section#opening');
                if (opening) opening.remove();
                AOS.refresh();
                startLeaves();
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

    var btn_to_top = document.querySelector('#btn-to-top');
    var navbar = document.querySelector('.navbar');
    var navlinks = document.querySelectorAll('.nav-link.page-scroll');
    var str_section_query = "";
    for (var i = 0; i < navlinks.length; i++) {
        str_section_query += navlinks[i].getAttribute('href') + (i < navlinks.length - 1 ? ', ' : '');
    }
    var sectionlistener = document.querySelectorAll(str_section_query);

    var rsvpForm = document.querySelector('#comment-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', handleCommentSubmit);
    }

    for (var btn of document.querySelectorAll('.page-scroll')) {
        btn.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) window.scrollTo({ top: target.offsetTop - 50, behavior: 'smooth' });
            e.preventDefault();
        });
    }

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            if (navbar) navbar.classList.add('navbar-scrolled');
            if (btn_to_top) btn_to_top.style.display = 'flex';
        } else {
            if (navbar) navbar.classList.remove('navbar-scrolled');
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
