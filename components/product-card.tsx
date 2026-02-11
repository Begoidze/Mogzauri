"use client"

import Image from "next/image"
import { useI18n } from "@/lib/i18n-context"

interface ProductCardProps {
  name: string
  description: string
  price: string
}

export function ProductCard({ name, description, price }: ProductCardProps) {
  const { t } = useI18n()

  return (
    <div className="group flex flex-col overflow-hidden border border-border bg-background transition-shadow duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src="/placeholder.svg"
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-col gap-3 p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-serif text-xl font-bold text-foreground">{price}</span>
          <button
            disabled
            className="border border-muted-foreground px-4 py-2 text-xs uppercase tracking-[0.15em] text-muted-foreground cursor-not-allowed"
          >
            {t("shop.addToCart") as string}
          </button>
        </div>
      </div>
    </div>
  )
}
