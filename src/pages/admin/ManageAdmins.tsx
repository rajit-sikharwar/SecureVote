import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserPlus, Shield, Trash2, Check, X } from 'lucide-react';
import { listUsers, deleteUser } from '@/services/user.service';
import { supabase } from '@/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { AppUser } from '@/types';

interface AdminUser extends AppUser {
  is_super_admin?: boolean;
}

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    collegeName: 'SecureVote College',
    password: '' // Add password field
  });
  const [submitting, setSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Generate a secure random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let password = 'Admin@';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    setGeneratedPassword(password);
  };

  const loadAdmins = async () => {
    setLoading(true);
    try {
      // Get all users and filter admins
      const users = await listUsers(1000);
      const adminUsers = users.filter(user => user.role === 'admin');
      setAdmins(adminUsers);
    } catch (error) {
      console.error('Failed to load admins:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName || !formData.password) {
      toast.error('Email, name, and password are required');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Use standard signup to create auth user
      // This works with anon key and auto-creates the auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'admin'
          },
          emailRedirectTo: undefined // Disable email confirmation for now
        }
      });

      if (signUpError) {
        console.error('Auth user creation error:', signUpError);
        throw new Error(signUpError.message);
      }

      if (!signUpData.user) {
        throw new Error('Failed to create authentication user');
      }

      // Wait a moment for auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Call the PostgreSQL function to create admin profile
      const { data, error } = await supabase
        .rpc('add_admin_user' as any, {
          admin_email: formData.email,
          admin_name: formData.fullName,
          admin_phone: formData.phone,
          college_name: formData.collegeName,
          admin_password: formData.password
        });

      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }

      const result = data as any;

      if (result?.success) {
        toast.success(`Admin created successfully!\n\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nIMPORTANT: Save these credentials!`, {
          duration: 10000
        });
        await loadAdmins();
        setShowAddForm(false);
        setFormData({ email: '', fullName: '', phone: '', collegeName: 'SecureVote College', password: '' });
        setGeneratedPassword('');
      } else {
        // If profile creation failed but auth user was created, show special message
        toast.error(`⚠️ Auth user created but profile failed: ${result?.message}\n\nGo to Supabase Dashboard → Authentication → Users to manage.`, {
          duration: 8000
        });
      }
    } catch (error: any) {
      console.error('Error adding admin:', error);
      const errorMsg = error?.message || 'Failed to create admin user';
      
      // Show specific error messages
      if (errorMsg.includes('rate limit')) {
        toast.error('Email rate limit exceeded. Please wait a few minutes and try again.');
      } else if (errorMsg.includes('already registered') || errorMsg.includes('already been registered')) {
        toast.error('A user with this email already exists');
      } else if (errorMsg.includes('User not allowed')) {
        toast.error('Permission denied. This requires admin privileges via Supabase Dashboard.\n\nSee console for instructions.', {
          duration: 8000
        });
        console.log(`
===========================================
ADMIN CREATION INSTRUCTIONS
===========================================

To create an admin user manually:

1. Go to Supabase Dashboard
2. Navigate to: Authentication → Users
3. Click "Add User"
4. Enter:
   - Email: ${formData.email}
   - Password: ${formData.password}
   - Check "Auto Confirm User"
5. Click "Create User"
6. Come back here and retry "Create Admin"

Credentials to use:
Email: ${formData.email}
Password: ${formData.password}
===========================================
        `);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleting) return;

    try {
      await deleteUser(deleting.uid);
      toast.success('Admin user removed successfully');
      await loadAdmins();
      setDeleting(null);
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to remove admin user');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-32 h-10" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Skeleton variant="card" className="h-20" />
          <Skeleton variant="card" className="h-20" />
          <Skeleton variant="card" className="h-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-indigo-600" />
            Manage Administrators
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {admins.length} admin{admins.length !== 1 ? 's' : ''} in the system
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<UserPlus className="h-4 w-4" />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add New Admin
        </Button>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Administrator</h3>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="admin@college.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="flex-1 h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter password or generate"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePassword}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
                {generatedPassword && (
                  <p className="text-xs text-green-600 mt-1">
                    Password generated! Make sure to save it before creating the admin.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College Name
                </label>
                <input
                  type="text"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="College Name"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                leftIcon={<Check className="h-4 w-4" />}
              >
                Create Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                leftIcon={<X className="h-4 w-4" />}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Admin List */}
      {admins.length === 0 ? (
        <EmptyState
          title="No Administrators Found"
          description="Add the first administrator to get started with admin management."
          actionLabel="Add Admin"
          onAction={() => setShowAddForm(true)}
        />
      ) : (
        <div className="space-y-4">
          {admins.map((admin) => (
            <Card key={admin.uid} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={admin.photoURL}
                    fallback={admin.fullName || 'A'}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{admin.fullName}</h3>
                      {admin.is_super_admin && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Super Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                    {admin.phone && (
                      <p className="text-xs text-gray-400">{admin.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    <div className="text-green-600 font-medium">● Admin</div>
                    <div>Since {new Date(admin.createdAt || '').toLocaleDateString()}</div>
                  </div>

                  {!admin.is_super_admin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleting(admin)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteAdmin}
        title="Remove Administrator"
        message={
          <>
            Are you sure you want to remove admin privileges from{' '}
            <strong>{deleting?.fullName}</strong>?
            <br />
            <br />
            This will revoke their administrative access to the system.
          </>
        }
        variant="danger"
        confirmLabel="Remove Admin"
      />

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Admin Management Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Admins can create elections, manage candidates, and view results</li>
              <li>• Super admins cannot be removed and have full system access</li>
              <li>• New admins will be able to login using their email and any password</li>
              <li>• Admin users automatically get access to the admin panel</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}