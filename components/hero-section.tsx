"use client"

import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

export function HeroSection() {
  const { t } = useI18n()

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/placeholder.svg"
        alt="Hand holding a glass of red wine against a sunset over rolling green fields"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center text-white">
        <Image
          src="/mogzauri-logo-transparent.png"
          alt="Mogzauri Logo"
          width={120}
          height={120}
          className="object-contain"
          priority
        />

        <div className="flex flex-col items-center gap-2">
          <h1 className="font-serif text-5xl font-bold tracking-[0.15em] sm:text-6xl md:text-7xl text-balance">
            MOGZAURI
          </h1>
          <p className="text-lg tracking-[0.3em] uppercase sm:text-xl">
            {t("hero.subtitle") as string}
          </p>
          <p className="mt-1 text-sm tracking-[0.25em] opacity-60">
            {t("hero.estd") as string}
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-white/50">
          {t("hero.scroll") as string}
        </span>
        <ChevronDown className="animate-scroll-bounce text-white/50" size={20} />
      </div>
    </section>
  )
}
