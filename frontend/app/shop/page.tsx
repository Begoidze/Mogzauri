"use client"

import { useI18n } from "@/lib/i18n-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"

export default function ShopPage() {
  const { t } = useI18n()

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title={t("shop.pageTitle") as string}
          subtitle={t("shop.pageSubtitle") as string}
        />

        <section className="mx-auto max-w-7xl px-6 py-24 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {t("shop.comingSoon") as string}
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
