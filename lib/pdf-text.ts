// Pure-JS PDF text extraction via pdfjs-dist — no canvas / @napi-rs needed.
// Canvas is only required for rendering; text extraction uses the font/glyph layer only.

interface ExtractPdfTextOptions {
  maxPages?: number
}

export async function extractPdfText(
  resolvedUrl: string,
  options: ExtractPdfTextOptions = {}
) {
  // Lazy import so the worker path is resolved at runtime (not bundled eagerly)
  const PDFJS = await import("pdfjs-dist/legacy/build/pdf.mjs")

  // Disable the web worker — we run server-side in Node.js
  PDFJS.GlobalWorkerOptions.workerSrc = ""

  const response = await fetch(resolvedUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
  }
  const buffer = await response.arrayBuffer()

  const loadingTask = PDFJS.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  })

  const pdf = await loadingTask.promise
  const pageCount = pdf.numPages
  const processedPages = Math.min(options.maxPages ?? pageCount, pageCount)
  const pageTexts: string[] = []

  for (let i = 1; i <= processedPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ("str" in item ? (item as { str: string }).str : ""))
      .join(" ")
    pageTexts.push(pageText)
  }

  await pdf.destroy()

  return {
    pageCount,
    processedPages,
    text: pageTexts.join("\n"),
  }
}
