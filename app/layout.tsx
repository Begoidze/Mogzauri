import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { I18nProvider } from "@/lib/i18n-context"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Mogzauri Wine Cellar | ESTD 2023",
  description:
    "Mogzauri Wine Cellar - Crafting exceptional wines in the heart of Georgia. Discover our collection of traditional qvevri wines.",
}

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
