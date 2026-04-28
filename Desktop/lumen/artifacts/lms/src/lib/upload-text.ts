import mammoth from "mammoth/mammoth.browser";

function isLikelyTextFile(file: File): boolean {
  return (
    file.type.startsWith("text/") ||
    file.type.includes("json") ||
    file.type.includes("xml") ||
    file.name.endsWith(".md") ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".csv") ||
    file.name.endsWith(".html")
  );
}

export async function extractTextFromUpload(file: File): Promise<string> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".docx")) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const cleaned = result.value.trim();

    if (cleaned.length > 0) {
      return cleaned;
    }

    return `Uploaded Word document: ${file.name}\n\nNo readable text was extracted from the file.`;
  }

  if (isLikelyTextFile(file)) {
    return file.text();
  }

  if (lowerName.endsWith(".doc")) {
    return [
      `Uploaded file: ${file.name}`,
      "Legacy .doc files are not reliably readable in-browser.",
      "Please save as .docx and upload again for full text extraction.",
    ].join("\n");
  }

  return [
    `Uploaded file: ${file.name}`,
    `Type: ${file.type || "unknown"}`,
    `Size: ${Math.round(file.size / 1024)} KB`,
    "",
    "This file type cannot be converted to clean text in-browser.",
  ].join("\n");
}
