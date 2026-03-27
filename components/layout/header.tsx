"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, Bell, User, Crown, LogOut, UserCircle, ChevronDown } from "lucide-react"
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
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdown on outside click
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ALLYN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-white/80 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>

            <button className="p-2 text-white/80 hover:text-white transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Subscribe CTA — only show if not subscribed */}
                {!isSubscribed && (
                  <Link href="/subscribe">
                    <Button
                      size="sm"
                      className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      Suscribirse $499
                    </Button>
                  </Link>
                )}

                {/* Avatar + Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs font-bold">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>

                    {isSubscribed && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs text-yellow-400 font-medium">
                        <Crown className="w-3 h-3" />
                      </span>
                    )}

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-white/60 transition-transform hidden sm:block ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-background/95 backdrop-blur-md border border-white/10 shadow-xl shadow-black/40 overflow-hidden"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white text-sm font-medium truncate">
                            {profile?.full_name || user.email}
                          </p>
                          <p className="text-white/40 text-xs truncate">{user.email}</p>
                          {isSubscribed && (
                            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-xs">
                              <Crown className="w-2.5 h-2.5" />
                              Miembro Vitalicio
                            </span>
                          )}
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <UserCircle className="w-4 h-4" />
                            Mi Perfil
                          </Link>

                          {!isSubscribed && (
                            <Link
                              href="/subscribe"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 transition-colors"
                            >
                              <Crown className="w-4 h-4" />
                              Obtener acceso vitalicio
                            </Link>
                          )}

                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
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
              <Link href="/login">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background md:hidden"
          >
            <div className="pt-20 px-6">
              <nav className="flex flex-col gap-4">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={category.href}
                      className="text-xl font-medium text-white hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  </motion.div>
                ))}

                {user && !isSubscribed && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: categories.length * 0.1 }}
                  >
                    <Link
                      href="/subscribe"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-xl font-medium text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      <Crown className="w-5 h-5" />
                      Suscribirse $499
                    </Link>
                  </motion.div>
                )}

                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (categories.length + 1) * 0.1 }}
                    className="pt-4 border-t border-white/10 space-y-3"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-lg font-medium text-white/80 hover:text-white"
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-lg font-medium text-white/60 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
