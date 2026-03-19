import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import AdminLayout from './AdminLayout';

export default function AdminRoute() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to={ROUTES.STUDENT_HOME} replace />;
  }

  return <AdminLayout />;
}