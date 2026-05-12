"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "expired-callback": () => void
          "error-callback": () => void
          action?: string
          theme?: "auto" | "light" | "dark"
        },
      ) => string
      reset: (widgetId?: string) => void
    }
  }
}

interface TurnstileProps {
  action: string
  onVerify: (token: string) => void
  onExpire: () => void
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function Turnstile({ action, onVerify, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!siteKey || !containerRef.current) return

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme: "auto",
        callback: onVerify,
        "expired-callback": onExpire,
        "error-callback": onExpire,
      })
    }

    if (!window.turnstile) {
      const script = document.createElement("script")
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true
      script.onload = renderWidget
      document.head.appendChild(script)
      return
    }

    renderWidget()
  }, [action, onExpire, onVerify])

  if (!siteKey) return null

  return <div ref={containerRef} />
}
