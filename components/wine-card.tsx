"use client"

import Image from "next/image"
import { useI18n } from "@/lib/i18n-context"

interface WineCardProps {
  name: string
  year: string
  description: string
  price: string
}

export function WineCard({ name, year, description, price }: WineCardProps) {
  const { t } = useI18n()

  return (
    <div className="group flex flex-col overflow-hidden border border-border bg-background transition-shadow duration-300 hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <Image
          src="/placeholder.svg"
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold text-foreground">{name}</h3>
          <span className="text-xs tracking-wider text-muted-foreground">{year}</span>
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-serif text-lg font-semibold text-foreground">{"$"}{price}</span>
          <button className="border border-foreground px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background">
            {t("wines.learnMore") as string}
          </button>
        </div>
      </div>
    </div>
  )
}
