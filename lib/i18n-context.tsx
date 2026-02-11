"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import en from "@/locales/en.json"
import ka from "@/locales/ka.json"

type Locale = "en" | "ka"

const translations = { en, ka } as const

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string | Record<string, unknown>[] | Record<string, unknown>
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && !Array.isArray(acc)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en"
    const saved = localStorage.getItem("mogzauri-locale")
    return saved === "en" || saved === "ka" ? saved : "en"
  })

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== "undefined") {
      localStorage.setItem("mogzauri-locale", newLocale)
    }
  }, [])

  const t = useCallback(
    (key: string): string | Record<string, unknown>[] | Record<string, unknown> => {
      const value = getNestedValue(translations[locale] as unknown as Record<string, unknown>, key)
      if (value === undefined) return key
      if (typeof value === "string") return value
      return value as Record<string, unknown>[] | Record<string, unknown>
    },
    [locale]
  )

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
