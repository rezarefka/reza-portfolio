import { LoginForm } from "@/components/admin/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login – Reza Control",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        boxSizing: "border-box",
        background:
          "radial-gradient(120% 90% at 50% 0%, rgba(124,92,255,0.12) 0%, rgba(124,92,255,0) 55%), linear-gradient(180deg, #08080c 0%, #0d0d14 100%)",
      }}
    >
      <LoginForm />
    </div>
  );
}
