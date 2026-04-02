"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

interface RouteModalProps {
  children: React.ReactNode
  title: string
}

export function RouteModal({ children, title }: RouteModalProps) {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const modalElement = modalRef.current
    const siblingElements = modalElement?.parentElement
      ? Array.from(modalElement.parentElement.children).filter((element) => element !== modalElement)
      : []
    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const siblingState = siblingElements.map((element) => {
      const htmlElement = element as HTMLElement & { inert?: boolean }
      return {
        ariaHidden: htmlElement.getAttribute("aria-hidden"),
        element: htmlElement,
        inert: htmlElement.inert ?? false,
      }
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back()
        return
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return
      }

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]):not([data-focus-guard]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      )

      if (focusableElements.length === 0) {
        event.preventDefault()
        closeButtonRef.current?.focus()
        return
      }

      const firstFocusable = focusableElements[0]
      const lastFocusable = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement | null

      if (event.shiftKey && activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      } else if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }

    document.body.style.overflow = "hidden"
    siblingState.forEach(({ element }) => {
      element.setAttribute("aria-hidden", "true")
      element.inert = true
    })
    window.addEventListener("keydown", handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      siblingState.forEach(({ ariaHidden, element, inert }) => {
        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden")
        } else {
          element.setAttribute("aria-hidden", ariaHidden)
        }
        element.inert = inert
      })
      window.removeEventListener("keydown", handleKeyDown)
      previousActiveElement?.focus()
    }
  }, [router])

  return (
    <div
      aria-labelledby="route-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-[90]"
      ref={modalRef}
      role="dialog"
      tabIndex={-1}
    >
      <button
        aria-hidden="true"
        className="absolute inset-0 bg-black/72 backdrop-blur-md"
        data-focus-guard
        onClick={() => router.back()}
        tabIndex={-1}
        type="button"
      />

      <h2 id="route-modal-title" className="sr-only">
        {title}
      </h2>

      <button
        aria-label="Cerrar lector"
        className="absolute right-4 top-4 z-[95] flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-black/40 text-white/78 transition-colors hover:bg-black/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        onClick={() => router.back()}
        ref={closeButtonRef}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative h-full overflow-y-auto">{children}</div>
    </div>
  )
}
