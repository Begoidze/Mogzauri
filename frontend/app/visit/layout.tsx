import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Visit Us | Mogzauri Wine Cellar",
  description:
    "Plan your visit to Mogzauri Wine Cellar in Arkhiloskalo, Kakheti. Book a guided tasting and experience Georgian winemaking firsthand.",
}

export default function VisitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
