"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { WineCard } from "@/components/wine-card"
import { Skeleton } from "@/components/ui/skeleton"

function WineCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden border border-border bg-background">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-baseline justify-between gap-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-28 rounded-none" />
        </div>
      </div>
    </div>
  )
}

export default function WinesPage() {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(true)
  const wines = t("wines.collection") as Array<{
    name: string
    year: string
    description: string
    price: string
  }>

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

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
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <WineCardSkeleton key={index} />)
              : Array.isArray(wines) &&
              wines.map((wine) => (
                <WineCard
                  key={wine.name}
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
