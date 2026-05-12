"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"

const ageGateStorageKey = "mogzauri-age-confirmed"

export function AgeGate() {
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(localStorage.getItem(ageGateStorageKey) !== "true")
  }, [])

  const confirmAge = () => {
    localStorage.setItem(ageGateStorageKey, "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 px-6 backdrop-blur-md">
      <section className="w-full max-w-md border border-border bg-background p-8 text-center shadow-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {t("ageGate.eyebrow") as string}
        </p>
        <h2 className="mt-4 font-serif text-3xl font-semibold text-foreground">
          {t("ageGate.title") as string}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {t("ageGate.message") as string}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={confirmAge}
            className="border border-foreground bg-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] text-background transition-colors hover:bg-transparent hover:text-foreground"
          >
            {t("ageGate.confirm") as string}
          </button>
          <Link
            href="/terms"
            className="text-xs uppercase tracking-[0.15em] text-muted-foreground underline underline-offset-4"
          >
            {t("ageGate.terms") as string}
          </Link>
        </div>
      </section>
    </div>
  )
}
