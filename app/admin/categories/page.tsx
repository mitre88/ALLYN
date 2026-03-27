'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string; name: string; slug: string
  description: string | null; color: string; sort_order: number
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order')
      .then(({ data }) => setCategories(data || []))
  }, [])

  async function save(cat: Category) {
    setSaving(cat.id)
    const { error } = await supabase.from('categories').update({
      name: cat.name, description: cat.description, color: cat.color, sort_order: cat.sort_order
    }).eq('id', cat.id)
    setSaving(null)
    if (error) toast.error('Error guardando'); else toast.success(`${cat.name} guardado`)
  }

  function update(id: string, field: keyof Category, value: string | number) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Categorías</h1>
      <p className="text-slate-400 text-sm mb-8">Edita las categorías principales de la plataforma</p>

      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
              <h3 className="text-white font-semibold">{cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1)}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nombre</label>
                <input type="text" value={cat.name} onChange={e => update(cat.id, 'name', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={cat.color} onChange={e => update(cat.id, 'color', e.target.value)}
                    className="h-9 w-12 rounded cursor-pointer bg-slate-800 border border-slate-700" />
                  <input type="text" value={cat.color} onChange={e => update(cat.id, 'color', e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Descripción</label>
                <input type="text" value={cat.description || ''} onChange={e => update(cat.id, 'description', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Orden</label>
                <input type="number" value={cat.sort_order} onChange={e => update(cat.id, 'sort_order', parseInt(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
              </div>
            </div>
            <button onClick={() => save(cat)} disabled={saving === cat.id}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
              {saving === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
