import { BarChart3, Grid2X2, Target, WalletCards, WalletMinimal } from 'lucide-react';
import type { NavItem } from '../types/finance';

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Grid2X2 },
  { label: 'Gastos', path: '/expenses', icon: WalletMinimal },
  { label: 'Ingresos', path: '/income', icon: WalletCards },
  { label: 'Metas', path: '/goals', icon: Target },
  { label: 'Reportes', path: '/reports', icon: BarChart3 },
];
