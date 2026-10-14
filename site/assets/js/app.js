import { loadDocument, STORAGE_KEY, validateDocument } from './store.js';
import { renderSite, bindSite } from './site.js';
import { bindAdmin } from './admin.js';
import { localize, toast } from './ui.js';
import { resolvePage } from './routes.js';
import { pageCopy } from './pages.js';
import { text } from './copy.js';

const root = document.getElementById('root'),
    mode = document.body.dataset.mode;
if (mode !== 'login' && mode !== 'error') {
    try {
        const { document: content, seed, warning } = await loadDocument();
        const { locale, preview, view, roomId } = resolvePage(location.pathname, location.search);
        document.documentElement.lang = locale;
        let cleanup, admin;
        function show(data) {
            if (mode === 'admin') {
                if (admin) admin.refresh(data);
                else admin = bindAdmin(root, data, seed);
            } else {
                cleanup?.();
                root.innerHTML = renderSite(data, locale, preview, view, roomId);
                cleanup = bindSite(root, data, locale, preview);
                const room = data.items.find(
                    (item) =>
                        item.type === 'room' &&
                        (preview || item.status === 'published') &&
                        (roomId === null || item.id === roomId),
                );
                document.title =
                    view === 'home'
                        ? localize(data.settings.seo_title, locale) || data.settings.name
                        : `${view === 'room' ? localize(room?.data.title, locale) || (locale === 'id' ? 'Detail kamar' : 'Room details') : text[locale][view]} — ${data.settings.name}`;
                const description =
                    view === 'home'
                        ? localize(data.settings.seo_description, locale)
                        : view === 'room' && room
                          ? localize(room.data.description, locale).split('\n\n')[0]
                          : pageCopy[locale][view]?.[2] || '';
                document.querySelector('meta[name="description"]').content = description;
                document.querySelector('meta[property="og:title"]').content = document.title;
                document.querySelector('meta[property="og:description"]').content = description;
            }
        }
        show(content);
        // Restore deep links after replacing the prerendered HTML with saved content.
        if (mode !== 'admin' && location.hash) {
            let target;
            try {
                target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
            } catch {
                target = null;
            }
            if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant' }));
        }
        if (warning) toast(warning, true);
        window.addEventListener('storage', (event) => {
            if (event.key !== STORAGE_KEY && event.key !== null) return;
            if (
                document.querySelector('dialog[open]') ||
                document.querySelector('#settings-form[data-dirty="true"]')
            )
                return toast('Data berubah di tab lain. Muat ulang setelah menyelesaikan edit ini.');
            try {
                show(event.newValue ? validateDocument(JSON.parse(event.newValue)) : seed);
            } catch {
                toast('Data dari tab lain tidak valid. Muat ulang untuk menampilkan contoh.', true);
            }
        });
    } catch (error) {
        // The prerendered landing page remains readable when storage/network is unavailable.
        if (mode === 'admin')
            root.innerHTML =
                '<main class="fallback-error"><h1>Demo belum dapat dimuat.</h1><p>Coba muat ulang halaman.</p><a href="/id">Kembali ke website</a></main>';
        toast(error.message, true);
    }
}
