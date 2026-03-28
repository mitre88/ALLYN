import { PDFParse } from "pdf-parse"

export async function extractPdfText(resolvedUrl: string) {
  const parser = new PDFParse({ url: resolvedUrl })

  try {
    const parsed = await parser.getText()

    return {
      pageCount: parsed.total || 0,
      text: parsed.text || "",
    }
  } finally {
    await parser.destroy()
  }
}
