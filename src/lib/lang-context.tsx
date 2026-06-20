"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Language } from "@/lib/types";

interface LangContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (id: string, en: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (_id, en) => en,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  // Default bahasa situs: English. Kalau pengunjung sudah pernah pilih bahasa
  // sebelumnya (tersimpan di localStorage), pilihan itu yang dipakai (lihat useEffect di bawah).
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language;
    if (saved === "en" || saved === "id") {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = (id: string, en: string) => (lang === "en" ? en : id);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
