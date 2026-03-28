import type { Content } from "@/types/database"

const TYPE_CONFIG = {
  book: {
    label: "Libro",
    accent: "#8b5cf6",
    href: (id: string) => `/read/${id}`,
    cta: "Leer",
  },
  audiobook: {
    label: "Audiolibro",
    accent: "#6366f1",
    href: (id: string) => `/read/${id}`,
    cta: "Escuchar",
  },
  video: {
    label: "Video",
    accent: "#ec4899",
    href: (id: string) => `/watch/${id}`,
    cta: "Reproducir",
  },
  course: {
    label: "Curso",
    accent: "#f59e0b",
    href: (id: string) => `/watch/${id}`,
    cta: "Ver curso",
  },
} as const

export function isReadingContentType(type: Content["type"]): boolean {
  return type === "book" || type === "audiobook"
}

export function isReadingContent(content: Pick<Content, "type">): boolean {
  return isReadingContentType(content.type)
}

export function getContentHref(content: Pick<Content, "id" | "type">): string {
  return TYPE_CONFIG[content.type].href(content.id)
}

export function getContentTypeLabel(type: Content["type"]): string {
  return TYPE_CONFIG[type].label
}

export function getContentAccentColor(
  content: Pick<Content, "type"> & {
    category?: { color: string | null } | null
  }
): string {
  return content.category?.color || TYPE_CONFIG[content.type].accent
}

export function hasContentPreview(
  content: Pick<Content, "preview_url" | "file_url">
): boolean {
  return Boolean(content.preview_url || content.file_url)
}

export function canOpenContent(
  content: Pick<Content, "type" | "preview_url" | "file_url" | "is_free">,
  isSubscribed = false
): boolean {
  if (content.is_free) return Boolean(content.file_url || content.preview_url)

  if (isReadingContent(content)) {
    return Boolean(content.file_url || content.preview_url)
  }

  return isSubscribed || hasContentPreview(content)
}

export function getPrimaryContentHref(
  content: Pick<Content, "id" | "type" | "preview_url" | "file_url" | "is_free">,
  isSubscribed = false
): string {
  return canOpenContent(content, isSubscribed) ? getContentHref(content) : "/subscribe"
}

export function getPrimaryContentLabel(
  content: Pick<Content, "type" | "preview_url" | "file_url" | "is_free">,
  isSubscribed = false
): string {
  if (content.is_free) {
    return TYPE_CONFIG[content.type].cta
  }

  if (isReadingContent(content)) {
    return content.type === "audiobook" ? "Escuchar completo" : "Leer completo"
  }

  if (isSubscribed) {
    return TYPE_CONFIG[content.type].cta
  }

  return hasContentPreview(content) ? "Vista previa" : "Suscribirse"
}

export function isContentLocked(
  content: Pick<Content, "type" | "is_free">,
  isSubscribed = false
): boolean {
  if (content.is_free) return false

  if (isReadingContent(content)) return false

  return !isSubscribed
}

export function getContentAccessLabel(
  content: Pick<Content, "type" | "preview_url" | "file_url" | "is_free">,
  isSubscribed = false
): string {
  if (content.is_free) return "Gratis"

  if (isReadingContent(content)) {
    return content.type === "audiobook" ? "Escucha completa" : "Lectura completa"
  }

  if (isSubscribed) return "Acceso completo"

  return hasContentPreview(content) ? "Fragmento disponible" : "Solo miembros"
}
