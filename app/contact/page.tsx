"use client"

import { Mail, MapPin, Phone } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"

export default function ContactPage() {
  const { t } = useI18n()

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title={t("contact.pageTitle") as string}
          subtitle={t("contact.pageSubtitle") as string}
        />

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-16 md:grid-cols-2">
            {/* Contact Form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {t("contact.nameLabel") as string}
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder={t("contact.namePlaceholder") as string}
                  className="border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {t("contact.emailLabel") as string}
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder={t("contact.emailPlaceholder") as string}
                  className="border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="message"
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {t("contact.messageLabel") as string}
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder={t("contact.messagePlaceholder") as string}
                  className="resize-none border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="mt-2 border border-foreground bg-foreground px-8 py-3 text-xs uppercase tracking-[0.2em] text-background transition-colors duration-200 hover:bg-transparent hover:text-foreground"
              >
                {t("contact.send") as string}
              </button>
            </form>

            {/* Contact Info */}
            <div className="flex flex-col gap-10">
              <h2 className="font-serif text-3xl font-semibold text-foreground">
                {t("contact.info") as string}
              </h2>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <Phone size={20} className="mt-0.5 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      Phone
                    </p>
                    <p className="mt-1 text-base text-foreground">
                      {t("contact.phone") as string}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail size={20} className="mt-0.5 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      Email
                    </p>
                    <p className="mt-1 text-base text-foreground">
                      {t("contact.email") as string}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin size={20} className="mt-0.5 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      {t("contact.addressLabel") as string}
                    </p>
                    <p className="mt-1 text-base text-foreground">
                      {t("contact.address") as string}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
