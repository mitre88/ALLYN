'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, FileText, Video, Image, CheckCircle2, ArrowLeft } from 'lucide-react'
import { sileo as toast } from 'sileo'
import Link from 'next/link'

interface Category { id: string; name: string; color: string }

// ── Drop Zone Component ────────────────────────────────────────────────────
function DropZone({
  id,
  label,
  hint,
  accept,
  file,
  required,
  onFile,
  onClear,
  icon: Icon = Upload,
}: {
  id: string
  label: string
  hint: string
  accept: string
  file: File | null
  required?: boolean
  onFile: (f: File) => void
  onClear: () => void
  icon?: React.ElementType
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) onFile(dropped)
    },
    [onFile]
  )

  const preview = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        id={id}
        accept={accept}
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />

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
            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive/80 hover:bg-destructive flex items-center justify-center text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-8 cursor-pointer transition-all select-none ${
            dragging
              ? 'border-primary bg-primary/8 scale-[1.01]'
              : 'border-border/60 hover:border-border hover:bg-muted/30'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dragging ? 'bg-primary/20' : 'bg-muted'}`}>
            <Icon className={`w-5 h-5 transition-colors ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground/80">
              {dragging ? 'Suelta el archivo aquí' : 'Arrastra o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Progress Bar ───────────────────────────────────────────────────────────
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1 bg-muted rounded-full overflow-hidden mt-1.5">
      <div
        className="h-full bg-primary transition-all duration-300 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function UploadContent() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})

  const [form, setForm] = useState({
    title: '',
    description: '',
    author: '',
    type: 'book' as 'book' | 'video' | 'course' | 'audiobook',
    category_id: '',
    status: 'draft' as 'draft' | 'published',
    duration: 0,
    is_free: false,
  })
  const [files, setFiles] = useState<{
    main: File | null
    preview: File | null
    thumbnail: File | null
  }>({ main: null, preview: null, thumbnail: null })

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []))
  }, [])

  const CONTENT_TYPES = [
    { value: 'book', label: 'Libro', icon: '📚' },
    { value: 'audiobook', label: 'Audiolibro', icon: '🎧' },
    { value: 'video', label: 'Video', icon: '🎬' },
    { value: 'course', label: 'Curso', icon: '🎓' },
  ] as const

  const bucketMap: Record<string, string> = {
    book: 'books', audiobook: 'books', video: 'videos', course: 'videos',
  }
  const acceptMap: Record<string, string> = {
    book: '.pdf', audiobook: '.pdf,.mp3,.m4a,.aac',
    video: '.mp4,.webm,.mov', course: '.mp4,.webm,.mov',
  }
  const mainIcon: Record<string, React.ElementType> = {
    book: FileText, audiobook: FileText, video: Video, course: Video,
  }

  async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) { toast.error({ title: `Error subiendo archivo: ${error.message}` }); return null }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.category_id) { toast.error({ title: 'Título y categoría son requeridos' }); return }
    if (!files.main) { toast.error({ title: 'El archivo principal es requerido' }); return }

    setLoading(true)
    const id = crypto.randomUUID()

    try {
      const bucket = bucketMap[form.type]
      setProgress({ main: 10, preview: 0, thumbnail: 0 })

      const file_url = await uploadFile(files.main, bucket, `${id}/main.${files.main.name.split('.').pop()}`)
      setProgress(p => ({ ...p, main: 100 }))

      let preview_url: string | null = null
      if (files.preview) {
        setProgress(p => ({ ...p, preview: 10 }))
        preview_url = await uploadFile(files.preview, 'previews', `${id}/preview.${files.preview.name.split('.').pop()}`)
        setProgress(p => ({ ...p, preview: 100 }))
      }

      let thumbnail_url: string | null = null
      if (files.thumbnail) {
        setProgress(p => ({ ...p, thumbnail: 10 }))
        thumbnail_url = await uploadFile(files.thumbnail, 'thumbnails', `${id}/thumb.${files.thumbnail.name.split('.').pop()}`)
        setProgress(p => ({ ...p, thumbnail: 100 }))
      }

      const { error } = await supabase.from('content').insert({
        id,
        title: form.title,
        description: form.description,
        author: form.author,
        type: form.type,
        category_id: form.category_id,
        status: form.status,
        duration: form.duration || 0,
        is_free: form.is_free,
        file_url,
        preview_url,
        thumbnail_url,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
      })

      if (error) throw error

      toast.success({ title: 'Contenido subido exitosamente' })
      router.push('/admin/content')
    } catch (err: unknown) {
      toast.error({ title: `Error: ${err instanceof Error ? err.message : 'Error desconocido'}` })
    } finally {
      setLoading(false)
      setProgress({})
    }
  }

  const isUploading = loading && Object.values(progress).some(v => v < 100)

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/content"
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Subir Contenido</h1>
          <p className="text-sm text-muted-foreground">Agrega libros, audiolibros, videos o cursos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Tipo</label>
          <div className="grid grid-cols-4 gap-2">
            {CONTENT_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: t.value }))}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all border ${
                  form.type === t.value
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/40'
                }`}
              >
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
            <input
              type="text" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
              placeholder="Nombre del contenido"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Autor</label>
            <input
              type="text" value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
              placeholder="Nombre del autor"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Descripción</label>
          <textarea
            value={form.description} rows={3}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none resize-none transition-colors"
            placeholder="Describe el contenido..."
          />
        </div>

        {/* Category + Status + Duration */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
              Categoría <span className="text-destructive">*</span>
            </label>
            <select
              required value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none transition-colors"
            >
              <option value="">Seleccionar...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Estado</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none transition-colors"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicar ahora</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Duración (min)</label>
            <input
              type="number" min={0} value={form.duration || ''}
              onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 0 }))}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
              placeholder="0"
            />
          </div>
        </div>

        {/* Free content toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_free}
            onChange={e => setForm(f => ({ ...f, is_free: e.target.checked }))}
            className="w-4 h-4 rounded border-border accent-primary"
          />
          <div>
            <p className="text-sm font-medium text-foreground">Contenido gratuito</p>
            <p className="text-xs text-muted-foreground">Visible para todos sin suscripción (ej. videos promocionales)</p>
          </div>
        </label>

        {/* Drop Zones */}
        <div className="space-y-4 pt-2 border-t border-border/40">
          <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Archivos</p>

          <DropZone
            id="file-main"
            label={`Archivo principal (${form.type === 'book' ? 'PDF' : form.type === 'audiobook' ? 'PDF / Audio' : 'Video'})`}
            hint={`Formato: ${acceptMap[form.type]} — arrastra o haz clic`}
            accept={acceptMap[form.type]}
            file={files.main}
            required
            icon={mainIcon[form.type]}
            onFile={f => setFiles(p => ({ ...p, main: f }))}
            onClear={() => setFiles(p => ({ ...p, main: null }))}
          />
          {progress.main !== undefined && progress.main < 100 && <ProgressBar value={progress.main} />}

          <DropZone
            id="file-preview"
            label="Vista previa (para no suscriptores)"
            hint="Muestra los primeros minutos / páginas · opcional"
            accept={`${acceptMap[form.type]}`}
            file={files.preview}
            icon={mainIcon[form.type]}
            onFile={f => setFiles(p => ({ ...p, preview: f }))}
            onClear={() => setFiles(p => ({ ...p, preview: null }))}
          />
          {progress.preview !== undefined && progress.preview < 100 && <ProgressBar value={progress.preview} />}

          <DropZone
            id="file-thumbnail"
            label="Portada / miniatura"
            hint="JPG, PNG o WEBP — recomendado 1280×720 · opcional"
            accept=".jpg,.jpeg,.png,.webp"
            file={files.thumbnail}
            icon={Image}
            onFile={f => setFiles(p => ({ ...p, thumbnail: f }))}
            onClear={() => setFiles(p => ({ ...p, thumbnail: null }))}
          />
          {progress.thumbnail !== undefined && progress.thumbnail < 100 && <ProgressBar value={progress.thumbnail} />}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/15 mt-2"
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo archivos...</>
          ) : loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
          ) : (
            <><Upload className="w-4 h-4" /> Publicar Contenido</>
          )}
        </button>
      </form>
    </div>
  )
}
