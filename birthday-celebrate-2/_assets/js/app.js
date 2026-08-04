

var FALLBACK_DATA = FALLBACK['birthday-celebrate-2'];
var _projectId = null;
var _apiBaseUrl = null;
var _isDataApplied = false;
var _countdownTimer = null;
var _lgInstance = null;

function el(id) { return document.getElementById(id); }

var PLACEHOLDER_LOGO = '/placeholder-image.png';

var MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
var DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function fmtDate(iso) {
    if (!iso) return '';
    try {
        var d = new Date(iso);
        return DAYS_ID[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS_ID[d.getMonth()] + ' ' + d.getFullYear();
    } catch (e) { return iso; }
}

function sanitize(str) {
    if (str == null) return '';
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
    if (iframeMatch) str = iframeMatch[1];
    var textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    str = textarea.value;
    if (str.indexOf('/maps/embed') !== -1) return str;
    var coordMatch = str.match(/[\/@](-?\d+\.\d+),(-?\d+\.\d+)/) ||
        str.match(/3d(-?\d+\.\d+)[^!]*!4d(-?\d+\.\d+)/);
    if (coordMatch) return 'https://maps.google.com/maps?q=' + coordMatch[1] + ',' + coordMatch[2] + '&output=embed';
    if (str.indexOf('google.com/maps') !== -1 || str.indexOf('maps.google') !== -1) {
        if (str.indexOf('output=embed') === -1) {
            return str + (str.indexOf('?') !== -1 ? '&' : '?') + 'output=embed';
        }
    }
    return str;
}

function showNotification(message, type) {
    var n = document.createElement('div');
    n.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;'
        + 'background:' + (type === 'success' ? 'linear-gradient(135deg,#1E88E5,#FF7043)' : '#E53935') + ';color:#fff;'
        + 'padding:16px 24px;border-radius:50px;box-shadow:0 4px 12px rgba(0,0,0,.2);'
        + 'font-size:14px;font-weight:600;font-family:Poppins,sans-serif;max-width:90%;text-align:center;';
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(function () {
        n.style.opacity = '0';
        n.style.transition = 'opacity .4s ease';
        setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 400);
    }, 3000);
}

function renderTenant(data) {
    data = data || {};
    var logoNode = el('tenant-logo');
    if (logoNode) {
        var src = data.logo_url || (FALLBACK_DATA.logoUrl || '') || PLACEHOLDER_LOGO;
        logoNode.src = src;
        logoNode.onerror = function () { logoNode.onerror = null; logoNode.src = PLACEHOLDER_LOGO; };
    }
    var socialNode = el('tenant-social');
    if (socialNode) {
        var fb = data.facebook_url || '#';
        var ig = data.instagram_url || '#';
        socialNode.innerHTML =
            '<a href="' + fb + '" target="_blank" rel="noopener noreferrer" class="tenant-social-btn" aria-label="Facebook">'
            + '<i class="fa-brands fa-facebook-f"></i></a>'
            + '<a href="' + ig + '" target="_blank" rel="noopener noreferrer" class="tenant-social-btn" aria-label="Instagram">'
            + '<i class="fa-brands fa-instagram"></i></a>';
    }
}

function destroyGallery() {
    if (_lgInstance && typeof _lgInstance.destroy === 'function') {
        try { _lgInstance.destroy(true); } catch (ignore) { }
    }
    _lgInstance = null;
}

function renderGallery(galleryData) {
    destroyGallery();
    var slots = 5;
    var container = el('row-lightgallery');
    var hasAny = galleryData && galleryData.length;

    for (var i = 1; i <= slots; i++) {
        var imgEl = el('gallery-img-' + i);
        var itemEl = el('gallery-item-' + i);
        var col = itemEl ? itemEl.closest('.gallery-col') : null;
        if (hasAny && galleryData[i - 1]) {
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

    if (hasAny && container && typeof lightGallery === 'function') {
        _lgInstance = lightGallery(container, {
            mode: 'lg-fade', cssEasing: 'ease-in', speed: 1000,
            backdropDuration: 500, hideBarsDelay: 500,
            selector: '[data-src]', download: false
        });
    }
    if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderWishes(wishesData) {
    var c = el('wishes-list');
    if (!c) return;
    c.innerHTML = '';
    if (!wishesData || !wishesData.length) {
        c.innerHTML = '<div class="wishes-empty"><p>Belum ada ucapan. Jadilah yang pertama!</p></div>';
        return;
    }
    wishesData.forEach(function (w, i) {
        var nm = w.guest_name || w.name || 'Anonim';
        var initial = String(nm).charAt(0).toUpperCase();
        var item = document.createElement('div');
        item.className = 'wish-card';
        item.setAttribute('data-aos', 'fade-up');
        item.setAttribute('data-aos-delay', String(i * 80));
        item.innerHTML = '<div class="wish-avatar">' + sanitize(initial) + '</div>'
            + '<div><div class="wish-name">' + sanitize(nm) + '</div>'
            + '<div class="wish-msg">' + sanitize(w.message) + '</div></div>';
        c.appendChild(item);
    });
    if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderPayment(paymentData) {
    var section = el('payment-section');
    var c = el('payment-list');
    if (!section || !c) return;
    if (!paymentData || !paymentData.length) return;
    section.style.display = 'block';
    c.innerHTML = '';
    paymentData.forEach(function (p, i) {
        var item = document.createElement('div');
        item.className = 'pay-card';
        item.setAttribute('data-aos', 'fade-up');
        item.setAttribute('data-aos-delay', String(i * 100));
        var methodUpper = sanitize(String(p.method).toUpperCase());
        item.innerHTML = '<img src="/payment/' + sanitize(p.method) + '.png" alt="' + sanitize(p.method) + '" class="pay-logo"'
            + ' onerror="this.onerror=null;this.outerHTML=\'<div class=&quot;pay-method&quot;>' + methodUpper + '</div>\';">'
            + '<div class="pay-value">' + sanitize(p.value) + '</div>'
            + '<div class="pay-name">a.n. ' + sanitize(p.name) + '</div>'
            + '<button type="button" class="btn-copy" data-copy="' + sanitize(p.value) + '">'
            + '<i class="fa-solid fa-copy"></i> Salin</button>';
        c.appendChild(item);
    });
    if (typeof AOS !== 'undefined') AOS.refresh();
}

function startCountdown(target) {
    if (_countdownTimer) clearInterval(_countdownTimer);
    function tick() {
        var diff = Math.max(0, target - Date.now());
        var d = Math.floor(diff / 86400000);
        var h = Math.floor(diff % 86400000 / 3600000);
        var m = Math.floor(diff % 3600000 / 60000);
        var s = Math.floor(diff % 60000 / 1000);
        if (el('cd-d')) el('cd-d').textContent = ('0' + d).slice(-2);
        if (el('cd-h')) el('cd-h').textContent = ('0' + h).slice(-2);
        if (el('cd-m')) el('cd-m').textContent = ('0' + m).slice(-2);
        if (el('cd-s')) el('cd-s').textContent = ('0' + s).slice(-2);
    }
    tick();
    _countdownTimer = setInterval(tick, 1000);
}

function applyData(data) {
    var d = data;
    var f = FALLBACK_DATA;

    if (el('guest')) el('guest').innerHTML = sanitize(d.guestName || f.guestName);
    if (el('hero-name-opening')) el('hero-name-opening').textContent = d.birthdayName || f.birthdayName;
    if (el('hero-name')) el('hero-name').textContent = d.birthdayName || f.birthdayName;
    if (el('closing-name')) el('closing-name').textContent = d.birthdayName || f.birthdayName;

    var eventDatetime = d.eventDatetime || f.eventDatetime;
    if (el('save-the-date')) el('save-the-date').textContent = fmtDate(eventDatetime);

    if (el('hero-photo') && (d.birthdayPhoto || f.birthdayPhoto)) el('hero-photo').src = d.birthdayPhoto || f.birthdayPhoto;
    if (el('hero-parents')) el('hero-parents').textContent = d.birthdayParents || f.birthdayParents || '';
    if (el('hero-quote')) el('hero-quote').textContent = d.birthdayQuote || f.birthdayQuote || '';
    if (el('birth-date')) el('birth-date').textContent = fmtDate(d.birthDate || f.birthDate);

    renderGallery((d.gallery && d.gallery.length) ? d.gallery : f.gallery);

    if (el('event-desc')) el('event-desc').textContent = d.eventDesc || f.eventDesc || '';
    if (el('event-date')) el('event-date').textContent = fmtDate(eventDatetime);
    if (el('event-time')) el('event-time').textContent = d.eventTime || f.eventTime || '';
    if (el('event-venue')) el('event-venue').textContent = d.eventVenue || f.eventVenue || '';

    if (el('event-address')) el('event-address').textContent = d.eventAddress || f.eventAddress || '';
    var mapsUrl = cleanMapsUrl(d.eventMapsUrl || f.eventMapsUrl);
    if (el('gmap_canvas')) el('gmap_canvas').src = mapsUrl;
    if (el('btn-open-maps')) {
        var q = encodeURIComponent((d.eventVenue || f.eventVenue || '') + ' ' + (d.eventAddress || f.eventAddress || ''));
        el('btn-open-maps').href = 'https://www.google.com/maps/search/' + q;
    }

    if (el('rsvp-photo') && (d.rsvpPhoto || f.rsvpPhoto)) el('rsvp-photo').src = d.rsvpPhoto || f.rsvpPhoto;

    if (el('platform-name')) el('platform-name').textContent = d.platform || f.platform || '';
    if (el('year')) el('year').textContent = new Date().getFullYear();

    if (!_projectId) renderWishes((d.wishes && d.wishes.length) ? d.wishes : f.wishes);

    renderPayment((d.payment && d.payment.length) ? d.payment : f.payment);

    var audio = el('audio');
    if (audio && (d.music || f.music)) {
        var newSrc = d.music || f.music;
        var srcEl = audio.querySelector('source');
        if (srcEl) { srcEl.setAttribute('src', newSrc); audio.load(); }
    }

    startCountdown(new Date(eventDatetime).getTime());

    setTimeout(function () { if (typeof AOS !== 'undefined') AOS.refresh(); }, 150);
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

    var attendanceEl = form.querySelector('[name="attendance"]:checked');
    var attendance = attendanceEl ? attendanceEl.value : 'Hadir';

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Mengirim...'; }

    postComment(_apiBaseUrl, {
        project_id: _projectId,
        guest_name: sanitize(name),
        message: sanitize('[' + attendance + '] ' + message)
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
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Tiket';
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

            renderTenant((logoResp && logoResp.data) ? logoResp.data : {});

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
var _u = _url.searchParams.get('to') || _url.searchParams.get('name') || '';
if (_u) _u = _u.replace(/_/g, ' ');
if (_u && el('guest')) el('guest').innerHTML = sanitize(_u);

var VEHICLE_SVGS = {
    car: '<svg width="W" height="H" viewBox="0 0 80 40"><rect x="8" y="14" width="60" height="16" rx="5" fill="C1"/><rect x="18" y="6" width="34" height="12" rx="4" fill="C2"/><circle cx="22" cy="32" r="5" fill="#222"/><circle cx="58" cy="32" r="5" fill="#222"/></svg>',
    bus: '<svg width="W" height="H" viewBox="0 0 90 40"><rect x="4" y="6" width="76" height="24" rx="5" fill="C1"/><rect x="10" y="10" width="10" height="8" fill="#BBDEFB"/><rect x="24" y="10" width="10" height="8" fill="#BBDEFB"/><rect x="38" y="10" width="10" height="8" fill="#BBDEFB"/><rect x="52" y="10" width="10" height="8" fill="#BBDEFB"/><rect x="66" y="10" width="10" height="8" fill="#BBDEFB"/><circle cx="20" cy="32" r="5" fill="#222"/><circle cx="66" cy="32" r="5" fill="#222"/></svg>',
    motorcycle: '<svg width="W" height="H" viewBox="0 0 80 40"><circle cx="18" cy="30" r="8" fill="#222"/><circle cx="18" cy="30" r="3" fill="#ccc"/><circle cx="62" cy="30" r="8" fill="#222"/><circle cx="62" cy="30" r="3" fill="#ccc"/><path d="M18 30 L34 18 L52 18 L62 30" stroke="C1" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="34" y="10" width="8" height="10" fill="C2"/></svg>',
    plane: '<svg width="W" height="H" viewBox="0 0 90 50"><path d="M5 26 L60 22 L78 12 L82 14 L72 26 L82 40 L78 42 L60 32 L20 34 L14 40 L10 38 L14 26 L10 22 L14 20 Z" fill="C1"/><path d="M40 22 L46 12 L50 12 L48 22 Z" fill="C2"/></svg>',
    ship: '<svg width="W" height="H" viewBox="0 0 90 60"><rect x="34" y="10" width="4" height="24" fill="#555"/><path d="M38 10 L60 22 L38 22 Z" fill="C2"/><path d="M8 34 L82 34 L74 50 L16 50 Z" fill="C1"/><rect x="26" y="26" width="10" height="8" fill="#fff"/><rect x="40" y="26" width="8" height="8" fill="#fff"/></svg>',
    train: '<svg width="W" height="H" viewBox="0 0 100 44"><rect x="6" y="10" width="70" height="22" rx="4" fill="C1"/><rect x="76" y="6" width="18" height="26" rx="3" fill="C2"/><rect x="14" y="14" width="10" height="10" fill="#BBDEFB"/><rect x="28" y="14" width="10" height="10" fill="#BBDEFB"/><rect x="42" y="14" width="10" height="10" fill="#BBDEFB"/><rect x="56" y="14" width="10" height="10" fill="#BBDEFB"/><circle cx="20" cy="36" r="4" fill="#222"/><circle cx="40" cy="36" r="4" fill="#222"/><circle cx="60" cy="36" r="4" fill="#222"/><circle cx="84" cy="36" r="4" fill="#222"/></svg>',
    helicopter: '<svg width="W" height="H" viewBox="0 0 100 50"><rect x="10" y="6" width="80" height="3" fill="#333"/><path d="M20 22 Q20 14 32 14 L58 14 Q70 14 70 24 L70 34 L20 34 Z" fill="C1"/><circle cx="34" cy="24" r="6" fill="#BBDEFB"/><rect x="70" y="20" width="24" height="4" fill="C1"/><rect x="88" y="14" width="4" height="16" fill="C2"/></svg>'
};

function makeSvg(type, color1, color2, size) {
    size = size || 36;
    var t = VEHICLE_SVGS[type] || VEHICLE_SVGS['car'];
    return t.replace(/W/g, size).replace(/H/g, Math.round(size * 0.55))
        .replace(/C1/g, color1).replace(/C2/g, color2);
}

function initFallingConfetti() {
    var c = el('confetti-rain');
    if (!c) return;

    var colors1 = ['#1E88E5', '#FF7043', '#FBC02D', '#43A047', '#E53935', '#8E24AA'];
    var colors2 = ['#FBC02D', '#1E88E5', '#FF7043', '#FDD835', '#42A5F5', '#FF8A65'];
    var driveTypes = ['car', 'bus', 'motorcycle', 'train'];

    for (var j = 0; j < 8; j++) {
        var dv = document.createElement('div');
        dv.className = 'driving-vehicle';
        var dt = driveTypes[j % driveTypes.length];
        dv.style.animationDuration = (10 + Math.random() * 10) + 's';
        dv.style.animationDelay = (Math.random() * 12) + 's';
        var sz = 48 + Math.random() * 24;
        dv.innerHTML = makeSvg(dt, colors1[(j + 2) % colors1.length], colors2[(j + 3) % colors2.length], sz);
        c.appendChild(dv);
    }
}

function initClouds() {
    var band = el('cloud-band');
    if (!band) return;
    for (var i = 0; i < 5; i++) {
        var cl = document.createElement('div');
        cl.className = 'cloud';
        var size = 40 + Math.random() * 40;
        cl.style.top = (Math.random() * 60) + 'px';
        cl.style.animationDuration = (20 + Math.random() * 20) + 's';
        cl.style.animationDelay = (-Math.random() * 20) + 's';
        cl.innerHTML = '<svg width="' + (size * 1.6) + '" height="' + size + '" viewBox="0 0 80 50">'
            + '<ellipse cx="20" cy="32" rx="16" ry="14" fill="#fff"/>'
            + '<ellipse cx="40" cy="26" rx="20" ry="18" fill="#fff"/>'
            + '<ellipse cx="60" cy="34" rx="16" ry="12" fill="#fff"/></svg>';
        band.appendChild(cl);
    }
}

document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });

    applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
    renderTenant({});
    _isDataApplied = true;

    initClouds();

    var btnOpen = el('btn-open-opening');
    if (btnOpen) {
        btnOpen.addEventListener('click', function () {
            var opening = el('opening');
            if (opening) opening.classList.add('hide');

            document.body.classList.remove('no-scroll');
            initFallingConfetti();

            setTimeout(function () {
                var op = el('opening');
                if (op && op.parentNode) op.parentNode.removeChild(op);

                AOS.init({ duration: 1000, once: false, mirror: true, offset: -30 });
            }, 1200);

            var audio = el('audio');
            if (audio) audio.play().catch(function () { });
            if (el('btn-play')) el('btn-play').innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        });
    }

    var btnPlay = el('btn-play');
    var audio = el('audio');
    if (btnPlay && audio) {
        btnPlay.addEventListener('click', function () {
            if (audio.paused) {
                audio.play().catch(function () { });
                btnPlay.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            } else {
                audio.pause();
                btnPlay.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            }
        });
    }

    var btnToTop = el('btn-to-top');
    if (btnToTop) {
        btnToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    var sections = document.querySelectorAll('section[id^="section-"]');
    var navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    window.addEventListener('scroll', function () {
        if (btnToTop) btnToTop.style.display = window.pageYOffset > 200 ? 'flex' : 'none';

        var cur = '';
        sections.forEach(function (s) {
            if (window.pageYOffset >= s.offsetTop - 140) cur = s.id;
        });
        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + cur);
        });
    });

    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            var collapse = document.querySelector('.navbar-collapse');
            if (collapse && collapse.classList.contains('show') && typeof bootstrap !== 'undefined') {
                bootstrap.Collapse.getOrCreateInstance(collapse).hide();
            }
        });
    });

    document.querySelectorAll('.attendance-row').forEach(function (row) {
        row.addEventListener('change', function () {
            row.querySelectorAll('.att-opt').forEach(function (o) { o.classList.remove('selected'); });
            var checked = row.querySelector('input:checked');
            if (checked && checked.closest('.att-opt')) checked.closest('.att-opt').classList.add('selected');
        });
    });

    document.addEventListener('click', function (ev) {
        var btn = ev.target.closest && ev.target.closest('[data-copy]');
        if (!btn) return;
        var val = btn.getAttribute('data-copy');
        var done = function () {
            var orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
            btn.style.background = 'var(--accent)';
            btn.style.color = 'var(--dark)';
            setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(val).then(done).catch(done);
        } else {
            var ta = document.createElement('textarea');
            ta.value = val;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (ignore) { }
            document.body.removeChild(ta);
            done();
        }
    });

    var rsvpForm = el('rsvp-form');
    if (rsvpForm) rsvpForm.addEventListener('submit', handleRSVP);
});
