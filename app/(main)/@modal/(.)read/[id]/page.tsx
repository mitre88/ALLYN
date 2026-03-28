import { notFound } from "next/navigation"
import { BookReaderShell } from "@/components/content/book-reader-shell"
import { RouteModal } from "@/components/ui/route-modal"
import { getReaderContent } from "@/lib/reader"

interface ReadModalPageProps {
  params: Promise<{ id: string }>
}

export default async function ReadModalPage({ params }: ReadModalPageProps) {
  const { id } = await params
  const readerContent = await getReaderContent(id)

  if (!readerContent) {
    notFound()
  }

  return (
    <RouteModal title={`Lectura completa de ${readerContent.content.title}`}>
      <BookReaderShell
        backHref={readerContent.backHref}
        backLabel={readerContent.backLabel}
        content={readerContent.content}
        pdfUrl={readerContent.pdfUrl}
      />
    </RouteModal>
  )
}
