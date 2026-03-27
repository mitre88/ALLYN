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
  content: Pick<Content, "preview_url" | "file_url">,
  isSubscribed = false
): boolean {
  return isSubscribed || hasContentPreview(content)
}

export function getPrimaryContentHref(
  content: Pick<Content, "id" | "type" | "preview_url" | "file_url">,
  isSubscribed = false
): string {
  return canOpenContent(content, isSubscribed) ? getContentHref(content) : "/subscribe"
}

export function getPrimaryContentLabel(
  content: Pick<Content, "type" | "preview_url" | "file_url">,
  isSubscribed = false
): string {
  if (isSubscribed) {
    return TYPE_CONFIG[content.type].cta
  }

  return hasContentPreview(content) ? "Vista previa" : "Suscribirse"
}
