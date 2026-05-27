import { LogOut, Moon, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { canInstall, installApp } = useInstallPrompt();
  const fullName = user?.user_metadata.full_name as string | undefined;

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1>Ajustes</h1>
      </header>

      <section className={styles.section}>
        <h2>Cuenta</h2>
        <div className={styles.row}>
          <span>Nombre</span>
          <strong>{fullName || 'Usuario FinanFlow'}</strong>
        </div>
        <div className={styles.row}>
          <span>Correo</span>
          <strong>{user?.email ?? 'Sin correo'}</strong>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Aplicacion</h2>
        {canInstall ? (
          <button className={styles.actionRow} onClick={installApp}>
            <Smartphone size={20} />
            <span>Instalar como app</span>
          </button>
        ) : (
          <div className={styles.note}>La instalación estará disponible desde el navegador del celular.</div>
        )}
        <div className={styles.actionRow}>
          <Moon size={20} />
          <span>Tema oscuro</span>
          <b>Pronto</b>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Datos</h2>
        <button className={`${styles.actionRow} ${styles.danger}`} onClick={logout}>
          <LogOut size={20} />
          <span>Cerrar sesion</span>
        </button>
      </section>
    </div>
  );
}
