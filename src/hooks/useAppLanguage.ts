"use client";

import { useEffect, useState } from "react";
import { LANGUAGE_STORAGE_KEY, type AppLanguage } from "@/lib/appLanguages";

export function useAppLanguage() {
  const [language, setLanguage] = useState<AppLanguage>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (savedLanguage === "en" || savedLanguage === "hi" || savedLanguage === "bn") {
      setLanguage(savedLanguage);
    }

    const handleLanguageChange = () => {
      const newLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (newLanguage === "en" || newLanguage === "hi" || newLanguage === "bn") {
        setLanguage(newLanguage);
      }
    };

    window.addEventListener("app-language-change", handleLanguageChange);
    window.addEventListener("storage", handleLanguageChange);

    return () => {
      window.removeEventListener("app-language-change", handleLanguageChange);
      window.removeEventListener("storage", handleLanguageChange);
    };
  }, []);

  return language;
}