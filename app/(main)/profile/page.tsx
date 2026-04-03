'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Crown,
  Copy,
  Check,
  LogOut,
  DollarSign,
  Users,
  Link as LinkIcon,
  Loader2,
  BadgeCheck,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { sileo as toast } from 'sileo'
import { createClient } from '@/lib/supabase/client'
import { useSubscription } from '@/lib/hooks/use-subscription'
import { useRouter } from 'next/navigation'

interface AffiliateRecord {
  id: string
  referred_email: string
  commission_amount: number
  status: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { profile, isLoading, isSubscribed } = useSubscription()
  const [copied, setCopied] = useState(false)
  const [affiliates, setAffiliates] = useState<AffiliateRecord[]>([])
  const [affiliatesLoading, setAffiliatesLoading] = useState(false)
  const [authUser, setAuthUser] = useState<{ email?: string; user_metadata?: { avatar_url?: string } } | null>(null)
  const supabase = createClient()

  const APP_URL = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://allyn.com')
  const referralLink = profile?.referral_code
    ? `${APP_URL}/?ref=${profile.referral_code}`
    : null

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      setAuthUser(data.user as typeof authUser)
    })
  }, [])

  useEffect(() => {
    if (!profile?.id) return
    const fetchAffiliates = async () => {
      setAffiliatesLoading(true)
      const { data } = await supabase
        .from('affiliates')
        .select('*')
        .eq('referrer_id', profile.id)
        .order('created_at', { ascending: false })
      setAffiliates(data || [])
      setAffiliatesLoading(false)
    }
    fetchAffiliates()
  }, [profile?.id])

  const handleCopyLink = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success({ title: '¡Enlace copiado al portapapeles!' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error({ title: 'No se pudo copiar el enlace' })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totalEarned = affiliates
    .filter((a) => a.status === 'earned' || a.status === 'paid')
    .reduce((sum, a) => sum + a.commission_amount, 0)

  const totalReferrals = affiliates.length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 dark:text-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-background to-pink-500/5 dark:from-purple-900/20 dark:to-pink-900/10 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-24 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10"
        >
          <Avatar className="w-20 h-20 border-2 border-purple-500/30">
            <AvatarImage src={authUser?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl font-bold">
              {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">
                {profile?.full_name || profile?.username || 'Usuario'}
              </h1>
              {isSubscribed && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                  <Crown className="w-3 h-3" />
                  Suscriptor Activo
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{profile?.email}</p>
          </div>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-foreground/60 hover:text-foreground hover:bg-[var(--glass-bg-strong)] gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </motion.div>

        <div className="grid gap-6">
          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-[var(--glass-bg)] border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Estado de Suscripción
            </h2>

            {isSubscribed ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Membresía Anual Activa</p>
                  <p className="text-muted-foreground text-sm">Disfruta de todo el contenido de ALLYN mientras tu suscripción esté activa.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[var(--glass-bg)] border border-border/50">
                <div>
                  <p className="font-semibold text-foreground">Sin suscripción activa</p>
                  <p className="text-muted-foreground text-sm">$499 MXN el primer año, luego $99/año.</p>
                </div>
                <Button
                  onClick={() => router.push('/subscribe')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm"
                >
                  Suscribirse
                </Button>
              </div>
            )}
          </motion.div>

          {/* Affiliate / Referral Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-[var(--glass-bg)] border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Programa de Afiliados
            </h2>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-border/50 text-center">
                <div className="text-3xl font-bold text-foreground mb-1">{totalReferrals}</div>
                <div className="text-muted-foreground text-xs">Personas referidas</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-border/50 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  ${(totalEarned / 100).toFixed(0)}
                </div>
                <div className="text-muted-foreground text-xs">MXN ganados</div>
              </div>
            </div>

            {/* Commission info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-6">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-green-700 dark:text-green-300 text-sm">
                Gana <span className="font-bold">$299 MXN</span> por cada persona que se suscriba con tu enlace.
              </p>
            </div>

            {/* Referral Link */}
            {referralLink ? (
              <div>
                <p className="text-foreground/60 text-sm mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Tu enlace de afiliado
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 rounded-xl bg-muted/50 border border-border/50 text-foreground/70 text-sm font-mono truncate">
                    {referralLink}
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    className={`flex-shrink-0 gap-2 transition-all ${
                      copied
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Tu código de referido se generará al completar tu perfil.
              </p>
            )}
          </motion.div>

          {/* Referrals Table */}
          {totalReferrals > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-[var(--glass-bg)] border border-border/50 p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                Historial de Referidos
              </h2>

              {affiliatesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500 dark:text-purple-400" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left text-muted-foreground font-medium py-3 pr-4">Email</th>
                        <th className="text-left text-muted-foreground font-medium py-3 pr-4">Comisión</th>
                        <th className="text-left text-muted-foreground font-medium py-3 pr-4">Estado</th>
                        <th className="text-left text-muted-foreground font-medium py-3">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliates.map((affiliate) => (
                        <tr key={affiliate.id} className="border-b border-border/30 hover:bg-[var(--glass-bg)] transition-colors">
                          <td className="py-3 pr-4 text-foreground/70 font-mono text-xs">
                            {affiliate.referred_email}
                          </td>
                          <td className="py-3 pr-4 text-green-600 dark:text-green-400 font-semibold">
                            ${(affiliate.commission_amount / 100).toFixed(0)} MXN
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                affiliate.status === 'earned' || affiliate.status === 'paid'
                                  ? 'bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30'
                                  : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30'
                              }`}
                            >
                              {affiliate.status === 'earned'
                                ? 'Ganada'
                                : affiliate.status === 'paid'
                                ? 'Pagada'
                                : 'Pendiente'}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground text-xs">
                            {new Date(affiliate.created_at).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-[var(--glass-bg)] border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Información de Cuenta
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Nombre', value: profile?.full_name || '—' },
                { label: 'Email', value: profile?.email || '—' },
                { label: 'Usuario', value: profile?.username || '—' },
                { label: 'Rol', value: profile?.role || 'user' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-muted-foreground text-xs mb-1">{item.label}</p>
                  <p className="text-foreground text-sm font-medium truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
