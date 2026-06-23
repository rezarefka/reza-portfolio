"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { useLang } from "@/lib/lang-context";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  thumbnail?: string;
  title: string;
  titleEn?: string;
  content: string;
  description: string;
  descriptionEn?: string;
  avatars: { src: string }[];
  link: string;
  tools?: string[];
  category?: string;
  attachment?: string | null;
  slug?: string;
}

function getMediaType(url: string): "image" | "video" | "pdf" {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|ogg)$/.test(clean)) return "video";
  if (/\.pdf$/.test(clean)) return "pdf";
  return "image";
}

/* ── P6: All colors audited for 4.5:1 contrast ── */
const TOOL_COLORS: Record<string, { bg: string; color: string }> = {
  "React":      { bg: "rgba(97,218,251,0.13)",  color: "#4fc3e8" },
  "Next.js":    { bg: "rgba(120,120,130,0.12)", color: "var(--neutral-on-background-medium)" },
  "TypeScript": { bg: "rgba(49,120,198,0.14)",  color: "#60a0e0" },
  "Python":     { bg: "rgba(55,118,171,0.14)",  color: "#6baed0" },
  "Figma":      { bg: "rgba(162,89,255,0.13)",  color: "#c490ff" },
  "Supabase":   { bg: "rgba(62,207,142,0.11)",  color: "#3ecf8e" },
  "Tailwind":   { bg: "rgba(56,189,248,0.12)",  color: "#38bdf8" },
  "Flutter":    { bg: "rgba(84,197,248,0.12)",  color: "#54c5f8" },
  "Laravel":    { bg: "rgba(255,45,32,0.12)",   color: "#ff6b5e" },
  "Node.js":    { bg: "rgba(83,158,67,0.14)",   color: "#6abf58" },
};
const getToolStyle = (t: string) =>
  TOOL_COLORS[t] ?? { bg: "var(--neutral-alpha-weak)", color: "var(--neutral-on-background-medium)" };

type Ratio = "landscape" | "portrait" | "square" | "unknown";
function useImageRatio(src: string, type: "image" | "video" | "pdf"): Ratio {
  const [ratio, setRatio] = useState<Ratio>("unknown");
  useEffect(() => {
    if (type !== "image" || !src) { setRatio("landscape"); return; }
    const img = new Image();
    img.onload = () => {
      const r = img.naturalWidth / img.naturalHeight;
      setRatio(r > 1.2 ? "landscape" : r < 0.85 ? "portrait" : "square");
    };
    img.onerror = () => setRatio("landscape");
    img.src = src;
  }, [src, type]);
  return ratio;
}
const getAspect = (r: Ratio) => r === "portrait" ? "3/4" : r === "square" ? "1/1" : "16/9";

/* ── Thumbnail ── */
function ThumbnailDisplay({ src, title, priority }: { src: string; title: string; priority?: boolean }) {
  const { t } = useLang();
  const type = getMediaType(src);
  const ratio = useImageRatio(src, type);
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}`;
  const [imgSrc, setImgSrc] = useState(src);
  const [errored, setErrored] = useState(false);
  const wrapStyle: React.CSSProperties = {
    position: "relative", width: "100%",
    aspectRatio: getAspect(ratio),
    overflow: "hidden", background: "var(--neutral-background-strong)",
    borderRadius: "14px 14px 0 0",
  };

  if (type === "video") return (
    <div style={{ ...wrapStyle, aspectRatio: "16/9" }}>
      <video src={src} style={{ width:"100%",height:"100%",objectFit:"cover" }}
        muted playsInline preload="metadata"
        onMouseEnter={(e)=>(e.currentTarget as HTMLVideoElement).play()}
        onMouseLeave={(e)=>{ const v=e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime=0; }}/>
      <div style={{ position:"absolute",bottom:10,left:10,display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",color:"#fff",fontSize:11,fontWeight:600 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>VIDEO
      </div>
    </div>
  );

  if (type === "pdf") return (
    <div style={{ ...wrapStyle,aspectRatio:"16/9",background:"linear-gradient(135deg,#1e1e2e,#2d2d44)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12 }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
      <span style={{color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:500}}>{t("Dokumen PDF","PDF Document")}</span>
    </div>
  );

  if (errored) return (
    <div style={{ ...wrapStyle,aspectRatio:"16/9",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-alpha-medium)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>
  );

  return (
    <div style={wrapStyle} className="pc-thumb-wrap">
      {ratio !== "unknown" && ratio !== "landscape" && (
        <div style={{ position:"absolute",top:10,left:10,zIndex:2,padding:"3px 8px",borderRadius:99,fontSize:9,fontWeight:700,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",color:"rgba(255,255,255,0.8)",letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid rgba(255,255,255,0.1)" }}>
          {ratio === "portrait" ? "📱 Portrait" : "⬜ Square"}
        </div>
      )}
      <NextImage src={imgSrc} alt={title} fill
        sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw,640px"
        className="pc-thumb-img"
        style={{ objectFit: ratio==="portrait"?"contain":"cover", objectPosition:"center",
                 background: ratio==="portrait"?"var(--neutral-background-strong)":"transparent" }}
        priority={priority}
        onError={()=>{ if(imgSrc!==proxyUrl) setImgSrc(proxyUrl); else setErrored(true); }}/>
    </div>
  );
}

/* ── Share Menu ── */
function CardShareMenu({ title, thumbnail, href, onClose }: { title:string; thumbnail:string; href:string; onClose:()=>void }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareUrl = typeof window!=="undefined" ? `${window.location.origin}${href}` : href;

  useEffect(() => {
    const h=(e:MouseEvent)=>{ if(menuRef.current && !menuRef.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  }, [onClose]);

  const copyLink=async(e:React.MouseEvent)=>{ e.stopPropagation(); try{ await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(()=>{ setCopied(false); onClose(); },1400); }catch{ onClose(); } };
  const toWA=(e:React.MouseEvent)=>{ e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`,"_blank","noopener"); onClose(); };
  const toTW=(e:React.MouseEvent)=>{ e.stopPropagation(); window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`,"_blank","noopener"); onClose(); };
  const native=async(e:React.MouseEvent)=>{ e.stopPropagation(); if(navigator.share) try{ await navigator.share({title,url:shareUrl}); }catch{} onClose(); };
  const hasNative=typeof navigator!=="undefined"&&!!navigator.share;

  const items=[
    { label: copied?t("✓ Tersalin!","✓ Copied!"):t("Salin link","Copy link"), onClick:copyLink, icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> },
    hasNative&&{ label:"Share...", onClick:native, icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> },
    { label:"WhatsApp", onClick:toWA, icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/></svg> },
    { label:"X (Twitter)", onClick:toTW, icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  ].filter(Boolean) as {label:string;onClick:(e:React.MouseEvent)=>void;icon:React.ReactNode}[];

  return (
    <div ref={menuRef} onClick={e=>e.stopPropagation()} style={{ position:"absolute",bottom:"calc(100% + 8px)",right:0,width:220,background:"var(--neutral-background-strong)",border:"1px solid var(--neutral-alpha-medium)",borderRadius:14,boxShadow:"0 20px 60px rgba(0,0,0,0.32),0 4px 16px rgba(0,0,0,0.16),inset 0 1px 0 rgba(255,255,255,0.06)",overflow:"hidden",zIndex:200,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",animation:"pcShareIn 0.18s cubic-bezier(0.16,1,0.3,1) both" }}>
      <div style={{padding:"10px 10px 8px",borderBottom:"1px solid var(--neutral-alpha-weak)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,padding:"7px 9px",borderRadius:9,background:"var(--neutral-alpha-weak)"}}>
          <div style={{width:40,height:30,borderRadius:6,overflow:"hidden",flexShrink:0,background:"var(--neutral-alpha-medium)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {thumbnail?<img src={thumbnail} alt={title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-on-background-weak)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--neutral-on-background-strong)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.3}}>{title}</div>
            <div style={{fontSize:9,color:"var(--neutral-on-background-weak)",marginTop:2,opacity:0.6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{shareUrl.replace(/^https?:\/\//,"").slice(0,30)}…</div>
          </div>
        </div>
      </div>
      <div style={{padding:"5px 0"}}>
        {items.map((it,i)=>(
          <button key={i} onClick={it.onClick} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 14px",border:"none",background:"transparent",color:"var(--neutral-on-background-medium)",fontSize:12,fontWeight:500,cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"background 0.1s,color 0.1s,padding-left 0.12s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="var(--neutral-alpha-weak)";e.currentTarget.style.color="var(--neutral-on-background-strong)";e.currentTarget.style.paddingLeft="18px";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--neutral-on-background-medium)";e.currentTarget.style.paddingLeft="14px";}}>
            {it.icon}{it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main Card ── */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  href, priority, images=[], thumbnail:thumbnailProp,
  title, titleEn, description, descriptionEn, link, tools=[], category, attachment, slug,
}) => {
  const { t, lang } = useLang();
  const displayTitle = lang==="en"&&titleEn ? titleEn : title;
  const displayDescription = lang==="en"&&descriptionEn ? descriptionEn : description;
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const thumbnail = thumbnailProp || images[0] || "";

  /* Tilt */
  useEffect(() => {
    const el=cardRef.current; if(!el) return;
    const onMove=(e:MouseEvent)=>{
      const r=el.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width-0.5)*5;
      const y=((e.clientY-r.top)/r.height-0.5)*-5;
      el.style.transform=`translateY(-6px) rotateY(${x}deg) rotateX(${y}deg)`;
      el.style.boxShadow=`${-x*2}px ${Math.abs(y)+12}px 48px rgba(0,0,0,0.22)`;
    };
    const onLeave=()=>{ el.style.transform=""; el.style.boxShadow=""; };
    el.addEventListener("mousemove",onMove);
    el.addEventListener("mouseleave",onLeave);
    return ()=>{ el.removeEventListener("mousemove",onMove); el.removeEventListener("mouseleave",onLeave); };
  }, []);

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .pc-card, .pc-thumb-img, .pc-overlay, .pc-title::after,
          .pc-chip, .pc-btn-arrow, .pc-detail-btn, .pc-share-btn
          { transition-duration:0.01ms!important; animation-duration:0.01ms!important; }
        }
        @keyframes pcShareIn {
          from { opacity:0; transform:scale(0.92) translateY(8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }

        /* ── Card shell ── */
        .pc-card {
          position: relative;
          border-radius: 16px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          cursor: pointer;
          transition:
            transform 0.35s cubic-bezier(0.34,1.2,0.64,1),
            box-shadow 0.35s ease,
            border-color 0.25s ease;
          display: flex; flex-direction: column;
          transform-style: preserve-3d;
          will-change: transform;
          overflow: visible;
        }
        .pc-inner {
          border-radius: 16px;
          overflow: hidden;
          display: flex; flex-direction: column; flex:1;
        }
        .pc-card:hover { border-color: var(--neutral-alpha-medium); }

        /* ── Thumbnail zoom ── */
        .pc-thumb-wrap { overflow: hidden; }
        .pc-thumb-img {
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1) !important;
        }
        .pc-card:hover .pc-thumb-img { transform: scale(1.05) !important; }

        /* ── Glass overlay on hover ── */
        .pc-overlay {
          position: absolute; inset:0;
          background: linear-gradient(to top,
            rgba(0,0,0,0.6) 0%,
            rgba(0,0,0,0.2) 40%,
            transparent 70%);
          opacity:0;
          transition: opacity 0.3s ease;
          border-radius: 14px 14px 0 0;
          display: flex; align-items: flex-end; padding: 16px;
        }
        .pc-card:hover .pc-overlay { opacity:1; }

        /* ── Title underline ── */
        .pc-title {
          position: relative;
          font-size: 18px; font-weight: 700; line-height: 1.3;
          color: var(--neutral-on-background-strong);
          margin: 0; letter-spacing: -0.01em;
        }
        .pc-title::after {
          content:"";
          display:block; height:2px; width:0%; margin-top:4px;
          background: linear-gradient(90deg,
            var(--brand-solid-strong,#6366f1),
            color-mix(in srgb, var(--brand-solid-strong,#6366f1) 60%, transparent));
          transition: width 0.4s cubic-bezier(0.22,1,0.36,1);
          border-radius: 2px;
        }
        .pc-card:hover .pc-title::after { width:100%; }

        /* ── Tool chips — stagger ── */
        .pc-chip {
          display: inline-flex; align-items: center;
          padding: 4px 12px; border-radius: 99px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
          border: 1px solid transparent;
          white-space: nowrap;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          will-change: transform;
        }
        .pc-card:hover .pc-chip { transform: translateY(-3px); }

        /* ── Detail button ── */
        .pc-detail-btn {
          flex: 1; display: flex; align-items: center;
          justify-content: center; gap: 8px;
          padding: 8px 16px; min-height: 40px;
          border-radius: 8px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; font-family: inherit;
          background: var(--brand-alpha-weak);
          color: var(--brand-on-background-strong);
          border: 1px solid var(--brand-alpha-medium);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .pc-detail-btn:hover { background: var(--brand-alpha-medium); transform: translateY(-1px); }

        /* ── Arrow ── */
        .pc-btn-arrow {
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .pc-detail-btn:hover .pc-btn-arrow { transform: translateX(4px); }

        /* ── Share btn ── */
        .pc-share-btn {
          width: 40px; height: 40px; border-radius: 8px; border: none;
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-weak);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s, transform 0.15s;
          flex-shrink: 0; font-family: inherit;
        }
        .pc-share-btn:hover, .pc-share-btn.open {
          background: var(--neutral-alpha-medium);
          color: var(--neutral-on-background-strong);
          transform: translateY(-1px);
        }

        /* ── Category badge ── */
        .pc-cat-badge {
          position: absolute; top:10; right:10;
          padding: 3px 10px; border-radius: 99px;
          font-size: 10px; font-weight: 700;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.08em; text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.12);
          pointer-events: none;
        }
      `}</style>

      <div ref={cardRef} className="pc-card" onClick={()=>router.push(href)}>
        <div className="pc-inner">
          {/* Thumbnail */}
          <div style={{ position:"relative" }}>
            {thumbnail
              ? <ThumbnailDisplay src={thumbnail} title={title} priority={priority}/>
              : <div style={{width:"100%",aspectRatio:"16/9",borderRadius:"14px 14px 0 0",background:"var(--neutral-alpha-weak)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-alpha-medium)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
            }

            {/* Overlay */}
            <div className="pc-overlay">
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:99,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(12px)",color:"#fff",fontSize:13,fontWeight:600,border:"1px solid rgba(255,255,255,0.22)"}}>
                {t("Lihat Detail","View Detail")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>

            {category && <div className="pc-cat-badge" style={{position:"absolute",top:10,right:10}}>{category}</div>}
          </div>

          {/* Body — P3: 16px 24px 24px */}
          <div style={{padding:"16px 24px 24px",display:"flex",flexDirection:"column",gap:16,flex:1}}>
            <h3 className="pc-title">{displayTitle}</h3>

            {description?.trim() && (
              <p style={{fontSize:14,lineHeight:1.6,color:"var(--neutral-on-background-weak)",margin:0,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                {displayDescription}
              </p>
            )}

            {/* Chips */}
            {tools.length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {tools.slice(0,6).map((tool,idx)=>{
                  const s=getToolStyle(tool);
                  return (
                    <span key={tool} className="pc-chip"
                      style={{background:s.bg,color:s.color,transitionDelay:`${idx*40}ms`}}>
                      {tool}
                    </span>
                  );
                })}
                {tools.length>6 && <span className="pc-chip" style={{background:"var(--neutral-alpha-weak)",color:"var(--neutral-on-background-weak)"}}>+{tools.length-6}</span>}
              </div>
            )}

            {/* Actions */}
            <div style={{display:"flex",gap:8,marginTop:"auto",paddingTop:8,alignItems:"center"}}>
              <button className="pc-detail-btn" onClick={e=>{e.stopPropagation();router.push(href);}}>
                {t("Detail Karya","View Project")}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="pc-btn-arrow">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              <div style={{position:"relative"}}>
                <button className={`pc-share-btn${shareOpen?" open":""}`}
                  title={t("Bagikan karya ini","Share this project")}
                  onClick={e=>{e.stopPropagation();setShareOpen(v=>!v);}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
                {shareOpen && <CardShareMenu title={displayTitle} thumbnail={thumbnail} href={href} onClose={()=>setShareOpen(false)}/>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
