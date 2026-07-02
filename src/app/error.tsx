"use client";

import { useEffect } from "react";
import { Column, Heading, Text, Button } from "@once-ui-system/core";
import { T } from "@/components/T";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <Column as="section" fill center gap="m" paddingBottom="160">
      <Text marginBottom="s" variant="display-strong-xl">
        500
      </Text>
      <Heading marginBottom="l" variant="display-default-xs">
        <T id="Ada yang Salah" en="Something Went Wrong" />
      </Heading>
      <Text onBackground="neutral-weak" align="center" style={{ maxWidth: 420 }}>
        <T
          id="Terjadi kesalahan tak terduga di server. Coba muat ulang halaman ini."
          en="An unexpected server error occurred. Please try reloading this page."
        />
      </Text>
      <Column gap="s" horizontal="center" style={{ flexDirection: "row", marginTop: 8 }}>
        <Button onClick={() => reset()} variant="primary" size="m" prefixIcon="refresh">
          <T id="Coba Lagi" en="Try Again" />
        </Button>
        <Button href="/" variant="secondary" size="m">
          <T id="Kembali ke Beranda" en="Back to Home" />
        </Button>
      </Column>
    </Column>
  );
}
