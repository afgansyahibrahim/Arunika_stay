export const escapeHtml = (value = '') =>
    String(value ?? '').replace(
        /[&<>"']/g,
        (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
export const localize = (value, locale = 'id') =>
    typeof value === 'object' && value !== null ? value[locale] || '' : value || '';
export const money = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
        Number(value),
    );
export const clone = (value) => JSON.parse(JSON.stringify(value));
export function safeUrl(value, image = false) {
    if (typeof value !== 'string') return '';
    if (image && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return value;
    if (/^\/assets\/[\w./-]+$/.test(value) && !value.includes('..')) return value;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
    } catch {
        return '';
    }
}
const paths = {
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 2 17 2c2 4 3 8 3 11a7 7 0 0 1-9 7Z"/><path d="M2 22c0-6 6-10 12-12"/>',
    'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>',
    'arrow-down': '<path d="M12 5v14m-7-7 7 7 7-7"/>',
    'arrow-up': '<path d="M12 19V5m-7 7 7-7 7 7"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="m6 6 12 12M6 18 18 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
    expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
    quote: '<path d="M3 21c3 0 7-4 7-9V3H2v9h5c0 4-2 6-4 6zm12 0c3 0 7-4 7-9V3h-8v9h5c0 4-2 6-4 6z"/>',
    waves: '<path d="M2 6c2-2 4-2 6 0s4 2 6 0 4-2 8 0M2 12c2-2 4-2 6 0s4 2 6 0 4-2 8 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 8 0"/>',
    utensils: '<path d="M4 3v6a2 2 0 0 0 4 0V3M6 3v18M20 3c-4 0-5 5-5 9h5m0-9v18"/>',
    coffee: '<path d="M4 8h12v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Zm12 0h2a3 3 0 0 1 0 6h-2M6 2v2m4-2v2m4-2v2"/>',
    wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0M12 20h.01"/>',
    car: '<path d="m5 7 2-4h10l2 4m-17 9V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7ZM5 16v3m14-3v3M5 11h2m10 0h2"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A20 20 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.9l-1.3 1.3a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.9-.6l3 .5a2 2 0 0 1 2.1 2.4Z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7 10-7"/>',
    camera: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    message:
        '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9 8.4 8.4 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8v.5Z"/>',
    dashboard:
        '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    bed: '<path d="M2 20V6m20 14V10a2 2 0 0 0-2-2H2m0 9h20M6 8V4h12v4"/>',
    images: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m21 15-5-5L5 21"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 4h.01"/>',
    settings:
        '<circle cx="12" cy="12" r="3"/><path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 3-1 2 3 3-1 1-3 3-1 2-3-2-2 1-3-3-2-3 1-2-3Z"/>',
    pencil: '<path d="m16 3 5 5M3 21l5-1L21 7a3.5 3.5 0 0 0-5-5L3 15Z"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    shield: '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/>',
    globe: '<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/>',
    upload: '<path d="M12 16V3m-5 5 5-5 5 5M3 16v5h18v-5"/>',
    download: '<path d="M12 3v13m-5-5 5 5 5-5M3 16v5h18v-5"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v5m0 3h.01"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 13h8m-8 4h8"/>',
};
export function icon(name, size = 18, filled = false, className = '') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="${escapeHtml(className)}">${paths[name] || paths.leaf}</svg>`;
}
export function logo(settings) {
    const image = safeUrl(settings.logo, true);
    return `<span class="brand">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(settings.name)}" />` : `<span class="brand-mark">${icon('leaf', 21)}</span>`}<span>${escapeHtml(settings.name)}<small>HOTEL &amp; STAY</small></span></span>`;
}
let toastTimer;
export function toast(message, error = false) {
    document.querySelector('.site-notice, .admin-toast')?.remove();
    clearTimeout(toastTimer);
    const node = document.createElement('div');
    node.className =
        document.body.dataset.mode === 'admin' ? `admin-toast ${error ? 'error' : ''}` : 'site-notice';
    node.setAttribute('role', error ? 'alert' : 'status');
    node.innerHTML = `${icon(error ? 'alert' : 'check')}<span>${escapeHtml(message)}</span><button aria-label="Tutup">${icon('x')}</button>`;
    node.querySelector('button').onclick = () => node.remove();
    document.body.append(node);
    toastTimer = setTimeout(() => node.remove(), 5500);
}
export function openModal(content, label, className = '') {
    const previous = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = `modal ${className}`;
    dialog.setAttribute('aria-label', label);
    dialog.innerHTML = `<button class="modal-close icon-button" aria-label="Close / Tutup">${icon('x', 20)}</button>${content}`;
    dialog.querySelector('.modal-close').onclick = () => dialog.close();
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            const r = dialog.getBoundingClientRect();
            if (
                event.clientX < r.left ||
                event.clientX > r.right ||
                event.clientY < r.top ||
                event.clientY > r.bottom
            )
                dialog.close();
        }
    });
    dialog.addEventListener('close', () => {
        dialog.remove();
        document.body.classList.remove('modal-open');
        if (previous?.isConnected) previous.focus();
    });
    document.body.append(dialog);
    document.body.classList.add('modal-open');
    dialog.showModal();
    return dialog;
}
