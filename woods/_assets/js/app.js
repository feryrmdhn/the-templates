var FALLBACK_DATA = FALLBACK["woods"];

var _sliderGallery = null;
var _pendingGalleryData = null; 
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
    if (el('closing-couple')) el('closing-couple').innerHTML = (d.groomName || f.groomName) + '<br>&<br>' + (d.brideName || f.brideName);
    if (el('quote')) el('quote').innerHTML = d.quote || f.quote;

    
    if (el('opening-photo')) el('opening-photo').src = d.couplePhoto || f.couplePhoto;
    if (el('closing-photo')) el('closing-photo').src = d.couplePhoto || f.couplePhoto;
    if (el('story-photo-1')) el('story-photo-1').src = d.storyPhoto1 || f.storyPhoto1;
    if (el('story-photo-2')) el('story-photo-2').src = d.storyPhoto2 || f.storyPhoto2;
    if (el('story-photo-3')) el('story-photo-3').src = d.storyPhoto3 || f.storyPhoto3;

    
    var eventDate = new Date(d.eventDatetime || f.eventDatetime);
    if (el('event-date')) el('event-date').innerHTML = days[eventDate.getDay()] + ', ' + eventDate.getDate() + ' ' + months[eventDate.getMonth()] + ' ' + eventDate.getFullYear();
    if (el('event-time')) el('event-time').innerHTML = 'Pukul ' + eventDate.getHours().toString().padStart(2, '0') + '.' + eventDate.getMinutes().toString().padStart(2, '0');
    if (el('event-venue')) el('event-venue').innerHTML = d.venue || f.venue;
    if (el('save-the-date')) el('save-the-date').innerHTML = eventDate.getDate().toString().padStart(2, '0') + ' - ' + (eventDate.getMonth() + 1).toString().padStart(2, '0') + ' - ' + eventDate.getFullYear();

    
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

function renderGallery(galleryData) {
    var wrapper = el('tinyslider-wrapper');
    if (!wrapper || !galleryData.length) return;

    
    var carouselItem = wrapper.closest('.carousel-item');
    if (carouselItem && !carouselItem.classList.contains('active')) {
        _pendingGalleryData = galleryData;
        return;
    }

    _initGallerySlider(galleryData);
}

function _initGallerySlider(galleryData) {
    var wrapper = el('tinyslider-wrapper');
    if (!wrapper || !galleryData.length) return;

    
    if (_sliderGallery) {
        try { _sliderGallery.destroy(); } catch (e) {  }
        _sliderGallery = null;
    }

    
    var oldContainer = wrapper.querySelector('#tinyslider-container-gallery');
    if (!oldContainer) {
        var tnsOuter = wrapper.querySelector('.tns-outer');
        if (tnsOuter) tnsOuter.remove();
    } else {
        oldContainer.remove();
    }

    
    var newContainer = document.createElement('div');
    newContainer.id = 'tinyslider-container-gallery';
    newContainer.innerHTML = galleryData.map(function (src) {
        return '<div class="tinyslider-item"><img src="' + src + '" alt=""></div>';
    }).join('');

    
    var controls = wrapper.querySelector('#tinyslider-controls-gallery');
    if (controls) {
        wrapper.insertBefore(newContainer, controls);
    } else {
        wrapper.appendChild(newContainer);
    }

    
    if (typeof tns === 'undefined') {
        setTimeout(function () { _initGallerySlider(galleryData); }, 100);
        return;
    }

    
    var images = newContainer.querySelectorAll('img');
    var loadedCount = 0;
    var totalImages = images.length;

    function initSlider() {
        try {
            _sliderGallery = tns({
                container: '#tinyslider-container-gallery',
                controlsContainer: '#tinyslider-controls-gallery',
                items: 1,
                nav: false,
                mouseDrag: true,
                gutter: 0,
                swipeAngle: false,
                edgePadding: 0,
                responsive: {
                    768: { items: 2, gutter: 30 }
                }
            });

            if (_sliderGallery) {
                var info = _sliderGallery.getInfo();
                if (info && info.slideItems && info.slideItems[info.index]) {
                    info.slideItems[info.index].classList.add('active');
                }
                _sliderGallery.events.on('indexChanged', function () {
                    var info = _sliderGallery.getInfo();
                    if (info && info.slideItems) {
                        for (var i = 0; i < info.slideItems.length; i++) {
                            info.slideItems[i].classList.remove('active');
                        }
                        if (info.slideItems[info.index]) {
                            info.slideItems[info.index].classList.add('active');
                        }
                    }
                });
            }
        } catch (err) {
            console.warn('Gallery slider init error:', err);
        }
    }

    function onImageLoad() {
        loadedCount++;
        if (loadedCount >= totalImages) {
            initSlider();
        }
    }

    if (totalImages === 0) {
        initSlider();
        return;
    }

    for (var i = 0; i < images.length; i++) {
        if (images[i].complete) {
            onImageLoad();
        } else {
            images[i].addEventListener('load', onImageLoad);
            images[i].addEventListener('error', onImageLoad);
        }
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
    var list = el('wishes-list');
    if (!list) return;

    if (!wishesData || !wishesData.length) {
        list.innerHTML = '<li class="list-group-item text-center"><p class="fw-light mb-0">Belum ada ucapan</p></li>';
        return;
    }

    list.innerHTML = wishesData.map(function (w) {
        return '<li class="li list-group-item">'
            + '<h5 class="font-bold mb-2">' + sanitize(w.guest_name || w.name) + '</h5>'
            + '<p class="text-lg font-light mb-3">' + sanitize(w.message) + '</p>'
            + '</li>';
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

function renderPayment(paymentData) {
    var section = el('payment-section');
    var list = el('payment-list');
    if (!section || !list) return;
    list.innerHTML = paymentData.map(function (p, i) {
        return '<div class="payment-card">'
            + '<div class="payment-card-header">'
            + '<img src="' + getPaymentImage(p.method) + '" alt="' + p.method + '">'
            + '</div>'
            + '<div class="payment-card-body">'
            + '<div class="payment-number">' + p.value + '</div>'
            + '<div class="payment-name">a.n ' + p.name + '</div>'
            + '</div>'
            + '<button class="payment-copy-btn" data-copy="' + p.value + '">'
            + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Salin'
            + '</button>'
            + '</div>';
    }).join('');
    section.style.display = 'block';

    list.querySelectorAll('.payment-copy-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var val = btn.getAttribute('data-copy');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(val).then(function () {
                    showCopyFeedback(btn);
                });
            } else {
                var ta = document.createElement('textarea');
                ta.value = val;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showCopyFeedback(btn);
            }
        });
    });
}

function showCopyFeedback(btn) {
    var orig = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Tersalin!';
    btn.classList.add('copied');
    setTimeout(function () {
        btn.innerHTML = orig;
        btn.classList.remove('copied');
    }, 1500);
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
            document.body.classList.remove('opening-show');
            document.body.classList.add('opening-hide');
            for (var aos of document.querySelectorAll('.aos-init')) aos.classList.remove('aos-animate');
            setTimeout(function () {
                var opening = document.querySelector('section#opening');
                if (opening) opening.remove();
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

    var carousel = document.getElementById('carouselExampleFade');
    if (carousel) {
        carousel.addEventListener('slide.bs.carousel', function () {
            for (var aos of document.querySelectorAll('.aos-init')) aos.classList.remove('aos-animate');
        });
        carousel.addEventListener('slid.bs.carousel', function () {
            AOS.refresh();

            if (_pendingGalleryData) {
                var gallerySection = document.querySelector('#section-3');
                if (gallerySection && gallerySection.closest('.carousel-item.active')) {
                    var data = _pendingGalleryData;
                    _pendingGalleryData = null;
                    _initGallerySlider(data);
                }
            }
        });
    }

    var rsvpForm = document.querySelector('#rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', handleCommentSubmit);
    }
});
