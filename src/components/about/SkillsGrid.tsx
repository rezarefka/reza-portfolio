"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AboutSkill } from "@/lib/types";
import { useLang } from "@/lib/lang-context";

interface SkillsGridProps {
  initialSkills: AboutSkill[];
}

export function SkillsGrid({ initialSkills }: SkillsGridProps) {
  const [skills, setSkills] = useState<AboutSkill[]>(initialSkills);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { lang } = useLang();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("about_skills")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setSkills(data);
      });
  }, []);

  if (skills.length === 0) return null;

  return (
    <div style={{ width: "100%" }}>
      <style>{`
        @keyframes skillFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .skills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
        }

        .skill-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px 6px 10px;
          border-radius: 99px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          cursor: default;
          transition:
            border-color 0.22s ease,
            background   0.22s ease,
            transform    0.22s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow   0.22s ease;
          animation: skillFadeIn 0.4s ease both;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .skill-pill:hover {
          border-color: color-mix(in srgb, var(--brand-background-strong) 50%, transparent);
          background: color-mix(in srgb, var(--brand-background-strong) 8%, transparent);
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 4px 18px color-mix(in srgb, var(--brand-background-strong) 16%, transparent);
        }

        .skill-pill-icon {
          width: 18px;
          height: 18px;
          object-fit: contain;
          display: block;
          border-radius: 3px;
          filter: grayscale(0.4) brightness(0.9);
          flex-shrink: 0;
          transition: filter 0.22s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
        }

        .skill-pill:hover .skill-pill-icon {
          filter: grayscale(0) brightness(1.05);
          transform: scale(1.12);
        }

        .skill-pill-fallback {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
          line-height: 1;
        }

        .skill-pill-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--neutral-on-background-medium);
          letter-spacing: 0.01em;
          transition: color 0.18s ease;
          line-height: 1;
        }

        .skill-pill:hover .skill-pill-label {
          color: var(--neutral-on-background-strong);
        }
      `}</style>

      <div className="skills-wrap">
        {skills.map((skill, i) => {
          const title = lang === "en" && skill.title_en ? skill.title_en : skill.title_id;
          return (
          <div
            key={skill.id}
            className="skill-pill"
            style={{ animationDelay: `${i * 35}ms` }}
            onMouseEnter={() => setHoveredId(skill.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {skill.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={skill.icon}
                alt={title}
                className="skill-pill-icon"
              />
            ) : (
              <span className="skill-pill-fallback">⚡</span>
            )}
            <span className="skill-pill-label">{title}</span>
          </div>
          );
        })}
      </div>
    </div>
  );
}
