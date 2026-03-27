"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, Crown, LogOut, UserCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useSubscription } from "@/lib/hooks/use-subscription"

const categories = [
  { name: "Inicio", href: "/" },
  { name: "Salud", href: "/category/salud" },
  { name: "Dinero", href: "/category/dinero" },
  { name: "Amor", href: "/category/amor" },
]

export function Header() {
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

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background/96 backdrop-blur-md border-b border-border/50"
            : "bg-gradient-to-b from-background/90 to-transparent"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Wordmark */}
          <Link href="/" className="flex items-center">
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              ALLYN
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors duration-200"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors rounded-md hover:bg-muted">
              <Search className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {!isSubscribed && (
                  <Link href="/subscribe" className="hidden sm:block">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-8 px-3 gap-1.5"
                    >
                      <Crown className="w-3 h-3" />
                      Acceso Completo
                    </Button>
                  </Link>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 p-0.5"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    {isSubscribed && (
                      <Crown className="w-3 h-3 text-primary hidden sm:block" />
                    )}
                    <ChevronDown
                      className={`w-3 h-3 text-foreground/40 transition-transform hidden sm:block ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-52 rounded-xl bg-card border border-border shadow-xl shadow-black/30 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium text-foreground truncate">
                            {profile?.full_name || user.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                          {isSubscribed && (
                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                              <Crown className="w-2.5 h-2.5" />
                              Miembro Vitalicio
                            </span>
                          )}
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <UserCircle className="w-4 h-4" />
                            Mi Perfil
                          </Link>
                          {!isSubscribed && (
                            <Link
                              href="/subscribe"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 transition-colors"
                            >
                              <Crown className="w-4 h-4" />
                              Obtener acceso vitalicio
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm font-medium h-8">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold h-8">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-background md:hidden"
          >
            <div className="pt-20 px-6 pb-8 flex flex-col h-full">
              <nav className="flex flex-col gap-1">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, ease: "easeOut" }}
                  >
                    <Link
                      href={category.href}
                      className="block py-3 text-xl font-medium text-foreground/80 hover:text-foreground transition-colors border-b border-border/30"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {user && !isSubscribed && (
                <div className="mt-6">
                  <Link href="/subscribe" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2">
                      <Crown className="w-4 h-4" />
                      Acceso Completo $499
                    </Button>
                  </Link>
                </div>
              )}

              {user && (
                <div className="mt-auto pt-6 border-t border-border/30 space-y-3">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-base font-medium text-foreground/70 hover:text-foreground"
                  >
                    <UserCircle className="w-5 h-5" />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 text-base font-medium text-foreground/50 hover:text-foreground transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
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
