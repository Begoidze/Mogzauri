"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { API_URL, useAuth } from "@/lib/auth-context"

const shippingSchema = z.object({
  shippingName: z.string().trim().min(2, "Name is required"),
  shippingPhone: z.string().trim().min(5, "Phone is required"),
  shippingAddress: z.string().trim().min(3, "Address is required"),
})

type ShippingForm = z.infer<typeof shippingSchema>

const fields: Array<{ name: keyof ShippingForm; label: string }> = [
  { name: "shippingName", label: "Full Name" },
  { name: "shippingPhone", label: "Phone" },
  { name: "shippingAddress", label: "Address" },
]

function CheckoutSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full rounded-none" />
        </div>
      ))}
      <Skeleton className="h-11 w-full rounded-none sm:col-span-2" />
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [isLoading, router, user])

  useEffect(() => {
    if (!user) return

    reset({
      shippingName: user.name,
      shippingPhone: user.phone,
      shippingAddress: user.address ?? "",
    })
  }, [reset, user])

  const onSubmit = async (data: ShippingForm) => {
    setFormError(null)
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? "Unable to create order")
      }

      await response.json()
      router.push("/shop")
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create order")
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-36">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Checkout</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground">Shipping Address</h1>
        </div>

        {isLoading ? (
          <CheckoutSkeleton />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <label
                key={field.name}
                className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground"
              >
                {field.label}
                <input
                  {...register(field.name)}
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
                  Proceed to Payment
                </button>
              )}
            </div>
          </form>
        )}
      </main>
      <Footer />
    </>
  )
}
