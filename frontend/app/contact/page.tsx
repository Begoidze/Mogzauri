"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, MapPin, Phone } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"

function buildSchema(t: (key: string) => unknown) {
  return z.object({
    name: z.string().min(2, t("contact.validation.nameMin") as string),
    email: z.string().email(t("contact.validation.emailInvalid") as string),
    message: z.string().min(10, t("contact.validation.messageMin") as string),
  })
}

type ContactFormData = {
  name: string
  email: string
  message: string
}

export default function ContactPage() {
  const { t } = useI18n()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(buildSchema(t)),
  })

  const onSubmit = async (_data: ContactFormData) => {
    // TODO: POST to /api/contact once the API is ready
    reset()
  }

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
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {t("contact.nameLabel") as string}
                </label>
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  placeholder={t("contact.namePlaceholder") as string}
                  className="border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none transition-colors aria-invalid:border-red-500"
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {t("contact.emailLabel") as string}
                </label>
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  placeholder={t("contact.emailPlaceholder") as string}
                  className="border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none transition-colors aria-invalid:border-red-500"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="message"
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {t("contact.messageLabel") as string}
                </label>
                <textarea
                  {...register("message")}
                  id="message"
                  rows={6}
                  placeholder={t("contact.messagePlaceholder") as string}
                  className="resize-none border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none transition-colors aria-invalid:border-red-500"
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <p className="text-xs text-red-500">{errors.message.message}</p>
                )}
              </div>

              {isSubmitSuccessful && (
                <p className="text-xs uppercase tracking-[0.15em] text-green-600">
                  {t("contact.successMessage") as string}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 border border-foreground bg-foreground px-8 py-3 text-xs uppercase tracking-[0.2em] text-background transition-colors duration-200 hover:bg-transparent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
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
