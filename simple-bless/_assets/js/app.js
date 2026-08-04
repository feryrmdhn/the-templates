var FALLBACK_DATA = FALLBACK["simple-bless"];
var _projectId = null;
var _apiBaseUrl = null;

var PLACEHOLDER_LOGO = '/placeholder-image.png';

function elAll(id) { return document.querySelectorAll('[id="' + id + '"]'); }
function getPaymentImage(method) { return '/payment/' + method + '.png'; }


function renderTenant(data) {
    data = data || {};

    
    var logoNodes = elAll('tenant-logo');
    for (var i = 0; i < logoNodes.length; i++) {
        (function (node) {
            var src = data.logo_url || (FALLBACK_DATA.logoUrl || '') || PLACEHOLDER_LOGO;
            node.src = src;
            node.onerror = function () {
                node.onerror = null;
                node.src = PLACEHOLDER_LOGO;
            };
        })(logoNodes[i]);
    }

    
    var socialNodes = elAll('tenant-social');
    var fb = data.facebook_url || '#';
    var ig = data.instagram_url || '#';
    var html = ''
        + '<a href="' + fb + '" target="_blank" rel="noopener noreferrer" class="tenant-social-btn" aria-label="Facebook">'
        + '<i class="fa-brands fa-facebook-f"></i></a>'
        + '<a href="' + ig + '" target="_blank" rel="noopener noreferrer" class="tenant-social-btn" aria-label="Instagram">'
        + '<i class="fa-brands fa-instagram"></i></a>';
    for (var j = 0; j < socialNodes.length; j++) {
        socialNodes[j].innerHTML = html;
    }
}

function setAll(id, prop, value) {
    var elements = elAll(id);
    for (var i = 0; i < elements.length; i++) {
        if (prop === 'src') {
            elements[i].src = value;
        } else if (prop === 'innerHTML') {
            elements[i].innerHTML = value;
        }
    }
}

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

function applyData(data) {
    var d = data;
    var f = FALLBACK_DATA;
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    setAll('guest', 'innerHTML', d.guestName || f.guestName);
    setAll('groom-name-opening', 'innerHTML', d.groomName || f.groomName);
    setAll('bride-name-opening', 'innerHTML', d.brideName || f.brideName);
    setAll('closing-couple', 'innerHTML', (d.groomName || f.groomName) + '<br>&<br>' + (d.brideName || f.brideName));
    setAll('quote', 'innerHTML', d.quote || f.quote);

    
    setAll('opening-photo', 'src', d.openingPhoto || f.openingPhoto);
    setAll('closing-photo', 'src', d.closingPhoto || f.closingPhoto);
    setAll('story-photo-1', 'src', d.storyPhoto1 || f.storyPhoto1);
    setAll('story-photo-2', 'src', d.storyPhoto2 || f.storyPhoto2);

    
    var eventDate = new Date(d.eventDatetime || f.eventDatetime);
    setAll('event-date', 'innerHTML', days[eventDate.getDay()] + ', ' + eventDate.getDate() + ' ' + months[eventDate.getMonth()] + ' ' + eventDate.getFullYear());
    setAll('event-time', 'innerHTML', 'Pukul ' + eventDate.getHours().toString().padStart(2, '0') + '.' + eventDate.getMinutes().toString().padStart(2, '0'));
    setAll('event-venue', 'innerHTML', d.venue || f.venue);
    setAll('save-the-date', 'innerHTML', eventDate.getDate().toString().padStart(2, '0') + ' - ' + (eventDate.getMonth() + 1).toString().padStart(2, '0') + ' - ' + eventDate.getFullYear());

    
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
}

window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'INVITATION_DATA') return;
    var payload = e.data.payload;
    var guest = payload.guestName || payload.guest;

    setAll('guest', 'innerHTML', guest || FALLBACK_DATA.guestName);

    if (payload.mode === "preview") {
        applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
        renderTenant({});
        
        if (document.querySelector('.spouse-text')) {
            animateLetters('.spouse-text');
        }
        notifyLoaded();
        return;
    }

    var apiBaseUrl = payload.apiBaseUrl;
    var tenantSlug = payload.tenantSlug;
    var projectSlug = payload.projectSlug;

    if (!apiBaseUrl || !tenantSlug || !projectSlug) {
        applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
        renderTenant({});
        
        if (document.querySelector('.spouse-text')) {
            animateLetters('.spouse-text');
        }
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
                if (document.querySelector('.spouse-text')) {
                    animateLetters('.spouse-text');
                }
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
            
            if (document.querySelector('.spouse-text')) {
                animateLetters('.spouse-text');
            }
            notifyLoaded();
        });
});



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



function sanitize(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function renderWishes(wishesData) {
    var lists = document.querySelectorAll('[id="wishes-list"]');
    if (!lists.length) return;

    var html;
    if (!wishesData || !wishesData.length) {
        html = '<li class="list-group-item text-center"><p class="text-lg font-light mb-0">Belum ada ucapan</p></li>';
    } else {
        html = wishesData.map(function (w) {
            return '<li class="li list-group-item pl-1">'
                + '<h5 class="font-bold mb-2">' + sanitize(w.guest_name || w.name) + '</h5>'
                + '<p class="text-lg font-light mb-3">' + sanitize(w.message) + '</p>'
                + '</li>';
        }).join('');
    }

    for (var i = 0; i < lists.length; i++) {
        lists[i].innerHTML = html;
    }
}

function renderPayment(paymentData) {
    var sections = document.querySelectorAll('[id="payment-section"]');
    var lists = document.querySelectorAll('[id="payment-list"]');
    if (!sections.length || !lists.length) return;
    var html = paymentData.map(function (p) {
        return '<div class="d-flex align-items-center mb-3">'
            + '<img src="' + getPaymentImage(p.method) + '" alt="' + p.method + '" style="width:60px;height:36px;object-fit:contain;margin-right:12px;">'
            + '<div><div class="font-bold">' + p.value + '</div><div class="font-light">a.n ' + p.name + '</div></div>'
            + '</div>';
    }).join('');
    for (var i = 0; i < lists.length; i++) {
        lists[i].innerHTML = html;
    }
    for (var j = 0; j < sections.length; j++) {
        sections[j].style.display = 'block';
    }
}


var url = new URL(window.location.href);
var u = url.searchParams.get("name") ? url.searchParams.get("name").replace(/_/g, " ") : "";
if (u) setAll('guest', 'innerHTML', u);

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
            document.body.classList.remove('opening-show');
            document.body.classList.add('opening-hide');
            setTimeout(function () {
                var opening = document.querySelector('section#opening');
                if (opening) opening.remove();
                AOS.init();
            }, 1500);
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

    var btn_glide_controls = document.querySelectorAll('[data-glide-dir]');
    var glideSection = new Glide('#glide-section', {
        type: 'carousel',
        perView: 1,
        focusAt: 'center',
        swipeThreshold: false,
        dragThreshold: false,
        animationTimingFunc: 'ease-in',
        animationDuration: 1500,
        autoheight: true,
    });

    glideSection.on('build.after', function () {
        var slideHeight = document.querySelector('.glide__slide--active').offsetHeight;
        var glideTrack = document.querySelector('.glide__track');
        if (slideHeight !== glideTrack.offsetHeight) {
            glideTrack.style.height = slideHeight + 'px';
        }
        renderTenant({});
    });

    glideSection.on('run.after', function () {
        var slideHeight = document.querySelector('.glide__slide--active').offsetHeight;
        var glideTrack = document.querySelector('.glide__track');
        if (slideHeight !== glideTrack.offsetHeight) {
            glideTrack.style.height = slideHeight + 'px';
        }
        for (var btn of btn_glide_controls) {
            btn.classList.remove('active');
            if (glideSection.index === parseInt(btn.dataset.glideDir.substring(1))) {
                btn.classList.add('active');
            }
        }
    });

    glideSection.mount();
});
