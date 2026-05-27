import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './RouteState.module.css';

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className={styles.state}>Cargando sesion...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
