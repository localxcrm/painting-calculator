# Professional Painting Calculator

A comprehensive business tool for painting contractors to calculate project costs, timelines, material requirements, and generate professional documentation.

## Features

### 🎨 Professional Painting Description Generator
- **Project Type Selection**: Exterior, interior, or both
- **Detailed Service Configuration**: Soft wash, scraping, sanding, priming, patching, crack repair
- **Customizable Areas & Components**: House, shed, deck, garage, fence with trims, siding, windows, etc.
- **Room-by-room Interior Planning**: Detailed breakdown by room components
- **Professional Description Output**: Automatically generates detailed job descriptions
- **One-click Copy**: Easy copying for proposals

### 🧮 Advanced Project Cost Management
- **17-parameter cost estimation** with real-time calculations
- **Multi-dimensional costing**: Labor, materials, commissions, subcontracting
- **Paint Budget Analysis**: Dual calculation for required vs budgeted materials
- **Profit analysis**: Margin calculations, material percentage tracking
- **Real-time Work Order Generation**: Professional documentation with all project details

### 👥 Multi-Tenant System
- **Company isolation** with separate settings and users
- **Role-based access control** (Admin/User)
- **Company-wide defaults** with user-level overrides
- **Admin controls** for centralized pricing management

### ⚙️ Settings Management
- **Two-tier defaults**: Company defaults → User overrides
- **Real-time preview** of effective values
- **Supabase integration** for persistent storage
- **Admin company defaults editor**

### 🔐 Security & Authentication
- **Supabase Auth** integration
- **Row Level Security (RLS)** for data isolation
- **Middleware protection** for routes
- **Automatic admin assignment** for first user

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Frontend**: React 19, TypeScript, Bootstrap 5.3.8
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Icons**: Lucide React
- **Styling**: Bootstrap + Custom CSS

## Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd painting-calculator
npm install
```

### 2. Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Copy the SQL from `supabase-setup.sql`
3. Run it in your Supabase SQL Editor
4. Update your `.env.local` with the project credentials

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and create your first account - you'll automatically become the admin!

## Database Schema

```sql
companies (id, name, domain, settings, status)
├── user_profiles (id→auth.users, company_id, role, settings)
└── projects (id, company_id, user_id, project_data)
```

### Key Features:
- **Row Level Security (RLS)** for data isolation
- **Automatic admin assignment** for first user
- **JSONB settings** for flexible configuration
- **Company-wide defaults** with user overrides

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Main calculator interface
│   ├── settings/          # User preferences + admin
│   ├── admin/             # Admin-only routes
│   └── login/             # Authentication
├── components/            # Reusable UI components
│   ├── Calculator.tsx     # Main calculator logic
│   ├── Dashboard.tsx      # Dashboard layout
│   ├── SettingsForm.tsx   # Settings management
│   └── ErrorBoundary.tsx  # Error handling
├── lib/                   # Utilities and config
│   ├── supabase.ts        # Client-side Supabase
│   ├── supabaseServer.ts  # Server-side Supabase
│   └── config.ts          # Configuration helpers
└── types/                 # TypeScript definitions
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run typecheck    # Run TypeScript checks
npm run clean        # Clean build artifacts
```

## Key Components

### Calculator Logic
The `ProjectData` interface defines 17 numeric parameters covering:
- **Pricing**: Price per sq ft, hourly rates
- **Labor**: Number of painters, hours per day
- **Materials**: Paint coverage, coats, costs
- **Business**: Commissions, margins, subcontracting

### Settings System
- **Company Defaults**: Admin-editable pricing defaults
- **User Overrides**: Personal settings that override company defaults
- **Effective Values**: Computed final values (user → company → hardcoded)
- **Real-time Preview**: Shows saved vs effective values

### Authentication Flow
1. **Middleware** protects dashboard/admin routes
2. **RLS policies** prevent cross-user data access
3. **Automatic redirects** based on auth state
4. **Role-based access** for admin features

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Security Considerations

- ✅ **Row Level Security** implemented
- ✅ **Environment variables** for secrets
- ✅ **Input validation** on forms
- ✅ **HTTPS only** in production
- ⚠️ **Rate limiting** not implemented
- ⚠️ **CSRF protection** relies on Supabase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Business Logic

### Cost Calculations
- **Total Cost**: `pricePerSq × squareFootage`
- **Labor Hours**: `totalCost ÷ hourlyRate`
- **Work Days**: `laborHours ÷ (painters × hoursPerDay)`
- **Paint Needed**: `(sqft ÷ coverage) × coats`
- **Profit Margin**: `(totalCost - expenses) ÷ totalCost × 100`

### Multi-Company Support
- Each company has isolated data
- Admins can set company-wide defaults
- Users inherit company defaults but can override
- First user becomes admin automatically

## Troubleshooting

### Common Issues

**Settings not saving?**
- Check browser console for errors
- Verify Supabase RLS policies are applied
- Ensure user profile exists in database

**Authentication not working?**
- Verify `.env.local` has correct Supabase credentials
- Check Supabase Auth settings
- Ensure email confirmation is disabled (or handle it)

**Build errors?**
- Run `npm run typecheck` to find TypeScript issues
- Run `npm run lint:fix` to fix linting issues
- Clear `.next` folder and rebuild

## License

This project is proprietary software. All rights reserved.

## Support

For support, please contact the development team or create an issue in the repository.
