"use client";

import { Column, Heading, Text, Button } from "@once-ui-system/core";
import { useLang } from "@/lib/lang-context";

export default function ProjectDemoUnavailable() {
  const { t } = useLang();
  return (
    <Column maxWidth="s" horizontal="center" gap="l" paddingY="80" align="center">
      <Heading variant="display-strong-l" align="center">
        {t("Demo Tidak Tersedia", "Demo Not Available")}
      </Heading>
      <Text variant="body-default-l" onBackground="neutral-weak" align="center">
        {t(
          "Maaf, demo untuk proyek ini sedang tidak tersedia saat ini. Silakan hubungi saya untuk informasi lebih lanjut.",
          "Sorry, the demo for this project is currently unavailable. Please contact me for more information."
        )}
      </Text>
      <Button href="/work" variant="secondary" arrowIcon>
        {t("Kembali ke Proyek", "Back to Projects")}
      </Button>
    </Column>
  );
}
