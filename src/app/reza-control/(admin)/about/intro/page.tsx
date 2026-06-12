import { Column, Row, Heading, Button } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { IntroClient } from "@/components/admin/about/IntroClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tentang Saya – Reza Control" };

const IntroIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

export default async function IntroPage() {
  let data = null;
  try {
    const supabase = await createClient();
    const r = await supabase
      .from("about_intro")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();
    data = r.data ?? null;
  } catch { data = null; }

  return (
    <Column fillWidth gap="xl">
      <Row gap="8" vertical="center">
        <Button href="/reza-control/about" variant="tertiary" size="s" prefixIcon="chevronLeft">Back</Button>
        <Row gap="12" vertical="center">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--brand-alpha-weak)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--brand-on-background-strong)", flexShrink: 0,
          }}>
            <IntroIcon />
          </div>
          <Heading variant="display-strong-m">Tentang Saya</Heading>
        </Row>
      </Row>
      <IntroClient initialData={data} />
    </Column>
  );
}
