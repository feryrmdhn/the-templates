var FALLBACK_DATA = FALLBACK["violet-brides"] || {};
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

    var coupleText = (d.groomFullName || f.groomFullName) + '<br>&<br>' + (d.brideFullName || f.brideFullName);
    if (el('header-couple')) el('header-couple').innerHTML = coupleText;
    if (el('closing-couple')) el('closing-couple').innerHTML = (d.groomFullName || f.groomFullName) + '<br>&<br>' + (d.brideFullName || f.brideFullName);
    if (el('countdown-title')) el('countdown-title').innerHTML = 'Akad Nikah - ' + (d.groomName || f.groomName) + ' & ' + (d.brideName || f.brideName);

    if (el('section1-quote')) el('section1-quote').innerHTML = d.section1Quote || f.section1Quote;
    if (el('section3-quote')) el('section3-quote').innerHTML = d.section3Quote || f.section3Quote;
    if (el('section3-quote-source')) el('section3-quote-source').innerHTML = d.section3QuoteSource || f.section3QuoteSource;
    if (el('section3-title')) el('section3-title').innerHTML = d.section3Title || f.section3Title || '';
    if (el('section3-desc')) el('section3-desc').innerHTML = d.section3Desc || f.section3Desc || '';

    if (el('opening-photo')) el('opening-photo').src = d.headerPhoto || f.headerPhoto;
    if (el('header-photo')) el('header-photo').src = d.headerPhoto || f.headerPhoto;
    if (el('section3-photo')) el('section3-photo').src = d.section3Photo || f.section3Photo;
    if (el('story-photo-1')) el('story-photo-1').src = d.storyPhoto1 || f.storyPhoto1;
    if (el('story-photo-2')) el('story-photo-2').src = d.storyPhoto2 || f.storyPhoto2;
    if (el('schedule-photo-1')) el('schedule-photo-1').src = d.schedulePhoto1 || f.schedulePhoto1;
    if (el('schedule-photo-2')) el('schedule-photo-2').src = d.schedulePhoto2 || f.schedulePhoto2;
    if (el('schedule-photo-3')) el('schedule-photo-3').src = d.schedulePhoto3 || f.schedulePhoto3;

    if (el('story-title-1')) el('story-title-1').innerHTML = d.storyTitle1 || f.storyTitle1;
    if (el('story-desc-1')) el('story-desc-1').innerHTML = d.storyDesc1 || f.storyDesc1;
    if (el('story-title-2')) el('story-title-2').innerHTML = d.storyTitle2 || f.storyTitle2;
    if (el('story-desc-2')) el('story-desc-2').innerHTML = d.storyDesc2 || f.storyDesc2;

    var akad = new Date(d.akadDatetime || f.akadDatetime);
    var akadStr = days[akad.getDay()] + ', ' + akad.getDate() + ' ' + months[akad.getMonth()] + ' ' + akad.getFullYear();
    var akadTime = 'Pukul ' + akad.getHours().toString().padStart(2, '0') + '.' + akad.getMinutes().toString().padStart(2, '0');
    if (el('akad-date')) el('akad-date').innerHTML = akadStr;
    if (el('akad-time')) el('akad-time').innerHTML = akadTime;
    if (el('akad-location-text')) el('akad-location-text').innerHTML = '<i class="fa-solid fa-location-dot mr-1"></i>Akad : ' + (d.akadVenue || f.akadVenue) + ', ' + (d.akadAddress || f.akadAddress);
    if (el('akad-maps-link')) el('akad-maps-link').href = d.akadMapsUrl || f.akadMapsUrl || '#';

    var recep = new Date(d.receptionDatetime || f.receptionDatetime);
    var recepStr = days[recep.getDay()] + ', ' + recep.getDate() + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();
    var recepTime = 'Pukul ' + recep.getHours().toString().padStart(2, '0') + '.' + recep.getMinutes().toString().padStart(2, '0');
    if (el('reception-date')) el('reception-date').innerHTML = recepStr;
    if (el('reception-time')) el('reception-time').innerHTML = recepTime;
    if (el('reception-location-text')) el('reception-location-text').innerHTML = '<i class="fa-solid fa-location-dot mr-1"></i>Resepsi : ' + (d.receptionVenue || f.receptionVenue) + ', ' + (d.receptionAddress || f.receptionAddress);
    if (el('reception-maps-link')) el('reception-maps-link').href = d.receptionMapsUrl || f.receptionMapsUrl || '#';

    if (el('save-the-date')) el('save-the-date').innerHTML = recep.getDate().toString().padStart(2, '0') + ' - ' + (recep.getMonth() + 1).toString().padStart(2, '0') + ' - ' + recep.getFullYear();
    if (el('header-date')) el('header-date').innerHTML = recepStr;

    timezz('#countdown-row', {
        date: recep,
        stop: false, canContinue: false, withYears: false,
        beforeCreate() { }, beforeDestroy() { }, update() { },
    });

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

    var akadMapFrame = document.querySelector('#akad iframe');
    if (akadMapFrame) akadMapFrame.src = cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) || '';
    var recepMapFrame = document.querySelector('#resepsi iframe');
    if (recepMapFrame) recepMapFrame.src = cleanMapsUrl(d.receptionMapsUrl || f.receptionMapsUrl) || '';

    var music = d.music || f.music;
    var audioSource = document.querySelector('#audio source');
    if (audioSource && music) {
        audioSource.setAttribute('src', music);
        audioSource.parentElement.load();
    }

    var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
    renderGallery(gallery);

    if (!_projectId) {
        var wishes = (d.wishes && d.wishes.length) ? d.wishes : f.wishes;
        renderWishes(wishes);
    }

    var payment = (d.payment && d.payment.length) ? d.payment : f.payment;
    if (payment.length) renderPayment(payment);

    if (el('platform-name')) el('platform-name').innerHTML = d.platform || f.platform || 'Your platform';
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
        anime({
            targets: node.querySelectorAll('.letter'),
            scale: [4, 1], opacity: [0, 1], translateZ: 0,
            easing: 'easeOutExpo', duration: 950,
            delay: function (_, i) { return baseDelay + (nodeIndex * 300) + 100 * i; }
        });
    });
}

function renderGallery(galleryData) {
    var lgEl = el('row-lightgallery');
    if (!lgEl || !galleryData.length) return;

    var items = lgEl.querySelectorAll('[data-src]');
    items.forEach(function (item, i) {
        if (galleryData[i]) {
            item.setAttribute('data-src', galleryData[i]);
            var img = item.querySelector('img');
            if (img) img.src = galleryData[i];
            item.style.display = '';
        } else {
            item.removeAttribute('data-src');
            item.style.display = 'none';
        }
    });

    lightGallery(lgEl, {
        mode: 'lg-fade', cssEasing: 'ease-in', speed: 1000,
        backdropDuration: 500, hideBarsDelay: 500,
        selector: '[data-src]', download: false,
    });
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
        list.innerHTML = '<div class="text-center py-5"><p class="font-light">Belum ada ucapan</p></div>';
        return;
    }

    list.innerHTML = wishesData.map(function (w) {
        return '<div class="row gx-3 gx-md-5 mb-8">'
            + '<div class="col-auto"><div class="w-5rem h-5rem bg-primary rounded-circle d-flex align-items-center justify-content-center"><h5><i class="fa-solid fa-user text-white"></i></h5></div></div>'
            + '<div class="col pt-2"><h5 class="font-bold">' + sanitize(w.guest_name || w.name) + '</h5>'
            + '<div class="card card-message"><div class="card-body">' + sanitize(w.message) + '</div></div></div>'
            + '</div>';
    }).join('');
}

function renderPayment(paymentData) {
    var section10 = el('section-10');
    if (!section10) return;
    var existing = el('payment-section');
    if (!existing) {
        var paySection = document.createElement('section');
        paySection.id = 'payment-section';
        paySection.style.padding = '6rem 0';
        paySection.innerHTML = '<div class="container text-center"><h2 class="font-type-secondary mb-8">Amplop Digital</h2><div id="payment-list" class="d-flex justify-content-center flex-wrap gap-4"></div></div>';
        section10.parentNode.insertBefore(paySection, section10);
    }
    var list = el('payment-list');
    if (!list) return;
    list.innerHTML = paymentData.map(function (p) {
        return '<div class="payment-card-item text-center p-3" style="min-width:16rem;">'
            + '<img src="' + getPaymentImage(p.method) + '" alt="' + p.method + '" style="width:80px;height:50px;object-fit:contain;">'
            + '<div class="font-bold mt-2">' + p.value + '</div>'
            + '<div class="font-light">a.n ' + p.name + '</div>'
            + '</div>';
    }).join('');

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.2 });

    list.querySelectorAll('.payment-card-item').forEach(function (item, i) {
        item.style.transitionDelay = (i * 0.15) + 's';
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

document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    AOS.init();

    applyData(Object.assign({}, FALLBACK_DATA, { guestName: u || FALLBACK_DATA.guestName }));
    renderTenant({}); // Populate default logo/social segera; diperbarui oleh API jika tersedia

    var btn_open = document.querySelector('#btn-open-opening');
    var btn_play = document.querySelector('#btn-play');
    var audio = document.querySelector('#audio');

    if (btn_open) {
        btn_open.addEventListener('click', function () {
            document.body.classList.add('opening-hide');
            for (var aos of document.querySelectorAll('.aos-init')) aos.classList.remove('aos-animate');
            setTimeout(function () {
                var opening = document.querySelector('section#opening');
                if (opening) opening.remove();
                document.body.classList.remove('opening-show');
                document.body.classList.remove('opening-hide');
                if (document.getElementById('header-couple')) {
                    animateLetters('#header-couple');
                }
                AOS.refresh();
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

        var currentSection = null;
        for (var s of sectionlistener) {
            if (window.scrollY >= (s.offsetTop - 100) && window.scrollY < (s.offsetTop + s.offsetHeight)) {
                currentSection = s;
                break;
            }
        }

        for (var link of document.querySelectorAll('.navbar .nav-link')) {
            link.classList.remove('active');
        }

        if (currentSection) {
            var activeLink = document.querySelector('.navbar .nav-link[href="#' + currentSection.id + '"]');
            if (activeLink) activeLink.classList.add('active');
        }
    });
});
