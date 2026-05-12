"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useI18n } from "@/lib/i18n-context"

interface PolicyPageProps {
  titleKey: string
  bodyKey: string
}

export function PolicyPage({ titleKey, bodyKey }: PolicyPageProps) {
  const { t } = useI18n()
  const body = t(bodyKey) as Array<{ text: string }>

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-36">
        <h1 className="font-serif text-4xl font-semibold">{t(titleKey) as string}</h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
          {Array.isArray(body) &&
            body.map((paragraph) => <p key={paragraph.text}>{paragraph.text}</p>)}
        </div>
      </main>
      <Footer />
    </>
  )
}
