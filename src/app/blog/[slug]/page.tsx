import { notFound } from "next/navigation";
import { CustomMDX, ScrollToHash } from "@/components";
import {
  Meta,
  Schema,
  Column,
  Heading,
  HeadingNav,
  Row,
  Text,
  SmartLink,
  Media,
  Line,
} from "@once-ui-system/core";
import { baseURL, about, blog, person } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { getPosts } from "@/utils/utils";
import { getBlogBySlug, getPublishedBlogs } from "@/lib/db";
import { Metadata } from "next";
import { SmallAvatarFromCms } from "@/components/SmallAvatarFromCms";
import { T } from "@/components/T";
import React from "react";
import { Posts } from "@/components/blog/Posts";
import { ShareSection } from "@/components/blog/ShareSection";
import { BlogContent } from "@/components/cms/BlogContent";
import { BlogViewTracker } from "@/components/BlogViewTracker";
import { format } from "date-fns";

export async function generateStaticParams() {
  const mdxPosts = getPosts(["src", "app", "blog", "posts"]).map((post) => ({ slug: post.slug }));
  const cmsPosts = await getPublishedBlogs().catch(() => []);
  const cmsSlugs = cmsPosts.map((p) => ({ slug: p.slug }));
  return [...mdxPosts, ...cmsSlugs];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug) ? routeParams.slug.join("/") : routeParams.slug || "";

  const cmsPost = await getBlogBySlug(slugPath).catch(() => null);
  if (cmsPost) {
    return Meta.generate({
      title: cmsPost.title_id,
      description: cmsPost.description_id,
      baseURL,
      image: cmsPost.thumbnail || `/api/og/generate?title=${cmsPost.title_id}`,
      path: `${blog.path}/${cmsPost.slug}`,
    });
  }

  const posts = getPosts(["src", "app", "blog", "posts"]);
  const post = posts.find((p) => p.slug === slugPath);
  if (!post) return {};

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL,
    image: post.metadata.image || `/api/og/generate?title=${post.metadata.title}`,
    path: `${blog.path}/${post.slug}`,
  });
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string | string[] }> }) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug) ? routeParams.slug.join("/") : routeParams.slug || "";

  // ── CMS post ─────────────────────────────────────────────────────
  const cmsPost = await getBlogBySlug(slugPath).catch(() => null);

  if (cmsPost) {
    return (
      // Full-width row — no HeadingNav column (TOC is inside BlogContent)
      <Row fillWidth horizontal="center">
        <Column as="section" maxWidth="m" horizontal="center" gap="l" paddingTop="24">
          <Schema
            as="blogPosting"
            baseURL={baseURL}
            path={`${blog.path}/${cmsPost.slug}`}
            title={cmsPost.title_id}
            description={cmsPost.description_id}
            datePublished={cmsPost.created_at}
            dateModified={cmsPost.updated_at}
            image={cmsPost.thumbnail || `/api/og/generate?title=${encodeURIComponent(cmsPost.title_id)}`}
            author={{
              name: person.name,
              url: `${baseURL}${about.path}`,
              image: `${baseURL}${person.avatar}`,
            }}
          />

          <BlogViewTracker blogId={cmsPost.id} />

          {/* ── Article header ─────────────────────────────────── */}
          <Column maxWidth="s" gap="16" horizontal="center" align="center">
            <SmartLink href="/blog">
              <Text variant="label-strong-m">Blog</Text>
            </SmartLink>
            <Text variant="body-default-xs" onBackground="neutral-weak" marginBottom="12">
              {format(new Date(cmsPost.created_at), "d MMMM yyyy")}
            </Text>
            <Heading variant="display-strong-m" style={{ textAlign: "center" }}>
              <T id={cmsPost.title_id} en={cmsPost.title_en || cmsPost.title_id} />
            </Heading>
          </Column>

          <Row marginBottom="32" horizontal="center">
            <Row gap="16" vertical="center">
              <SmallAvatarFromCms size={28} />
              <Text variant="label-default-m" onBackground="brand-weak">{person.name}</Text>
            </Row>
          </Row>

          {cmsPost.thumbnail && (
            <Media
              src={cmsPost.thumbnail}
              alt={cmsPost.title_id}
              aspectRatio="16/9"
              priority
              sizes="(min-width: 768px) 100vw, 768px"
              border="neutral-alpha-weak"
              radius="l"
              marginTop="12"
              marginBottom="8"
            />
          )}

          {/* ── Content + auto TOC ─────────────────────────────── */}
          <BlogContent post={cmsPost} />

          <ShareSection title={cmsPost.title_id} url={`${baseURL}${blog.path}/${cmsPost.slug}`} />

          <Column fillWidth gap="40" horizontal="center" marginTop="40">
            <Line maxWidth="40" />
            <Text as="h2" id="recent-posts" variant="heading-strong-xl" marginBottom="24">
              <T id="Artikel Terbaru" en="Recent Articles" />
            </Text>
            <Posts exclude={[cmsPost.slug]} range={[1, 2]} columns="2" thumbnail direction="column" />
          </Column>
          <ScrollToHash />
        </Column>
      </Row>
    );
  }

  // ── MDX fallback ─────────────────────────────────────────────────
  const post = getPosts(["src", "app", "blog", "posts"]).find((p) => p.slug === slugPath);
  if (!post) notFound();

  return (
    <Row fillWidth>
      <Row maxWidth={12} m={{ hide: true }} />
      <Row fillWidth horizontal="center">
        <Column as="section" maxWidth="m" horizontal="center" gap="l" paddingTop="24">
          <Schema
            as="blogPosting"
            baseURL={baseURL}
            path={`${blog.path}/${post.slug}`}
            title={post.metadata.title}
            description={post.metadata.summary}
            datePublished={post.metadata.publishedAt}
            dateModified={post.metadata.publishedAt}
            image={post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`}
            author={{
              name: person.name,
              url: `${baseURL}${about.path}`,
              image: `${baseURL}${person.avatar}`,
            }}
          />
          <Column maxWidth="s" gap="16" horizontal="center" align="center">
            <SmartLink href="/blog">
              <Text variant="label-strong-m">Blog</Text>
            </SmartLink>
            <Text variant="body-default-xs" onBackground="neutral-weak" marginBottom="12">
              {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
            </Text>
            <Heading variant="display-strong-m" style={{ textAlign: "center" }}>
              {post.metadata.title}
            </Heading>
          </Column>
          <Row marginBottom="32" horizontal="center">
            <Row gap="16" vertical="center">
              <SmallAvatarFromCms size={28} />
              <Text variant="label-default-m" onBackground="brand-weak">{person.name}</Text>
            </Row>
          </Row>
          {post.metadata.image && (
            <Media
              src={post.metadata.image}
              alt={post.metadata.title}
              aspectRatio="16/9"
              priority
              sizes="(min-width: 768px) 100vw, 768px"
              border="neutral-alpha-weak"
              radius="l"
              marginTop="12"
              marginBottom="8"
            />
          )}
          <Column as="article" maxWidth="s">
            <CustomMDX source={post.content} />
          </Column>
          <ShareSection title={post.metadata.title} url={`${baseURL}${blog.path}/${post.slug}`} />
          <Column fillWidth gap="40" horizontal="center" marginTop="40">
            <Line maxWidth="40" />
            <Text as="h2" id="recent-posts" variant="heading-strong-xl" marginBottom="24">
              <T id="Artikel Terbaru" en="Recent Articles" />
            </Text>
            <Posts exclude={[post.slug]} range={[1, 2]} columns="2" thumbnail direction="column" />
          </Column>
          <ScrollToHash />
        </Column>
      </Row>
      <Column maxWidth={12} paddingLeft="40" fitHeight position="sticky" top="80" gap="16" m={{ hide: true }}>
        <HeadingNav fitHeight />
      </Column>
    </Row>
  );
}
