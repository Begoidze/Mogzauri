"use client"

import { useI18n } from "@/lib/i18n-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"

export default function ShopPage() {
  const { t } = useI18n()
  const products = t("shop.products") as Array<{
    name: string
    description: string
    price: string
  }>

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title={t("shop.pageTitle") as string}
          subtitle={t("shop.pageSubtitle") as string}
        />

        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(products) &&
              products.map((product, i) => (
                <ProductCard
                  key={i}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                />
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
