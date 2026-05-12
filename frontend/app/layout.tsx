import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { cookies } from "next/headers"
import { I18nProvider } from "@/lib/i18n-context"
import { AuthProvider } from "@/lib/auth-context"
import { Cursor } from "@/components/cursor"
import { AgeGate } from "@/components/age-gate"
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const lang = cookieStore.get("mogzauri-locale")?.value === "ka" ? "ka" : "en"

  return (
    <html lang={lang} className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <I18nProvider>
          <AuthProvider>
            {children}
            <AgeGate />
          </AuthProvider>
        </I18nProvider>
        <Cursor />
      </body>
    </html>
  )
}
