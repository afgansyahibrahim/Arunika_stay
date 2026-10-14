import { text } from './copy.js';
import { escapeHtml as e, localize, money, safeUrl, icon, logo, openModal, toast } from './ui.js';
import { publishedData } from './store.js';
import { pageUrl } from './routes.js';
import { bindEnhancements } from './interactions.js';
import {
    pageIntro,
    statsStrip,
    homeStory,
    homeExperiences,
    homeGallery,
    homeFaq,
    stayCta,
    aboutValues,
    roomBenefits,
    roomDetails,
    reviewsPage,
    reviewCard,
    getReviewStats,
    galleryFilters,
    faqSearch,
    contactPlanner,
    footer,
    viewAll,
} from './pages.js';

const image = (url, alt, className = '', priority = false) =>
    safeUrl(url, true)
        ? `<img class="${className}" src="${e(safeUrl(url, true))}" alt="${e(alt)}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} />`
        : '';
export function renderSite(document, lang = 'id', preview = false, view = 'home', roomId = null) {
    const page = publishedData(document, preview),
        s = page.settings,
        t = text[lang],
        l = (value) => e(localize(value, lang));
    const items = (type) => page.items.filter((item) => item.type === type);
    const rooms = items('room'),
        facilities = items('facility'),
        gallery = items('gallery'),
        testimonials = items('testimonial')
            .filter((item) => item.data.featured)
            .slice(0, 3),
        faqs = items('faq');
    const available = {
        about: !!localize(s.about_description, lang),
        rooms: rooms.length,
        facilities: facilities.length,
        gallery: gallery.length,
        testimonials: items('testimonial').length,
        faq: faqs.length,
        contact: true,
    };
    const sections = s.sections.filter((section) => section.enabled && available[section.key]);
    const has = (key) => sections.some((section) => section.key === key);
    const url = (key, id = null) => pageUrl(lang, key, preview, id);
    const contactUrl = (name = '') =>
        url('contact') + (name ? `${preview ? '&' : '?'}room=${encodeURIComponent(name)}` : '');
    const book = (label = t.book, room = '', cls = '') =>
        `<a class="button ${cls}" href="${e(contactUrl(room))}">${e(label)}${icon('arrow-up-right', 17)}</a>`;
    const header = (key, label, title, description) =>
        `<div class="section-heading"><span class="eyebrow">${e(label)}</span><h2>${l(s.section_copy?.[key]?.title) || e(title)}</h2>${description ? `<p>${l(s.section_copy?.[key]?.subtitle) || e(description)}</p>` : ''}</div>`;
    const nav = (location) =>
        `<a class="site-topbar-brand" href="${url('home')}" aria-label="${e(s.name)}">${logo(s)}</a><nav id="${location}-menu" class="site-nav-links" aria-label="${e(t.menu)}"><a href="${url('home')}" ${view === 'home' ? 'aria-current="page"' : ''}>${e(t.home)}</a>${sections.map((section) => `<a href="${url(section.key)}" ${view === section.key || (view === 'room' && section.key === 'rooms') ? 'aria-current="page"' : ''}>${e(t[section.key])}</a>`).join('')}</nav><div class="site-topbar-actions"><a class="language-toggle" href="${pageUrl(lang === 'id' ? 'en' : 'id', view, preview, roomId)}" aria-label="${lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}">${lang === 'id' ? 'EN' : 'ID'}<span>↗</span></a><button id="${location}-menu-toggle" class="site-menu-toggle" aria-label="${e(t.menu)}" aria-expanded="false" aria-controls="${location}-menu" data-toggle-menu="${location}">${icon('menu', 21)}</button></div>`;
    const render = (key) => {
        if (key === 'about')
            return `<section class="section about-section container" id="about"><div class="about-image">${image(s.about_image, localize(s.about_alt, lang))}<span class="image-note">${icon('leaf', 16)}${l(s.tagline)}</span></div><div class="about-copy"><span class="eyebrow">${e(t.aboutLabel)}</span><h2>${l(s.about_title)}</h2><p class="preserve-lines">${l(s.about_description)}</p>${has('rooms') ? `<a class="button button-outline" href="${url('rooms')}">${e(t.explore)}${icon('arrow-up-right', 17)}</a>` : ''}<div class="about-times"><span>${e(t.checkin)}<strong>${e(s.checkin)}</strong></span><span>${e(t.checkout)}<strong>${e(s.checkout)}</strong></span><span>${icon('leaf', 24)}<small>${l(s.tagline)}</small></span></div></div></section>`;
        if (key === 'rooms')
            return `<section class="section rooms-section" id="rooms"><div class="container"><div class="heading-row">${header(key, t.roomLabel, t.roomTitle, t.roomDesc)}<span class="section-number">01 /</span></div><div class="room-grid">${rooms.map((item) => `<article class="room-card reveal" data-capacity="${item.data.capacity}"><a class="room-image" href="${url('room', item.id)}" aria-label="${e(t.roomDetails)}: ${l(item.data.title)}">${image(item.data.image, localize(item.data.alt, lang))}<span class="image-arrow">${icon('arrow-up-right', 23)}</span></a><div class="room-meta"><span>${icon('users', 14)}${e(item.data.capacity)} ${e(t.guests)}</span>${item.data.size ? `<span>${icon('expand', 14)}${e(item.data.size)} m²</span>` : ''}</div><h3>${l(item.data.title)}</h3><p>${l(item.data.description)}</p><div class="room-bottom">${item.data.price ? `<span class="room-price"><small>${e(t.from)}</small><strong>${e(money(item.data.price))}</strong><small>${e(t.night)}</small></span>` : '<span></span>'}<a class="text-button" href="${url('room', item.id)}">${e(t.roomDetails)}${icon('arrow-up-right', 16)}</a></div></article>`).join('')}</div></div></section>`;
        if (key === 'facilities')
            return `<section class="section container facilities-section" id="facilities">${header(key, t.facilityLabel, t.facilityTitle, t.facilityDesc)}<div class="facility-editorial">${facilities.map((item, index) => `<article class="facility-feature reveal" id="facility-${item.id}"><div class="facility-feature-photo">${image(item.data.image, localize(item.data.alt, lang))}<span class="photo-index">${String(index + 1).padStart(2, '0')} /</span></div><div class="facility-feature-copy"><span class="eyebrow">${icon(item.data.icon, 22)}${lang === 'id' ? 'KENYAMANAN UNTUKMU' : 'COMFORT FOR YOU'}</span><h3>${l(item.data.title)}</h3><p>${l(item.data.description)}</p>${has('contact') ? viewAll(url('contact'), lang === 'id' ? 'Tanyakan fasilitas ini' : 'Enquire about this amenity') : ''}</div></article>`).join('')}</div></section>`;
        if (key === 'gallery')
            return `<section class="section gallery-section" id="gallery"><div class="container"><div class="heading-row">${header(key, t.galleryLabel, t.galleryTitle, t.galleryDesc)}<span class="section-number">02 /</span></div><div class="gallery-grid">${gallery.map((item, index) => `<button class="gallery-image gallery-${index}" data-gallery="${index}" data-category="${e(item.data.category || 'hotel')}" aria-label="${e(t.gallery)}: ${l(item.data.title)}">${image(item.data.image, localize(item.data.alt, lang))}<span>${l(item.data.title)}${icon('expand', 18)}</span></button>`).join('')}</div></div></section>`;
        if (key === 'faq')
            return `<section class="section faq-section" id="faq"><div class="container faq-layout"><div>${header(key, t.faqLabel, t.faqTitle, t.faqDesc)}${book(t.contact)}</div><div class="faq-list">${faqs.map((item, index) => `<details data-faq-id="${item.id}"><summary><span>${String(index + 1).padStart(2, '0')}</span>${l(item.data.title)}<span class="faq-icons">${icon('plus', 16, false, 'faq-plus')}${icon('minus', 16, false, 'faq-minus')}</span></summary><p>${l(item.data.description)}</p></details>`).join('')}</div></div></section>`;
        return '';
    };
    const reviews = items('testimonial');
    const stats = getReviewStats(reviews);
    const allRoomsLink = viewAll(url('rooms'), lang === 'id' ? 'Jelajahi semua kamar' : 'Explore every room');
    const homeSection = (key) => {
        if (key === 'about') return homeStory(s, lang, url('about'));
        if (key === 'rooms')
            return render('rooms').replace('<span class="section-number">01 /</span>', allRoomsLink);
        if (key === 'facilities') return homeExperiences(facilities, lang, url('facilities'));
        if (key === 'gallery') return homeGallery(gallery, lang, url('gallery'));
        if (key === 'faq') return homeFaq(faqs, lang, url('faq'));
        if (key === 'testimonials')
            return `<section class="section home-reviews" id="testimonials"><div class="container"><div class="heading-row"><div class="section-heading"><span class="eyebrow">${e(t.testimonialLabel)}</span><h2>${lang === 'id' ? 'Dari tamu, untuk<br />perjalananmu berikutnya.' : 'From our guests, for<br />your next journey.'}</h2><p>${lang === 'id' ? `${stats.count} cerita contoh. Beragam cara menikmati persinggahan.` : `${stats.count} sample stories. So many ways to enjoy a stay.`}</p></div>${viewAll(url('testimonials'), lang === 'id' ? 'Baca semua ulasan' : 'Read all reviews')}</div><div class="home-review-grid">${testimonials.map((item) => reviewCard(item, lang)).join('')}</div></div></section>`;
        if (key === 'contact') return stayCta(s, lang, url('contact'));
        return '';
    };
    const hero = `<section class="hero" id="home">${image(s.hero_image, localize(s.hero_alt, lang), 'hero-photo', true)}<div class="hero-shade"></div><div class="hero-navigation"><div class="site-topbar-inner">${nav('hero')}</div></div><div class="hero-content"><span class="hero-eyebrow"><span></span>${l(s.hero_label)}</span><h1>${l(s.hero_title) || e(s.name)}</h1><p>${l(s.hero_subtitle)}</p><div class="hero-actions">${book(lang === 'id' ? 'Rencanakan menginap' : 'Plan your stay')}${has('rooms') ? `<a class="hero-secondary" href="${url('rooms')}">${lang === 'id' ? 'Jelajahi kamar' : 'Explore rooms'}${icon('arrow-up-right', 18)}</a>` : ''}</div></div><a class="hero-scroll" href="${url('about')}"><span>${lang === 'id' ? 'KENALI ARUNIKA' : 'DISCOVER ARUNIKA'}</span>${icon('arrow-up-right', 17)}</a>${has('testimonials') ? `<a class="hero-proof" href="${url('testimonials')}"><span class="proof-avatars"><span>N</span><span>A</span><span>M</span></span><span><strong>${icon('star', 14, true)}${e(stats.average.toLocaleString(lang === 'id' ? 'id-ID' : 'en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 }))}/5</strong><small>${stats.count} ${lang === 'id' ? 'ulasan contoh' : 'sample reviews'}</small></span>${icon('arrow-up-right', 18)}</a>` : ''}</section>`;
    let body;
    if (view === 'home')
        body =
            hero +
            statsStrip(page, lang, reviews) +
            sections.map((section) => homeSection(section.key)).join('');
    else if (view !== 'room' && !has(view))
        body =
            pageIntro(s, lang, view, preview) +
            `<section class="section container empty-page"><h2>${lang === 'id' ? 'Informasi sedang disiapkan.' : 'Information is being prepared.'}</h2><a class="button" href="${url('home')}">${e(t.home)}</a></section>`;
    else {
        body =
            view === 'room'
                ? `<div class="room-breadcrumbs container"><nav class="breadcrumbs" aria-label="${lang === 'id' ? 'Jejak navigasi' : 'Breadcrumb'}"><a href="${url('home')}">${e(t.home)}</a>${icon('chevron-right', 14)}<a href="${url('rooms')}">${e(t.rooms)}</a>${icon('chevron-right', 14)}<span>${lang === 'id' ? 'Detail kamar' : 'Room details'}</span></nav></div>`
                : pageIntro(s, lang, view, preview);
        if (view === 'about')
            body += render('about') + aboutValues(s, lang) + statsStrip(page, lang, reviews);
        if (view === 'rooms')
            body +=
                roomBenefits(lang) +
                `<div class="category-filters room-filters container"><button class="active" data-room-filter="all" aria-pressed="true">${lang === 'id' ? 'Semua kamar' : 'All rooms'}</button><button data-room-filter="couple" aria-pressed="false">${lang === 'id' ? 'Untuk berdua' : 'For two'}</button><button data-room-filter="family" aria-pressed="false">${lang === 'id' ? 'Untuk keluarga' : 'For families'}</button><span data-room-count role="status"></span></div>` +
                render('rooms');
        if (view === 'room') {
            const selected = roomId === null ? rooms[0] : rooms.find((item) => item.id === roomId);
            body +=
                roomDetails(
                    has('rooms') ? selected : null,
                    s,
                    lang,
                    contactUrl(localize(selected?.data.title, lang)),
                ) +
                `<div class="container return-to-rooms">${viewAll(url('rooms'), lang === 'id' ? 'Kembali ke pilihan kamar' : 'Back to our rooms')}</div>`;
        }
        if (view === 'facilities')
            body +=
                render('facilities') +
                `<section class="section experience-note container"><span class="eyebrow">${lang === 'id' ? 'NIKMATI RITMEMU SENDIRI' : 'ENJOY YOUR OWN PACE'}</span><h2>${lang === 'id' ? 'Rencana terbaik kadang<br />adalah tanpa rencana.' : 'Sometimes the best plan<br />is having no plan.'}</h2><p>${lang === 'id' ? 'Luangkan waktu untuk hal-hal yang kamu sukai. Jelajahi foto ruang kami atau temukan kamar untuk persinggahanmu.' : 'Make time for the things you love. Explore photographs of our spaces or find a room for your stay.'}</p>${viewAll(url('gallery'), lang === 'id' ? 'Lihat suasana dalam galeri' : 'Explore the atmosphere in our gallery')}</section>`;
        if (view === 'gallery') body += galleryFilters(lang) + render('gallery');
        if (view === 'testimonials') body += reviewsPage(reviews, lang);
        if (view === 'faq')
            body += render('faq').replace(
                '<div class="faq-list">',
                `<div class="faq-list">${faqSearch(lang, faqs.length)}`,
            );
        if (view === 'contact') body += contactPlanner(s, rooms, lang);
        if (view !== 'contact' && has('contact')) body += stayCta(s, lang, url('contact'));
    }
    return `<div class="site site-${view}" id="top"><div class="preview-banner"><span>${preview ? e(t.preview) : lang === 'id' ? 'Proyek portofolio · hotel, foto, rating, dan ulasan merupakan contoh.' : 'Portfolio project · the hotel, photographs, ratings, and reviews are samples.'}</span><a href="/admin">${preview ? e(t.admin) : lang === 'id' ? 'Demo admin' : 'Admin demo'}${icon('arrow-up-right', 12)}</a></div><header class="site-topbar ${view !== 'home' ? 'is-visible' : ''}" aria-hidden="${view === 'home'}" ${view === 'home' ? 'inert' : ''}><div class="site-topbar-inner container">${nav('topbar')}</div></header><main class="${view === 'home' ? 'home-main' : 'detail-content'}">${body}</main>${footer(s, lang, sections, preview)}${s.whatsapp ? `<button class="whatsapp-float" data-book="" aria-label="WhatsApp">${icon('message', 22)}</button>` : ''}</div>`;
}

export function bindSite(root, document, lang = 'id', preview = false) {
    const s = document.settings,
        t = text[lang],
        l = (value) => localize(value, lang),
        page = publishedData(document, preview);
    const gallery = page.items.filter((item) => item.type === 'gallery');
    const topbar = root.querySelector('.site-topbar'),
        heroNav = root.querySelector('.hero-navigation');
    const controller = new AbortController(),
        options = { signal: controller.signal };
    let openMenu = null,
        topbarVisible = false;
    function closeMenu(focus = false) {
        if (!openMenu) return;
        root.querySelector(`#${openMenu}-menu`).classList.remove('is-open');
        const button = root.querySelector(`#${openMenu}-menu-toggle`);
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', t.menu);
        button.innerHTML = icon('menu', 21);
        if (focus) button.focus();
        openMenu = null;
    }
    const observer = new IntersectionObserver(([entry]) => {
        const visible = entry.boundingClientRect.bottom <= 0;
        if (visible === topbarVisible) return;
        topbarVisible = visible;
        closeMenu();
        topbar.classList.toggle('is-visible', visible);
        topbar.setAttribute('aria-hidden', String(!visible));
        topbar.inert = !visible;
    });
    if (heroNav) observer.observe(heroNav);
    const cleanupEnhancements = bindEnhancements(root, document, lang, preview);
    const breakpoint = matchMedia('(max-width: 1150px)');
    breakpoint.addEventListener('change', () => closeMenu(), options);
    globalThis.document.addEventListener(
        'pointerdown',
        (event) => {
            if (!event.target.closest('.hero-navigation, .site-topbar')) closeMenu();
        },
        options,
    );
    globalThis.document.addEventListener(
        'keydown',
        (event) => {
            if (event.key === 'Escape') closeMenu(true);
        },
        options,
    );
    function book(room) {
        if (!s.whatsapp)
            return toast(
                lang === 'id'
                    ? 'Ini demo portofolio. Nomor WhatsApp dapat ditambahkan melalui admin demo.'
                    : 'Portfolio demo. Add a WhatsApp number in the admin demo.',
            );
        const message = room
            ? `${t.roomMessage} ${room}${lang === 'en' ? ' room' : ''} ${s.name}.`
            : `${t.message} ${s.name}.`;
        window.open(
            `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(message)}`,
            '_blank',
            'noopener,noreferrer',
        );
    }
    function photoModal(index) {
        if (!gallery.length) return;
        const visible = [...root.querySelectorAll('[data-gallery]:not([hidden])')].map((node) =>
            Number(node.dataset.gallery),
        );
        let position = visible.indexOf(index);
        if (position < 0) return;
        let current = index,
            dialog;
        const content = () =>
            `${image(gallery[current].data.image, l(gallery[current].data.alt))}<div class="lightbox-bottom"><span>${e(l(gallery[current].data.title))}<small>${position + 1} / ${visible.length}</small></span><div><button class="icon-button" data-photo-prev aria-label="${e(t.previous)}">${icon('chevron-left')}</button><button class="icon-button" data-photo-next aria-label="${e(t.next)}">${icon('chevron-right')}</button></div></div>`;
        dialog = openModal(
            `<div class="lightbox-content">${content()}</div>`,
            l(gallery[current].data.title),
            'lightbox',
        );
        function move(direction) {
            position = (position + direction + visible.length) % visible.length;
            current = visible[position];
            dialog.querySelector('.lightbox-content').innerHTML = content();
            dialog.setAttribute('aria-label', l(gallery[current].data.title));
            dialog.querySelector(direction > 0 ? '[data-photo-next]' : '[data-photo-prev]').focus();
        }
        dialog.addEventListener('click', (event) => {
            if (event.target.closest('[data-photo-prev]')) move(-1);
            if (event.target.closest('[data-photo-next]')) move(1);
        });
        dialog.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                move(event.key === 'ArrowRight' ? 1 : -1);
            }
        });
    }
    root.addEventListener(
        'click',
        (event) => {
            const toggle = event.target.closest('[data-toggle-menu]');
            if (toggle) {
                const location = toggle.dataset.toggleMenu;
                if (openMenu === location) return closeMenu();
                closeMenu();
                openMenu = location;
                root.querySelector(`#${location}-menu`).classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.setAttribute('aria-label', `${t.close} ${t.menu}`);
                toggle.innerHTML = icon('x', 21);
            }
            if (event.target.closest('.site-nav-links a')) closeMenu();
            const photo = event.target.closest('[data-gallery]');
            if (photo) photoModal(Number(photo.dataset.gallery));
            const booking = event.target.closest('[data-book]');
            if (booking) book(booking.dataset.book);
        },
        options,
    );
    return () => {
        controller.abort();
        observer.disconnect();
        cleanupEnhancements();
    };
}
