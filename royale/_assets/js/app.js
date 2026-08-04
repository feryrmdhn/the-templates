var FALLBACK_DATA = FALLBACK["royale"];

var _projectId = null;
var _apiBaseUrl = null;
var _isDataApplied = false;
var _countdownTimer = null;

function el(id) { return document.getElementById(id); }
function getPaymentImage(method) { return '/payment/' + method + '.png'; }

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
    var m = String(str).match(/src=["']([^"']+)["']/);
    if (m) return m[1];
    var textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
}

function fmtDay(iso) {
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var d = new Date(iso);
    var pad = function (n) { return n.toString().padStart(2, '0'); };
    return {
        full: days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear(),
        short: d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear(),
        time: pad(d.getHours()) + '.' + pad(d.getMinutes()),
        longDate: days[d.getDay()].toUpperCase() + ' · ' + d.getDate() + ' · ' + months[d.getMonth()].toUpperCase() + ' · ' + d.getFullYear()
    };
}

function startCountdown(targetIso) {
    if (_countdownTimer) { clearInterval(_countdownTimer); _countdownTimer = null; }
    var target = new Date(targetIso).getTime();

    var tick = function () {
        var now = Date.now();
        var diff = Math.max(0, target - now);
        var d = Math.floor(diff / 86400000);
        var h = Math.floor(diff % 86400000 / 3600000);
        var m = Math.floor(diff % 3600000 / 60000);
        var s = Math.floor(diff % 60000 / 1000);
        var pad = function (n) { return String(n).padStart(2, '0'); };
        if (el('d')) el('d').textContent = pad(d);
        if (el('h')) el('h').textContent = pad(h);
        if (el('m')) el('m').textContent = pad(m);
        if (el('s')) el('s').textContent = pad(s);
    };

    tick();
    _countdownTimer = setInterval(tick, 1000);
}

function refreshAOS() {
    if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderStories(stories) {
    var container = el('story-list');
    if (!container) return;
    if (!stories || !stories.length) { container.innerHTML = ''; return; }
    container.innerHTML = stories.map(function (s, i) {
        return '<div class="item" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="' + (i * 120) + '">'
            + '<div class="year">' + sanitize(s.year || '') + '</div>'
            + '<div>'
            + '<h5>' + sanitize(s.title || '') + '</h5>'
            + '<p>' + sanitize(s.description || '') + '</p>'
            + '</div>'
            + '</div>';
    }).join('');
    refreshAOS();
}

function renderGallery(gallery) {
    var container = el('gallery-list');
    if (!container) return;
    if (!gallery || !gallery.length) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = gallery.map(function (src, i) {
        return '<div class="tile" data-aos="zoom-in" data-aos-duration="900" data-aos-delay="' + (i * 80) + '"><img src="' + sanitize(src) + '" alt="" loading="lazy"></div>';
    }).join('');
    refreshAOS();
}

function renderWishes(wishesData) {
    var list = el('wishes-list');
    if (!list) return;
    if (!wishesData || !wishesData.length) {
        list.innerHTML = '<div class="wishes-empty">Belum ada ucapan</div>';
        return;
    }
    list.innerHTML = wishesData.map(function (w, i) {
        return '<div class="wish" data-aos="fade-up" data-aos-duration="800" data-aos-delay="' + (i * 100) + '">'
            + '<div class="who">' + sanitize(w.guest_name || w.name) + '</div>'
            + '<div class="msg">' + sanitize(w.message) + '</div>'
            + '</div>';
    }).join('');
    refreshAOS();
}

function renderPayment(paymentData) {
    var list = el('gift-list');
    if (!list) return;
    if (!paymentData || !paymentData.length) { list.innerHTML = ''; return; }

    list.innerHTML = paymentData.map(function (p, i) {
        return '<div class="bank" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="' + (i * 150) + '">'
            + '<img class="bank-logo" src="' + getPaymentImage(p.method) + '" alt="' + sanitize(p.method) + '"'
            + ' onerror="this.style.display=\'none\'">'
            + '<div class="name">' + sanitize(String(p.method).toUpperCase()) + '</div>'
            + '<div class="no">' + sanitize(p.value) + '</div>'
            + '<div class="holder">a.n. ' + sanitize(p.name) + '</div>'
            + '<button class="btn" data-copy="' + sanitize(p.value) + '">Salin</button>'
            + '</div>';
    }).join('');
    refreshAOS();
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

function showNotification(message, type) {
    var n = document.createElement('div');
    n.className = 'notify' + (type === 'error' ? ' error' : '');
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(function () {
        n.style.transition = 'opacity .4s ease';
        n.style.opacity = '0';
        setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 400);
    }, 3000);
}

function handleRSVP(e) {
    e.preventDefault();
    var form = e.target;
    var nameInput = form.querySelector('[name="name"]');
    var msgInput = form.querySelector('[name="msg"]');
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
                form.reset();
                loadComments();
                showNotification('Ucapan berhasil dikirim!', 'success');
            } else {
                showNotification('Gagal mengirim ucapan', 'error');
            }
        })
        .catch(function () { showNotification('Gagal mengirim ucapan', 'error'); })
        .finally(function () {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Kirim Konfirmasi';
            }
        });
}

function applyData(data) {
    var d = data;
    var f = FALLBACK_DATA;

    if (el('guest')) el('guest').textContent = d.guestName || f.guestName;

    var brideShort = d.brideName || f.brideName;
    var groomShort = d.groomName || f.groomName;
    var brideFull = d.brideFullName || f.brideFullName || brideShort;
    var groomFull = d.groomFullName || f.groomFullName || groomShort;

    if (el('bride-initial')) el('bride-initial').textContent = (brideShort.charAt(0) || '');
    if (el('groom-initial')) el('groom-initial').textContent = (groomShort.charAt(0) || '');
    if (el('bride-name')) el('bride-name').textContent = brideShort;
    if (el('groom-name')) el('groom-name').textContent = groomShort;
    if (el('bride-full-name')) el('bride-full-name').textContent = brideFull;
    if (el('groom-full-name')) el('groom-full-name').textContent = groomFull;

    var brideRoleLine = (d.brideRole || f.brideRole || '') + '<br/>' + (d.fatherBride || f.fatherBride || '');
    var groomRoleLine = (d.groomRole || f.groomRole || '') + '<br/>' + (d.fatherGroom || f.fatherGroom || '');
    if (el('bride-parents')) el('bride-parents').innerHTML = brideRoleLine;
    if (el('groom-parents')) el('groom-parents').innerHTML = groomRoleLine;

    if (el('opening-names')) el('opening-names').innerHTML = sanitize(groomShort) + ' <span class="amp">&amp;</span> ' + sanitize(brideShort);

    if (el('cover-names')) el('cover-names').innerHTML = sanitize(groomShort) + '<span class="amp">&amp;</span>' + sanitize(brideShort);

    if (el('footer-couple')) el('footer-couple').innerHTML = sanitize(groomShort) + ' &amp; ' + sanitize(brideShort);

    if (el('cover-location')) el('cover-location').textContent = d.locationText || f.locationText || '';

    if (el('quote-text')) el('quote-text').textContent = d.quote || f.quote || '';
    if (el('quote-source')) el('quote-source').textContent = d.quoteSource || f.quoteSource || '';

    var akad = new Date(d.akadDatetime || f.akadDatetime);
    var akadFmt = fmtDay(akad);
    if (el('akad-date')) el('akad-date').textContent = akadFmt.full;
    if (el('akad-time')) el('akad-time').textContent = akadFmt.time;

    var recep = new Date(d.receptionDatetime || f.receptionDatetime);
    var recepFmt = fmtDay(recep);
    if (el('reception-date')) el('reception-date').textContent = recepFmt.full;
    if (el('reception-time')) el('reception-time').textContent = recepFmt.time;

    if (el('cover-date')) el('cover-date').textContent = recepFmt.longDate;

    var akadVenueLine = (d.akadVenue || f.akadVenue || '') + '<br/>' + (d.akadAddress || f.akadAddress || '');
    var recepVenueLine = (d.receptionVenue || f.receptionVenue || '') + '<br/>' + (d.receptionAddress || f.receptionAddress || '');
    if (el('akad-venue')) el('akad-venue').innerHTML = akadVenueLine;
    if (el('reception-venue')) el('reception-venue').innerHTML = recepVenueLine;

    var akadMap = d.akadMapsUrl || f.akadMapsUrl;
    var recepMap = d.receptionMapsUrl || f.receptionMapsUrl || akadMap;
    var akadLink = el('akad-map');
    var recepLink = el('reception-map');
    if (akadLink && akadMap) akadLink.setAttribute('href', cleanMapsUrl(akadMap) || akadMap);
    if (recepLink && recepMap) recepLink.setAttribute('href', cleanMapsUrl(recepMap) || recepMap);

    startCountdown(d.receptionDatetime || f.receptionDatetime);

    var isShowGallery = d.isShowGallery !== undefined ? d.isShowGallery : (f.isShowGallery !== undefined ? f.isShowGallery : true);
    if (isShowGallery) {
        var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
        renderGallery(gallery);
    } else {
        var gallerySection = el('section-gallery');
        if (gallerySection) gallerySection.style.display = 'none';
    }

    var isShowStory = d.isShowStory !== undefined ? d.isShowStory : (f.isShowStory !== undefined ? f.isShowStory : true);
    if (isShowStory) {
        var stories = d.storyItems != null ? d.storyItems : f.storyItems;
        renderStories(stories);
    } else {
        var storySection = el('section-story');
        if (storySection) storySection.style.display = 'none';
    }

    if (!_projectId) {
        var wishes = (d.wishes && d.wishes.length) ? d.wishes : f.wishes;
        renderWishes(wishes);
    }

    var payment = (d.payment && d.payment.length) ? d.payment : f.payment;
    if (payment && payment.length) renderPayment(payment);
    else {
        var giftSection = el('section-gift');
        if (giftSection) giftSection.style.display = 'none';
    }

    if (el('platform-name')) el('platform-name').textContent = d.platform || f.platform || '';

    var music = d.music || f.music;
    var audioSource = document.querySelector('#bgm source');
    if (audioSource && music) {
        audioSource.setAttribute('src', music);
        audioSource.parentElement.load();
    }
}

function renderTenant(data) {
    data = data || {};
    var logoNode = el('tenant-logo');
    if (logoNode) {
        var src = data.logo_url || '/placeholder-image.png';
        logoNode.src = src;
        logoNode.onerror = function () {
            logoNode.onerror = null;
            logoNode.src = '/placeholder-image.png';
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

window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'INVITATION_DATA') return;
    _isDataApplied = true;
    var payload = e.data.payload;
    var guest = payload.guestName || payload.guest;

    if (el('guest')) el('guest').textContent = guest || FALLBACK_DATA.guestName;

    if (payload.mode === 'preview') {
        applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
        renderTenant({});
        window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
        return;
    }

    var apiBaseUrl = payload.apiBaseUrl;
    var tenantSlug = payload.tenantSlug;
    var projectSlug = payload.projectSlug;

    if (!apiBaseUrl || !tenantSlug || !projectSlug) {
        applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
        renderTenant({});
        window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
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
            window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
        })
        .catch(function () {
            applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
            renderTenant({});
            window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
        });
});

var _url = new URL(window.location.href);
var _u = _url.searchParams.get('name') || _url.searchParams.get('to') || '';
if (_u) _u = _u.replace(/_/g, ' ');
if (_u && el('guest')) el('guest').textContent = _u;

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    setTimeout(function () {
        if (!_isDataApplied) {
            _isDataApplied = true;
            applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
            renderTenant({});
            window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
        }
    }, 2000);

    applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: false, mirror: true, offset: 50, easing: 'ease-out-cubic' });
    }

    document.body.style.overflow = 'hidden';

    var btnOpen = el('btn-open');
    var btnMusic = el('music');
    var bgm = el('bgm');

    if (btnOpen) {
        btnOpen.addEventListener('click', function () {
            var opening = el('opening');
            if (opening) opening.classList.add('hidden');
            document.body.style.overflow = 'auto';

            if (typeof AOS !== 'undefined') {
                var aosElements = document.querySelectorAll('.aos-init');
                for (var i = 0; i < aosElements.length; i++) {
                    aosElements[i].classList.remove('aos-animate');
                }
                
                setTimeout(function () { AOS.refresh(); }, 100);
            }

            if (bgm) {
                bgm.volume = 0.5;
                bgm.load();
                bgm.play().then(function () {
                    if (btnMusic) btnMusic.classList.add('playing');
                }).catch(function () { });
            }
        });
    }

    if (btnMusic && bgm) {
        btnMusic.addEventListener('click', function () {
            if (bgm.paused) {
                bgm.play();
                btnMusic.classList.add('playing');
            } else {
                bgm.pause();
                btnMusic.classList.remove('playing');
            }
        });
    }

    var btnTop = el('btn-top');
    window.addEventListener('scroll', function () {
        if (btnTop) btnTop.style.display = window.scrollY > 50 ? 'flex' : 'none';
    });
    if (btnTop) {
        btnTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var rsvpForm = el('rsvp-form');
    if (rsvpForm) rsvpForm.addEventListener('submit', handleRSVP);

    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('[data-copy]');
        if (!btn) return;
        var val = btn.getAttribute('data-copy');
        var done = function () {
            var orig = btn.textContent;
            btn.textContent = 'Tersalin ✓';
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
});
