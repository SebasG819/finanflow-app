export function gmailErrorMessage(status: number, payload: unknown): string {
  const reason = typeof payload === 'object' && payload !== null && 'error' in payload
    ? (payload.error as { message?: unknown })?.message
    : undefined;
  const detail = typeof reason === 'string' ? reason.slice(0, 300) : '';
  return `Gmail no pudo completar la búsqueda (${status})${detail ? `: ${detail}` : '.'}`;
}
