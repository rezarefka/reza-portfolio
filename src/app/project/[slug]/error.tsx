"use client";

import { useEffect } from "react";
import { Column, Heading, Text, Button } from "@once-ui-system/core";
import { T } from "@/components/T";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Project page error:", error);
  }, [error]);

  return (
    <Column as="section" fill center gap="m" paddingBottom="160">
      <Text marginBottom="s" variant="display-strong-xl">
        500
      </Text>
      <Heading marginBottom="l" variant="display-default-xs">
        <T id="Gagal Memuat Proyek" en="Failed to Load Project" />
      </Heading>
      <Text onBackground="neutral-weak" align="center" style={{ maxWidth: 420 }}>
        <T
          id="Terjadi gangguan saat mengambil data proyek ini. Biasanya ini bersifat sementara — coba lagi dalam beberapa saat."
          en="Something went wrong fetching this project's data. This is usually temporary — please try again in a moment."
        />
      </Text>
      <Column gap="s" horizontal="center" style={{ flexDirection: "row", marginTop: 8 }}>
        <Button onClick={() => reset()} variant="primary" size="m" prefixIcon="refresh">
          <T id="Coba Lagi" en="Try Again" />
        </Button>
        <Button href="/work" variant="secondary" size="m">
          <T id="Kembali ke Projects" en="Back to Projects" />
        </Button>
      </Column>
    </Column>
  );
}
