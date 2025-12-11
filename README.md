# Celestial Journey - Astrology Website

A modern astrology website with user authentication, birth chart storage, and Google OAuth login built with Next.js 15, Tailwind CSS, and Supabase.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd astrology-website
npm install
```

### 2. Set Up Supabase (Free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Once your project is ready, go to **Settings > API**
4. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

Update the `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `database-schema.sql`
3. Click **Run** to create all tables and policies

### 5. Enable Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Configure the OAuth consent screen
6. Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**

In Supabase:
1. Go to **Authentication > Providers**
2. Enable **Google**
3. Paste your Client ID and Client Secret
4. Save

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the website.

## 📁 Project Structure

```
astrology-website/
├── app/
│   ├── actions/
│   │   └── auth.ts              # Server actions for authentication
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts         # OAuth callback handler
│   │   └── signout/
│   │       └── route.ts         # Sign out handler
│   ├── birth-details/
│   │   └── new/
│   │       └── page.tsx         # Add birth details form
│   ├── dashboard/
│   │   └── page.tsx             # User dashboard
│   ├── signup/
│   │   └── page.tsx             # Signup page
│   ├── verify-email/
│   │   └── page.tsx             # Email verification page
│   ├── layout.tsx
│   └── page.tsx                 # Landing page
├── components/
│   └── SignupForm.tsx           # Signup form component
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   ├── server.ts            # Server Supabase client
│   │   └── middleware.ts        # Auth middleware helpers
│   └── validations/
│       └── auth.ts              # Zod validation schemas
├── middleware.ts                 # Next.js middleware for auth
├── database-schema.sql          # SQL schema for Supabase
└── .env.local                   # Environment variables
```

## 🗄️ Database Schema

### Tables

1. **profiles** - User profile information
   - Linked to Supabase auth.users
   - Stores full name and phone number

2. **birth_details** - Birth information for charts
   - Date, time, and place of birth
   - Supports multiple profiles per user

3. **astrology_charts** - Generated charts
   - Stores chart type and calculated data as JSON
   - Links to birth details

### Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- View their own data
- Insert data for themselves
- Update their own data
- Delete their own data

## 🔐 Authentication Features

- Email/Password signup with validation
- Google OAuth integration
- Email verification
- Secure session management
- Protected routes via middleware

## 🎨 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Language**: TypeScript

## 🆓 All Technologies Used Are Free

- ✅ Next.js - Open source
- ✅ Tailwind CSS - Open source
- ✅ Supabase - Free tier includes:
  - 500MB database
  - 50,000 monthly active users
  - 2GB file storage
  - Unlimited API requests
- ✅ Vercel - Free hosting for Next.js
- ✅ Google OAuth - Free

## 🚀 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

---

Built with ✨ cosmic energy and modern web technologies
