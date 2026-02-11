"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { LanguageSwitcher } from "./language-switcher"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/wines", key: "nav.wines" },
  { href: "/shop", key: "nav.shop" },
  { href: "/visit", key: "nav.visit" },
  { href: "/contact", key: "nav.contact" },
]

export function Navbar() {
  const { t } = useI18n()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isHome = pathname === "/"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navBg = scrolled || !isHome
    ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
    : "bg-transparent"

  const textColor = scrolled || !isHome ? "text-foreground" : "text-white"

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", navBg)}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/mogzauri-logo.jpeg"
            alt="Mogzauri Wine Cellar"
            width={44}
            height={44}
            className="object-contain transition-all duration-300"
          />
          <span
            className={cn(
              "hidden font-serif text-lg font-semibold tracking-wider sm:block transition-colors duration-300",
              textColor
            )}
          >
            MOGZAURI
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-xs uppercase tracking-[0.2em] transition-colors duration-200",
                textColor,
                pathname === link.href
                  ? "font-semibold"
                  : "opacity-75 hover:opacity-100"
              )}
            >
              {t(link.key) as string}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher className={textColor} />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn("lg:hidden transition-colors", textColor)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-background/98 backdrop-blur-md lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "py-3 text-sm uppercase tracking-[0.15em] text-foreground transition-colors hover:text-accent",
                  pathname === link.href && "font-semibold"
                )}
              >
                {t(link.key) as string}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
