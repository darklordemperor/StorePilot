"use client";

import { Globe2, Moon, Sun, SunMoon } from "lucide-react";
import {
  usePreferences,
  type ThemeMode,
} from "@/components/app-preferences-provider";

export function AppChromeControls({ className = "" }: { className?: string }) {
  const { t, language, setLanguage, theme, setTheme } = usePreferences();

  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      <ThemeButton theme={theme} setTheme={setTheme} label={t("theme")} />
      <LanguageButton
        language={language}
        setLanguage={setLanguage}
        label={t("language")}
      />
    </div>
  );
}

function ThemeButton({
  theme,
  setTheme,
  label,
}: {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  label: string;
}) {
  const nextTheme: Record<ThemeMode, ThemeMode> = {
    light: "system",
    dark: "light",
    system: "dark",
  };
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : SunMoon;

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme[theme])}
      aria-label={label}
      title={`${label}: ${theme}`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
    >
      <Icon size={17} />
    </button>
  );
}

function LanguageButton({
  language,
  setLanguage,
  label,
}: {
  language: "th" | "en";
  setLanguage: (language: "th" | "en") => void;
  label: string;
}) {
  const nextLanguage = language === "th" ? "en" : "th";

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={label}
      title={`${label}: ${language.toUpperCase()}`}
      className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
    >
      <Globe2 size={16} />
      {language.toUpperCase()}
    </button>
  );
}
