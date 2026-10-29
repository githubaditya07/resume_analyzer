import { createHash } from "node:crypto";
import { getUploadMaxSizeMb } from "@/lib/config";

const maxChars = 30000;

export class ResumeInputError extends Error {}

export async function extractResumeText(file: File, maxSizeMb = getUploadMaxSizeMb()) {
  if (!file || file.size === 0) throw new ResumeInputError("The selected file is empty.");
  if (file.size > maxSizeMb * 1024 * 1024) throw new ResumeInputError(`The file is larger than the ${maxSizeMb} MB limit.`);
  const name = file.name.toLowerCase();
  const bytes = Buffer.from(await file.arrayBuffer());
  let text: string;

  if (name.endsWith(".txt") && (file.type === "text/plain" || !file.type)) {
    text = bytes.toString("utf8");
  } else if (name.endsWith(".pdf") && (file.type === "application/pdf" || !file.type)) {
    if (bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error("This file is not a valid PDF.");
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const parsed = await pdfParse(bytes, { max: 0 });
      text = parsed.text;
    } catch {
      throw new ResumeInputError("The PDF could not be read. Try another text-based PDF or paste the resume text.");
    }
  } else if (name.endsWith(".docx") && (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || !file.type)) {
    if(bytes.subarray(0,2).toString()!=="PK")throw new ResumeInputError("This file is not a valid DOCX document.");
    try {
      const result = await (await import("mammoth")).extractRawText({ buffer: bytes });
      text = result.value;
    } catch {
      throw new ResumeInputError("The DOCX document could not be read. Try a different file or paste the resume text.");
    }
  } else {
    throw new ResumeInputError("Unsupported file. Upload a PDF, DOCX, or TXT resume.");
  }

  const normalized = text.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
  if (normalized.length < 80) throw new ResumeInputError("We couldn't extract enough text. Scanned PDFs may need OCR; try a text-based PDF or paste the resume text.");
  if (normalized.length > maxChars) throw new ResumeInputError(`The extracted resume is longer than ${maxChars} characters. Shorten it before analysis.`);
  return { text: normalized, hash: createHash("sha256").update(normalized).digest("hex") };
}
