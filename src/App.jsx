import { Route, Routes } from 'react-router-dom';
import StudentLayout from './layouts/StudentLayout';
import KitchenLayout from './layouts/KitchenLayout';
import AdminLayout from './layouts/AdminLayout';
import NotFound from './components/NotFound';
import Welcome from './pages/student/Welcome';
import Home from './pages/student/Home';
import Menu from './pages/student/Menu';
import FoodDetails from './pages/student/FoodDetails';
import Checkout from './pages/student/Checkout';
import OrderConfirmation from './pages/student/OrderConfirmation';
import OrderTracking from './pages/student/OrderTracking';
import Orders from './pages/student/Orders';
import Favorites from './pages/student/Favorites';
import Profile from './pages/student/Profile';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import KitchenOrderDetail from './pages/kitchen/KitchenOrderDetail';
import KitchenAvailability from './pages/kitchen/KitchenAvailability';
import AdminOverview from './pages/admin/AdminOverview';
import AdminMenu from './pages/admin/AdminMenu';
import AdminItemForm from './pages/admin/AdminItemForm';
import AdminReports from './pages/admin/AdminReports';
import AdminStaff from './pages/admin/AdminStaff';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <Routes>
      <Route path="welcome" element={<Welcome />} />

      <Route element={<StudentLayout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="menu/:id" element={<FoodDetails />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderTracking />} />
        <Route path="orders/:id/confirmed" element={<OrderConfirmation />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="kitchen" element={<KitchenLayout />}>
        <Route index element={<KitchenDashboard />} />
        <Route path="orders/:id" element={<KitchenOrderDetail />} />
        <Route path="availability" element={<KitchenAvailability />} />
        <Route path="*" element={<NotFound to="/kitchen" label="Back to kitchen" />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="menu/new" element={<AdminItemForm />} />
        <Route path="menu/:id/edit" element={<AdminItemForm />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<NotFound to="/admin" label="Back to admin" />} />
      </Route>
    </Routes>
  );
}
