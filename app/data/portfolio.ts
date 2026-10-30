import type { Locale } from '~~/shared/portfolio'

export type { Locale } from '~~/shared/portfolio'

export const skills = [
  { name: 'Nuxt.js', icon: 'i-simple-icons-nuxt', colorClass: 'text-[#00dc82]' },
  { name: 'Vue.js', icon: 'i-simple-icons-vuedotjs', colorClass: 'text-[#42b883]' },
  { name: 'TypeScript', icon: 'i-simple-icons-typescript', colorClass: 'text-[#54a8f6]' },
  { name: 'PostgreSQL', icon: 'i-simple-icons-postgresql', colorClass: 'text-[#68a5ca]' },
  { name: 'Tailwind CSS', icon: 'i-simple-icons-tailwindcss', colorClass: 'text-[#38bdf8]' },
  { name: 'Git', icon: 'i-simple-icons-git', colorClass: 'text-[#f97359]' }
]

export const messages = {
  id: {
    home: 'Beranda', about: 'Tentang', projects: 'Proyek', experience: 'Pengalaman', contact: 'Kontak',
    skip: 'Lewati ke konten', navigation: 'Navigasi utama', openMenu: 'Buka navigasi', closeMenu: 'Tutup navigasi',
    cv: 'Unduh CV', cvUnavailable: 'CV belum tersedia. Silakan hubungi melalui email.',
    eyebrow: 'WEB DEVELOPER / DIGITAL CREATOR', greeting: 'Hello, I’m', heroLine1: 'I AM A', heroLine2: 'DEVELOPER WEB',
    heroDescription: 'Saya membangun pengalaman web yang intuitif, fungsional, dan bermakna. Dari sebuah ide menjadi produk digital yang bisa Anda rasakan.',
    seeProjects: 'Lihat Proyek', talk: 'Mari Berkolaborasi', scroll: 'Scroll untuk menjelajah',
    selected: 'PROYEK PILIHAN', latest: 'PROYEK TERBARU', allProjects: 'Lihat Semua Proyek', viewProject: 'Lihat proyek',
    aboutLabel: 'TENTANG SAYA', aboutTitle: 'Mengubah ide menjadi', aboutAccent: 'solusi digital', aboutEnd: 'yang bermakna.',
    aboutDescription: 'Saya adalah Full Stack Developer dengan minat pada pengembangan web modern, desain antarmuka, dan teknologi open source. Saya menikmati proses merangkai detail kecil menjadi pengalaman digital yang utuh.',
    approach: 'Pendekatan sederhana. Hasil yang berarti.',
    values: [
      { title: 'Clean Code', text: 'Kode yang terstruktur dan mudah dipelihara.', icon: 'i-lucide-code-xml' },
      { title: 'User Focused', text: 'Pengalaman pengguna selalu menjadi pusatnya.', icon: 'i-lucide-user-round' },
      { title: 'Detail Oriented', text: 'Setiap detail kecil punya peran yang besar.', icon: 'i-lucide-scan' },
      { title: 'Continuous Learning', text: 'Terus belajar, bereksperimen, dan berkembang.', icon: 'i-lucide-lightbulb' }
    ],
    stack: 'TEKNOLOGI', stackTitle: 'Tools behind the work.',
    experienceLabel: 'PENGALAMAN', experienceTitle: 'PERJALANAN KARIR', experienceIntro: 'Setiap perjalanan membawa pelajaran. Ini bagian dari proses saya tumbuh sebagai developer.',
    contactLabel: 'KONTAK', contactTitle: 'PUNYA IDE?', contactAccent: 'MARI WUJUDKAN.',
    contactDescription: 'Terbuka untuk kesempatan kerja, kolaborasi, atau sekadar bertukar cerita tentang teknologi. Percakapan yang baik selalu jadi awal yang menarik.',
    email: 'Kirim email', linkedin: 'Terhubung di LinkedIn', footer: 'Dibuat dengan perhatian pada setiap detail.',
    sample: 'Pratinjau portfolio · Konten proyek dan pengalaman merupakan contoh.',
    projectIntro: 'Kumpulan ide yang diterjemahkan menjadi pengalaman digital. Setiap proyek memiliki cerita dan tantangannya sendiri.',
    allWork: 'SEMUA PROYEK', backProjects: 'Kembali ke proyek', overview: 'TENTANG PROYEK', role: 'PERAN SAYA', outcome: 'HASIL & PENDEKATAN',
    nextProject: 'Jelajahi proyek berikutnya', sampleProject: 'Studi kasus contoh untuk pratinjau antarmuka. Demo dan repository belum tersedia.',
    gallery: 'Pratinjau proyek', previous: 'Gambar sebelumnya', next: 'Gambar berikutnya',
    notFound: 'Halaman tidak ditemukan', notFoundText: 'Halaman yang Anda cari mungkin sudah berpindah atau belum tersedia.', backHome: 'Kembali ke beranda',
    rights: 'All rights reserved.'
  },
  en: {
    home: 'Home', about: 'About', projects: 'Projects', experience: 'Experience', contact: 'Contact',
    skip: 'Skip to content', navigation: 'Main navigation', openMenu: 'Open navigation', closeMenu: 'Close navigation',
    cv: 'Download CV', cvUnavailable: 'CV is not available yet. Please get in touch by email.',
    eyebrow: 'WEB DEVELOPER / DIGITAL CREATOR', greeting: 'Hello, I’m', heroLine1: 'I AM A', heroLine2: 'WEB DEVELOPER',
    heroDescription: 'I build intuitive, functional, and meaningful web experiences. Turning an idea into a digital product you can actually experience.',
    seeProjects: 'Explore Projects', talk: 'Let’s Collaborate', scroll: 'Scroll to explore',
    selected: 'SELECTED WORK', latest: 'LATEST PROJECTS', allProjects: 'View All Projects', viewProject: 'View project',
    aboutLabel: 'ABOUT ME', aboutTitle: 'Turning ideas into', aboutAccent: 'digital solutions', aboutEnd: 'that matter.',
    aboutDescription: 'I’m a Full Stack Developer interested in modern web development, interface design, and open source technology. I enjoy connecting small details to create a complete digital experience.',
    approach: 'A simple approach. Meaningful results.',
    values: [
      { title: 'Clean Code', text: 'Structured code that is easy to maintain.', icon: 'i-lucide-code-xml' },
      { title: 'User Focused', text: 'The user experience is always at the center.', icon: 'i-lucide-user-round' },
      { title: 'Detail Oriented', text: 'Every small detail plays an important part.', icon: 'i-lucide-scan' },
      { title: 'Continuous Learning', text: 'Always learning, experimenting, and growing.', icon: 'i-lucide-lightbulb' }
    ],
    stack: 'TECHNOLOGY', stackTitle: 'Tools behind the work.',
    experienceLabel: 'EXPERIENCE', experienceTitle: 'THE JOURNEY SO FAR', experienceIntro: 'Every experience brings a lesson. Here’s part of my journey growing as a developer.',
    contactLabel: 'CONTACT', contactTitle: 'HAVE AN IDEA?', contactAccent: 'LET’S BUILD IT.',
    contactDescription: 'Open to opportunities, collaborations, or a conversation about technology. A good conversation is always an interesting place to start.',
    email: 'Send an email', linkedin: 'Connect on LinkedIn', footer: 'Crafted with attention to every detail.',
    sample: 'Portfolio preview · Projects and experience are sample content.',
    projectIntro: 'Ideas translated into digital experiences. Every project has a story and a challenge of its own.',
    allWork: 'ALL PROJECTS', backProjects: 'Back to projects', overview: 'PROJECT OVERVIEW', role: 'MY ROLE', outcome: 'OUTCOME & APPROACH',
    nextProject: 'Explore the next project', sampleProject: 'Sample case study for the interface preview. Demo and repository are not available yet.',
    gallery: 'Project preview', previous: 'Previous image', next: 'Next image',
    notFound: 'Page not found', notFoundText: 'The page you’re looking for may have moved or isn’t available yet.', backHome: 'Back to home',
    rights: 'All rights reserved.'
  }
} satisfies Record<Locale, unknown>
