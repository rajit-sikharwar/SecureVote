import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  onAuthChange,
  resolveAuthenticatedUser,
  signOut,
} from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

import UserRoute from '@/components/layout/UserRoute';
import AdminRoute from '@/components/layout/AdminRoute';
import LoadingPage from '@/components/shared/LoadingPage';

const Landing = lazy(() => import('@/pages/Landing'));
const StudentLogin = lazy(() => import('@/pages/StudentLogin'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const StudentRegistration = lazy(() => import('@/pages/StudentRegistration'));
const StudentHome = lazy(() => import('@/pages/user/Home'));
const ElectionDetail = lazy(() => import('@/pages/user/ElectionDetail'));
const VoteConfirm = lazy(() => import('@/pages/user/VoteConfirm'));
const MyVotes = lazy(() => import('@/pages/user/MyVotes'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminElections = lazy(() => import('@/pages/admin/Elections'));
const CreateElection = lazy(() => import('@/pages/admin/CreateElection'));
const AdminCandidates = lazy(() => import('@/pages/admin/Candidates'));
const AddCandidate = lazy(() => import('@/pages/admin/AddCandidate'));
const AdminStudents = lazy(() => import('@/pages/admin/Students'));
const ManageAdmins = lazy(() => import('@/pages/admin/ManageAdmins'));
const AdminResults = lazy(() => import('@/pages/admin/Results'));

export default function App() {
  const { setUser, setLoading, loading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Clear any existing session storage that might persist login state
    localStorage.removeItem('securevote-auth');
    sessionStorage.clear();

    // Only set up auth state change listener, no auto session restore
    const unsubscribe = onAuthChange(async (authUser) => {
      try {
        if (authUser) {
          // Only resolve user if there's an active auth session
          const appUser = await resolveAuthenticatedUser(authUser);
          if (mounted) {
            setUser(appUser);
          }

          if (!appUser) {
            await signOut();
          }
        } else {
          // No auth user, clear state
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to sync auth state:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    // Set loading to false initially since we're not auto-loading anything
    setLoading(false);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setLoading, setUser]);

  if (loading) return <LoadingPage />;

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path={ROUTES.LANDING} element={<Landing />} />
          <Route path={ROUTES.STUDENT_LOGIN} element={<StudentLogin />} />
          <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
          <Route path={ROUTES.STUDENT_REGISTER} element={<StudentRegistration />} />

          <Route element={<UserRoute />}>
            <Route path={ROUTES.STUDENT_HOME} element={<StudentHome />} />
            <Route path={ROUTES.ELECTION_DETAIL} element={<ElectionDetail />} />
            <Route path={ROUTES.VOTE_CONFIRM} element={<VoteConfirm />} />
            <Route path={ROUTES.MY_VOTES} element={<MyVotes />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
            <Route path={ROUTES.ADMIN_ELECTIONS} element={<AdminElections />} />
            <Route path={ROUTES.ADMIN_CREATE_ELECTION} element={<CreateElection />} />
            <Route path={ROUTES.ADMIN_CANDIDATES} element={<AdminCandidates />} />
            <Route path={ROUTES.ADMIN_ADD_CANDIDATE} element={<AddCandidate />} />
            <Route path={ROUTES.ADMIN_STUDENTS} element={<AdminStudents />} />
            <Route path={ROUTES.ADMIN_MANAGE_ADMINS} element={<ManageAdmins />} />
            <Route path={ROUTES.ADMIN_RESULTS} element={<AdminResults />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
