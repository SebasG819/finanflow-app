import { Outlet } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader/AppHeader';
import { BottomNav } from '../components/BottomNav/BottomNav';
import styles from './MobileLayout.module.css';

export function MobileLayout() {
  return (
    <div className={styles.stage}>
      <div className={styles.phone}>
        <AppHeader />
        <main className={styles.content}>
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
