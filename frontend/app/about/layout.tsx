import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Story | Mogzauri Wine Cellar",
  description:
    "Learn about Mogzauri Wine Cellar — a family journey from viticulture to winemaking, rooted in the village of Arkhiloskalo, Kakheti, Georgia.",
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
