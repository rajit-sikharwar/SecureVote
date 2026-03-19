# 🔧 Database Migration Guide

Your database still has the old schema. Follow these steps to update it for the student-focused system.

## 📋 Step-by-Step Instructions

### 1. Open Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to **SQL Editor** in the left sidebar

### 2. Run the Migration Script

1. Copy the entire content of `supabase/migration_to_student_system.sql`
2. Paste it into the SQL Editor
3. Click **Run** button

**This script will:**
- ✅ Safely add new columns to existing users table
- ✅ Create new tables (candidates, elections, etc.)
- ✅ Set up Row Level Security policies
- ✅ Create the secure vote casting function
- ✅ Preserve any existing admin users

### 3. Create Your First Admin Account

After migration, promote yourself to admin:

```sql
-- Replace 'your-email@domain.com' with your actual email
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@domain.com';
```

### 4. Verify Migration

Check if all columns exist:

```sql
-- This should show all the new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY column_name;
```

You should see columns like:
- `address`
- `college_name`
- `course`
- `enrollment_number`
- `year`
- `section`
- etc.

### 5. Test Student Registration

1. Go back to your app: `http://localhost:5174`
2. Try registering as a student
3. Fill in all the academic details
4. Registration should now work! ✅

## 🆘 If You Get Errors

### Error: "relation already exists"
**Solution:** The script handles this automatically with `IF NOT EXISTS` clauses.

### Error: "permission denied"
**Solution:** Make sure you're using the **SQL Editor** in your Supabase dashboard, not a local SQL client.

### Error: "column already exists"
**Solution:** The script handles this automatically with `IF NOT EXISTS` clauses.

## ✅ What This Migration Does

### Before (Old System):
```typescript
// Old user structure
{
  id: string
  email: string
  name: string
  role: 'admin' | 'voter'
  category: 'student' | 'teacher' | 'staff' | 'management'
}
```

### After (New System):
```typescript
// New student structure
{
  id: string
  email: string
  full_name: string
  phone: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  address: string
  college_name: string
  enrollment_number: string (unique)
  roll_number: string
  admission_year: number
  course: 'BCA' | 'B.Tech' | 'MBA' | etc.
  year: 1 | 2 | 3 | 4
  section: 'A' | 'B' | 'C' | etc.
  role: 'student' | 'admin'
}
```

## 🎯 After Migration

Once migration is complete, you can:

1. ✅ **Register students** with complete academic details
2. ✅ **Create candidate profiles** (admin)
3. ✅ **Create elections** by course/year/section (admin)
4. ✅ **Students vote** only in eligible elections
5. ✅ **View real-time results** with charts (admin)

## 🆘 Need Help?

If you encounter any issues:
1. Check the Supabase logs in your dashboard
2. Make sure you copied the entire migration script
3. Verify your Supabase project has the correct permissions

---

**Next:** After successful migration, your SecureVote platform will be fully functional! 🎉