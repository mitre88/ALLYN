'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Clock, CheckCircle } from 'lucide-react'
import { sileo as toast } from 'sileo'

interface Affiliate {
  id: string
  commission_amount: number
  status: 'pending' | 'earned' | 'paid'
  created_at: string
  paid_at: string | null
  referrer: { full_name: string | null; email: string } | null
  referred: { full_name: string | null; email: string } | null
}

export default function AdminAffiliates() {
  const [items, setItems] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('affiliates')
      .select('*, referrer:profiles!affiliates_referrer_id_fkey(full_name, email), referred:profiles!affiliates_referred_user_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data as Affiliate[] || []); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)

  const totalEarned = items.filter(i => i.status === 'earned').reduce((s, i) => s + i.commission_amount / 100, 0)
  const totalPaid = items.filter(i => i.status === 'paid').reduce((s, i) => s + i.commission_amount / 100, 0)

  async function markPaid(id: string) {
    await supabase.from('affiliates').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' as const, paid_at: new Date().toISOString() } : i))
    toast.success({ title: 'Comisión marcada como pagada' })
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Afiliados</h1>
      <p className="text-slate-400 text-sm mb-6">Sistema de comisiones por referidos</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">Total Comisiones</p>
          <p className="text-xl font-bold text-white">{items.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">Pendientes por Pagar</p>
          <p className="text-xl font-bold text-yellow-400">${totalEarned.toLocaleString()} MXN</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">Ya Pagadas</p>
          <p className="text-xl font-bold text-green-400">${totalPaid.toLocaleString()} MXN</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'earned', 'paid'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {{ all: 'Todas', earned: 'Pendientes', paid: 'Pagadas' }[f]}
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400 text-center py-12">Cargando...</div> : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Afiliado', 'Referido', 'Comisión', 'Estado', 'Fecha', 'Acción'].map(h => (
                  <th key={h} className="p-3 text-left text-xs text-slate-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-3">
                    <p className="text-sm text-white">{item.referrer?.full_name || 'N/A'}</p>
                    <p className="text-xs text-slate-400">{item.referrer?.email}</p>
                  </td>
                  <td className="p-3">
                    <p className="text-sm text-white">{item.referred?.full_name || 'N/A'}</p>
                    <p className="text-xs text-slate-400">{item.referred?.email}</p>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-sm font-bold text-green-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      {(item.commission_amount / 100).toFixed(0)} MXN
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${item.status === 'paid' ? 'text-green-400' : item.status === 'earned' ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {item.status === 'paid' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {{ earned: 'Pendiente', paid: 'Pagada', pending: 'Sin pago' }[item.status]}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleDateString('es-MX')}
                  </td>
                  <td className="p-3">
                    {item.status === 'earned' && (
                      <button onClick={() => markPaid(item.id)}
                        className="text-xs px-2.5 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded font-medium transition-colors"
                      >
                        Marcar pagada
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-12 text-slate-500">No hay comisiones {filter !== 'all' ? 'en este estado' : ''}</p>}
        </div>
      )}
    </div>
  )
}
