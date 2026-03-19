# 🚀 SecureVote Database Setup

## 📁 **Optimized SQL Files**

### **1. `complete_setup.sql` ⚡ (MAIN FILE)**
- **Complete database migration and setup**
- **Creates all tables, functions, and admin user**
- **Handles foreign key issues automatically**
- **Run this FIRST and ONLY**

### **2. `sample_data.sql` 📊 (OPTIONAL)**
- **Adds test students, candidates, and elections**
- **Run AFTER complete_setup.sql if you want sample data**
- **Good for testing the system immediately**

---

## 🎯 **Quick Setup Steps**

### **Step 1: Database Setup**
1. Open Supabase SQL Editor
2. Copy entire content of `complete_setup.sql`
3. Paste and run
4. ✅ Should see "SETUP COMPLETE!" message

### **Step 2: Add Sample Data (Optional)**
1. Copy entire content of `sample_data.sql`
2. Paste and run in Supabase SQL Editor
3. ✅ Get instant test students and elections

### **Step 3: Start Development**
```bash
npm run dev
```

### **Step 4: Login**
- **Admin**: `localhost:5174/admin/login`
  - Email: `rjtds47@gmail.com`
  - Password: `any-password`

- **Student**: `localhost:5174` (register or use sample students)

---

## ✅ **What You Get**

### **🏢 Database Tables:**
- ✅ `users` - Students and admins with academic info
- ✅ `elections` - Course/year/section specific elections
- ✅ `candidates` - Election candidates with profiles
- ✅ `votes` - Secure voting records with receipts
- ✅ `audit_logs` - System activity tracking

### **🔧 Database Functions:**
- ✅ `cast_vote_secure()` - Secure voting mechanism
- ✅ `add_admin_user()` - Admin management function

### **👤 Default Admin:**
- ✅ Email: `rjtds47@gmail.com`
- ✅ Role: `admin`
- ✅ Can login immediately

---

## 🔄 **If You Need to Reset**

To completely reset the database:
```sql
-- In Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public AUTHORIZATION postgres;
```
Then run `complete_setup.sql` again.

---

## 🎉 **You're Ready!**

Your SecureVote platform now has:
- ✅ **Responsive design** (desktop + mobile)
- ✅ **Complete admin management**
- ✅ **Student voting system**
- ✅ **Database ready** with all tables and functions
- ✅ **Admin user created** and ready to login