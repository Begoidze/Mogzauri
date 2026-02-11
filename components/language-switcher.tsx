"use client"

import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n()

  return (
    <div className={cn("flex items-center gap-1 text-sm tracking-widest", className)}>
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "px-1.5 py-0.5 transition-colors duration-200",
          locale === "en" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-muted-foreground">|</span>
      <button
        onClick={() => setLocale("ka")}
        className={cn(
          "px-1.5 py-0.5 transition-colors duration-200",
          locale === "ka" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Switch to Georgian"
      >
        KA
      </button>
    </div>
  )
}
