"use client"

import Image from "next/image"
import { Clock, MapPin } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"

export default function VisitPage() {
  const { t } = useI18n()
  const hours = t("visit.hours") as { monFri: string; sat: string; sun: string }

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title={t("visit.pageTitle") as string}
          subtitle={t("visit.pageSubtitle") as string}
          backgroundImage="/placeholder.svg"
        />

        {/* Description */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="flex-1">
              <h2 className="font-serif text-3xl font-semibold text-foreground text-balance">
                {t("visit.descriptionTitle") as string}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                {t("visit.descriptionText") as string}
              </p>
            </div>
            <div className="relative aspect-[4/5] w-full flex-1 overflow-hidden">
              <Image
                src="/placeholder.svg"
                alt="Wine glass at sunset"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {/* Tasting Experience */}
        <section className="bg-secondary">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="flex flex-col-reverse items-center gap-12 md:flex-row">
              <div className="relative aspect-[4/5] w-full flex-1 overflow-hidden">
                <Image
                  src="/placeholder.svg"
                  alt="Tasting experience"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-3xl font-semibold text-foreground text-balance">
                  {t("visit.tastingTitle") as string}
                </h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {t("visit.tastingText") as string}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hours & Location */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Opening Hours */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-accent" />
                <h3 className="font-serif text-2xl font-semibold text-foreground">
                  {t("visit.hoursTitle") as string}
                </h3>
              </div>
              <div className="flex flex-col gap-3 border-l-2 border-accent pl-6">
                <p className="text-base text-muted-foreground">{hours.monFri}</p>
                <p className="text-base text-muted-foreground">{hours.sat}</p>
                <p className="text-base text-muted-foreground">{hours.sun}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-accent" />
                <h3 className="font-serif text-2xl font-semibold text-foreground">
                  {t("visit.addressTitle") as string}
                </h3>
              </div>
              <div className="flex flex-col gap-2 border-l-2 border-accent pl-6">
                <p className="text-base text-muted-foreground">{t("visit.address") as string}</p>
                <p className="text-base text-muted-foreground">{t("visit.addressLine2") as string}</p>
              </div>

              {/* Map placeholder */}
              <div className="mt-4 flex aspect-video items-center justify-center border border-border bg-muted">
                <span className="text-sm uppercase tracking-wider text-muted-foreground">
                  Map
                </span>
              </div>
            </div>
          </div>

          {/* Reservation button */}
          <div className="mt-16 text-center">
            <button className="border border-foreground bg-foreground px-10 py-4 text-xs uppercase tracking-[0.2em] text-background transition-colors duration-200 hover:bg-transparent hover:text-foreground">
              {t("visit.reservation") as string}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
