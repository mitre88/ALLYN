import { notFound } from "next/navigation"
import { BookReaderShell } from "@/components/content/book-reader-shell"
import { getReaderContent } from "@/lib/reader"

interface ReadPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ReadPageProps) {
  const { id } = await params
  const readerContent = await getReaderContent(id)
  const content = readerContent?.content

  if (!content) {
    return {
      title: "Libro no encontrado - ALLYN",
    }
  }

  return {
    title: `${content.title} - Lectura completa | ALLYN`,
    description: content.description,
  }
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { id } = await params
  const readerContent = await getReaderContent(id)

  if (!readerContent) {
    notFound()
  }

  return (
    <BookReaderShell
      backHref={readerContent.backHref}
      backLabel={readerContent.backLabel}
      content={readerContent.content}
      pdfUrl={readerContent.pdfUrl}
      isSubscribed={readerContent.isSubscribed}
    />
  )
}
