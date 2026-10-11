import { ClipboardList, ListChecks } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import StaffLayout from './StaffLayout';

export default function KitchenLayout() {
  const { orders } = useApp();
  const newCount = orders.filter((o) => o.status === 'placed').length;
  const links = [
    { to: '/kitchen', label: 'Orders', icon: ClipboardList, end: true, badge: newCount },
    { to: '/kitchen/availability', label: 'Availability', icon: ListChecks },
  ];
  return <StaffLayout title="Kitchen" home="/kitchen" links={links} />;
}
