import {
  Column,
  Row,
  Line,
  Meta,
  Schema,
  RevealFx,
  Heading,
} from "@once-ui-system/core";
import { home, about, person, baseURL, routes } from "@/resources";
import { Projects } from "@/components/work/Projects";
import { Posts } from "@/components/blog/Posts";
import { HeroSection } from "@/components/cms/HeroSection";
import { StatisticsSection } from "@/components/cms/StatisticsSection";
import { ContactSection } from "@/components/cms/ContactSection";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getSettings } from "@/lib/db";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function Home() {
  const settings = await getSettings();

  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
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

      {/* ── Hero — always first, no scroll reveal (already has RevealFx) ── */}
      <HeroSection settings={settings} />

      {/* ── Work Preview — slide up ───────────────────────────────────── */}
      <ScrollReveal delay={0} type="up" threshold={0.08}>
        <Projects range={[1, 1]} />
      </ScrollReveal>

      {/* ── Blog Preview — stagger children ──────────────────────────── */}
      {routes["/blog"] && (
        <ScrollReveal delay={0} type="fade" threshold={0.08}>
          <Column fillWidth gap="24" marginBottom="l">
            <ScrollReveal type="left" delay={0}>
              <Row fillWidth paddingRight="64">
                <Line maxWidth={48} />
              </Row>
            </ScrollReveal>

            <Row fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
              <ScrollReveal type="left" delay={80} style={{ flex: 1 }}>
                <Row flex={1} paddingLeft="l" paddingTop="24">
                  <Heading as="h2" variant="display-strong-xs" wrap="balance">
                    Tulisan Terbaru
                  </Heading>
                </Row>
              </ScrollReveal>
              <ScrollReveal type="right" delay={160} style={{ flex: 3 }}>
                <Row flex={3} paddingX="20">
                  <Posts range={[1, 2]} columns="2" />
                </Row>
              </ScrollReveal>
            </Row>

            <ScrollReveal type="right" delay={0}>
              <Row fillWidth paddingLeft="64" horizontal="end">
                <Line maxWidth={48} />
              </Row>
            </ScrollReveal>
          </Column>
        </ScrollReveal>
      )}

      {/* ── More Projects ─────────────────────────────────────────────── */}
      <ScrollReveal delay={0} type="up" threshold={0.08}>
        <Projects range={[2]} />
      </ScrollReveal>

      {/* ── Statistics ───────────────────────────────────────────────── */}
      <ScrollReveal delay={0} type="scale" threshold={0.06}>
        <StatisticsSection settings={settings} />
      </ScrollReveal>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <ScrollReveal delay={0} type="up" threshold={0.05}>
        <ContactSection />
      </ScrollReveal>
    </Column>
  );
}
