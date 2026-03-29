/** Normalize text for stable duplicate detection (matches prior server logic). */
export function normalizeForHash(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const dig = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(dig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
