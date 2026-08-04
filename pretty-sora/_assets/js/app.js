var FALLBACK_DATA = FALLBACK["pretty-sora"];
var _projectId = null;
var _apiBaseUrl = null;
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

function getPaymentImage(method) { return '/payment/' + method + '.png'; }

function applyData(data) {
    var d = data;
    var f = FALLBACK_DATA;
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    if (el('guest')) el('guest').innerHTML = d.guestName || f.guestName;
    if (el('groom-name-opening')) el('groom-name-opening').innerHTML = d.groomName || f.groomName;
    if (el('bride-name-opening')) el('bride-name-opening').innerHTML = d.brideName || f.brideName;
    if (el('groom-name')) el('groom-name').innerHTML = d.groomFullName || f.groomFullName;
    if (el('bride-name')) el('bride-name').innerHTML = d.brideFullName || f.brideFullName;
    if (el('groom-role')) el('groom-role').innerHTML = d.groomRole || f.groomRole;
    if (el('bride-role')) el('bride-role').innerHTML = d.brideRole || f.brideRole;
    if (el('father-groom')) el('father-groom').innerHTML = d.fatherGroom || f.fatherGroom || '';
    if (el('father-bride')) el('father-bride').innerHTML = d.fatherBride || f.fatherBride || '';
    if (el('groom-photo')) el('groom-photo').src = d.groomPhoto || f.groomPhoto;
    if (el('bride-photo')) el('bride-photo').src = d.bridePhoto || f.bridePhoto;

    var coupleShort = (d.groomName || f.groomName) + '<br>&<br>' + (d.brideName || f.brideName);
    if (el('header-couple')) el('header-couple').innerHTML = coupleShort;

    var coupleFull = (d.groomFullName || f.groomFullName) + '<br>&<br>' + (d.brideFullName || f.brideFullName);
    if (el('closing-couple')) el('closing-couple').innerHTML = coupleFull;

    var isShowGallery = d.isShowGallery !== undefined ? d.isShowGallery : (f.isShowGallery !== undefined ? f.isShowGallery : true);
    if (isShowGallery) {
        if (el('gallery-desc')) el('gallery-desc').innerHTML = d.galleryDesc || f.galleryDesc || '';
        var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
        renderGallery(gallery);
    } else {
        var gs = el('section-2'); if (gs) gs.style.display = 'none';
        var gnav = document.querySelector('.nav-link[href="#section-2"]'); if (gnav && gnav.parentElement) gnav.parentElement.style.display = 'none';
    }

    var isShowStory = d.isShowStory !== undefined ? d.isShowStory : (f.isShowStory !== undefined ? f.isShowStory : true);
    if (isShowStory) {
        var stories = d.storyItems != null ? d.storyItems : f.storyItems;
        renderStories(stories);
    } else {
        var ss = el('section-3'); if (ss) ss.style.display = 'none';
        var snav = document.querySelector('.nav-link[href="#section-3"]'); if (snav && snav.parentElement) snav.parentElement.style.display = 'none';
    }

    var akad = new Date(d.akadDatetime || f.akadDatetime);
    if (el('akad-date')) el('akad-date').innerHTML = days[akad.getDay()] + ', ' + akad.getDate() + ' ' + months[akad.getMonth()] + ' ' + akad.getFullYear();
    if (el('akad-time')) el('akad-time').innerHTML = 'Pukul ' + akad.getHours().toString().padStart(2, '0') + '.' + akad.getMinutes().toString().padStart(2, '0');
    if (el('akad-desc')) el('akad-desc').innerHTML = d.akadDesc || f.akadDesc || '';
    if (el('akad-venue')) el('akad-venue').innerHTML = d.akadVenue || f.akadVenue || '';
    if (el('akad-address')) el('akad-address').innerHTML = d.akadAddress || f.akadAddress || '';

    var recep = new Date(d.receptionDatetime || f.receptionDatetime);
    if (el('reception-date')) el('reception-date').innerHTML = days[recep.getDay()] + ', ' + recep.getDate() + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();
    if (el('reception-time')) el('reception-time').innerHTML = 'Pukul ' + recep.getHours().toString().padStart(2, '0') + '.' + recep.getMinutes().toString().padStart(2, '0');
    if (el('reception-desc')) el('reception-desc').innerHTML = d.receptionDesc || f.receptionDesc || '';
    if (el('reception-venue')) el('reception-venue').innerHTML = d.receptionVenue || f.receptionVenue || '';

    if (el('save-the-date')) el('save-the-date').innerHTML = recep.getDate().toString().padStart(2, '0') + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();
    if (el('header-date')) el('header-date').innerHTML = recep.getDate().toString().padStart(2, '0') + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();

    var mapFrame = el('gmap_canvas');
    if (mapFrame) mapFrame.src = cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) || '';

    updateCountdown(d.receptionDatetime || f.receptionDatetime);

    var coverImg = d.coverImage || f.coverImage;
    if (coverImg) {
        var openingSection = el('opening');
        if (openingSection) {
            openingSection.style.backgroundImage = 'linear-gradient(rgba(43, 42, 39, 0.55), rgba(43, 42, 39, 0.65)), url(\'' + coverImg + '\')';
        }
        var headerSection = el('header');
        if (headerSection) {
            headerSection.style.backgroundImage = 'linear-gradient(rgba(43, 42, 39, 0.45), rgba(43, 42, 39, 0.60)), url(\'' + coverImg + '\')';
        }
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
}

function updateCountdown(datetime) {
    if (_countdownInstance) {
        try { _countdownInstance.destroy(); } catch (e) { }
        _countdownInstance = null;
    }
    if (typeof timezz === 'undefined' || !datetime) return;
    var countdownEl = el('countdown-row');
    if (!countdownEl) return;
    _countdownInstance = timezz(countdownEl, {
        date: new Date(datetime),
        stop: false, canContinue: false, withYears: false,
        beforeCreate: function () { },
        beforeDestroy: function () { },
        update: function (data) {
            var d = countdownEl.querySelector('[data-days]');
            var h = countdownEl.querySelector('[data-hours]');
            var m = countdownEl.querySelector('[data-minutes]');
            var s = countdownEl.querySelector('[data-seconds]');
            if (d) d.textContent = String(data.days).padStart(2, '0');
            if (h) h.textContent = String(data.hours).padStart(2, '0');
            if (m) m.textContent = String(data.minutes).padStart(2, '0');
            if (s) s.textContent = String(data.seconds).padStart(2, '0');
        },
    });
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

function renderGallery(galleryData) {
    var slots = 5;
    for (var i = 1; i <= slots; i++) {
        var imgEl = el('gallery-img-' + i);
        var itemEl = el('gallery-item-' + i);
        var col = itemEl ? itemEl.closest('.gallery-col') : null;

        if (galleryData[i - 1]) {
            var src = galleryData[i - 1];
            if (imgEl) imgEl.src = src;
            if (itemEl) itemEl.setAttribute('data-src', src);
            if (col) col.style.display = '';
        } else {
            if (imgEl) imgEl.removeAttribute('src');
            if (itemEl) itemEl.removeAttribute('data-src');
            if (col) col.style.display = 'none';
        }
    }

    if (galleryData && galleryData.length) {
        var lgEl = el('row-lightgallery');
        if (lgEl) {
            lightGallery(lgEl, {
                mode: 'lg-fade', cssEasing: 'ease-in', speed: 1000,
                backdropDuration: 500, hideBarsDelay: 500,
                selector: '[data-src]', download: false,
            });
        }
    }
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
        var mb = i < stories.length - 1 ? ' mb-5 mb-lg-5' : '';
        var imgCol = '<div class="col-md-5"><div class="story-img"><img src="' + (s.image || '') + '" alt=""></div></div>';
        var textCol = '<div class="col-md-7"><div class="story-card">' + (s.year ? '<span class="story-year">' + s.year + '</span>' : '') + '<h4 class="story-title">' + (s.title || '') + '</h4><p class="story-desc">' + (s.description || '') + '</p></div></div>';
        var html = '<div class="row align-items-center g-4' + mb + '" data-aos="' + anim + '" data-aos-duration="1200">';
        html += isEven ? (imgCol + textCol) : (textCol + imgCol);
        html += '</div>';
        if (i < stories.length - 1) {
            html += '<div class="story-divider" data-aos="zoom-in"><span class="divider-line"></span><span class="divider-diamond"></span><span class="divider-line"></span></div>';
        }
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
        list.innerHTML = '<div class="col-12 text-center text-muted py-5"><p class="fst-italic">Belum ada ucapan</p></div>';
        return;
    }
    list.innerHTML = wishesData.map(function (w) {
        var name = sanitize(w.guest_name || w.name);
        var message = sanitize(w.message);
        return '<div class="col-md-6" data-aos="fade-up"><div class="wish-card">'
            + '<div class="wish-head"><i class="fa-solid fa-user-circle wish-avatar"></i>'
            + '<div class="wish-name">' + name + '</div></div>'
            + '<p class="wish-msg">' + message + '</p></div></div>';
    }).join('');
    if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderPayment(paymentData) {
    var section = el('payment-section');
    var list = el('payment-list');
    if (!section || !list) return;
    section.style.display = 'block';
    list.innerHTML = paymentData.map(function (p) {
        return '<div class="payment-card">'
            + '<img src="' + getPaymentImage(p.method) + '" alt="' + p.method + '" class="payment-logo">'
            + '<div class="payment-method-name">' + (p.method || '').toUpperCase() + '</div>'
            + '<div class="payment-value">' + sanitize(p.value) + '</div>'
            + '<div class="payment-name">a.n. ' + sanitize(p.name) + '</div>'
            + '<button class="btn-copy" data-copy="' + sanitize(p.value) + '">Salin</button>'
            + '</div>';
    }).join('');

    if ('IntersectionObserver' in window) {
        var cards = list.querySelectorAll('.payment-card');
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        cards.forEach(function (c) { io.observe(c); });
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
        .catch(function () {
            renderWishes([]);
        });
}

function handleCommentSubmit(e) {
    e.preventDefault();

    var form = e.target;
    var nameInput = form.querySelector('input[name="name"]');
    var attendanceSelect = form.querySelector('select[name="attendance"]');
    var messageInput = form.querySelector('textarea[name="message"]');
    var submitBtn = form.querySelector('button[type="submit"]');

    var name = nameInput ? nameInput.value.trim() : '';
    var attendance = attendanceSelect ? attendanceSelect.value : 'yes';
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

    var attendanceLabel = attendance === 'yes' ? 'Ya, akan hadir' : 'Tidak bisa hadir';

    postComment(_apiBaseUrl, {
        project_id: _projectId,
        guest_name: sanitize(name),
        message: sanitize('[' + attendanceLabel + '] ' + message)
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
        + 'background:' + (type === 'success' ? '#22C55E' : '#B22222') + ';color:white;'
        + 'padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(43,42,39,0.15);'
        + 'font-size:14px;font-weight:500;font-family:Poppins,sans-serif;max-width:90%;text-align:center;'
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

function startPetals() {
    var container = document.querySelector('.falling-petals-container');
    if (!container) return;
    container.innerHTML = '';

    var petalColors = ['#c48a8a', '#e6b8b8', '#f2d0d0', '#c9a96e', '#e6d4a8'];
    var petalCount = window.innerWidth < 576 ? 10 : 20;

    for (var i = 0; i < petalCount; i++) {
        var petal = document.createElement('span');
        petal.className = 'falling-petal';
        petal.style.left = (Math.random() * 100) + '%';
        petal.style.background = petalColors[Math.floor(Math.random() * petalColors.length)];
        petal.style.width = (8 + Math.random() * 8) + 'px';
        petal.style.height = (8 + Math.random() * 8) + 'px';
        petal.style.animationDuration = (6 + Math.random() * 8) + 's';
        petal.style.animationDelay = (Math.random() * 10) + 's';
        petal.style.opacity = String(0.5 + Math.random() * 0.4);
        petal.style.transform = 'scale(' + (0.6 + Math.random() * 0.8) + ')';
        petal.classList.add('petal-sway-' + (Math.floor(Math.random() * 3) + 1));
        container.appendChild(petal);
    }
}

document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    AOS.init();

    applyData(Object.assign({}, FALLBACK_DATA, { guestName: u || FALLBACK_DATA.guestName }));
    renderTenant({}); // Populate default logo/social segera; diperbarui oleh API jika tersedia
    _isDataApplied = true;
    setTimeout(function () { if (typeof AOS !== 'undefined') AOS.refresh(); }, 100);

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
                startPetals();
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

    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('[data-copy]');
        if (!btn) return;
        var val = btn.getAttribute('data-copy');
        var done = function () {
            var orig = btn.textContent;
            btn.textContent = 'Tersalin!';
            setTimeout(function () { btn.textContent = orig; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(val).then(done).catch(done);
        } else {
            var ta = document.createElement('textarea');
            ta.value = val;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (_) { }
            document.body.removeChild(ta);
            done();
        }
    });

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
