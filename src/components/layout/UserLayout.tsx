import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, CheckCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { CATEGORIES } from '@/constants/categories';

export default function UserLayout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LANDING);
  };

  const currentCategory = CATEGORIES.find(c => c.id === user?.category);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#eef6ff_0%,_#f7fbff_100%)] flex justify-center">
      <div className="w-full max-w-[430px] bg-white/82 min-h-screen shadow-[0_18px_55px_rgba(15,23,42,0.08)] relative flex flex-col backdrop-blur-xl border-x border-white/80">
        {/* Header */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white/88 sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
              SV
            </div>
            <span className="font-semibold text-gray-900">SecureVote</span>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              {currentCategory && (
                <Badge variant="brand" className="hidden xs:inline-flex">
                  {currentCategory.emoji} {currentCategory.label}
                </Badge>
              )}
              <Avatar src={user.photoURL} fallback={user.name || 'U'} size="sm" />
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 w-full max-w-[430px] bg-white/90 border-t border-gray-200 pb-safe z-20 backdrop-blur-xl">
          <div className="flex items-center justify-around h-16">
            <NavLink
              to={ROUTES.USER_HOME}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <Home className="h-6 w-6" />
              <span className="text-[10px] font-medium">Home</span>
            </NavLink>
            <NavLink
              to={ROUTES.MY_VOTES}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <CheckCircle className="h-6 w-6" />
              <span className="text-[10px] font-medium">My Votes</span>
            </NavLink>
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-red-500 hover:text-red-700"
            >
              <LogOut className="h-6 w-6" />
              <span className="text-[10px] font-medium">Sign Out</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
