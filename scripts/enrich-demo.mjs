// Run once to extend the fictional portfolio dataset. Re-running keeps the same sample IDs.
import fs from 'node:fs/promises';
const file = new URL('../site/data/hotel.json', import.meta.url);
const data = JSON.parse(await fs.readFile(file, 'utf8'));
if (data.items.filter((item) => item.type === 'testimonial').length >= 48) process.exit(0);
let id = Math.max(...data.items.map((item) => item.id));
const add = (type, content) =>
    data.items.push({ id: ++id, type, status: 'published', is_demo: true, sort_order: id, data: content });
const bi = (id, en) => ({ id, en });
const roomCopy = [
    [
        'Dirancang untuk dua orang yang ingin beristirahat dengan tenang. Cahaya yang lembut, warna alami, dan ruang yang tertata memberi suasana nyaman setelah hari yang panjang.\n\nNikmati pagi tanpa terburu-buru, bekerja sebentar di sudut kamar, atau sekadar berbincang sambil menikmati secangkir minuman. Deluxe Room adalah ruang sederhana untuk momen yang berkesan.',
        'Designed for two people looking for a peaceful rest. Soft light, natural colours, and a thoughtful layout create a welcoming space after a long day.\n\nEnjoy an unhurried morning, catch up on work at the room desk, or share a conversation over a drink. Deluxe Room makes room for simple, memorable moments.',
    ],
    [
        'Ruang lebih luas untuk cerita yang dibagi bersama keluarga. Area istirahat dan sudut duduk membuat setiap anggota keluarga punya tempat untuk bersantai tanpa kehilangan kebersamaan.\n\nDengan kapasitas empat tamu, Family Suite cocok untuk akhir pekan panjang atau liburan yang ingin dinikmati perlahan. Mulai pagi bersama, lalu kembali ke ruang yang hangat setelah menjelajahi sekitar.',
        'More space for stories shared with the family. Resting areas and a sitting corner give everyone a place to unwind while staying together.\n\nWith room for four guests, Family Suite suits a long weekend or an unhurried family break. Start the morning together and return to a warm space after exploring the surroundings.',
    ],
    [
        'Bangun dengan suasana yang dekat dengan alam. Garden Room menghadirkan warna tenang dan sentuhan alami untuk tamu yang menyukai perjalanan yang lebih santai.\n\nBaca buku, nikmati percakapan, atau sisihkan waktu untuk dirimu sendiri. Ruang untuk dua tamu ini menempatkan kenyamanan dan ketenangan sebagai bagian dari pengalaman menginap.',
        'Wake up to a feeling of being closer to nature. Garden Room brings together calming colours and natural touches for guests who enjoy a slower pace.\n\nRead a book, enjoy a conversation, or set aside a little time for yourself. This room for two makes comfort and calm part of the stay.',
    ],
];
data.items
    .filter((item) => item.type === 'room')
    .forEach((item, index) => {
        item.data.description = bi(...roomCopy[index]);
        item.data.features = bi(
            'Tempat tidur nyaman\nAC individual\nWi-Fi\nKamar mandi pribadi\nArea duduk\nMeja kerja\nPerlengkapan mandi\nAir minum',
            'Comfortable bed\nIndividual air conditioning\nWi-Fi\nPrivate bathroom\nSitting area\nWork desk\nToiletries\nDrinking water',
        );
    });
const lounge = data.settings.hero_image,
    bedroom = data.settings.about_image;
const pool = data.items.find((item) => item.type === 'facility').data.image;
const dining = data.items.find((item) => item.type === 'facility' && item.data.icon === 'utensils').data
    .image;
for (const [title, en, desc, enDesc, photo, icon] of [
    [
        'Sudut kerja yang tenang',
        'A quiet working corner',
        'Selesaikan hal penting di ruang yang nyaman, lalu kembali menikmati waktu liburan.',
        'Take care of the essentials in a comfortable space, then get back to enjoying your break.',
        lounge,
        'wifi',
    ],
    [
        'Pagi yang lebih pelan',
        'Unhurried mornings',
        'Temukan sudut favorit untuk membaca, menikmati minuman, dan memulai hari dengan santai.',
        'Find a favourite corner to read, enjoy a drink, and ease into the day.',
        dining,
        'coffee',
    ],
    [
        'Kenyamanan setiap hari',
        'Everyday comforts',
        'Detail sederhana, dari tempat duduk yang nyaman sampai ruang untuk menikmati kebersamaan.',
        'Simple details, from comfortable seats to spaces for spending time together.',
        bedroom,
        'leaf',
    ],
])
    add('facility', {
        title: bi(title, en),
        description: bi(desc, enDesc),
        image: photo,
        alt: bi(`Foto stok: ${title}`, `Stock photograph: ${en}`),
        icon,
    });
data.items
    .filter((item) => item.type === 'gallery')
    .forEach((item, index) => (item.data.category = ['hotel', 'kamar', 'fasilitas', 'fasilitas'][index]));
for (const [title, en, photo, category] of [
    ['Detail kamar', 'Room details', bedroom, 'kamar'],
    ['Sudut ruang keluarga', 'A shared sitting corner', lounge, 'hotel'],
    ['Waktu di tepi kolam', 'Poolside moments', pool, 'fasilitas'],
    ['Meja untuk berbagi cerita', 'A table for sharing stories', dining, 'fasilitas'],
    ['Nuansa Family Suite', 'The Family Suite atmosphere', bedroom, 'kamar'],
    ['Cahaya di ruang duduk', 'Light in the lounge', lounge, 'hotel'],
    ['Momen bersantai', 'Time to unwind', pool, 'fasilitas'],
    ['Ruang untuk pulang', 'A space to return to', data.items[2].data.image, 'kamar'],
])
    add('gallery', {
        title: bi(title, en),
        description: bi('', ''),
        image: photo,
        alt: bi(`Foto stok: ${title}`, `Stock photograph: ${en}`),
        category,
    });
for (const [question, en, answer, enAnswer] of [
    [
        'Apa perbedaan tipe kamar?',
        'How do the room types differ?',
        'Deluxe Room untuk dua tamu, Family Suite untuk empat tamu, dan Garden Room untuk dua tamu dengan nuansa lebih alami. Lihat halaman detail untuk luas serta fasilitas setiap kamar.',
        'Deluxe Room sleeps two, Family Suite sleeps four, and Garden Room offers a natural atmosphere for two. See each room page for its size and facilities.',
    ],
    [
        'Bagaimana menanyakan ketersediaan tanggal?',
        'How can I check availability?',
        'Buka halaman Hubungi Kami, isi rencana menginap, lalu siapkan pesan untuk hotel. Website portofolio ini mendemonstrasikan alur pertanyaan, bukan sistem reservasi.',
        'Open Get in touch, enter your stay plans, and prepare a message. This portfolio demonstrates an enquiry flow rather than a booking system.',
    ],
    [
        'Apakah dapat meminta kamar tertentu?',
        'Can I request a particular room?',
        'Sebutkan pilihan kamar serta kebutuhan khusus dalam pesan. Ketersediaan dan pemenuhan permintaan harus dikonfirmasi oleh pihak hotel.',
        'Mention your room preference and any special requirements in your message. Availability and requests must be confirmed by the hotel.',
    ],
    [
        'Apakah tersedia Wi-Fi?',
        'Is Wi-Fi available?',
        'Wi-Fi merupakan fasilitas contoh yang ditampilkan dalam daftar kamar. Untuk hotel nyata, cakupan dan ketentuannya perlu dikonfirmasi sebelum menginap.',
        'Wi-Fi is included in the sample room amenities. For a real hotel, coverage and terms should be confirmed before your stay.',
    ],
    [
        'Boleh meminta check-in lebih awal?',
        'Can I request early check-in?',
        'Tulis perkiraan waktu tiba saat menghubungi hotel. Early check-in mengikuti kesiapan kamar dan konfirmasi pengelola.',
        'Include your estimated arrival time when contacting the hotel. Early check-in depends on room readiness and confirmation.',
    ],
    [
        'Bagaimana jika rencana menginap berubah?',
        'What if my plans change?',
        'Hubungi pengelola untuk menanyakan perubahan tanggal. Kebijakan perubahan dan pembatalan mengikuti paket yang disepakati.',
        'Contact the hotel to discuss a date change. Amendment and cancellation terms depend on the agreed package.',
    ],
    [
        'Apakah ulasan di website ini asli?',
        'Are the reviews on this website real?',
        'Tidak. Identitas hotel, foto stok, rating, dan seluruh ulasan adalah data contoh untuk proyek portofolio. Angka ulasan dihitung dari data demo yang ditampilkan.',
        'No. The hotel identity, stock photos, ratings, and all reviews are fictional portfolio samples. Review statistics are calculated from the displayed demo data.',
    ],
    [
        'Bagaimana mencoba fitur admin?',
        'How can I try the admin features?',
        'Klik Demo Admin untuk menambah atau mengedit data contoh. Perubahan hanya tersimpan di browser milikmu dan tidak mengubah pengalaman pengunjung lain.',
        'Open Demo Admin to add or edit sample content. Changes stay in your own browser and do not affect other visitors.',
    ],
])
    add('faq', { title: bi(question, en), description: bi(answer, enAnswer) });
const names = [
    'Nadia P.',
    'Arif R.',
    'Maya S.',
    'Dimas A.',
    'Putri L.',
    'Raka W.',
    'Intan F.',
    'Farhan D.',
    'Alya K.',
    'Bagas T.',
    'Nina H.',
    'Reza M.',
    'Laras C.',
    'Fajar B.',
    'Rani V.',
    'Yoga G.',
    'Sinta E.',
    'Dian J.',
    'Kevin N.',
    'Tara O.',
    'Aditya P.',
    'Citra R.',
    'Bima S.',
    'Dewi A.',
    'Rizal L.',
    'Melati W.',
    'Irfan F.',
    'Vina D.',
    'Galih K.',
    'Anisa T.',
    'Reno H.',
    'Tiara M.',
    'Naufal C.',
    'Mira B.',
    'Hana V.',
    'Akbar G.',
    'Salma E.',
    'Ilham J.',
    'Nabila N.',
    'Arya O.',
    'Fani P.',
    'Wira R.',
    'Tania S.',
    'Adit A.',
    'Nisa L.',
    'Surya W.',
];
const stories = [
    [
        'Ruang duduknya terasa hangat dan mudah menjadi tempat favorit untuk berkumpul.',
        'The sitting area felt warm and quickly became our favourite gathering spot.',
    ],
    [
        'Kami menikmati pagi yang santai dan kamar yang tertata dengan nyaman.',
        'We enjoyed relaxed mornings and a thoughtfully arranged room.',
    ],
    [
        'Warna alami dan cahaya di kamar membuat waktu istirahat terasa menyenangkan.',
        'Natural colours and the room lighting made resting feel lovely.',
    ],
    [
        'Senang punya ruang untuk membaca sambil menunggu keluarga siap beraktivitas.',
        'It was lovely having a reading corner while the family got ready.',
    ],
    [
        'Area bersama memberi kesempatan untuk berbincang tanpa terburu-buru.',
        'The shared areas made room for conversations without rushing.',
    ],
    [
        'Tipe kamar yang berbeda memudahkan kami memilih ruang sesuai kebutuhan.',
        'The different room types helped us choose a space for our needs.',
    ],
    [
        'Suasana di tepi kolam menjadi bagian yang paling kami nikmati.',
        'The poolside atmosphere was the part we enjoyed most.',
    ],
    [
        'Detail kecil di dalam kamar membuat persinggahan terasa lebih personal.',
        'The small room details made the stay feel more personal.',
    ],
    [
        'Sudut makan terasa nyaman untuk memulai hari bersama keluarga.',
        'The dining corner was a comfortable place to start the day together.',
    ],
    [
        'Ruang yang tenang membantu kami beristirahat setelah perjalanan panjang.',
        'The peaceful space helped us unwind after a long journey.',
    ],
    [
        'Foto kamar membantu membayangkan suasana sebelum memilih tipe menginap.',
        'The room photographs helped us picture the atmosphere before choosing a room.',
    ],
    [
        'Kami suka bisa menikmati waktu sendiri dan tetap dekat dengan keluarga.',
        'We liked having time to ourselves while staying close to the family.',
    ],
];
const endings = [
    [
        'Momen kecil bersama keluarga terasa lebih berkesan.',
        'Those little family moments became more memorable.',
    ],
    [
        'Cocok untuk menikmati akhir pekan dengan ritme yang lebih pelan.',
        'A lovely setting for enjoying a slower weekend.',
    ],
    [
        'Ruang yang pas untuk berbagi cerita di penghujung hari.',
        'A good space for sharing stories at the end of the day.',
    ],
    [
        'Kami menikmati kesempatan untuk berhenti sejenak dari rutinitas.',
        'We enjoyed the chance to pause our everyday routine.',
    ],
];
names.forEach((name, index) => {
    const story = stories[index % stories.length],
        ending = endings[Math.floor(index / stories.length) % endings.length];
    const rating = index < 38 ? 5 : index < 44 ? 4 : 3;
    add('testimonial', {
        title: bi(name, name),
        description: bi(`${story[0]} ${ending[0]}`, `${story[1]} ${ending[1]}`),
        rating,
        source: ['Contoh · liburan keluarga', 'Contoh · akhir pekan', 'Contoh · perjalanan berdua'][
            index % 3
        ],
        source_url: '',
        date: `2026-${index % 2 ? '09' : '08'}-${String((index % 27) + 1).padStart(2, '0')}`,
        avatar: '',
        featured: index < 6,
        translated: true,
        original_locale: 'id',
        consent: false,
    });
});
await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
console.log('Fictional sample dataset: 48 reviews, 6 facilities, 12 photographs, 12 FAQs.');
