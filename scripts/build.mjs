import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSite } from '../site/assets/js/site.js';
import { renderLogin } from '../site/assets/js/admin.js';
import { validateDocument } from '../site/assets/js/store.js';
import { escapeHtml as e, localize, safeUrl } from '../site/assets/js/ui.js';
import { pageKeys } from '../site/assets/js/routes.js';
import { pageCopy } from '../site/assets/js/pages.js';
import { text } from '../site/assets/js/copy.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, 'dist');
// Clean only the explicitly resolved build folder inside this project.
if (path.dirname(output) !== root || path.basename(output) !== 'dist')
    throw new Error('Unsafe output directory.');
const data = validateDocument(JSON.parse(await fs.readFile(path.join(root, 'site/data/hotel.json'), 'utf8')));
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
await fs.cp(path.join(root, 'site/assets'), path.join(output, 'assets'), { recursive: true });
await fs.mkdir(path.join(output, 'data'));
await fs.writeFile(path.join(output, 'data/hotel.json'), JSON.stringify(data, null, 2) + '\n');
const configuredOrigin =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
let origin = '';
if (configuredOrigin) {
    const url = new URL(configuredOrigin);
    if (url.protocol !== 'https:' && url.protocol !== 'http:')
        throw new Error('SITE_URL must be HTTP or HTTPS.');
    origin = url.origin;
}
function html({
    lang = 'id',
    mode = 'site',
    preview = false,
    body = '',
    title,
    description,
    route = '/id',
    view = 'home',
}) {
    const s = data.settings;
    const siteTitle = title || localize(s.seo_title, lang) || s.name;
    const siteDescription = description || localize(s.seo_description, lang);
    const privatePage = mode !== 'site' || preview;
    const languageRoute = route.replace(/^\/(id|en)/, '');
    return `<!doctype html>
<html lang="${lang}"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" /><meta name="theme-color" content="#31501d" /><title>${e(siteTitle)}</title><meta name="description" content="${e(siteDescription)}" /><meta name="robots" content="${privatePage ? 'noindex, nofollow' : 'index, follow'}" /><meta property="og:type" content="website" /><meta property="og:title" content="${e(siteTitle)}" /><meta property="og:description" content="${e(siteDescription)}" />${safeUrl(s.hero_image) ? `<meta property="og:image" content="${e(safeUrl(s.hero_image))}" />` : ''}${origin && !privatePage ? `<link rel="canonical" href="${e(origin + route)}" /><link rel="alternate" hreflang="id" href="${e(origin + '/id' + languageRoute)}" /><link rel="alternate" hreflang="en" href="${e(origin + '/en' + languageRoute)}" /><link rel="alternate" hreflang="x-default" href="${e(origin + '/id' + languageRoute)}" />` : ''}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" /><link rel="preload" href="/assets/fonts/manrope-400.woff2" as="font" type="font/woff2" crossorigin /><link rel="stylesheet" href="/assets/css/styles.css" /><link rel="stylesheet" href="/assets/css/expanded.css" /><script type="module" src="/assets/js/app.js"></script></head>
<body data-mode="${mode}" data-view="${view}" data-preview="${preview}"><div id="root">${body}</div><noscript><p class="no-js-message">${mode === 'site' ? 'Halaman dapat dibaca tanpa JavaScript. Aktifkan JavaScript untuk demo admin, menu, dan galeri.' : 'Aktifkan JavaScript untuk mencoba demo admin.'}</p></noscript></body></html>\n`;
}
const pages = [
    ['index.html', { body: renderSite(data, 'id') }],
    ['id/index.html', { body: renderSite(data, 'id') }],
    ['en/index.html', { lang: 'en', route: '/en', body: renderSite(data, 'en') }],
    [
        'admin/index.html',
        {
            mode: 'admin',
            title: 'Content Studio — Demo Admin',
            body: '<main class="fallback-error"><h1>Content Studio</h1><p>Memuat demo admin…</p></main>',
        },
    ],
    ['admin/login/index.html', { mode: 'login', title: 'Coba Demo — Content Studio', body: renderLogin() }],
    [
        'admin/preview/index.html',
        { preview: true, title: 'Pratinjau Draft — Arunika Stay', body: renderSite(data, 'id', true) },
    ],
    [
        '404.html',
        {
            mode: 'error',
            title: 'Halaman tidak ditemukan — Arunika Stay',
            body: '<main class="fallback-error"><h1>Halaman tidak ditemukan.</h1><p>Kembali dan temukan ruang untuk singgah.</p><a class="button" href="/id">Kembali ke beranda</a></main>',
        },
    ],
];
for (const lang of ['id', 'en']) {
    for (const view of [...pageKeys.filter((key) => key !== 'home'), 'room']) {
        const route = `/${lang}/${view === 'room' ? 'rooms/detail' : view}`;
        pages.push([
            `${route.slice(1)}/index.html`,
            {
                lang,
                view,
                route,
                body: renderSite(data, lang, false, view),
                title: `${view === 'room' ? (lang === 'id' ? 'Detail kamar' : 'Room details') : text[lang][view]} — ${data.settings.name}`,
                description: pageCopy[lang][view][2],
            },
        ]);
    }
}
for (const [file, options] of pages) {
    const destination = path.join(output, file);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, html(options));
}
await fs.writeFile(
    path.join(output, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /admin\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}`,
);
if (origin)
    await fs.writeFile(
        path.join(output, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages
            .filter(
                ([, options]) =>
                    options.route && !options.preview && (!options.mode || options.mode === 'site'),
            )
            .map(([, options]) => `<url><loc>${e(origin + options.route)}</loc></url>`)
            .join('')}<url><loc>${e(origin)}/id</loc></url></urlset>`,
    );
console.log('Static site built in dist/: HTML, CSS, JavaScript. No runtime dependencies.');
