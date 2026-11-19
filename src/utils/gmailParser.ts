export interface GmailMessageInput {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
}

export interface ParsedFinancialMessage {
  id: string;
  sender: string;
  subject: string;
  title: string;
  amount: number | null;
  kind: 'expense' | 'income' | null;
  date: string;
  autoSaveEligible: boolean;
}

const moneyPattern = /(?:\bCOP\s*|\$\s*)(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?)/gi;
const financialWords = /\b(compra|compraste|recibo|comprobante|pago|pagaste|transferencia|transaccion|abono|consignacion|deposito|factura|nomina|reembolso)\b/;
const financialSubject = /\b(compra|recibo|comprobante|factura|pago|transferencia|transaccion|abono|consignacion|deposito|nomina|reembolso)\b/;
const expenseWords = /\b(compra|compraste|pagaste|pago realizado|debito|cargo)\b/;
const incomeWords = /\b(recibiste|recibida|abono|consignacion|deposito|nomina|reembolso)\b/;
const uncertainWords = /\b(rechazad[ao]|cancelad[ao]|pendiente|recordatorio|intento|intento fallido|por pagar|vencid[ao])\b/;
const completedTransaction = /\b(?:realizaste\s+(?:una?\s+)?(?:compra|transferencia|pago)|(?:compra|pago|transferencia|transaccion|abono|reembolso)\s+(?:realizad[ao]|aprobad[ao]|exitos[ao]|recibid[ao])|pagaste|compraste|recibiste\s+(?:una?\s+)?(?:transferencia|pago|abono))\b/;

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function parseAmount(raw: string) {
  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  const lastSeparator = Math.max(lastComma, lastDot);
  const hasDecimals = lastSeparator >= 0 && raw.length - lastSeparator - 1 === 2;
  const digits = raw.replace(/\D/g, '');
  const value = Number(digits) / (hasDecimals ? 100 : 1);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function parseFinancialMessage(message: GmailMessageInput): ParsedFinancialMessage | null {
  const normalizedSubject = normalize(message.subject);
  const normalized = normalize(`${message.subject} ${message.body}`);
  if (!financialWords.test(normalized) || uncertainWords.test(normalized) ||
      /\b(oferta|promocion|descuento|cupon|proxima compra)\b/.test(normalizedSubject)) return null;
  const confirmed = completedTransaction.test(normalized.slice(0, 1200));
  if (!financialSubject.test(normalizedSubject) && !confirmed) return null;

  const matches = [...message.body.matchAll(moneyPattern)]
    .map((match) => ({ amount: parseAmount(match[1]), index: match.index ?? 0 }))
    .filter((match): match is { amount: number; index: number } => match.amount !== null);

  const contextual = matches.filter(({ index }) => {
    const before = normalize(message.body.slice(Math.max(0, index - 35), index));
    return /(?:compra|pago|transferencia|abono|consignacion|deposito|recibo|total|por|de)\s*$/.test(before);
  });
  const amount = contextual.length === 1 ? contextual[0].amount : matches.length === 1 ? matches[0].amount : null;
  const expense = expenseWords.test(normalized);
  const income = incomeWords.test(normalized);
  const kind = expense === income ? null : expense ? 'expense' : 'income';
  const autoSaveEligible = amount !== null && kind !== null && confirmed;
  const sender = (message.from.match(/<([^>]+)>/)?.[1] ?? message.from).trim().toLowerCase();

  return {
    id: message.id,
    sender,
    subject: message.subject.trim() || 'Movimiento detectado',
    title: message.subject.trim() || 'Movimiento detectado',
    amount,
    kind,
    date: message.date,
    autoSaveEligible,
  };
}
