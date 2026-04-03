import type { Content } from "@/types/database"

type ThumbnailEntry = {
  ids: string[]
  titles: string[]
  src: string
}

const CURATED_BOOK_THUMBNAILS: ThumbnailEntry[] = [
  {
    ids: ["d633b613-6c61-4c58-b689-4dd7e63b4005"],
    titles: ["1% El Más Grande Sueño"],
    src: "/assets/books/1pct-el-mas-grande-sueno.svg",
  },
  {
    ids: ["ac8d9703-4ba2-4f39-8375-d056a6a70e75"],
    titles: ["Cómo Hacer Ultra Negocios en Pandemia", "Libro sin contra portada"],
    src: "/assets/books/como-hacer-ultra-negocios-en-pandemia.svg",
  },
  {
    ids: ["24b73d1e-45cb-424c-862e-6e229606ed01"],
    titles: ["Annie's Stories Volumen I", "Anniie's Stories Volumen I"],
    src: "/assets/books/annies-stories-volumen-1.svg",
  },
  {
    ids: ["c29a1941-a76a-4de0-95c2-22a44e5e6deb"],
    titles: ["Annie's Stories Volumen II"],
    src: "/assets/books/annies-stories-volumen-2.svg",
  },
  {
    ids: ["8b321f41-085e-446d-adc1-0c7e781c8a5d"],
    titles: ["Colección de Cuentos Infantiles Tomo 1", "Coleccion de Cuentos Infantiles Tomo 1"],
    src: "/assets/books/coleccion-cuentos-infantiles-tomo-1.svg",
  },
  {
    ids: ["e98ad241-ead0-40db-80bf-2375d92523d9"],
    titles: ["Colección de Cuentos Infantiles Tomo 2", "Coleccion de Cuentos Infantiles Tomo 2"],
    src: "/assets/books/coleccion-cuentos-infantiles-tomo-2.svg",
  },
]

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
}

export function getCuratedThumbnailSrc(
  content: Pick<Content, "id" | "title" | "type">
): string | null {
  if (content.type !== "book" && content.type !== "audiobook") {
    return null
  }

  const normalizedTitle = normalizeKey(content.title)

  const entry = CURATED_BOOK_THUMBNAILS.find(
    (item) =>
      item.ids.includes(content.id) ||
      item.titles.some((title) => normalizeKey(title) === normalizedTitle)
  )

  return entry?.src ?? null
}
