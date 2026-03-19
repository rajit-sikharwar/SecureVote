import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import UserLayout from './UserLayout';

export default function UserRoute() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to={ROUTES.LANDING} replace />;
  }

  if (user.role !== 'student') {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  // Check if student has required academic info
  if (!user.course || !user.year || !user.section) {
    return <Navigate to={ROUTES.LANDING} replace />;
  }

  return <UserLayout />;
}