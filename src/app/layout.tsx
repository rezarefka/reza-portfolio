import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import classNames from "classnames";

import {
  Background,
  Column,
  Flex,
  Meta,
  opacity,
  RevealFx,
  SpacingToken,
} from "@once-ui-system/core";
import { Footer, Header, RouteGuard, PageTransition, Providers } from "@/components";
import { baseURL, effects, fonts, style, dataStyle, home } from "@/resources";
import { getSettings } from "@/lib/db";

export const revalidate = 300; // ISR: regenerate max every 5 min instead of on every request

export async function generateMetadata() {
  const settings = await getSettings().catch(() => null);
  const faviconTs = settings?.updated_at
    ? new Date(settings.updated_at).getTime()
    : Date.now();

  const title = settings?.meta_title_id || home.title;
  const description = settings?.meta_description_id || home.description;

  const base = Meta.generate({
    title,
    description,
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
    alternates: {
      canonical: "https://rezarefka.web.id",
    },
    icons: {
      icon: [
        // Favicon dinamis dari CMS — cache-bust agresif supaya update langsung tampil
        { url: `/api/favicon?v=${faviconTs}&t=${Math.floor(faviconTs / 60000)}`, type: "image/png", sizes: "256x256" },
        { url: `/api/favicon?v=${faviconTs}&t=${Math.floor(faviconTs / 60000)}`, type: "image/png", sizes: "32x32" },
        { url: `/api/favicon?v=${faviconTs}&t=${Math.floor(faviconTs / 60000)}`, type: "image/png", sizes: "16x16" },
        // Fallback statis .ico — browser lama / crawler
        { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      ],
      apple: [
        { url: `/api/icon?size=192&v=${faviconTs}`, sizes: "192x192", type: "image/png" },
        { url: `/api/icon?size=512&v=${faviconTs}`, sizes: "512x512", type: "image/png" },
      ],
      shortcut: `/api/favicon?v=${faviconTs}`,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang="en"
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        {/* Favicon — link tag eksplisit untuk browser yang skip metadata API */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="icon" type="image/png" sizes="256x256" href="/api/favicon" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="192x192" href="/api/icon?size=192" />
        <meta name="robots" content="max-image-preview:none" />
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  const defaultTheme = 'system';
                  
                  const config = ${JSON.stringify({
                    brand: style.brand,
                    accent: style.accent,
                    neutral: style.neutral,
                    solid: style.solid,
                    "solid-style": style.solidStyle,
                    border: style.border,
                    surface: style.surface,
                    transition: style.transition,
                    scaling: style.scaling,
                    "viz-style": dataStyle.variant,
                  })};
                  
                  Object.entries(config).forEach(([key, value]) => {
                    root.setAttribute('data-' + key, value);
                  });
                  
                  const resolveTheme = (themeValue) => {
                    if (!themeValue || themeValue === 'system') {
                      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    return themeValue;
                  };
                  
                  const savedTheme = localStorage.getItem('data-theme');
                  const resolvedTheme = resolveTheme(savedTheme);
                  root.setAttribute('data-theme', resolvedTheme);
                  
                  const styleKeys = Object.keys(config);
                  styleKeys.forEach(key => {
                    const value = localStorage.getItem('data-' + key);
                    if (value) {
                      root.setAttribute('data-' + key, value);
                    }
                  });
                } catch (e) {
                  console.error('Failed to initialize theme:', e);
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <Providers>
        <Column
          as="body"
          background="page"
          fillWidth
          style={{ minHeight: "100vh" }}
          margin="0"
          padding="0"
          horizontal="center"
        >
          <RevealFx fill position="absolute">
            <Background
              mask={{
                x: effects.mask.x,
                y: effects.mask.y,
                radius: effects.mask.radius,
                cursor: effects.mask.cursor,
              }}
              gradient={{
                display: effects.gradient.display,
                opacity: effects.gradient.opacity as opacity,
                x: effects.gradient.x,
                y: effects.gradient.y,
                width: effects.gradient.width,
                height: effects.gradient.height,
                tilt: effects.gradient.tilt,
                colorStart: effects.gradient.colorStart,
                colorEnd: effects.gradient.colorEnd,
              }}
              dots={{
                display: effects.dots.display,
                opacity: effects.dots.opacity as opacity,
                size: effects.dots.size as SpacingToken,
                color: effects.dots.color,
              }}
              grid={{
                display: effects.grid.display,
                opacity: effects.grid.opacity as opacity,
                color: effects.grid.color,
                width: effects.grid.width,
                height: effects.grid.height,
              }}
              lines={{
                display: effects.lines.display,
                opacity: effects.lines.opacity as opacity,
                size: effects.lines.size as SpacingToken,
                thickness: effects.lines.thickness,
                angle: effects.lines.angle,
                color: effects.lines.color,
              }}
            />
          </RevealFx>
          <Flex fillWidth minHeight="16" s={{ hide: true }} />
          <Header />
          <Flex zIndex={0} fillWidth padding="l" horizontal="center" flex={1}>
            <Flex horizontal="center" fillWidth minHeight="0">
              <PageTransition>
                <RouteGuard>{children}</RouteGuard>
              </PageTransition>
            </Flex>
          </Flex>
          <Footer />
        </Column>
      </Providers>
    </Flex>
  );
}
