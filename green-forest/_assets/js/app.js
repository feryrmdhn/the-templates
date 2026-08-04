var FALLBACK_DATA = FALLBACK["green-forest"];
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

function applyData(data) {
    var d = data;
    var f = FALLBACK_DATA;
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    if (el('guest')) el('guest').innerHTML = d.guestName || f.guestName;
    if (el('groom-name')) el('groom-name').innerHTML = d.groomName || f.groomName;
    if (el('bride-name')) el('bride-name').innerHTML = d.brideName || f.brideName;
    if (el('groom-name-opening')) el('groom-name-opening').innerHTML = d.groomName || f.groomName;
    if (el('bride-name-opening')) el('bride-name-opening').innerHTML = d.brideName || f.brideName;

    var coupleText = (d.groomName || f.groomName) + '<br>&<br>' + (d.brideName || f.brideName);
    if (el('header-couple')) el('header-couple').innerHTML = coupleText;
    if (el('navbar-couple')) el('navbar-couple').innerHTML = (d.groomName || f.groomName).split(' ')[0] + ' & ' + (d.brideName || f.brideName).split(' ')[0];
    if (el('closing-couple')) el('closing-couple').innerHTML = coupleText;

    if (el('groom-photo')) el('groom-photo').src = d.groomPhoto || f.groomPhoto;
    if (el('bride-photo')) el('bride-photo').src = d.bridePhoto || f.bridePhoto;
    if (el('groom-role')) el('groom-role').innerHTML = d.groomRole || f.groomRole;
    if (el('bride-role')) el('bride-role').innerHTML = d.brideRole || f.brideRole;
    if (el('groom-bio')) el('groom-bio').innerHTML = d.fatherGroom || f.fatherGroom || '';
    if (el('bride-bio')) el('bride-bio').innerHTML = d.fatherBride || f.fatherBride || '';

    if (el('quote')) el('quote').innerHTML = d.quote || f.quote;
    if (el('quote-source')) el('quote-source').innerHTML = d.quoteSource || f.quoteSource || '';

    var akad = new Date(d.akadDatetime || f.akadDatetime);
    if (el('akad-day')) el('akad-day').innerHTML = days[akad.getDay()];
    if (el('akad-date')) el('akad-date').innerHTML = akad.getDate() + ' ' + months[akad.getMonth()] + ' ' + akad.getFullYear();
    if (el('akad-time')) el('akad-time').innerHTML = 'Pukul ' + akad.getHours().toString().padStart(2, '0') + '.' + akad.getMinutes().toString().padStart(2, '0');
    if (el('akad-venue')) el('akad-venue').innerHTML = d.akadVenue || f.akadVenue;
    if (el('akad-location-title')) el('akad-location-title').innerHTML = 'Akad Nikah - ' + (d.akadVenue || f.akadVenue);
    if (el('akad-address')) el('akad-address').innerHTML = d.akadAddress || f.akadAddress;

    var recep = new Date(d.receptionDatetime || f.receptionDatetime);
    if (el('reception-day')) el('reception-day').innerHTML = days[recep.getDay()];
    if (el('reception-date')) el('reception-date').innerHTML = recep.getDate() + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear();
    if (el('reception-time')) el('reception-time').innerHTML = 'Pukul ' + recep.getHours().toString().padStart(2, '0') + '.' + recep.getMinutes().toString().padStart(2, '0');
    if (el('reception-venue')) el('reception-venue').innerHTML = d.receptionVenue || f.receptionVenue;
    if (el('reception-location-title')) el('reception-location-title').innerHTML = 'Resepsi - ' + (d.receptionVenue || f.receptionVenue);
    if (el('reception-address')) el('reception-address').innerHTML = d.receptionAddress || f.receptionAddress;

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

    if (el('akad-map')) el('akad-map').src = cleanMapsUrl(d.akadMapsUrl || f.akadMapsUrl) || '';
    if (el('reception-map')) el('reception-map').src = cleanMapsUrl(d.receptionMapsUrl || f.receptionMapsUrl) || '';

    var dateText = days[recep.getDay()] + ', ' + recep.getDate() + ' ' + months[recep.getMonth()] + ' ' + recep.getFullYear() + ', pukul ' + recep.getHours().toString().padStart(2, '0') + '.' + recep.getMinutes().toString().padStart(2, '0');
    if (el('opening-date-text')) el('opening-date-text').innerHTML = 'Kami mengundang anda di acara pernikahan kami pada:<br>' + dateText;
    if (el('header-date-text')) el('header-date-text').innerHTML = dateText;

    if (el('section4-img-1')) el('section4-img-1').src = d.section4Img1 || f.section4Img1 || '_assets/img/misc/hands-1.jpg';
    if (el('section4-img-2')) el('section4-img-2').src = d.section4Img2 || f.section4Img2 || '_assets/img/misc/hands-2.jpg';

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
        var storySection = document.getElementById('section-6');
        if (storySection) storySection.style.display = 'none';
        var storyNav = document.querySelector('.nav-link[href="#section-6"]');
        if (storyNav && storyNav.parentElement) storyNav.parentElement.style.display = 'none';
    }

    var isShowGallery = d.isShowGallery !== undefined ? d.isShowGallery : (f.isShowGallery !== undefined ? f.isShowGallery : true);
    if (isShowGallery) {
        var gallery = (d.gallery && d.gallery.length) ? d.gallery : f.gallery;
        renderGallery(gallery);
    } else {
        var gallerySection = document.getElementById('section-7');
        if (gallerySection) gallerySection.style.display = 'none';
        var galleryNav = document.querySelector('.nav-link[href="#section-7"]');
        if (galleryNav && galleryNav.parentElement) galleryNav.parentElement.style.display = 'none';
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
        if (openingSection) {
            var openingBg = window.getComputedStyle(openingSection).backgroundImage;
            var newOpeningBg = openingBg.replace(/url\([^)]*\)(?!.*url\([^)]*\))/, 'url("' + backgroundCover + '")');
            openingSection.style.backgroundImage = newOpeningBg;
        }

        var headerSection = document.querySelector('#header');
        if (headerSection) {
            var headerBg = window.getComputedStyle(headerSection).backgroundImage;
            var newHeaderBg = headerBg.replace(/url\([^)]*\)(?!.*url\([^)]*\))/, 'url("' + backgroundCover + '")');
            headerSection.style.backgroundImage = newHeaderBg;
        }
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
            if (typeof AOS !== 'undefined') AOS.refresh();
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

function renderStory(storyItems) {
    var list = el('story-list');
    if (!list || !storyItems.length) return;
    list.innerHTML = storyItems.map(function (s, i) {
        var imgSrc = s.image || '_assets/img/misc/hands-1.jpg';
        return '<div class="row align-items-center mb-12 overflow-hidden" data-aos="fade-up" data-aos-duration="1400">'
            + '<div class="col order-2">'
            + '<img src="_assets/img/decoration/love.svg" alt="" class="w-2rem">'
            + '<h6 class="font-bold mt-2 mb-2 mb-md-6">' + s.title + '</h6>'
            + '<div class="divider divider-horizontal w-13rem bg-gray-800"></div>'
            + '</div>'
            + '<div class="col-auto order-1">'
            + '<div class="obj-fit obj-fit-cover rounded-circle w-6rem w-md-8rem h-6rem h-md-8rem">'
            + '<img src="' + imgSrc + '" alt=""></div></div>'
            + '<div class="col-12 order-3 mt-6 text-gray">' + s.description + '</div>'
            + '</div>';
    }).join('');
}

function renderGallery(galleryData) {
    var col1 = el('gallery-col-1');
    var col2 = el('gallery-col-2');
    var col3 = el('gallery-col-3');
    if (!col1 || !galleryData.length) return;

    var cols = [col1, col2, col3];
    cols.forEach(function (col) { col.innerHTML = ''; });

    galleryData.forEach(function (src, i) {
        var colIndex = i % 3;
        var isLarge = i < 3;
        var sizeClass = isLarge ? 'img-wrapper-gallery-2' : 'img-wrapper-gallery-1';
        cols[colIndex].innerHTML += '<div class="row gy-2 gy-md-4" data-aos="fade-up" data-aos-duration="' + (1200 + colIndex * 200) + '">'
            + '<div class="col-12"><div class="img-wrapper"><div data-src="' + src + '" class="img-wrapper-gallery ' + sizeClass + '">'
            + '<img src="' + src + '" alt=""></div></div></div></div>';
    });

    var lgEl = el('row-lightgallery');
    if (lgEl && typeof lightGallery !== 'undefined') {
        lightGallery(lgEl, {
            mode: 'lg-fade', cssEasing: 'ease-in', speed: 1000,
            backdropDuration: 500, hideBarsDelay: 500,
            selector: '[data-src]', download: false,
        });
    }

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
        list.innerHTML = '<li class="list-item text-center">'
            + '<div class="text-sm text-gray">Belum ada pesan dan doa</div>'
            + '</li>';
        return;
    }
    list.innerHTML = wishesData.map(function (w) {
        return '<li class="list-item">'
            + '<div class="font-semibold text-dark mb-1">' + sanitize(w.guest_name || w.name) + '</div>'
            + '<div class="text-sm text-gray">' + sanitize(w.message) + '</div>'
            + '</li>';
    }).join('');
}

function renderPayment(paymentData) {
    var section = el('payment-section');
    var list = el('payment-list');
    if (!section || !list) return;
    list.innerHTML = paymentData.map(function (p) {
        return '<div class="text-center p-4" style="min-width:16rem;">'
            + '<img src="' + getPaymentImage(p.method) + '" alt="' + p.method + '" style="width:80px;height:50px;object-fit:contain;">'
            + '<div class="font-semibold mt-2">' + p.value + '</div>'
            + '<div class="text-gray">a.n ' + p.name + '</div>'
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
                submitBtn.textContent = 'Jawab Undangan';
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

    applyData(FALLBACK_DATA);
    renderTenant({}); // Populate default logo/social segera; diperbarui oleh API jika tersedia

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
                if (document.querySelector('#header-couple')) {
                    animateLetters('#header-couple');
                }
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
        if (window.scrollY > 30) {
            if (btn_to_top) btn_to_top.style.display = 'flex';
        } else {
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
