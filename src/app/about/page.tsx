export const dynamic = "force-dynamic";

import { Meta } from "@once-ui-system/core";
import { baseURL, about, person, social } from "@/resources";
import {
  getCertificates,
  getAboutEducation,
  getAboutExperiences,
  getAboutSkills,
  getAboutOrganizations,
  getSettings,
} from "@/lib/db";
import { AboutContent } from "@/components/about/AboutContent";

export async function generateMetadata() {
  return {
    ...Meta.generate({
      title: about.title,
      description: about.description,
      baseURL,
      image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
      path: about.path,
    }),
    robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } },
  };
}

export default async function About() {
  const [certificates, educations, experiences, skills, organizations, settings] = await Promise.all([
    getCertificates().catch(() => []),
    getAboutEducation().catch(() => []),
    getAboutExperiences().catch(() => []),
    getAboutSkills().catch(() => []),
    getAboutOrganizations().catch(() => []),
    getSettings().catch(() => null),
  ]);

  return (
    <AboutContent
      about={about}
      person={person}
      social={social}
      baseURL={baseURL}
      certificates={certificates}
      educations={educations}
      experiences={experiences}
      skills={skills}
      organizations={organizations}
      settings={settings}
    />
  );
}
