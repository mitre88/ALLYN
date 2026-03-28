import { PDFParse } from "pdf-parse";

export async function extractPdfText(resolvedUrl) {
  const fileResponse = await fetch(resolvedUrl);

  if (!fileResponse.ok) {
    throw new Error(`Unable to fetch file (${fileResponse.status})`);
  }

  const buffer = Buffer.from(await fileResponse.arrayBuffer());
  const parser = new PDFParse({ data: buffer });

  try {
    const parsed = await parser.getText();

    return {
      pageCount: parsed.total || 0,
      text: parsed.text || "",
    };
  } finally {
    await parser.destroy();
  }
}
