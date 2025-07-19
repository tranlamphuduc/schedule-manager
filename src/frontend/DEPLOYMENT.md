# Deployment Guide - Schedule Manager Frontend

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub repository
- Vercel account
- Supabase project setup

### Step 1: Prepare Repository
1. Push your code to GitHub
2. Ensure all environment variables are configured

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `src/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Environment Variables
Add these environment variables in Vercel Dashboard:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app/api
NEXT_PUBLIC_SUPABASE_URL=https://jjiuhtbsltrxjdaxgfvs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_NAME=Schedule Manager
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `https://your-app.vercel.app`

## 🔧 Local Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 📝 Notes
- The app uses Next.js App Router
- API calls are configured to work with both local backend and deployed backend
- Supabase is used for database operations
- All environment variables must be prefixed with `NEXT_PUBLIC_` for client-side access

## 🐛 Troubleshooting
- Check environment variables are correctly set
- Ensure Supabase project is accessible
- Verify API endpoints are working
- Check browser console for errors
