'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, Plus, Eye, EyeOff, BookOpen, Video, GraduationCap, Search, AlertTriangle } from 'lucide-react'
import { ContentArtwork } from '@/components/content/content-artwork'
import Link from 'next/link'
import { sileo as toast } from 'sileo'

interface ContentItem {
  id: string
  title: string
  type: 'book' | 'video' | 'course' | 'audiobook'
  status: 'draft' | 'published' | 'archived'
  thumbnail_url: string | null
  preview_url: string | null
  file_url: string | null
  sort_order: number
  category: { name: string; color: string } | null
  author: string | null
}

function getMissingAssets(item: ContentItem): string[] {
  const missing: string[] = []
  if (!item.thumbnail_url) missing.push("miniatura")
  if ((item.type === "course" || item.type === "video") && !item.preview_url) missing.push("trailer/preview")
  return missing
}

const typeIcons = { book: BookOpen, video: Video, course: GraduationCap, audiobook: BookOpen }
const typeLabels = { book: 'Libro', video: 'Video', course: 'Curso', audiobook: 'Audiolibro' }

function SortableRow({ item, onToggle, onDelete }: {
  item: ContentItem
  onToggle: (id: string, status: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const Icon = typeIcons[item.type]

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-slate-800 hover:bg-slate-800/50">
      <td className="p-3">
        <button {...attributes} {...listeners} className="cursor-grab text-slate-500 hover:text-slate-300">
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-3">
          {item.thumbnail_url ? (
            <ContentArtwork content={item} variant="mini" className="w-12 h-8" />
          ) : (
            <ContentArtwork content={item} variant="mini" className="w-12 h-8" />
          )}
          <div>
            <p className="text-sm text-white font-medium">{item.title}</p>
            {item.author && <p className="text-xs text-slate-400">{item.author}</p>}
            {getMissingAssets(item).length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[10px] text-amber-400">
                  Falta: {getMissingAssets(item).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="p-3">
        <span className="flex items-center gap-1.5 text-xs text-slate-300">
          <Icon className="w-3 h-3" />
          {typeLabels[item.type]}
        </span>
      </td>
      <td className="p-3">
        {item.category ? (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: item.category.color + '20', color: item.category.color }}>
            {item.category.name}
          </span>
        ) : <span className="text-xs text-slate-500">—</span>}
      </td>
      <td className="p-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
          {item.status === 'published' ? 'Publicado' : 'Borrador'}
        </span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(item.id, item.status)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title={item.status === 'published' ? 'Despublicar' : 'Publicar'}
          >
            {item.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <Link href={`/admin/content/${item.id}/edit`} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function AdminContent() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('content')
        .select('id, title, type, status, thumbnail_url, preview_url, file_url, sort_order, author, category:categories(name, color)')
        .order('sort_order', { ascending: true })
      setItems((data as unknown as ContentItem[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = items
    .filter(i => filter === 'all' || i.type === filter)
    .filter(i => !search.trim() || i.title.toLowerCase().includes(search.toLowerCase()))

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)

    setItems(newItems)

    // Update sort_order in DB
    await Promise.all(
      newItems.map((item, index) =>
        supabase.from('content').update({ sort_order: index }).eq('id', item.id)
      )
    )
    toast.success({ title: 'Orden guardado' })
  }

  async function toggleStatus(id: string, status: string) {
    const newStatus = status === 'published' ? 'draft' : 'published'
    await supabase.from('content').update({ status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus as 'draft' | 'published' } : i))
    toast.success({ title: newStatus === 'published' ? 'Contenido publicado' : 'Contenido despublicado' })
  }

  async function deleteContent(id: string) {
    if (!confirm('¿Eliminar este contenido permanentemente?')) return
    await supabase.from('content').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success({ title: 'Contenido eliminado' })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Contenido</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona libros, videos y cursos</p>
        </div>
        <Link
          href="/admin/content/upload"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Subir Contenido
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por título..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
        />
      </div>
      <div className="flex gap-2 mb-6">
        {['all', 'book', 'video', 'course'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {{ all: 'Todo', book: 'Libros', video: 'Videos', course: 'Cursos' }[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-12">Cargando...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-3 w-10"></th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium">Título</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium">Tipo</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium">Categoría</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium">Estado</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {filtered.map(item => (
                    <SortableRow key={item.id} item={item} onToggle={toggleStatus} onDelete={deleteContent} />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay contenido. <Link href="/admin/content/upload" className="text-purple-400 hover:underline">Subir contenido</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
