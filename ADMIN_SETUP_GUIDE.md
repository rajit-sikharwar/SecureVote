# 🔐 SecureVote Admin Setup Guide

Follow these steps in exact order to set up admin access and admin management.

## 🚨 IMPORTANT: Complete Database Setup First

### Step 1: Run Database Migration
1. Go to [supabase.com](https://supabase.com) → Your Project → **SQL Editor**
2. Copy and paste the ENTIRE content of `supabase/migration_to_student_system.sql`
3. Click **Run** and wait for completion
4. ✅ You should see "Success. No rows returned" or similar

### Step 2: Set Up Initial Admin Users
1. Still in Supabase SQL Editor
2. Copy and paste the ENTIRE content of `supabase/setup_admin.sql`
3. **BEFORE running**: Update these emails in the script:
   ```sql
   -- Line 11: Change to your email
   'admin@securevote.com' → 'your-email@domain.com'

   -- Line 29: Change to your email
   'sikha@college.edu' → 'your-actual-email@domain.com'

   -- Line 65: Change to your email
   'admin@securevote.com' → 'your-email@domain.com'
   ```
4. Click **Run**
5. ✅ You should see admin credentials displayed at the bottom

## 🎯 Step 3: Test Admin Login

### Login as Admin:
1. Go to `localhost:5174/admin/login`
2. **Email**: `your-email@domain.com` (the one you set)
3. **Password**: `any-password` (Supabase allows any password for development)
4. ✅ You should reach the admin dashboard

### Alternative Login Methods:
If the above doesn't work, try these options:

**Option A - Use Default Admin:**
- Email: `admin@securevote.com`
- Password: `password123` (or any password)

**Option B - Create Admin via Supabase Auth:**
1. Go to Supabase → Authentication → Users
2. Click "Add User"
3. Create user with your email
4. Then run this SQL to make them admin:
```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@domain.com';
```

## 🔧 Step 4: Add New Admins

Once logged in as admin:

### Method 1 - Via Admin Panel (Recommended):
1. Go to Admin Dashboard → **"Admins"** tab in navigation
2. Click **"Add New Admin"**
3. Fill in email, name, phone
4. Click **"Create Admin"**
5. ✅ New admin can login with their email and any password

### Method 2 - Via Database (Manual):
Run this in Supabase SQL Editor:
```sql
SELECT public.add_admin_user(
  admin_email := 'newadmin@college.edu',
  admin_name := 'New Admin Name',
  admin_phone := '+1234567890',
  college_name := 'Your College Name'
);
```

### Method 3 - Promote Existing Student:
```sql
SELECT public.promote_to_admin(user_email := 'existing-user@college.edu');
```

## ✅ Verification Checklist

- [ ] Database migrated successfully
- [ ] Admin user created
- [ ] Can login to admin panel at `/admin/login`
- [ ] Admin navigation shows: Dashboard, Elections, Candidates, Students, **Admins**, Results
- [ ] Can access "Manage Administrators" page
- [ ] Can add new admin users
- [ ] Students can register and login normally

## 🎉 You're All Set!

### Default Admin Credentials:
- **Email**: `admin@securevote.com` or your email
- **Password**: `any-password` (use anything)
- **URL**: `localhost:5174/admin/login`

### Admin Features Available:
- ✅ **Responsive Admin Dashboard** (desktop + mobile)
- ✅ **Election Management** (create, view, delete)
- ✅ **Candidate Management** (add, filter, remove)
- ✅ **Student Management** (view all students)
- ✅ **Admin Management** (add/remove admins) 🆕
- ✅ **Results & Analytics** (real-time voting data)

### Student Features:
- ✅ **Responsive Student Dashboard** (desktop + mobile)
- ✅ **Election Voting** (course/year/section specific)
- ✅ **Voting History** (receipt tracking)
- ✅ **Academic Profile** (course info, stats)

## 🚨 Troubleshooting

### "Build Errors" - Database Schema Mismatch:
- Run the migration script first
- Some TypeScript errors will resolve after database is updated

### "Cannot Login as Admin":
1. Check if admin user exists: `SELECT * FROM users WHERE role = 'admin';`
2. Create manually if needed: `INSERT INTO users (id, email, full_name, role) VALUES (gen_random_uuid(), 'admin@test.com', 'Admin', 'admin');`
3. Try different password or check Supabase Auth settings

### "Admin Management Page Not Found":
- Make sure you've updated all files as instructed
- Restart the dev server: `npm run dev`
- Check console for any import errors

---

🎯 **Your SecureVote platform is now fully configured with responsive design, complete admin management, and multi-device support!**