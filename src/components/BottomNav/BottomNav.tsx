import { NavLink } from 'react-router-dom';
import { navItems } from '../../routes/navItems';
import styles from './BottomNav.module.css';

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navegacion principal">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            to={item.path}
          >
            <Icon size={22} strokeWidth={2.3} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
