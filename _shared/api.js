/* ===========================================
Use the function here if you have an API, and adjust the base URL.
=========================================== */

function notifyLoaded() {
    if (window.parent) {
        window.parent.postMessage({ type: 'INVITATION_LOADED' }, '*');
    }
}

async function getInvitation(apiBaseUrl, tenantSlug, projectSlug) {
    const res = await fetch(`${apiBaseUrl}/rest/public/invitation/${tenantSlug}/${projectSlug}`);
    if (!res.ok) throw new Error('getInvitation failed: ' + res.status);
    return res.json();
}

async function getTenant(apiBaseUrl, slug) {
    const res = await fetch(`${apiBaseUrl}/rest/public/tenant/${slug}`);
    if (!res.ok) throw new Error('getTenant failed: ' + res.status);
    return res.json();
}

async function getLogo(apiBaseUrl, slug) {
    const res = await fetch(`${apiBaseUrl}/rest/public/logo?slug=${slug}`);
    if (!res.ok) throw new Error('getTenantLogo failed: ' + res.status);
    return res.json();
}

async function getComments(apiBaseUrl, projectId, limit, offset) {
    limit = limit ?? 10;
    offset = offset ?? 0;
    const res = await fetch(`${apiBaseUrl}/rest/public/comments/${projectId}?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('getComments failed: ' + res.status);
    return res.json();
}

async function postComment(apiBaseUrl, payload) {
    const res = await fetch(`${apiBaseUrl}/rest/public/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('postComment failed: ' + res.status);
    return res.json();
}
