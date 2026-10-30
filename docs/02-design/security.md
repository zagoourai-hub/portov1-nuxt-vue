# Security dan Authentication Design

Status: rancangan untuk ditinjau; belum ada implementasi atau audit aplikasi. Referensi: [PRD](../01-product/prd.md), [arsitektur](architecture.md), [API](api-spec.md).

**Pembaruan 29 Oktober 2026:** konfigurasi development memakai SQLite dan file privat lokal dalam satu instance. Ketentuan PostgreSQL, object storage, backup, dan pembatasan lintas instance di bawah masih rancangan awal; validasi keamanan dan pilihan hosting produksi belum selesai.

## 1. Trust boundary dan akses

Browser, URL, request body, filename, MIME client, dan forwarded headers diperlakukan sebagai input tidak tepercaya. PostgreSQL dan storage hanya diakses server menggunakan kredensial berhak minimum.

| Aktor | Hak |
| --- | --- |
| Publik | Membaca konten/media yang direferensikan record PUBLISHED. |
| Pemilik dengan sesi sah | Mengelola seluruh konten dan melihat media privat. |
| Akun sah selain pemilik | Tidak memiliki akses admin; respons 403. |
| Operator deployment | Provisioning/pemulihan akun, migrasi, backup, dan cleanup; bukan endpoint publik. |

Guard admin membaca sesi Better Auth, lalu mencocokkan user.id dengan OWNER_USER_ID server-side. Jangan bergantung pada email dari request atau role yang dapat diubah client.

## 2. Autentikasi dan sesi

Aktifkan email/password dan disableSignUp. Tetapkan base URL eksplisit serta trusted origins terbatas untuk setiap environment. Pilihan tersebut tersedia dalam [referensi konfigurasi Better Auth](https://better-auth.com/docs/reference/options). Tidak menonaktifkan proteksi origin bawaan.

Usulan sesi: umur maksimum 8 jam tanpa remember-me, cookie HttpOnly, Secure di produksi, SameSite=Lax. Hindari cache sesi yang membuat pencabutan terlambat; konfigurasi akhir diuji pada versi library terpilih. Logout mencabut sesi aktif. Password 12–128 karakter; hashing dan verifikasi diserahkan ke Better Auth.

Tidak memakai localStorage untuk token. Tidak mengaktifkan email reset/verification yang memerlukan provider email pada MVP; satu akun awal dibuat operator melalui prosedur privat. Pesan login generik tidak membedakan email tidak ditemukan dan password salah.

## 3. Provisioning dan pemulihan pemilik

1. Operator menggunakan environment terisolasi tanpa listener HTTP publik dan konfigurasi database target yang diperiksa.
2. Jalankan provisioning satu kali melalui API server Better Auth yang didukung versi terpilih. Sign-up hanya boleh diaktifkan pada proses privat ini; konfigurasi aplikasi publik tetap disableSignUp.
3. Masukkan password lewat prompt tersembunyi/secret sementara, bukan argumen command, file committed, atau log.
4. Tolak provisioning apabila akun pemilik sudah ada. Catat user.id untuk OWNER_USER_ID; jangan mencetak password/token.
5. Uji login, tolak akun lain, lalu pastikan endpoint registrasi publik tetap gagal.

Pemulihan menggunakan operasi server resmi yang didukung versi terpilih untuk mengganti kredensial, lalu mencabut semua sesi. Jangan mengubah hash secara manual atau membuka sign-up produksi. API/metode tepat menjadi checklist verifikasi versi sebelum script dibuat. Restore backup hanya untuk kehilangan data, bukan cara rutin reset password.

## 4. Request, konten, dan media

- Mutasi API domain memverifikasi Origin sama dengan origin aplikasi yang dikonfigurasi; tolak origin hilang/asing untuk endpoint browser. Gunakan metode non-GET untuk perubahan state dan cookie SameSite. Endpoint auth mengikuti proteksi native Better Auth.
- Validasi server memakai allowlist field, batas panjang, locale, date range, version, URL HTTPS, dan identitas media.
- SSR/render Vue tidak menggunakan raw HTML untuk narasi. Tidak membuat URL fetch/proxy generik.
- File dibatasi sebelum seluruh body dimuat; batasi ukuran pada reverse proxy serta handler streaming. Validasi magic bytes dan struktur; reject SVG, HTML, executable, PDF rusak/terenkripsi, serta gambar gagal decode.
- Gambar maksimal 25 megapiksel untuk membatasi penggunaan memori decoder; library pemrosesan dipilih dan diaudit saat implementasi. PDF hanya diunduh sebagai attachment, tidak dirender oleh server.
- Object key acak; filename pengguna tidak menjadi path. File untrusted disimpan privat dan tidak memiliki public ACL.
- Pemeriksaan publik berbasis relasi published dilakukan setiap request, termasuk HEAD/range jika didukung. Tidak mengandalkan sulitnya menebak UUID. MVP boleh tidak mendukung Range.
- Download merespons nosniff dan no-store. Pembatalan publikasi tidak dapat menghapus salinan yang sudah diunduh pengguna.

## 5. Batas operasional usulan

Nilai berikut adalah default rancangan, bukan angka yang telah diuji terhadap hosting.

| Batas | Nilai dan enforcement |
| --- | --- |
| Login | 5 percobaan/menit/IP; 429 setelah batas, Retry-After. |
| Upload | 10 request/menit/pemilik; maksimal 2 transfer bersamaan. |
| File | Gambar 5.000.000 byte, PDF 10.000.000 byte; multipart 11.000.000 byte. |
| Kuota | 500.000.000 byte total file termasuk reservasi, FAILED/DELETING yang belum dibersihkan; tolak upload baru saat penuh. |
| Public API/media | Baseline gateway 120 request/menit/IP; sesuaikan setelah uji halaman lengkap dan crawler. |
| JSON | Maksimal 256 KiB per request. |

Gunakan rate limiter bawaan Better Auth dengan penyimpanan database untuk auth; bukan memory lokal pada banyak instance. Rate limiter upload/slot/kuota membutuhkan state atomik lintas instance di PostgreSQL. Model limiter tambahan mengikuti API storage versi auth yang dipilih; tidak menggunakan tabel auth sebagai counter domain secara ad hoc.

[Dokumentasi rate limiting Better Auth](https://better-auth.com/docs/concepts/rate-limit) menjelaskan bahwa pemanggilan internal auth.api tidak terkena limiter HTTP. Karena itu, jangan membuat endpoint login alternatif yang melewati proteksi. Aktifkan limiter dalam pengujian juga.

Hanya percayai IP dari proxy deployment yang terkonfigurasi dan menimpa forwarded headers. Uji bahwa spoofed X-Forwarded-For tidak melewati batas. Shared-IP dapat terkena batas; ambang harus dievaluasi sebelum produksi. Tidak menambahkan Redis atau queue pada MVP.

## 6. Secrets, log, dan recovery

Konfigurasi server: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, OWNER_USER_ID, serta kredensial/endpoint/bucket storage. Nama variabel storage mengikuti provider terpilih. Hanya site URL nonrahasia boleh masuk konfigurasi publik.

Jangan log password, cookie, token, body CV, atau connection string. Log requestId, route, status, durasi, jenis error aman, serta ID konten untuk kejadian mutasi. Usulan retensi log 7 hari; akses operator saja. Hindari menyimpan alamat IP mentah lebih lama dari kebutuhan limiter.

Backup harian retensi 7 hari, object versioning/backup, RPO 24 jam dan RTO 4 jam merupakan target usulan yang bergantung provider/biaya. Restore staging memverifikasi akun/sesi, konten dua bahasa, serta file berdasarkan object key. Setelah pemulihan kredensial insiden, cabut sesi dan rotasi secret yang terdampak.

## 7. Checklist verifikasi sebelum rilis

- Registrasi publik ditolak melalui request langsung, bukan hanya UI.
- Sesi sah nonpemilik tidak dapat membaca/mengubah admin.
- Draft dan media privat tidak tersedia via slug, ID, metadata, sitemap, atau direct bucket URL.
- Publish/unpublish dan delete/attach bersamaan tidak menghasilkan file terhapus yang masih direferensikan.
- Cross-origin mutation, invalid URL, malicious filename, oversize body, dan file salah tipe ditolak.
- Login/upload/public limiter berfungsi lintas instance dan tidak dapat dilewati header palsu.
- Rollback upload menjaga file aktif; quota reservation dibersihkan setelah kegagalan.
- Secret tidak ada dalam bundle client/log; logout dan pemulihan mencabut sesi.
- Backup dapat direstore dan migrasi diuji di staging.

TBD sebelum implementasi terkait: versi auth/adapter dan metode provisioning/recovery, provider dan gateway, biaya storage/backup, serta strategi observability provider. Desain ini tidak menyatakan sistem sudah aman tanpa validasi implementasi.

