'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Category { id: string; name: string; color: string }

export default function UploadContent() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})

  const [form, setForm] = useState({
    title: '', description: '', author: '', type: 'book' as 'book' | 'video' | 'course',
    category_id: '', status: 'draft' as 'draft' | 'published',
  })
  const [files, setFiles] = useState<{
    main: File | null; preview: File | null; thumbnail: File | null;
  }>({ main: null, preview: null, thumbnail: null })

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []))
  }, [])

  const bucketMap = { book: 'books', video: 'videos', course: 'videos' }
  const acceptMap = { book: '.pdf', video: '.mp4,.webm,.mov', course: '.mp4,.webm,.mov' }

  async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) { toast.error(`Error subiendo archivo: ${error.message}`); return null }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.category_id) { toast.error('Título y categoría son requeridos'); return }
    if (!files.main) { toast.error('El archivo principal es requerido'); return }

    setLoading(true)
    const id = crypto.randomUUID()

    try {
      let file_url: string | null = null
      let preview_url: string | null = null
      let thumbnail_url: string | null = null

      const bucket = bucketMap[form.type]

      setProgress(p => ({ ...p, main: 0 }))
      file_url = await uploadFile(files.main, bucket, `${id}/main.${files.main.name.split('.').pop()}`)
      setProgress(p => ({ ...p, main: 100 }))

      if (files.preview) {
        setProgress(p => ({ ...p, preview: 0 }))
        preview_url = await uploadFile(files.preview, 'previews', `${id}/preview.${files.preview.name.split('.').pop()}`)
        setProgress(p => ({ ...p, preview: 100 }))
      }

      if (files.thumbnail) {
        setProgress(p => ({ ...p, thumbnail: 0 }))
        thumbnail_url = await uploadFile(files.thumbnail, 'thumbnails', `${id}/thumb.${files.thumbnail.name.split('.').pop()}`)
        setProgress(p => ({ ...p, thumbnail: 100 }))
      }

      const { error } = await supabase.from('content').insert({
        id,
        ...form,
        file_url,
        preview_url,
        thumbnail_url,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
      })

      if (error) throw error

      toast.success('Contenido subido exitosamente')
      router.push('/admin/content')
    } catch (err: unknown) {
      toast.error(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
      setProgress({})
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/content" className="text-slate-400 hover:text-white text-sm">← Volver</Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Subir Contenido</h1>
          <p className="text-slate-400 text-sm">Agrega libros, videos o cursos a la plataforma</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de contenido</label>
          <div className="flex gap-3">
            {(['book', 'video', 'course'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border ${form.type === t ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
              >
                {{ book: '📚 Libro', video: '🎬 Video', course: '🎓 Curso' }[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Title + Author */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Título *</label>
            <input
              type="text" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
              placeholder="Nombre del contenido"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Autor</label>
            <input
              type="text" value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
              placeholder="Nombre del autor"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
          <textarea
            value={form.description} rows={3}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none resize-none"
            placeholder="Describe el contenido..."
          />
        </div>

        {/* Category + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Categoría *</label>
            <select
              required value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Estado</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicar ahora</option>
            </select>
          </div>
        </div>

        {/* Files */}
        {(['main', 'preview', 'thumbnail'] as const).map(field => (
          <div key={field}>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {field === 'main' ? `Archivo principal (${form.type === 'book' ? 'PDF' : 'Video'}) *` :
               field === 'preview' ? 'Vista previa (para no suscriptores)' :
               'Miniatura (imagen portada)'}
            </label>
            <div className="relative">
              <input
                type="file"
                accept={field === 'thumbnail' ? '.jpg,.jpeg,.png,.webp' :
                        field === 'preview' ? `${acceptMap[form.type]},.pdf` :
                        acceptMap[form.type]}
                onChange={e => setFiles(f => ({ ...f, [field]: e.target.files?.[0] || null }))}
                className="hidden"
                id={`file-${field}`}
              />
              <label
                htmlFor={`file-${field}`}
                className="flex items-center gap-3 w-full bg-slate-800 border border-dashed border-slate-600 rounded-lg px-4 py-3 cursor-pointer hover:border-purple-500 transition-colors"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  {files[field] ? files[field]!.name : 'Seleccionar archivo...'}
                </span>
                {files[field] && (
                  <button type="button" onClick={(e) => { e.preventDefault(); setFiles(f => ({ ...f, [field]: null })) }} className="ml-auto">
                    <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                  </button>
                )}
              </label>
            </div>
            {progress[field] !== undefined && (
              <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress[field]}%` }} />
              </div>
            )}
          </div>
        ))}

        <button
          type="submit" disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Subir Contenido</>}
        </button>
      </form>
    </div>
  )
}
