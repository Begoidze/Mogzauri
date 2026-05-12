"use client"

import Image from "next/image"
import { useI18n } from "@/lib/i18n-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"

export default function AboutPage() {
  const { t } = useI18n()

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title={t("about.pageTitle") as string}
          subtitle={t("about.pageSubtitle") as string}
        />

        {/* Story Section */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="flex-1">
              <h2 className="font-serif text-3xl font-semibold text-foreground text-balance">
                {t("about.storyTitle") as string}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                {t("about.storyText") as string}
              </p>
            </div>
            <div className="relative aspect-[4/5] w-full flex-1 overflow-hidden">
              <Image
                src="/aboutus1.jpeg"
                alt="Mogzauri wine collection"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {/* Vineyard Section */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="relative aspect-[4/5] w-full flex-1 overflow-hidden">
              <Image
                src="/aboutus2.jpeg"
                alt="Wine glass at sunset"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-3xl font-semibold text-foreground text-balance">
                {t("about.vineyardTitle") as string}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                {t("about.vineyardText") as string}
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
