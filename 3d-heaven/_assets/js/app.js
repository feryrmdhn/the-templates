import * as THREE from 'three';

var FALLBACK_DATA = window.FALLBACK['3d-heaven'];
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

    if (el('cover-verse')) el('cover-verse').innerHTML =
        '&ldquo;' + sanitize(d.quote || f.quote) + '&rdquo;';

    if (el('couple-bride')) el('couple-bride').textContent = brideFull;
    if (el('couple-groom')) el('couple-groom').textContent = groomFull;
    if (el('groom-role')) el('groom-role').textContent = d.groomRole || f.groomRole;
    if (el('bride-role')) el('bride-role').textContent = d.brideRole || f.brideRole;
    if (el('groom-parents')) el('groom-parents').textContent = d.parentsGroom || f.parentsGroom;
    if (el('bride-parents')) el('bride-parents').textContent = d.parentsBride || f.parentsBride;

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

    _countdownTarget = new Date(d.receptionDatetime || f.receptionDatetime).getTime();

    if (el('closing-quote')) el('closing-quote').textContent = '\u201C' + (d.closingQuote || f.closingQuote) + '\u201D';
    if (el('closing-names')) el('closing-names').textContent = groomName + ' & ' + brideName;
    if (el('closing-date')) el('closing-date').textContent =
        pad2(recep.getDate()) + '.' + pad2(recep.getMonth() + 1) + '.' + recep.getFullYear();

    if (el('platform-name')) el('platform-name').textContent = d.platform || f.platform || 'Your platform';

    var music = d.music || f.music;
    var audio = el('audio');
    if (audio && music) {
        var src = audio.querySelector('source');
        if (src) { src.src = music; audio.load(); }
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
    var t = el('toast3d');
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
        getLogo(apiBaseUrl, tenantSlug).catch(function () { return null; })
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
scene.fog = new THREE.Fog(0xfdf7ee, 12, 42);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.4, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
stage.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0xf0e6d0, 1.1));
const sun = new THREE.DirectionalLight(0xfff2d0, 1.6);
sun.position.set(0, 12, 4); scene.add(sun);
const fill = new THREE.PointLight(0xffe0b8, 1.0, 30); fill.position.set(-6, 2, 4); scene.add(fill);
const rim = new THREE.PointLight(0xfff8e0, 0.8, 30); rim.position.set(6, -2, 3); scene.add(rim);

const world = new THREE.Group(); scene.add(world);

function cloudTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    for (let i = 0; i < 7; i++) {
        const gx = 64 + Math.random() * 128, gy = 100 + Math.random() * 80, r = 60 + Math.random() * 50;
        const g = x.createRadialGradient(gx, gy, 0, gx, gy, r);
        g.addColorStop(0, 'rgba(255,255,255,0.95)');
        g.addColorStop(0.4, 'rgba(255,246,224,0.55)');
        g.addColorStop(1, 'rgba(255,246,224,0)');
        x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    }
    return new THREE.CanvasTexture(c);
}
const cTex = cloudTex();
const clouds = new THREE.Group();
const cloudData = [];
for (let i = 0; i < 28; i++) {
    const s = 3 + Math.random() * 5;
    const m = new THREE.Mesh(
        new THREE.PlaneGeometry(s, s * 0.6),
        new THREE.MeshBasicMaterial({ map: cTex, transparent: true, depthWrite: false, opacity: 0.75 })
    );
    const d = {
        x: (Math.random() - 0.5) * 30,
        y: -2 + Math.random() * 10,
        z: -4 - Math.random() * 18,
        vx: 0.002 + Math.random() * 0.004,
        base: m
    };
    m.position.set(d.x, d.y, d.z);
    cloudData.push(d);
    clouds.add(m);
}
world.add(clouds);

const altar = new THREE.Group();
const ringMat = new THREE.MeshStandardMaterial({ color: 0xd6b25a, metalness: 1, roughness: 0.15, emissive: 0x5a3d10, emissiveIntensity: 0.25 });
const ringMat2 = new THREE.MeshStandardMaterial({ color: 0xf0d68a, metalness: 1, roughness: 0.2, emissive: 0x6a4d18, emissiveIntensity: 0.2 });
const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.08, 40, 220), ringMat);
const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.08, 40, 220), ringMat2);
ring1.position.set(-0.55, 0, 0); ring1.rotation.y = 0.5;
ring2.position.set(0.55, 0, 0); ring2.rotation.y = -0.5; ring2.rotation.x = Math.PI / 2.2;
const dia = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.12, 0),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0, emissive: 0xffe8b8, emissiveIntensity: 0.9 })
);
dia.position.set(0, 1.15, 0);
ring1.add(dia);
altar.add(ring1); altar.add(ring2);
altar.position.set(0, 1.6, 0);
world.add(altar);

const halo = new THREE.Mesh(
    new THREE.RingGeometry(1.6, 1.72, 128),
    new THREE.MeshBasicMaterial({ color: 0xffe8b0, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
);
halo.rotation.x = Math.PI / 2;
halo.position.y = 1.6;
world.add(halo);

function makePillar(x) {
    const g = new THREE.CylinderGeometry(0.18, 0.22, 6, 32);
    const m = new THREE.MeshStandardMaterial({ color: 0xfff8e6, metalness: 0.4, roughness: 0.35, emissive: 0xf0dfa8, emissiveIntensity: 0.15 });
    const pillar = new THREE.Mesh(g, m);
    pillar.position.set(x, -1, -1.5);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.28, 32), m);
    cap.position.set(x, 2.15, -1.5);
    const base = cap.clone(); base.position.set(x, -4.15, -1.5); base.rotation.x = Math.PI;
    const grp = new THREE.Group(); grp.add(pillar, cap, base);
    return grp;
}
const pillarL = makePillar(-3.2); const pillarR = makePillar(3.2);
world.add(pillarL); world.add(pillarR);

const archCurve = new THREE.EllipseCurve(0, 2.15, 3.2, 1.6, Math.PI, 0, false, 0);
const archPts = archCurve.getPoints(80).map(p => new THREE.Vector3(p.x, p.y, -1.5));
const archGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(archPts), 100, 0.09, 12, false);
const arch = new THREE.Mesh(archGeo, new THREE.MeshStandardMaterial({ color: 0xf0d68a, metalness: 1, roughness: 0.25, emissive: 0x5a3d10, emissiveIntensity: 0.2 }));
world.add(arch);

function featherTex() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(1, 'rgba(255,240,210,0.05)');
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(64, 4);
    x.bezierCurveTo(120, 40, 110, 120, 64, 124);
    x.bezierCurveTo(18, 120, 8, 40, 64, 4);
    x.fill();
    x.strokeStyle = 'rgba(200,162,74,0.35)'; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(64, 10); x.lineTo(64, 120); x.stroke();
    for (let i = 0; i < 18; i++) {
        const y = 20 + i * 5;
        x.beginPath(); x.moveTo(64, y); x.lineTo(64 - 18 + Math.sin(i) * 4, y + 6); x.stroke();
        x.beginPath(); x.moveTo(64, y); x.lineTo(64 + 18 - Math.sin(i) * 4, y + 6); x.stroke();
    }
    return new THREE.CanvasTexture(c);
}
const fTex = featherTex();
const fGeo = new THREE.PlaneGeometry(0.5, 0.5);
const fMat = new THREE.MeshBasicMaterial({ map: fTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.9 });
const FEATHERS = 80;
const feathers = new THREE.InstancedMesh(fGeo, fMat, FEATHERS);
feathers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
const featherData = [];
const dummy = new THREE.Object3D();
for (let i = 0; i < FEATHERS; i++) {
    featherData.push({
        x: (Math.random() - 0.5) * 18, y: Math.random() * 12 + 3, z: (Math.random() - 0.5) * 8 - 2,
        vy: 0.006 + Math.random() * 0.012,
        swayAmp: 0.4 + Math.random() * 0.8, swaySpd: 0.4 + Math.random() * 0.6, ph: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI, vrz: (Math.random() - 0.5) * 0.02,
        tilt: Math.random() * Math.PI, s: 0.6 + Math.random() * 0.9
    });
}
scene.add(feathers);

const N = 800;
const dustGeo = new THREE.BufferGeometry();
const dpos = new Float32Array(N * 3);
const dust = [];
for (let i = 0; i < N; i++) {
    dpos[i * 3] = (Math.random() - 0.5) * 30;
    dpos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    dpos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 3;
    dust.push({ ph: Math.random() * Math.PI * 2, amp: 0.3 + Math.random() * 0.9, spd: 0.3 + Math.random() * 0.6 });
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
const dustTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,240,200,1)');
    g.addColorStop(0.3, 'rgba(230,201,130,0.7)');
    g.addColorStop(1, 'rgba(255,240,200,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
})();
const dustMat = new THREE.PointsMaterial({ size: 0.12, map: dustTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe8b0, opacity: 0.9 });
const dustPts = new THREE.Points(dustGeo, dustMat);
scene.add(dustPts);

function makeDove() {
    const g = new THREE.Group();
    const bodyG = new THREE.SphereGeometry(0.08, 10, 10);
    const bodyM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, emissive: 0xfff2d0, emissiveIntensity: 0.2 });
    const body = new THREE.Mesh(bodyG, bodyM); g.add(body);
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(0.35, 0.15, 0.6, 0); wingShape.quadraticCurveTo(0.35, -0.02, 0, 0);
    const wingG = new THREE.ShapeGeometry(wingShape);
    const wingM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, side: THREE.DoubleSide, emissive: 0xfff2d0, emissiveIntensity: 0.2 });
    const wL = new THREE.Mesh(wingG, wingM); wL.position.set(0.05, 0, 0);
    const wR = new THREE.Mesh(wingG, wingM); wR.position.set(-0.05, 0, 0); wR.rotation.y = Math.PI;
    g.add(wL); g.add(wR);
    g.userData = { wL, wR };
    return g;
}
const doves = [];
for (let i = 0; i < 5; i++) {
    const d = makeDove();
    const orbit = 2.5 + i * 0.35;
    d.userData.orbit = orbit;
    d.userData.speed = 0.25 + i * 0.08;
    d.userData.phase = i * 1.2;
    d.userData.yBase = 1.6 + (i - 2) * 0.4;
    world.add(d);
    doves.push(d);
}

function petalTex() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 26, 4, 32, 32, 30);
    g.addColorStop(0, '#fff2ee'); g.addColorStop(0.5, '#f2c9be'); g.addColorStop(1, 'rgba(210,140,120,0)');
    x.fillStyle = g; x.beginPath();
    x.moveTo(32, 6); x.bezierCurveTo(58, 20, 56, 58, 32, 60); x.bezierCurveTo(8, 58, 6, 20, 32, 6); x.fill();
    return new THREE.CanvasTexture(c);
}
const pTex = petalTex();
const pGeo = new THREE.PlaneGeometry(0.24, 0.24);
const pMat = new THREE.MeshBasicMaterial({ map: pTex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
const PET = 140;
const petals = new THREE.InstancedMesh(pGeo, pMat, PET);
petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
const pData = [];
for (let i = 0; i < PET; i++) {
    pData.push({
        x: (Math.random() - 0.5) * 16, y: Math.random() * 10 + 2, z: (Math.random() - 0.5) * 8 - 2,
        vy: 0.005 + Math.random() * 0.01, vx: (Math.random() - 0.5) * 0.005,
        rx: Math.random() * Math.PI, ry: Math.random() * Math.PI, rz: Math.random() * Math.PI,
        vrx: (Math.random() - 0.5) * 0.03, vry: (Math.random() - 0.5) * 0.03, ph: Math.random() * Math.PI * 2, s: 0.5 + Math.random() * 0.8
    });
}
scene.add(petals);

const mouse = { tx: 0, ty: 0, x: 0, y: 0 };
addEventListener('pointermove', e => {
    mouse.tx = e.clientX / innerWidth - 0.5;
    mouse.ty = e.clientY / innerHeight - 0.5;
});

let scrollP = 0;
let scrollVel = 0;
let lastY = 0;
addEventListener('scroll', () => {
    const max = document.body.scrollHeight - innerHeight;
    scrollP = Math.min(1, Math.max(0, scrollY / max));
    scrollVel = (scrollY - lastY);
    lastY = scrollY;
    var prog = document.getElementById('progress');
    if (prog) prog.style.width = (scrollP * 100) + '%';
});

addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});

const keyframes = [
    { p: 0.00, pos: [0, 1.4, 10], look: [0, 1.6, 0] },
    { p: 0.14, pos: [-1.2, 2.0, 6], look: [0, 1.6, 0] },
    { p: 0.30, pos: [1.6, 1.2, 5.2], look: [0, 1.6, 0] },
    { p: 0.46, pos: [0, 3.2, 4.5], look: [0, 1.5, 0] },
    { p: 0.62, pos: [-1.8, 1.0, 4], look: [0, 1.6, 0] },
    { p: 0.80, pos: [1.4, 2.4, 4.2], look: [0, 1.6, 0] },
    { p: 1.00, pos: [0, 4.5, 8], look: [0, 2.4, 0] }
];
function sample(t) {
    for (let i = 0; i < keyframes.length - 1; i++) {
        const a = keyframes[i], b = keyframes[i + 1];
        if (t >= a.p && t <= b.p) {
            const u = (t - a.p) / (b.p - a.p);
            const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
            return {
                pos: [a.pos[0] + (b.pos[0] - a.pos[0]) * e, a.pos[1] + (b.pos[1] - a.pos[1]) * e, a.pos[2] + (b.pos[2] - a.pos[2]) * e],
                look: [a.look[0] + (b.look[0] - a.look[0]) * e, a.look[1] + (b.look[1] - a.look[1]) * e, a.look[2] + (b.look[2] - a.look[2]) * e]
            };
        }
    }
    const last = keyframes[keyframes.length - 1];
    return { pos: last.pos, look: last.look };
}

const camTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

const clock = new THREE.Clock();
function animate() {
    const t = clock.getElapsedTime();

    ring1.rotation.y += 0.006 + Math.abs(scrollVel) * 0.0006;
    ring1.rotation.x = Math.sin(t * 0.5) * 0.15;
    ring2.rotation.y -= 0.005 + Math.abs(scrollVel) * 0.0005;
    ring2.rotation.z = Math.cos(t * 0.4) * 0.15 + Math.PI / 2.2;
    altar.position.y = 1.6 + Math.sin(t * 0.8) * 0.08;
    altar.rotation.y = scrollP * Math.PI * 1.5;

    const pulse = 1 + Math.sin(t * 1.5) * 0.05;
    halo.scale.set(pulse, pulse, 1);
    halo.material.opacity = 0.55 + Math.sin(t * 1.5) * 0.15;
    halo.rotation.z = t * 0.1;

    arch.rotation.z = Math.sin(t * 0.3) * 0.02;

    cloudData.forEach((d, i) => {
        d.x += d.vx;
        if (d.x > 18) d.x = -18;
        d.base.position.x = d.x;
        d.base.position.y = d.y + Math.sin(t * 0.3 + i) * 0.15 - scrollP * 1.5 * (1 + i * 0.05);
        d.base.lookAt(camera.position);
    });

    const scrollBoost = 1 + Math.min(3, Math.abs(scrollVel) * 0.05);
    for (let i = 0; i < FEATHERS; i++) {
        const d = featherData[i];
        d.y -= d.vy * scrollBoost;
        d.x += Math.sin(t * d.swaySpd + d.ph) * 0.006;
        d.rz += d.vrz;
        if (d.y < -5) { d.y = 10 + Math.random() * 3; d.x = (Math.random() - 0.5) * 18; }
        dummy.position.set(d.x, d.y, d.z);
        dummy.rotation.set(Math.sin(t * d.swaySpd + d.ph) * 0.3, d.tilt, d.rz);
        dummy.scale.setScalar(d.s);
        dummy.updateMatrix();
        feathers.setMatrixAt(i, dummy.matrix);
    }
    feathers.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < PET; i++) {
        const d = pData[i];
        d.y -= d.vy * scrollBoost;
        d.x += d.vx + Math.sin(t * 0.6 + d.ph) * 0.004;
        d.rx += d.vrx; d.ry += d.vry;
        if (d.y < -4) { d.y = 8 + Math.random() * 3; d.x = (Math.random() - 0.5) * 16; }
        dummy.position.set(d.x, d.y, d.z);
        dummy.rotation.set(d.rx, d.ry, d.rz);
        dummy.scale.setScalar(d.s);
        dummy.updateMatrix();
        petals.setMatrixAt(i, dummy.matrix);
    }
    petals.instanceMatrix.needsUpdate = true;

    const arr = dustGeo.attributes.position.array;
    for (let i = 0; i < N; i++) {
        const s = dust[i];
        arr[i * 3 + 1] += Math.sin(t * s.spd + s.ph) * 0.003;
        arr[i * 3] += Math.cos(t * s.spd * 0.7 + s.ph) * 0.002;
        if (arr[i * 3 + 1] > 10) arr[i * 3 + 1] = -8;
    }
    dustGeo.attributes.position.needsUpdate = true;

    doves.forEach(d => {
        const u = d.userData;
        const a = t * u.speed + u.phase;
        d.position.set(Math.cos(a) * u.orbit, u.yBase + Math.sin(t * 1.5 + u.phase) * 0.15, Math.sin(a) * u.orbit);
        d.rotation.y = -a + Math.PI / 2;
        const flap = Math.sin(t * 8 + u.phase) * 0.9;
        u.wL.rotation.y = -flap;
        u.wR.rotation.y = Math.PI + flap;
    });

    const kf = sample(scrollP);
    camTarget.set(kf.pos[0], kf.pos[1], kf.pos[2]);
    lookTarget.set(kf.look[0], kf.look[1], kf.look[2]);
    camera.position.lerp(camTarget, 0.08);
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    const look = lookTarget.clone();
    look.x += mouse.x * 0.6; look.y += mouse.y * 0.4;
    camera.position.x += mouse.x * 0.4;
    camera.lookAt(look);

    scrollVel *= 0.92;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

setTimeout(function () { var l = el('loader'); if (l) l.classList.add('hide'); }, 250);

applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
renderTenant({});

var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(function (node) { io.observe(node); });

var chL = el('chapL'), chR = el('chapR');
addEventListener('scroll', function () {
    var show = scrollY > 60 && scrollP < 0.95;
    if (chL) chL.classList.toggle('show', show);
    if (chR) chR.classList.toggle('show', show);
});

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
    var freqs = [261.63, 329.63, 392.00, 493.88, 587.33];
    freqs.forEach(function (f, i) {
        var o = audioCtx.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f;
        var g = audioCtx.createGain(); g.gain.value = 0;
        var lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.08 + i * 0.02;
        var lfoG = audioCtx.createGain(); lfoG.gain.value = 0.06;
        lfo.connect(lfoG).connect(g.gain);
        o.connect(g).connect(master);
        o.start(); lfo.start();
        g.gain.linearRampToValueAtTime(0.16, audioCtx.currentTime + 3);
    });
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
