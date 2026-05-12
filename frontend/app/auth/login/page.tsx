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

function buildLoginSchema(t: (key: string) => unknown) {
  return z.object({
    email: z.string().email(t("auth.validation.emailInvalid") as string),
    password: z.string().min(1, t("auth.validation.passwordRequired") as string),
  })
}

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { t } = useI18n()
  const [formError, setFormError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | undefined>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(buildLoginSchema(t)),
  })

  const onSubmit = async (data: LoginForm) => {
    setFormError(null)
    try {
      await login(data.email, data.password, captchaToken)
      router.push("/")
    } catch (error) {
      setFormError(error instanceof Error ? error.message : (t("auth.login.error") as string))
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-6 py-36">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("auth.account") as string}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground">
            {t("auth.login.title") as string}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {t("auth.fields.email") as string}
            <input
              {...register("email")}
              type="email"
              className="border border-border bg-transparent px-4 py-3 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-foreground"
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="normal-case tracking-normal text-red-500">{errors.email.message}</span>}
          </label>

          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {t("auth.fields.password") as string}
            <input
              {...register("password")}
              type="password"
              className="border border-border bg-transparent px-4 py-3 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-foreground"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <span className="normal-case tracking-normal text-red-500">{errors.password.message}</span>
            )}
          </label>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <Turnstile
            action="login"
            onVerify={setCaptchaToken}
            onExpire={() => setCaptchaToken(undefined)}
          />

          {isSubmitting ? (
            <Skeleton className="h-11 w-full rounded-none" />
          ) : (
            <button
              type="submit"
              className="border border-foreground bg-foreground px-8 py-3 text-xs uppercase tracking-[0.2em] text-background transition-colors hover:bg-transparent hover:text-foreground"
            >
              {t("auth.login.submit") as string}
            </button>
          )}
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          {t("auth.login.registerPrompt") as string}{" "}
          <Link href="/auth/register" className="text-foreground underline underline-offset-4">
            {t("auth.login.registerLink") as string}
          </Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
