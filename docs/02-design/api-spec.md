# API Specification

Status: kontrak usulan untuk implementasi. Referensi: [PRD](../01-product/prd.md), [database](database.md), [keamanan](security.md).

## 1. Konvensi

REST JSON satu origin. Locale wajib id atau en pada endpoint konten publik. UUID untuk ID domain, timestamp ISO 8601 UTC, date YYYY-MM-DD. Unknown input fields ditolak. Body JSON maksimum 256 KiB; upload memakai multipart terpisah.

Sukses aplikasi: { data: ... }, daftar: { data: [...], meta: { page, pageSize, total } }. Error aplikasi: { error: { code, message, fields? }, requestId }. fields memetakan path input ke pesan aman. Endpoint Better Auth mempertahankan format native library; tidak dibungkus ulang.

Daftar proyek/pengalaman/skill menggunakan page >= 1, pageSize default 20 dan maksimum 100; urutan position ASC, id ASC. Client beranda dapat meminta pageSize 100 dan halaman berikut bila diperlukan. Public response hanya memuat locale aktif dan field aman, bukan objectKey, data sesi, atau versi bahasa draft.

Kode umum: 400 input tidak valid; 401 sesi hilang/kedaluwarsa; 403 bukan pemilik/origin ditolak; 404 tidak ditemukan atau konten/media tidak publik; 409 konflik version, status, slug, atau referensi; 413 terlalu besar; 415 tipe tidak didukung; 422 publikasi belum lengkap; 429 rate limit; 503 database/storage sementara tidak tersedia. Error 500 untuk kegagalan tak terduga tanpa detail internal.

## 2. Endpoint publik

| Method dan path | Input | Respons 200 |
| --- | --- | --- |
| GET /api/public/profile | locale | Profil published: name, role, summary, photoUrl, photoAlt, email, linkedinUrl. |
| GET /api/public/projects | locale, page, pageSize, featured opsional boolean | Daftar: id, slug, title, summary, technologies, cover, featured, position. |
| GET /api/public/projects/:slug | locale | Detail menambah role, outcome, images dengan alt, demoUrl, repositoryUrl. |
| GET /api/public/experiences | locale, page, pageSize | company, role, description, startDate, endDate, position. |
| GET /api/public/skills | page, pageSize | id, name, position. |
| GET /api/public/resume | locale | downloadUrl untuk file locale aktif. |
| GET /api/media/:id | Tidak ada | Stream media jika dipakai record PUBLISHED. IMAGE inline, PDF attachment. |

Singleton belum published menghasilkan 404; halaman beranda menangani sebagai bagian yang belum tersedia tanpa merender draft. Daftar kosong menghasilkan 200 dengan array kosong. Slug draft/tidak ditemukan menghasilkan 404. Locale tidak dikenal pada API menghasilkan 400.

Media tidak menerima object key/path dari client. Headers: Content-Type tervalidasi, X-Content-Type-Options: nosniff, Cache-Control: no-store. Nama unduhan CV dibuat server. HEAD jika disediakan harus memakai pemeriksaan akses yang sama dengan GET. Metadata sharing memakai endpoint gambar publik yang sama.

## 3. Autentikasi

Mount Better Auth pada /api/auth/*. Login menggunakan POST /api/auth/sign-in/email dengan email dan password; logout melalui POST /api/auth/sign-out; pembacaan sesi melalui GET /api/auth/get-session menggunakan client resmi. Referensi: [email/password](https://better-auth.com/docs/authentication/email-password) dan [Nuxt](https://better-auth.com/docs/integrations/nuxt).

Registrasi email dinonaktifkan di konfigurasi, bukan sekadar menyembunyikan UI. Tidak menambahkan OAuth, endpoint reset email, atau akun tamu. Akun yang valid tetapi bukan OWNER_USER_ID tidak memiliki akses admin.

## 4. Endpoint admin

Semua endpoint berikut memerlukan sesi pemilik; mutasi memerlukan pemeriksaan same-origin. Semua respons memakai no-store.

| Method dan path | Fungsi |
| --- | --- |
| GET /api/admin/profile | Profil lengkap dua bahasa + status/version. |
| PUT /api/admin/profile | Simpan draft singleton dengan version. |
| POST /api/admin/profile/publish atau /unpublish | Transisi dengan body version. |
| GET /api/admin/projects atau /experiences | Daftar terpaginasikan semua status, filter status opsional. |
| POST /api/admin/projects atau /experiences | Buat draft; respons 201. |
| GET /api/admin/projects/:id atau /experiences/:id | Detail dua bahasa, relasi, status, version. |
| PUT /api/admin/projects/:id atau /experiences/:id | Ganti field editable draft dengan version. |
| POST /api/admin/projects/:id/publish atau /unpublish | Transisi proyek dengan version. |
| POST /api/admin/experiences/:id/publish atau /unpublish | Transisi pengalaman dengan version. |
| DELETE /api/admin/projects/:id atau /experiences/:id | Hanya draft, version pada body; respons 204. |
| GET /api/admin/skills | Daftar shared, terpaginasikan. |
| POST /api/admin/skills | Buat label dan position; respons 201. |
| PUT /api/admin/skills/:id | Ubah name/position dengan version. |
| DELETE /api/admin/skills/:id | Hapus dengan version; respons 204. |
| GET /api/admin/resume | Status/version dan mediaId kedua bahasa. |
| PUT /api/admin/resume | Simpan referensi kedua CV pada draft dengan version. |
| POST /api/admin/resume/publish atau /unpublish | Transisi dengan version. |
| GET /api/admin/media | Daftar terpaginasikan metadata dan status pemakaian. |
| POST /api/admin/media | Multipart satu file dan kind IMAGE/PDF; respons 201 metadata READY. |
| GET /api/admin/media/:id/file | Stream preview privat untuk pemilik. |
| DELETE /api/admin/media/:id | Hapus file tanpa referensi; respons 204 setelah storage dan metadata terhapus. |

Path dengan kata "atau" menyatakan endpoint terpisah, bukan wildcard resource bebas. Tidak menyediakan endpoint pengelolaan akun publik.

## 5. Payload dan validasi domain

PUT mengganti seluruh field editable; translations selalu object dengan key id dan en. Draft boleh null/blank pada field konten yang belum diisi. Aturan format/panjang untuk nilai yang diberikan tetap berlaku; publish memerlukan semua field wajib lengkap.

| Resource | Field editable |
| --- | --- |
| Profile | name, email, linkedinUrl, photoId, translations.{id,en}.{role,summary,photoAlt}, version. |
| Project | slug, technologies[], demoUrl, repositoryUrl, featured, position, translations.{id,en}.{title,summary,role,outcome}, images[{mediaId,position,altId,altEn}], version untuk PUT. |
| Experience | company, startDate, endDate, position, translations.{id,en}.{role,description}, version untuk PUT. |
| Skill | name, position, version untuk PUT. |
| Resume | translations.{id,en}.{mediaId}, version. |

Status, firstPublishedAt, objectKey, serta audit fields tidak boleh diisi melalui payload konten. Slug proyek immutable setelah pertama publish; label teknologi tidak otomatis membuat Skill.

Batas usulan: name/company/title/role maksimal 160 karakter, summary 1.000, outcome/description 10.000, alt 200, URL 2.048, email 254. Nama skill/teknologi maksimal 80; maksimal 30 teknologi dan 20 gambar/proyek. position integer 0–100.000.

URL eksternal hanya HTTPS; LinkedIn harus host linkedin.com atau www.linkedin.com. Email berupa alamat, bukan mailto yang disuplai bebas. Slug mengikuti database.md. Tidak fetch URL eksternal di server. Narasi diperlakukan sebagai plain text.

Publish Profile membutuhkan nama, email, LinkedIn, foto READY, serta role/summary/photoAlt dua bahasa. Project membutuhkan slug, minimal satu teknologi dan gambar dengan alt kedua bahasa, title/summary/role/outcome dua bahasa; URL opsional. Experience membutuhkan company, tanggal valid, role/description dua bahasa. Resume membutuhkan PDF READY untuk id dan en.

## 6. Konflik, upload, dan retry

Publish/unpublish menaikkan version; aksi berulang dengan version kedaluwarsa menghasilkan 409. Edit/delete PUBLISHED menghasilkan 409 dengan code CONTENT_PUBLISHED. Klien harus meminta unpublish eksplisit, bukan melakukan otomatis.

Upload limit: IMAGE 5.000.000 byte; PDF 10.000.000 byte. Multipart envelope maksimum 11.000.000 byte. Server memeriksa magic bytes dan struktur file, bukan ekstensi/MIME client saja. Detail quota/rate limit ada di security.md.

Upload gagal tidak mengganti mediaId konten. PUT tetap menggunakan mediaId lama sampai file baru READY dan save berhasil. Storage error mengembalikan 503; cleanup sisa file dilakukan secara terkontrol. Tidak melakukan retry POST otomatis karena dapat membuat record/file duplikat; tampilkan opsi memuat ulang daftar sebelum pengguna mencoba lagi.

## 7. Skenario kontrak wajib

Uji payload unknown/oversize, locale salah, ID salah, akses draft via slug/UUID, session invalid, mutasi cross-origin, dua PUT version sama, publish translation kosong, file belum READY, delete media direferensikan, serta respons setelah unpublish. Uji metadata SEO tidak membocorkan draft dan error tidak membawa stack trace/object key.

