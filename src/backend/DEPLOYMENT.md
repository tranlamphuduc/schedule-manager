# Deployment Guide - Schedule Manager Backend

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub repository
- Vercel account
- Supabase database setup

### Step 1: Prepare Repository
1. Push your backend code to GitHub
2. Ensure all files are committed

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `src/backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### Step 3: Environment Variables
Add these environment variables in Vercel Dashboard:

```bash
# Database Configuration
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.jjiuhtbsltrxjdaxgfvs
DB_PASSWORD=your-supabase-password
DB_NAME=postgres

# Supabase Configuration
SUPABASE_URL=https://jjiuhtbsltrxjdaxgfvs.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NODE_ENV=production
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your API will be available at `https://your-backend.vercel.app`

## 🔧 API Endpoints

Once deployed, your API will be available at:
- **Health Check**: `https://your-backend.vercel.app/health`
- **API Documentation**: `https://your-backend.vercel.app/api-docs`
- **Authentication**: `https://your-backend.vercel.app/api/auth/*`
- **Events**: `https://your-backend.vercel.app/api/events/*`
- **Categories**: `https://your-backend.vercel.app/api/categories/*`
- **Users**: `https://your-backend.vercel.app/api/users/*`
- **Notifications**: `https://your-backend.vercel.app/api/notifications/*`

## 🔄 Update Frontend Configuration

After backend deployment, update frontend environment variables:
```bash
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

## 🐛 Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure Supabase credentials are correct
2. **CORS Errors**: Update allowed origins in server.js
3. **Environment Variables**: Check all required variables are set
4. **Build Errors**: Check package.json and dependencies

### Debugging:
- Check Vercel function logs
- Test API endpoints individually
- Verify database connectivity
- Check environment variable values

## 📝 Notes
- Backend runs as Vercel serverless functions
- Database connections are pooled for efficiency
- All routes are prefixed with `/api/`
- Swagger documentation is available at `/api-docs`
