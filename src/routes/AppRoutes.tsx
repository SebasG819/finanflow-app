import { Navigate, Route, Routes } from 'react-router-dom';
import { MobileLayout } from '../layouts/MobileLayout';
import { LoginPage } from '../pages/Auth/LoginPage';
import { RegisterPage } from '../pages/Auth/RegisterPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { ExpensesPage } from '../pages/Expenses/ExpensesPage';
import { GoalsPage } from '../pages/Goals/GoalsPage';
import { IncomePage } from '../pages/Income/IncomePage';
import { ReportsPage } from '../pages/Reports/ReportsPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MobileLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="income" element={<IncomePage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
