import * as THREE from 'three';

var FALLBACK_DATA = window.FALLBACK['3d-midnight-city'];
var _projectId = null;
var _apiBaseUrl = null;
var _countdownTarget = null;
var PLACEHOLDER_LOGO = '/placeholder-image.png';

function el(id) { return document.getElementById(id); }

function sanitize(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

var MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
var DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

function fmtTime(iso) {
    var d = new Date(iso);
    return pad2(d.getHours()) + '.' + pad2(d.getMinutes());
}

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

function renderWishes(wishesData) {
    var c = el('wishes-list');
    if (!c) return;
    if (!wishesData || !wishesData.length) {
        c.innerHTML = '<div class="wishes-empty">Belum ada ucapan</div>';
        return;
    }
    c.innerHTML = wishesData.map(function (w) {
        return '<div class="wish-item">'
            + '<div class="wish-name">' + sanitize(w.guest_name || w.name || '?') + '</div>'
            + '<div class="wish-msg">' + sanitize(w.message) + '</div>'
            + '</div>';
    }).join('');
}

function renderPayment(paymentData) {
    var section = el('payment-section');
    var list = el('payment-list');
    if (!section || !list) return;
    section.style.display = 'block';
    list.innerHTML = paymentData.map(function (p) {
        return '<div class="payment-item">'
            + '<img src="/payment/' + sanitize(p.method) + '.png" alt="' + sanitize(p.method) + '"'
            + ' onerror="this.style.display=\'none\'">'
            + '<div class="pay-num">' + sanitize(p.value) + '</div>'
            + '<div class="pay-name">a.n. ' + sanitize(p.name) + '</div>'
            + '<button type="button" class="btn-copy" data-copy="' + sanitize(p.value) + '">Salin</button>'
            + '</div>';
    }).join('');
}

function renderGallery(galleryData) {
    var c = el('gallery');
    if (!c) return;
    c.innerHTML = '';
    if (!galleryData || !galleryData.length) return;
    var classes = ['g1', 'g2', 'g3', 'g4', 'g5'];
    galleryData.forEach(function (src, idx) {
        var fig = document.createElement('figure');
        fig.className = classes[idx % classes.length];
        fig.innerHTML = '<img alt="Momen ' + (idx + 1) + '" loading="lazy" src="' + sanitize(src) + '" />';
        c.appendChild(fig);
    });
}

function applyData(data) {
    var d = data;
    var f = FALLBACK_DATA;

    var brideName = d.brideName || f.brideName;
    var groomName = d.groomName || f.groomName;
    var brideFull = d.brideFullName || f.brideFullName;
    var groomFull = d.groomFullName || f.groomFullName;

    if (el('guest')) el('guest').textContent = d.guestName || f.guestName;

    if (el('cover-groom')) el('cover-groom').textContent = groomName;
    if (el('cover-bride')) el('cover-bride').textContent = brideName;

    var akad = new Date(d.akadDatetime || f.akadDatetime);
    var recep = new Date(d.receptionDatetime || f.receptionDatetime);
    var loc = d.location || f.location || '';

    if (el('cover-meta')) el('cover-meta').textContent =
        DAYS_ID[recep.getDay()] + ' \u00B7 ' + recep.getDate() + ' ' + MONTHS_ID[recep.getMonth()] + ' ' + recep.getFullYear() + ' \u00B7 ' + loc;

    if (el('couple-groom')) el('couple-groom').textContent = groomFull;
    if (el('couple-bride')) el('couple-bride').textContent = brideFull;
    if (el('groom-role')) el('groom-role').textContent = d.groomRole || f.groomRole;
    if (el('bride-role')) el('bride-role').textContent = d.brideRole || f.brideRole;
    if (el('groom-parents')) el('groom-parents').textContent = d.parentsGroom || f.parentsGroom;
    if (el('bride-parents')) el('bride-parents').textContent = d.parentsBride || f.parentsBride;

    var groomPhoto = d.groomPhoto || f.groomPhoto;
    var bridePhoto = d.bridePhoto || f.bridePhoto;
    if (el('groom-photo') && groomPhoto) el('groom-photo').src = groomPhoto;
    if (el('bride-photo') && bridePhoto) el('bride-photo').src = bridePhoto;

    if (el('date-display')) el('date-display').textContent =
        pad2(recep.getDate()) + ' \u00B7 ' + pad2(recep.getMonth() + 1) + ' \u00B7 ' + recep.getFullYear();
    if (el('date-time')) el('date-time').textContent =
        DAYS_ID[recep.getDay()] + ', pukul ' + fmtTime(d.receptionDatetime || f.receptionDatetime) + ' \u2014 hingga selesai';

    if (el('akad-date')) el('akad-date').textContent =
        DAYS_ID[akad.getDay()] + ', ' + akad.getDate() + ' ' + MONTHS_ID[akad.getMonth()] + ' ' + akad.getFullYear()
        + ' \u00B7 ' + fmtTime(d.akadDatetime || f.akadDatetime);
    if (el('akad-venue')) el('akad-venue').textContent = d.akadVenue || f.akadVenue;
    if (el('akad-address')) el('akad-address').textContent = d.akadAddress || f.akadAddress;

    if (el('reception-date')) el('reception-date').textContent =
        DAYS_ID[recep.getDay()] + ', ' + recep.getDate() + ' ' + MONTHS_ID[recep.getMonth()] + ' ' + recep.getFullYear()
        + ' \u00B7 ' + fmtTime(d.receptionDatetime || f.receptionDatetime);
    if (el('reception-venue')) el('reception-venue').textContent = d.receptionVenue || f.receptionVenue;
    if (el('reception-address')) el('reception-address').textContent = d.receptionAddress || f.receptionAddress;

    renderGallery((d.gallery && d.gallery.length) ? d.gallery : f.gallery);

    _countdownTarget = new Date(d.receptionDatetime || f.receptionDatetime).getTime();

    if (el('closing-quote')) el('closing-quote').textContent = '\u201C' + (d.closingQuote || f.closingQuote) + '\u201D';
    if (el('closing-names')) el('closing-names').textContent = groomName + ' & ' + brideName;
    if (el('closing-date')) el('closing-date').textContent =
        pad2(recep.getDate()) + '.' + pad2(recep.getMonth() + 1) + '.' + recep.getFullYear();

    if (el('platform-name')) el('platform-name').textContent = d.platform || f.platform || 'Your platform';

    var music = d.music || f.music;
    var audio = el('audio');
    if (audio && music) {
        var srcNode = audio.querySelector('source');
        var newSrc = music;
        var currentSrc = srcNode ? srcNode.getAttribute('src') : '';
        if (currentSrc !== newSrc) {
            var wasPlaying = !audio.paused;
            if (srcNode) { srcNode.src = newSrc; audio.load(); }
            if (wasPlaying) {
                audio.play().catch(function () { });
            }
        }
    }

    if (!_projectId) {
        renderWishes((d.wishes && d.wishes.length) ? d.wishes : f.wishes);
    }

    var payment = (d.payment && d.payment.length) ? d.payment : f.payment;
    if (payment.length) renderPayment(payment);
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
    var t = el('toastMc');
    if (!t) return;
    t.textContent = message;
    t.classList.toggle('error', type === 'error');
    t.classList.add('is-show');
    setTimeout(function () { t.classList.remove('is-show'); }, 3000);
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

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Mengirim...'; }

    postComment(_apiBaseUrl, {
        project_id: _projectId,
        guest_name: sanitize(name),
        message: sanitize(message)
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
                submitBtn.textContent = 'Kirim RSVP';
            }
        });
}

window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'INVITATION_DATA') return;

    var payload = e.data.payload;
    var guest = payload.guestName || payload.guest;

    if (el('guest')) el('guest').textContent = guest || FALLBACK_DATA.guestName;

    if (payload.mode === 'preview') {
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
if (_u && el('guest')) el('guest').textContent = _u;

const stage = document.getElementById('stage');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a1020, 15, 90);
scene.background = null;

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 400);
camera.position.set(0, 4, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
stage.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x6a80c0, 0x0a0a1a, 0.55));
const moon = new THREE.DirectionalLight(0xcfd8ff, 0.7);
moon.position.set(-30, 40, 20); scene.add(moon);
const warm = new THREE.PointLight(0xffb56b, 0.9, 60); warm.position.set(0, 3, 15); scene.add(warm);

const world = new THREE.Group(); scene.add(world);

function asphaltTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#14171d'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1500; i++) {
        x.fillStyle = `rgba(${30 + Math.random() * 40},${30 + Math.random() * 40},${35 + Math.random() * 40},${0.3 + Math.random() * 0.4})`;
        x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 40);
    return t;
}
const road = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 500),
    new THREE.MeshStandardMaterial({ map: asphaltTex(), roughness: 0.9, metalness: 0.05 })
);
road.rotation.x = -Math.PI / 2;
road.position.set(0, 0, -220);
world.add(road);

const sideMat = new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.9 });
for (const sx of [-11, 11]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(6, 500), sideMat);
    sw.rotation.x = -Math.PI / 2;
    sw.position.set(sx, 0.02, -220);
    world.add(sw);
}

const dashMat = new THREE.MeshBasicMaterial({ color: 0xf0d089 });
for (let z = 25; z > -450; z -= 8) {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 3.2), dashMat);
    d.rotation.x = -Math.PI / 2;
    d.position.set(0, 0.05, z);
    world.add(d);
}

const stripeMat = new THREE.MeshBasicMaterial({ color: 0xe8eaf0 });
for (let z = -30; z > -440; z -= 70) {
    for (let i = 0; i < 11; i++) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), stripeMat);
        s.rotation.x = -Math.PI / 2;
        s.position.set(-7 + i * 1.4, 0.06, z);
        world.add(s);
    }
}

function windowTexture(litProb = 0.55, palette = 'warm') {
    const c = document.createElement('canvas'); c.width = 128; c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = '#0a0f1c'; x.fillRect(0, 0, 128, 512);
    const cols = 6, rows = 28;
    const cw = 128 / cols, ch = 512 / rows;
    for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
            if (Math.random() < litProb) {
                let col;
                if (palette === 'warm') {
                    const b = 180 + Math.random() * 70 | 0;
                    col = `rgb(${b},${(b * 0.85) | 0},${(b * 0.55) | 0})`;
                } else if (palette === 'cool') {
                    const b = 170 + Math.random() * 70 | 0;
                    col = `rgb(${(b * 0.65) | 0},${(b * 0.85) | 0},${b})`;
                } else {
                    const b = 180 + Math.random() * 60 | 0;
                    col = `rgb(${b},${(b * 0.95) | 0},${(b * 0.75) | 0})`;
                }
                x.fillStyle = col;
            } else {
                x.fillStyle = '#141a2a';
            }
            x.fillRect(cc * cw + cw * 0.2, r * ch + ch * 0.2, cw * 0.6, ch * 0.6);
        }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.NearestFilter;
    return t;
}

const winTex = [
    windowTexture(0.6, 'warm'),
    windowTexture(0.5, 'cool'),
    windowTexture(0.65, 'mixed'),
    windowTexture(0.45, 'warm'),
    windowTexture(0.55, 'cool'),
];

function makeBuilding(x, z, w, h, d, texIdx) {
    const tex = winTex[texIdx % winTex.length].clone();
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(Math.max(1, Math.round(w / 2.5)), Math.max(1, Math.round(h / 5)));
    const mat = new THREE.MeshStandardMaterial({
        map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.85,
        color: 0x1a2032, roughness: 0.75, metalness: 0.25
    });
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    b.position.set(x, h / 2, z);
    world.add(b);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.6, d * 0.85),
        new THREE.MeshStandardMaterial({ color: 0x0f1420, roughness: 0.9 }));
    cap.position.set(x, h + 0.3, z);
    world.add(cap);
    if (Math.random() < 0.35) {
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2), new THREE.MeshStandardMaterial({ color: 0x222 }));
        ant.position.set(x + (Math.random() - 0.5) * w * 0.3, h + 1.7, z + (Math.random() - 0.5) * d * 0.3);
        world.add(ant);
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff3344 }));
        tip.position.set(ant.position.x, h + 2.9, ant.position.z);
        world.add(tip);
    }
}

const rng = (a, b) => a + Math.random() * (b - a);
let idx = 0;
for (let z = 25; z > -440; z -= rng(7, 10)) {
    const wL = rng(6, 10), hL = rng(22, 55), dL = rng(6, 10);
    makeBuilding(-14 - wL / 2, z - dL / 2, wL, hL, dL, idx++);
    const wR = rng(6, 10), hR = rng(22, 55), dR = rng(6, 10);
    makeBuilding(14 + wR / 2, z - dR / 2, wR, hR, dR, idx++);
}
for (let z = 20; z > -440; z -= rng(10, 16)) {
    const wLF = rng(10, 16), hLF = rng(45, 90);
    makeBuilding(-30 - wLF / 2, z, wLF, hLF, wLF * 0.9, idx++);
    const wRF = rng(10, 16), hRF = rng(45, 90);
    makeBuilding(30 + wRF / 2, z, wRF, hRF, wRF * 0.9, idx++);
}
{
    const base = new THREE.Mesh(new THREE.BoxGeometry(10, 140, 10),
        new THREE.MeshStandardMaterial({ color: 0x1a2032, emissive: 0xffcf88, emissiveIntensity: 0.4 }));
    base.position.set(-48, 70, -480); world.add(base);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(3.2, 34, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a3040, emissive: 0xffddaa, emissiveIntensity: 0.5 }));
    spire.position.set(-48, 157, -480); world.add(spire);
    const spireTip = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xff4455 }));
    spireTip.position.set(-48, 176, -480); world.add(spireTip);
}
{
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(14, 110, 14),
        new THREE.MeshStandardMaterial({ color: 0x141a2a, emissive: 0xaad4ff, emissiveIntensity: 0.35 }));
    b2.position.set(46, 55, -490); world.add(b2);
}

const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd48a });
for (let z = 20; z > -440; z -= 22) {
    for (const sx of [-9, 9]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 6), lampPoleMat);
        pole.position.set(sx, 3, z); world.add(pole);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), lampPoleMat);
        arm.position.set(sx + (sx < 0 ? 0.6 : -0.6), 5.8, z); world.add(arm);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), bulbMat);
        bulb.position.set(sx + (sx < 0 ? 1.2 : -1.2), 5.7, z); world.add(bulb);
        const glow = new THREE.Mesh(new THREE.CircleGeometry(2.5, 20),
            new THREE.MeshBasicMaterial({ color: 0xffcf88, transparent: true, opacity: 0.18, depthWrite: false }));
        glow.rotation.x = -Math.PI / 2; glow.position.set(sx + (sx < 0 ? 1.2 : -1.2), 0.08, z);
        world.add(glow);
    }
}

for (let z = -25; z > -430; z -= 140) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 7),
        new THREE.MeshStandardMaterial({ color: 0x222 }));
    post.position.set(-11, 3.5, z); world.add(post);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(7, 0.14, 0.14),
        new THREE.MeshStandardMaterial({ color: 0x222 }));
    arm.position.set(-7.5, 7, z); world.add(arm);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.4, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x111 }));
    box.position.set(-4, 6.5, z); world.add(box);
    const red = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10),
        new THREE.MeshBasicMaterial({ color: Math.random() < 0.5 ? 0xff3322 : 0x22cc44 }));
    red.position.set(-4, 6.5, z + 0.28); world.add(red);
}

function makeCar(color) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 3.8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.7 }));
    body.position.y = 0.6; g.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.65, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x0a121c, roughness: 0.15, metalness: 0.85 }));
    cabin.position.set(0, 1.15, -0.15); g.add(cabin);
    const wheelG = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 10);
    const wheelM = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
    [[-0.95, 0.35, 1.2], [0.95, 0.35, 1.2], [-0.95, 0.35, -1.2], [0.95, 0.35, -1.2]].forEach(p => {
        const w = new THREE.Mesh(wheelG, wheelM); w.rotation.z = Math.PI / 2; w.position.set(...p); g.add(w);
    });
    const hl = new THREE.MeshBasicMaterial({ color: 0xffffcc });
    const hlL = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 6), hl); hlL.position.set(-0.65, 0.65, 1.9); g.add(hlL);
    const hlR = hlL.clone(); hlR.position.x = 0.65; g.add(hlR);
    const tl = new THREE.MeshBasicMaterial({ color: 0xff3322 });
    const tlL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), tl); tlL.position.set(-0.65, 0.65, -1.9); g.add(tlL);
    const tlR = tlL.clone(); tlR.position.x = 0.65; g.add(tlR);
    return g;
}
const carColors = [0xf0c418, 0xf0c418, 0xf0c418, 0xf0c418, 0xd94a4a, 0x2a4d8f, 0x2d6b47, 0x111, 0xd8d8d8, 0x6b3b1a, 0x8b2a2a];
for (let z = 20; z > -430; z -= rng(9, 15)) {
    if (Math.random() < 0.85) {
        const c = makeCar(carColors[Math.floor(Math.random() * carColors.length)]);
        c.position.set(-3.5, 0, z);
        c.rotation.y = Math.PI;
        if (c.children[0].material.color.getHex() === 0xf0c418 && Math.random() < 0.6) {
            const sign = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.35),
                new THREE.MeshBasicMaterial({ color: 0xffffff }));
            sign.position.set(0, 1.6, 0); c.add(sign);
        }
        world.add(c);
    }
    if (Math.random() < 0.85) {
        const c = makeCar(carColors[Math.floor(Math.random() * carColors.length)]);
        c.position.set(3.5, 0, z + rng(-3, 3));
        world.add(c);
    }
}

const skinColors = [0xffd4a3, 0xe8b48a, 0xc4956b, 0x8b6141, 0xf0c9a0];
const outfitColors = [0xd94a4a, 0x2a4d8f, 0x2d6b47, 0x8b3a8b, 0xd9a94a, 0x4a4a4a, 0xefefef, 0x1a1a1a, 0x8b4513, 0x556b8d];
function makePerson() {
    const g = new THREE.Group();
    const outfit = outfitColors[Math.floor(Math.random() * outfitColors.length)];
    const skin = skinColors[Math.floor(Math.random() * skinColors.length)];
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.75, 4, 6),
        new THREE.MeshStandardMaterial({ color: outfit, roughness: 0.85 }));
    body.position.y = 0.85; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 10, 10),
        new THREE.MeshStandardMaterial({ color: skin, roughness: 0.9 }));
    head.position.y = 1.7; g.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    hair.position.y = 1.72; g.add(hair);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.7, 0.17), legMat);
    legL.position.set(-0.13, 0.35, 0); g.add(legL);
    const legR = legL.clone(); legR.position.x = 0.13; g.add(legR);
    return g;
}
for (let z = 15; z > -430; z -= rng(3.5, 7)) {
    for (const sx of [-9.5, -11.5, 9.5, 11.5]) {
        if (Math.random() < 0.55) {
            const p = makePerson();
            p.position.set(sx + rng(-0.6, 0.6), 0, z + rng(-2, 2));
            p.rotation.y = Math.random() * Math.PI * 2;
            world.add(p);
        }
    }
}

const starGeo = new THREE.BufferGeometry();
const starPos = [];
for (let i = 0; i < 500; i++) {
    starPos.push((Math.random() - 0.5) * 500, 60 + Math.random() * 80, -Math.random() * 500);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0.65, depthWrite: false }));
scene.add(stars);

const moonMesh = new THREE.Mesh(new THREE.CircleGeometry(4, 32),
    new THREE.MeshBasicMaterial({ color: 0xf4f0e0, transparent: true, opacity: 0.9 }));
moonMesh.position.set(-40, 90, -350); scene.add(moonMesh);
const moonGlow = new THREE.Mesh(new THREE.CircleGeometry(7, 32),
    new THREE.MeshBasicMaterial({ color: 0xf4f0e0, transparent: true, opacity: 0.15, depthWrite: false }));
moonGlow.position.set(-40, 90, -351); scene.add(moonGlow);

let scrollP = 0;
let currentZ = 30, targetZ = 30;
let currentY = 4, targetY = 4;
let animRunning = false;

function updateFromScroll() {
    const max = document.body.scrollHeight - innerHeight;
    scrollP = Math.min(1, Math.max(0, scrollY / Math.max(1, max)));
    targetZ = 30 - scrollP * 340;
    targetY = 4 + Math.sin(scrollP * Math.PI) * 1.2;
    var prog = document.getElementById('progress');
    if (prog) prog.style.width = (scrollP * 100) + '%';
    var depthVal = document.getElementById('depthVal');
    if (depthVal) depthVal.textContent = Math.round(scrollP * 40) + ' blok';
    kick();
}

function kick() {
    if (!animRunning) {
        animRunning = true;
        requestAnimationFrame(loop);
    }
}

function loop() {
    const dz = targetZ - currentZ;
    const dy = targetY - currentY;
    currentZ += dz * 0.12;
    currentY += dy * 0.12;
    camera.position.set(0, currentY, currentZ);
    camera.lookAt(0, currentY - 0.3, currentZ - 20);

    scene.fog.near = 15 - scrollP * 5;
    scene.fog.far = 90 - scrollP * 40;

    renderer.render(scene, camera);

    if (Math.abs(dz) > 0.05 || Math.abs(dy) > 0.02) {
        requestAnimationFrame(loop);
    } else {
        animRunning = false;
    }
}

addEventListener('scroll', updateFromScroll, { passive: true });
addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    kick();
});

updateFromScroll();
kick();

setTimeout(function () { var l = el('loader'); if (l) l.classList.add('hide'); }, 700);

applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
renderTenant({});

var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(function (node) { io.observe(node); });

function tickCountdown() {
    if (!_countdownTarget) return;
    var diff = Math.max(0, _countdownTarget - Date.now());
    var d = Math.floor(diff / 86400000); diff -= d * 86400000;
    var h = Math.floor(diff / 3600000); diff -= h * 3600000;
    var m = Math.floor(diff / 60000); diff -= m * 60000;
    var s = Math.floor(diff / 1000);
    var map = { d: d, h: h, m: m, s: s };
    document.querySelectorAll('#countdown .num').forEach(function (n) {
        n.textContent = pad2(map[n.dataset.k]);
    });
}
tickCountdown();
setInterval(tickCountdown, 1000);

var rsvpForm = el('rsvp-form');
if (rsvpForm) rsvpForm.addEventListener('submit', handleRSVP);

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
        var ta = document.createElement('textarea'); ta.value = val; document.body.appendChild(ta);
        ta.select(); try { document.execCommand('copy'); } catch (_) { }
        document.body.removeChild(ta); done();
    }
});

var musicBtn = el('music');
var audioEl = el('audio');
var audioCtx, playing = false;
var musicAutoStarted = false;

var _audioUnlocked = false;

function _unlockAudioCtx() {
    var hasFile = audioEl && audioEl.querySelector('source') && audioEl.querySelector('source').getAttribute('src');
    if (hasFile || _audioUnlocked) return;
    _audioUnlocked = true;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'running') {
        audioCtx.suspend();
    }
}

document.addEventListener('touchstart', _unlockAudioCtx, { once: true, passive: true });
document.addEventListener('pointerdown', _unlockAudioCtx, { once: true });

function _buildAudioGraph() {
    var master = audioCtx.createGain(); master.gain.value = 0.14; master.connect(audioCtx.destination);
    var freqs = [174.61, 220.00, 261.63, 349.23];
    freqs.forEach(function (f, i) {
        var o = audioCtx.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f;
        var g = audioCtx.createGain(); g.gain.value = 0;
        var lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.08 + i * 0.03;
        var lfoG = audioCtx.createGain(); lfoG.gain.value = 0.04;
        lfo.connect(lfoG).connect(g.gain);
        o.connect(g).connect(master);
        o.start(); lfo.start();
        g.gain.linearRampToValueAtTime(0.17, audioCtx.currentTime + 3);
    });

    var bufSize = 2 * audioCtx.sampleRate;
    var noiseBuf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    for (var i = 0; i < bufSize; i++) nd[i] = Math.random() * 2 - 1;
    var noise = audioCtx.createBufferSource(); noise.buffer = noiseBuf; noise.loop = true;
    var bp = audioCtx.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 600;
    var ng = audioCtx.createGain(); ng.gain.value = 0.03;
    noise.connect(bp).connect(ng).connect(master); noise.start();
}

function startMusic() {
    if (musicAutoStarted) return;
    musicAutoStarted = true;

    var hasFile = audioEl && audioEl.querySelector('source') && audioEl.querySelector('source').getAttribute('src');
    if (hasFile) {
        audioEl.play().catch(function () { });
        if (musicBtn) musicBtn.classList.add('playing');
        playing = true;
        return;
    }

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    _buildAudioGraph();
    audioCtx.resume().then(function () {
        playing = true;
        if (musicBtn) musicBtn.classList.add('playing');
    });
}

if (musicBtn) {
    musicBtn.addEventListener('click', function () {
        var hasFile = audioEl && audioEl.querySelector('source') && audioEl.querySelector('source').getAttribute('src');
        if (hasFile) {
            if (audioEl.paused) {
                audioEl.play().catch(function () { });
                musicBtn.classList.add('playing');
                playing = true;
            } else {
                audioEl.pause();
                musicBtn.classList.remove('playing');
                playing = false;
            }
            return;
        }
        if (!musicAutoStarted) {
            startMusic();
            return;
        }
        if (!audioCtx) return;
        if (playing) {
            audioCtx.suspend();
            musicBtn.classList.remove('playing');
        } else {
            audioCtx.resume();
            musicBtn.classList.add('playing');
        }
        playing = !playing;
    });
}

var openingSection = document.getElementById('opening');
if (openingSection) {
    var openingObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { startMusic(); openingObs.disconnect(); }
        });
    }, { threshold: 0.3 });
    openingObs.observe(openingSection);
}
