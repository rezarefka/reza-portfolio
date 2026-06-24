import { Column, Heading, Text } from "@once-ui-system/core";
import { LoginForm } from "@/components/admin/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login – Reza Control",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function LoginPage() {
  return (
    <Column
      fillWidth
      horizontal="center"
      vertical="center"
      style={{ minHeight: "100vh" }}
      gap="xl"
      paddingY="80"
    >
      <Column maxWidth="xs" gap="l" fillWidth paddingX="l">
        <Column gap="8">
          <Heading variant="display-strong-m">Reza Control</Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Masuk untuk mengelola konten portfolio.
          </Text>
        </Column>
        <LoginForm />
      </Column>
    </Column>
  );
}
