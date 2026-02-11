"use client"

import Image from "next/image"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  const { t } = useI18n()

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        {/* Intro Section */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl text-balance">
            {t("home.introTitle") as string}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t("home.introText") as string}
          </p>
        </section>

        {/* Cinematic Image Section */}
        <section className="relative h-[60vh] overflow-hidden">
          <Image
            src="/placeholder.svg"
            alt="Mogzauri wine collection"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/30" />
        </section>

        {/* Philosophy Section */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl text-balance">
            {t("home.philosophyTitle") as string}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t("home.philosophyText") as string}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/wines"
              className="inline-flex items-center border border-foreground bg-foreground px-8 py-3 text-xs uppercase tracking-[0.2em] text-background transition-colors duration-200 hover:bg-transparent hover:text-foreground"
            >
              {t("home.exploreWines") as string}
            </Link>
            <Link
              href="/visit"
              className="inline-flex items-center border border-foreground px-8 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
            >
              {t("home.visitUs") as string}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
