# PRD — Portfolio Profesional Bilingual

## 1. Ringkasan Produk

Website portfolio pribadi untuk membantu rekruter menilai profil, keterampilan, pengalaman, dan hasil pekerjaan pemilik. Pemilik mengelola seluruh konten melalui dashboard privat.

Status: baseline requirement berdasarkan keputusan pengguna; desain visual sedang disiapkan oleh pengguna dan akan menyusul. Dokumen ini tidak menetapkan layout, warna, tipografi, atau gaya visual.

### Keputusan terkonfirmasi

- Stack: Nuxt, Prisma, Better Auth, dan SQLite. Pengguna memilih SQLite pada 28 Oktober 2026.
- Target utama: rekruter.
- Bahasa publik: Indonesia dan Inggris.
- Satu akun pemilik dengan email dan password; tanpa registrasi publik.
- Kontak melalui email dan LinkedIn.
- Gambar dan PDF CV diunggah melalui dashboard.
- Konten hanya boleh dipublikasikan setelah kedua bahasa lengkap.

### Problem statement

Rekruter membutuhkan satu tempat untuk menilai kompetensi dan bukti pekerjaan kandidat serta mengakses CV dan kontak. Pemilik membutuhkan cara memperbarui informasi tersebut tanpa mengubah kode.

### Indikator keberhasilan MVP

- Rekruter dapat menemukan profil, proyek, pengalaman, dan CV tanpa login.
- Pemilik dapat memperbarui konten tanpa mengubah kode.
- Seluruh konten terpublikasi tersedia dalam kedua bahasa.
- Pengunjung tidak dapat mengakses draft, data akun, atau operasi pengelolaan.
- Alur melihat proyek, mengganti bahasa, membuka kontak, dan mengunduh CV berfungsi pada mobile dan desktop.

## 2. Pengalaman Pengguna dan Fungsionalitas

### Persona dan alur

- **Rekruter:** Membutuhkan ringkasan kompetensi, bukti pekerjaan, pengalaman, serta kontak. Alur: beranda → profil dan proyek → detail proyek → pengalaman → unduh CV atau kontak.
- **Pemilik:** Membutuhkan pengelolaan konten dan akses privat. Alur: login → edit konten dua bahasa → simpan draft → tinjau → publikasikan → logout.

### User stories

- Sebagai rekruter, saya ingin membaca hasil dan peran kandidat dalam proyek agar dapat menilai kecocokannya.
- Sebagai rekruter, saya ingin memilih bahasa dan mengunduh CV yang sesuai agar mudah meninjau kandidat.
- Sebagai pemilik, saya ingin menyiapkan draft bilingual agar konten belum lengkap tidak terlihat publik.
- Sebagai pemilik, saya ingin memperbarui konten dan media dari dashboard agar portfolio tetap aktual.

### Functional requirements dan acceptance criteria

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| FR-001 | Profil profesional | Beranda menampilkan nama, peran, ringkasan, foto, dan akses menuju proyek, CV, serta kontak. Pemilik dapat mengeditnya. |
| FR-002 | Portfolio proyek | Daftar dan detail hanya menampilkan proyek terpublikasi. Detail memuat judul, ringkasan, peran, teknologi, gambar, serta hasil pekerjaan. Tautan demo/repository opsional. |
| FR-003 | Pengalaman dan skill | Pemilik dapat menambah, mengedit, mengurutkan, dan menghapus pengalaman serta skill. Pengalaman mendukung status masih berlangsung. |
| FR-004 | Bahasa | Halaman publik memiliki URL per bahasa. Pengalih bahasa mempertahankan halaman terkait. Teks antarmuka dan konten editorial tersedia dalam Indonesia dan Inggris. |
| FR-005 | Draft dan publikasi | Profil, proyek, pengalaman, dan CV dapat disiapkan sebelum ditampilkan. Publikasi ditolak jika field wajib atau versi bahasa belum lengkap. Draft tidak dapat dibaca melalui halaman maupun API publik. |
| FR-006 | Dashboard | Pemilik dapat mengelola profil, proyek, pengalaman, skill, kontak, gambar, dan CV. Form menyediakan validasi, status penyimpanan, serta pesan kegagalan yang jelas. |
| FR-007 | Autentikasi | Better Auth menangani login email/password, sesi, dan logout. Akun awal disiapkan secara privat. Semua operasi admin memverifikasi sesi dan identitas pemilik di server. |
| FR-008 | Media dan CV | Pemilik dapat mengunggah gambar dan CV per bahasa. File tidak valid ditolak. Penggantian file yang gagal tidak menghilangkan file aktif sebelumnya. |
| FR-009 | Kontak | Tombol email membuka aplikasi email; LinkedIn menuju profil yang dikonfigurasi. Tidak ada formulir atau penyimpanan pesan pengunjung. |
| FR-010 | SEO dan halaman kosong | Halaman terpublikasi memiliki judul, deskripsi, metadata berbagi, dan informasi bahasa. Proyek tidak tersedia menghasilkan 404; daftar kosong ditampilkan dengan wajar. |

## 3. Spesifikasi Teknis dan Batas Sistem

### Arsitektur dan integrasi

- Nuxt menyediakan halaman publik, dashboard, dan endpoint server.
- Prisma mengelola akses data ke SQLite.
- Better Auth menangani autentikasi dan sesi.
- Penyimpanan file menampung gambar dan CV; database menyimpan metadata serta referensinya.

Entitas konseptual: akun/sesi, profil, proyek, pengalaman, skill, terjemahan, dan media. Skema autentikasi mengikuti integrasi Better Auth yang diverifikasi pada tahap desain teknis.

Pembacaan publik hanya mengembalikan konten terpublikasi. Penulisan konten, preview draft, dan unggah file membutuhkan otorisasi pemilik. Nama endpoint, schema terperinci, dan strategi migrasi ditetapkan pada desain teknis.

### Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR-001 | Layout dapat digunakan pada lebar 360–1440 piksel tanpa horizontal scroll. Detail visual mengikuti desain pengguna yang menyusul. |
| NFR-002 | Navigasi dan form dapat digunakan dengan keyboard; input memiliki label dan gambar informatif memiliki alt text. |
| NFR-003 | Secret dan kredensial database hanya tersedia di server serta tidak masuk repository atau respons publik. |
| NFR-004 | Input, URL, konten, dan file divalidasi di server. |
| NFR-005 | Login dan unggah memiliki pembatasan request yang dapat diuji; ambang ditetapkan pada desain teknis. |
| NFR-006 | Pesan kesalahan tidak membocorkan password, token, atau detail database. |
| NFR-007 | Kegagalan penyimpanan mempertahankan input form agar pemilik dapat mencoba kembali. |

## 4. Keputusan Pengujian

Pengujian berfokus pada perilaku yang dapat diamati:

- Login berhasil/gagal, logout, sesi kedaluwarsa, serta penolakan akses admin tanpa sesi yang sah.
- CRUD konten, penyimpanan draft, publikasi bilingual lengkap, dan penolakan publikasi belum lengkap.
- Draft tidak muncul melalui URL langsung atau API publik, termasuk media draft.
- Perpindahan bahasa mempertahankan konteks dan menggunakan CV yang sesuai.
- Unggah valid, tipe/ukuran tidak valid, kegagalan penyimpanan, dan penggantian file.
- Tampilan mobile/desktop, navigasi keyboard, 404, daftar kosong, metadata, dan tautan kontak.

Framework pengujian dipilih saat konfigurasi project tersedia. MVP selesai ketika acceptance criteria terpenuhi, build/typecheck dan pengujian yang tersedia lulus, serta tidak ada temuan keamanan kritis atau tinggi yang belum ditangani.

## 5. Risiko dan Roadmap

| Risiko | Mitigasi |
| --- | --- |
| Terjemahan memperlambat publikasi | Checklist kelengkapan kedua bahasa dan penyimpanan draft. |
| Unggahan menambah biaya penyimpanan | Batas file, kuota penyimpanan, serta kebijakan penghapusan media yang ditentukan pada desain teknis. |
| Pemilik kehilangan akses akun tunggal | Prosedur pemulihan dan backup diuji sebelum rilis. |
| Media draft terbuka melalui URL penyimpanan | Kontrol akses media mengikuti status publikasi dan diuji melalui akses langsung. |
| Desain visual belum tersedia | Pengguna menyediakan desain; implementasi tampilan menunggu referensi tersebut tanpa mengarang keputusan visual. |

Tahapan: baseline PRD → desain teknis dan penerimaan desain visual → task breakdown → implementasi → validasi → deployment setelah persetujuan.

Rencana rilis mencakup backup database/media dan prosedur pemulihan. Detail rollout serta rollback diselesaikan sebelum deployment produksi.

## 6. Di Luar Scope MVP

- Blog, portal klien, registrasi publik, dan multi-admin.
- OAuth, formulir kontak, serta notifikasi email.
- AI, terjemahan otomatis, dan analytics khusus.
- Pembuatan desain visual pengganti desain yang sedang disiapkan pengguna.

## 7. Asumsi, Default, dan Keputusan Terbuka

### Default rancangan

- Bahasa awal Indonesia; URL eksplisit `/id` dan `/en`.
- Dashboard menggunakan Bahasa Indonesia.
- Gambar menerima JPEG, PNG, atau WebP maksimal 5 MB; CV menerima PDF maksimal 10 MB.
- CV tersedia untuk masing-masing bahasa.
- Skill dan nama teknologi merupakan label bersama; teks editorial diterjemahkan.
- Pemulihan akun menggunakan prosedur operasional, tanpa layanan email reset password pada MVP.

### TBD sebelum implementasi komponen terkait

| Keputusan | Penanggung jawab / waktu penyelesaian |
| --- | --- |
| Desain visual dan referensi interaksi | Pengguna; sebelum implementasi tampilan. |
| Hosting aplikasi, file SQLite, dan penyimpanan file | Pemilik bersama pelaksana desain teknis; sebelum integrasi infrastruktur. |
| Versi dependency yang kompatibel | Pelaksana desain teknis; diverifikasi sebelum instalasi. |
| Kuota file, pembatasan request, backup, dan pemulihan akun | Pelaksana desain teknis bersama pemilik; sebelum implementasi keamanan dan penyimpanan. |
| Konten profil, proyek, pengalaman, gambar, dan CV dua bahasa | Pemilik; sebelum publikasi. |

Repository pada saat penyusunan belum memiliki source code, manifest dependency, atau konfigurasi pengujian. PRD ini tidak menyatakan kompatibilitas versi dependency maupun hasil pengujian aplikasi telah diverifikasi.
