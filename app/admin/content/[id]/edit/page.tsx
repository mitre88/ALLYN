'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Upload, X, Loader2, FileText, Video, Image,
  CheckCircle2, ArrowLeft, Save, Trash2, AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Category { id: string; name: string; color: string }

function DropZone({
  id, label, hint, accept, file, currentUrl, required, onFile, onClear,
  icon: Icon = Upload,
}: {
  id: string; label: string; hint: string; accept: string
  file: File | null; currentUrl?: string | null; required?: boolean
  onFile: (f: File) => void; onClear: () => void
  icon?: React.ElementType
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFile(dropped)
  }, [onFile])

  const preview = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null
  const hasCurrentFile = !!currentUrl

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </label>

      {hasCurrentFile && !file && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-xs text-green-300 truncate flex-1">Archivo actual guardado</p>
          <a href={currentUrl!} target="_blank" rel="noreferrer" className="text-xs text-green-400 hover:underline shrink-0">Ver</a>
        </div>
      )}

      <input ref={inputRef} type="file" id={id} accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />

      {file ? (
        <div className="relative flex items-center gap-3 bg-muted/40 border border-border rounded-xl p-4">
          {preview ? (
            <img src={preview} alt="" className="w-14 h-10 object-cover rounded-lg" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB
              {file.size > 50 * 1024 * 1024 && (
                <span className="ml-2 text-amber-400">⚠ &gt;50 MB — puede fallar en producción</span>
              )}
            </p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <button type="button" onClick={onClear}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive/80 hover:bg-destructive flex items-center justify-center text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)} onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-6 cursor-pointer transition-all ${
            dragging ? 'border-primary bg-primary/8' : 'border-border/60 hover:border-border hover:bg-muted/30'
          }`}>
          <Icon className={`w-5 h-5 ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-sm text-foreground/70">
            {hasCurrentFile ? 'Reemplazar archivo' : 'Seleccionar archivo'}
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      )}
    </div>
  )
}

export default function EditContent() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', author: '',
    type: 'book' as 'book' | 'video' | 'course' | 'audiobook',
    category_id: '',
    status: 'draft' as 'draft' | 'published',
    duration: 0, is_free: false,
  })
  const [currentUrls, setCurrentUrls] = useState({
    file_url: null as string | null,
    preview_url: null as string | null,
    thumbnail_url: null as string | null,
  })
  const [files, setFiles] = useState<{
    main: File | null; preview: File | null; thumbnail: File | null
  }>({ main: null, preview: null, thumbnail: null })

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: content }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('content').select('*').eq('id', id).single(),
      ])
      setCategories(cats || [])
      if (content) {
        setForm({
          title: content.title || '',
          description: content.description || '',
          author: content.author || '',
          type: content.type || 'book',
          category_id: content.category_id || '',
          status: content.status || 'draft',
          duration: content.duration || 0,
          is_free: content.is_free || false,
        })
        setCurrentUrls({
          file_url: content.file_url,
          preview_url: content.preview_url,
          thumbnail_url: content.thumbnail_url,
        })
      }
      setLoading(false)
    }
    load()
  }, [id])

  const bucketMap: Record<string, string> = {
    book: 'books', audiobook: 'books', video: 'videos', course: 'videos',
  }
  const acceptMap: Record<string, string> = {
    book: '.pdf', audiobook: '.pdf,.mp3,.m4a,.aac',
    video: '.mp4,.webm,.mov', course: '.mp4,.webm,.mov',
  }

  async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) { toast.error(`Error subiendo: ${error.message}`); return null }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/${bucket}/${path}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.category_id) { toast.error('Título y categoría son requeridos'); return }
    setSaving(true)

    try {
      const updates: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        author: form.author,
        type: form.type,
        category_id: form.category_id,
        status: form.status,
        duration: form.duration || 0,
        is_free: form.is_free,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
      }

      const bucket = bucketMap[form.type]

      if (files.main) {
        const ext = files.main.name.split('.').pop()
        const url = await uploadFile(files.main, bucket, `${id}/main.${ext}`)
        if (url) updates.file_url = url
      }
      if (files.preview) {
        const ext = files.preview.name.split('.').pop()
        const url = await uploadFile(files.preview, 'previews', `${id}/preview.${ext}`)
        if (url) updates.preview_url = url
      }
      if (files.thumbnail) {
        const ext = files.thumbnail.name.split('.').pop()
        const url = await uploadFile(files.thumbnail, 'thumbnails', `${id}/thumb.${ext}`)
        if (url) updates.thumbnail_url = url
      }

      const { error } = await supabase.from('content').update(updates).eq('id', id)
      if (error) throw error

      toast.success('Contenido actualizado')
      router.push('/admin/content')
    } catch (err: unknown) {
      toast.error(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${form.title}" permanentemente? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    try {
      await supabase.from('content').delete().eq('id', id)
      toast.success('Contenido eliminado')
      router.push('/admin/content')
    } catch (err: unknown) {
      toast.error(`Error al eliminar: ${err instanceof Error ? err.message : 'Error'}`)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  const mainIcon: Record<string, React.ElementType> = {
    book: FileText, audiobook: FileText, video: Video, course: Video,
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/content"
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Editar Contenido</h1>
          <p className="text-sm text-muted-foreground truncate max-w-xs">{form.title}</p>
        </div>
      </div>

      {/* Upload size warning */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300 leading-relaxed">
          Los archivos mayores a 50 MB deben subirse mediante el script de línea de comandos
          (<code className="bg-black/30 px-1 rounded">node scripts/upload-multimedia.mjs</code>).
          Aquí puedes reemplazar portadas, vistas previas y archivos pequeños sin problemas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Tipo</label>
          <div className="grid grid-cols-4 gap-2">
            {([
              { value: 'book', label: 'Libro', icon: '📚' },
              { value: 'audiobook', label: 'Audiolibro', icon: '🎧' },
              { value: 'video', label: 'Video', icon: '🎬' },
              { value: 'course', label: 'Curso', icon: '🎓' },
            ] as const).map(t => (
              <button key={t.value} type="button"
                onClick={() => setForm(f => ({ ...f, type: t.value }))}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all border ${
                  form.type === t.value
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/40'
                }`}>
                <span className="text-lg">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title + Author */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
              Título <span className="text-destructive">*</span>
            </label>
            <input type="text" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
              placeholder="Nombre del contenido" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Autor</label>
            <input type="text" value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
              placeholder="Nombre del autor" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Descripción</label>
          <textarea value={form.description} rows={3}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none resize-none transition-colors"
            placeholder="Describe el contenido..." />
        </div>

        {/* Category + Status + Duration */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
              Categoría <span className="text-destructive">*</span>
            </label>
            <select required value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none transition-colors">
              <option value="">Seleccionar...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Estado</label>
            <select value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none transition-colors">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Duración (min)</label>
            <input type="number" min={0} value={form.duration || ''}
              onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 0 }))}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
              placeholder="0" />
          </div>
        </div>

        {/* Free toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_free}
            onChange={e => setForm(f => ({ ...f, is_free: e.target.checked }))}
            className="w-4 h-4 rounded border-border accent-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Contenido gratuito</p>
            <p className="text-xs text-muted-foreground">Visible sin suscripción</p>
          </div>
        </label>

        {/* Files */}
        <div className="space-y-4 pt-2 border-t border-border/40">
          <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Archivos</p>

          <DropZone id="file-main"
            label={`Archivo principal (${form.type === 'book' ? 'PDF' : 'Video'})`}
            hint={`Formato: ${acceptMap[form.type]} — máx 50 MB desde el navegador`}
            accept={acceptMap[form.type]}
            file={files.main}
            currentUrl={currentUrls.file_url}
            icon={mainIcon[form.type]}
            onFile={f => setFiles(p => ({ ...p, main: f }))}
            onClear={() => setFiles(p => ({ ...p, main: null }))} />

          <DropZone id="file-preview" label="Vista previa (para no suscriptores)"
            hint="Primeras páginas / minutos · opcional"
            accept={`${acceptMap[form.type]}`}
            file={files.preview}
            currentUrl={currentUrls.preview_url}
            icon={mainIcon[form.type]}
            onFile={f => setFiles(p => ({ ...p, preview: f }))}
            onClear={() => setFiles(p => ({ ...p, preview: null }))} />

          <DropZone id="file-thumbnail" label="Portada / miniatura"
            hint="JPG, PNG o WEBP — recomendado 480×270"
            accept=".jpg,.jpeg,.png,.webp"
            file={files.thumbnail}
            currentUrl={currentUrls.thumbnail_url}
            icon={Image}
            onFile={f => setFiles(p => ({ ...p, thumbnail: f }))}
            onClear={() => setFiles(p => ({ ...p, thumbnail: null }))} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving || deleting}
            className="flex-1 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/15">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar Cambios</>}
          </button>
          <button type="button" onClick={handleDelete} disabled={saving || deleting}
            className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Eliminar
          </button>
        </div>
      </form>
    </div>
  )
}
