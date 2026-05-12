import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact | Mogzauri Wine Cellar",
  description:
    "Get in touch with Mogzauri Wine Cellar. Find our address, phone, email, or send us a message directly.",
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
