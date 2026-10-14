import { clone, safeUrl } from './ui.js';
export const STORAGE_KEY = 'arunika-portfolio-content-v2';
export const itemTypes = ['room', 'facility', 'gallery', 'testimonial', 'faq'];
export const sectionKeys = ['about', 'rooms', 'facilities', 'gallery', 'testimonials', 'faq', 'contact'];
const bilingualKeys = [
    'tagline',
    'hero_label',
    'hero_title',
    'hero_subtitle',
    'hero_alt',
    'about_title',
    'about_description',
    'about_alt',
    'address',
    'seo_title',
    'seo_description',
];
const settingsKeys = [
    'name',
    'is_demo',
    ...bilingualKeys,
    'hero_image',
    'about_image',
    'whatsapp',
    'phone',
    'email',
    'map_url',
    'map_embed_url',
    'instagram',
    'logo',
    'checkin',
    'checkout',
    'sections',
    'section_copy',
];
const fail = (message) => {
    throw new Error(message);
};
function limitedText(value, max = 12000) {
    if (typeof value !== 'string' || value.length > max) fail('Teks tidak valid atau terlalu panjang.');
    return value;
}
function bilingual(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        fail('Konten harus memiliki bahasa Indonesia dan Inggris.');
    return { id: limitedText(value.id ?? ''), en: limitedText(value.en ?? '') };
}
export function validateDocument(input) {
    if (
        !input ||
        input.schema_version !== 1 ||
        !input.settings ||
        !Array.isArray(input.items) ||
        input.items.length > 250
    )
        fail('Format file tidak sesuai. Gunakan JSON hasil ekspor demo ini.');
    const s = input.settings,
        settings = {};
    for (const key of settingsKeys) {
        if (bilingualKeys.includes(key)) settings[key] = bilingual(s[key]);
        else if (key === 'sections') {
            if (
                !Array.isArray(s.sections) ||
                s.sections.length !== sectionKeys.length ||
                new Set(s.sections.map((v) => v.key)).size !== sectionKeys.length ||
                s.sections.some((v) => !sectionKeys.includes(v.key) || typeof v.enabled !== 'boolean')
            )
                fail('Susunan bagian halaman tidak valid.');
            settings.sections = s.sections.map((v) => ({ key: v.key, enabled: v.enabled }));
        } else if (key === 'section_copy') {
            settings.section_copy = {};
            for (const section of sectionKeys)
                if (s.section_copy?.[section])
                    settings.section_copy[section] = {
                        title: bilingual(s.section_copy[section].title || { id: '', en: '' }),
                        subtitle: bilingual(s.section_copy[section].subtitle || { id: '', en: '' }),
                    };
        } else if (key === 'is_demo') settings.is_demo = true;
        else
            settings[key] = limitedText(
                s[key] ?? '',
                key.endsWith('image') || key === 'logo' ? 1500000 : 2000,
            );
    }
    if (!settings.name.trim()) fail('Nama hotel wajib diisi.');
    for (const key of ['hero_image', 'about_image', 'logo'])
        if (settings[key] && !safeUrl(settings[key], true))
            fail('Gambar harus memakai URL HTTPS atau unggahan JPEG, PNG, WebP.');
    for (const key of ['map_url', 'map_embed_url', 'instagram'])
        if (settings[key] && !safeUrl(settings[key])) fail('Tautan harus memakai HTTPS.');
    if (settings.map_embed_url) {
        const url = new URL(settings.map_embed_url);
        if (
            !['www.google.com', 'maps.google.com'].includes(url.hostname) ||
            !url.pathname.startsWith('/maps/embed')
        )
            fail('Gunakan tautan embed Google Maps.');
    }
    if (settings.whatsapp && !/^\d{8,15}$/.test(settings.whatsapp))
        fail('Nomor WhatsApp harus 8–15 digit, diawali kode negara.');
    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) fail('Email tidak valid.');
    const ids = new Set();
    const items = input.items.map((item) => {
        if (
            !itemTypes.includes(item.type) ||
            !Number.isSafeInteger(item.id) ||
            item.id < 1 ||
            ids.has(item.id) ||
            !['draft', 'published'].includes(item.status) ||
            !item.data
        )
            fail('Data konten atau ID tidak valid.');
        ids.add(item.id);
        const d = item.data,
            data = { title: bilingual(d.title), description: bilingual(d.description || { id: '', en: '' }) };
        for (const key of [
            'image',
            'alt',
            'features',
            'capacity',
            'size',
            'price',
            'icon',
            'category',
            'rating',
            'source',
            'source_url',
            'date',
            'avatar',
            'featured',
            'translated',
            'original_locale',
            'consent',
        ]) {
            if (!(key in d)) continue;
            if (['alt', 'features'].includes(key)) data[key] = bilingual(d[key]);
            else if (['featured', 'translated', 'consent'].includes(key)) data[key] = !!d[key];
            else if (['capacity', 'size', 'price', 'rating'].includes(key)) {
                const n = d[key] === '' || d[key] === null ? '' : Number(d[key]);
                if (n !== '' && (!Number.isFinite(n) || n < 0 || n > 1000000000))
                    fail('Angka pada konten tidak valid.');
                data[key] = n;
            } else
                data[key] = limitedText(
                    String(d[key] ?? ''),
                    ['image', 'avatar'].includes(key) ? 1500000 : 2000,
                );
        }
        if (
            data.rating !== undefined &&
            data.rating !== '' &&
            (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5)
        )
            fail('Rating harus 1 sampai 5.');
        if (
            item.type === 'room' &&
            (!Number.isInteger(data.capacity) || data.capacity < 1 || data.capacity > 30)
        )
            fail('Kapasitas kamar harus 1 sampai 30 tamu.');
        for (const key of ['image', 'avatar'])
            if (data[key] && !safeUrl(data[key], true)) fail('URL gambar tidak valid.');
        if (data.source_url && !safeUrl(data.source_url)) fail('Tautan sumber harus HTTPS.');
        if (data.date && (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date))))
            fail('Tanggal ulasan tidak valid.');
        if (item.status === 'published') {
            if (
                !data.title.id.trim() ||
                !data.title.en.trim() ||
                (item.type !== 'gallery' && (!data.description.id.trim() || !data.description.en.trim()))
            )
                fail('Konten published wajib lengkap dalam kedua bahasa.');
            if (
                ['room', 'facility', 'gallery'].includes(item.type) &&
                (!data.image || !data.alt?.id.trim() || !data.alt?.en.trim())
            )
                fail('Foto dan teks alternatif kedua bahasa wajib diisi.');
            if (item.type === 'testimonial' && !item.is_demo && (!data.source?.trim() || !data.consent))
                fail('Testimoni memerlukan sumber dan konfirmasi izin sebelum ditampilkan.');
        }
        return {
            id: item.id,
            type: item.type,
            status: item.status,
            is_demo: true,
            sort_order: Math.max(0, Math.min(9999, Number(item.sort_order) || 0)),
            data,
        };
    });
    return { schema_version: 1, settings, items };
}
export function publishedData(document, preview = false) {
    return {
        ...document,
        items: document.items
            .filter((item) => preview || item.status === 'published')
            .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    };
}
export function saveDocument(document, storage) {
    const normalized = validateDocument(document);
    try {
        (storage ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
        fail(
            'Penyimpanan browser penuh atau dinonaktifkan. Kurangi gambar atau ekspor data terlebih dahulu. Perubahan belum disimpan.',
        );
    }
    return normalized;
}
export async function loadDocument(storage) {
    const response = await fetch('/data/hotel.json');
    if (!response.ok) fail('Data demo tidak dapat dimuat. Coba muat ulang halaman.');
    const seed = validateDocument(await response.json());
    let warning = '';
    try {
        const raw = (storage ?? globalThis.localStorage).getItem(STORAGE_KEY);
        if (raw) return { document: validateDocument(JSON.parse(raw)), seed, warning };
    } catch {
        warning = 'Data lokal tidak dapat dibaca. Data contoh ditampilkan; ekspor atau reset melalui admin.';
    }
    return { document: clone(seed), seed, warning };
}
