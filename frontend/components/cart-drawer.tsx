"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { API_URL } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

interface CartProduct {
  id: string
  name: string
  nameKa: string
  price: number
  image: string | null
}

interface CartItem {
  id: string
  quantity: number
  product: CartProduct
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GEL",
  }).format(cents / 100)
}

function CartSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton className="h-20 w-20 shrink-0 rounded-none" />
          <div className="flex flex-1 flex-col justify-between py-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CartDrawer({ className }: { className?: string }) {
  const { locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const loadCart = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_URL}/cart`, {
          credentials: "include",
        })
        if (!response.ok) {
          setItems([])
          return
        }
        const payload = (await response.json()) as { items: CartItem[] }
        setItems(payload.items)
      } finally {
        setIsLoading(false)
      }
    }

    void loadCart()
  }, [open])

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn("transition-colors", className)}
        aria-label="Open cart"
      >
        <ShoppingBag size={20} />
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {isLoading ? (
            <CartSkeleton />
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            <div className="flex flex-col gap-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 bg-secondary" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-serif text-base text-foreground">
                        {locale === "ka" ? item.product.nameKa : item.product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-5">
          <div className="mb-5 flex items-center justify-between font-serif text-lg">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="block border border-foreground bg-foreground px-6 py-3 text-center text-xs uppercase tracking-[0.2em] text-background transition-colors hover:bg-transparent hover:text-foreground"
          >
            Checkout
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
