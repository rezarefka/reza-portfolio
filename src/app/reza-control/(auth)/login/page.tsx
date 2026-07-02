import { LoginForm } from "@/components/admin/LoginForm";
import { LoginBackground } from "@/components/admin/LoginBackground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login – Reza Control",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function LoginPage() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        boxSizing: "border-box",
        background: "#08080c",
        overflow: "hidden",
      }}
    >
      <LoginBackground />
      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
        <LoginForm />
      </div>
    </div>
  );
}
