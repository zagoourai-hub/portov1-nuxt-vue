# Portfolio profesional bilingual

Aplikasi Nuxt untuk portfolio publik berbahasa Indonesia dan Inggris serta dashboard privat satu pemilik. Konten, sesi, dan status publikasi disimpan di SQLite melalui Prisma; autentikasi menggunakan Better Auth. Gambar dan CV disimpan sebagai file privat pada filesystem server.

## Menjalankan secara lokal

Prasyarat: Node.js 24 atau lebih baru yang didukung dependency, pnpm 12.15.0, dan akses tulis ke direktori project. Jalankan audit dependency sesuai `AGENTS.md` sebelum memasang atau menjalankan package.

```sh
pnpm install --ignore-scripts
pnpm setup:local
pnpm db:generate
pnpm db:migrate
pnpm owner:setup
pnpm dev
```

`setup:local` membuat `.env`, direktori `.data/media`, dan file database bila belum ada; konfigurasi dan database yang sudah ada dipertahankan. `owner:setup` hanya berjalan di terminal interaktif. Masukkan email pemilik dan password 12–128 karakter pada prompt tersembunyi. Setelah akun dibuat, mulai atau restart server dan buka `http://localhost:3000/admin/login`. Jangan menaruh password, token, `.env`, atau `.data` di repository.

Jika password hilang, hentikan server dan jalankan `pnpm owner:reset` di terminal pada mesin yang memiliki akses ke konfigurasi dan database. Masukkan email pemilik dan password baru. Proses privat ini menggunakan alur reset Better Auth dan mencabut sesi lama; tidak mengirim email.

Halaman publik tersedia pada `/id` dan `/en`. Konten awal kosong sampai pemilik mengisi kedua bahasa, mengunggah media yang diperlukan, menyimpan draft, lalu memublikasikannya. Konten published harus di-unpublish sebelum diedit; selama itu konten tersebut tidak tersedia untuk publik. Skill langsung tampil setelah disimpan.

Untuk mengisi database lokal yang masih kosong dengan data pratinjau bilingual, jalankan `pnpm seed:demo`. Data profil, kontak, pengalaman, proyek, dan CV yang dihasilkan hanya contoh dan harus diganti sebelum rilis. Seed menolak database yang sudah berisi konten atau media dan hanya menggunakan `.data/portfolio.db` serta `.data/media`.

## Menjalankan dengan Docker

Docker Compose menggunakan database dan media dalam volume `portfolio-data` tersendiri; data `.data` pada host tidak otomatis disalin. Salin `docker/.env.example` ke `docker/.env` jika belum ada, lalu isi `BETTER_AUTH_SECRET` dengan secret acak minimal 32 karakter. Konfigurasi Docker terpisah dari `.env` lokal. Audit dependency sebelum build.

```sh
docker compose build
docker compose run --rm setup
docker compose up -d
```

Provisioning hanya untuk database volume yang belum memiliki akun. Perintah tersebut membutuhkan terminal interaktif dan akses tulis ke `docker/.env`; masukkan email dan password pada prompt. Saat mengetik password tidak ada karakter atau tanda bintang yang ditampilkan; ketik 12–128 karakter lalu tekan Enter. Jika panjangnya tidak valid, prompt akan meminta ulang. Setelah provisioning, Compose membaca `OWNER_USER_ID` dari file tersebut saat container dibuat. Untuk melihat email pemilik, gunakan `docker compose run --rm email`. Untuk pemulihan password, hentikan aplikasi, jalankan `docker compose run --rm reset`, kemudian jalankan `docker compose up -d` kembali.

Untuk mengisi volume kosong dengan konten contoh setelah migrasi, jalankan `docker compose run --rm app node scripts/seed-demo.ts`. Konten ini hanya untuk pratinjau.

Website tersedia di `http://localhost:3000`. Port hanya dibuka pada localhost. Jika port sudah digunakan server lokal lain, hentikan server tersebut terlebih dahulu. `docker compose down` menghentikan container tanpa menghapus volume; backup database dan media bersama-sama sebelum memindahkan atau memulihkan data. Jangan menjalankan beberapa instance terhadap volume SQLite yang sama.

## Pemeriksaan

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

Tes integrasi membuat database dan akun sintetis terpisah di `.data`, menjalankan server hasil build pada port 3157, dan menguji autentikasi, publikasi, privasi media, CV, dan pembatasan request. Port 3157 harus tersedia. `tests/frontend.test.mjs` adalah smoke test tambahan yang membutuhkan server lokal pada port 3000 atau URL `FRONTEND_TEST_URL`.

## Data lokal dan rilis

SQLite dan media lokal memerlukan filesystem yang persisten dan hanya ditujukan untuk satu instance. Sebelum deployment produksi, pilih hosting yang mendukung persistensi, tetapkan URL publik dan secret, uji backup serta restore database dan file media bersama-sama, dan siapkan pembatasan request serta anggaran pada gateway/hosting. Jangan menyimpan media privat di direktori `public/` atau mempublikasikan `.env` dan `.data`.

Backup lokal sederhana: hentikan server dan seluruh proses yang menulis database/media, salin `.data/portfolio.db` beserta `.data/media` ke lokasi privat, lalu simpan `.env` secara terpisah di penyimpanan rahasia. Restore harus diuji pada salinan terisolasi sebelum rilis. Jika menggunakan path kustom, sesuaikan lokasi dengan konfigurasi environment. Konfigurasi dan status implementasi ada di `docs/`.
