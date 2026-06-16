import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";

const person: Person = {
  firstName: "Reza",
  lastName: "Refka",
  name: "Reza Refka Kurniawan",
  role: "Full Stack Developer & Data Engineer",
  // Langsung pakai URL Supabase agar tidak 404
  avatar: "https://baxvcjsensttnkupambu.supabase.co/storage/v1/object/public/avatars/1780364547823-7vnrjoqh2vu.png",
  email: "rezarefka@gmail.com",
  location: "Asia/Makassar",
  languages: ["Indonesia", "English"],
};

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}&apos;s Newsletter</>,
  description: <>Insight mingguan seputar teknologi, data, dan pengembangan perangkat lunak.</>,
};

const social: Social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/rezarefka",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/rezarefka",
    essential: true,
  },
  {
    name: "Instagram",
    icon: "instagram",
    link: "https://www.instagram.com/rezarefka",
    essential: false,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:rezarefka@gmail.com`,
    essential: true,
  },
];

const home: Home = {
  path: "/",
  image: `/api/og/generate?title=${encodeURIComponent("Reza Refka Kurniawan – Full Stack Developer & Data Engineer")}`,
  label: "Home",
  title: `Reza Refka Kurniawan – Full Stack Developer & Data Engineer`,
  description: `Portfolio Reza Refka Kurniawan – Full Stack Developer & Data Engineer dari Makassar, Indonesia. Spesialis Next.js, Supabase, React, TypeScript, dan Data Engineering.`,
  headline: <>Membangun solusi digital yang bermakna</>,
  featured: {
    display: false,
    title: <>Featured Work</>,
    href: "/work",
  },
  subline: (
    <>
      Saya Reza, seorang developer yang bersemangat membangun aplikasi web, mobile, dan visualisasi
      data. Berbasis di Makassar, Indonesia.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `Tentang Reza Refka Kurniawan – Full Stack Developer dari Makassar`,
  description: `Kenali Reza Refka Kurniawan, Full Stack Developer & Data Engineer dari Makassar. Berpengalaman di Next.js, React, Supabase, Python, dan Machine Learning.`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Perkenalan",
    description: (
      <>
        Reza Refka Kurniawan adalah seorang Full Stack Developer dan Data Engineer yang berbasis di
        Makassar, Indonesia. Dengan ketertarikan mendalam pada teknologi web modern dan rekayasa
        data, Reza berfokus pada membangun solusi digital yang tidak hanya fungsional, tetapi juga
        berdampak nyata — dari antarmuka pengguna yang intuitif hingga pipeline data yang efisien
        dan skalabel.
      </>
    ),
  },
  work: {
    display: true,
    title: "Pengalaman Kerja",
    experiences: [
      {
        company: "Freelance & Project Independent",
        timeframe: "2022 – Sekarang",
        role: "Full Stack Developer",
        achievements: [
          <>
            Merancang dan membangun aplikasi web berbasis Next.js dan Supabase untuk klien dari
            berbagai sektor, mulai dari e-commerce hingga platform pendidikan.
          </>,
          <>
            Mengembangkan dashboard visualisasi data interaktif menggunakan Recharts dan D3.js yang
            membantu klien dalam pengambilan keputusan berbasis data.
          </>,
          <>
            Mengelola seluruh siklus proyek secara mandiri — dari analisis kebutuhan, perancangan
            UI/UX, implementasi, hingga deployment di Vercel dan cloud server.
          </>,
        ],
        images: [],
      },
      {
        company: "Komunitas Developer Makassar",
        timeframe: "2023 – Sekarang",
        role: "Kontributor & Mentor Teknis",
        achievements: [
          <>
            Aktif berbagi pengetahuan tentang web development modern, clean code, dan best practice
            dalam komunitas developer lokal di Makassar.
          </>,
          <>
            Membimbing junior developer dalam menguasai React, TypeScript, dan konsep arsitektur
            aplikasi yang skalabel.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true,
    title: "Pendidikan",
    institutions: [
      {
        name: "Universitas Hasanuddin",
        description: <>
          Jurusan Teknik Informatika · Fakultas Teknik · Makassar, Sulawesi Selatan
          <br />
          Fokus studi pada rekayasa perangkat lunak, basis data, dan kecerdasan buatan.
          Aktif dalam berbagai kegiatan akademik dan pengembangan diri di bidang teknologi.
        </>,
      },
    ],
  },
  technical: {
    display: true,
    title: "Keahlian Teknis",
    skills: [
      {
        title: "Frontend Development",
        description: (
          <>
            Berpengalaman dalam membangun antarmuka modern menggunakan{" "}
            <strong>React</strong>, <strong>Next.js 15</strong>, dan <strong>TypeScript</strong>.
            Terbiasa dengan sistem desain berbasis komponen, animasi UI, dan optimasi performa
            rendering.
          </>
        ),
        images: [],
      },
      {
        title: "Backend & Database",
        description: (
          <>
            Mahir menggunakan <strong>Supabase</strong> (PostgreSQL, Auth, Storage, RLS) dan{" "}
            <strong>Node.js</strong> untuk membangun API dan backend yang aman dan skalabel.
            Berpengalaman dalam desain skema database dan query optimasi.
          </>
        ),
        images: [],
      },
      {
        title: "Data Engineering & Visualisasi",
        description: (
          <>
            Terbiasa mengolah dan memvisualisasikan data menggunakan <strong>Python</strong>{" "}
            (Pandas, NumPy), <strong>Recharts</strong>, dan <strong>D3.js</strong>. Mampu
            membangun pipeline data sederhana hingga menengah dan menyajikannya dalam dashboard
            interaktif yang informatif.
          </>
        ),
        images: [],
      },
      {
        title: "Tools & Workflow",
        description: (
          <>
            Menggunakan <strong>Git</strong> &amp; GitHub untuk version control, <strong>VS Code</strong>{" "}
            sebagai editor utama, dan <strong>Vercel</strong> untuk deployment. Familiar dengan{" "}
            <strong>Figma</strong> untuk kolaborasi desain, serta metodologi Agile dalam manajemen
            proyek.
          </>
        ),
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Blog – Reza Refka Kurniawan | Teknologi & Web Development",
  description: `Artikel, tutorial, dan insight dari Reza Refka Kurniawan seputar web development, Next.js, Supabase, data engineering, dan teknologi terkini.`,
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Proyek & Portofolio – Reza Refka Kurniawan`,
  description: `Kumpulan proyek dan karya Reza Refka Kurniawan: aplikasi web, sistem data, tools developer, dan solusi digital menggunakan Next.js, React, dan Supabase.`,
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Galeri – Reza Refka Kurniawan`,
  description: `Koleksi momen, dokumentasi, dan karya visual oleh Reza Refka Kurniawan dari Makassar, Indonesia.`,
  images: [
    { src: "/images/gallery/horizontal-1.jpg", alt: "image", orientation: "horizontal" },
    { src: "/images/gallery/vertical-1.jpg", alt: "image", orientation: "vertical" },
    { src: "/images/gallery/horizontal-2.jpg", alt: "image", orientation: "horizontal" },
    { src: "/images/gallery/vertical-2.jpg", alt: "image", orientation: "vertical" },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
