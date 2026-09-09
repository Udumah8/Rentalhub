# Aba Rentals — MVP

A mobile-first rental listings marketplace for long-term housing in Aba, Nigeria. Landlords list properties, renters browse and contact landlords directly via WhatsApp. Admin approves listings before they go public.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local .env.local
# Edit .env.local with your Supabase project URL and anon key

# 3. Run the SQL schema
# In Supabase SQL Editor, paste the contents of database/schema.sql

# 4. Start dev server
npm run dev
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database/Storage**: Supabase (PostgreSQL + Auth + Storage)
- **Validation**: Zod

## Project Structure

```
app/                  # Next.js pages
├── layout.tsx        # Root layout
├── page.tsx          # Homepage with listings
├── listing/[id]/     # Listing detail
├── auth/             # Login / Signup
├── landlord/         # Landlord dashboard
│   ├── dashboard/
│   ├── listings/new/
│   └── listings/[id]/edit/
└── admin/            # Admin panel
    ├── listings/
    ├── landlords/
    └── stats/

components/           # Reusable components
lib/                  # Supabase clients + types
database/             # SQL schema
```

## Deployment

Deploy to Vercel:
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

## First Admin Setup

After setting up Supabase, add your email as an admin:

```sql
INSERT INTO public.admin_users (id, email)
SELECT id, 'your-email@example.com'
FROM auth.users
WHERE email = 'your-email@example.com';
```