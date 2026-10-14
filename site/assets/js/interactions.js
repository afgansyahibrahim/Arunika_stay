import { escapeHtml as e, localize, icon, toast } from './ui.js';
import { publishedData } from './store.js';
import { formatCounter, reviewCard } from './pages.js';
import { matchesSearch } from './search.js';

export function bindEnhancements(root, document, lang, preview) {
    const controller = new AbortController(),
        options = { signal: controller.signal },
        page = publishedData(document, preview);
    const id = lang === 'id',
        reduced = matchMedia('(prefers-reduced-motion: reduce)').matches,
        frames = new Set();
    const counters = [...root.querySelectorAll('[data-counter]')];
    const finishCounter = (node) => {
        node.textContent = formatCounter(
            Number(node.dataset.counter),
            Number(node.dataset.decimals || 0),
            lang,
        );
        node.dataset.counted = 'true';
    };
    const counterObserver = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const node = entry.target,
                    target = Number(node.dataset.counter),
                    decimals = Number(node.dataset.decimals || 0);
                counterObserver.unobserve(node);
                const start = performance.now();
                function tick(now) {
                    const progress = Math.min(1, Math.max(0, (now - start) / 1800)),
                        ease = 1 - Math.pow(1 - progress, 3);
                    node.textContent = formatCounter(target * ease, decimals, lang);
                    if (progress < 1) {
                        const frame = requestAnimationFrame((time) => {
                            frames.delete(frame);
                            tick(time);
                        });
                        frames.add(frame);
                    } else finishCounter(node);
                }
                tick(start);
            }
        },
        { threshold: 0.35 },
    );
    counters.forEach((node) => {
        if (reduced) finishCounter(node);
        else {
            node.textContent = formatCounter(0, Number(node.dataset.decimals || 0), lang);
            counterObserver.observe(node);
        }
    });
    const revealObserver = new IntersectionObserver(
        (entries) =>
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    revealObserver.unobserve(entry.target);
                }
            }),
        { threshold: 0.08 },
    );
    if (!reduced) {
        root.querySelector('.site')?.classList.add('has-motion');
        root.querySelectorAll('.reveal').forEach((node) => revealObserver.observe(node));
    }
    function galleryFilter(value) {
        const cards = [...root.querySelectorAll('[data-gallery]')];
        let count = 0;
        cards.forEach((card) => {
            card.hidden = value !== 'all' && card.dataset.category !== value;
            if (!card.hidden) count++;
        });
        root.querySelectorAll('[data-gallery-filter]').forEach((button) => {
            const active = button.dataset.galleryFilter === value;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        const label = root.querySelector('[data-gallery-count]');
        if (label) label.textContent = `${count} ${id ? 'foto' : 'photographs'}`;
    }
    if (root.querySelector('[data-gallery-filter]')) galleryFilter('all');
    function roomFilter(value) {
        let count = 0;
        root.querySelectorAll('.room-card').forEach((card) => {
            const capacity = Number(card.dataset.capacity);
            card.hidden = value === 'couple' ? capacity > 2 : value === 'family' ? capacity < 3 : false;
            if (!card.hidden) count++;
        });
        root.querySelectorAll('[data-room-filter]').forEach((button) => {
            const active = button.dataset.roomFilter === value;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        const label = root.querySelector('[data-room-count]');
        if (label) label.textContent = `${count} ${id ? 'pilihan kamar' : 'room choices'}`;
    }
    if (root.querySelector('[data-room-filter]')) roomFilter('all');
    let reviewPage = 1,
        query = '',
        rating = 'all',
        sort = 'recent';
    const reviews = page.items.filter((item) => item.type === 'testimonial');
    function updateReviews() {
        const grid = root.querySelector('[data-review-grid]');
        if (!grid) return;
        const filtered = reviews.filter(
            (item) =>
                (rating === 'all' || String(item.data.rating) === rating) &&
                `${localize(item.data.title, lang)} ${localize(item.data.description, lang)} ${item.data.source || ''}`
                    .toLocaleLowerCase()
                    .includes(query.toLocaleLowerCase()),
        );
        filtered.sort((a, b) =>
            sort === 'highest'
                ? (b.data.rating || 0) - (a.data.rating || 0) || b.id - a.id
                : sort === 'lowest'
                  ? (a.data.rating || 0) - (b.data.rating || 0) || b.id - a.id
                  : String(b.data.date || '').localeCompare(String(a.data.date || '')) || b.id - a.id,
        );
        const pages = Math.max(1, Math.ceil(filtered.length / 9));
        reviewPage = Math.min(reviewPage, pages);
        const start = (reviewPage - 1) * 9,
            visible = filtered.slice(start, start + 9);
        grid.innerHTML = visible.length
            ? visible.map((item) => reviewCard(item, lang)).join('')
            : `<div class="no-results"><h3>${id ? 'Cerita belum ditemukan.' : 'No stories found.'}</h3><p>${id ? 'Coba kata kunci atau rating yang lain.' : 'Try another keyword or rating.'}</p></div>`;
        root.querySelector('[data-review-results]').textContent =
            `${id ? 'Menampilkan' : 'Showing'} ${filtered.length ? start + 1 : 0}–${Math.min(start + 9, filtered.length)} ${id ? 'dari' : 'of'} ${filtered.length} ${id ? 'ulasan contoh' : 'sample reviews'}`;
        root.querySelector('[data-review-page-label]').textContent = `${reviewPage} / ${pages}`;
        root.querySelector('[data-review-page="-1"]').disabled = reviewPage <= 1;
        root.querySelector('[data-review-page="1"]').disabled = reviewPage >= pages;
    }
    updateReviews();
    const faqInput = root.querySelector('[data-faq-search]');
    const faqEntries = [...root.querySelectorAll('.faq-list details')].map((detail) => {
        const item = page.items.find(
            (item) => item.type === 'faq' && item.id === Number(detail.dataset.faqId),
        );
        return {
            detail,
            text: item
                ? `${localize(item.data.title, lang)} ${localize(item.data.description, lang)}`
                : detail.textContent,
            wasOpen: detail.open,
        };
    });
    let faqSearching = false;
    function updateFaq() {
        if (!faqInput) return;
        const toolbar = faqInput.closest('.faq-search');
        const preservePosition = toolbar.contains(globalThis.document.activeElement);
        const headerHeight = root.querySelector('.site-topbar')?.getBoundingClientRect().height || 0;
        const targetTop = Math.min(
            Math.max(toolbar.getBoundingClientRect().top, headerHeight + 20),
            Math.max(headerHeight + 20, innerHeight - 180),
        );
        const query = faqInput.value.trim();
        if (query && !faqSearching) faqEntries.forEach((entry) => (entry.wasOpen = entry.detail.open));
        let matches = 0;
        for (const entry of faqEntries) {
            const match = matchesSearch(entry.text, query);
            entry.detail.hidden = !match;
            if (match) matches++;
            if (query) entry.detail.open = match;
            else if (faqSearching) entry.detail.open = entry.wasOpen;
        }
        faqSearching = !!query;
        root.querySelector('[data-faq-empty]').hidden = matches > 0;
        root.querySelector('[data-faq-results]').textContent = id
            ? `Menampilkan ${matches} dari ${faqEntries.length} pertanyaan`
            : `Showing ${matches} of ${faqEntries.length} questions`;
        root.querySelector('[data-clear-faq]').hidden = !query;
        if (preservePosition) {
            const frame = requestAnimationFrame(() => {
                frames.delete(frame);
                const delta = toolbar.getBoundingClientRect().top - targetTop;
                if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
            });
            frames.add(frame);
        }
    }
    updateFaq();
    faqInput?.addEventListener('search', updateFaq, options);
    root.addEventListener(
        'input',
        (event) => {
            if (event.target.hasAttribute('data-review-search')) {
                query = event.target.value;
                reviewPage = 1;
                updateReviews();
            }
            if (event.target.hasAttribute('data-faq-search')) {
                updateFaq();
            }
        },
        options,
    );
    root.addEventListener(
        'change',
        (event) => {
            if (event.target.hasAttribute('data-review-rating')) {
                rating = event.target.value;
                reviewPage = 1;
                updateReviews();
            }
            if (event.target.hasAttribute('data-review-sort')) {
                sort = event.target.value;
                reviewPage = 1;
                updateReviews();
            }
        },
        options,
    );
    root.addEventListener(
        'click',
        (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            if (button.hasAttribute('data-clear-faq')) {
                faqInput.value = '';
                updateFaq();
                faqInput.focus();
            }
            if (button.hasAttribute('data-gallery-filter')) galleryFilter(button.dataset.galleryFilter);
            if (button.hasAttribute('data-room-filter')) roomFilter(button.dataset.roomFilter);
            if (button.hasAttribute('data-review-page')) {
                reviewPage += Number(button.dataset.reviewPage);
                updateReviews();
                root.querySelector('[data-review-grid]').scrollIntoView({
                    block: 'start',
                    behavior: reduced ? 'instant' : 'smooth',
                });
            }
        },
        options,
    );
    const stayForm = root.querySelector('[data-stay-form]');
    if (stayForm) {
        const arrival = stayForm.elements.arrival,
            departure = stayForm.elements.departure;
        const today = new Date(),
            localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        arrival.min = localDate;
        departure.min = localDate;
        const wanted = new URLSearchParams(location.search).get('room');
        if ([...stayForm.elements.room.options].some((option) => option.value === wanted))
            stayForm.elements.room.value = wanted;
        arrival.addEventListener(
            'change',
            () => {
                if (arrival.value) {
                    const next = new Date(`${arrival.value}T12:00:00`);
                    next.setDate(next.getDate() + 1);
                    departure.min = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
                }
            },
            options,
        );
        stayForm.addEventListener(
            'submit',
            (event) => {
                event.preventDefault();
                const values = new FormData(stayForm),
                    error = root.querySelector('[data-planner-error]');
                error.textContent = '';
                if (values.get('arrival') < localDate || values.get('departure') <= values.get('arrival')) {
                    error.textContent = id
                        ? 'Check-out harus setelah check-in, dan tanggal check-in tidak boleh sudah lewat.'
                        : 'Check-out must follow check-in, and your arrival date cannot be in the past.';
                    return;
                }
                const room = values.get('room'),
                    notes = values.get('notes').trim();
                const message = id
                    ? `Halo ${document.settings.name}, saya ingin menanyakan ketersediaan kamar.\nCheck-in: ${values.get('arrival')}\nCheck-out: ${values.get('departure')}\nJumlah tamu: ${values.get('guests')}\nPilihan kamar: ${room || 'Mohon rekomendasi'}${notes ? '\nCatatan: ' + notes : ''}`
                    : `Hello ${document.settings.name}, I would like to ask about room availability.\nCheck-in: ${values.get('arrival')}\nCheck-out: ${values.get('departure')}\nGuests: ${values.get('guests')}\nRoom preference: ${room || 'Please recommend a room'}${notes ? '\nNotes: ' + notes : ''}`;
                const result = root.querySelector('[data-planner-result]');
                result.hidden = false;
                result.innerHTML = `<h4>${id ? 'Pesanmu siap.' : 'Your message is ready.'}</h4><textarea readonly aria-label="${id ? 'Pratinjau pesan' : 'Message preview'}">${e(message)}</textarea><div class="data-actions"><button class="button button-outline" data-copy-message>${id ? 'Salin pesan' : 'Copy message'}${icon('file', 16)}</button>${document.settings.whatsapp ? `<a class="button" href="https://wa.me/${document.settings.whatsapp}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer">WhatsApp${icon('arrow-up-right', 18)}</a>` : ''}</div><p class="sample-note">${document.settings.whatsapp ? (id ? 'Pesan baru dikirim saat kamu membukanya di WhatsApp.' : 'Send the message yourself after opening WhatsApp.') : id ? 'Nomor WhatsApp belum diatur di demo. Kamu dapat menambahkannya melalui admin.' : 'No WhatsApp number is set in the demo. Add one in the admin.'}</p>`;
                result.querySelector('[data-copy-message]').onclick = async () => {
                    try {
                        await navigator.clipboard.writeText(message);
                        toast(id ? 'Pesan disalin.' : 'Message copied.');
                    } catch {
                        result.querySelector('textarea').select();
                        toast(
                            id
                                ? 'Pilih dan salin pesan dari kotak pratinjau.'
                                : 'Select and copy the message in the preview.',
                        );
                    }
                };
                result.scrollIntoView({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
            },
            options,
        );
    }
    return () => {
        controller.abort();
        counterObserver.disconnect();
        revealObserver.disconnect();
        frames.forEach(cancelAnimationFrame);
    };
}
