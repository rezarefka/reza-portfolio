"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: "Weak Password", color: "#ef4444" };
  if (score <= 3) return { score: 2, label: "Medium Password", color: "#f59e0b" };
  return { score: 3, label: "Strong Password", color: "#22c55e" };
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/reza-control");
    router.refresh();
  };

  return (
    <div className="rc-login-wrap">
      <style>{`
        .rc-login-wrap {
          position: relative;
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
          padding: 40px 28px 32px;
          border-radius: 32px;
          overflow: hidden;
          isolation: isolate;

          /* ── Liquid glass base: translucent, heavily blurred/saturated ── */
          background: linear-gradient(165deg,
            rgba(255,255,255,0.10) 0%,
            rgba(255,255,255,0.04) 40%,
            rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(36px) saturate(180%) brightness(1.08);
          -webkit-backdrop-filter: blur(36px) saturate(180%) brightness(1.08);
          border: 1px solid rgba(255,255,255,0.22);

          box-shadow:
            0 30px 80px rgba(0,0,0,0.55),
            0 8px 24px rgba(0,0,0,0.35),
            inset 0 1.5px 0 rgba(255,255,255,0.35),
            inset 0 -1px 0 rgba(255,255,255,0.05),
            inset 1px 0 0 rgba(255,255,255,0.08),
            inset -1px 0 0 rgba(124,92,255,0.10);

          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
        }
        /* Specular streak — fixed diagonal highlight, like light refracting through glass */
        .rc-login-wrap::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg,
            rgba(255,255,255,0.16) 0%,
            rgba(255,255,255,0.03) 22%,
            transparent 42%,
            transparent 68%,
            rgba(124,92,255,0.08) 100%);
          pointer-events: none;
          z-index: 0;
        }
        /* Shimmer sweep — slow, subtle, liquid-glass "alive" feel */
        .rc-login-wrap::after {
          content: "";
          position: absolute;
          top: -40%;
          left: -60%;
          width: 45%;
          height: 180%;
          background: linear-gradient(100deg,
            transparent 0%,
            rgba(255,255,255,0.10) 45%,
            rgba(255,255,255,0.16) 50%,
            rgba(255,255,255,0.10) 55%,
            transparent 100%);
          transform: rotate(8deg);
          animation: rcShimmer 7s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes rcShimmer {
          0%, 30% { left: -60%; }
          70%, 100% { left: 130%; }
        }
        .rc-login-wrap > * { position: relative; z-index: 1; }
        .rc-login-logo {
          width: 68px;
          height: 68px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          overflow: hidden;
          background: linear-gradient(165deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03));
          backdrop-filter: blur(12px) saturate(160%);
          -webkit-backdrop-filter: blur(12px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow:
            0 8px 24px rgba(124,92,255,0.35),
            inset 0 1px 0 rgba(255,255,255,0.4);
        }
        .rc-login-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .rc-login-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: rgba(255,255,255,0.96);
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .rc-login-subtitle {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.45);
          margin: 0 0 28px;
          text-align: center;
        }
        .rc-field {
          width: 100%;
          margin-bottom: 14px;
        }
        .rc-field-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          margin-bottom: 6px;
          letter-spacing: 0.01em;
        }
        .rc-input-shell {
          position: relative;
          width: 100%;
          border-radius: 16px;
          background: rgba(255,255,255,0.055);
          backdrop-filter: blur(10px) saturate(140%);
          -webkit-backdrop-filter: blur(10px) saturate(140%);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }
        .rc-input-shell:focus-within {
          border-color: rgba(124,92,255,0.6);
          background: rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.16), 0 0 0 4px rgba(124,92,255,0.12);
        }
        .rc-input {
          width: 100%;
          box-sizing: border-box;
          background: transparent;
          border: none;
          outline: none;
          padding: 13px 16px;
          font-size: 0.94rem;
          font-weight: 500;
          color: #fff;
          font-family: inherit;
        }
        .rc-input::placeholder { color: rgba(255,255,255,0.28); }
        .rc-input-shell.has-toggle .rc-input { padding-right: 44px; }
        .rc-eye-btn {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          padding: 0;
          transition: color 0.15s ease;
        }
        .rc-eye-btn:hover { color: rgba(255,255,255,0.75); }
        .rc-strength-track {
          width: 100%;
          height: 3px;
          border-radius: 99px;
          background: rgba(255,255,255,0.08);
          margin-top: 10px;
          overflow: hidden;
        }
        .rc-strength-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.25s ease, background 0.25s ease;
        }
        .rc-strength-label {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.45);
          margin-top: 8px;
          margin-bottom: 4px;
        }
        .rc-error {
          width: 100%;
          font-size: 0.8rem;
          color: #f87171;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 9px 12px;
          margin-top: 4px;
          margin-bottom: 4px;
        }
        .rc-submit-btn {
          position: relative;
          overflow: hidden;
          width: 100%;
          margin-top: 18px;
          padding: 14px 20px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.3);
          cursor: pointer;
          font-size: 0.98rem;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(90deg, rgba(124,92,255,0.85) 0%, rgba(79,139,255,0.85) 100%);
          backdrop-filter: blur(8px) saturate(160%);
          -webkit-backdrop-filter: blur(8px) saturate(160%);
          box-shadow:
            0 12px 28px rgba(90,100,255,0.35),
            inset 0 1px 0 rgba(255,255,255,0.45);
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .rc-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 16px 34px rgba(90,100,255,0.45),
            inset 0 1px 0 rgba(255,255,255,0.55);
        }
        .rc-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .rc-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .rc-spinner {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          animation: rcSpin 0.7s linear infinite;
        }
        @keyframes rcSpin { to { transform: rotate(360deg); } }
        .rc-footnote {
          margin-top: 22px;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.4);
          text-align: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .rc-spinner { animation-duration: 1.4s; }
          .rc-submit-btn { transition: none; }
          .rc-login-wrap::after { animation: none; opacity: 0; }
        }
      `}</style>

      <div className="rc-login-logo">
        <img src="/api/favicon" alt="Reza Refka Kurniawan" />
      </div>

      <h1 className="rc-login-title">Reza Control</h1>
      <p className="rc-login-subtitle">Masuk untuk mengelola konten portfolio</p>

      <div className="rc-field">
        <label className="rc-field-label" htmlFor="rc-email">Email</label>
        <div className="rc-input-shell">
          <input
            id="rc-email"
            type="email"
            className="rc-input"
            placeholder="email@example.com"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
          />
        </div>
      </div>

      <div className="rc-field" style={{ marginBottom: 4 }}>
        <label className="rc-field-label" htmlFor="rc-password">Password</label>
        <div className="rc-input-shell has-toggle">
          <input
            id="rc-password"
            type={showPassword ? "text" : "password"}
            className="rc-input"
            placeholder="••••••••"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
          />
          <button
            type="button"
            className="rc-eye-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.6 18.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {password && (
          <>
            <div className="rc-strength-track">
              <div
                className="rc-strength-fill"
                style={{ width: `${(strength.score / 3) * 100}%`, background: strength.color }}
              />
            </div>
            <div className="rc-strength-label" style={{ color: strength.color }}>
              {strength.label}
            </div>
          </>
        )}
      </div>

      {error && <div className="rc-error">{error}</div>}

      <button
        type="button"
        className="rc-submit-btn"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading && <span className="rc-spinner" />}
        {loading ? "Memproses..." : "Masuk"}
      </button>

      <p className="rc-footnote">Area khusus admin</p>
    </div>
  );
}
