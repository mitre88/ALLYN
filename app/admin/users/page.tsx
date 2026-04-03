'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, CheckCircle, XCircle, Shield } from 'lucide-react'
import { sileo as toast } from 'sileo'

interface User {
  id: string
  email: string
  full_name: string | null
  username: string | null
  role: 'user' | 'admin'
  is_subscribed: boolean
  subscription_date: string | null
  referral_code: string | null
  created_at: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [filtered, setFiltered] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setFiltered(data || []); setLoading(false) })
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(users.filter(u => u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q)))
  }, [search, users])

  async function toggleSubscription(id: string, current: boolean) {
    const newVal = !current
    await supabase.from('profiles').update({
      is_subscribed: newVal,
      subscription_date: newVal ? new Date().toISOString() : null
    }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_subscribed: newVal } : u))
    toast.success({ title: newVal ? 'Suscripción activada manualmente' : 'Suscripción desactivada' })
  }

  async function toggleAdmin(id: string, current: string) {
    const newRole = current === 'admin' ? 'user' : 'admin'
    const rolLabel = newRole === 'admin' ? 'Administrador' : 'Usuario'
    if (!confirm(`¿Cambiar rol a ${rolLabel}?`)) return
    await supabase.from('profiles').update({ role: newRole }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole as 'user' | 'admin' } : u))
    toast.success({ title: `Rol cambiado a ${rolLabel}` })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} usuarios registrados</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Buscar por nombre o email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm w-64 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-12">Cargando...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Usuario', 'Suscripción', 'Código Afiliado', 'Registro', 'Acciones'].map(h => (
                  <th key={h} className="p-3 text-left text-xs text-slate-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' && <Shield className="w-3 h-3 text-purple-400" />}
                      <div>
                        <p className="text-sm text-white">{user.full_name || user.username || 'Sin nombre'}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${user.is_subscribed ? 'text-green-400' : 'text-slate-500'}`}>
                      {user.is_subscribed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {user.is_subscribed ? 'Activa' : 'Sin suscripción'}
                    </span>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">{user.referral_code || '—'}</code>
                  </td>
                  <td className="p-3 text-xs text-slate-400">
                    {new Date(user.created_at).toLocaleDateString('es-MX')}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSubscription(user.id, user.is_subscribed)}
                        className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${user.is_subscribed ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                      >
                        {user.is_subscribed ? 'Quitar acceso' : 'Dar acceso'}
                      </button>
                      <button
                        onClick={() => toggleAdmin(user.id, user.role)}
                        className="text-xs px-2.5 py-1 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 font-medium transition-colors"
                      >
                        {user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-12 text-slate-500">No se encontraron usuarios</p>
          )}
        </div>
      )}
    </div>
  )
}
