"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Crown, LogOut, UserCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { cn } from "@/lib/utils"

const categories = [
  { name: "Inicio", href: "/" },
  { name: "Salud", href: "/category/salud" },
  { name: "Dinero", href: "/category/dinero" },
  { name: "Amor", href: "/category/amor" },
]

export function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { isSubscribed, profile } = useSubscription()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll)
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const avatarFallback = (user?.email as string | undefined)?.charAt(0).toUpperCase() ?? "U"
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href)

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={cn(
            "pointer-events-auto mx-auto flex h-16 max-w-7xl items-center justify-between rounded-[26px] border px-3 shadow-[0_18px_70px_rgba(0,0,0,0.14)] backdrop-blur-2xl transition-all duration-500 md:px-5",
            isScrolled
              ? "border-white/12 bg-background/82"
              : "border-white/8 bg-background/58"
          )}
        >
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-[linear-gradient(155deg,hsl(var(--primary)/0.95)_0%,rgba(23,18,14,0.92)_100%)] shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
              <span className="font-display text-lg font-bold text-white">A</span>
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold tracking-[0.01em] text-foreground md:text-xl">
                ALLYN
              </p>
              <p className="hidden text-[10px] uppercase tracking-[0.28em] text-foreground/40 sm:block">
                Salud • Dinero • Amor
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center rounded-full border border-white/10 bg-white/[0.045] p-1 backdrop-blur-xl">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive(category.href)
                    ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.18)]"
                    : "text-foreground/62 hover:bg-white/[0.07] hover:text-foreground"
                )}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] p-1.5 backdrop-blur-xl">
            {user ? (
              <div className="flex items-center gap-2">
                {!isSubscribed && (
                  <Link href="/subscribe" className="hidden sm:block">
                    <Button
                      size="sm"
                      className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-[0_10px_28px_hsl(var(--primary)/0.34)] hover:bg-primary/90"
                    >
                      <Crown className="mr-1.5 h-3.5 w-3.5" />
                      $499 primer año
                    </Button>
                  </Link>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    aria-label={dropdownOpen ? "Cerrar menú de cuenta" : "Abrir menú de cuenta"}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-black/10 py-1 pl-1 pr-2 transition-colors hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="border border-primary/25 bg-primary/20 text-xs font-bold text-primary">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left sm:block">
                      <p className="max-w-[9rem] truncate text-xs font-semibold text-foreground">
                        {profile?.full_name || user.email}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/35">
                        {isSubscribed ? "Miembro" : "Cuenta"}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "hidden h-3 w-3 text-foreground/40 transition-transform sm:block",
                        dropdownOpen && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-60 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,18,14,0.94)_0%,rgba(11,10,10,0.98)_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
                      >
                        <div className="border-b border-white/8 px-4 py-4">
                          <p className="truncate text-sm font-semibold text-white">
                            {profile?.full_name || user.email}
                          </p>
                          <p className="mt-1 truncate text-xs text-white/45">{user.email}</p>
                          <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/72">
                            <Crown className="h-3 w-3 text-primary" />
                            {isSubscribed ? "Miembro Activo" : "Modo Preview"}
                          </span>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-white/72 transition-colors hover:bg-white/[0.05] hover:text-white"
                          >
                            <UserCircle className="h-4 w-4" />
                            Mi Perfil
                          </Link>
                          {!isSubscribed && (
                            <Link
                              href="/subscribe"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-primary transition-colors hover:bg-white/[0.05] hover:text-primary/85"
                            >
                              <Crown className="h-4 w-4" />
                              Suscribirse
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white"
                          >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-9 rounded-full px-4 text-sm font-medium">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="h-9 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_hsl(var(--primary)/0.34)] hover:bg-primary/90">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            <ThemeToggle />

            <button
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-foreground/72 transition-colors hover:bg-white/[0.09] hover:text-foreground md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 top-[5.2rem] z-40 overflow-hidden rounded-[28px] border border-white/10 bg-background/92 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:hidden"
          >
            <div className="p-5">
              <div className="mb-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/36">
                  Navegación
                </p>
              </div>
              <nav className="flex flex-col gap-2">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, ease: "easeOut" }}
                  >
                    <Link
                      href={category.href}
                      className={cn(
                        "block rounded-2xl border px-4 py-3 text-lg font-medium transition-colors",
                        isActive(category.href)
                          ? "border-primary/30 bg-primary/10 text-foreground"
                          : "border-white/8 bg-white/[0.045] text-foreground/72 hover:text-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {user && !isSubscribed && (
                <div className="mt-5">
                  <Link href="/subscribe" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="h-11 w-full rounded-full bg-primary font-semibold text-primary-foreground shadow-[0_12px_28px_hsl(var(--primary)/0.34)] hover:bg-primary/90">
                      <Crown className="mr-2 h-4 w-4" />
                      Suscribirme — $499 primer año
                    </Button>
                  </Link>
                </div>
              )}

              {!user && (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="h-11 w-full rounded-full">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}

              {user && (
                <div className="mt-6 space-y-3 border-t border-white/8 pt-5">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-base font-medium text-foreground/72 hover:text-foreground"
                  >
                    <UserCircle className="h-5 w-5" />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 text-base font-medium text-foreground/46 transition-colors hover:text-foreground"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
