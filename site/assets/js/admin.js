import { escapeHtml as e, localize, clone, safeUrl, icon, logo, openModal, toast } from './ui.js';
import { saveDocument, STORAGE_KEY, itemTypes } from './store.js';

const types = {
    room: { label: 'Kamar', singular: 'kamar', icon: 'bed' },
    facility: { label: 'Fasilitas', singular: 'fasilitas', icon: 'leaf' },
    gallery: { label: 'Galeri', singular: 'foto', icon: 'images' },
    testimonial: { label: 'Testimoni', singular: 'testimoni', icon: 'message' },
    faq: { label: 'FAQ', singular: 'pertanyaan', icon: 'help' },
};
const sectionNames = {
    about: 'Tentang hotel',
    rooms: 'Kamar',
    facilities: 'Fasilitas',
    gallery: 'Galeri',
    testimonials: 'Testimoni',
    faq: 'FAQ',
    contact: 'Hubungi kami',
};
const input = (name, label, value = '', type = 'text', extra = '') =>
    `<label class="field"><span class="field-label">${e(label)}</span><input name="${name}" type="${type}" value="${e(value)}" ${extra} /></label>`;
const textarea = (name, label, value = '') =>
    `<label class="field"><span class="field-label">${e(label)}</span><textarea name="${name}" rows="4">${e(value)}</textarea></label>`;
const select = (name, label, value, choices) =>
    `<label class="field"><span class="field-label">${e(label)}</span><select name="${name}">${choices.map(([key, title]) => `<option value="${e(key)}" ${String(key) === String(value) ? 'selected' : ''}>${e(title)}</option>`).join('')}</select></label>`;
const checkbox = (name, label, value) =>
    `<label class="checkbox-field"><input type="checkbox" name="${name}" ${value ? 'checked' : ''} /><span>${e(label)}</span></label>`;
const pair = (key, label, value, multiline = false) =>
    `<div class="form-grid">${['id', 'en'].map((lang) => (multiline ? textarea : input)(`${key}.${lang}`, `${label} · ${lang === 'id' ? 'Indonesia' : 'English'}`, value?.[lang] || '')).join('')}</div>`;
const imageField = (key, label, value) =>
    `<div class="image-field"><span class="field-label">${e(label)}</span><div class="image-upload-box">${safeUrl(value, true) ? `<img src="${e(safeUrl(value, true))}" alt="Pratinjau gambar" />` : `<span class="upload-placeholder">${icon('images', 26)}</span>`}<div><label class="button button-outline button-small upload-label">${icon('upload', 15)}Pilih gambar<input type="file" accept="image/jpeg,image/png,image/webp" data-image-upload="${key}" hidden /></label><small>JPEG, PNG, WebP · maksimal 5 MB. Disimpan di browser.</small><input class="image-url" name="${key}" value="${e(value)}" aria-label="${e(label)}: URL gambar" placeholder="Atau URL HTTPS" /></div></div></div>`;
const formError = (message) =>
    `<div class="error-box" role="alert">${icon('alert')}<span>${e(message)}</span></div>`;

export function renderLogin() {
    return `<main class="login-page"><div class="login-visual"><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85" alt="Foto stok ruang duduk" /><div class="login-visual-copy"><span class="eyebrow">HOTEL CONTENT STUDIO</span><h1>Ruang yang nyaman.<br />Cerita yang dipercaya.</h1><p>Eksplorasi pengalaman mengelola sebuah hotel.</p></div></div><div class="login-panel"><a href="/id" class="login-back">Lihat website ${icon('arrow-up-right', 15)}</a><div class="login-form-wrap"><span class="admin-emblem">${icon('leaf', 30)}</span><span class="eyebrow">PROYEK PORTOFOLIO</span><h2>Coba studio konten.</h2><p>Demo interaktif pengelolaan profil hotel, kamar, dan testimoni. Tidak memerlukan email atau kata sandi.</p><div class="demo-callout"><strong>Demo lokal di browser</strong><p>Perubahan hanya tersimpan di perangkat ini. Admin ini tidak memiliki autentikasi, server, atau database. Gunakan data contoh.</p></div><a class="button login-submit" href="/admin">Masuk ke demo ${icon('chevron-right', 18)}</a></div><small class="login-footer">HTML · CSS · JavaScript murni</small></div></main>`;
}

export function bindAdmin(root, initial, seed) {
    let document = initial,
        tab = 'dashboard',
        query = '',
        status = 'all';
    const controller = new AbortController(),
        signal = controller.signal;
    function persist(next) {
        document = saveDocument(next);
    }
    function table(items, order = false) {
        return `<div class="content-table-wrap"><table class="content-table"><thead><tr><th>KONTEN</th><th>STATUS</th><th>BAHASA</th><th>URUTAN</th><th>AKSI</th></tr></thead><tbody>${items.map((item, index) => `<tr><td><div class="table-title">${safeUrl(item.data.image || item.data.avatar, true) ? `<img src="${e(safeUrl(item.data.image || item.data.avatar, true))}" alt="" />` : `<span class="table-icon">${icon(types[item.type].icon, 18)}</span>`}<div><strong>${e(localize(item.data.title) || 'Tanpa judul')}</strong><small>${types[item.type].label} · konten contoh</small></div></div></td><td><span class="status-badge ${item.status}">${item.status === 'published' ? 'Published' : 'Draft'}</span></td><td><div class="locale-badges">${['id', 'en'].map((lang) => `<span class="${localize(item.data.title, lang) ? 'complete' : ''}">${lang.toUpperCase()}</span>`).join('')}</div></td><td><div class="order-controls">${order ? `<button class="icon-button" data-move="${item.id}" data-direction="-1" aria-label="Naikkan ${e(localize(item.data.title))}" ${index === 0 ? 'disabled' : ''}>${icon('arrow-up', 14)}</button><button class="icon-button" data-move="${item.id}" data-direction="1" aria-label="Turunkan ${e(localize(item.data.title))}" ${index === items.length - 1 ? 'disabled' : ''}>${icon('arrow-down', 14)}</button>` : item.sort_order}</div></td><td><div class="row-actions"><button class="icon-button" data-edit="${item.id}" aria-label="Edit ${e(localize(item.data.title))}">${icon('pencil', 16)}</button><button class="icon-button danger" data-delete="${item.id}" aria-label="Hapus ${e(localize(item.data.title))}">${icon('trash', 16)}</button></div></td></tr>`).join('')}</tbody></table></div>`;
    }
    function empty() {
        return `<div class="empty-state">${icon('file', 35)}<h3>Belum ada konten yang cocok.</h3><p>Tambahkan konten baru atau ubah pencarian.</p></div>`;
    }
    function visibleItems() {
        return document.items
            .filter(
                (item) =>
                    item.type === tab &&
                    (status === 'all' || status === item.status) &&
                    `${localize(item.data.title)} ${localize(item.data.title, 'en')}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
            )
            .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    }
    function contentList() {
        const items = visibleItems();
        return items.length ? table(items, !query && status === 'all') : empty();
    }
    function dashboard() {
        const published = document.items.filter((item) => item.status === 'published').length;
        return `<div class="dashboard-stats">${[
            ['file', document.items.length, 'Total konten'],
            ['globe', published, 'Konten published'],
            ['pencil', document.items.length - published, 'Konten draft'],
            [
                'message',
                document.items.filter((item) => item.type === 'testimonial').length,
                'Testimoni contoh',
            ],
        ]
            .map(
                ([i, count, label]) =>
                    `<div class="stat-card"><span>${icon(i, 20)}</span><strong>${count}</strong><small>${label}</small></div>`,
            )
            .join(
                '',
            )}</div><div class="dashboard-feature"><div><span class="eyebrow">CERITA KECIL, KEPERCAYAAN BESAR</span><h2>Biarkan tamu bercerita.</h2><p>Eksplorasi pengelolaan testimoni dua bahasa,<br />rating, sumber ulasan, dan status publikasi.</p><button class="button" data-new="testimonial">Tambah testimoni${icon('plus', 16)}</button></div><div class="feature-illustration"><div class="quote-illustration">${icon('message', 34)}<div class="illustration-lines"><span></span><span></span><span></span></div><div class="illustration-author"><span></span><div><i></i><i></i></div>${icon('shield', 21)}</div></div></div></div><div class="dashboard-notes"><div>${icon('alert', 19)}<span><strong>Proyek sampel portofolio.</strong> Semua ulasan ditandai contoh. Perubahan hanya berlaku di browser ini.</span></div></div><div class="panel"><div class="panel-heading"><div><h3>Konten terbaru</h3><p>Coba edit, tambah, dan atur konten landing page.</p></div><span class="soft-pill">${document.items.length} konten</span></div>${document.items.length ? table([...document.items].sort((a, b) => b.id - a.id).slice(0, 6)) : empty()}</div>`;
    }
    function settingsForm() {
        const s = document.settings;
        return `<form id="settings-form" class="panel"><div class="settings-body"><h3>Identitas hotel</h3>${input('name', 'Nama hotel', s.name, 'text', 'required maxlength="100"')}${imageField('logo', 'Logo (opsional)', s.logo)}${pair('tagline', 'Tagline', s.tagline)}<details class="settings-group" open><summary>Hero / halaman utama</summary>${pair('hero_label', 'Label hero', s.hero_label)}${pair('hero_title', 'Judul hero', s.hero_title, true)}${pair('hero_subtitle', 'Deskripsi hero', s.hero_subtitle, true)}${imageField('hero_image', 'Foto hero', s.hero_image)}${pair('hero_alt', 'Teks alternatif hero', s.hero_alt)}</details><details class="settings-group"><summary>Tentang hotel</summary>${pair('about_title', 'Judul', s.about_title, true)}${pair('about_description', 'Cerita hotel', s.about_description, true)}${imageField('about_image', 'Foto tentang hotel', s.about_image)}${pair('about_alt', 'Teks alternatif foto', s.about_alt)}<div class="form-grid">${input('checkin', 'Jam check-in', s.checkin, 'time')}${input('checkout', 'Jam check-out', s.checkout, 'time')}</div></details><details class="settings-group"><summary>Kontak & lokasi</summary><div class="form-grid">${input('whatsapp', 'WhatsApp (kode negara, tanpa +)', s.whatsapp, 'tel', 'placeholder="6281234567890"')}${input('phone', 'Telepon', s.phone, 'tel')}${input('email', 'Email hotel', s.email, 'email')}${input('instagram', 'URL Instagram', s.instagram, 'url')}</div>${pair('address', 'Alamat', s.address, true)}${input('map_url', 'Tautan Google Maps', s.map_url, 'url')}${input('map_embed_url', 'URL embed Google Maps (opsional)', s.map_embed_url, 'url', 'placeholder="https://www.google.com/maps/embed?..."')}</details><details class="settings-group"><summary>Judul setiap bagian</summary>${Object.entries(
            sectionNames,
        )
            .map(
                ([key, label]) =>
                    `<h4>${label}</h4>${pair(`section_copy.${key}.title`, 'Judul', s.section_copy?.[key]?.title, true)}${pair(`section_copy.${key}.subtitle`, 'Subjudul', s.section_copy?.[key]?.subtitle, true)}`,
            )
            .join(
                '',
            )}</details><details class="settings-group"><summary>SEO</summary>${pair('seo_title', 'Judul halaman', s.seo_title)}${pair('seo_description', 'Deskripsi halaman', s.seo_description, true)}<p class="demo-help">Metadata di browser mengikuti perubahan ini. Untuk metadata publik permanen, ekspor data ke site/data/hotel.json dan deploy ulang.</p></details><div data-form-error></div></div><div class="settings-footer"><span>Perubahan disimpan di browser ini.</span><button class="button">${icon('save', 16)}Simpan pengaturan</button></div></form><div class="panel section-manager"><div class="panel-heading"><div><h3>Susunan landing page</h3><p>Atur urutan dan tampilkan atau sembunyikan bagian.</p></div></div><div class="settings-body">${s.sections.map((section, index) => `<div class="section-order-row"><label class="checkbox-field"><input type="checkbox" data-section-toggle="${section.key}" ${section.enabled ? 'checked' : ''} /><span>${sectionNames[section.key]}</span></label><button class="icon-button" data-section-move="${section.key}" data-direction="-1" aria-label="Naikkan ${sectionNames[section.key]}" ${index === 0 ? 'disabled' : ''}>${icon('arrow-up', 15)}</button><button class="icon-button" data-section-move="${section.key}" data-direction="1" aria-label="Turunkan ${sectionNames[section.key]}" ${index === s.sections.length - 1 ? 'disabled' : ''}>${icon('arrow-down', 15)}</button></div>`).join('')}</div></div>`;
    }
    function dataPanel() {
        return `<div class="panel"><div class="settings-body"><h3>Data demo milik browser ini.</h3><p class="demo-help">Admin demo tidak memiliki autentikasi. Semua data tersedia bagi pengguna perangkat ini. Jangan simpan kata sandi, bukti izin, atau informasi pribadi.</p><div class="data-actions"><button class="button" data-export>${icon('download', 17)}Ekspor JSON</button><label class="button button-outline upload-label">${icon('upload', 17)}Impor JSON<input type="file" accept="application/json,.json" data-import hidden /></label><button class="button button-outline" data-reset>Kembalikan data contoh</button></div><h4>Menerbitkan konten permanen</h4><p class="demo-help">Ekspor JSON, ganti file <code>site/data/hotel.json</code> di proyek, lalu deploy ulang. Pengunjung lain akan mendapat data contoh baru. Penyimpanan browser tidak mengubah file website di Vercel.</p></div></div>`;
    }
    function render() {
        const title =
            tab === 'dashboard'
                ? 'Selamat datang di studio.'
                : tab === 'settings'
                  ? 'Profil & halaman'
                  : tab === 'data'
                    ? 'Data & panduan demo'
                    : types[tab].label;
        root.innerHTML = `<div class="admin-app"><button class="sidebar-overlay" aria-label="Tutup menu" data-close-sidebar hidden></button><aside class="admin-sidebar"><a class="sidebar-brand" href="/admin">${logo(document.settings)}</a><span class="sidebar-caption">CONTENT STUDIO · DEMO</span><nav aria-label="Menu admin"><button data-tab="dashboard" class="${tab === 'dashboard' ? 'active' : ''}">${icon('dashboard')}Dashboard</button><span class="nav-group-label">KONTEN WEBSITE</span>${Object.entries(
            types,
        )
            .map(
                ([key, meta]) =>
                    `<button data-tab="${key}" class="${tab === key ? 'active' : ''}">${icon(meta.icon)}${meta.label}<span class="sidebar-count">${document.items.filter((item) => item.type === key).length}</span></button>`,
            )
            .join(
                '',
            )}<span class="nav-group-label">PENGATURAN</span><button data-tab="settings" class="${tab === 'settings' ? 'active' : ''}">${icon('settings')}Profil & halaman</button><button data-tab="data" class="${tab === 'data' ? 'active' : ''}">${icon('file')}Data & panduan demo</button></nav><div class="sidebar-bottom"><a href="/id" target="_blank" rel="noopener noreferrer">Lihat website${icon('arrow-up-right', 15)}</a><a href="/admin/login">Tentang demo${icon('help', 16)}</a><div class="sidebar-user"><span>D</span><div><strong>Pengunjung demo</strong><small>Penyimpanan lokal</small></div></div></div></aside><div class="admin-main"><header class="admin-topbar"><button class="icon-button mobile-sidebar-toggle" data-sidebar aria-label="Menu admin" aria-expanded="false">${icon('menu', 20)}</button><div class="breadcrumb">Content Studio${icon('chevron-right', 13)}<strong>${e(title)}</strong></div><div class="topbar-actions"><a href="/admin/preview" target="_blank" rel="noopener noreferrer">${icon('eye', 16)}<span>Pratinjau draft</span></a><span class="admin-avatar">D</span></div></header><main class="admin-content"><div class="demo-callout admin-demo-note">${icon('alert', 18)}<span>Demo portofolio · perubahan tersimpan hanya di browser ini. Gunakan data contoh.</span></div><div class="admin-page-heading"><div><span class="eyebrow">${tab === 'dashboard' ? 'OVERVIEW' : 'HOTEL CONTENT'}</span><h1>${e(title)}</h1><p>${tab === 'dashboard' ? 'Kelola setiap detail yang membuat tamu ingin singgah.' : 'Eksplorasi pengelolaan konten hotel dalam dua bahasa.'}</p></div>${types[tab] ? `<button class="button" data-new="${tab}">${icon('plus', 17)}Tambah ${types[tab].singular}</button>` : ''}</div>${tab === 'dashboard' ? dashboard() : tab === 'settings' ? settingsForm() : tab === 'data' ? dataPanel() : `${tab === 'testimonial' ? `<div class="trust-banner">${icon('shield', 25)}<div><strong>Sumber jelas, cerita tetap dipercaya.</strong><p>Semua ulasan di proyek ini ditandai contoh. Form ini mendemonstrasikan alur pengelolaan testimoni.</p></div></div>` : ''}<div class="panel"><div class="table-toolbar"><div class="search-input">${icon('eye', 17)}<input data-search placeholder="Cari ${types[tab].singular}..." aria-label="Cari konten" value="${e(query)}" /></div><select data-status aria-label="Filter status"><option value="all">Semua status</option><option value="draft">Draft</option><option value="published">Published</option></select><span data-count>${visibleItems().length} konten</span></div><div id="item-list">${contentList()}</div></div>`}<footer class="admin-footer">Hotel Content Studio<span>HTML · CSS · JavaScript</span></footer></main></div></div>`;
        if (types[tab]) root.querySelector('[data-status]').value = status;
    }
    function updateList() {
        root.querySelector('#item-list').innerHTML = contentList();
        root.querySelector('[data-count]').textContent = `${visibleItems().length} konten`;
    }
    function readForm(form) {
        const result = {};
        for (const control of form.elements) {
            if (!control.name || ['file', 'submit', 'button'].includes(control.type)) continue;
            const parts = control.name.split('.');
            let target = result;
            for (const part of parts.slice(0, -1)) target = target[part] ||= {};
            target[parts.at(-1)] =
                control.type === 'checkbox'
                    ? control.checked
                    : control.type === 'number' && control.value !== ''
                      ? Number(control.value)
                      : control.value;
        }
        return result;
    }
    function blank(type) {
        return {
            id: Math.max(0, ...document.items.map((v) => v.id)) + 1,
            type,
            status: 'draft',
            is_demo: true,
            sort_order: document.items.length + 1,
            data: {
                title: { id: '', en: '' },
                description: { id: '', en: '' },
                image: '',
                alt: { id: '', en: '' },
                features: { id: '', en: '' },
                capacity: 2,
                size: '',
                price: '',
                icon: 'leaf',
                category: 'hotel',
                rating: '',
                source: '',
                source_url: '',
                date: '',
                avatar: '',
                featured: true,
                translated: true,
                original_locale: 'id',
                consent: false,
            },
        };
    }
    function editor(item, isNew = false) {
        const d = item.data,
            meta = types[item.type];
        const dialog = openModal(
            `<div class="editor-heading"><span class="eyebrow">KELOLA KONTEN</span><h2>${isNew ? 'Tambah' : 'Edit'} ${meta.singular}</h2><p>Lengkapi kedua bahasa untuk menampilkan konten.</p></div><form id="item-form"><div class="editor-body">${pair('data.title', item.type === 'testimonial' ? 'Nama tampilan tamu' : item.type === 'faq' ? 'Pertanyaan' : 'Judul / nama', d.title)}${item.type !== 'gallery' ? pair('data.description', item.type === 'faq' ? 'Jawaban' : item.type === 'testimonial' ? 'Isi ulasan' : 'Deskripsi', d.description, true) : ''}${['room', 'facility', 'gallery'].includes(item.type) ? `${imageField('data.image', 'Foto', d.image)}${pair('data.alt', 'Teks alternatif foto', d.alt)}` : ''}${item.type === 'room' ? `<div class="form-grid three">${input('data.capacity', 'Kapasitas tamu', d.capacity, 'number', 'min="1" max="30" required')}${input('data.size', 'Luas (m²)', d.size, 'number', 'min="0"')}${input('data.price', 'Harga per malam (Rp)', d.price, 'number', 'min="0"')}</div>${pair('data.features', 'Fasilitas kamar (satu per baris)', d.features, true)}` : ''}${
                item.type === 'facility'
                    ? select('data.icon', 'Ikon fasilitas', d.icon, [
                          ['leaf', 'Suasana'],
                          ['coffee', 'Kafe'],
                          ['waves', 'Kolam'],
                          ['wifi', 'Wi-Fi'],
                          ['car', 'Parkir'],
                          ['utensils', 'Restoran'],
                      ])
                    : ''
            }${
                item.type === 'gallery'
                    ? select('data.category', 'Kategori', d.category, [
                          ['hotel', 'Suasana'],
                          ['kamar', 'Kamar'],
                          ['fasilitas', 'Fasilitas'],
                      ])
                    : ''
            }${
                item.type === 'testimonial'
                    ? `<div class="trust-form-note">${icon('shield', 21)}<p>Demo pengelolaan ulasan. Gunakan identitas contoh. Jangan menyimpan bukti atau data pribadi.</p></div><div class="form-grid">${select('data.rating', 'Rating (opsional)', d.rating, [['', 'Tanpa rating'], ...[1, 2, 3, 4, 5].map((n) => [n, `${n} / 5`])])}${input('data.date', 'Tanggal ulasan', d.date, 'date')}</div>${input('data.source', 'Nama sumber', d.source, 'text', 'placeholder="Contoh: ulasan langsung"')}${input('data.source_url', 'Tautan sumber (opsional)', d.source_url, 'url')}${imageField('data.avatar', 'Avatar (opsional)', d.avatar)}${select(
                          'data.original_locale',
                          'Bahasa ulasan asli',
                          d.original_locale || 'id',
                          [
                              ['id', 'Indonesia'],
                              ['en', 'English'],
                          ],
                      )}${checkbox('data.featured', 'Cuplikan di beranda (maksimal tiga)', d.featured)}${checkbox('data.translated', 'Tandai versi bahasa lain sebagai terjemahan', d.translated)}${checkbox('data.consent', 'Simulasi: sumber ulasan dan izin penggunaan sudah diperiksa', d.consent)}`
                    : ''
            }<div class="publication-panel"><div class="form-grid">${select('status', 'Status', item.status, [
                ['draft', 'Draft — hanya terlihat di pratinjau'],
                ['published', 'Published — tampil di landing page'],
            ])}${input('sort_order', 'Urutan', item.sort_order, 'number', 'min="0" max="9999"')}</div><small>Semua konten tetap ditandai contoh untuk proyek portofolio.</small></div><div data-form-error></div></div><div class="editor-footer"><button type="button" class="button button-outline" data-cancel>Batal</button><button class="button">${icon('save', 16)}Simpan konten</button></div></form>`,
            `${isNew ? 'Tambah' : 'Edit'} ${meta.singular}`,
            'editor-modal',
        );
        dialog.querySelector('[data-cancel]').onclick = () => dialog.close();
        wireUploads(dialog);
        dialog.querySelector('form').onsubmit = (event) => {
            event.preventDefault();
            try {
                const values = readForm(event.target),
                    next = clone(document),
                    saved = { ...item, ...values, data: { ...item.data, ...values.data } };
                // Seed reviews can stay published without pretending their source was verified.
                if (
                    item.type === 'testimonial' &&
                    saved.status === 'published' &&
                    (isNew || item.status === 'draft') &&
                    (!saved.data.source.trim() || !saved.data.consent)
                )
                    throw new Error(
                        'Lengkapi sumber dan konfirmasi simulasi izin untuk menampilkan testimoni baru.',
                    );
                next.items = isNew
                    ? [...next.items, saved]
                    : next.items.map((v) => (v.id === item.id ? saved : v));
                persist(next);
                dialog.close();
                render();
                toast('Konten tersimpan di browser ini.');
            } catch (error) {
                dialog.querySelector('[data-form-error]').innerHTML = formError(error.message);
            }
        };
    }
    async function wireImage(control) {
        const file = control.files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)
            throw new Error('Gunakan JPEG, PNG, atau WebP maksimal 5 MB.');
        const bitmap = await createImageBitmap(file);
        try {
            const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
            const canvas = globalThis.document.createElement('canvas');
            canvas.width = Math.round(bitmap.width * scale);
            canvas.height = Math.round(bitmap.height * scale);
            canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            const url = canvas.toDataURL('image/webp', 0.8);
            if (url.length > 1500000)
                throw new Error('Gambar masih terlalu besar. Pilih gambar yang lebih kecil.');
            const box = control.closest('.image-upload-box');
            box.querySelector('.image-url').value = url;
            const old = box.querySelector('img, .upload-placeholder');
            old.outerHTML = `<img src="${url}" alt="Pratinjau gambar" />`;
        } finally {
            bitmap.close();
            control.value = '';
        }
    }
    function wireUploads(scope) {
        scope
            .querySelectorAll('[data-image-upload]')
            .forEach(
                (control) =>
                    (control.onchange = () =>
                        wireImage(control).catch((error) => toast(error.message, true))),
            );
    }
    function confirmAction(label, description, action) {
        const dialog = openModal(
            `<div class="confirm-content"><h2>${e(label)}</h2><p>${e(description)}</p><div class="data-actions"><button class="button button-outline" data-cancel>Batal</button><button class="button" data-confirm>Lanjutkan</button></div></div>`,
            label,
            'confirm-modal',
        );
        dialog.querySelector('[data-cancel]').onclick = () => dialog.close();
        dialog.querySelector('[data-confirm]').onclick = () => {
            try {
                action();
                dialog.close();
                render();
                toast('Data demo diperbarui.');
            } catch (error) {
                toast(error.message, true);
            }
        };
    }
    root.addEventListener(
        'click',
        (event) => {
            const target = event.target.closest('button, a');
            if (!target) return;
            try {
                if (target.dataset.tab) {
                    tab = target.dataset.tab;
                    query = '';
                    status = 'all';
                    render();
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }
                if (target.dataset.new) editor(blank(target.dataset.new), true);
                if (target.dataset.edit)
                    editor(clone(document.items.find((v) => v.id === Number(target.dataset.edit))));
                if (target.dataset.delete) {
                    const item = document.items.find((v) => v.id === Number(target.dataset.delete));
                    confirmAction(
                        'Hapus konten contoh?',
                        `“${localize(item.data.title)}” akan dihapus dari data browser. Anda dapat memulihkan data awal melalui reset.`,
                        () => {
                            const next = clone(document);
                            next.items = next.items.filter((v) => v.id !== item.id);
                            persist(next);
                        },
                    );
                }
                if (target.dataset.move) {
                    const next = clone(document),
                        sorted = next.items
                            .filter((v) => v.type === tab)
                            .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
                        i = sorted.findIndex((v) => v.id === Number(target.dataset.move)),
                        j = i + Number(target.dataset.direction);
                    if (j >= 0 && j < sorted.length) {
                        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
                        sorted.forEach((v, n) => (v.sort_order = n + 1));
                        persist(next);
                        updateList();
                    }
                }
                if (target.hasAttribute('data-sidebar')) {
                    const sidebar = root.querySelector('.admin-sidebar'),
                        open = sidebar.classList.toggle('open');
                    root.querySelector('[data-close-sidebar]').hidden = !open;
                    target.setAttribute('aria-expanded', String(open));
                }
                if (target.hasAttribute('data-close-sidebar')) {
                    root.querySelector('.admin-sidebar').classList.remove('open');
                    target.hidden = true;
                    root.querySelector('[data-sidebar]').setAttribute('aria-expanded', 'false');
                }
                if (target.dataset.sectionMove) {
                    const form = root.querySelector('#settings-form');
                    if (form.dataset.dirty === 'true')
                        throw new Error('Simpan pengaturan profil terlebih dahulu sebelum mengubah susunan.');
                    const next = clone(document),
                        i = next.settings.sections.findIndex((v) => v.key === target.dataset.sectionMove),
                        j = i + Number(target.dataset.direction);
                    if (j >= 0 && j < next.settings.sections.length) {
                        [next.settings.sections[i], next.settings.sections[j]] = [
                            next.settings.sections[j],
                            next.settings.sections[i],
                        ];
                        persist(next);
                        render();
                    }
                }
                if (target.hasAttribute('data-export')) {
                    const blob = new Blob([JSON.stringify(document, null, 2) + '\n'], {
                            type: 'application/json',
                        }),
                        url = URL.createObjectURL(blob),
                        link = globalThis.document.createElement('a');
                    link.href = url;
                    link.download = 'arunika-portfolio.json';
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                    toast('JSON diekspor.');
                }
                if (target.hasAttribute('data-reset'))
                    confirmAction(
                        'Kembalikan data contoh?',
                        'Semua perubahan di browser ini akan diganti data awal. Ekspor dahulu jika ingin menyimpan perubahan.',
                        () => {
                            persist(clone(seed));
                        },
                    );
            } catch (error) {
                toast(error.message, true);
            }
        },
        { signal },
    );
    root.addEventListener(
        'input',
        (event) => {
            if (event.target.hasAttribute('data-search')) {
                query = event.target.value;
                updateList();
            }
            if (event.target.closest('#settings-form')) event.target.closest('form').dataset.dirty = 'true';
        },
        { signal },
    );
    root.addEventListener(
        'change',
        async (event) => {
            try {
                if (event.target.hasAttribute('data-status')) {
                    status = event.target.value;
                    updateList();
                }
                if (event.target.dataset.sectionToggle) {
                    if (root.querySelector('#settings-form').dataset.dirty === 'true') {
                        event.target.checked = !event.target.checked;
                        throw new Error('Simpan pengaturan profil sebelum mengubah bagian.');
                    }
                    const next = clone(document);
                    next.settings.sections.find((v) => v.key === event.target.dataset.sectionToggle).enabled =
                        event.target.checked;
                    persist(next);
                    toast('Visibilitas bagian tersimpan.');
                }
                if (event.target.hasAttribute('data-import')) {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    event.target.value = '';
                    if (file.size > 4500000) throw new Error('File JSON maksimal 4,5 MB.');
                    const data = JSON.parse(await file.text());
                    confirmAction(
                        'Impor data demo?',
                        'Data browser saat ini akan diganti isi file JSON. Ekspor data saat ini jika ingin menyimpannya.',
                        () => persist(data),
                    );
                }
                if (event.target.hasAttribute('data-image-upload') && event.target.closest('#settings-form'))
                    await wireImage(event.target);
            } catch (error) {
                toast(error.message, true);
            }
        },
        { signal },
    );
    root.addEventListener(
        'submit',
        (event) => {
            if (event.target.id !== 'settings-form') return;
            event.preventDefault();
            try {
                const next = clone(document);
                next.settings = { ...next.settings, ...readForm(event.target) };
                persist(next);
                render();
                toast('Profil tersimpan di browser ini.');
            } catch (error) {
                event.target.querySelector('[data-form-error]').innerHTML = formError(error.message);
            }
        },
        { signal },
    );
    globalThis.document.addEventListener(
        'keydown',
        (event) => {
            if (event.key === 'Escape' && root.querySelector('.admin-sidebar.open')) {
                root.querySelector('[data-close-sidebar]').click();
                root.querySelector('[data-sidebar]').focus();
            }
        },
        { signal },
    );
    render();
    return {
        destroy: () => controller.abort(),
        refresh: (next) => {
            document = next;
            render();
        },
    };
}
