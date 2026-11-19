import { parseFinancialMessage, type ParsedFinancialMessage } from '../utils/gmailParser';
import { readHtmlText, readPlainText, type GmailPart } from '../utils/gmailMime';
import { gmailErrorMessage } from '../utils/gmailErrors';
import { MAX_GMAIL_MESSAGES_PER_SYNC, remainingScanCooldown } from '../utils/gmailQuota';

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface GoogleAccounts {
  oauth2: {
    initTokenClient: (options: {
      client_id: string;
      scope: string;
      callback: (response: GoogleTokenResponse) => void;
      error_callback: (error: { type: string }) => void;
    }) => GoogleTokenClient;
    revoke: (token: string, callback: () => void) => void;
  };
}

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

interface GmailMessage {
  id: string;
  internalDate?: string;
  snippet?: string;
  payload?: GmailPart & { headers?: Array<{ name: string; value: string }> };
}

const gmailEndpoint = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
let scriptPromise: Promise<void> | null = null;
let activeConnection: { userId: string; token: string } | null = null;
let lastScanAt = 0;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts.oauth2) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => window.google?.accounts.oauth2 ? resolve() : reject(new Error('No se pudo iniciar Google.'));
    script.onerror = () => reject(new Error('No se pudo cargar la conexión con Google.'));
    document.head.appendChild(script);
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

async function gmailFetch<T>(token: string, url: string): Promise<T> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 401) throw new Error('La conexión con Gmail venció. Conéctala nuevamente.');
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(gmailErrorMessage(response.status, payload));
  }
  return response.json() as Promise<T>;
}

function header(message: GmailMessage, name: string) {
  return message.payload?.headers?.find((item) => item.name.toLowerCase() === name)?.value ?? '';
}

export const GmailApi = {
  get configured() {
    return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  },

  preload() {
    if (this.configured) void loadGoogleScript().catch(() => undefined);
  },

  getToken(userId: string) {
    return activeConnection?.userId === userId ? activeConnection.token : null;
  },

  async connect(userId: string): Promise<string> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) throw new Error('Falta configurar VITE_GOOGLE_CLIENT_ID.');
    await loadGoogleScript();

    const token = await new Promise<string>((resolve, reject) => {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        callback: (response) => response.access_token
          ? resolve(response.access_token)
          : reject(new Error(response.error ?? 'No se autorizó Gmail.')),
        error_callback: () => reject(new Error('Se cerró o bloqueó la ventana de Google.')),
      });
      client.requestAccessToken({ prompt: '' });
    });
    activeConnection = { userId, token };
    return token;
  },

  disconnect() {
    const token = activeConnection?.token;
    activeConnection = null;
    if (!token) return;
    try {
      window.google?.accounts.oauth2.revoke(token, () => undefined);
    } catch {
      // The local token is already gone; a Google revoke failure cannot keep the session open.
    }
  },

  async scan(token: string): Promise<{ candidates: ParsedFinancialMessage[]; scannedIds: string[]; scanned: number; truncated: boolean }> {
    const cooldown = remainingScanCooldown(lastScanAt, Date.now());
    if (cooldown > 0) throw new Error(`Espera ${Math.ceil(cooldown / 1000)} segundos antes de volver a sincronizar Gmail.`);
    lastScanAt = Date.now();
    const ids: string[] = [];
    let nextPage: string | undefined;
    const query = 'newer_than:90d {compra recibo comprobante pago transferencia abono consignacion factura nomina reembolso receipt payment purchase refund}';

    do {
      const url = new URL(gmailEndpoint);
      url.searchParams.set('q', query);
      url.searchParams.set('maxResults', String(Math.min(100, MAX_GMAIL_MESSAGES_PER_SYNC - ids.length)));
      if (nextPage) url.searchParams.set('pageToken', nextPage);
      const page = await gmailFetch<{ messages?: Array<{ id: string }>; nextPageToken?: string }>(token, url.toString());
      ids.push(...(page.messages ?? []).map((message) => message.id));
      nextPage = page.nextPageToken;
    } while (nextPage && ids.length < MAX_GMAIL_MESSAGES_PER_SYNC);

    const candidates: ParsedFinancialMessage[] = [];
    for (let start = 0; start < ids.length; start += 5) {
      const batch = ids.slice(start, start + 5);
      const messages = await Promise.all(batch.map((id) => gmailFetch<GmailMessage>(token, `${gmailEndpoint}/${encodeURIComponent(id)}?format=full`)));
      for (const message of messages) {
        const date = message.internalDate ? new Date(Number(message.internalDate)).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
        const parsed = parseFinancialMessage({
          id: message.id,
          from: header(message, 'from'),
          subject: header(message, 'subject'),
          body: readPlainText(message.payload ?? {}) || readHtmlText(message.payload ?? {}) || message.snippet || '',
          date,
        });
        if (parsed) candidates.push(parsed);
      }
    }

    return { candidates, scannedIds: ids, scanned: ids.length, truncated: Boolean(nextPage) };
  },
};
