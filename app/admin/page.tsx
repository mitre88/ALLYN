import { createClient } from '@/lib/supabase/server'
import { Users, BookOpen, Video, DollarSign, TrendingUp, Star } from 'lucide-react'

async function getStats() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: subscribedUsers },
    { count: totalContent },
    { data: recentSubs },
    { data: pendingCommissions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_subscribed', true),
    supabase.from('content').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('subscriptions').select('*, profiles(full_name, email)').eq('status', 'completed').order('created_at', { ascending: false }).limit(5),
    supabase.from('affiliates').select('commission_amount').eq('status', 'earned'),
  ])

  const totalRevenue = ((subscribedUsers || 0) * 499)
  const pendingPayout = (pendingCommissions || []).reduce((sum: number, a: { commission_amount: number }) => sum + a.commission_amount / 100, 0)

  return { totalUsers: totalUsers || 0, subscribedUsers: subscribedUsers || 0, totalContent: totalContent || 0, totalRevenue, recentSubs: recentSubs || [], pendingPayout }
}

export default async function AdminDashboard() {
  const { totalUsers, subscribedUsers, totalContent, totalRevenue, recentSubs, pendingPayout } = await getStats()

  const stats = [
    { label: 'Usuarios Totales', value: totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Suscriptores', value: subscribedUsers, icon: Star, color: 'text-yellow-400' },
    { label: 'Contenido Publicado', value: totalContent, icon: BookOpen, color: 'text-purple-400' },
    { label: 'Ingresos Estimados', value: `$${totalRevenue.toLocaleString()} MXN`, icon: DollarSign, color: 'text-green-400' },
    { label: 'Comisiones Pendientes', value: `$${pendingPayout.toLocaleString()} MXN`, icon: TrendingUp, color: 'text-pink-400' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-slate-400 mb-8">Resumen de la plataforma ALLYN</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Subscriptions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Suscripciones Recientes
        </h2>
        {recentSubs.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No hay suscripciones aún</p>
        ) : (
          <div className="space-y-3">
            {recentSubs.map((sub: { id: string; profiles: { full_name?: string; email?: string } | null; amount: number; created_at: string }) => (
              <div key={sub.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-sm text-white">{sub.profiles?.full_name || 'Usuario'}</p>
                  <p className="text-xs text-slate-400">{sub.profiles?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">${(sub.amount / 100).toFixed(0)} MXN</p>
                  <p className="text-xs text-slate-400">{new Date(sub.created_at).toLocaleDateString('es-MX')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
