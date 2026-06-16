export const dynamic = "force-dynamic";

import {
  Column,
  Row,
  Line,
  Meta,
  Schema,
  Heading,
} from "@once-ui-system/core";
import { home, about, person, baseURL, routes } from "@/resources";
import { Projects } from "@/components/work/Projects";
import { Posts } from "@/components/blog/Posts";
import { HeroSection } from "@/components/cms/HeroSection";
import { StatisticsSection } from "@/components/cms/StatisticsSection";
import { ContactSection } from "@/components/cms/ContactSection";
import { ScrollAnimate } from "@/components/ScrollAnimate";
import { getSettings, getPublishedProjectsCount, getPublishedBlogsCount } from "@/lib/db";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: `/api/og/generate?title=${encodeURIComponent(home.title)}`,
  });
}

export default async function Home() {
  const [settings, projectsCount, blogsCount] = await Promise.all([
    getSettings().catch(() => null),
    getPublishedProjectsCount().catch(() => 0),
    getPublishedBlogsCount().catch(() => 0),
  ]);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseURL}/#person`,
    name: person.name,
    givenName: "Reza",
    familyName: "Refka Kurniawan",
    jobTitle: person.role,
    description: "Full Stack Developer & Data Engineer dari Makassar, Indonesia. Spesialis Next.js, React, TypeScript, Supabase, dan Data Engineering.",
    url: baseURL,
    image: {
      "@type": "ImageObject",
      url: person.avatar,
      width: 400,
      height: 400,
    },
    email: person.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Makassar",
      addressRegion: "Sulawesi Selatan",
      addressCountry: "ID",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Universitas Teknologi AKBA Makassar",
    },
    knowsAbout: [
      "Web Development",
      "Next.js",
      "React",
      "TypeScript",
      "Supabase",
      "Data Engineering",
      "Machine Learning",
      "Graphic Design",
      "Videography",
    ],
    sameAs: [
      "https://github.com/rezarefka",
      "https://www.linkedin.com/in/rezarefka",
      "https://www.instagram.com/rezarefka",
      "https://www.threads.com/@rezarefka",
    ],
  };

  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {/* ── 1. Hero — fade dari bawah ──────────────────────────────── */}
      <ScrollAnimate direction="up" duration={800} threshold={0.01}>
        <HeroSection settings={settings} />
      </ScrollAnimate>

      {/* ── 2. Card Karya — tiap card muncul saat di-scroll (via ProjectsWithAnimation) */}
      <Projects />

      {/* ── 3. Tulisan Terbaru ──────────────────────────────────────── */}
      {routes["/blog"] && (
        <Column fillWidth gap="24" marginBottom="l">

          {/* Garis kiri — masuk dari kiri */}
          <ScrollAnimate direction="left" duration={600} delay={0}>
            <Row fillWidth paddingRight="64">
              <Line maxWidth={48} />
            </Row>
          </ScrollAnimate>

          <Row fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
            {/* Judul — masuk dari kiri */}
            <ScrollAnimate direction="left" delay={80} duration={650} style={{ flex: 1 }}>
              <Row flex={1} paddingLeft="l" paddingTop="24">
                <Heading as="h2" variant="display-strong-xs" wrap="balance">
                  Tulisan Terbaru
                </Heading>
              </Row>
            </ScrollAnimate>

            {/* Post cards — masuk dari kanan */}
            <ScrollAnimate direction="right" delay={180} duration={650} style={{ flex: 3 }}>
              <Row flex={3} paddingX="20">
                <Posts range={[1, 2]} columns="2" />
              </Row>
            </ScrollAnimate>
          </Row>

          {/* Garis kanan — masuk dari kanan */}
          <ScrollAnimate direction="right" duration={600} delay={0}>
            <Row fillWidth paddingLeft="64" horizontal="end">
              <Line maxWidth={48} />
            </Row>
          </ScrollAnimate>

        </Column>
      )}

      {/* ── 4. Statistik — masuk dari bawah ────────────────────────── */}
      <ScrollAnimate direction="up" delay={0} duration={750} threshold={0.08}>
        <StatisticsSection settings={settings} projectsCount={projectsCount} blogsCount={blogsCount} />
      </ScrollAnimate>

      {/* ── 5. Kontak — masuk dari bawah dengan sedikit delay ──────── */}
      <ScrollAnimate direction="up" delay={60} duration={800} threshold={0.06}>
        <ContactSection settings={settings} />
      </ScrollAnimate>

    </Column>
  );
}
