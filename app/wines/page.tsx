"use client"

import { useI18n } from "@/lib/i18n-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { WineCard } from "@/components/wine-card"

export default function WinesPage() {
  const { t } = useI18n()
  const wines = t("wines.collection") as Array<{
    name: string
    year: string
    description: string
    price: string
  }>

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title={t("wines.pageTitle") as string}
          subtitle={t("wines.pageSubtitle") as string}
        />

        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(wines) &&
              wines.map((wine, i) => (
                <WineCard
                  key={i}
                  name={wine.name}
                  year={wine.year}
                  description={wine.description}
                  price={wine.price}
                />
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
