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

const optionalText = z.string().trim().optional()

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(5, "Phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: optionalText,
})

type RegisterForm = z.infer<typeof registerSchema>

const fields: Array<{ name: keyof RegisterForm; label: string; type?: string }> = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "password", label: "Password", type: "password" },
  { name: "address", label: "Address" },
]

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setFormError(null)
    try {
      await registerUser(data)
      router.push("/")
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Registration failed")
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-36">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Account</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <label
              key={field.name}
              className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground"
            >
              {field.label}
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
            {isSubmitting ? (
              <Skeleton className="h-11 w-full rounded-none" />
            ) : (
              <button
                type="submit"
                className="w-full border border-foreground bg-foreground px-8 py-3 text-xs uppercase tracking-[0.2em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Register
              </button>
            )}
          </div>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
