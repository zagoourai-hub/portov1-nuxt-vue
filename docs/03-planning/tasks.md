# Task Breakdown — Portfolio Profesional Bilingual

Status dokumen: Phase 4 dimulai pada frontend atas instruksi pengguna. Tanggal: 28 Oktober 2026.

### Lanjutan pengujian admin

- Tautan “Login kembali” pada halaman pengelolaan kini hanya muncul untuk HTTP 401. Playwright memeriksa 409 duplikat dan 401 sintetis; input tetap tersimpan pada keduanya.
- Dengan akun dan database sintetis, Playwright memeriksa upload gambar valid, penolakan gambar invalid, serta simpan dan publish pengalaman bilingual hingga tersedia melalui API publik.
- Lint file terkait, typecheck, build, dan 16 tes proyek lulus. Typecheck masih menampilkan peringatan plugin `vue-router/volar/sfc-route-blocks`; build mengeluarkan peringatan dependency dan sourcemap.
- Form profil, proyek, CV, dan seluruh alur media belum diuji secara menyeluruh melalui Playwright. Task MVP dan pemeriksaan browser lainnya tetap terbuka.

### Handoff — lanjut besok

- Pengguna meminta pekerjaan dilanjutkan besok; jangan lanjutkan implementasi sampai diminta kembali.
- Data contoh bilingual sudah di-seed secara lokal. Timeline memiliki tiga pengalaman contoh; seluruh profil, kontak, proyek, pengalaman, dan CV contoh perlu diganti sebelum rilis.
- Playwright menguji admin menggunakan akun dan database sintetis terisolasi: login/logout, guard, navigasi halaman admin, penyimpanan skill, perlindungan perubahan yang belum disimpan, serta overflow profil pada 360/768/1440 berhasil diperiksa.
- Temuan berikutnya: saat skill duplikat ditolak, halaman admin tetap menampilkan tautan “Login kembali” meskipun sesi aktif. Periksa penyebab dan perbaiki agar tautan hanya muncul bila relevan dengan autentikasi.
- Pengujian Playwright untuk upload media, publikasi, dan seluruh form admin masih belum selesai. Pemeriksaan memakai build produksi terakhir; build ulang sebelum menguji perubahan terbaru bila diperlukan.

### Pemeriksaan lanjutan — 29 Oktober 2026

- Catatan handoff di bawah bersifat historis: `main.css` kini hanya berisi import dan tema Tailwind; tidak ditemukan blok `<style>`, `@apply`, atau `@media` pada file Vue/CSS di `app/`.
- TASK-011 tetap IN_PROGRESS sampai migrasi diverifikasi pada browser, termasuk viewport, navigasi keyboard, dan interaksi. Jangan menganggap penerimaan visual sudah disetujui.
- Kode terbaru sudah membaca data publik melalui `usePortfolioContent`; catatan bahwa backend belum terhubung tidak menggambarkan seluruh kondisi saat ini. Kelengkapan integrasi dan acceptance criteria tetap perlu diuji pada task terkait.
- Lockfile cocok dengan audit `SAFE_NO_KNOWN_IOC` terakhir. Lint lulus; typecheck lulus dengan peringatan plugin `vue-router/volar/sfc-route-blocks` tidak ditemukan. `pnpm` tidak tersedia pada PATH sehingga pemeriksaan dijalankan melalui Node dan executable lokal.
- Build berhasil dengan peringatan dependency; suite `node --test tests/backend.test.mjs tests/scroll-motion.test.mjs tests/asset-path.test.mjs tests/setup-local.test.mjs` lulus 14 tes.
- Pengalih bahasa kini mempertahankan query dan hash pada route; smoke test frontend lulus 5 tes pada server lokal. Lint untuk file yang diubah dan typecheck lulus, dengan peringatan plugin Vue Router yang sama.
- Form dashboard meminta konfirmasi sebelum membuang perubahan saat berpindah route, memilih item lain, publish/unpublish, atau menghapus item; penutupan atau reload tab menggunakan peringatan browser. Lint dan typecheck lulus; pengujian interaksi browser masih diperlukan.
- Perpindahan form ditahan selama request berjalan. `tests/unsaved-changes.test.mjs` memeriksa perubahan terjemahan dan galeri serta konfirmasi pengguna; tes, lint file terkait, dan typecheck lulus. Peringatan plugin Vue Router masih muncul saat typecheck.
- Playwright memeriksa beranda pada lebar 360/768/1440: tidak ditemukan horizontal overflow; menu mobile membuka dan menutup dengan Escape, pengalih bahasa mempertahankan query, dan pesan CV kosong tampil. Temuan aksesibilitas: setelah Escape menutup menu, fokus jatuh ke `body`, bukan kembali ke tombol menu. Pengujian dashboard dengan akun sintetis masih diperlukan.

### Handoff — pekerjaan dihentikan atas permintaan pengguna

- Pengguna meminta dilanjutkan besok dan meminta konteks ini diingat. Tidak melanjutkan implementasi sampai pengguna kembali meminta.
- Task aktif tetap TASK-011. Permintaan berikutnya: migrasikan seluruh komponen, layout, halaman publik/proyek, dan halaman error ke utility class Tailwind dengan breakpoint standar `sm:`, `md:`, `lg:`, `xl:`. Pengguna meminta tidak membuat CSS manual. `main.css` hanya menyimpan import dan konfigurasi tema Tailwind; tanpa selector custom, `@apply`, atau `@media` manual.
- Migrasi menyeluruh belum dimulai: baru pembacaan file dan pemeriksaan kondisi terakhir. Styling lama masih berada di `app/assets/css/main.css`.
- Greeting pada `PortfolioHero.vue` sudah memakai `translate-y-[70px] text-[30px] md:translate-y-[100px] md:text-[38px]`, `origin-left`, dan `-rotate-5`. Pertahankan penyesuaian terbaru pengguna saat migrasi; jangan mengembalikan nilai mobile lama -90px.
- Referensi utama adalah `desain.png` di root. Karakter hero final adalah `app/assets/image/developer-anime-v2.png`, dibuat dengan GPT Image setelah pengguna meminta gaya anime 2D yang lebih tegas. Pengguna tidak menginginkan emoji atau tampilan AI slop.
- Pengguna mengganti identitas Rayhan Aditya menjadi I AM A WEB DEVELOPER. File hero saat handoff memiliki span pertama kosong dan teks terlihat WEB DEVELOPER; pertahankan perubahan lokal pengguna, jangan mengembalikan nama lama.
- Data portfolio masih contoh; backend, auth, dan CV belum terhubung. Jangan menyatakan task integrasi atau MVP selesai.
- Pemeriksaan sebelum jeda: lockfile root dan installed lock tidak berubah dari audit SAFE_NO_KNOWN_IOC terakhir. TypeScript existing 7.0.2 masih bermasalah dengan vue-tsc/typescript-eslint. Jangan mengganti dependency atau perubahan pengguna diam-diam.
- Langkah berikutnya: baca ulang file terbaru, migrasikan styling tanpa mengubah perilaku, hapus CSS manual yang telah dipindahkan, lalu periksa browser responsif dan interaksi. Jalankan validasi yang tersedia sesuai audit dependency; laporkan hambatan lint/typecheck secara jujur.

### Progres aktif — frontend hero

- Pengguna mengarahkan implementasi UI terlebih dahulu, kemudian mempersempit pekerjaan aktif ke hero section.
- Referensi visual terbaru adalah `desain.png` di root. Hero menggunakan ilustrasi anime 2D hasil GPT Image dan judul **I AM A WEB DEVELOPER**, sesuai koreksi pengguna.
- TASK-011 berstatus IN_PROGRESS. Bagian publik memakai starter Nuxt UI existing; penyelesaian dashboard dan integrasi backend tetap menunggu task terkait. Urutan ini merupakan penyesuaian eksplisit pengguna, bukan pengabaian gate rilis.
- Subtask hero: implementasi dan pemeriksaan frontend selesai; kesesuaian visual akhir menunggu tinjauan pengguna. Halaman publik lain yang sudah disiapkan masih menggunakan konten contoh dan belum dianggap selesai sesuai acceptance criteria MVP.
- Bukti pemeriksaan dan batas validasi: [frontend-ui.md](../04-quality/frontend-ui.md). Prompt/aset: [image-assets.md](../02-design/image-assets.md).

## 1. Referensi dan aturan pelaksanaan

- [PRD](../01-product/prd.md).
- [Arsitektur](../02-design/architecture.md), [database](../02-design/database.md), [API](../02-design/api-spec.md), [UI/UX](../02-design/ui-ux.md), [keamanan](../02-design/security.md).
- Desain pengguna: [UI-UX.png](../../design/UI-UX.png) dan [dashboard.png](../../design/dashboard.png).

Status: TODO → IN_PROGRESS → IN_REVIEW → DONE; gunakan BLOCKED saat ada hambatan nyata dan catat penyebabnya. TODO tidak berarti siap: semua dependency dan keputusan terkait harus terpenuhi dahulu. Kerjakan satu task aktif, validasi, lalu review sebelum DONE.

P0 adalah kebutuhan/gate MVP; P1 adalah pekerjaan setelah gate sebelumnya. Rekomendasi Sol untuk domain, API, security, dan integrasi; Luna untuk UI yang kontraknya sudah jelas. Nama ini mengikuti workflow, bukan perintah mengganti model atau melakukan delegasi otomatis.

File/modul di bawah merupakan target usulan; repository belum memiliki source code. Sesuaikan lokasi dengan konvensi versi Nuxt yang dikunci tanpa mengubah scope. Setiap task menyertakan pembaruan dokumentasi langsung terkait jika kontrak berubah.

## 2. Temuan desain dan batas scope

| Temuan | Perlakuan untuk task MVP |
| --- | --- |
| UI-UX.png menampilkan publik gelap dengan aksen merah, hero ilustratif, kartu proyek, profil, timeline, kontak, dan detail proyek. | Referensi visual utama publik; teks/CTA diimplementasikan sebagai HTML, bukan screenshot halaman. |
| Ada dashboard gelap pada UI-UX.png, sedangkan dashboard.png merupakan dashboard terang yang lebih rinci. | Referensi struktur dashboard tersedia; pilihan tema dikunci di TASK-001, tidak diasumsikan sebagai persetujuan theme switch. |
| dashboard.png memuat pengunjung, grafik aktivitas, unduhan CV, tren persentase, pesan, dan lonceng notifikasi. | Analytics/inbox tidak ada pada PRD; gunakan ringkasan jumlah konten aktual. Fitur tambahan memerlukan perubahan PRD terpisah. |
| Search global/Ctrl+K, ID/EN dashboard, theme toggle, serta Pengaturan muncul dalam mockup. | Tidak otomatis menjadi requirement. Dashboard tetap berbahasa Indonesia sesuai baseline; keputusan tambahan dipisahkan di TASK-001. |
| Hero memuat availability, statistik, ilustrasi, dan kartu keunggulan; kontak memuat lokasi; tabel proyek memuat kategori. | Belum seluruhnya memiliki field dalam schema. Tentukan mana dekorasi dan mana konten editable; perubahan schema hanya setelah keputusan, bukan menyalin angka contoh. |
| Detail proyek belum memperlihatkan narasi peran dan hasil secara lengkap. | Tetap masukkan peran dan hasil sesuai FR-002; gambar tidak menghapus requirement PRD. |
| Mockup belum memuat layar mobile, login, form bilingual, error, upload, dan konflik. | Gunakan perilaku UI/UX existing; responsive/state diuji. Detail visual belum tergambar tidak boleh disebut telah disetujui. |
| Aset yang tersedia dua PNG komposit, bukan logo/font/hero/gambar proyek terpisah. | Inventarisasi aset final; placeholder development diberi status jelas dan tidak menjadi bukti kesiapan rilis. |

Logo teknologi dalam mockup menggambarkan konten portfolio, bukan instruksi memasang Tailwind, PrimeVue, Docker, atau dependency lainnya.

Kebijakan unpublish sebelum edit dalam desain teknis masih usulan. TASK-001 harus menetapkannya bersama pengguna; jangan membangun perilaku tersebut sebagai keputusan final tanpa penyelarasan.

## 3. Ringkasan urutan

| ID | Task | Prioritas | Status | Model | Dependency |
| --- | --- | --- | --- | --- | --- |
| TASK-001 | Selaraskan desain dan keputusan teknis | P0 | TODO | Sol | — |
| TASK-002 | Tetapkan runtime, dependency, dan target infrastruktur | P0 | TODO | Sol | TASK-001 |
| TASK-003 | Inisialisasi aplikasi dan pemeriksaan dasar | P0 | TODO | Sol | TASK-002 |
| TASK-004 | Schema PostgreSQL dan migrasi awal | P0 | TODO | Sol | TASK-003 |
| TASK-005 | Autentikasi dan provisioning pemilik | P0 | TODO | Sol | TASK-004 |
| TASK-006 | Kontrak API dan aturan domain bersama | P0 | TODO | Sol | TASK-004, TASK-005 |
| TASK-007 | Upload, akses, dan penghapusan media privat | P0 | TODO | Sol | TASK-006 |
| TASK-008 | API profil, pengalaman, dan skill | P0 | TODO | Sol | TASK-006, TASK-007 |
| TASK-009 | API proyek dan galeri bilingual | P0 | TODO | Sol | TASK-006, TASK-007 |
| TASK-010 | API CV bilingual dan publikasi pasangan | P0 | TODO | Sol | TASK-006, TASK-007 |
| TASK-011 | Fondasi UI, locale, dan navigasi | P0 | IN_PROGRESS | Luna | TASK-003, TASK-001 |
| TASK-012 | Login dan ringkasan dashboard | P0 | TODO | Luna | TASK-005, TASK-008, TASK-009, TASK-011 |
| TASK-013 | Form profil, pengalaman, dan skill | P0 | TODO | Luna | TASK-008, TASK-011, TASK-012 |
| TASK-014 | Form proyek, galeri, dan preview privat | P0 | TODO | Luna | TASK-009, TASK-011, TASK-012 |
| TASK-015 | Pengelolaan media dan CV | P0 | TODO | Luna | TASK-007, TASK-010, TASK-011, TASK-012 |
| TASK-016 | Halaman publik profil, pengalaman, skill, dan kontak | P0 | TODO | Luna | TASK-008, TASK-010, TASK-011 |
| TASK-017 | Daftar, proyek unggulan, dan detail publik | P0 | TODO | Luna | TASK-009, TASK-011, TASK-016 |
| TASK-018 | SEO, error state, dan integrasi aksesibilitas | P0 | TODO | Sol | TASK-013, TASK-014, TASK-015, TASK-016, TASK-017 |
| TASK-019 | Validasi keamanan, regresi, dan review MVP | P0 | TODO | Sol | TASK-018 |
| TASK-020 | Staging, backup, dan kesiapan rilis | P0 | TODO | Sol | TASK-019 |
| TASK-021 | Deployment produksi setelah persetujuan | P1 | TODO | Sol | TASK-020 |

Dependency di atas berlaku untuk penyelesaian dan integrasi penuh. Pengguna mengizinkan UI prototype mendahului backend dengan starter dan dependency existing. Saat ini pekerjaan aktif dibatasi hero pada TASK-011; tidak ada task backend atau deployment yang dinyatakan selesai.

## 4. Detail task

### TASK-001 — Selaraskan desain dan keputusan teknis

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** —
- **Deskripsi:** Petakan kedua PNG ke PRD; selesaikan keputusan yang memengaruhi model data dan alur implementasi.
- **Scope / out of scope:** Dokumentasi desain/keputusan; tidak membuat UI atau menambah fitur di luar PRD.
- **File/modul terkait:** docs/02-design/*.md; design/UI-UX.png; design/dashboard.png.

**Acceptance criteria:**

- [ ] Setiap elemen desain dipetakan sebagai sesuai PRD, dekorasi, atau usulan fitur tambahan.
- [ ] Catat keputusan pengguna untuk tema dashboard, perilaku edit konten published, dan field tambahan sebelum mengubah requirement terkait.
- [ ] Usulan dasar: publik mengikuti UI-UX.png; struktur dashboard mengikuti dashboard.png dengan statistik konten aktual, tanpa analytics atau inbox.
- [ ] Perbarui status referensi visual pada dokumentasi: desain sudah tersedia, tetapi mobile, form, dan state belum digambar.
- [ ] Kontrak publikasi, field domain, serta UI/UX konsisten; keputusan belum selesai dicatat sebagai blocker task terkait.

**Validasi:** Review silang PRD, schema, API, dan kedua PNG. Tidak menganggap contoh angka atau pilihan library dalam gambar sebagai requirement.

### TASK-002 — Tetapkan runtime, dependency, dan target infrastruktur

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-001
- **Deskripsi:** Verifikasi kombinasi Nuxt, Prisma, Better Auth, adapter PostgreSQL, Node.js, serta kebutuhan storage.
- **Scope / out of scope:** Matriks versi, audit statis, dan konfigurasi yang direncanakan; tidak provisioning berbayar atau deploy.
- **File/modul terkait:** Dokumentasi arsitektur/keamanan; rencana manifest dan environment.

**Acceptance criteria:**

- [ ] Versi exact dan dukungan adapter diverifikasi dari sumber resmi; perbedaan contoh lintas major diselesaikan.
- [ ] Audit dependency sesuai skill secure-dependency-audit menghasilkan SAFE_NO_KNOWN_IOC sebelum package execution/instalasi; hasil dan waktu pemeriksaan dicatat.
- [ ] Provider development/staging serta batas hosting untuk upload dan koneksi database ditentukan tanpa mengekspos secret.
- [ ] Anggaran/provider produksi yang belum dipilih tetap menjadi blocker rilis, bukan dianggap tersedia.
- [ ] Pilih tooling minimal untuk lint, typecheck, Vitest dan Playwright; UI library tidak dipilih hanya karena muncul sebagai badge desain.

**Validasi:** Review sumber resmi dan hasil audit. Bila scan tidak lengkap/berbahaya, hentikan instalasi dan tandai BLOCKED.

### TASK-003 — Inisialisasi aplikasi dan pemeriksaan dasar

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-002
- **Deskripsi:** Siapkan Nuxt TypeScript dan konfigurasi development sesuai versi yang diverifikasi.
- **Scope / out of scope:** Fondasi aplikasi, scripts, dan dokumentasi menjalankan lokal; tanpa halaman fitur.
- **File/modul terkait:** package.json, lockfile, nuxt.config.ts, app/, server/, tests/, README.md, .env.example, .gitignore.

**Acceptance criteria:**

- [ ] Aplikasi berjalan lokal; scripts dev/build/lint/typecheck/test terdefinisi dan terdokumentasi.
- [ ] TypeScript strict aktif; client tidak menerima konfigurasi rahasia.
- [ ] .env.example hanya placeholder; file secret dan output build diabaikan Git.
- [ ] Fondasi test dapat menjalankan satu smoke test bermakna; tidak membuat test semata-mata mengulang konfigurasi.

**Validasi:** Jalankan lint, typecheck, test smoke, dan build setelah audit dependency memenuhi syarat; catat hasil aktual.

### TASK-004 — Schema PostgreSQL dan migrasi awal

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-003
- **Deskripsi:** Implementasikan schema domain, schema auth versi terpilih, constraint, dan seed singleton draft.
- **Scope / out of scope:** Persistensi dan data test; tanpa kredensial contoh produksi.
- **File/modul terkait:** prisma/, konfigurasi Prisma, client server, fixtures database test.

**Acceptance criteria:**

- [ ] Entitas/relasi mengikuti database.md yang telah diselaraskan; model auth berasal dari generator versi terpilih dan ditinjau.
- [ ] Unique locale, slug, singleton, nama skill, FK media, tanggal, serta version memiliki enforcement yang sesuai.
- [ ] Migrasi berjalan pada database kosong; seed singleton idempotent dan tetap DRAFT.
- [ ] Database test terpisah; tidak ada reset database produksi.
- [ ] Client Prisma digunakan bersama dengan lifecycle dan driver adapter yang kompatibel.

**Validasi:** Integration test constraint, cascade/restrict, migrasi database kosong, dan seed dua kali.

### TASK-005 — Autentikasi dan provisioning pemilik

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-004
- **Deskripsi:** Pasang Better Auth, guard pemilik, sesi, provisioning privat, serta prosedur pemulihan.
- **Scope / out of scope:** Email/password untuk satu pemilik; tanpa sign-up publik, OAuth, atau reset email.
- **File/modul terkait:** Handler /api/auth/*, fungsi auth/guard server, script operasional privat, test auth.

**Acceptance criteria:**

- [ ] Login/logout berfungsi dan sesi kedaluwarsa sesuai konfigurasi; cookie produksi aman.
- [ ] Registrasi langsung melalui HTTP ditolak; akun sah nonpemilik mendapat 403.
- [ ] Provisioning privat menolak duplikasi pemilik dan tidak mencetak secret.
- [ ] Pemulihan memakai API library yang diverifikasi, mengganti kredensial dan mencabut seluruh sesi.
- [ ] Login rate limit, trusted origin, dan trusted proxy diterapkan; tidak ada endpoint alternatif yang melewati limiter.

**Validasi:** Integration test login salah/benar, sign-up ditolak, nonpemilik, expired session, logout/recovery revocation, dan limiter.

### TASK-006 — Kontrak API dan aturan domain bersama

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-004, TASK-005
- **Deskripsi:** Bangun validasi input, respons error, version conflict, serta pemeriksaan kelengkapan publikasi yang digunakan handler.
- **Scope / out of scope:** Fungsi bersama yang benar-benar dipakai; tanpa framework CRUD generik.
- **File/modul terkait:** server/ domain/validation, handler utilities, tests domain/API.

**Acceptance criteria:**

- [ ] Unknown fields, locale salah, URL tidak aman, tanggal invalid, dan body berlebih ditolak.
- [ ] Mutasi domain memerlukan sesi pemilik dan origin sah; GET tidak mengubah state.
- [ ] Error mengikuti api-spec.md tanpa stack trace/secret; auth mempertahankan format native.
- [ ] Aturan publish memeriksa id/en lengkap dan media READY.
- [ ] Update bersyarat version memastikan hanya satu dari dua perubahan bersamaan berhasil.

**Validasi:** Unit test batas validasi; integration test cross-origin, status error, dan konflik dua request.

### TASK-007 — Upload, akses, dan penghapusan media privat

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-006
- **Deskripsi:** Implementasikan object storage privat, reservation kuota, upload, preview, streaming publik, dan cleanup.
- **Scope / out of scope:** IMAGE/PDF sesuai batas; tanpa URL fetch remote, public bucket, atau pipeline video.
- **File/modul terkait:** server/ media/storage, endpoint media publik/admin, tabel reservation/limiter bila dibutuhkan, prosedur cleanup.

**Acceptance criteria:**

- [ ] Ukuran, magic bytes, struktur, dimensi gambar, dan tipe file diperiksa sebelum READY.
- [ ] Kuota dan batas transfer/rate limit atomik lintas instance; upload gagal tidak mengganti referensi konten.
- [ ] Media hanya publik bila dipakai konten PUBLISHED; draft/direct bucket tidak dapat dibaca publik.
- [ ] Attach/delete memakai koordinasi transaksi sehingga media tidak hilang saat masih direferensikan.
- [ ] File lama terpelihara saat penggantian gagal; state UPLOADING/FAILED/DELETING dapat direkonsiliasi.
- [ ] Respons media memakai nosniff/no-store dan PDF attachment.

**Validasi:** Integration test storage terisolasi: valid/invalid/oversize, quota race, gagal transfer/delete, akses draft, serta attach/delete race. Uji relasi published memakai fixture DB.

### TASK-008 — API profil, pengalaman, dan skill

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-006, TASK-007
- **Deskripsi:** Implementasikan pengelolaan profil bilingual, pengalaman, skill, urutan, dan pembacaan publik.
- **Scope / out of scope:** Field sesuai kontrak final; tanpa model custom CMS atau layanan freelance.
- **File/modul terkait:** Endpoint profile/experiences/skills publik dan admin, fungsi domain, tests.

**Acceptance criteria:**

- [ ] Profil singleton dan pengalaman mendukung draft/publish/unpublish sesuai keputusan TASK-001.
- [ ] Experience mendukung tanggal akhir null dan validasi rentang; skill shared langsung tampil setelah simpan.
- [ ] Translations dan parent tersimpan atomik; konten belum lengkap tidak dapat publish.
- [ ] Filter publik hanya published; pagination dan urutan stabil sesuai API.
- [ ] Update/delete dengan version lama ditolak tanpa kehilangan data.

**Validasi:** Integration test CRUD, locale, publikasi, draft access, tanggal, duplikat skill, pengurutan, dan rollback transaksi.

### TASK-009 — API proyek dan galeri bilingual

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-006, TASK-007
- **Deskripsi:** Implementasikan proyek, terjemahan, galeri, featured, urutan, dan detail berdasarkan slug.
- **Scope / out of scope:** CRUD dan publikasi proyek; tanpa kategori tambahan kecuali telah disepakati TASK-001.
- **File/modul terkait:** Endpoint projects publik/admin, domain project, tests.

**Acceptance criteria:**

- [ ] Draft dapat disimpan bertahap; publish membutuhkan field dan media kedua bahasa lengkap.
- [ ] Slug unik dan immutable setelah publikasi pertama; sama untuk id/en.
- [ ] Referensi gambar dan alt kedua bahasa disimpan atomik dengan proyek.
- [ ] Detail draft/tidak ada menghasilkan 404 publik; daftar mendukung pagination dan filter featured.
- [ ] Perilaku edit published mengikuti keputusan final dan tidak memublikasikan perubahan diam-diam.

**Validasi:** Integration test slug conflict, incomplete locale/alt, gallery rollback, optimistic concurrency, dan draft leakage.

### TASK-010 — API CV bilingual dan publikasi pasangan

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-006, TASK-007
- **Deskripsi:** Implementasikan singleton Resume dan CV untuk dua bahasa.
- **Scope / out of scope:** Upload melalui media existing; tanpa konversi atau generator CV.
- **File/modul terkait:** Endpoint resume publik/admin, domain resume, tests.

**Acceptance criteria:**

- [ ] Resume publish hanya jika dua referensi PDF READY valid.
- [ ] Locale aktif menentukan file unduhan; draft CV tidak dapat diunduh publik.
- [ ] Penggantian gagal mempertahankan referensi lama; version stale ditolak.
- [ ] Unpublish menutup akses publik request berikutnya, kecuali media masih direferensikan konten published lain.

**Validasi:** Integration test publish pasangan, locale download, failed replacement, dan akses setelah unpublish.

### TASK-011 — Fondasi UI, locale, dan navigasi

- **Prioritas:** P0
- **Status:** IN_PROGRESS
- **Model:** Luna
- **Dependencies:** TASK-003, TASK-001
- **Deskripsi:** Implementasikan shell publik/admin dan token visual berdasarkan referensi yang disepakati.
- **Scope / out of scope:** Navigasi, layout responsif, komponen form/status dasar, dan locale; tanpa fitur di luar MVP.
- **File/modul terkait:** app/layouts/, app/components/, routing locale, aset yang sah digunakan.

**Acceptance criteria:**

- [ ] Publik mengikuti nuansa gelap/merah UI-UX.png; dashboard memakai tema yang diputuskan TASK-001.
- [ ] / mengarah ke /id; id/en memiliki teks UI; locale tidak valid menghasilkan 404.
- [ ] Navigasi dan sidebar bekerja dengan keyboard pada 360, 768, dan 1440 piksel tanpa horizontal scroll.
- [ ] Ilustrasi hero dipisahkan dari teks/CTA HTML; PNG komposit tidak dipakai sebagai seluruh halaman.
- [ ] Aset/font/icon final diinventarisasi; aset yang belum ada dicatat dan tidak diklaim identik dengan mockup.

**Validasi:** Uji browser viewport, keyboard/focus, route locale, dan screenshot review terhadap referensi. Jangan mengklaim kontras lulus tanpa pengukuran.

### TASK-012 — Login dan ringkasan dashboard

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Luna
- **Dependencies:** TASK-005, TASK-008, TASK-009, TASK-011
- **Deskripsi:** Buat login, navigasi admin, ringkasan konten, tindakan cepat, dan proyek terbaru.
- **Scope / out of scope:** Jumlah konten aktual dari API existing; tanpa analytics, pesan, notifikasi, atau pencarian global.
- **File/modul terkait:** app/pages/admin/login, dashboard, komponen tabel/status, auth client.

**Acceptance criteria:**

- [ ] Login generik, loading, error, logout, dan redirect lokal aman berfungsi.
- [ ] Ringkasan menghitung konten/draft dari total API; bukan angka pengunjung contoh.
- [ ] Tabel proyek terbaru dan tindakan cepat menuju modul terkait; menu yang belum siap tidak menjadi dead link pada rilis.
- [ ] Halaman admin noindex; session expired ditangani tanpa menyimpan token di localStorage.
- [ ] Client guard membantu navigasi sementara keamanan tetap berada di endpoint server.

**Validasi:** E2E login/logout, akses langsung admin, sesi kedaluwarsa, angka total benar, serta navigasi tindakan cepat.

### TASK-013 — Form profil, pengalaman, dan skill

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Luna
- **Dependencies:** TASK-008, TASK-011, TASK-012
- **Deskripsi:** Buat form bilingual dan daftar pengelolaan profil/pengalaman/skill.
- **Scope / out of scope:** Form, validasi, urutan, preview konten; tanpa field ekstra yang belum disetujui.
- **File/modul terkait:** app/pages/admin/profile, experiences, skills, komponen form.

**Acceptance criteria:**

- [ ] Pemilik dapat menjalankan CRUD dan pengurutan tanpa kode.
- [ ] Tab/kelompok id/en menunjukkan error lintas bahasa dan kelengkapan publikasi.
- [ ] Simpan draft tidak publish; confirm unpublish/delete menjelaskan dampak.
- [ ] Input dipertahankan saat error; 409 tidak menimpa input diam-diam.
- [ ] Form skill menjelaskan perubahan langsung tampil publik; tanggal ongoing ditangani.

**Validasi:** E2E CRUD, validasi dua bahasa, error jaringan, conflict, unsaved changes, keyboard dan fokus dialog.

### TASK-014 — Form proyek, galeri, dan preview privat

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Luna
- **Dependencies:** TASK-009, TASK-011, TASK-012
- **Deskripsi:** Buat daftar/editor proyek dan pengelolaan gambar sesuai alur publikasi.
- **Scope / out of scope:** Form bilingual dan galeri dari media existing; tanpa rich text editor.
- **File/modul terkait:** app/pages/admin/projects, form project, pemilih media, preview.

**Acceptance criteria:**

- [ ] Create/edit draft, featured, urutan, URL opsional, teknologi, dan galeri berfungsi.
- [ ] Alt id/en dapat diisi dan urutan gambar dapat diubah dengan keyboard.
- [ ] Preview menggunakan API admin dan tidak membuat link share publik.
- [ ] Publish menampilkan kekurangan kedua bahasa; konten published mengikuti kebijakan final.
- [ ] Upload/error/conflict mempertahankan data form dan referensi gambar sebelumnya.

**Validasi:** E2E proyek dari draft sampai publish, preview private, slug immutable, galeri, dan gagal upload/save.

### TASK-015 — Pengelolaan media dan CV

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Luna
- **Dependencies:** TASK-007, TASK-010, TASK-011, TASK-012
- **Deskripsi:** Buat daftar media, status penggunaan, preview privat, serta pengelolaan dua CV.
- **Scope / out of scope:** Dashboard media/CV; tanpa editor gambar atau konversi PDF.
- **File/modul terkait:** app/pages/admin/media, resume, komponen upload.

**Acceptance criteria:**

- [ ] Upload menampilkan progress/status dan pesan ukuran/format/kuota yang jelas.
- [ ] Media terpakai tidak bisa dihapus; UI menunjukkan referensi yang menghalangi.
- [ ] Pemilik dapat memasang dan publish CV id/en, lalu mengunduh file yang benar.
- [ ] File bersama yang sudah publik diberi indikator; penggantian gagal mempertahankan file sebelumnya.
- [ ] Retry tidak otomatis menggandakan POST/file.

**Validasi:** E2E unggah valid/invalid, failure recovery, delete in-use, publish CV, dan download dua bahasa.

### TASK-016 — Halaman publik profil, pengalaman, skill, dan kontak

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Luna
- **Dependencies:** TASK-008, TASK-010, TASK-011
- **Deskripsi:** Bangun beranda dengan hero, profil, pengalaman, skill, kontak, dan akses CV dari data nyata.
- **Scope / out of scope:** Bagian publik sesuai PRD dan hasil pemetaan desain; tanpa metrik/claim palsu.
- **File/modul terkait:** app/pages/[locale], komponen hero/about/experience/skills/contact.

**Acceptance criteria:**

- [ ] Teks dan CTA berupa HTML aksesibel; gambar hero dioptimalkan dan memiliki fallback bila aset belum tersedia.
- [ ] Konten mengikuti locale tanpa fallback draft; pergantian bahasa mempertahankan konteks route.
- [ ] Timeline memakai data pengalaman; skill berasal dari database, bukan badge statis sebagai asumsi dependency.
- [ ] Email/LinkedIn dan CV locale aktif bekerja; bagian yang belum published memiliki empty state aman.
- [ ] Nama, angka pengalaman/proyek/klien, dan klaim kualitas tidak disalin dari contoh tanpa data/keputusan.

**Validasi:** E2E dua locale, tanpa konten, kegagalan API, kontak/CV, keyboard, serta screenshot viewport.

### TASK-017 — Daftar, proyek unggulan, dan detail publik

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Luna
- **Dependencies:** TASK-009, TASK-011, TASK-016
- **Deskripsi:** Bangun kartu proyek, daftar lengkap, detail bilingual, serta galeri sesuai referensi.
- **Scope / out of scope:** Proyek published; tanpa pencarian/filter/kategori tambahan yang belum disepakati.
- **File/modul terkait:** app/pages/[locale]/projects, kartu/galeri proyek, bagian featured beranda.

**Acceptance criteria:**

- [ ] Featured beranda dan daftar memakai data API, pagination dapat digunakan.
- [ ] Detail menampilkan peran serta hasil pekerjaan, selain judul, gambar, teknologi, dan tautan.
- [ ] Galeri dapat digunakan keyboard; tombol demo/repository opsional tidak menghasilkan tautan kosong.
- [ ] Pengalih bahasa mempertahankan slug; draft/tidak ada menghasilkan HTTP 404.
- [ ] Kartu dan detail tetap terbaca dengan judul panjang pada mobile.

**Validasi:** E2E daftar/detail, featured, pagination, gallery keyboard, locale switch, serta draft direct URL.

### TASK-018 — SEO, error state, dan integrasi aksesibilitas

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-013, TASK-014, TASK-015, TASK-016, TASK-017
- **Deskripsi:** Lengkapi metadata SSR dan periksa state lintas halaman.
- **Scope / out of scope:** SEO dasar dan kualitas MVP; tanpa tracking analytics.
- **File/modul terkait:** Metadata/canonical/hreflang/sitemap, error pages, pengujian integrasi UI.

**Acceptance criteria:**

- [ ] Title/description/Open Graph/canonical/hreflang sesuai locale dan hanya memakai published.
- [ ] Admin noindex; sitemap tidak mencantumkan draft; respons 404 benar pada SSR.
- [ ] Keyboard, label, fokus dialog, error announcement, dan kontras diuji terhadap UI final.
- [ ] Viewport 360/768/1440 tanpa horizontal scroll; loading/empty/error/conflict terjangkau.
- [ ] Gambar memakai dimensi dan ukuran responsif yang tepat; hero tidak menunda keterbacaan teks.

**Validasi:** Periksa HTML SSR tanpa JavaScript, sitemap, scanner aksesibilitas ditambah manual keyboard, dan screenshot review.

### TASK-019 — Validasi keamanan, regresi, dan review MVP

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-018
- **Deskripsi:** Jalankan matriks acceptance PRD dan review integrasi secara menyeluruh.
- **Scope / out of scope:** Pengujian/fix yang langsung diperlukan requirement; tanpa perluasan fitur.
- **File/modul terkait:** tests/, seluruh modul terkait, docs/04-quality/test-plan.md dan security.md bila diperlukan untuk hasil.

**Acceptance criteria:**

- [ ] Seluruh FR-001–FR-010 dan NFR memiliki bukti pass/fail yang dapat ditelusuri.
- [ ] Uji signup bypass, akun nonpemilik, cross-origin, draft/media leakage, quota/rate race, upload salah tipe, dan secret exposure.
- [ ] Uji publikasi concurrent, stale version, storage failure, serta cleanup file yatim.
- [ ] Lint/typecheck/unit/integration/E2E/build lulus pada versi final yang diaudit.
- [ ] Temuan review dicatat berdasarkan severity; Critical/High diselesaikan sebelum rilis.

**Validasi:** Catat perintah, environment, hasil aktual, serta keterbatasan; tidak menyatakan aman hanya karena test otomatis lulus.

### TASK-020 — Staging, backup, dan kesiapan rilis

- **Prioritas:** P0
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-019
- **Deskripsi:** Siapkan deployment staging dan runbook rilis/rollback setelah akses dan provider tersedia.
- **Scope / out of scope:** Staging terotorisasi dan kesiapan operasional; deployment produksi di luar task.
- **File/modul terkait:** Konfigurasi deployment, migrasi release, runbook backup/restore, laporan staging.

**Acceptance criteria:**

- [ ] Provider/domain/secret/biaya dikonfirmasi; tidak membuat layanan berbayar tanpa otorisasi.
- [ ] Staging menggunakan data sintetis dan bucket privat; batas upload serta koneksi diuji pada runtime sebenarnya.
- [ ] Migrasi dijalankan satu release process; backup dan restore database beserta file berhasil diuji.
- [ ] Rate limit lintas instance dan trusted proxy terbukti bekerja pada topologi target.
- [ ] Runbook mencatat rollback kompatibel schema, target RPO/RTO aktual, cleanup, recovery akun, serta smoke test.

**Validasi:** Staging smoke test id/en, login, publish, media/CV, unpublish, restore, dan pengecekan secret bundle. Tandai BLOCKED bila akses/provider belum tersedia.

### TASK-021 — Deployment produksi setelah persetujuan

- **Prioritas:** P1
- **Status:** TODO
- **Model:** Sol
- **Dependencies:** TASK-020
- **Deskripsi:** Rilis MVP hanya setelah persetujuan eksplisit pengguna dan seluruh gate rilis terpenuhi.
- **Scope / out of scope:** Deployment dan smoke test produksi terotorisasi; tanpa migrasi destruktif otomatis.
- **File/modul terkait:** Pipeline/runbook rilis, konfigurasi produksi, laporan hasil.

**Acceptance criteria:**

- [ ] Persetujuan produksi tercatat; konten dan aset final milik pengguna tersedia.
- [ ] Backup sebelum migrasi, konfigurasi origin, owner identity, serta storage privat diverifikasi.
- [ ] Smoke test publik/admin/media dua bahasa lulus; draft tetap privat.
- [ ] Rollback dijalankan sesuai runbook jika pemeriksaan kritis gagal; hasil aktual dilaporkan.

**Validasi:** Gunakan checklist TASK-020, pantau error/latensi/kuota tanpa logging secret. Jangan deploy hanya karena task ini tercantum.

## 5. Pemetaan requirement

| Requirement | Task implementasi utama | Verifikasi integrasi |
| --- | --- | --- |
| FR-001 profil | TASK-008, TASK-013, TASK-016 | TASK-018, TASK-019 |
| FR-002 proyek | TASK-009, TASK-014, TASK-017 | TASK-018, TASK-019 |
| FR-003 pengalaman/skill | TASK-008, TASK-013, TASK-016 | TASK-019 |
| FR-004 bilingual | TASK-006, TASK-008–TASK-011, TASK-013–TASK-017 | TASK-018, TASK-019 |
| FR-005 draft/publish | TASK-006–TASK-010, TASK-013–TASK-015 | TASK-019 |
| FR-006 dashboard | TASK-012–TASK-015 | TASK-019 |
| FR-007 autentikasi | TASK-005, TASK-006, TASK-012 | TASK-019 |
| FR-008 media/CV | TASK-007, TASK-010, TASK-015 | TASK-019, TASK-020 |
| FR-009 kontak | TASK-008, TASK-013, TASK-016 | TASK-019 |
| FR-010 SEO/empty/404 | TASK-016–TASK-018 | TASK-019 |
| NFR-001–NFR-002 responsive/accessibility | TASK-011–TASK-018 | TASK-018, TASK-019 |
| NFR-003–NFR-006 keamanan/validasi/limit/error | TASK-003–TASK-010 | TASK-019, TASK-020 |
| NFR-007 input saat gagal | TASK-013–TASK-015 | TASK-019 |

## 6. Gate dan risiko dependency

- Desain sudah tersedia, tetapi konflik scope dan aset final belum selesai. TASK-001 menghasilkan keputusan yang bisa ditinjau, bukan langsung membuat aplikasi.
- Kombinasi versi dependency belum terbukti. Instalasi/package execution hanya setelah audit yang diwajibkan project.
- Pilihan storage, batas upload hosting, database pooling, serta biaya backup memengaruhi TASK-007 dan TASK-020; jangan memilih layanan berbayar diam-diam.
- Schema auth dan API provisioning/recovery harus mengikuti versi terpilih; keberadaan contoh dokumentasi belum membuktikan kompatibilitas.
- TASK-021 membutuhkan persetujuan produksi eksplisit meskipun task sebelumnya selesai.
- Tidak ada build/test aplikasi yang telah dijalankan pada saat dokumen ini dibuat.

## 7. Handoff dan pelaporan

Pada akhir task, catat status, ringkasan perubahan, file yang diubah, perintah validasi beserta hasil aktual, masalah/risiko tersisa, dan task berikutnya yang dependency-nya sudah terpenuhi. IN_REVIEW menandakan implementasi siap ditinjau; DONE hanya setelah acceptance criteria dan review terpenuhi.

Jika blocker muncul, tuliskan keputusan/akses yang dibutuhkan dan task terdampak. Jangan menandai DONE untuk menghindari blocker atau mengubah requirement tanpa persetujuan.

