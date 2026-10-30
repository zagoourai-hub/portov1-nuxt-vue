# UI/UX Specification — Struktur dan Perilaku

Status: implementasi frontend dimulai dari hero. Referensi visual terbaru: `desain.png` di root; dua PNG dalam `design/` tetap menjadi konteks awal. Referensi requirement: [PRD](../01-product/prd.md), [API](api-spec.md).

Instruksi terbaru pengguna: hero dibuat semirip mungkin dengan referensi, gambar dibuat melalui GPT Image, gaya karakter anime 2D, tanpa emoji, dan judul diganti menjadi **I AM A WEB DEVELOPER**. Implementasi mobile menyesuaikan susunan agar konten tetap terbaca. Konten contoh belum merupakan informasi pemilik yang siap dipublikasikan.

## 1. Batas dokumen

Dokumen ini menentukan informasi, navigasi, state, validasi, dan aksesibilitas. Hero mengikuti referensi terbaru: background gelap, aksen merah, lettering PORTFOLIO besar, ilustrasi karakter, nama/judul di kiri, CTA, dan ringkasan di kanan. Nuxt UI dan Tailwind sudah tersedia pada starter. Detail section berikutnya belum ditandai selesai.

## 2. Peta halaman

| Route usulan | Isi / perilaku |
| --- | --- |
| / | Redirect ke /id. |
| /id dan /en | Profil, proyek unggulan, pengalaman, skill, CV, serta kontak. |
| /:locale/projects | Daftar proyek published. |
| /:locale/projects/:slug | Detail proyek published; slug shared antarbahasa. |
| /admin/login | Email/password, status submit, dan error login generik. |
| /admin | Ringkasan status konten dan akses pengelolaan. |
| /admin/profile | Form profil, kontak, foto, terjemahan, dan publikasi. |
| /admin/projects | Daftar dengan status dan urutan; akses tambah/edit. |
| /admin/projects/new dan /admin/projects/:id | Form proyek dan gambar. |
| /admin/experiences | Daftar, tambah/edit pengalaman, status, dan urutan. |
| /admin/skills | Daftar shared dan pengelolaan nama/urutan. |
| /admin/resume | Upload CV id/en dan publikasi pasangan. |
| /admin/media | File, preview privat, status pemakaian, dan hapus jika tidak direferensikan. |

Path locale selain id/en menghasilkan halaman 404. Tidak membuat halaman detail experience atau halaman layanan di luar PRD.

## 3. Pengalaman publik

- Pengalih bahasa mempertahankan slug proyek. Pada beranda atau daftar, pindah ke route yang setara.
- Nama teknologi dan skill tidak diterjemahkan; teks antarmuka dan narasi mengikuti locale.
- Tombol CV hanya muncul ketika pasangan CV published; mengunduh file locale aktif.
- Kontak email menggunakan mailto dari alamat yang tervalidasi; LinkedIn menggunakan URL tervalidasi.
- Konten yang belum published tidak menampilkan placeholder dari draft. Jika profil belum terbit, beranda menampilkan pesan netral bahwa profil belum tersedia.
- Daftar kosong menampilkan pesan lokal yang jelas. Kegagalan jaringan memiliki opsi coba lagi; detail tak ditemukan memakai status HTTP 404.
- Konten narasi tampil sebagai teks dengan paragraf/line break, bukan HTML input pengguna.
- title, description, canonical, hreflang id/en, dan Open Graph dibentuk dari konten published. Root canonical mengarah ke locale; halaman admin noindex. Sitemap hanya menyertakan halaman publik yang tersedia.

## 4. Pengalaman dashboard

Dashboard menggunakan Bahasa Indonesia. Form bilingual memakai dua kelompok/tab berlabel Indonesia dan Inggris; indikator kelengkapan mencakup keduanya, bukan hanya tab aktif.

Sediakan aksi Simpan draft, Preview, Publikasikan, serta Batalkan publikasi sesuai status. Preview hanya untuk pemilik dan menggunakan endpoint admin; tidak membuat tautan preview publik atau token share.

Untuk konten PUBLISHED, field editable terkunci. Aksi Batalkan publikasi menampilkan konfirmasi bahwa konten hilang sementara dari publik. Setelah DRAFT, pemilik dapat mengedit lalu memublikasikan kembali. Perilaku tanpa revision history ini masih merupakan trade-off rancangan yang perlu ditinjau.

Skill tidak memiliki draft: tombol simpan menyatakan perubahan langsung tampil publik. Pengurutan memakai input posisi atau tombol naik/turun yang dapat diakses keyboard; tidak mewajibkan drag-and-drop.

Upload menampilkan nama, ukuran, preview, status proses, serta kegagalan. Preview lama tidak diganti sebelum upload baru berhasil. File bersama yang sudah dipakai konten published diberi indikator bahwa file tetap publik.

Penghapusan menyebut nama objek dan membutuhkan konfirmasi. Media terpakai tidak dapat dihapus; tampilkan konten yang masih mereferensikannya. Profile/CV menggunakan unpublish, bukan delete singleton.

## 5. State dan aksesibilitas

| State | Perilaku |
| --- | --- |
| Loading | Status terbaca screen reader; hindari submit ganda. |
| Saving | Tombol submit disabled selama request; input tetap ada. |
| Validation error | Error per field, ringkasan fokus, termasuk field tab bahasa lain. |
| Save success | Pesan sukses dan version terbaru; tidak otomatis publish. |
| Network/server error | Pertahankan input; coba ulang melalui aksi pengguna. |
| Conflict 409 | Jelaskan ada perubahan lain; jangan menimpa input; tawarkan reload setelah peringatan. |
| Session expired | Minta login kembali; jangan menyimpan password atau konten privat ke localStorage. Beri tahu jika reload akan kehilangan input belum tersimpan. |
| Unsaved changes | Peringatan sebelum meninggalkan form yang berubah. |

Semua input memiliki label, error terhubung ke field, fokus terlihat, serta kontrol dapat dijalankan dengan keyboard. Dialog konfirmasi mengelola fokus dan mengembalikannya setelah ditutup. Gambar informatif memakai alt bahasa aktif. Status tidak disampaikan hanya melalui warna.

## 6. Handoff desain dan validasi

Pengguna akan menyediakan desain visual. Saat diterima, petakan setiap layar ke route/state di atas, identifikasi bagian yang belum digambar, lalu sesuaikan implementasi tanpa mengubah requirement diam-diam.

Uji viewport 360, 768, dan 1440 piksel; tidak ada horizontal scroll. Periksa keyboard, label, fokus dialog, pembaca layar untuk notifikasi, serta kontras setelah desain visual tersedia. Konten panjang kedua bahasa tidak terpotong. Penilaian kesesuaian visual belum dapat dilakukan sebelum desain diterima.

