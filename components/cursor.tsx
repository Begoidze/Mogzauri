"use client"

import { useEffect, useRef, useState } from 'react'

export function Cursor() {
  const [isHovering, setIsHovering] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    document.addEventListener('mousemove', handleMouseMove)

    const links = document.querySelectorAll('a, button')
    links.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    const animate = () => {
      const dx = targetRef.current.x - currentRef.current.x
      const dy = targetRef.current.y - currentRef.current.y
      currentRef.current.x += dx * 0.15 // easing factor for smooth trailing
      currentRef.current.y += dy * 0.15

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${currentRef.current.x - 16}px, ${currentRef.current.y - 16}px) rotate(${rotationRef.current}deg) scale(${isHovering ? 1.2 : 1})`
      }

      // calculate rotation based on movement direction
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        rotationRef.current = (Math.atan2(dy, dx) * 180 / Math.PI) * 0.3 // Reduce rotation intensity
        // Prevent upside down and limit tilt
        rotationRef.current = Math.max(-30, Math.min(30, rotationRef.current))
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      links.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [isHovering])

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 32,
        height: 32,
        backgroundImage: 'url(/wine_cursor.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        zIndex: 9999,
        transformOrigin: 'center',
      }}
    />
  )
}