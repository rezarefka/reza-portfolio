import { Column, Heading, Text, Button, Row, Icon, Meta } from "@once-ui-system/core";
import { baseURL, person, social } from "@/resources";

export async function generateMetadata() {
  return {
    ...Meta.generate({
      title: `Contact – ${person.name}`,
      description: `Hubungi ${person.name}`,
      baseURL,
      path: "/contact",
    }),
    robots: { index: false, follow: false },
  };
}

export default function Contact() {
  return (
    <Column maxWidth="s" horizontal="center" gap="xl" paddingY="40">
      <Column gap="m" align="center">
        <Heading variant="display-strong-l" align="center">
          Mari Terhubung
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" align="center">
          Saya terbuka untuk kolaborasi, pertanyaan, dan obrolan santai seputar teknologi.
        </Text>
      </Column>

      <Column gap="m" fillWidth>
        <Button
          href={`mailto:${person.email}`}
          variant="primary"
          size="l"
          fillWidth
          prefixIcon="email"
        >
          Kirim Email
        </Button>

        {social
          .filter((s) => s.essential && s.link && s.name !== "Email")
          .map((s) => (
            <Button
              key={s.name}
              href={s.link}
              variant="secondary"
              size="l"
              fillWidth
              prefixIcon={s.icon}
            >
              {s.name}
            </Button>
          ))}
      </Column>

      <Column gap="8" align="center">
        <Row gap="8" vertical="center">
          <Icon name="globe" onBackground="neutral-weak" />
          <Text variant="body-default-s" onBackground="neutral-weak">
            {person.location} (UTC+8)
          </Text>
        </Row>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Biasanya membalas dalam 24 jam.
        </Text>
      </Column>
    </Column>
  );
}
