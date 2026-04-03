'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { sileo as toast } from 'sileo'

interface Category {
  id: string; name: string; slug: string
  description: string | null; color: string; sort_order: number
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '', color: '#8b5cf6' })
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
    if (error) toast.error({ title: 'Error guardando' }); else toast.success({ title: `${cat.name} guardado` })
  }

  async function createCategory() {
    if (!newCat.name.trim() || !newCat.slug.trim()) {
      toast.error({ title: 'Nombre y slug son requeridos' })
      return
    }
    setCreating(true)
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0)
    const { data, error } = await supabase.from('categories').insert({
      name: newCat.name, slug: newCat.slug, description: newCat.description || null,
      color: newCat.color, sort_order: maxOrder + 1
    }).select().single()
    setCreating(false)
    if (error) { toast.error({ title: 'Error creando categoría' }); return }
    setCategories(prev => [...prev, data])
    setNewCat({ name: '', slug: '', description: '', color: '#8b5cf6' })
    setShowCreate(false)
    toast.success({ title: `${data.name} creada` })
  }

  async function deleteCategory(cat: Category) {
    if (!confirm(`¿Eliminar la categoría "${cat.name}" permanentemente?`)) return
    setDeleting(cat.id)
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    setDeleting(null)
    if (error) { toast.error({ title: 'Error eliminando categoría' }); return }
    setCategories(prev => prev.filter(c => c.id !== cat.id))
    toast.success({ title: `${cat.name} eliminada` })
  }

  function update(id: string, field: keyof Category, value: string | number) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white">Categorías</h1>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>
      <p className="text-slate-400 text-sm mb-8">Edita las categorías principales de la plataforma</p>

      {/* Create new category form */}
      {showCreate && (
        <div className="bg-slate-900 border border-purple-500/50 rounded-xl p-5 mb-4">
          <h3 className="text-white font-semibold mb-4">Crear nueva categoría</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nombre</label>
              <input type="text" value={newCat.name} onChange={e => setNewCat(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mi Categoría"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Slug</label>
              <input type="text" value={newCat.slug} onChange={e => setNewCat(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="mi-categoria"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={newCat.color} onChange={e => setNewCat(prev => ({ ...prev, color: e.target.value }))}
                  className="h-9 w-12 rounded cursor-pointer bg-slate-800 border border-slate-700" />
                <input type="text" value={newCat.color} onChange={e => setNewCat(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Descripción</label>
              <input type="text" value={newCat.description} onChange={e => setNewCat(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Opcional"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={createCategory} disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                <h3 className="text-white font-semibold">{cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1)}</h3>
              </div>
              <button onClick={() => deleteCategory(cat)} disabled={deleting === cat.id}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                title="Eliminar categoría">
                {deleting === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
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
