import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop | Mogzauri Wine Cellar",
  description:
    "Purchase Mogzauri wines online. Exceptional Georgian wines delivered to your door.",
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
