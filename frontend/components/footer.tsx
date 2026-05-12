"use client"

import Link from "next/link"
import Image from "next/image"
import { useI18n } from "@/lib/i18n-context"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <Image
                src="/mogzauri-logo-transparent.png"
                alt="Mogzauri"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="font-serif text-lg font-semibold tracking-wider">
                MOGZAURI
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed opacity-70">
              {t("footer.tagline") as string}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] opacity-50">
              {t("footer.quickLinks") as string}
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { href: "/about", label: t("nav.about") as string },
                { href: "/wines", label: t("nav.wines") as string },
                { href: "/shop", label: t("nav.shop") as string },
                { href: "/visit", label: t("nav.visit") as string },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] opacity-50">
              {t("footer.contactUs") as string}
            </h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <span>{t("contact.phone") as string}</span>
              <span>{t("contact.email") as string}</span>
              <span>{t("contact.address") as string}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-xs opacity-40">
            {"(c) 2023 - "}
            {new Date().getFullYear()}
            {" Mogzauri Wine Cellar. "}
            {t("footer.rights") as string}
          </p>
        </div>
      </div>
    </footer>
  )
}
