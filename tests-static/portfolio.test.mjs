import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { validateDocument, publishedData, saveDocument, STORAGE_KEY } from '../site/assets/js/store.js';
import { renderSite } from '../site/assets/js/site.js';
import { escapeHtml, safeUrl, clone } from '../site/assets/js/ui.js';
import { getReviewStats } from '../site/assets/js/pages.js';
import { pageKeys, pageUrl, resolvePage } from '../site/assets/js/routes.js';
import { matchesSearch } from '../site/assets/js/search.js';
const seed = JSON.parse(await fs.readFile(new URL('../site/data/hotel.json', import.meta.url), 'utf8'));
test('home previews reflect edited content, published status and enabled sections', () => {
    const data = validateDocument(clone(seed));
    const facility = data.items.find((item) => item.type === 'facility');
    facility.data.title.id = 'Fasilitas hasil edit admin';
    const photo = data.items.find((item) => item.type === 'gallery');
    photo.status = 'draft';
    let html = renderSite(data);
    assert.match(html, /Fasilitas hasil edit admin/);
    assert.ok(html.includes(`/id/facilities#facility-${facility.id}`));
    assert.ok(!html.includes(`Perbesar foto: ${photo.data.title.id}`));
    const publishedGallery = publishedData(data).items.filter((item) => item.type === 'gallery');
    assert.ok(
        html.includes(`data-gallery="0" aria-label="Perbesar foto: ${publishedGallery[0].data.title.id}"`),
    );
    for (const key of ['gallery', 'faq', 'facilities']) {
        data.settings.sections.find((section) => section.key === key).enabled = false;
    }
    html = renderSite(data);
    assert.ok(!html.includes('class="home-gallery-mosaic"'));
    assert.ok(!html.includes('class="section home-faq'));
    assert.ok(!html.includes('Fasilitas hasil edit admin'));
});
test('FAQ search matches punctuation variants, combined keywords, answers and clearing', () => {
    const content = 'Boleh meminta check-in lebih awal? Tulis perkiraan waktu tiba saat menghubungi hotel.';
    for (const query of ['check in', 'CHECK-IN', 'checkin', '  checkin   awal ', 'waktu tiba', ''])
        assert.equal(matchesSearch(content, query), true, query);
    assert.equal(matchesSearch('Apakah tersedia Wi-Fi?', 'wifi'), true);
    assert.equal(matchesSearch('When does check-out start?', 'checkout'), true);
    assert.equal(matchesSearch(content, 'sarapan gratis'), false);
});

test('sample content is bilingual and evidence notes are omitted from deployable data', () => {
    const normalized = validateDocument(seed);
    assert.equal(normalized.items.filter((item) => item.type === 'testimonial').length, 48);
    assert.ok(normalized.items.every((item) => item.data.title.id && item.data.title.en));
    assert.ok(normalized.items.every((item) => !('proof' in item.data)));
    assert.ok(normalized.items.every((item) => item.is_demo));
});
test('public view filters drafts while preview includes drafts, in saved order', () => {
    const data = validateDocument(seed);
    data.items[0].status = 'draft';
    data.items[1].sort_order = 0;
    assert.equal(publishedData(data).items.length, seed.items.length - 1);
    assert.equal(publishedData(data, true).items.length, seed.items.length);
    assert.equal(publishedData(data).items[0].id, 2);
});
test('publication requires both languages and photograph descriptions', () => {
    const data = clone(seed);
    data.items[0].data.title.en = '';
    assert.throws(() => validateDocument(data), /kedua bahasa/);
    data.items[0].status = 'draft';
    assert.doesNotThrow(() => validateDocument(data));
    data.items[0].status = 'published';
    data.items[0].data.title.en = 'Deluxe';
    data.items[0].data.alt.en = '';
    assert.throws(() => validateDocument(data), /alternatif/);
});
test('review source and consent are required for non-sample publication', () => {
    const data = clone(seed),
        review = data.items.find((item) => item.type === 'testimonial');
    review.is_demo = false;
    review.data.consent = false;
    assert.throws(() => validateDocument(data), /konfirmasi izin/);
    review.data.source = 'Ulasan langsung';
    review.data.consent = true;
    assert.doesNotThrow(() => validateDocument(data));
});
test('ratings, capacity, duplicate IDs and broken section imports are rejected', () => {
    const rating = clone(seed);
    rating.items.find((v) => v.type === 'testimonial').data.rating = 6;
    assert.throws(() => validateDocument(rating), /Rating/);
    const room = clone(seed);
    room.items[0].data.capacity = 0;
    assert.throws(() => validateDocument(room), /Kapasitas/);
    const ids = clone(seed);
    ids.items[1].id = ids.items[0].id;
    assert.throws(() => validateDocument(ids), /ID/);
    const sections = clone(seed);
    sections.settings.sections[0].key = 'evil';
    assert.throws(() => validateDocument(sections), /Susunan/);
});
test('invalid URLs and unsupported map embeds are rejected', () => {
    for (const url of [
        'javascript:alert(1)',
        'data:text/html,<script>',
        '//evil.test/a',
        'https://user:password@example.com',
        '/assets/../secret',
    ])
        assert.equal(safeUrl(url, true), '');
    assert.ok(safeUrl('https://images.unsplash.com/example.jpg', true));
    assert.ok(safeUrl('data:image/webp;base64,YQ==', true));
    const data = clone(seed);
    data.settings.map_embed_url = 'https://example.com/maps/embed';
    assert.throws(() => validateDocument(data), /Google Maps/);
});
test('user text is escaped in markup and unsafe attributes are never emitted', () => {
    const data = validateDocument(seed);
    data.settings.name = '<img src=x onerror=alert(1)>';
    data.items[0].data.title.id = '"><script>alert(1)</script>';
    const html = renderSite(data);
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
    assert.ok(!html.includes('<script>'));
    assert.equal(escapeHtml('"<&\''), '&quot;&lt;&amp;&#39;');
});
test('storage round-trip and quota failure keep the previously saved document', () => {
    const memory = new Map(),
        storage = { setItem: (key, value) => memory.set(key, value) };
    const saved = saveDocument(seed, storage);
    assert.deepEqual(JSON.parse(memory.get(STORAGE_KEY)), saved);
    const previous = memory.get(STORAGE_KEY);
    assert.throws(
        () =>
            saveDocument(seed, {
                setItem: () => {
                    throw new Error('QuotaExceeded');
                },
            }),
        /belum disimpan/,
    );
    assert.equal(memory.get(STORAGE_KEY), previous);
});
test('section order and visibility control both page and navigation', () => {
    const data = validateDocument(seed);
    data.settings.sections.find((v) => v.key === 'gallery').enabled = false;
    data.settings.sections.sort((a, b) => (a.key === 'testimonials' ? -1 : b.key === 'testimonials' ? 1 : 0));
    const html = renderSite(data);
    assert.ok(!html.includes('id="gallery"'));
    assert.ok(!html.includes('href="/id/gallery"'));
    assert.ok(html.indexOf('id="testimonials"') < html.indexOf('id="about"'));
});
test('navigation leads to independent documents and preserves language/page in preview', () => {
    const html = renderSite(validateDocument(seed), 'id');
    for (const key of pageKeys.filter((key) => key !== 'home')) assert.ok(html.includes(`href="/id/${key}"`));
    assert.ok(!html.includes('href="#rooms"'));
    assert.equal(pageUrl('en', 'room', false, 2), '/en/rooms/detail?room=2');
    assert.deepEqual(resolvePage('/id/rooms/detail', '?room=2'), {
        locale: 'id',
        preview: false,
        view: 'room',
        roomId: 2,
    });
    assert.deepEqual(resolvePage('/admin/preview', '?locale=en&page=gallery'), {
        locale: 'en',
        preview: true,
        view: 'gallery',
        roomId: null,
    });
});
test('statistics reflect visible samples and unrated reviews do not lower the average', () => {
    const data = validateDocument(seed),
        reviews = publishedData(data).items.filter((item) => item.type === 'testimonial');
    const stats = getReviewStats(reviews);
    assert.equal(stats.count, 48);
    assert.equal(stats.average.toFixed(1), '4.8');
    assert.equal(
        stats.distribution.reduce((sum, v) => sum + v.count, 0),
        48,
    );
    assert.equal(getReviewStats([...reviews, { data: { rating: '' } }]).average, stats.average);
    const hidden = clone(data);
    hidden.items.find((item) => item.type === 'testimonial').status = 'draft';
    assert.equal(
        getReviewStats(publishedData(hidden).items.filter((item) => item.type === 'testimonial')).count,
        47,
    );
    assert.deepEqual(getReviewStats([]), {
        count: 0,
        rated: 0,
        average: 0,
        distribution: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 })),
    });
});
test('detailed pages have their own content and review listing is paginated', () => {
    const data = validateDocument(seed);
    assert.ok(renderSite(data, 'id', false, 'rooms').includes('data-room-filter="family"'));
    assert.ok(renderSite(data, 'id', false, 'room', 2).includes('Ruang lebih luas untuk cerita'));
    assert.ok(renderSite(data, 'id', false, 'gallery').includes('data-gallery-filter="kamar"'));
    const reviews = renderSite(data, 'id', false, 'testimonials');
    assert.equal((reviews.match(/class="testimonial-card"/g) || []).length, 9);
    assert.ok(reviews.includes('data-review-page="1"'));
    assert.ok(reviews.includes('Semua nama dan ulasan adalah contoh fiktif.'));
    assert.ok(renderSite(data, 'id', false, 'contact').includes('data-stay-form'));
    assert.ok(renderSite(data, 'en', false, 'faq').includes('data-faq-search'));
});
test('all locale pages are built as readable static HTML with unique titles', async () => {
    for (const lang of ['id', 'en'])
        for (const key of pageKeys) {
            const path = `../dist/${lang}/${key === 'home' ? '' : key + '/'}index.html`;
            const html = await fs.readFile(new URL(path, import.meta.url), 'utf8');
            assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
            assert.ok(html.includes(`data-view="${key}"`));
            assert.ok(html.includes('/assets/css/expanded.css'));
        }
});
test('public reviews remain clearly labeled sample in either language', () => {
    assert.ok(renderSite(validateDocument(seed), 'id').includes('Ulasan contoh'));
    assert.ok(renderSite(validateDocument(seed), 'en').includes('Sample review'));
});
test('built landing pages contain readable content without a client framework', async () => {
    for (const locale of ['id', 'en']) {
        const html = await fs.readFile(new URL(`../dist/${locale}/index.html`, import.meta.url), 'utf8');
        assert.ok(html.includes('<h1>'));
        assert.ok(html.includes('id="testimonials"'));
        assert.ok(html.includes(`lang="${locale}"`));
        assert.ok(!/react|vite|csrf|__HOTEL__/i.test(html));
    }
    const deployed = JSON.parse(
        await fs.readFile(new URL('../dist/data/hotel.json', import.meta.url), 'utf8'),
    );
    assert.ok(deployed.items.every((item) => !('proof' in item.data)));
    const pkg = JSON.parse(await fs.readFile(new URL('../package.json', import.meta.url), 'utf8'));
    assert.equal(Object.keys(pkg.dependencies || {}).length, 0);
});
test('Vercel rewrites resolve existing static pages and all imports are local', async () => {
    const config = JSON.parse(await fs.readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
    assert.equal(config.framework, null);
    assert.equal(config.outputDirectory, 'dist');
    for (const rewrite of config.rewrites)
        await fs.access(new URL(`../dist${rewrite.destination}`, import.meta.url));
    const scripts = await fs.readdir(new URL('../dist/assets/js/', import.meta.url));
    for (const script of scripts) {
        const source = await fs.readFile(new URL(`../dist/assets/js/${script}`, import.meta.url), 'utf8');
        assert.ok(!/from ['"](?:react|lucide|https?:|@)/.test(source));
    }
});
