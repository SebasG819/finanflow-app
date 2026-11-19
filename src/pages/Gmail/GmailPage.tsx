import { ArrowLeft, Mail, RefreshCw, Trash2, Unplug } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataState } from '../../components/DataState/DataState';
import { PageIntro } from '../../components/PageIntro/PageIntro';
import { useAuth } from '../../context/AuthContext';
import { GmailApi } from '../../services/GmailApi';
import { GmailImportService, type GmailImport, type GmailSenderRule, type SaveGmailImportInput } from '../../services/GmailImportService';
import { selectBulkSaveCandidates } from '../../utils/gmailAutoSave';
import { MAX_GMAIL_MESSAGES_PER_SYNC } from '../../utils/gmailQuota';
import { GmailBulkSaveSheet } from './GmailBulkSaveSheet';
import { GmailImportCard } from './GmailImportCard';
import { GmailReviewSheet } from './GmailReviewSheet';
import styles from './GmailPage.module.css';

export function GmailPage() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(() => user ? GmailApi.getToken(user.id) : null);
  const [imports, setImports] = useState<GmailImport[]>([]);
  const [rules, setRules] = useState<GmailSenderRule[]>([]);
  const [selected, setSelected] = useState<GmailImport | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    GmailApi.preload();
  }, []);

  const refresh = async () => {
    if (!user) return;
    const [nextImports, nextRules] = await Promise.all([
      GmailImportService.getRecent(user.id),
      GmailImportService.getRules(user.id),
    ]);
    setImports(nextImports);
    setRules(nextRules);
  };

  useEffect(() => {
    let active = true;
    if (!user) return;
    Promise.all([GmailImportService.getRecent(user.id), GmailImportService.getRules(user.id)])
      .then(([nextImports, nextRules]) => {
        if (!active) return;
        setImports(nextImports);
        setRules(nextRules);
      })
      .catch((nextError) => active && setError(nextError instanceof Error ? nextError.message : 'No se pudo cargar Gmail.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user]);

  const connect = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      setToken(await GmailApi.connect(user.id));
      setNotice('Gmail conectado. Ya puedes buscar recibos.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo conectar Gmail.');
    } finally {
      setBusy(false);
    }
  };

  const sync = async () => {
    if (!user || !token || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await GmailApi.scan(token);
      const imported = await GmailImportService.ingest(user.id, result.candidates, result.scannedIds);
      await refresh();
      setNotice(`Se revisaron ${result.scanned} correos de los últimos 90 días. ${imported.added} movimientos nuevos; ${imported.filtered} sugerencias anteriores filtradas; ${imported.autoSaved} guardados automáticamente.${result.truncated ? ` Se alcanzó el límite de ${MAX_GMAIL_MESSAGES_PER_SYNC} correos.` : ''}`);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'No se pudo sincronizar Gmail.';
      if (message.includes('venció')) {
        GmailApi.disconnect();
        setToken(null);
      }
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const save = async (input: SaveGmailImportInput, autoSaveSender: boolean) => {
    if (!user || !selected) return;
    await GmailImportService.save(input);
    setSelected(null);
    await refresh();
    if (autoSaveSender) {
      try {
        await GmailImportService.setAutoSave(user.id, selected.sender, true);
        await refresh();
        setNotice(`Movimiento guardado. Los próximos mensajes claros de ${selected.sender} se guardarán al sincronizar.`);
      } catch {
        setNotice('Movimiento guardado, pero no se pudo activar la regla automática.');
      }
    } else {
      setNotice('Movimiento guardado en tus finanzas.');
    }
  };

  const discard = async (item: GmailImport) => {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    try {
      await GmailImportService.discard(user.id, item.id);
      await refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo descartar el mensaje.');
    } finally {
      setBusy(false);
    }
  };

  const saveClear = async () => {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await GmailImportService.saveClearPending(user.id);
      await refresh();
      setBulkOpen(false);
      setNotice(`${result.saved} movimientos guardados.${result.failed ? ` ${result.failed} no se pudieron guardar y quedaron pendientes.` : ''}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudieron guardar los movimientos.');
      setBulkOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const removeRule = async (sender: string) => {
    if (!user || busy) return;
    setBusy(true);
    try {
      await GmailImportService.removeRule(user.id, sender);
      await refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo quitar la regla.');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!token) return;
    setBusy(true);
    try {
      await GmailApi.disconnect();
      setToken(null);
      setNotice('Gmail desconectado. Los movimientos guardados permanecen en FinanFlow.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo desconectar Gmail.');
    } finally {
      setBusy(false);
    }
  };

  const pending = imports.filter((item) => item.status === 'pending');
  const ready = selectBulkSaveCandidates(imports);
  const readyIds = new Set(ready.map((item) => item.id));
  const review = pending.filter((item) => !readyIds.has(item.id));

  return (
    <div className={styles.page}>
      <Link className={styles.back} to="/settings"><ArrowLeft size={18} /> Ajustes</Link>
      <PageIntro title="Movimientos de Gmail" subtitle="Revisa recibos y alertas antes de añadirlos" />

      <section className={styles.panel}>
        <div className={styles.connection}><Mail size={22} /><div><strong>{token ? 'Gmail conectado' : 'Gmail sin conectar'}</strong><span>{token ? 'Conexión temporal hasta recargar o cerrar' : 'Acceso de solo lectura a tus correos'}</span></div></div>
        {!GmailApi.configured ? <p className={styles.note}>La conexión con Google aún no está configurada.</p> : null}
        <div className={styles.actions}>
          {!token ? (
            <button className={styles.primaryButton} onClick={connect} disabled={busy || !GmailApi.configured}>{busy ? 'Conectando...' : 'Conectar Gmail'}</button>
          ) : (
            <>
              <button className={styles.primaryButton} onClick={sync} disabled={busy}><RefreshCw size={18} /> {busy ? 'Buscando...' : 'Sincronizar ahora'}</button>
              <button className={styles.secondaryButton} onClick={disconnect} disabled={busy}><Unplug size={17} /> Desconectar</button>
            </>
          )}
        </div>
        <p className={styles.note}>Se buscan posibles movimientos de los últimos 90 días, hasta {MAX_GMAIL_MESSAGES_PER_SYNC} correos por búsqueda. Nunca se guarda el texto completo del correo.</p>
      </section>

      {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      <section className={styles.listSection}>
        <h2>Listos para guardar <span>{ready.length}</span></h2>
        {loading ? <DataState title="Cargando movimientos..." /> : null}
        {!loading && pending.length === 0 ? <DataState title="Sin movimientos pendientes" message="Conecta Gmail y pulsa Sincronizar ahora para buscar recibos y alertas." /> : null}
        {!loading && ready.length === 0 && pending.length > 0 ? <p className={styles.note}>Sincroniza Gmail para volver a clasificar estos correos. Las facturas sin pago confirmado seguirán por revisar.</p> : null}
        {ready.length > 0 ? <button className={styles.primaryButton} onClick={() => setBulkOpen(true)} disabled={busy}>Guardar {ready.length} movimientos claros</button> : null}
        {ready.map((item) => <GmailImportCard key={item.id} item={item} busy={busy} onReview={setSelected} onDiscard={discard} />)}
      </section>

      {review.length > 0 ? <section className={styles.listSection}>
        <h2>Por revisar <span>{review.length}</span></h2>
        {review.map((item) => <GmailImportCard key={item.id} item={item} busy={busy} onReview={setSelected} onDiscard={discard} />)}
      </section> : null}

      {rules.length > 0 ? (
        <section className={styles.listSection}>
          <h2>Remitentes automáticos</h2>
          {rules.filter((rule) => rule.auto_save).map((rule) => (
            <div className={styles.rule} key={rule.id}><span>{rule.sender}</span><button aria-label={`Quitar automatización de ${rule.sender}`} title="Quitar automatización" onClick={() => removeRule(rule.sender)} disabled={busy}><Trash2 size={17} /></button></div>
          ))}
        </section>
      ) : null}

      <GmailReviewSheet item={selected} onClose={() => setSelected(null)} onSave={save} />
      <GmailBulkSaveSheet open={bulkOpen} count={ready.length} busy={busy} onClose={() => setBulkOpen(false)} onConfirm={saveClear} />
    </div>
  );
}
