import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, CheckCircle, LogOut, GraduationCap, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { getCourseInfo } from '@/constants/academic';
import { cn } from '@/lib/cn';
import { useState } from 'react';

const STUDENT_NAV = [
  { name: 'Dashboard', to: ROUTES.STUDENT_HOME, icon: Home },
  { name: 'My Votes', to: ROUTES.MY_VOTES, icon: CheckCircle },
];

export default function UserLayout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LANDING);
  };

  const courseInfo = user ? getCourseInfo(user.course) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Desktop Sidebar (lg+) */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-20 shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            SV
          </div>
          <span className="font-bold text-lg text-gray-900">SecureVote</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          {STUDENT_NAV.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar src={user.photoURL} fallback={user.fullName || 'U'} size="sm" />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                <div className="flex items-center gap-2">
                  {courseInfo && (
                    <Badge variant="brand" className="text-xs px-2 py-0.5">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {courseInfo.label} Y{user.year}
                    </Badge>
                  )}
                </div>
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
        )}
      </aside>

      {/* Mobile Header & Sidebar Toggle */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              SV
            </div>
            <span className="font-semibold text-gray-900">SecureVote</span>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            {courseInfo && (
              <Badge variant="brand" className="hidden sm:inline-flex">
                <GraduationCap className="h-3 w-3 mr-1" />
                {courseInfo.label} Y{user.year}
              </Badge>
            )}
            <Avatar src={user.photoURL} fallback={user.fullName || 'U'} size="sm" />
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="p-6 flex items-center gap-3 border-b border-gray-100">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                SV
              </div>
              <span className="font-bold text-lg text-gray-900">SecureVote</span>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-6">
              {STUDENT_NAV.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {user && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <Avatar src={user.photoURL} fallback={user.fullName || 'U'} size="sm" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation (sm and below) */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-30 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {STUDENT_NAV.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          ))}
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
  );
}