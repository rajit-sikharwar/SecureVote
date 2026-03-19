# SecureVote - College-Level Voting Management Platform

A modern, secure, and scalable student voting platform built for college-level elections. SecureVote enables students to participate in course-specific elections with complete transparency, security, and real-time analytics.

![Built with React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?logo=tailwindcss)

## 🌟 Key Features

### For Students
- ✅ **Complete Academic Registration** - Register with full details (course, year, section, enrollment number, personal info)
- 🎯 **Personalized Dashboard** - View only elections eligible for your course/year/section
- 🗳️ **Secure One-Time Voting** - Database-enforced single vote per election
- ⏰ **Time-Based Elections** - Vote only during active election windows
- 📜 **Vote History** - Track all your participation with detailed records
- 🎨 **Modern 3D UI** - Beautiful interface with animations powered by React Three Fiber

### For Administrators
- 👥 **Student Management** - View and manage all registered students with advanced filtering
- 🎓 **Candidate Profiles** - Create reusable candidate profiles with photos and descriptions
- 📊 **Smart Election Creation** - Set eligibility by course/year/section, select multiple candidates
- 📈 **Real-Time Analytics** - Live vote counts with interactive bar and pie charts
- 🔍 **Comprehensive Dashboard** - Monitor system stats, active elections, and upcoming events
- 🎯 **Flexible Candidate Selection** - Choose from existing candidate profiles when creating elections

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **Material UI (MUI)** - Professional UI components
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Three Fiber** - 3D visualizations
- **Recharts** - Interactive analytics charts

### Backend (Supabaseall services)
- **PostgreSQL** - Powerful relational database
- **Authentication** - Email/password auth
- **Row Level Security (RLS)** - Database-level security
- **Real-time** - Live updates support

### Additional Libraries
- **Zustand** - Lightweight state management
- **React Hook Form** + **Zod** - Form handling with validation
- **React Router** - Client-side routing
- **date-fns** - Date formatting

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd SecureVote
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run `supabase/schema.sql` to create all tables, functions, and security policies

### 5. Create Admin Account

Register through the app, then promote to admin:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

### 6. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173`

## 📚 Project Structure

```
SecureVote/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── shared/      # Shared components (cards, badges, etc.)
│   │   ├── three/       # 3D components (React Three Fiber)
│   │   └── ui/          # Base UI primitives
│   ├── constants/       # App constants (routes, academic data)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Route pages
│   │   ├── admin/       # Admin dashboard pages
│   │   └── user/        # Student pages
│   ├── services/        # API/Supabase services
│   ├── store/           # Zustand state management
│   ├── supabase/        # Supabase client config
│   └── types/           # TypeScript type definitions
├── supabase/
│   ├── schema.sql       # Database schema
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## 🗄️ Database Schema

### Core Tables

#### `users`
Complete student profiles with academic information
- Fields: course, year, section, enrollment_number, phone, address, etc.
- Roles: `student` | `admin`
- Unique constraint on `enrollment_number`

#### `candidates`
Reusable candidate profiles
- Tagged with course/year/section
- Can be used across multiple elections
- Stores photos and descriptions

#### `elections`
Time-based elections with eligibility rules
- Eligibility: `course` + `year` + `section`
- Time window: `start_time` to `end_time`
- Links to multiple candidates via junction table

#### `election_candidates`
Many-to-many relationship between elections and candidates

#### `votes`
Secure vote records
- **Unique constraint**: `(user_id, election_id)` prevents duplicate voting
- References user, election, and candidate

#### `audit_logs`
Tracks all critical system actions for security and monitoring

### Security Functions

#### `cast_vote(user_id, election_id, candidate_id)`
Server-side vote casting with:
- Eligibility verification (course/year/section match)
- Time window validation
- Duplicate vote prevention
- Audit logging

#### `is_admin(user_id)`
Helper function to check admin status

## 🎓 Academic System

### Supported Courses

| Course | Duration | Full Name |
|--------|----------|-----------|
| BCA | 3 years | Bachelor of Computer Applications |
| BBA | 3 years | Bachelor of Business Administration |
| B.Tech | 4 years | Bachelor of Technology |
| MBA | 2 years | Master of Business Administration |
| MCA | 2 years | Master of Computer Applications |
| BA | 3 years | Bachelor of Arts |
| B.Com | 3 years | Bachelor of Commerce |
| M.Tech | 2 years | Master of Technology |

### Validation Rules
- **Year validation**: Automatically limits year selection based on course duration
- **Sections**: A through J
- **Enrollment numbers**: Must be unique across all students

## 🔐 Security Features

### Database-Level Security
- **Row Level Security (RLS)** on all tables
- Students can only view their own data
- Admins have full access
- Vote secrecy maintained (students can't see others' votes)

### Vote Integrity
- Unique constraint prevents duplicate voting
- Time-based access control
- Eligibility verified server-side
- All actions logged to audit trail

### Authentication
- Email/password authentication
- Role-based access control
- Secure session management

## 📊 Analytics & Reporting

### Admin Analytics Include:
- **Live Vote Counts** - Real-time vote tracking
- **Bar Charts** - Visual vote distribution
- **Pie Charts** - Vote share percentages
- **Candidate Rankings** - Sorted by votes with win indicators
- **System Statistics** - Total elections, students, candidates

### Export Capabilities:
Results can be exported through Supabase dashboard or custom queries.

## 🎨 3D Visualizations

The app features interactive 3D elements:

- **Landing Page**: Floating animated cards showcase system features
- **Admin Dashboard**: Interactive 3D card scene with auto-rotation
- **Vote Success**: Celebratory 3D animation on successful vote

Powered by **React Three Fiber** and **@react-three/drei**.

## 🌐 Deployment

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Supabase (Already Hosted)
Your Supabase project is cloud-hosted and ready to use.

### Production Checklist
- ✅ Set environment variables
- ✅ Run database migrations
- ✅ Create admin account
- ✅ Configure allowed redirect URLs in Supabase
- ✅ Test all flows
- ✅ Enable HTTPS
- ✅ Set up monitoring

## 📱 User Workflows

### Student Journey
1. **Register** → Complete academic profile with enrollment number
2. **Sign In** → Email/password authentication
3. **View Elections** → See eligible elections for your course/year/section
4. **Vote** → Select candidate and confirm (one-time, irreversible)
5. **Track History** → View past votes

### Admin Journey
1. **Sign In** → Admin portal access
2. **Create Candidates** → Build reusable candidate profiles
3. **Create Election** → Set eligibility + time window + select candidates
4. **Monitor Results** → Real-time analytics with charts
5. **Manage Students** → View and filter registered students

## 🔧 Configuration

### Adding New Courses

Edit `src/constants/academic.ts`:

```typescript
export const COURSES: CourseInfo[] = [
  {
    id: 'NewCourse',
    label: 'NC',
    duration: 3,
    fullName: 'New Course Name'
  },
  // ... existing courses
];

export const COURSE_DURATION: Record<Course, number> = {
  'NewCourse': 3,
  // ... existing mappings
};
```

Update TypeScript type:
```typescript
export type Course = 'BCA' | 'BBA' | '...' | 'NewCourse';
```

### Customizing UI Colors

Primary colors are defined in `tailwind.config.js`. Update the theme section to change the color scheme.

## 🐛 Troubleshooting

### Database Errors
**Issue**: RLS policy errors
**Solution**: Ensure complete schema migration ran successfully. Check user roles.

### Build Failures
**Issue**: Module not found errors
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables
**Issue**: Supabase connection fails
**Solution**: Verify `.env` contains correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### 3D Rendering Issues
**Issue**: Three.js canvas not rendering
**Solution**: Check browser WebGL support. Update graphics drivers.

## 📖 API Reference

### Key Services

#### `auth.service.ts`
- `registerStudent(data, password)` - Register new student
- `signInStudent(email, password)` - Student login
- `signInAdmin(email, password)` - Admin login

#### `election.service.ts`
- `listElections(filters)` - Get elections with optional filters
- `getActiveElectionsForStudent(course, year, section)` - Get active student elections
- `createElection(data, createdBy)` - Create new election

#### `candidate.service.ts`
- `listAllCandidates()` - Get all candidate profiles
- `createCandidate(data)` - Create candidate profile

#### `vote.service.ts`
- `castVote(userId, electionId, candidateId)` - Submit vote
- `getElectionResults(electionId)` - Get vote counts

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React Team for the amazing framework
- Supabase for the excellent backend platform
- Material UI for professional components
- Pmndrs for React Three Fiber

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check documentation
- Review Supabase docs: [supabase.com/docs](https://supabase.com/docs)

---

**Built with ❤️ for democratic participation in educational institutions.**

**SecureVote** - Modern. Secure. Transparent.
