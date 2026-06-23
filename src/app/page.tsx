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
import { T } from "@/components/T";

export async function generateMetadata() {
  const base = Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
  });
  return {
    ...base,
    openGraph: {
      ...(base.openGraph ?? {}),
      siteName: "Reza Refka Kurniawan",
      images: [
        {
          url: "https://rezarefka.web.id/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Reza Refka Kurniawan – Creative Technologist & Developer",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: ["https://rezarefka.web.id/og-image.jpg"],
    },
  };
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
    description:
      "Creative Technologist & Developer dari Makassar, Indonesia. Membangun pengalaman digital yang menggabungkan teknologi, desain, dan kreativitas.",
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
      "Graphic Design",
      "Videography",
      "Machine Learning",
      "Data Science",
      "Creative Technology",
    ],
    sameAs: [
      "https://github.com/rezarefka",
      "https://www.linkedin.com/in/rezarefka",
      "https://www.instagram.com/rezarefka",
      "https://www.threads.com/@rezarefka",
    ],
  };

  return (
    <>
      {/*
       * P2: Section gap 96px desktop → 58px mobile (60% rule).
       * Injected as global style to override Once UI's "xl" token which is ambiguous.
       */}
      <style dangerouslySetInnerHTML={{ __html: `
        .home-col { gap: 96px !important; }
        @media (max-width: 640px) { .home-col { gap: 58px !important; } }

        /* P2: Tulisan Terbaru block — 64px breathing room around Lines */
        .tulisan-block { padding-top: 64px; padding-bottom: 64px; }
      `}} />

      <Column
        maxWidth="m"
        className="home-col"
        paddingY="12"
        horizontal="center"
      >
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

        {/* ── 1. Hero ── */}
        <ScrollAnimate direction="up" duration={800} threshold={0.01}>
          <HeroSection settings={settings} />
        </ScrollAnimate>

        {/* ── 2. Card Karya ── */}
        <Projects />

        {/* ── 3. Tulisan Terbaru ── */}
        {routes["/blog"] && (
          <Column fillWidth gap="24" className="tulisan-block">

            {/* P2: Line + 64px padding from above */}
            <ScrollAnimate direction="left" duration={600} delay={0}>
              <Row fillWidth paddingRight="64">
                <Line maxWidth={48} />
              </Row>
            </ScrollAnimate>

            <Row fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
              <ScrollAnimate direction="left" delay={80} duration={650} style={{ flex: 1 }}>
                <Row flex={1} paddingLeft="l" paddingTop="24">
                  <Heading as="h2" variant="display-strong-xs" wrap="balance">
                    <T id="Tulisan Terbaru" en="Latest Writing" />
                  </Heading>
                </Row>
              </ScrollAnimate>

              <ScrollAnimate direction="right" delay={180} duration={650} style={{ flex: 3 }}>
                <Row flex={3} paddingX="20">
                  <Posts range={[1, 2]} columns="2" />
                </Row>
              </ScrollAnimate>
            </Row>

            {/* P2: Line + 64px padding below */}
            <ScrollAnimate direction="right" duration={600} delay={0}>
              <Row fillWidth paddingLeft="64" horizontal="end">
                <Line maxWidth={48} />
              </Row>
            </ScrollAnimate>

          </Column>
        )}

        {/* ── 4. Statistik ── */}
        {/* P2: 96px gap from home-col class handles spacing above */}
        <ScrollAnimate direction="up" delay={0} duration={750} threshold={0.08}>
          <StatisticsSection
            settings={settings}
            projectsCount={projectsCount}
            blogsCount={blogsCount}
          />
        </ScrollAnimate>

        {/* ── 5. Kontak ── */}
        {/* P2: 96px gap from home-col class handles spacing — intentional whitespace */}
        <ScrollAnimate direction="up" delay={60} duration={800} threshold={0.06}>
          <ContactSection settings={settings} />
        </ScrollAnimate>

      </Column>
    </>
  );
}
