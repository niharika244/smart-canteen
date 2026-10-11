import { LayoutDashboard, Settings, TrendingUp, Users, UtensilsCrossed } from 'lucide-react';
import StaffLayout from './StaffLayout';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/reports', label: 'Reports', icon: TrendingUp },
  { to: '/admin/staff', label: 'Staff', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  return <StaffLayout title="Admin" home="/admin" links={LINKS} />;
}
