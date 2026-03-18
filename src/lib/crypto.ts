export async function generateReceiptHash(
  voterId: string,
  electionId: string,
  candidateId: string
): Promise<string> {
  const raw = `${voterId}:${electionId}:${candidateId}:${Date.now()}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
