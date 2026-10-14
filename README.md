# Arunika Stay — Hotel Portfolio Demo

Website hotel responsif dengan **HTML, CSS, dan JavaScript murni**. Tidak menggunakan React, Laravel, Vite, database, atau backend. Node.js hanya dipakai untuk membuat file HTML statis dan menjalankan preview lokal; hasil `dist/` dapat dihosting di Vercel.

Arunika Stay merupakan hotel fiktif untuk sampel portofolio. Foto stok dan ulasan diberi label contoh, bukan pengalaman tamu sebenarnya.

## Preview lokal

Persyaratan: Node.js 22 atau lebih baru.

```sh
npm ci
npm run dev
```

- Website: http://127.0.0.1:8013/id
- English: http://127.0.0.1:8013/en
- Admin demo: http://127.0.0.1:8013/admin
- Pengantar demo: http://127.0.0.1:8013/admin/login
- Pratinjau draft: http://127.0.0.1:8013/admin/preview

Admin demo **tidak membutuhkan email atau password**. Kredensial dari versi Laravel tidak digunakan. `npm run dev` membangun halaman sekali lalu menjalankan server lokal. Setelah mengubah source, jalankan `npm run build` dan refresh browser. Jangan membuka HTML melalui `file://`; modul dan data membutuhkan HTTP.

## Fitur

- Website beberapa halaman dalam bahasa Indonesia dan Inggris. Setiap halaman memiliki file HTML sendiri dan sudah berisi konten sebelum JavaScript berjalan.
- Kotak navigasi di hero, topbar transparan setelah navigasi hero keluar layar, menu mobile dengan tombol buka/tutup.
- Menu membuka halaman About, Kamar, Fasilitas, Galeri, Ulasan, FAQ, dan Kontak; bukan sekadar scroll di beranda.
- Detail kamar pada halaman terpisah: foto besar, deskripsi lengkap, fasilitas, harga contoh, dan tautan pertanyaan yang membawa pilihan kamar ke halaman kontak.
- Beranda menampilkan seluruh fasilitas yang dipublikasikan, kolase enam foto dengan lightbox, cuplikan FAQ, pilihan kamar, dan ulasan. Foto memakai bentuk lengkung dan susunan bertingkat yang menyesuaikan layar mobile.
- Halaman fasilitas memakai foto besar dan penjelasan yang bergantian; kartu beranda membuka fasilitas terkait pada halaman tersebut. Enam contoh fasilitas: kolam, restoran, lounge, area kerja/Wi-Fi, coffee corner, dan sudut baca. Konten dan foto dapat diganti melalui admin.
- Footer tetap memiliki ruang bawah untuk mobile.
- Galeri dengan filter kategori, lightbox yang mengikuti kategori, dan navigasi keyboard. Kamar dapat difilter untuk berdua atau keluarga; FAQ memiliki pencarian.
- Halaman ulasan berisi **48 ulasan fiktif**, filter rating, pencarian, urutan rating/tanggal, dan pagination 9 ulasan per tampilan. Rating simulasi awal **4,8/5** dihitung dari data contoh, tidak diambil dari platform ulasan.
- Statistik publik bergerak dari 0 ke target saat masuk layar, sekali per kunjungan halaman. Pengaturan reduced motion menampilkan nilai target langsung; pembaca layar mendapat nilai final tanpa pengumuman setiap frame.
- Form kontak menyusun pesan rencana menginap untuk disalin atau dibuka di WhatsApp jika nomor sudah diatur. Form tidak membuat reservasi, mengirim data ke server, atau menyimpan isian.
- Admin demo untuk tambah, edit, hapus, cari, filter, dan urutkan kamar, fasilitas, galeri, testimoni, dan FAQ.
- Testimoni mendukung rating, sumber, tautan sumber, bahasa asli, terjemahan, dan penanda unggulan. Seluruh ulasan tetap ditandai contoh.
- Profil, hero, cerita hotel, kontak, SEO, judul bagian, serta urutan/visibilitas bagian dapat diedit.
- Gambar dari URL HTTPS atau file JPEG/PNG/WebP maksimal 5 MB. File diperkecil di browser sebelum disimpan.
- Draft/published, pratinjau draft, ekspor/impor JSON, dan reset ke data awal.
- Font Manrope disertakan lokal beserta lisensinya; ikon SVG ditulis langsung di kode. Foto stok tetap dimuat dari Unsplash sehingga membutuhkan koneksi internet.

## Penyimpanan demo

Konten versi beberapa halaman disimpan di `localStorage` dengan key `arunika-portfolio-content-v2`. Perubahan bertahan setelah refresh **di browser dan origin yang sama**, serta diperbarui di tab lain pada origin tersebut. Perangkat, browser, localhost, dan domain Vercel memiliki data masing-masing. Menghapus data browser menghapus edit lokal. Data versi sebelumnya pada key `arunika-portfolio-content-v1` tidak dihapus; demo baru memakai ruang penyimpanan tersendiri agar koleksi contoh baru langsung tersedia.

Demo ini tidak menyediakan autentikasi, otorisasi, upload server, atau database bersama. Data browser dapat dibaca oleh pengguna perangkat tersebut. Jangan memasukkan kata sandi, bukti izin privat, atau informasi pribadi. Batas penyimpanan mengikuti browser; kegagalan menyimpan akan menampilkan pesan tanpa menghapus data sebelumnya.

Untuk mengubah sampel awal yang dilihat semua pengunjung:

1. Edit melalui admin demo.
2. Buka **Data & panduan demo → Ekspor JSON**.
3. Ganti `site/data/hotel.json` dengan JSON hasil ekspor.
4. Commit perubahan dan deploy ulang. Periksa tampilan dengan browser bersih atau reset data lokal agar cache edit sebelumnya tidak menimpa sampel baru.

## Deploy ke Vercel

Konfigurasi tersedia di `vercel.json`. [Dokumentasi konfigurasi Vercel](https://vercel.com/docs/project-configuration/vercel-json).

1. Upload source proyek ke repository GitHub, lalu import repository tersebut di Vercel. ZIP `arunika-stay-portfolio.zip` juga disediakan sebagai paket source bersih.
2. Pilih **Framework Preset: Other**, **Root Directory: akar proyek**, **Build Command: `npm run build`**, dan **Output Directory: `dist`**. Install command dapat tetap otomatis (`npm install`/`npm ci`).
3. Tidak ada secret, koneksi database, atau environment variable wajib.
4. Opsional: set `SITE_URL=https://nama-domain-kamu.com` untuk canonical, hreflang, dan sitemap. Bila tersedia, `VERCEL_PROJECT_PRODUCTION_URL` menjadi default. Tanpa domain ini, build tetap berjalan tetapi tidak menghasilkan sitemap dengan domain rekaan.
5. Klik Deploy. Periksa `/id`, `/en`, `/admin`, serta `/admin/preview` setelah deployment.

Halaman publik tambahan tersedia di `/{id|en}/about`, `/rooms`, `/facilities`, `/gallery`, `/testimonials`, `/faq`, dan `/contact`. Contoh detail kamar: `/id/rooms/detail?room=2`. Pergantian bahasa mempertahankan halaman dan ID kamar. Pratinjau admin juga mendukung halaman: `/admin/preview?locale=en&page=testimonials`.

Output hanya berisi HTML, CSS, JavaScript, font, favicon, dan JSON contoh. Arsip Laravel, file `.env`, kredensial lama, dan dependency PHP tidak ikut hasil build. Admin dan preview diberi `noindex`.

## Struktur

```text
site/
  data/hotel.json          # Konten awal dua bahasa
  assets/css/styles.css   # Desain dan responsivitas
  assets/js/site.js        # Render HTML dan interaksi landing page
  assets/js/pages.js       # Layout halaman detail dan perhitungan statistik
  assets/js/routes.js      # URL halaman dan pergantian bahasa
  assets/js/interactions.js # Counter, filter, pagination, form rencana menginap
  assets/js/admin.js       # Admin demo dengan DOM API
  assets/js/store.js       # Validasi, localStorage, filter publikasi
  assets/js/ui.js          # Escape teks, URL aman, SVG, dialog
  assets/js/app.js         # Entry browser
  assets/fonts/           # Font lokal + lisensi
scripts/build.mjs         # Generate HTML statis; built-in Node.js saja
scripts/serve.mjs         # Server preview lokal
tests-static/             # Tes memakai node:test
vercel.json               # Build output, routing, headers
dist/                     # Hasil build (tidak perlu di-commit)
```

```sh
npm run build
npm test
npm run check
```

Versi Laravel/React sebelumnya disimpan lokal di `legacy/laravel/`, termasuk README dan konfigurasi lamanya. Arsip ini tidak dimasukkan ke Git atau deployment. Folder `vendor/` dan `storage/` di akar merupakan sisa lingkungan lokal versi lama; website statis tidak memakainya.
