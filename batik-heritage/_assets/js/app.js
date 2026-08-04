

var FALLBACK_DATA = FALLBACK["batik-heritage"];

var _projectId = null;
var _apiBaseUrl = null;
var _isDataApplied = false;
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
                opacity: [0, 1],
                translateY: [30, 0],
                easing: 'easeOutExpo',
                duration: 1200,
                delay: function (_, i) { return baseDelay + (nodeIndex * 300) + 60 * i; }
            });
        }
    });
}

function updateCountdown(datetime) {
    if (_countdownInstance) {
        try {
            _countdownInstance.destroy();
        } catch (e) { }
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
    var grid = document.getElementById('gallery');
    if (!grid || !galleryData || !galleryData.length) return;

    grid.innerHTML = galleryData.map(function (src, i) {
        return '<a href="' + src + '" class="gallery-item' + (i === 0 ? ' gallery-item-lg' : '') + '" data-src="' + src + '" data-aos="fade-up" data-aos-delay="' + (i * 80) + '">'
            + '<img src="' + src + '" alt="Gallery ' + (i + 1) + '" loading="lazy" />'
            + '<span class="gal-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></span>'
            + '</a>';
    }).join('');

    if (typeof lightGallery !== 'undefined') {
        lightGallery(grid, { selector: 'a' });
    }

    setTimeout(function () {
        if (typeof AOS !== 'undefined') AOS.refresh();
    }, 100);
}

function renderStory(storyItems) {
    var wrapDesktop = document.getElementById('storyTimeline');
    var wrapMobile = document.getElementById('storyTimelineMobile');
    if (!storyItems || !storyItems.length) return;

    if (wrapDesktop) {
        wrapDesktop.innerHTML = storyItems.map(function (it, i) {
            return '<div class="story-row ' + (i % 2 === 0 ? 'story-left' : 'story-right') + '">'
                + '<div class="story-img"><img src="' + sanitize(it.image || '') + '" alt="' + sanitize(it.title || '') + '" loading="lazy" /></div>'
                + '<div class="story-card">'
                + '<h3>' + sanitize(it.title || '') + '</h3>'
                + '<p>' + sanitize(it.description || '') + '</p>'
                + '</div></div>';
        }).join('');

        if ('IntersectionObserver' in window) {
            var ioDesktop = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    e.target.classList.toggle('in-view', e.isIntersecting);
                });
            }, { threshold: 0.1 });
            wrapDesktop.querySelectorAll('.story-row').forEach(function (r) { ioDesktop.observe(r); });
        } else {
            wrapDesktop.querySelectorAll('.story-row').forEach(function (r) { r.classList.add('in-view'); });
        }
    }

    if (wrapMobile) {
        wrapMobile.innerHTML = storyItems.map(function (it) {
            return '<div class="story-mobile-item">'
                + '<div class="story-mobile-img"><img src="' + sanitize(it.image || '') + '" alt="' + sanitize(it.title || '') + '" loading="lazy" /></div>'
                + '<div class="story-mobile-card">'
                + '<h3>' + sanitize(it.title || '') + '</h3>'
                + '<p>' + sanitize(it.description || '') + '</p>'
                + '</div>'
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
    var list = document.getElementById('wishesList');
    if (!list) return;

    if (!wishesData || !wishesData.length) {
        list.innerHTML = '<p class="text-muted m-0">Jadilah yang pertama mengirim ucapan!</p>';
        return;
    }

    list.innerHTML = wishesData.map(function (w) {
        var initial = (w.guest_name || w.name || '?').charAt(0).toUpperCase();
        return '<div class="wish-card" data-aos="fade-up">'
            + '<div class="wish-avatar">' + sanitize(initial) + '</div>'
            + '<div class="wish-body">'
            + '<h4>' + sanitize(w.guest_name || w.name || '') + '</h4>'
            + '<p>' + sanitize(w.message || '') + '</p>'
            + '</div></div>';
    }).join('');

    if (typeof AOS !== 'undefined') AOS.refresh();
}

function renderPayment(paymentData) {
    if (!paymentData || !paymentData.length) return;

    var wrap = document.getElementById('paymentList');
    if (!wrap) return;

    wrap.innerHTML = paymentData.map(function (p) {
        return '<div class="payment-card">'
            + '<span class="corner corner-tl"></span><span class="corner corner-tr"></span>'
            + '<span class="corner corner-bl"></span><span class="corner corner-br"></span>'
            + '<div class="payment-logo-wrap">'
            + '<img src="/payment/' + sanitize(p.method) + '.png" alt="' + sanitize(p.method) + '" />'
            + '</div>'
            + '<div class="pc-num">' + sanitize(p.value || '') + '</div>'
            + '<div class="pc-name">a.n. ' + sanitize(p.name || '') + '</div>'
            + '</div>';
    }).join('');

    var section = document.getElementById('amplop');
    if (section) section.style.display = 'block';

    if ('IntersectionObserver' in window) {
        var cards = document.querySelectorAll('.payment-card');
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    var idx = Array.prototype.indexOf.call(cards, e.target);
                    setTimeout(function () { e.target.classList.add('in-view'); }, idx * 150);
                    io.unobserve(e.target);
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

function applyData(data) {
    var d = data;
    var f = FALLBACK_DATA;

    var groomFullName = d.groomFullName || f.groomFullName;
    var brideFullName = d.brideFullName || f.brideFullName;
    var groomName = d.groomName || f.groomName;
    var brideName = d.brideName || f.brideName;
    var couple = groomFullName + '<br>&amp;<br>' + brideFullName;
    var coupleShort = groomName + '<br>&amp;<br>' + brideName;

    if (el('openingGuest')) el('openingGuest').textContent = d.guestName || f.guestName;
    if (el('openingCouple')) el('openingCouple').innerHTML = coupleShort;
    if (el('openingDate')) el('openingDate').textContent = formatDate(d.akadDatetime || f.akadDatetime);

    if (el('brandCouple')) el('brandCouple').textContent = coupleShort;

    if (el('heroCouple')) el('heroCouple').innerHTML = groomFullName + '<br>&<br>' + brideFullName;
    if (el('heroDate')) el('heroDate').textContent = formatDate(d.akadDatetime || f.akadDatetime);

    if (el('groomName')) el('groomName').textContent = groomFullName;
    if (el('brideName')) el('brideName').textContent = brideFullName;
    if (el('groomRole')) el('groomRole').textContent = d.groomRole || f.groomRole || '';
    if (el('brideRole')) el('brideRole').textContent = d.brideRole || f.brideRole || '';
    if (el('fatherGroom')) el('fatherGroom').textContent = d.fatherGroom || f.fatherGroom || '';
    if (el('fatherBride')) el('fatherBride').textContent = d.fatherBride || f.fatherBride || '';
    if (el('groomPhoto') && (d.groomPhoto || f.groomPhoto)) el('groomPhoto').src = d.groomPhoto || f.groomPhoto;
    if (el('bridePhoto') && (d.bridePhoto || f.bridePhoto)) el('bridePhoto').src = d.bridePhoto || f.bridePhoto;

    if (el('galleryDesc')) el('galleryDesc').textContent = d.galleryDesc || f.galleryDesc || '';
    var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
    renderGallery(gallery);

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
        document.querySelectorAll('.opening-bg, .hero-bg').forEach(function (node) {
            node.style.backgroundImage = "url('" + cover + "')";
        });
    }

    if (el('closingCouple')) el('closingCouple').innerHTML = groomFullName + '<br>&amp;<br>' + brideFullName;

    if (el('platformName')) el('platformName').textContent = d.platform || f.platform || '';
    if (el('year')) el('year').textContent = String(new Date().getFullYear());

    var music = d.music || f.music;
    if (music) {
        var bgMusicEl = document.getElementById('bgMusic');
        if (bgMusicEl) {
            bgMusicEl.src = music;
            bgMusicEl.load();
        }
    }

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

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Mengirim...'; }

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
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Kirim Ucapan'; }
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

            notifyLoaded();
            applyData(merged);
        })
        .catch(function () {
            applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
            notifyLoaded();
            renderTenant({});
        });
});

var _url = new URL(window.location.href);
var _u = _url.searchParams.get('name') ? _url.searchParams.get('name').replace(/_/g, ' ') : '';
if (_u && el('openingGuest')) el('openingGuest').textContent = _u;

document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    setTimeout(function () {
        if (!_isDataApplied) {
            _isDataApplied = true;
            applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
            renderTenant({});
        }
    }, 2000);

    if (typeof AOS !== 'undefined') AOS.init({ duration: 1000, easing: 'ease-in-out' });

    var btnOpen = document.getElementById('btnOpenInvitation');
    var bgMusic = document.getElementById('bgMusic');
    var musicBtn = document.getElementById('musicToggle');

    if (btnOpen) {
        btnOpen.addEventListener('click', function () {

            document.body.classList.add('opening-hide');

            if (bgMusic && bgMusic.src) {
                bgMusic.play().then(function () {
                    musicBtn.classList.add('playing');
                }).catch(function () { });
            }

            setTimeout(function () {
                document.body.classList.remove('opening-show');
                document.body.classList.remove('opening-hide');
                var op = document.getElementById('opening');
                if (op) op.remove();
                animateLetters('.couple-anim', 200);
                if (typeof AOS !== 'undefined') AOS.refresh();
            }, 2000);
        });
    }

    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', function () {
            if (bgMusic.paused) {
                bgMusic.play().then(function () {
                    musicBtn.classList.add('playing');
                }).catch(function () { });
            } else {
                bgMusic.pause();
                musicBtn.classList.remove('playing');
            }
        });
    }

    var mainNav = document.getElementById('mainNavbar');
    var btnScrollTop = document.getElementById('btnScrollTop');
    window.addEventListener('scroll', function () {
        if (mainNav) mainNav.classList.toggle('scrolled', window.scrollY > 60);
        if (btnScrollTop) btnScrollTop.classList.toggle('show', window.scrollY > 50);
    });
    if (btnScrollTop) {
        btnScrollTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.querySelectorAll('.nav-link[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var href = a.getAttribute('href');
            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
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
