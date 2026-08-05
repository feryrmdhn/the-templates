# Template Editing Guide

This guide explains how to customize template content — either by editing the fallback variables directly, or by feeding data through the API.

---

## How Data Works

Each template loads its content through a two-layer system:

```
API response  ──►  merged data  ──►  applyData()  ──►  DOM
     │                 ▲
     └── missing ──► FALLBACK_DATA
```

1. On load, the template tries to receive data via `postMessage` from a parent frame (your platform/dashboard).
2. If API data is available, it merges with the fallback — API values take priority, fallback fills any gaps.
3. If no API data arrives within 2 seconds, the template falls back entirely to `FALLBACK_DATA`.

---

## Method 1 — Edit Fallback Variables Directly

This is the simplest way. No API needed. Suitable for static/demo usage.

### Where to find the file

Each template group uses a shared variable file located in `_shared/`:

| File | Used by templates |
|---|---|
| `_shared/var.js` | brown-casual, green-forest, ... |
| `_shared/var2.js` | batik-heritage, sakura, ... |
| `_shared/var3.js` | elegant-classy, everlasting, ... |
| `_shared/var4.js` | ocean-breeze, modern-city, ... |
| `_shared/var5.js` | 3d-ballroom, 3d-forest, 3d-heaven, 3d-midnight-city, ... |
| `_shared/var6.js` | welcoming-baby-1, welcoming-baby-2, welcoming-baby-3, ... |
| `_shared/var7.js` | birthday-celebrate-1, birthday-celebrate-2, cartoon-panda, ... |
| `_shared/var8.js` | wayang, inner-flat, ... |

Check which `var*.js` a template uses by looking at its `app.js`:

```js
// e.g. brown-casual/_assets/js/app.js
var FALLBACK_DATA = FALLBACK["brown-casual"];
```

The string `"brown-casual"` is the key to look up inside the `var*.js` file.

### Wedding template fields

```js
"your-template": {
    guestName: "Bapak/Ibu/Saudara/i",   // Guest name (overridable via URL ?to=Name)

    // Couple
    groomName: "Andika Ilyas, SE",
    brideName: "Putri Auliya, S.Pd",
    groomPhoto: "/template-name/_assets/img/spouse/man.jpg",
    bridePhoto: "/template-name/_assets/img/spouse/woman.jpg",
    groomRole: "Putra dari",
    brideRole: "Putri dari",
    fatherGroom: "Nama Ayah Mempelai Pria",
    fatherBride: "Nama Ayah Mempelai Wanita",

    // Quote (optional)
    quote: "QS. Ar-Rum (30): 21",
    quoteSource: "Al-Quran",

    // Akad ceremony
    akadDatetime: "2026-12-12T10:00:00+07:00",   // ISO 8601 format
    akadVenue: "Nama Gedung",
    akadAddress: "Alamat lengkap",
    akadMapsUrl: "https://maps.google.com/maps?...",

    // Reception
    receptionDatetime: "2026-12-12T12:00:00+07:00",
    receptionVenue: "Nama Gedung",
    receptionAddress: "Alamat lengkap",
    receptionMapsUrl: "https://maps.google.com/maps?...",

    // Gallery (set isShowGallery: false to hide)
    isShowGallery: true,
    gallery: [
        "/template-name/_assets/img/gallery/1.jpg",
        "/template-name/_assets/img/gallery/2.jpg",
    ],

    // Love story (set isShowStory: false to hide)
    isShowStory: true,
    storyItems: [
        { year: 2020, title: "First met", description: "..." },
    ],

    // Wishes (shown as placeholder before real submissions)
    wishes: [
        { name: "Budi", message: "Selamat!" },
    ],

    // Digital gift / bank transfer
    payment: [
        { name: "Andika Ilyas", method: "bca", value: "1234-5678" },
        { name: "Putri Auliya", method: "dana", value: "08123456789" },
    ],

    // Background image (some templates support this)
    backgroundCover: "/template-name/_assets/img/bg/bg-1.webp",

    music: "/music.mp3",       // Path to background music
    platform: "Platform Name", // Your platform name shown in footer
}
```

### Baby / welcoming template fields

```js
"welcoming-baby-1": {
    guestName: "Bapak/Ibu/Saudara/i",
    babyName: "Aisyah Zahra",
    babyPhoto: "https://...",               // URL or local path
    birthDatetime: "2025-07-10T08:30:00+07:00",
    gender: "perempuan",                    // "perempuan" or "laki-laki"
    placeOfBorn: "Kota Jakarta",
    fatherName: "Andika Ilyas, SE",
    motherName: "Putri Auliya, S.Pd",
    eventDatetime: "2026-12-17T10:00:00+07:00",
    eventTime: "10.00 - 13.00",
    eventVenue: "Kediaman Bpk. Andika Ilyas",
    eventAddress: "Jl. Kebahagiaan No. 17...",
    eventMapsUrl: "https://maps.google.com/maps?...",
    familyName: "Keluarga Bpk. Andika & Ibu Putri",
    wishes: [ ... ],
    payment: [ ... ],
    music: "/music.mp3",
    platform: "Platform Name",
}
```

### Birthday template fields

```js
"birthday-celebrate-1": {
    guestName: "Bapak/Ibu/Saudara/i",
    birthdayName: "Nama Anak",
    birthdayAge: 5,
    birthdayPhoto: "https://...",
    birthdayDatetime: "2026-12-25T10:00:00+07:00",
    eventVenue: "Nama Tempat",
    eventAddress: "Alamat lengkap",
    eventMapsUrl: "https://maps.google.com/maps?...",
    parentName: "Nama Orang Tua",
    wishes: [ ... ],
    payment: [ ... ],
    music: "/music.mp3",
    platform: "Platform Name",
}
```

### Maps URL format

The `mapsUrl` fields accept three formats — the template handles conversion automatically:

```
// 1. Google Maps embed URL (recommended)
"https://www.google.com/maps/embed?pb=..."

// 2. Regular Google Maps URL (auto-converted to embed)
"https://www.google.com/maps/place/..."

// 3. Full iframe HTML (src will be extracted automatically)
"<iframe src=\"https://...\" ...></iframe>"
```

### Payment methods

The `method` field in `payment` maps to an image in `/payment/<method>.png`. Common values:

```
bca · mandiri · bni · bri · gopay · dana · ovo · shopeepay · qris
```

---

## Method 2 — API Integration

Templates receive data from your platform via `postMessage`. This is how a dashboard or backend injects live data without touching the source files.

### How to send data

From a parent page (your platform) that embeds the template in an `<iframe>`:

```js
const iframe = document.getElementById('template-iframe');

iframe.contentWindow.postMessage({
    type: 'INVITATION_DATA',
    payload: {
        apiBaseUrl: 'https://api.yourplatform.com',
        tenantSlug: 'your-tenant',
        projectSlug: 'project-slug',
        guestName: 'John Doe',           // optional, overrides guest name
        mode: 'preview',                 // optional: 'preview' skips API call
    }
}, '*');
```

### Payload fields

| Field | Required | Description |
|---|---|---|
| `apiBaseUrl` | Yes | Base URL of your API |
| `tenantSlug` | Yes | Your tenant identifier |
| `projectSlug` | Yes | The specific invitation slug |
| `guestName` | No | Overrides the guest name displayed |
| `mode` | No | Set to `"preview"` to use fallback data without API call |

### Expected API response

The template calls `GET /rest/public/invitation/{tenantSlug}/{projectSlug}` and expects:

```json
{
    "data": {
        "id": 123,
        "song_url": "https://...",
        "content": {
            "groomName": "Andika Ilyas",
            "brideName": "Putri Auliya",
            "akadDatetime": "2026-12-12T10:00:00+07:00",
            "..."
        }
    }
}
```

The `content` object keys match the fallback variable field names. Any key present in `content` overrides the fallback. Missing keys fall back to `FALLBACK_DATA` automatically.

### Tenant logo API

The template also calls `GET /rest/public/logo?slug={tenantSlug}` and expects:

```json
{
    "data": {
        "logo_url": "https://...",
        "facebook_url": "https://facebook.com/...",
        "instagram_url": "https://instagram.com/..."
    }
}
```

### Guest name via URL parameter

Guest names can also be passed directly via URL without any API or postMessage:

```
https://yourdomain.com/template-name/?to=John+Doe
https://yourdomain.com/template-name/?name=John+Doe
```

Spaces can be written as `+` or `_`. This is useful for sharing personalized links.

---

## Priority Order

When the same field exists in multiple sources, this is the priority:

```
URL ?to= / ?name=  ──► highest priority for guestName only
API response        ──► overrides fallback for all fields
FALLBACK_DATA       ──► used when API value is null / empty / missing
```

---

## Deployment

Before deploying, run the obfuscator to protect JS source files:

```bash
node obfuscate.js
```

This generates a `dist/` folder with obfuscated JS and all other files copied as-is. Upload the contents of `dist/` to your hosting — not the root folder.

The GitHub Actions workflow (`deployment.yml`) runs this automatically on every push to `main`.
