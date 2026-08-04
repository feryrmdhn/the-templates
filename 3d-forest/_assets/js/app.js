import * as THREE from 'three';

var FALLBACK_DATA = window.FALLBACK['3d-forest'];
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

    if (el('cover-bride')) el('cover-bride').textContent = brideName;
    if (el('cover-groom')) el('cover-groom').textContent = groomName;

    var akad = new Date(d.akadDatetime || f.akadDatetime);
    var recep = new Date(d.receptionDatetime || f.receptionDatetime);
    var loc = d.location || f.location || '';

    if (el('cover-meta')) el('cover-meta').textContent =
        DAYS_ID[recep.getDay()] + ' \u00B7 ' + recep.getDate() + ' ' + MONTHS_ID[recep.getMonth()] + ' ' + recep.getFullYear() + ' \u00B7 ' + loc;

    if (el('couple-bride')) el('couple-bride').textContent = brideFull;
    if (el('couple-groom')) el('couple-groom').textContent = groomFull;
    if (el('groom-role')) el('groom-role').textContent = d.groomRole || f.groomRole;
    if (el('bride-role')) el('bride-role').textContent = d.brideRole || f.brideRole;
    if (el('groom-parents')) el('groom-parents').textContent = d.parentsGroom || f.parentsGroom;
    if (el('bride-parents')) el('bride-parents').textContent = d.parentsBride || f.parentsBride;

    var bridePhoto = d.bridePhoto || f.bridePhoto;
    var groomPhoto = d.groomPhoto || f.groomPhoto;
    if (el('bride-photo') && bridePhoto) el('bride-photo').src = bridePhoto;
    if (el('groom-photo') && groomPhoto) el('groom-photo').src = groomPhoto;

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
    var t = el('toast3f');
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
scene.fog = new THREE.Fog(0x2a3a2c, 8, 55);
scene.background = null;

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 1.7, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
stage.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc8e6c2, 0x2a3a2c, 0.9));
const sun = new THREE.DirectionalLight(0xfff2c8, 1.4);
sun.position.set(6, 14, 4); scene.add(sun);
const fill = new THREE.PointLight(0x9ec48b, 0.8, 40); fill.position.set(-6, 4, -4); scene.add(fill);

const world = new THREE.Group(); scene.add(world);

function groundTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = '#2f4030'; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2500; i++) {
        x.fillStyle = `rgba(${50 + Math.random() * 80},${80 + Math.random() * 80},${40 + Math.random() * 60},${0.3 + Math.random() * 0.5})`;
        x.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 40);
    return t;
}
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 400),
    new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, 0, -180);
world.add(ground);

const pathTex = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 512;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 64, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, '#8a7a5a'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 512);
    for (let i = 0; i < 800; i++) {
        x.fillStyle = `rgba(${100 + Math.random() * 80},${80 + Math.random() * 40},${40 + Math.random() * 30},${Math.random() * 0.5})`;
        x.fillRect(Math.random() * 64, Math.random() * 512, 2, 2);
    }
    const t = new THREE.CanvasTexture(c); t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 20);
    return t;
})();
const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 400),
    new THREE.MeshStandardMaterial({ map: pathTex, transparent: true, roughness: 1 })
);
path.rotation.x = -Math.PI / 2;
path.position.set(0, 0.01, -180);
world.add(path);

function makeTree(scale = 1) {
    const g = new THREE.Group();
    const trunkH = 4 + Math.random() * 3;
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15 * scale, 0.28 * scale, trunkH, 6),
        new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.08, 0.35, 0.18 + Math.random() * 0.08), roughness: 1 })
    );
    trunk.position.y = trunkH / 2;
    g.add(trunk);
    const foliageMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.28 + Math.random() * 0.08, 0.4 + Math.random() * 0.2, 0.25 + Math.random() * 0.15),
        roughness: 0.9, flatShading: true
    });
    for (let i = 0; i < 3; i++) {
        const r = (1.8 - i * 0.3) * scale;
        const h = 2.2 * scale;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), foliageMat);
        cone.position.y = trunkH + i * h * 0.55;
        cone.rotation.y = Math.random() * Math.PI;
        g.add(cone);
    }
    return g;
}
const trees = new THREE.Group();
for (let z = -2; z > -350; z -= 5) {
    for (let side of [-1, 1]) {
        const off = 3 + Math.random() * 10;
        const t = makeTree(0.8 + Math.random() * 1.2);
        t.position.set(side * off + (Math.random() - 0.5) * 1.5, 0, z + (Math.random() - 0.5) * 2);
        t.rotation.y = Math.random() * Math.PI * 2;
        trees.add(t);
    }
    if (Math.random() < 0.4) {
        const t = makeTree(1.3 + Math.random() * 0.8);
        t.position.set((Math.random() - 0.5) * 40, 0, z - 1);
        trees.add(t);
    }
}
world.add(trees);

const fernLeafGeo = new THREE.ConeGeometry(0.15, 0.9, 4);
const fernMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.31, 0.48, 0.28),
    roughness: 0.9, side: THREE.DoubleSide, flatShading: true
});
const FERN_COUNT = 600;
const fernInst = new THREE.InstancedMesh(fernLeafGeo, fernMat, FERN_COUNT * 6);
fernInst.instanceMatrix.setUsage(THREE.StaticDrawUsage);
const _fdummy = new THREE.Object3D();
let _fi = 0;
for (let z = -1; z > -300; z -= 4) {
    for (let i = 0; i < 3; i++) {
        const fx = (Math.random() - 0.5) * 14;
        const fz = z + (Math.random() - 0.5) * 2;
        const fs = 0.6 + Math.random() * 0.6;
        for (let l = 0; l < 6; l++) {
            _fdummy.position.set(fx, 0.4 * fs, fz);
            _fdummy.rotation.set(Math.PI / 2.4, 0, (l / 6) * Math.PI * 2);
            _fdummy.scale.setScalar(fs);
            _fdummy.updateMatrix();
            fernInst.setMatrixAt(_fi++, _fdummy.matrix);
            if (_fi >= FERN_COUNT * 6) break;
        }
        if (_fi >= FERN_COUNT * 6) break;
    }
    if (_fi >= FERN_COUNT * 6) break;
}
fernInst.instanceMatrix.needsUpdate = true;
world.add(fernInst);

const fountainGroup = new THREE.Group();
const marble = new THREE.MeshStandardMaterial({ color: 0xd6cdb8, roughness: 0.5, metalness: 0.1 });
const basin = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.2, 0.5, 48), marble);
basin.position.y = 0.25;
fountainGroup.add(basin);
const water = new THREE.Mesh(
    new THREE.CircleGeometry(2.85, 48),
    new THREE.MeshStandardMaterial({ color: 0x8fc2b8, roughness: 0.15, metalness: 0.4, transparent: true, opacity: 0.9, emissive: 0x3a6a68, emissiveIntensity: 0.15 })
);
water.rotation.x = -Math.PI / 2; water.position.y = 0.45;
fountainGroup.add(water);
const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 1.6, 24), marble);
col.position.y = 0.5 + 0.8;
fountainGroup.add(col);
const upperBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.6, 0.35, 32), marble);
upperBowl.position.y = 2.1;
fountainGroup.add(upperBowl);
const upperWater = new THREE.Mesh(
    new THREE.CircleGeometry(1.0, 32),
    new THREE.MeshStandardMaterial({ color: 0xa5d0c8, transparent: true, opacity: 0.9, emissive: 0x3a6a68, emissiveIntensity: 0.2 })
);
upperWater.rotation.x = -Math.PI / 2; upperWater.position.y = 2.3;
fountainGroup.add(upperWater);
const finial = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), marble);
finial.position.y = 2.7; fountainGroup.add(finial);

const jetMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, emissive: 0xcfe8e4, emissiveIntensity: 0.4 });
const jets = [];
const JETS = 24;
for (let i = 0; i < JETS; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), jetMat);
    const a = (i / JETS) * Math.PI * 2 + Math.random() * 0.3;
    s.userData = { a, phase: Math.random() * Math.PI * 2, speed: 0.8 + Math.random() * 0.5, r: 0.15 + Math.random() * 0.2 };
    fountainGroup.add(s);
    jets.push(s);
}

fountainGroup.position.set(0, 0, -60);
world.add(fountainGroup);

const dropGeo = new THREE.BufferGeometry();
const DN = 180;
const dpos = new Float32Array(DN * 3);
const dropData = [];
for (let i = 0; i < DN; i++) {
    dpos[i * 3] = 0; dpos[i * 3 + 1] = 0; dpos[i * 3 + 2] = 0;
    dropData.push({ a: Math.random() * Math.PI * 2, r: 0, v: 0.02 + Math.random() * 0.05, up: 0.05 + Math.random() * 0.09, life: Math.random(), max: 0.6 + Math.random() * 0.8 });
}
dropGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
const dropTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(180,220,220,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
})();
const dropMat = new THREE.PointsMaterial({ size: 0.08, map: dropTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xd6f0ec });
const drops = new THREE.Points(dropGeo, dropMat);
drops.position.copy(fountainGroup.position);
drops.position.y = 2.7;
scene.add(drops);

const N = 250;
const partGeo = new THREE.BufferGeometry();
const ppos = new Float32Array(N * 3);
const partData = [];
for (let i = 0; i < N; i++) {
    ppos[i * 3] = (Math.random() - 0.5) * 30;
    ppos[i * 3 + 1] = 0.5 + Math.random() * 6;
    ppos[i * 3 + 2] = -Math.random() * 300;
    partData.push({ ph: Math.random() * Math.PI * 2, amp: 0.3 + Math.random() * 0.7, spd: 0.3 + Math.random() * 0.6 });
}
partGeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
const partTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,240,180,1)'); g.addColorStop(0.4, 'rgba(200,168,106,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
})();
const partMat = new THREE.PointsMaterial({ size: 0.15, map: partTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe8b0, opacity: 0.9 });
const particles = new THREE.Points(partGeo, partMat);
scene.add(particles);

function makeBird() {
    const g = new THREE.Group();
    const bodyM = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), bodyM); g.add(body);
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(0.4, 0.15, 0.7, 0); wingShape.quadraticCurveTo(0.4, -0.02, 0, 0);
    const wingG = new THREE.ShapeGeometry(wingShape);
    const wingM = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, side: THREE.DoubleSide, roughness: 0.6 });
    const wL = new THREE.Mesh(wingG, wingM); wL.position.set(0.04, 0, 0);
    const wR = new THREE.Mesh(wingG, wingM); wR.position.set(-0.04, 0, 0); wR.rotation.y = Math.PI;
    g.add(wL); g.add(wR);
    g.userData = { wL, wR };
    return g;
}
const birds = [];
for (let i = 0; i < 10; i++) {
    const b = makeBird();
    b.userData.z = -20 - Math.random() * 200;
    b.userData.x = (Math.random() - 0.5) * 20;
    b.userData.y = 5 + Math.random() * 4;
    b.userData.speed = 0.05 + Math.random() * 0.08;
    b.userData.ph = Math.random() * Math.PI * 2;
    b.userData.flap = 8 + Math.random() * 6;
    b.userData.dir = Math.random() < 0.5 ? 1 : -1;
    world.add(b);
    birds.push(b);
}

function leafTex() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#1e2a1e';
    x.beginPath();
    x.moveTo(64, 10); x.bezierCurveTo(115, 40, 110, 110, 64, 120); x.bezierCurveTo(18, 110, 13, 40, 64, 10); x.fill();
    x.strokeStyle = '#0f1a10'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(64, 15); x.lineTo(64, 115); x.stroke();
    return new THREE.CanvasTexture(c);
}
const lTex = leafTex();
const canopy = new THREE.Group();
for (let z = -4; z > -320; z -= 6) {
    for (let i = 0; i < 3; i++) {
        const s = 1.8 + Math.random() * 1.6;
        const m = new THREE.Mesh(
            new THREE.PlaneGeometry(s, s * 1.2),
            new THREE.MeshBasicMaterial({ map: lTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.85 })
        );
        m.position.set((Math.random() - 0.5) * 20, 7 + Math.random() * 2, z + (Math.random() - 0.5) * 3);
        m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        canopy.add(m);
    }
}
world.add(canopy);

const mouse = { tx: 0, ty: 0, x: 0, y: 0 };
addEventListener('pointermove', e => {
    mouse.tx = e.clientX / innerWidth - 0.5;
    mouse.ty = e.clientY / innerHeight - 0.5;
    kick();
});

let scrollP = 0, scrollVel = 0, lastY = 0;
let animRunning = false;

function kick() {
    if (!animRunning) {
        animRunning = true;
        requestAnimationFrame(animate);
    }
}

addEventListener('scroll', () => {
    const max = document.body.scrollHeight - innerHeight;
    scrollP = Math.min(1, Math.max(0, scrollY / max));
    scrollVel = scrollY - lastY;
    lastY = scrollY;
    var prog = document.getElementById('progress');
    if (prog) prog.style.width = (scrollP * 100) + '%';
    var depthEl = document.getElementById('depthVal');
    if (depthEl) depthEl.textContent = Math.floor(scrollP * 300) + 'm';
    kick();
}, { passive: true });

addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    kick();
});

const clock = new THREE.Clock();

function animate() {
    const t = clock.getElapsedTime();

    const tgZ = 12 - scrollP * 290;
    const tgY = 1.7 + Math.sin(scrollP * Math.PI * 2) * 0.15;
    const dz = tgZ - camera.position.z;
    const dy = tgY - camera.position.y;
    camera.position.z += dz * 0.08;
    camera.position.y += dy * 0.05;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    camera.position.x = mouse.x * 1.2 + Math.sin(t * 0.3) * 0.1;
    camera.lookAt(mouse.x * 0.5, 1.5 + mouse.y * 0.5, camera.position.z - 8);

    scene.fog.near = 8 - scrollP * 4;
    scene.fog.far = 55 - scrollP * 20;
    const cVal = Math.floor(0x2a - scrollP * 0x10);
    scene.fog.color.setRGB(cVal / 255, (cVal + 16) / 255, cVal / 255);

    const nearFountain = camera.position.z > -80;
    if (nearFountain) {
        jets.forEach(s => {
            const u = s.userData;
            const phase = (t * u.speed + u.phase) % 1.4;
            const h = phase * 1.5;
            const rr = u.r * (1 + phase * 0.8);
            s.position.set(Math.cos(u.a) * rr, 2.7 + h - phase * phase * 1.2, Math.sin(u.a) * rr);
            s.scale.y = 1 + phase * 3;
            s.material.opacity = Math.max(0, 0.85 - phase * 0.6);
        });

        const dpArr = dropGeo.attributes.position.array;
        for (let i = 0; i < DN; i++) {
            const d = dropData[i];
            d.life += 0.02;
            if (d.life > d.max) { d.life = 0; d.a = Math.random() * Math.PI * 2; d.r = 0; }
            d.r += d.v;
            const y = d.up * 10 * d.life - 4 * d.life * d.life;
            dpArr[i * 3] = Math.cos(d.a) * d.r;
            dpArr[i * 3 + 1] = Math.max(-2.3, y);
            dpArr[i * 3 + 2] = Math.sin(d.a) * d.r;
        }
        dropGeo.attributes.position.needsUpdate = true;
        water.material.emissiveIntensity = 0.15 + Math.sin(t * 2) * 0.05;
        upperWater.material.emissiveIntensity = 0.2 + Math.cos(t * 2) * 0.05;
    }

    const arr = partGeo.attributes.position.array;
    for (let i = 0; i < N; i++) {
        const p = partData[i];
        arr[i * 3] += Math.cos(t * p.spd + p.ph) * 0.006;
        arr[i * 3 + 1] += Math.sin(t * p.spd + p.ph) * 0.005;
        if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = 0.5;
        if (arr[i * 3 + 1] < 0.5) arr[i * 3 + 1] = 4;
    }
    partGeo.attributes.position.needsUpdate = true;

    birds.forEach(b => {
        const u = b.userData;
        u.x += u.speed * u.dir;
        if (u.x > 15) u.dir = -1;
        if (u.x < -15) u.dir = 1;
        b.position.set(u.x, u.y + Math.sin(t * 1.2 + u.ph) * 0.25, u.z);
        b.rotation.y = u.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        const flap = Math.sin(t * u.flap + u.ph) * 0.9;
        u.wL.rotation.y = -flap;
        u.wR.rotation.y = Math.PI + flap;
    });

    canopy.rotation.z = Math.sin(t * 0.3) * 0.02;

    scrollVel *= 0.9;
    renderer.render(scene, camera);

    const stillMoving = Math.abs(dz) > 0.05 || Math.abs(dy) > 0.02
        || Math.abs(mouse.tx - mouse.x) > 0.002
        || nearFountain;

    if (stillMoving) {
        requestAnimationFrame(animate);
    } else {
        animRunning = false;
    }
}

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

    var master = audioCtx.createGain(); master.gain.value = 0.13; master.connect(audioCtx.destination);
    var freqs = [196.00, 246.94, 293.66, 392.00];
    freqs.forEach(function (f, i) {
        var o = audioCtx.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f;
        var g = audioCtx.createGain(); g.gain.value = 0;
        var lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.08 + i * 0.03;
        var lfoG = audioCtx.createGain(); lfoG.gain.value = 0.05;
        lfo.connect(lfoG).connect(g.gain);
        o.connect(g).connect(master);
        o.start(); lfo.start();
        g.gain.linearRampToValueAtTime(0.16, audioCtx.currentTime + 3);
    });

    var bufSize = 2 * audioCtx.sampleRate;
    var noiseBuf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    for (var i = 0; i < bufSize; i++) nd[i] = Math.random() * 2 - 1;
    var noise = audioCtx.createBufferSource(); noise.buffer = noiseBuf; noise.loop = true;
    var bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 0.8;
    var ng = audioCtx.createGain(); ng.gain.value = 0.02;
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
