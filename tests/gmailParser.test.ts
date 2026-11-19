import assert from 'node:assert/strict';
import test from 'node:test';
import { parseFinancialMessage } from '../src/utils/gmailParser.ts';

test('detects a Colombian card purchase without confusing the balance with the charge', () => {
  const result = parseFinancialMessage({
    id: 'message-1',
    from: 'Banco Ejemplo <alertas@banco.example>',
    subject: 'Compra con tu tarjeta',
    body: 'Realizaste una compra por $45.900 en Tienda Norte. Saldo disponible $1.200.000.',
    date: '2026-11-07',
  });

  assert.equal(result?.amount, 45900);
  assert.equal(result?.kind, 'expense');
  assert.equal(result?.sender, 'alertas@banco.example');
  assert.equal(result?.autoSaveEligible, true);
});

test('detects an incoming transfer', () => {
  const result = parseFinancialMessage({
    id: 'message-2',
    from: 'notificaciones@banco.example',
    subject: 'Transferencia recibida',
    body: 'Recibiste una transferencia de COP 250.000,00 hoy.',
    date: '2026-11-07',
  });

  assert.equal(result?.amount, 250000);
  assert.equal(result?.kind, 'income');
});

test('leaves ambiguous amounts for human review', () => {
  const result = parseFinancialMessage({
    id: 'message-3',
    from: 'tienda@example.com',
    subject: 'Tu recibo',
    body: 'Producto A $10.000. Producto B $20.000.',
    date: '2026-11-07',
  });

  assert.equal(result?.amount, null);
  assert.equal(result?.kind, null);
  assert.equal(result?.autoSaveEligible, false);
});

test('a generic purchase subject remains manual review', () => {
  const result = parseFinancialMessage({
    id: 'message-6',
    from: 'alertas@banco.example',
    subject: 'Compra',
    body: 'Compra por $45.900.',
    date: '2026-11-07',
  });
  assert.equal(result?.kind, 'expense');
  assert.equal(result?.autoSaveEligible, false);
});

test('ignores unrelated mail', () => {
  const result = parseFinancialMessage({
    id: 'message-4',
    from: 'amigo@example.com',
    subject: 'Nos vemos mañana',
    body: 'Hola, ¿cómo estás?',
    date: '2026-11-07',
  });

  assert.equal(result, null);
});

test('never auto-classifies a rejected or pending purchase', () => {
  const result = parseFinancialMessage({
    id: 'message-5',
    from: 'alertas@banco.example',
    subject: 'Compra rechazada',
    body: 'Tu compra por $45.900 fue rechazada.',
    date: '2026-11-07',
  });

  assert.equal(result, null);
});

test('ignores an unpaid invoice even when it includes an amount', () => {
  const result = parseFinancialMessage({
    id: 'invoice', from: 'facturas@servicio.example', subject: 'Tu factura está disponible',
    body: 'Tienes un pago pendiente de $82.000. Vence el viernes.', date: '2026-11-07',
  });
  assert.equal(result, null);
});

test('ignores promotional mail mentioning a purchase price', () => {
  const result = parseFinancialMessage({
    id: 'offer', from: 'ofertas@tienda.example', subject: 'Oferta en tu próxima compra',
    body: 'Compra hoy por $45.900 y recibe un descuento.', date: '2026-11-07',
  });
  assert.equal(result, null);
});

test('marks a confirmed payment with one clear amount as ready', () => {
  const result = parseFinancialMessage({
    id: 'paid', from: 'pagos@servicio.example', subject: 'Pago realizado',
    body: 'Tu pago realizado por $82.000 fue exitoso.', date: '2026-11-07',
  });
  assert.equal(result?.amount, 82000);
  assert.equal(result?.kind, 'expense');
  assert.equal(result?.autoSaveEligible, true);
});

test('does not mark a generic receipt as ready without payment evidence', () => {
  const result = parseFinancialMessage({
    id: 'receipt', from: 'recibos@tienda.example', subject: 'Tu recibo',
    body: 'Producto A $10.000.', date: '2026-11-07',
  });
  assert.equal(result?.autoSaveEligible, false);
});

test('ignores a newsletter with a price and generic success language', () => {
  const result = parseFinancialMessage({
    id: 'newsletter', from: 'news@tienda.example', subject: 'Novedades para ti',
    body: 'Compra hoy por $45.900. Tu experiencia será exitosa.', date: '2026-11-07',
  });
  assert.equal(result, null);
});

test('keeps a generic bank subject when the body confirms a transaction', () => {
  const result = parseFinancialMessage({
    id: 'bank', from: 'alertas@banco.example', subject: 'Alertas y Notificaciones',
    body: 'Realizaste una compra por $45.900 en Tienda Norte.', date: '2026-11-07',
  });
  assert.equal(result?.kind, 'expense');
  assert.equal(result?.autoSaveEligible, true);
});

test('keeps a neutral electronic invoice for review without assuming it was paid', () => {
  const result = parseFinancialMessage({
    id: 'invoice-review', from: 'facturacion@tienda.example', subject: 'Factura electrónica',
    body: 'Factura emitida. Total $99.000.', date: '2026-11-07',
  });
  assert.equal(result?.amount, 99000);
  assert.equal(result?.kind, null);
  assert.equal(result?.autoSaveEligible, false);
});
