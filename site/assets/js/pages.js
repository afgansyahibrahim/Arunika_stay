import { escapeHtml as e, localize, money, safeUrl, icon, logo } from './ui.js';
import { text } from './copy.js';
import { pageUrl } from './routes.js';

export const pageCopy = {
    id: {
        about: [
            'KENALI ARUNIKA',
            'Lebih dekat.\nLebih terasa seperti rumah.',
            'Kenali ruang, perhatian, dan cerita di balik tempat untuk singgah.',
        ],
        rooms: [
            'PILIH RUANGMU',
            'Ruang untuk istirahat.\nTempat untuk cerita baru.',
            'Dari perjalanan berdua hingga kebersamaan keluarga, temukan kamar yang paling sesuai dengan ritmemu.',
        ],
        facilities: [
            'NIKMATI SETIAP MOMEN',
            'Hal kecil.\nPengalaman yang berkesan.',
            'Berenang sebentar, berbagi hidangan, atau menikmati waktu tanpa rencana. Ada kenyamanan di setiap sudut.',
        ],
        gallery: [
            'SEKILAS ARUNIKA',
            'Suasana yang ingin\nkamu nikmati sendiri.',
            'Jelajahi kamar, ruang bersama, dan momen-momen yang membuat sebuah persinggahan terasa istimewa.',
        ],
        testimonials: [
            'CERITA PARA TAMU',
            'Kenangan yang tinggal.\nCerita yang dibagikan.',
            'Baca beragam pengalaman contoh, temukan cerita yang dekat dengan perjalananmu, dan kenali suasana Arunika.',
        ],
        faq: [
            'SEBELUM SINGGAH',
            'Perjalanan nyaman\ndimulai dari hal yang jelas.',
            'Temukan jawaban tentang kamar, rencana menginap, fasilitas, dan cara menghubungi kami.',
        ],
        contact: [
            'SAMPAI JUMPA',
            'Ceritakan rencanamu.\nKami siapkan ruangnya.',
            'Pilih tanggal dan kamar yang kamu sukai. Mulai percakapan untuk menentukan persinggahan yang tepat.',
        ],
        room: [
            'DETAIL KAMAR',
            'Ruang untuk merasa nyaman.',
            'Kenali setiap detail sebelum memilih tempat beristirahat.',
        ],
    },
    en: {
        about: [
            'MEET ARUNIKA',
            'A little closer.\nA little more like home.',
            'Discover the spaces, thoughtful details, and stories behind a comforting place to stay.',
        ],
        rooms: [
            'FIND YOUR SPACE',
            'Room to rest.\nSpace for new stories.',
            'From a journey for two to time with the family, find a room that suits your pace.',
        ],
        facilities: [
            'ENJOY EVERY MOMENT',
            'Little details.\nLasting memories.',
            'A dip in the pool, a shared meal, or a day without plans. Discover comfort in every corner.',
        ],
        gallery: [
            'A GLIMPSE OF ARUNIKA',
            'An atmosphere you\nwill want to experience.',
            'Explore our rooms, shared spaces, and the moments that make a stay feel special.',
        ],
        testimonials: [
            'GUEST STORIES',
            'Memories that stay.\nStories worth sharing.',
            'Read a variety of sample experiences, find stories that feel familiar, and discover the Arunika atmosphere.',
        ],
        faq: [
            'BEFORE YOUR STAY',
            'A comfortable journey\nstarts with clear details.',
            'Find answers about rooms, stay plans, amenities, and getting in touch.',
        ],
        contact: [
            'SEE YOU SOON',
            'Tell us your plans.\nWe will find your space.',
            'Choose the dates and room you like. Start a conversation about the stay that is right for you.',
        ],
        room: [
            'ROOM DETAILS',
            'A space to feel at ease.',
            'Discover the details before choosing your place to rest.',
        ],
    },
};
export function getReviewStats(reviews) {
    const rated = reviews.filter(
        (item) => Number.isInteger(item.data.rating) && item.data.rating >= 1 && item.data.rating <= 5,
    );
    return {
        count: reviews.length,
        rated: rated.length,
        average: rated.length ? rated.reduce((sum, item) => sum + item.data.rating, 0) / rated.length : 0,
        distribution: [5, 4, 3, 2, 1].map((rating) => ({
            rating,
            count: rated.filter((item) => item.data.rating === rating).length,
        })),
    };
}
export function formatCounter(value, decimals, lang) {
    return Number(value).toLocaleString(lang === 'id' ? 'id-ID' : 'en-GB', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
export function counter(value, label, lang, decimals = 0, suffix = '', className = '') {
    return `<div class="metric ${className}"><strong><span data-counter="${value}" data-decimals="${decimals}" aria-hidden="true">${e(formatCounter(value, decimals, lang))}</span><span aria-hidden="true" class="metric-suffix">${e(suffix)}</span><span class="sr-only">${e(formatCounter(value, decimals, lang) + suffix)}</span></strong><span>${e(label)}</span></div>`;
}
export function statsStrip(document, lang, reviews) {
    const stats = getReviewStats(reviews);
    return `<section class="metrics-strip container" aria-label="${lang === 'id' ? 'Statistik data contoh' : 'Sample data statistics'}">${counter(stats.average, lang === 'id' ? 'Rating dari ulasan contoh' : 'Average sample rating', lang, 1, '/5')}${counter(stats.count, lang === 'id' ? 'Cerita tamu contoh' : 'Sample guest stories', lang)}${counter(document.items.filter((item) => item.type === 'room').length, lang === 'id' ? 'Pilihan ruang menginap' : 'Room types to explore', lang)}${counter(document.items.filter((item) => item.type === 'facility').length, lang === 'id' ? 'Kenyamanan untuk dinikmati' : 'Comforts to enjoy', lang)}</section>`;
}
const img = (url, alt, cls = '') =>
    safeUrl(url, true)
        ? `<img src="${e(safeUrl(url, true))}" alt="${e(alt)}" class="${cls}" loading="lazy" />`
        : '';
export function pageIntro(s, lang, view, preview) {
    const t = text[lang],
        copy = pageCopy[lang][view] || pageCopy[lang].room;
    const title = localize(s.section_copy?.[view]?.title, lang) || copy[1];
    const subtitle = localize(s.section_copy?.[view]?.subtitle, lang) || copy[2];
    return `<section class="page-intro container"><nav class="breadcrumbs" aria-label="${lang === 'id' ? 'Jejak navigasi' : 'Breadcrumb'}"><a href="${pageUrl(lang, 'home', preview)}">${e(t.home)}</a>${icon('chevron-right', 14)}<span>${e(t[view] || (lang === 'id' ? 'Detail kamar' : 'Room details'))}</span></nav><span class="eyebrow">${e(copy[0])}</span><h1>${e(title)}</h1><p>${e(subtitle)}</p><span class="intro-orbit" aria-hidden="true">${icon('leaf', 110)}</span></section>`;
}
export function viewAll(url, label) {
    return `<a class="text-button view-all" href="${e(url)}">${e(label)}${icon('arrow-up-right', 18)}</a>`;
}
export function homeStory(s, lang, url) {
    const id = lang === 'id';
    return `<section class="section home-story container" id="about"><div class="story-collage reveal">${img(s.about_image, localize(s.about_alt, lang), 'story-main')}${img(s.hero_image, localize(s.hero_alt, lang), 'story-small')}<span class="story-stamp">${icon('leaf', 22)}<span>${id ? 'Temukan ritmemu.<br />Nikmati waktumu.' : 'Find your pace.<br />Enjoy your time.'}</span></span></div><div class="story-copy reveal"><span class="eyebrow">${id ? 'KENALI ARUNIKA' : 'MEET ARUNIKA'}</span><h2>${e(localize(s.about_title, lang))}</h2><p>${e(localize(s.about_description, lang).split('\n\n')[0])}</p><p>${id ? 'Kami percaya tempat yang baik memberi ruang untuk hal-hal sederhana: istirahat yang nyaman, percakapan yang panjang, dan kenangan bersama orang tersayang.' : 'We believe a good place makes room for the simple things: a comfortable rest, long conversations, and memories shared with the people you love.'}</p><a class="button button-outline" href="${e(url)}">${id ? 'Cerita di balik Arunika' : 'The story behind Arunika'}${icon('arrow-up-right', 18)}</a></div></section>`;
}
export function homeExperiences(facilities, lang, url) {
    const id = lang === 'id';
    return `<section class="section experience-section" id="facilities"><div class="container"><div class="heading-row"><div class="section-heading"><span class="eyebrow">${id ? 'BUKAN SEKADAR MENGINAP' : 'MORE THAN A STAY'}</span><h2>${id ? 'Nikmati hari.<br />Dengan caramu sendiri.' : 'Enjoy the day.<br />Your own way.'}</h2><p>${id ? 'Sedikit jeda, sedikit kebersamaan. Banyak momen yang layak dinikmati.' : 'A little pause, a little time together. So many moments to enjoy.'}</p></div>${viewAll(url, id ? 'Jelajahi semua fasilitas' : 'Explore all amenities')}</div><div class="experience-grid">${facilities
        .map(
            (item, index) =>
                `<a class="experience-card reveal" href="${e(url)}#facility-${item.id}"><div class="experience-photo">${img(item.data.image, localize(item.data.alt, lang))}<span class="photo-index">${String(index + 1).padStart(2, '0')} /</span></div><div class="experience-copy"><span class="eyebrow">${icon(item.data.icon, 18)}${id ? 'MOMEN UNTUKMU' : 'A MOMENT FOR YOU'}</span><h3>${e(localize(item.data.title, lang))}</h3><p>${e(localize(item.data.description, lang))}</p><span class="experience-arrow">${icon('arrow-up-right', 24)}</span></div></a>`,
        )
        .join('')}</div></div></section>`;
}
export function homeGallery(gallery, lang, url) {
    const id = lang === 'id';
    return `<section class="section home-gallery" id="gallery"><div class="container"><div class="heading-row"><div class="section-heading"><span class="eyebrow">${id ? 'LIHAT LEBIH DEKAT' : 'TAKE A CLOSER LOOK'}</span><h2>${id ? 'Ada cerita<br />di setiap sudut.' : 'A story<br />in every corner.'}</h2><p>${id ? 'Cahaya pagi, tekstur yang hangat, dan ruang untuk menikmati waktu. Bayangkan persinggahanmu melalui galeri kami.' : 'Morning light, warm textures, and room to enjoy your time. Picture your stay through our gallery.'}</p></div>${viewAll(url, id ? 'Jelajahi galeri foto' : 'Explore the photo gallery')}</div><div class="home-gallery-mosaic">${gallery
        .slice(0, 6)
        .map(
            (item, index) =>
                `<button class="gallery-image mosaic-photo reveal" data-gallery="${index}" aria-label="${id ? 'Perbesar foto' : 'Enlarge photo'}: ${e(localize(item.data.title, lang))}">${img(item.data.image, localize(item.data.alt, lang))}<span>${e(localize(item.data.title, lang))}${icon('expand', 18)}</span></button>`,
        )
        .join(
            '',
        )}</div><div class="gallery-footnote"><span>${icon('eye', 18)}${id ? 'Sentuh foto untuk melihat lebih dekat.' : 'Tap a photograph to take a closer look.'}</span><span>${id ? 'Ruang tenang. Momen yang tinggal.' : 'Quiet spaces. Lasting moments.'}</span></div></div></section>`;
}
export function homeFaq(faqs, lang, url) {
    const id = lang === 'id';
    return `<section class="section home-faq container" id="faq"><div class="section-heading"><span class="eyebrow">${id ? 'SEBELUM MEMBUAT RENCANA' : 'BEFORE YOU MAKE PLANS'}</span><h2>${id ? 'Kenali detailnya.<br />Nikmati perjalanannya.' : 'Know the details.<br />Enjoy the journey.'}</h2><p>${id ? 'Beberapa hal yang mungkin ingin kamu ketahui sebelum singgah.' : 'A few things you might like to know before your stay.'}</p>${viewAll(url, id ? 'Baca semua pertanyaan' : 'Read all questions')}</div><div class="faq-list">${faqs
        .slice(0, 3)
        .map(
            (item, index) =>
                `<details><summary><span>${String(index + 1).padStart(2, '0')}</span>${e(localize(item.data.title, lang))}<span class="faq-icons">${icon('plus', 16, false, 'faq-plus')}${icon('minus', 16, false, 'faq-minus')}</span></summary><p>${e(localize(item.data.description, lang))}</p></details>`,
        )
        .join('')}</div></section>`;
}
export function stayCta(s, lang, url) {
    const id = lang === 'id';
    return `<section class="stay-cta container reveal" id="contact"><div><span class="eyebrow">${id ? 'RUANG UNTUK CERITA BERIKUTNYA' : 'ROOM FOR YOUR NEXT STORY'}</span><h2>${id ? 'Jeda yang kamu butuhkan.<br />Kenangan yang kamu bawa pulang.' : 'The pause you need.<br />Memories to bring home.'}</h2><p>${id ? 'Mulai dengan sebuah percakapan. Ceritakan perjalananmu, kami bantu memilih ruangnya.' : 'Start with a conversation. Tell us about your journey and we will help you choose your space.'}</p><a class="button button-white" href="${e(url)}">${id ? 'Rencanakan persinggahan' : 'Plan your stay'}${icon('arrow-up-right', 18)}</a></div><div class="cta-image">${img(s.hero_image, localize(s.hero_alt, lang))}</div></section>`;
}
export function aboutValues(s, lang) {
    const id = lang === 'id';
    const values = id
        ? [
              [
                  'leaf',
                  'Suasana yang menenangkan',
                  'Warna alami, ruang yang nyaman, dan sudut untuk memperlambat langkah.',
              ],
              [
                  'users',
                  'Kebersamaan yang berarti',
                  'Tempat untuk memulai percakapan, berbagi hidangan, dan membuat kenangan.',
              ],
              [
                  'coffee',
                  'Perhatian di setiap detail',
                  'Hal sederhana yang membantu perjalanan terasa lebih ringan.',
              ],
          ]
        : [
              [
                  'leaf',
                  'An atmosphere of calm',
                  'Natural colours, comfortable spaces, and corners for slowing down.',
              ],
              [
                  'users',
                  'Time together that matters',
                  'A place to start a conversation, share a meal, and make memories.',
              ],
              [
                  'coffee',
                  'Thoughtful little details',
                  'Simple things that help a journey feel a little lighter.',
              ],
          ];
    return `<section class="section values-section container"><div class="section-heading"><span class="eyebrow">${id ? 'CARA KAMI MENYAMBUTMU' : 'OUR WAY OF WELCOMING YOU'}</span><h2>${id ? 'Hangat ruangnya.<br />Dekat rasanya.' : 'Warm spaces.<br />A familiar feeling.'}</h2></div><div class="values-grid">${values.map(([symbol, title, body], i) => `<article class="value-card reveal"><span class="value-number">0${i + 1}</span>${icon(symbol, 28)}<h3>${e(title)}</h3><p>${e(body)}</p></article>`).join('')}</div></section><div class="wide-scene container reveal">${img(s.hero_image, localize(s.hero_alt, lang))}<span>${e(localize(s.tagline, lang))}</span></div>`;
}
export function roomBenefits(lang) {
    const id = lang === 'id';
    return `<section class="room-benefits container"><span>${icon('wifi', 22)}${id ? 'Terhubung dengan mudah' : 'Stay connected'}</span><span>${icon('leaf', 22)}${id ? 'Ruang yang menenangkan' : 'Calming spaces'}</span><span>${icon('coffee', 22)}${id ? 'Pagi yang lebih santai' : 'Unhurried mornings'}</span></section>`;
}
export function roomDetails(item, s, lang, url) {
    const id = lang === 'id',
        d = item?.data;
    if (!d)
        return `<section class="section container empty-page"><h1>${id ? 'Kamar belum tersedia.' : 'This room is not available.'}</h1><a class="button" href="${e(pageUrl(lang, 'rooms'))}">${id ? 'Lihat pilihan kamar' : 'See our rooms'}</a></section>`;
    return `<section class="room-detail-hero container"><div class="reveal"><span class="eyebrow">${id ? 'RUANG PILIHANMU' : 'YOUR CHOSEN SPACE'}</span><h1>${e(localize(d.title, lang))}</h1><p class="room-detail-lead">${e(localize(d.description, lang).split('\n\n')[0])}</p><div class="detail-facts"><span>${icon('users', 20)}<strong>${e(d.capacity)} ${id ? 'tamu' : 'guests'}</strong></span>${d.size ? `<span>${icon('expand', 20)}<strong>${e(d.size)} m²</strong></span>` : ''}</div>${d.price ? `<p class="detail-price"><small>${id ? 'Mulai dari' : 'From'}</small>${e(money(d.price))}<small>${id ? '/ malam · harga contoh' : '/ night · sample rate'}</small></p>` : ''}<a class="button" href="${e(url)}">${id ? 'Tanyakan kamar ini' : 'Enquire about this room'}${icon('arrow-up-right', 18)}</a></div>${img(d.image, localize(d.alt, lang), 'room-detail-photo reveal')}</section><section class="section room-detail-body container"><div><span class="eyebrow">${id ? 'KENALI RUANGNYA' : 'GET TO KNOW YOUR SPACE'}</span><h2>${id ? 'Dibuat untuk waktu<br />yang ingin kamu nikmati.' : 'Made for the moments<br />you want to enjoy.'}</h2><p class="preserve-lines">${e(localize(d.description, lang))}</p></div><aside class="amenities-card"><h3>${id ? 'Kenyamanan di dalam kamar' : 'Comforts in your room'}</h3><ul>${localize(
        d.features,
        lang,
    )
        .split('\n')
        .filter(Boolean)
        .map((feature) => `<li>${icon('check', 17)}${e(feature)}</li>`)
        .join(
            '',
        )}</ul></aside></section><section class="stay-notes container"><div><span class="eyebrow">${id ? 'SEBELUM MENGINAP' : 'BEFORE YOUR STAY'}</span><h3>${id ? 'Sedikit detail untuk perjalananmu.' : 'A few details for your journey.'}</h3><p>${id ? 'Harga, ketersediaan, permintaan khusus, dan ketentuan menginap perlu dikonfirmasi saat menghubungi hotel. Seluruh informasi pada demo ini adalah contoh.' : 'Confirm rates, availability, special requests, and stay policies when contacting the hotel. All information in this demo is a sample.'}</p></div><div class="stay-times"><span>Check-in<strong>${e(s.checkin)}</strong></span><span>Check-out<strong>${e(s.checkout)}</strong></span></div></section>`;
}
export function reviewCard(item, lang) {
    const d = item.data,
        t = text[lang];
    return `<article class="testimonial-card"><div class="review-top"><span class="stars" aria-label="${e(d.rating || 0)}/5">${Array.from({ length: 5 }, (_, i) => icon('star', 15, i < (d.rating || 0))).join('')}</span><span class="review-demo">${e(t.sample)}</span></div><blockquote>“${e(localize(d.description, lang))}”</blockquote><div class="review-author">${safeUrl(d.avatar, true) ? img(d.avatar, localize(d.title, lang)) : `<span class="review-avatar">${e(localize(d.title, lang).slice(0, 1))}</span>`}<div><strong>${e(localize(d.title, lang))}</strong><small>${e(d.source)}${d.date ? ` · ${e(new Date(d.date + 'T12:00:00').toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { month: 'short', year: 'numeric' }))}` : ''}</small></div></div>${d.translated && lang !== (d.original_locale || 'id') ? `<span class="translated-label">${e(t.translated)}</span>` : ''}${safeUrl(d.source_url) ? `<a class="review-source" href="${e(safeUrl(d.source_url))}" target="_blank" rel="noopener noreferrer">${e(t.original)}${icon('arrow-up-right', 12)}</a>` : ''}</article>`;
}
export function reviewSummary(reviews, lang) {
    const stats = getReviewStats(reviews),
        id = lang === 'id';
    return `<section class="review-overview container"><div class="review-score">${counter(stats.average, id ? `Dari ${stats.rated} ulasan dengan rating` : `From ${stats.rated} rated reviews`, lang, 1, '/5')}<span class="stars">${Array.from({ length: 5 }, (_, i) => icon('star', 19, i < Math.round(stats.average))).join('')}</span><span class="sample-note">${id ? 'Rating simulasi dari data contoh portofolio.' : 'Simulated rating from portfolio sample data.'}</span></div><div class="rating-distribution">${stats.distribution.map(({ rating, count }) => `<div><span>${rating} ${icon('star', 13, true)}</span><progress value="${count}" max="${Math.max(stats.rated, 1)}" aria-label="${rating}/5: ${count}"></progress><span>${count}</span></div>`).join('')}</div>${counter(stats.count, id ? 'Cerita tamu contoh untuk dijelajahi' : 'Sample guest stories to explore', lang, 0, '', 'review-total')}</section>`;
}
export function reviewsPage(reviews, lang) {
    const id = lang === 'id';
    return `${reviewSummary(reviews, lang)}<section class="section review-library container"><div class="library-heading"><div><span class="eyebrow">${id ? 'BERAGAM PENGALAMAN' : 'DIFFERENT EXPERIENCES'}</span><h2>${id ? 'Setiap tamu, sebuah cerita.' : 'Every guest, a story.'}</h2></div><p class="sample-note">${id ? 'Semua nama dan ulasan adalah contoh fiktif.' : 'All names and reviews are fictional samples.'}</p></div><div class="review-controls"><label class="review-search">${icon('eye', 18)}<input type="search" data-review-search placeholder="${id ? 'Cari cerita atau nama tamu...' : 'Search stories or guest names...'}" aria-label="${id ? 'Cari ulasan' : 'Search reviews'}" /></label><select data-review-rating aria-label="${id ? 'Filter rating' : 'Filter rating'}"><option value="all">${id ? 'Semua rating' : 'All ratings'}</option>${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${n} ${id ? 'bintang' : 'stars'}</option>`).join('')}</select><select data-review-sort aria-label="${id ? 'Urutkan ulasan' : 'Sort reviews'}"><option value="recent">${id ? 'Terbaru' : 'Most recent'}</option><option value="highest">${id ? 'Rating tertinggi' : 'Highest rated'}</option><option value="lowest">${id ? 'Rating terendah' : 'Lowest rated'}</option></select></div><div class="review-results" data-review-results role="status">${id ? 'Menampilkan' : 'Showing'} 1–${Math.min(9, reviews.length)} ${id ? 'dari' : 'of'} ${reviews.length} ${id ? 'ulasan contoh' : 'sample reviews'}</div><div class="review-library-grid" data-review-grid>${reviews
        .slice(0, 9)
        .map((item) => reviewCard(item, lang))
        .join(
            '',
        )}</div><div class="review-pagination"><button class="button button-outline" data-review-page="-1" disabled>${icon('chevron-left', 17)}${id ? 'Sebelumnya' : 'Previous'}</button><span data-review-page-label>1 / ${Math.max(1, Math.ceil(reviews.length / 9))}</span><button class="button button-outline" data-review-page="1" ${reviews.length <= 9 ? 'disabled' : ''}>${id ? 'Berikutnya' : 'Next'}${icon('chevron-right', 17)}</button></div></section>`;
}
export function galleryFilters(lang) {
    const id = lang === 'id';
    return `<div class="category-filters container" aria-label="${id ? 'Filter galeri' : 'Gallery filters'}">${[
        ['all', id ? 'Semua foto' : 'All photos'],
        ['kamar', id ? 'Kamar' : 'Rooms'],
        ['hotel', id ? 'Suasana' : 'Atmosphere'],
        ['fasilitas', id ? 'Fasilitas' : 'Amenities'],
    ]
        .map(
            ([value, label]) =>
                `<button data-gallery-filter="${value}" class="${value === 'all' ? 'active' : ''}" aria-pressed="${value === 'all'}">${label}</button>`,
        )
        .join('')}<span data-gallery-count role="status"></span></div>`;
}
export function faqSearch(lang, count = 0) {
    const id = lang === 'id';
    return `<div class="faq-search"><label class="review-search">${icon('help', 20)}<input type="search" data-faq-search maxlength="200" autocomplete="off" placeholder="${id ? 'Cari pertanyaan atau jawaban...' : 'Search questions or answers...'}" aria-label="${id ? 'Cari pertanyaan' : 'Search questions'}" /></label><button class="icon-button faq-search-clear" type="button" data-clear-faq aria-label="${id ? 'Hapus pencarian' : 'Clear search'}" hidden>${icon('x', 16)}</button><p class="faq-result-count" data-faq-results role="status">${id ? 'Menampilkan' : 'Showing'} ${count} ${id ? 'pertanyaan' : 'questions'}</p><div class="faq-empty" data-faq-empty hidden><h3>${id ? 'Jawaban belum ditemukan.' : 'No matching answers.'}</h3><p>${id ? 'Coba kata kunci lain atau hapus pencarian untuk melihat semua pertanyaan.' : 'Try another keyword or clear your search to see all questions.'}</p></div></div>`;
}
export function contactPlanner(s, rooms, lang) {
    const id = lang === 'id';
    return `<section class="section contact-planner container"><div><span class="eyebrow">${id ? 'MULAI DARI RENCANA KECIL' : 'START WITH A LITTLE PLAN'}</span><h2>${id ? 'Persinggahanmu,<br />kami bantu rencanakan.' : 'Your stay,<br />with a little help from us.'}</h2><p>${id ? 'Siapkan tanggal dan pilihan kamar. Form ini menyusun pesan untuk ditanyakan melalui WhatsApp; belum membuat reservasi.' : 'Choose your dates and preferred room. This form prepares an enquiry message for WhatsApp; it does not create a reservation.'}</p><div class="contact-info"><span>${icon('map-pin', 22)}<div><strong>${e(s.name)}</strong><p>${e(localize(s.address, lang))}</p></div></span>${s.email ? `<a href="mailto:${e(s.email)}">${icon('mail', 22)}${e(s.email)}</a>` : ''}${s.phone ? `<a href="tel:${e(s.phone.replace(/[^+\d]/g, ''))}">${icon('phone', 22)}${e(s.phone)}</a>` : ''}<span>${icon('coffee', 22)}<div>Check-in <strong>${e(s.checkin)}</strong> · Check-out <strong>${e(s.checkout)}</strong></div></span></div>${safeUrl(s.map_url) ? `<a class="text-button" href="${e(safeUrl(s.map_url))}" target="_blank" rel="noopener noreferrer">${id ? 'Lihat petunjuk arah' : 'Get directions'}${icon('arrow-up-right', 17)}</a>` : ''}<div class="contact-scene">${safeUrl(s.map_embed_url) ? `<iframe class="location-map" title="${id ? 'Lokasi hotel' : 'Hotel location'}" src="${e(safeUrl(s.map_embed_url))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` : `${img(s.hero_image, localize(s.hero_alt, lang))}<span>${e(localize(s.tagline, lang))}</span>`}</div></div><div class="planner-card"><span class="eyebrow">${id ? 'RENCANA MENGINAP' : 'YOUR STAY PLANS'}</span><h3>${id ? 'Kapan ingin singgah?' : 'When would you like to stay?'}</h3><form data-stay-form><div class="form-grid"><label class="field"><span class="field-label">Check-in</span><input name="arrival" type="date" required /></label><label class="field"><span class="field-label">Check-out</span><input name="departure" type="date" required /></label></div><label class="field"><span class="field-label">${id ? 'Pilihan kamar' : 'Preferred room'}</span><select name="room" aria-label="${id ? 'Pilihan kamar' : 'Preferred room'}"><option value="">${id ? 'Bantu pilihkan kamar' : 'Help me choose a room'}</option>${rooms.map((item) => `<option value="${e(localize(item.data.title, lang))}">${e(localize(item.data.title, lang))} · ${item.data.capacity} ${id ? 'tamu' : 'guests'}</option>`).join('')}</select></label><label class="field"><span class="field-label">${id ? 'Jumlah tamu' : 'Number of guests'}</span><input name="guests" type="number" min="1" max="30" value="2" required /></label><label class="field"><span class="field-label">${id ? 'Catatan (opsional)' : 'Notes (optional)'}</span><textarea name="notes" rows="3" maxlength="800" placeholder="${id ? 'Misalnya, perjalanan bersama keluarga' : 'For example, a family trip'}"></textarea></label><div data-planner-error role="alert"></div><button class="button" type="submit">${id ? 'Siapkan pesan' : 'Prepare a message'}${icon('arrow-up-right', 18)}</button><small class="sample-note">${id ? 'Demo portofolio. Data form tidak dikirim atau disimpan.' : 'Portfolio demo. Form data is not sent or saved.'}</small></form><div data-planner-result hidden></div></div></section>`;
}
export function footer(s, lang, sections, preview) {
    const id = lang === 'id',
        t = text[lang];
    return `<footer class="site-footer spacious-footer"><div class="container"><div class="footer-main"><div class="footer-brand"><a href="${pageUrl(lang, 'home', preview)}">${logo(s)}</a><p>${e(localize(s.tagline, lang))}</p><span class="footer-demo-note">${id ? 'Hotel fiktif untuk cerita dan eksplorasi desain.' : 'A fictional hotel for stories and design exploration.'}</span></div><div><h3>${id ? 'Jelajahi Arunika' : 'Explore Arunika'}</h3><nav aria-label="${id ? 'Menu footer' : 'Footer navigation'}">${sections
        .slice(0, 4)
        .map((section) => `<a href="${pageUrl(lang, section.key, preview)}">${e(t[section.key])}</a>`)
        .join('')}</nav></div><div><h3>${id ? 'Sebelum singgah' : 'Before your stay'}</h3><nav>${sections
        .slice(4)
        .map((section) => `<a href="${pageUrl(lang, section.key, preview)}">${e(t[section.key])}</a>`)
        .join(
            '',
        )}<a href="/admin">${id ? 'Demo admin' : 'Admin demo'}</a></nav></div><div class="footer-hours"><h3>${id ? 'Waktu menginap' : 'Stay times'}</h3><span>Check-in <strong>${e(s.checkin)}</strong></span><span>Check-out <strong>${e(s.checkout)}</strong></span><a class="text-button" href="${pageUrl(lang, 'contact', preview)}">${id ? 'Mulai percakapan' : 'Start a conversation'}${icon('arrow-up-right', 15)}</a></div></div><div class="footer-bottom"><small>© ${new Date().getFullYear()} ${e(s.name)} · ${id ? 'Proyek portofolio' : 'Portfolio project'}</small><small>${id ? 'Seluruh foto, rating, dan ulasan merupakan contoh.' : 'All photographs, ratings, and reviews are samples.'}</small><a href="#top" aria-label="${id ? 'Kembali ke atas' : 'Back to top'}">${icon('arrow-up', 19)}</a></div></div></footer>`;
}
