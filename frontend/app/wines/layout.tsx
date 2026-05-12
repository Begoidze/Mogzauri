import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Wines | Mogzauri Wine Cellar",
  description:
    "Explore the Mogzauri wine collection — traditional Georgian qvevri wines crafted from Rkatsiteli, Kisi, Pink Rkatsiteli, and Saperavi grapes.",
}

export default function WinesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
