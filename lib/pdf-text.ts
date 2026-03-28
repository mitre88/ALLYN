import { createRequire } from "node:module"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs"

const require = createRequire(join(process.cwd(), "package.json"))
const pdfWorkerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs")

GlobalWorkerOptions.workerSrc = pathToFileURL(pdfWorkerPath).href

function extractPageText(items: Array<{ str?: string }>) {
  return items
    .map((item) => item.str?.trim())
    .filter(Boolean)
    .join(" ")
    .trim()
}

export async function extractPdfText(resolvedUrl: string) {
  const fileResponse = await fetch(resolvedUrl)

  if (!fileResponse.ok) {
    throw new Error(`Unable to fetch file (${fileResponse.status})`)
  }

  const data = new Uint8Array(await fileResponse.arrayBuffer())
  const document = await getDocument({
    data,
    disableFontFace: true,
    isEvalSupported: false,
    useSystemFonts: false,
    useWorkerFetch: false,
  }).promise

  try {
    const pages: string[] = []

    for (let pageIndex = 1; pageIndex <= document.numPages; pageIndex += 1) {
      const page = await document.getPage(pageIndex)
      const content = await page.getTextContent()
      const pageText = extractPageText(content.items as Array<{ str?: string }>)

      if (pageText) {
        pages.push(pageText)
      }
    }

    return {
      pageCount: document.numPages,
      text: pages.join("\n\n"),
    }
  } finally {
    await document.destroy()
  }
}
