"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { Turnstile } from "@/components/turnstile"

const optionalText = z.string().trim().optional()

function buildRegisterSchema(t: (key: string) => unknown) {
  return z.object({
    name: z.string().trim().min(2, t("auth.validation.nameRequired") as string),
    email: z.string().trim().email(t("auth.validation.emailInvalid") as string),
    phone: z.string().trim().min(5, t("auth.validation.phoneRequired") as string),
    password: z.string().min(8, t("auth.validation.passwordMin") as string),
    address: optionalText,
  })
}

type RegisterForm = {
  name: string
  email: string
  phone: string
  password: string
  address?: string
}

const fields: Array<{ name: keyof RegisterForm; labelKey: string; type?: string }> = [
  { name: "name", labelKey: "auth.fields.name" },
  { name: "email", labelKey: "auth.fields.email", type: "email" },
  { name: "phone", labelKey: "auth.fields.phone" },
  { name: "password", labelKey: "auth.fields.password", type: "password" },
  { name: "address", labelKey: "auth.fields.address" },
]

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const { t } = useI18n()
  const [formError, setFormError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | undefined>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(buildRegisterSchema(t)),
  })

  const onSubmit = async (data: RegisterForm) => {
    setFormError(null)
    try {
      await registerUser({ ...data, captchaToken })
      router.push("/")
    } catch (error) {
      setFormError(error instanceof Error ? error.message : (t("auth.register.error") as string))
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-36">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("auth.account") as string}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground">
            {t("auth.register.title") as string}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <label
              key={field.name}
              className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground"
            >
              {t(field.labelKey) as string}
              <input
                {...register(field.name)}
                type={field.type ?? "text"}
                className="border border-border bg-transparent px-4 py-3 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-foreground"
                aria-invalid={!!errors[field.name]}
              />
              {errors[field.name] && (
                <span className="normal-case tracking-normal text-red-500">
                  {errors[field.name]?.message}
                </span>
              )}
            </label>
          ))}

          {formError && <p className="text-sm text-red-500 sm:col-span-2">{formError}</p>}

          <div className="sm:col-span-2">
            <Turnstile
              action="register"
              onVerify={setCaptchaToken}
              onExpire={() => setCaptchaToken(undefined)}
            />
          </div>

          <div className="sm:col-span-2">
            {isSubmitting ? (
              <Skeleton className="h-11 w-full rounded-none" />
            ) : (
              <button
                type="submit"
                className="w-full border border-foreground bg-foreground px-8 py-3 text-xs uppercase tracking-[0.2em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                {t("auth.register.submit") as string}
              </button>
            )}
          </div>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          {t("auth.register.loginPrompt") as string}{" "}
          <Link href="/auth/login" className="text-foreground underline underline-offset-4">
            {t("auth.register.loginLink") as string}
          </Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
