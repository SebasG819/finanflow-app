export interface GmailPart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
}

function decode(data: string) {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function readPlainText(part: GmailPart): string {
  if (part.mimeType === 'text/plain' && part.body?.data) return decode(part.body.data);

  for (const child of part.parts ?? []) {
    const text = readPlainText(child);
    if (text) return text;
  }

  return '';
}

export function readHtmlText(part: GmailPart): string {
  if (part.mimeType === 'text/html' && part.body?.data) {
    const template = document.createElement('template');
    template.innerHTML = decode(part.body.data);
    template.content.querySelectorAll('script,style,noscript').forEach((element) => element.remove());
    return template.content.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  for (const child of part.parts ?? []) {
    const text = readHtmlText(child);
    if (text) return text;
  }

  return '';
}
