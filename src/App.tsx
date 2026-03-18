import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { onAuthChange, getUserProfile } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

// Pages
import Landing           from '@/pages/Landing';
import AdminLogin        from '@/pages/AdminLogin';
import VoterRegistration from '@/pages/VoterRegistration';
import UserHome          from '@/pages/user/Home';
import ElectionDetail    from '@/pages/user/ElectionDetail';
import VoteConfirm       from '@/pages/user/VoteConfirm';
import MyVotes           from '@/pages/user/MyVotes';
import AdminDashboard    from '@/pages/admin/Dashboard';
import AdminElections    from '@/pages/admin/Elections';
import CreateElection    from '@/pages/admin/CreateElection';
import AdminCandidates   from '@/pages/admin/Candidates';
import AddCandidate      from '@/pages/admin/AddCandidate';
import AdminVoters       from '@/pages/admin/Voters';
import AdminResults      from '@/pages/admin/Results';

// Route guards
import UserRoute  from '@/components/layout/UserRoute';
import AdminRoute from '@/components/layout/AdminRoute';
import LoadingPage from '@/components/shared/LoadingPage';

export default function App() {
  const { setUser, setLoading, loading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.uid);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to resolve authenticated user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [setUser, setLoading]);

  if (loading) return <LoadingPage />;

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <Routes>
        {/* Public */}
        <Route path={ROUTES.LANDING}           element={<Landing />} />
        <Route path={ROUTES.ADMIN_LOGIN}       element={<AdminLogin />} />
        <Route path={ROUTES.VOTER_REGISTER}    element={<VoterRegistration />} />

        {/* Voter (protected) */}
        <Route element={<UserRoute />}>
          <Route path={ROUTES.USER_HOME}       element={<UserHome />} />
          <Route path={ROUTES.ELECTION_DETAIL} element={<ElectionDetail />} />
          <Route path={ROUTES.VOTE_CONFIRM}    element={<VoteConfirm />} />
          <Route path={ROUTES.MY_VOTES}        element={<MyVotes />} />
        </Route>

        {/* Admin (protected) */}
        <Route element={<AdminRoute />}>
          <Route path={ROUTES.ADMIN_DASHBOARD}       element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_ELECTIONS}       element={<AdminElections />} />
          <Route path={ROUTES.ADMIN_CREATE_ELECTION} element={<CreateElection />} />
          <Route path={ROUTES.ADMIN_CANDIDATES}      element={<AdminCandidates />} />
          <Route path={ROUTES.ADMIN_ADD_CANDIDATE}   element={<AddCandidate />} />
          <Route path={ROUTES.ADMIN_VOTERS}          element={<AdminVoters />} />
          <Route path={ROUTES.ADMIN_RESULTS}         element={<AdminResults />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
