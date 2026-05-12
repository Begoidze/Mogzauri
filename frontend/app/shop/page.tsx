"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { API_URL } from "@/lib/auth-context"

interface Product {
  id: string
  name: string
  nameKa: string
  description: string
  descriptionKa: string
  price: number
  image: string | null
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GEL",
  }).format(cents / 100)
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden border border-border bg-background">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-3 p-6">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-9 w-28 rounded-none" />
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const { locale, t } = useI18n()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`, {
          credentials: "include",
        })
        if (!response.ok) return
        const payload = (await response.json()) as { products: Product[] }
        setProducts(payload.products)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProducts()
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title={t("shop.pageTitle") as string}
          subtitle={t("shop.pageSubtitle") as string}
        />

        <section className="mx-auto max-w-7xl px-6 py-24">
          {isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {t("shop.comingSoon") as string}
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  name={locale === "ka" ? product.nameKa : product.name}
                  description={locale === "ka" ? product.descriptionKa : product.description}
                  price={formatPrice(product.price)}
                  image={product.image ?? undefined}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
