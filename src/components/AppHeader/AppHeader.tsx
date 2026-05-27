import { Bell, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AppHeader.module.css';

export function AppHeader() {
  const { logout } = useAuth();

  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/dashboard">
        FinanFlow
      </Link>
      <div className={styles.actions}>
        <button className={styles.iconButton} aria-label="Notificaciones">
          <Bell size={21} strokeWidth={2} />
        </button>
        <Link className={styles.iconButton} to="/settings" aria-label="Ajustes">
          <Settings size={20} strokeWidth={2} />
        </Link>
        <button className={styles.iconButton} aria-label="Cerrar sesion" onClick={logout}>
          <LogOut size={20} strokeWidth={2} />
        </button>
        <div className={styles.avatar} aria-label="Perfil" />
      </div>
    </header>
  );
}
