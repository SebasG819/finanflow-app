import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './RouteState.module.css';

export function PublicOnlyRoute() {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <div className={styles.state}>Cargando sesión...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
