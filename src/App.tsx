import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  getCurrentSession,
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
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const VoterRegistration = lazy(() => import('@/pages/VoterRegistration'));
const UserHome = lazy(() => import('@/pages/user/Home'));
const ElectionDetail = lazy(() => import('@/pages/user/ElectionDetail'));
const VoteConfirm = lazy(() => import('@/pages/user/VoteConfirm'));
const MyVotes = lazy(() => import('@/pages/user/MyVotes'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminElections = lazy(() => import('@/pages/admin/Elections'));
const CreateElection = lazy(() => import('@/pages/admin/CreateElection'));
const AdminCandidates = lazy(() => import('@/pages/admin/Candidates'));
const AddCandidate = lazy(() => import('@/pages/admin/AddCandidate'));
const AdminVoters = lazy(() => import('@/pages/admin/Voters'));
const AdminResults = lazy(() => import('@/pages/admin/Results'));

export default function App() {
  const { setUser, setLoading, loading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      try {
        const session = await getCurrentSession();
        const appUser = await resolveAuthenticatedUser(session?.user ?? null);

        if (mounted) {
          setUser(appUser);
        }

        if (session?.user && !appUser) {
          await signOut();
        }
      } catch (error) {
        console.error('Failed to restore authenticated user profile:', error);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void syncUser();

    const unsubscribe = onAuthChange(async (authUser) => {
      try {
        const appUser = await resolveAuthenticatedUser(authUser);
        setUser(appUser);

        if (authUser && !appUser) {
          await signOut();
        }
      } catch (error) {
        console.error('Failed to sync auth state:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

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
          <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
          <Route path={ROUTES.VOTER_REGISTER} element={<VoterRegistration />} />

          <Route element={<UserRoute />}>
            <Route path={ROUTES.USER_HOME} element={<UserHome />} />
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
            <Route path={ROUTES.ADMIN_VOTERS} element={<AdminVoters />} />
            <Route path={ROUTES.ADMIN_RESULTS} element={<AdminResults />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
