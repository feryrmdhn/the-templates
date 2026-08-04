var FALLBACK_DATA = FALLBACK["smooth-snow"];

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

    if (el('guest')) el('guest').innerHTML = d.guestName || f.guestName;
    if (el('groom-name-opening')) el('groom-name-opening').innerHTML = d.groomName || f.groomName;
    if (el('bride-name-opening')) el('bride-name-opening').innerHTML = d.brideName || f.brideName;
    if (el('groom-name')) el('groom-name').innerHTML = d.groomName || f.groomName;
    if (el('bride-name')) el('bride-name').innerHTML = d.brideName || f.brideName;
    if (el('groom-role')) el('groom-role').innerHTML = d.groomRole || f.groomRole;
    if (el('bride-role')) el('bride-role').innerHTML = d.brideRole || f.brideRole;
    if (el('father-groom')) el('father-groom').innerHTML = d.fatherGroom || f.fatherGroom || '';
    if (el('father-bride')) el('father-bride').innerHTML = d.fatherBride || f.fatherBride || '';
    if (el('groom-photo')) el('groom-photo').src = d.groomPhoto || f.groomPhoto;
    if (el('bride-photo')) el('bride-photo').src = d.bridePhoto || f.bridePhoto;

    var coupleText = (d.groomName || f.groomName) + '<br>&<br>' + (d.brideName || f.brideName);
    if (el('header-couple')) el('header-couple').innerHTML = coupleText;
    if (el('closing-couple')) el('closing-couple').innerHTML = (d.groomName || f.groomName) + '<br>&<br>' + (d.brideName || f.brideName);

    var isShowGallery = d.isShowGallery !== undefined ? d.isShowGallery : (f.isShowGallery !== undefined ? f.isShowGallery : true);
    if (isShowGallery) {
        if (el('gallery-desc')) el('gallery-desc').innerHTML = d.galleryDesc || f.galleryDesc || '';
        var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
        gallery.forEach(function (src, i) {
            var imgEl = el('gallery-img-' + (i + 1));
            var itemEl = el('gallery-item-' + (i + 1));
            if (imgEl) imgEl.src = src;
            if (itemEl) {
                itemEl.setAttribute('data-src', src);
                itemEl.closest('.col-md-6, .col-lg-4, .col-12').style.display = '';
            }
        });
        for (var gi = gallery.length + 1; gi <= 5; gi++) {
            var emptyImg = el('gallery-img-' + gi);
            var emptyItem = el('gallery-item-' + gi);
            if (emptyImg) emptyImg.src = '';
            if (emptyItem) {
                emptyItem.removeAttribute('data-src');
                var col = emptyItem.closest('.col-md-6, .col-lg-4, .col-12');
                if (col) col.style.display = 'none';
            }
        }
    } else {
        var gallerySection = document.getElementById('section-2');
        if (gallerySection) gallerySection.style.display = 'none';
        var galleryNav = document.querySelector('.nav-link[href="#section-2"]');
        if (galleryNav && galleryNav.parentElement) galleryNav.parentElement.style.display = 'none';
    }

    var isShowStory = d.isShowStory !== undefined ? d.isShowStory : (f.isShowStory !== undefined ? f.isShowStory : true);
    if (isShowStory) {
        var stories = d.storyItems != null ? d.storyItems : f.storyItems;
        renderStories(stories);
    } else {
        var storySection = document.getElementById('section-3');
        if (storySection) storySection.style.display = 'none';
        var storyNav = document.querySelector('.nav-link[href="#section-3"]');
        if (storyNav && storyNav.parentElement) storyNav.parentElement.style.display = 'none';
    }

    var akad = new Date(d.akadDatetime || f.akadDatetime);
    if (el('akad-date')) el('akad-date').innerHTML = days[akad.getDay()] + ', ' + akad.getDate() + ' ' + months[akad.getMonth()] + ' ' + akad.getFullYear();
    if (el('akad-time')) el('akad-time').innerHTML = 'Pukul ' + akad.getHours().toString().padStart(2, '0') + '.' + akad.getMinutes().toString().padStart(2, '0');
    if (el('akad-desc')) el('akad-desc').innerHTML = d.akadDesc || f.akadDesc || '';

    var recep = new Date(d.receptionDatetime || f.receptionDatetime);
    if (el('reception-date')) el('reception-date').innerHTML = days[recep.getDay()] + ', ' + recep.getDate() + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();
    if (el('reception-time')) el('reception-time').innerHTML = 'Pukul ' + recep.getHours().toString().padStart(2, '0') + '.' + recep.getMinutes().toString().padStart(2, '0');
    if (el('reception-desc')) el('reception-desc').innerHTML = d.receptionDesc || f.receptionDesc || '';

    if (el('save-the-date')) el('save-the-date').innerHTML = recep.getDate().toString().padStart(2, '0') + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();
    if (el('header-date')) el('header-date').innerHTML = recep.getDate().toString().padStart(2, '0') + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();

    var mapFrame = el('gmap_canvas');
    if (mapFrame) mapFrame.src = cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) || '';

    timezz('#countdown-row', {
        date: recep,
        stop: false, canContinue: false, withYears: false,
        beforeCreate() { }, beforeDestroy() { }, update() { },
    });

    if (el('rsvp-photo')) el('rsvp-photo').src = d.rsvpPhoto || f.rsvpPhoto;

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

    var lgEl = el('row-lightgallery');
    if (lgEl) {
        lightGallery(lgEl, {
            mode: 'lg-fade', cssEasing: 'ease-in', speed: 1000,
            backdropDuration: 500, hideBarsDelay: 500,
            selector: '[data-src]', download: false,
        });
    }
}

window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'INVITATION_DATA') return;
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

function renderStories(stories) {
    var container = el('story-list');
    if (!container) return;
    if (!stories || !stories.length) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = stories.map(function (s, i) {
        var isEven = i % 2 === 0;
        var anim = isEven ? 'fade-right' : 'fade-left';
        var mb = i < stories.length - 1 ? ' mb-8 mb-lg-16' : '';
        var html = '<div class="row align-items-lg-center gx-0' + mb + '" data-aos="' + anim + '" data-aos-duration="1200">';
        if (isEven) {
            html += '<div class="col-auto d-none d-md-block"><div class="w-md-3rem w-xl-6rem"></div></div>';
            html += '<div class="col-md order-2 order-md-1"><div class="card card-bordered"><div class="card-body bg-primary text-white">';
            html += '<h4 class="fw-bold mb-6">' + (s.title || '') + '</h4>';
            html += '<div class="text-lg fw-light">' + (s.description || '') + '</div>';
            html += '</div></div></div>';
            html += '<div class="col-md-4 col-xl-5 order-1 order-md-2 pt-md-8rem pt-lg-0">';
            html += '<div class="obj-fit obj-fit-cover obj-pos-top w-100 h-32rem h-xl-46rem">';
            html += '<img src="' + (s.image || '') + '" alt=""></div></div>';
        } else {
            html += '<div class="col-md-4 col-xl-5 pt-md-8rem pt-lg-0">';
            html += '<div class="obj-fit obj-fit-cover obj-pos-top w-100 h-32rem h-xl-46rem">';
            html += '<img src="' + (s.image || '') + '" alt=""></div></div>';
            html += '<div class="col-md"><div class="card card-bordered"><div class="card-body bg-primary text-white">';
            html += '<h4 class="fw-bold mb-6">' + (s.title || '') + '</h4>';
            html += '<div class="text-lg fw-light">' + (s.description || '') + '</div>';
            html += '</div></div></div>';
            html += '<div class="col-auto d-none d-md-block"><div class="w-md-3rem w-xl-6rem"></div></div>';
        }
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
    var list = el('wishes-list');
    if (!list) return;

    if (!wishesData || !wishesData.length) {
        list.innerHTML = '<div class="col-12"><div class="text-center py-5"><p class="font-light">Belum ada ucapan</p></div></div>';
        return;
    }

    list.innerHTML = wishesData.map(function (w) {
        return '<div class="col-md-6">'
            + '<div class="card"><div class="card-body bg-light">'
            + '<div class="row gx-lg-5 mb-4">'
            + '<div class="col-auto"><div class="obj-fit obj-fit-cover rounded-circle w-5rem h-5rem"><img src="_assets/img/icons/avatar.svg" alt=""></div></div>'
            + '<div class="col pt-2"><div class="text-xl fw-bold">' + sanitize(w.guest_name || w.name) + '</div></div>'
            + '</div>'
            + '<div class="text-md fw-light">' + sanitize(w.message) + '</div>'
            + '</div></div></div>';
    }).join('');
}

function renderPayment(paymentData) {
    var section9 = el('section-9');
    if (!section9) return;
    var existing = el('payment-section');
    if (!existing) {
        var paySection = document.createElement('section');
        paySection.id = 'payment-section';
        paySection.style.padding = '6rem 0';
        paySection.style.backgroundColor = '#F4F4F4';
        paySection.innerHTML = '<div class="container text-center"><h2 class="font-type-secondary fw-bold mb-8">Amplop Digital</h2><div id="payment-list" class="d-flex justify-content-center flex-wrap gap-4"></div></div>';
        section9.parentNode.insertBefore(paySection, section9);
    }
    var list = el('payment-list');
    if (!list) return;
    list.innerHTML = paymentData.map(function (p, i) {
        return '<div class="payment-card-item text-center p-3" style="min-width:16rem;opacity:0;transform:translateY(20px);transition:opacity 0.8s ease ' + (i * 0.15) + 's, transform 0.8s ease ' + (i * 0.15) + 's;">'
            + '<img src="' + getPaymentImage(p.method) + '" alt="' + p.method + '" style="width:80px;height:50px;object-fit:contain;">'
            + '<div class="fw-bold mt-2">' + p.value + '</div>'
            + '<div class="fw-light">a.n ' + p.name + '</div>'
            + '</div>';
    }).join('');

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            } else {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';
            }
        });
    }, { threshold: 0.2 });

    list.querySelectorAll('.payment-card-item').forEach(function (item) {
        observer.observe(item);
    });
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

var url = new URL(window.location.href);
var u = url.searchParams.get("name") ? url.searchParams.get("name").replace(/_/g, " ") : "";
if (u && el('guest')) el('guest').innerHTML = u;

document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    AOS.init();

    applyData(Object.assign({}, FALLBACK_DATA, { guestName: u || FALLBACK_DATA.guestName }));
    renderTenant({}); // Populate default logo/social segera; diperbarui oleh API jika tersedia

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

    var btn_to_top = document.querySelector('#btn-to-top');
    var navbar = document.querySelector('.navbar');
    var navlinks = document.querySelectorAll('.nav-link.page-scroll');
    var str_section_query = "";
    for (var i = 0; i < navlinks.length; i++) {
        str_section_query += navlinks[i].getAttribute('href') + (i < navlinks.length - 1 ? ', ' : '');
    }
    var sectionlistener = document.querySelectorAll(str_section_query);

    for (var btn of document.querySelectorAll('.page-scroll')) {
        btn.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) window.scrollTo({ top: target.offsetTop - 50, behavior: 'smooth' });
            e.preventDefault();
        });
    }

    var rsvpForm = document.querySelector('#rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', handleCommentSubmit);
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
