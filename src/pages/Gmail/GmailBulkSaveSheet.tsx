import { Check } from 'lucide-react';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet';
import styles from './GmailPage.module.css';

interface GmailBulkSaveSheetProps {
  open: boolean;
  count: number;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function GmailBulkSaveSheet({ open, count, busy, onClose, onConfirm }: GmailBulkSaveSheetProps) {
  return (
    <BottomSheet open={open} title="Guardar movimientos claros" onClose={busy ? () => undefined : onClose}>
      <div className={styles.bulkConfirm}>
        <p>Se añadirán {count} movimientos a tus finanzas con la categoría “Otros”. Revisa los importes de la lista antes de continuar; luego podrás editar cada movimiento.</p>
        <button className={styles.primaryButton} onClick={onConfirm} disabled={busy || count === 0}>
          <Check size={18} /> {busy ? 'Guardando...' : `Guardar ${count} movimientos`}
        </button>
        <button className={styles.secondaryButton} onClick={onClose} disabled={busy}>Cancelar</button>
      </div>
    </BottomSheet>
  );
}
