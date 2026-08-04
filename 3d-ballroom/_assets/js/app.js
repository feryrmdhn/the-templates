import * as THREE from 'three';

var FALLBACK_DATA = window.FALLBACK['3d-ballroom'];
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
function fmtTime(iso) { var d = new Date(iso); return pad2(d.getHours()) + '.' + pad2(d.getMinutes()); }

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
            '<a href="' + fb + '" target="_blank" rel="noopener noreferrer" class="tenant-social-btn" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>'
            + '<a href="' + ig + '" target="_blank" rel="noopener noreferrer" class="tenant-social-btn" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>';
    }
}

function renderWishes(wishesData) {
    var c = el('wishes-list');
    if (!c) return;
    if (!wishesData || !wishesData.length) {
        c.innerHTML = '<div class="wishes-empty">Belum ada ucapan</div>'; return;
    }
    c.innerHTML = wishesData.map(function (w) {
        return '<div class="wish-item"><div class="wish-name">' + sanitize(w.guest_name || w.name || '?') + '</div>'
            + '<div class="wish-msg">' + sanitize(w.message) + '</div></div>';
    }).join('');
}

function renderPayment(paymentData) {
    var section = el('payment-section');
    var list = el('payment-list');
    if (!section || !list) return;
    section.style.display = 'block';
    list.innerHTML = paymentData.map(function (p) {
        return '<div class="payment-item">'
            + '<img src="/payment/' + sanitize(p.method) + '.png" alt="' + sanitize(p.method) + '" onerror="this.style.display=\'none\'">'
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
    var d = data, f = FALLBACK_DATA;
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
        DAYS_ID[akad.getDay()] + ', ' + akad.getDate() + ' ' + MONTHS_ID[akad.getMonth()] + ' ' + akad.getFullYear() + ' \u00B7 ' + fmtTime(d.akadDatetime || f.akadDatetime);
    if (el('akad-venue')) el('akad-venue').textContent = d.akadVenue || f.akadVenue;
    if (el('akad-address')) el('akad-address').textContent = d.akadAddress || f.akadAddress;

    if (el('reception-date')) el('reception-date').textContent =
        DAYS_ID[recep.getDay()] + ', ' + recep.getDate() + ' ' + MONTHS_ID[recep.getMonth()] + ' ' + recep.getFullYear() + ' \u00B7 ' + fmtTime(d.receptionDatetime || f.receptionDatetime);
    if (el('reception-venue')) el('reception-venue').textContent = d.receptionVenue || f.receptionVenue;
    if (el('reception-address')) el('reception-address').textContent = d.receptionAddress || f.receptionAddress;

    if (el('gallery-desc')) el('gallery-desc').textContent = d.galleryDesc || f.galleryDesc;
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
        if (srcNode && srcNode.getAttribute('src') !== newSrc) {
            var wasPlaying = !audio.paused;
            srcNode.src = newSrc; audio.load();
            if (wasPlaying) audio.play().catch(function () { });
        }
    }

    if (!_projectId) renderWishes((d.wishes && d.wishes.length) ? d.wishes : f.wishes);
    var payment = (d.payment && d.payment.length) ? d.payment : f.payment;
    if (payment && payment.length) renderPayment(payment);
}

function loadComments() {
    if (!_projectId || !_apiBaseUrl) return;
    getComments(_apiBaseUrl, _projectId, 100, 0)
        .then(function (response) {
            renderWishes((response && response.data && response.data.comments) ? response.data.comments : []);
        })
        .catch(function () { renderWishes([]); });
}

function showNotification(message, type) {
    var t = el('toast-br');
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
    if (!_projectId || !_apiBaseUrl) { showNotification('Tidak dapat mengirim ucapan saat ini', 'error'); return; }
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Mengirim...'; }
    postComment(_apiBaseUrl, { project_id: _projectId, guest_name: sanitize(name), message: sanitize(message) })
        .then(function (response) {
            if (response && response.success) {
                if (nameInput) nameInput.value = '';
                if (msgInput) msgInput.value = '';
                loadComments();
                showNotification('Ucapan berhasil dikirim!', 'success');
            } else { showNotification('Gagal mengirim ucapan. Silakan coba lagi.', 'error'); }
        })
        .catch(function () { showNotification('Gagal mengirim ucapan. Silakan coba lagi.', 'error'); })
        .finally(function () {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Kirim RSVP'; }
        });
}

window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'INVITATION_DATA') return;
    var payload = e.data.payload;
    var guest = payload.guestName || payload.guest;
    if (el('guest')) el('guest').textContent = guest || FALLBACK_DATA.guestName;
    if (payload.mode === 'preview') {
        applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
        renderTenant({}); notifyLoaded(); return;
    }
    var apiBaseUrl = payload.apiBaseUrl;
    var tenantSlug = payload.tenantSlug;
    var projectSlug = payload.projectSlug;
    if (!apiBaseUrl || !tenantSlug || !projectSlug) {
        applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
        renderTenant({}); notifyLoaded(); return;
    }
    Promise.all([
        getInvitation(apiBaseUrl, tenantSlug, projectSlug).catch(function () { return null; }),
        getTenantLogo(apiBaseUrl, tenantSlug).catch(function () { return null; })
    ]).then(function (results) {
        var response = results[0], logoResp = results[1];
        renderTenant((logoResp && logoResp.data) ? logoResp.data : {});
        if (!response) {
            applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
            notifyLoaded(); return;
        }
        var content = (response.data && response.data.content) ? response.data.content : {};
        var merged = {};
        Object.keys(FALLBACK_DATA).forEach(function (key) {
            var apiVal = content[key];
            merged[key] = (apiVal !== null && apiVal !== undefined && apiVal !== '') ? apiVal : FALLBACK_DATA[key];
        });
        merged.guestName = guest || content.guest_name || FALLBACK_DATA.guestName;
        if (response.data && response.data.song_url) merged.music = response.data.song_url;
        if (response.data && response.data.id) { _projectId = response.data.id; _apiBaseUrl = apiBaseUrl; loadComments(); }
        applyData(merged); notifyLoaded();
    }).catch(function () {
        applyData(Object.assign({}, FALLBACK_DATA, { guestName: guest || FALLBACK_DATA.guestName }));
        renderTenant({}); notifyLoaded();
    });
});

var _url = new URL(window.location.href);
var _u = _url.searchParams.get('to') || _url.searchParams.get('name') || '';
if (_u) _u = _u.replace(/_/g, ' ');
if (_u && el('guest')) el('guest').textContent = _u;

const IS_MOBILE = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

const stage = document.getElementById('stage');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x2a1a0c, 30, IS_MOBILE ? 80 : 110);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 4, 40);

const renderer = new THREE.WebGLRenderer({
    antialias: !IS_MOBILE,
    alpha: true,
    powerPreference: 'high-performance'
});

renderer.setPixelRatio(IS_MOBILE ? Math.min(devicePixelRatio, 1.0) : Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
stage.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffe8c0, 0x3a1a08, 1.4));

const mainLight = new THREE.DirectionalLight(0xffd480, 1.2);
mainLight.position.set(2, 14, 10);
scene.add(mainLight);

const stageSpot = new THREE.PointLight(0xffd48a, 1.8, 35);
stageSpot.position.set(0, 8, -42);
scene.add(stageSpot);

const world = new THREE.Group();
scene.add(world);

const MAT = {
    floor: new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 0.35, metalness: 0.15 }),
    carpet: new THREE.MeshStandardMaterial({ color: 0x6a1a2a, roughness: 0.85 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xd4a94a, metalness: 0.8, roughness: 0.3, emissive: 0x5a3a10, emissiveIntensity: 0.3 }),
    wall: new THREE.MeshStandardMaterial({ color: 0x3a1e0a, roughness: 0.8 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x2a1408, roughness: 0.9 }),
    marble: new THREE.MeshStandardMaterial({ color: 0xd6cdb8, roughness: 0.5, metalness: 0.1 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd4a94a, metalness: 0.9, roughness: 0.2, emissive: 0x6a3a10, emissiveIntensity: 0.35 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }),
    cloth: new THREE.MeshStandardMaterial({ color: 0xf4e4c8, roughness: 0.9 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x14141e, roughness: 0.7 }),
    red: new THREE.MeshStandardMaterial({ color: 0xa82a3a, roughness: 0.85 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6a3418, roughness: 0.6 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xedb48a, roughness: 0.85 }),
    ivory: new THREE.MeshStandardMaterial({ color: 0xf5efd8, roughness: 0.8 }),
    candle: new THREE.MeshBasicMaterial({ color: 0xffcf6a }),
    crystal: new THREE.MeshStandardMaterial({ color: 0xfff5d8, transparent: true, opacity: 0.8, emissive: 0xffe5a0, emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.1 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.1, side: THREE.DoubleSide }),
    petal: new THREE.MeshStandardMaterial({ color: 0xffb8c8, roughness: 0.8, side: THREE.DoubleSide }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x3a6b3a, roughness: 0.9 }),
    beam: new THREE.MeshBasicMaterial({ color: 0xfff2c8, transparent: true, opacity: 0.10, depthWrite: false, side: THREE.DoubleSide }),
    veil: new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, roughness: 0.9 }),
};

const DRESS_MATS = [0x5a1a2a, 0x1a2a5a, 0x2d5b3a, 0x8b3a6a, 0xd4a94a, 0x2a2a2a, 0xf5e4c0, 0x6a3a1a, 0x8b1a2a]
    .map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }));

const FLOWER_MATS = [0xffffff, 0xffb5c8, 0xffe5a0, 0xff6a8a]
    .map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }));

const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 200), MAT.floor);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -50;
world.add(floor);

const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 200), MAT.carpet);
carpet.rotation.x = -Math.PI / 2;
carpet.position.set(0, 0.02, -50);
world.add(carpet);

for (const sx of [-1.75, 1.75]) {
    const trim = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 200), MAT.trim);
    trim.rotation.x = -Math.PI / 2;
    trim.position.set(sx, 0.03, -50);
    world.add(trim);
}

for (const sx of [-14, 14]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(200, 20), MAT.wall);
    wall.position.set(sx, 10, -50);
    wall.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2;
    world.add(wall);
}
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 20), MAT.wall);
backWall.position.set(0, 10, -55);
world.add(backWall);

const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(28, 200), MAT.ceiling);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.set(0, 20, -50);
world.add(ceiling);

const CHANDELIER_POS = [
    [0, 15.5, 10],
    [0, 15.5, -20],
    [0, 15.5, -50],
];
const cryGeo = new THREE.OctahedronGeometry(0.14, 0);

const cryInst = new THREE.InstancedMesh(cryGeo, MAT.crystal, CHANDELIER_POS.length * 16);
const flameGeo = new THREE.SphereGeometry(0.14, 6, 6);

const flameInst = new THREE.InstancedMesh(flameGeo, MAT.candle, CHANDELIER_POS.length * 8);
const torusMat = MAT.gold;
const _dummy = new THREE.Object3D();
let _ci = 0, _fi = 0;

CHANDELIER_POS.forEach(([cx, cy, cz]) => {

    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), MAT.wall);
    chain.position.set(cx, cy - 3.5, cz); world.add(chain);

    const frame = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.1, 6, 20), torusMat);
    frame.rotation.x = Math.PI / 2; frame.position.set(cx, cy, cz); world.add(frame);
    const frame2 = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 6, 16), torusMat);
    frame2.rotation.x = Math.PI / 2; frame2.position.set(cx, cy - 0.3, cz); world.add(frame2);

    for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        _dummy.position.set(cx + Math.cos(a) * 1.4, cy - 0.15, cz + Math.sin(a) * 1.4);
        _dummy.scale.setScalar(1); _dummy.updateMatrix();
        cryInst.setMatrixAt(_ci++, _dummy.matrix);
    }

    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        _dummy.position.set(cx + Math.cos(a) * 1.4, cy + 0.15, cz + Math.sin(a) * 1.4);
        _dummy.scale.setScalar(1); _dummy.updateMatrix();
        flameInst.setMatrixAt(_fi++, _dummy.matrix);
    }
});
cryInst.instanceMatrix.needsUpdate = true;
flameInst.instanceMatrix.needsUpdate = true;
world.add(cryInst); world.add(flameInst);

const TABLE_POSITIONS = [];
for (let row = 0; row < 6; row++) {
    const z = 5 - row * 11;
    for (const sx of [-6.5, 6.5]) TABLE_POSITIONS.push([sx, z]);
}
const TABLE_COUNT = TABLE_POSITIONS.length;

const tClothGeo = new THREE.CylinderGeometry(1.5, 1.7, 1.4, 16);
const tTopGeo = new THREE.CylinderGeometry(1.55, 1.55, 0.08, 16);
const tVaseGeo = new THREE.CylinderGeometry(0.15, 0.22, 0.4, 8);
const tClothInst = new THREE.InstancedMesh(tClothGeo, MAT.cloth, TABLE_COUNT);
const tTopInst = new THREE.InstancedMesh(tTopGeo, MAT.white, TABLE_COUNT);
const tVaseInst = new THREE.InstancedMesh(tVaseGeo, MAT.gold, TABLE_COUNT);

TABLE_POSITIONS.forEach(([sx, z], idx) => {
    _dummy.position.set(sx, 0.7, z); _dummy.rotation.set(0, 0, 0); _dummy.scale.setScalar(1); _dummy.updateMatrix();
    tClothInst.setMatrixAt(idx, _dummy.matrix);
    _dummy.position.set(sx, 1.44, z); _dummy.updateMatrix();
    tTopInst.setMatrixAt(idx, _dummy.matrix);
    _dummy.position.set(sx, 1.7, z); _dummy.updateMatrix();
    tVaseInst.setMatrixAt(idx, _dummy.matrix);
});
tClothInst.instanceMatrix.needsUpdate = true;
tTopInst.instanceMatrix.needsUpdate = true;
tVaseInst.instanceMatrix.needsUpdate = true;
world.add(tClothInst); world.add(tTopInst); world.add(tVaseInst);

const flGeo = new THREE.SphereGeometry(0.13, 6, 6);
const FLOWERS_PER_TABLE = 5;
FLOWER_MATS.forEach((mat, mi) => {
    const count = TABLE_COUNT * FLOWERS_PER_TABLE;
    const fInst = new THREE.InstancedMesh(flGeo, mat, count);
    let fi2 = 0;
    TABLE_POSITIONS.forEach(([sx, z]) => {
        for (let i = 0; i < FLOWERS_PER_TABLE; i++) {
            if ((i % FLOWER_MATS.length) !== mi) { fi2++; continue; }
            const a = (i / FLOWERS_PER_TABLE) * Math.PI * 2;
            _dummy.position.set(sx + Math.cos(a) * 0.18, 2.05, z + Math.sin(a) * 0.18);
            _dummy.scale.setScalar(1); _dummy.updateMatrix();
            fInst.setMatrixAt(fi2++, _dummy.matrix);
        }
    });
    fInst.instanceMatrix.needsUpdate = true;
    world.add(fInst);
});

const candleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6);
const candleFlameGeo = new THREE.SphereGeometry(0.06, 5, 5);
const CANDLES_PER_TABLE = 3;
const candleInst = new THREE.InstancedMesh(candleGeo, MAT.ivory, TABLE_COUNT * CANDLES_PER_TABLE);
const candleFlameInst = new THREE.InstancedMesh(candleFlameGeo, MAT.candle, TABLE_COUNT * CANDLES_PER_TABLE);
let candleIdx = 0;
TABLE_POSITIONS.forEach(([sx, z]) => {
    for (let i = 0; i < CANDLES_PER_TABLE; i++) {
        const a = (i / CANDLES_PER_TABLE) * Math.PI * 2;
        _dummy.position.set(sx + Math.cos(a) * 0.9, 1.65, z + Math.sin(a) * 0.9);
        _dummy.scale.setScalar(1); _dummy.updateMatrix();
        candleInst.setMatrixAt(candleIdx, _dummy.matrix);
        _dummy.position.set(sx + Math.cos(a) * 0.9, 1.95, z + Math.sin(a) * 0.9);
        _dummy.updateMatrix();
        candleFlameInst.setMatrixAt(candleIdx, _dummy.matrix);
        candleIdx++;
    }
});
candleInst.instanceMatrix.needsUpdate = true;
candleFlameInst.instanceMatrix.needsUpdate = true;
world.add(candleInst); world.add(candleFlameInst);

const plateGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.03, 12);
const PLATES_PER_TABLE = 6;
const plateInst = new THREE.InstancedMesh(plateGeo, MAT.white, TABLE_COUNT * PLATES_PER_TABLE);
let plateIdx = 0;
TABLE_POSITIONS.forEach(([sx, z]) => {
    for (let i = 0; i < PLATES_PER_TABLE; i++) {
        const a = (i / PLATES_PER_TABLE) * Math.PI * 2;
        _dummy.position.set(sx + Math.cos(a) * 1.15, 1.5, z + Math.sin(a) * 1.15);
        _dummy.scale.setScalar(1); _dummy.updateMatrix();
        plateInst.setMatrixAt(plateIdx++, _dummy.matrix);
    }
});
plateInst.instanceMatrix.needsUpdate = true;
world.add(plateInst);

const CHAIRS_PER_TABLE = 6;
const TOTAL_CHAIRS = TABLE_COUNT * CHAIRS_PER_TABLE;
const chairSeatGeo = new THREE.BoxGeometry(0.6, 0.12, 0.6);
const chairBackGeo = new THREE.BoxGeometry(0.6, 0.85, 0.08);
const chairSeatInst = new THREE.InstancedMesh(chairSeatGeo, MAT.gold, TOTAL_CHAIRS);
const chairBackInst = new THREE.InstancedMesh(chairBackGeo, MAT.gold, TOTAL_CHAIRS);
let chairIdx = 0;

TABLE_POSITIONS.forEach(([sx, z]) => {
    for (let i = 0; i < CHAIRS_PER_TABLE; i++) {
        const a = (i / CHAIRS_PER_TABLE) * Math.PI * 2;
        const cx = sx + Math.cos(a) * 2.3;
        const cz = z + Math.sin(a) * 2.3;

        _dummy.position.set(cx, 0.55, cz);
        _dummy.rotation.set(0, -a + Math.PI, 0);
        _dummy.scale.setScalar(1); _dummy.updateMatrix();
        chairSeatInst.setMatrixAt(chairIdx, _dummy.matrix);

        _dummy.position.set(cx - Math.cos(a) * 0.26, 0.95, cz - Math.sin(a) * 0.26);
        _dummy.updateMatrix();
        chairBackInst.setMatrixAt(chairIdx, _dummy.matrix);
        chairIdx++;
    }
});
chairSeatInst.instanceMatrix.needsUpdate = true;
chairBackInst.instanceMatrix.needsUpdate = true;
world.add(chairSeatInst); world.add(chairBackInst);

const guestBodyGeo = new THREE.CapsuleGeometry(0.28, 0.75, 3, 6);
const guestHeadGeo = new THREE.SphereGeometry(0.24, 8, 8);
const GUESTS_PER_COLOR = 12;

const guestBodyInsts = DRESS_MATS.map(mat =>
    new THREE.InstancedMesh(guestBodyGeo, mat, GUESTS_PER_COLOR)
);
const totalGuestHeads = DRESS_MATS.length * GUESTS_PER_COLOR;
const guestHeadInst = new THREE.InstancedMesh(guestHeadGeo, MAT.skin, totalGuestHeads);

let headIdx = 0;
const colorCounts = DRESS_MATS.map(() => 0);

function placeGuest(x, y, z, rotY, seated) {
    const ci = headIdx % DRESS_MATS.length;
    if (colorCounts[ci] >= GUESTS_PER_COLOR) return;
    const bodyY = seated ? y + 1.05 : y + 0.9;
    const headY = seated ? y + 1.85 : y + 1.75;
    _dummy.position.set(x, bodyY, z);
    _dummy.rotation.set(0, rotY, 0);
    _dummy.scale.setScalar(1); _dummy.updateMatrix();
    guestBodyInsts[ci].setMatrixAt(colorCounts[ci], _dummy.matrix);
    _dummy.position.set(x, headY, z);
    _dummy.updateMatrix();
    guestHeadInst.setMatrixAt(headIdx, _dummy.matrix);
    colorCounts[ci]++;
    headIdx++;
}

TABLE_POSITIONS.forEach(([sx, z]) => {
    for (let i = 0; i < CHAIRS_PER_TABLE; i++) {
        if (Math.random() < 0.25) continue;
        const a = (i / CHAIRS_PER_TABLE) * Math.PI * 2;
        placeGuest(sx + Math.cos(a) * 2.1, 0, z + Math.sin(a) * 2.1, -a + Math.PI, true);
    }
});

for (let i = 0; i < 30 && headIdx < totalGuestHeads; i++) {
    let x, z;
    const region = Math.random();
    if (region < 0.3) {
        x = (Math.random() - 0.5) * 10; z = 20 + Math.random() * 8;
        if (Math.abs(x) < 2.5) x += x < 0 ? -3 : 3;
    } else if (region < 0.65) {
        x = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 3);
        z = 5 - Math.random() * 55;
    } else {
        x = (Math.random() - 0.5) * 8; z = -28 + Math.random() * 5;
    }
    placeGuest(x, 0, z, Math.random() * Math.PI * 2, false);
}

guestBodyInsts.forEach(inst => { inst.instanceMatrix.needsUpdate = true; world.add(inst); });
guestHeadInst.instanceMatrix.needsUpdate = true;
world.add(guestHeadInst);

const stagePlatform = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 6), MAT.wood);
stagePlatform.position.set(0, 0.4, -45); world.add(stagePlatform);

const stageCarpet = new THREE.Mesh(new THREE.PlaneGeometry(15, 5.5), MAT.red);
stageCarpet.rotation.x = -Math.PI / 2;
stageCarpet.position.set(0, 0.81, -45); world.add(stageCarpet);

const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), MAT.cloth);
backdrop.position.set(0, 4.8, -47.9); world.add(backdrop);

{
    const archMat = MAT.ivory;
    const pL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6.5, 8), archMat);
    pL.position.set(-3.5, 4, -47.6); world.add(pL);
    const pR = pL.clone(); pR.position.set(3.5, 4, -47.6); world.add(pR);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.15, 6, 20, Math.PI), archMat);
    arch.position.set(0, 7.2, -47.6); world.add(arch);

    const archFlGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const ARCH_FLOWERS_TOTAL = 72;
    const archFlInst = new THREE.InstancedMesh(archFlGeo, FLOWER_MATS[1], ARCH_FLOWERS_TOTAL);
    let afi = 0;
    for (const sx of [-3.5, 3.5]) {
        for (let y = 0.5; y < 7 && afi < ARCH_FLOWERS_TOTAL; y += 0.4) {
            _dummy.position.set(sx + (Math.random() - 0.5) * 0.5, y, -47.6 + (Math.random() - 0.5) * 0.4);
            _dummy.scale.setScalar(1); _dummy.updateMatrix();
            archFlInst.setMatrixAt(afi++, _dummy.matrix);
        }
    }
    for (let a = 0; a <= Math.PI && afi < ARCH_FLOWERS_TOTAL; a += 0.28) {
        _dummy.position.set(Math.cos(a + Math.PI) * 3.4, 7.2 + Math.sin(a + Math.PI) * 3.4, -47.6);
        _dummy.scale.setScalar(1); _dummy.updateMatrix();
        archFlInst.setMatrixAt(afi++, _dummy.matrix);
    }
    archFlInst.count = afi;
    archFlInst.instanceMatrix.needsUpdate = true;
    world.add(archFlInst);
}

for (let i = 0; i < 5; i++) {
    const parCan = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.45, 8), MAT.wall);
    parCan.position.set(-6 + i * 3, 10, -46); parCan.rotation.x = Math.PI / 4; world.add(parCan);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4, 8, 1, true), MAT.beam);
    beam.position.set(-6 + i * 3, 7, -45.5); beam.rotation.x = Math.PI; world.add(beam);
}

const petalGeo = new THREE.CircleGeometry(0.08, 5);
const petalInst = new THREE.InstancedMesh(petalGeo, MAT.petal, 50);
for (let i = 0; i < 50; i++) {
    _dummy.position.set((Math.random() - 0.5) * 10, 0.82, -45 + (Math.random() - 0.5) * 4);
    _dummy.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI);
    _dummy.scale.setScalar(1); _dummy.updateMatrix();
    petalInst.setMatrixAt(i, _dummy.matrix);
}
petalInst.instanceMatrix.needsUpdate = true;
world.add(petalInst);

const cndlStemGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8);
const cndlArmGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6);
const cndlBodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
const cndlFlGeo = new THREE.SphereGeometry(0.09, 6, 6);

const cndlBodyInst = new THREE.InstancedMesh(cndlBodyGeo, MAT.ivory, 6);
const cndlFlameInst = new THREE.InstancedMesh(cndlFlGeo, MAT.candle, 6);
let ci2 = 0;
for (const sx of [-5.5, 5.5]) {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.3, 8), MAT.gold);
    base.position.set(sx, 0.95, -45); world.add(base);
    const stem = new THREE.Mesh(cndlStemGeo, MAT.gold);
    stem.position.set(sx, 2.3, -45); world.add(stem);
    for (let i = -1; i <= 1; i++) {
        const arm = new THREE.Mesh(cndlArmGeo, MAT.gold);
        arm.rotation.z = Math.PI / 2; arm.position.set(sx + i * 0.5, 3.5, -45); world.add(arm);
        _dummy.position.set(sx + i * 0.35, 3.85, -45); _dummy.rotation.set(0, 0, 0); _dummy.scale.setScalar(1); _dummy.updateMatrix();
        cndlBodyInst.setMatrixAt(ci2, _dummy.matrix);
        _dummy.position.set(sx + i * 0.35, 4.2, -45); _dummy.updateMatrix();
        cndlFlameInst.setMatrixAt(ci2, _dummy.matrix);
        ci2++;
    }
}
cndlBodyInst.instanceMatrix.needsUpdate = true;
cndlFlameInst.instanceMatrix.needsUpdate = true;
world.add(cndlBodyInst); world.add(cndlFlameInst);

{
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 7, 12);
    const pL = new THREE.Mesh(pillarGeo, MAT.ivory);
    pL.position.set(-3, 3.5, 32); world.add(pL);
    const pR = pL.clone(); pR.position.set(3, 3.5, 32); world.add(pR);
    const top = new THREE.Mesh(new THREE.TorusGeometry(3, 0.5, 6, 16, Math.PI), MAT.gold);
    top.position.set(0, 7, 32); world.add(top);

    const entFlInst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 5, 5), FLOWER_MATS[0], 30);
    for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI;
        _dummy.position.set(Math.cos(a + Math.PI) * 3.1, 4 + Math.sin(a + Math.PI) * 3.1 + 3, 32);
        _dummy.scale.setScalar(1); _dummy.updateMatrix();
        entFlInst.setMatrixAt(i, _dummy.matrix);
    }
    entFlInst.instanceMatrix.needsUpdate = true;
    world.add(entFlInst);
}

{
    const bride = new THREE.Group();
    const bSkirt = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.7, 16, 1, true), MAT.white);
    bSkirt.position.set(0, 0.85, 0);
    const bBodice = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.6, 3, 8), MAT.white);
    bBodice.position.set(0, 1.95, 0);
    const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), MAT.skin);
    bHead.position.set(0, 2.6, 0);
    const bVeil = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4), MAT.veil);
    bVeil.position.set(0, 1.5, -0.25);
    bride.add(bSkirt, bBodice, bHead, bVeil);
    bride.position.set(-1.1, 0.8, -44.5); bride.rotation.y = 0.15;
    world.add(bride);
}
{
    const groom = new THREE.Group();
    const gLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.05, 8), MAT.dark);
    gLegL.position.set(-0.14, 0.55, 0);
    const gLegR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.05, 8), MAT.dark);
    gLegR.position.set(0.14, 0.55, 0);
    const gJacket = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.75, 3, 8), MAT.dark);
    gJacket.position.set(0, 1.55, 0);
    const gHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), MAT.skin);
    gHead.position.set(0, 2.35, 0);
    groom.add(gLegL, gLegR, gJacket, gHead);
    groom.position.set(1.1, 0.8, -44.5); groom.rotation.y = -0.15;
    world.add(groom);
}

const partGeo = new THREE.BufferGeometry();

const N = IS_MOBILE ? 120 : 200;
const ppos = new Float32Array(N * 3);
const partData = [];
for (let i = 0; i < N; i++) {
    ppos[i * 3] = (Math.random() - 0.5) * 24;
    ppos[i * 3 + 1] = 1 + Math.random() * 12;
    ppos[i * 3 + 2] = 15 - Math.random() * 70;
    partData.push({ ph: Math.random() * Math.PI * 2, spd: 0.2 + Math.random() * 0.4 });
}
partGeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
const partTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,230,170,1)');
    g.addColorStop(0.4, 'rgba(212,169,74,0.6)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
})();
const particles = new THREE.Points(partGeo, new THREE.PointsMaterial({
    size: 0.12, map: partTex, transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending,
    color: 0xffe5a0, opacity: 0.7
}));
scene.add(particles);

let scrollP = 0;
let currentZ = 40, targetZ = 40;
let currentY = 4, targetY = 4;
let animRunning = false;

const depthLabels = ['Pintu Masuk', 'Karpet Merah', 'Meja Tamu', 'Meja Utama', 'Lantai Dansa', 'Panggung Mempelai'];

function kick() {
    if (!animRunning) { animRunning = true; requestAnimationFrame(loop); }
}

const clock = new THREE.Clock();

function loop() {
    const t = clock.getElapsedTime();
    const dz = targetZ - currentZ;
    const dy = targetY - currentY;
    currentZ += dz * 0.10;
    currentY += dy * 0.10;

    camera.position.set(0, currentY, currentZ);
    camera.lookAt(0, currentY - 0.5, currentZ - 20);

    const arr = partGeo.attributes.position.array;
    for (let i = 0; i < N; i++) {
        const p = partData[i];
        arr[i * 3] += Math.cos(t * p.spd + p.ph) * 0.004;
        arr[i * 3 + 1] += Math.sin(t * p.spd * 0.7 + p.ph) * 0.003;
        if (arr[i * 3 + 1] > 14) arr[i * 3 + 1] = 1;
        if (arr[i * 3 + 1] < 1) arr[i * 3 + 1] = 10;
    }
    partGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);

    if (Math.abs(dz) > 0.05 || Math.abs(dy) > 0.02) {
        requestAnimationFrame(loop);
    } else {

        animRunning = false;
        setTimeout(kick, 33);
    }
}

function updateFromScroll() {
    const max = document.body.scrollHeight - innerHeight;
    scrollP = Math.min(1, Math.max(0, scrollY / Math.max(1, max)));
    targetZ = 40 - scrollP * 78;
    targetY = 4 + Math.sin(scrollP * Math.PI) * 0.8;

    const prog = document.getElementById('progress');
    if (prog) prog.style.width = (scrollP * 100) + '%';
    const depthVal = document.getElementById('depthVal');
    if (depthVal) depthVal.textContent = depthLabels[Math.min(depthLabels.length - 1, Math.floor(scrollP * depthLabels.length))];
    kick();
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

setTimeout(() => { const l = document.getElementById('loader'); if (l) l.classList.add('hide'); }, 800);

const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

applyData(Object.assign({}, FALLBACK_DATA, { guestName: _u || FALLBACK_DATA.guestName }));
renderTenant({});

function tickCountdown() {
    if (!_countdownTarget) return;
    var diff = Math.max(0, _countdownTarget - Date.now());
    var d = Math.floor(diff / 86400000); diff -= d * 86400000;
    var h = Math.floor(diff / 3600000); diff -= h * 3600000;
    var m = Math.floor(diff / 60000); diff -= m * 60000;
    var s = Math.floor(diff / 1000);
    var map = { d, h, m, s };
    document.querySelectorAll('#countdown .num').forEach(function (n) {
        n.textContent = String(map[n.dataset.k]).padStart(2, '0');
    });
}
tickCountdown(); setInterval(tickCountdown, 1000);

var rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) rsvpForm.addEventListener('submit', handleRSVP);

document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-copy]');
    if (!btn) return;
    var val = btn.getAttribute('data-copy');
    var done = function () {
        var orig = btn.textContent; btn.textContent = 'Tersalin!';
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

const musicBtn = document.getElementById('music');
const audioEl = document.getElementById('audio');
var audioCtx, playing = false;
var musicAutoStarted = false;
var _audioUnlocked = false;

function _unlockAudioCtx() {
    var hasFile = audioEl && audioEl.querySelector('source') && audioEl.querySelector('source').getAttribute('src');
    if (hasFile || _audioUnlocked) return;
    _audioUnlocked = true;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'running') audioCtx.suspend();
}
document.addEventListener('touchstart', _unlockAudioCtx, { once: true, passive: true });
document.addEventListener('pointerdown', _unlockAudioCtx, { once: true });

function _buildAudioGraph() {
    const master = audioCtx.createGain(); master.gain.value = 0.14; master.connect(audioCtx.destination);
    const freqs = [130.81, 164.81, 196.00, 246.94];
    freqs.forEach((f, i) => {
        const o = audioCtx.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f;
        const g = audioCtx.createGain(); g.gain.value = 0;
        const lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.1 + i * 0.03;
        const lfoG = audioCtx.createGain(); lfoG.gain.value = 0.04;
        lfo.connect(lfoG).connect(g.gain);
        o.connect(g).connect(master); o.start(); lfo.start();
        g.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 3);
    });
    const bufSize = 2 * audioCtx.sampleRate;
    const noiseBuf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) nd[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = audioCtx.createBufferSource(); noise.buffer = noiseBuf; noise.loop = true;
    const bp = audioCtx.createBiquadFilter(); bp.type = 'highpass'; bp.frequency.value = 2000;
    const ng = audioCtx.createGain(); ng.gain.value = 0.015;
    noise.connect(bp).connect(ng).connect(master); noise.start();
}

function startMusic() {
    if (musicAutoStarted) return;
    musicAutoStarted = true;
    var hasFile = audioEl && audioEl.querySelector('source') && audioEl.querySelector('source').getAttribute('src');
    if (hasFile) {
        audioEl.play().catch(() => { });
        if (musicBtn) musicBtn.classList.add('playing');
        playing = true; return;
    }
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    _buildAudioGraph();
    audioCtx.resume().then(() => { playing = true; if (musicBtn) musicBtn.classList.add('playing'); });
}

if (musicBtn) {
    musicBtn.addEventListener('click', () => {
        var hasFile = audioEl && audioEl.querySelector('source') && audioEl.querySelector('source').getAttribute('src');
        if (hasFile) {
            if (audioEl.paused) { audioEl.play().catch(() => { }); musicBtn.classList.add('playing'); playing = true; }
            else { audioEl.pause(); musicBtn.classList.remove('playing'); playing = false; }
            return;
        }
        if (!musicAutoStarted) { startMusic(); return; }
        if (!audioCtx) return;
        if (playing) { audioCtx.suspend(); musicBtn.classList.remove('playing'); }
        else { audioCtx.resume(); musicBtn.classList.add('playing'); }
        playing = !playing;
    });
}

var openingSection = document.getElementById('opening');
if (openingSection) {
    var openingObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { startMusic(); openingObs.disconnect(); } });
    }, { threshold: 0.3 });
    openingObs.observe(openingSection);
}
