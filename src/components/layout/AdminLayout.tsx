import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Vote, Users, UserCheck, BarChart3, Camera, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { signOut, updateCurrentUserPhoto } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { Avatar } from '../ui/Avatar';
import { cn } from '@/lib/cn';
import { toast } from 'react-hot-toast';
import ProfilePictureModal from '@/components/shared/ProfilePictureModal';

const ADMIN_NAV = [
  { name: 'Dashboard',  to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { name: 'Elections',  to: ROUTES.ADMIN_ELECTIONS, icon: Vote },
  { name: 'Candidates', to: ROUTES.ADMIN_CANDIDATES,icon: Users },
  { name: 'Students',   to: ROUTES.ADMIN_STUDENTS, icon: UserCheck },
  { name: 'Admins',     to: ROUTES.ADMIN_MANAGE_ADMINS, icon: Shield },
  { name: 'Results',    to: ROUTES.ADMIN_RESULTS,   icon: BarChart3 },
];

export default function AdminLayout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LANDING);
  };

  /** Called by ProfilePictureModal with the cropped base64 JPEG string. */
  const handleSavePhoto = async (base64: string) => {
    if (!user) return;
    const updatedUser = await updateCurrentUserPhoto(user.uid, base64);
    useAuthStore.getState().setUser(updatedUser);
    toast.success('Profile picture updated!');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.1),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] flex">
      {/* Desktop Sidebar (md+) */}
      <aside className="hidden md:flex flex-col w-[220px] fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
            SV
          </div>
          <span className="font-bold text-lg text-gray-900">Admin Portal</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-2">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-brand-50 text-brand-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            {/* Avatar with camera overlay – opens crop modal */}
            <button
              className="relative group flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              onClick={() => setShowPhotoModal(true)}
              title="Change profile picture"
              aria-label="Change profile picture"
            >
              <Avatar src={user?.photoURL} fallback={user?.fullName || 'A'} size="sm" />
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-full transition-all">
                <Camera className="h-3.5 w-3.5 text-white" />
              </div>
            </button>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[220px] pb-20 md:pb-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-5xl mx-auto h-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar (<md) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe z-30">
        <div className="flex items-center justify-around h-16 pointer-events-auto">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 relative",
                isActive ? "text-brand-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium sm:hidden">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSave={handleSavePhoto}
      />
    </div>
  );
}
