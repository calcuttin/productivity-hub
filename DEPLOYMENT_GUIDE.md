# Production Deployment Guide

This guide covers deploying your ProductivityHub app to production environments.

## 🎯 Recommended: Vercel + Supabase (Easiest)

### Step 1: Database Setup (Supabase)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create a new project
   - Note your database URL and API keys

2. **Configure Database**
   ```bash
   # Update your .env file with Supabase credentials
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Run Migrations**
   ```bash
   npx prisma db push
   # or
   npx prisma migrate deploy
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```env
   DATABASE_URL=your_supabase_database_url
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-app.vercel.app
   RESEND_API_KEY=your_resend_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

## 🚀 Alternative: Railway (All-in-One)

### Step 1: Setup Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"

3. **Add PostgreSQL Database**
   - Click "New"
   - Select "PostgreSQL"
   - Note the connection URL

### Step 2: Deploy App

1. **Connect Repository**
   - Select your GitHub repo
   - Railway will auto-detect Next.js

2. **Configure Environment**
   ```env
   DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
   NEXTAUTH_SECRET=your_secret_here
   NEXTAUTH_URL=https://your-app.railway.app
   ```

3. **Deploy**
   - Railway will automatically deploy on git push

## 🔧 Alternative: Render

### Step 1: Database Setup

1. **Create PostgreSQL Database**
   - Go to [render.com](https://render.com)
   - Create new PostgreSQL service
   - Note connection details

### Step 2: Deploy Web Service

1. **Create Web Service**
   - Connect GitHub repo
   - Build Command: `npm run build`
   - Start Command: `npm start`

2. **Environment Variables**
   ```env
   DATABASE_URL=your_render_postgres_url
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=https://your-app.onrender.com
   ```

## 📱 Mobile App Deployment

### Option 1: Expo Application Services (EAS)

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Build for Production**
   ```bash
   # For iOS
   eas build --platform ios
   
   # For Android
   eas build --platform android
   ```

4. **Submit to Stores**
   ```bash
   # iOS App Store
   eas submit --platform ios
   
   # Google Play Store
   eas submit --platform android
   ```

### Option 2: Expo Go (Development)

1. **Update API URL**
   ```env
   EXPO_PUBLIC_API_URL=https://your-production-api.com
   ```

2. **Test with Expo Go**
   ```bash
   expo start
   ```

## 🔐 Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```env
# Database
DATABASE_URL=your_production_database_url

# Authentication
NEXTAUTH_SECRET=your_secure_secret_here
NEXTAUTH_URL=https://your-domain.com

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com

# Security
NEXTAUTH_SECURE_COOKIE=true
NEXTAUTH_COOKIE_DOMAIN=your-domain.com

# Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Mobile App Environment

Update `ProductivityHubMobileApp/.env`:

```env
# Production API URL
EXPO_PUBLIC_API_URL=https://your-production-api.com

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true

# Production Settings
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_LOG_LEVEL=error
```

## 🔒 Security Checklist

### Before Deployment

- [ ] **Environment Variables**: All secrets are in environment variables
- [ ] **Database**: Production database is secure and backed up
- [ ] **HTTPS**: SSL certificate is configured
- [ ] **CORS**: Proper CORS settings for mobile app
- [ ] **Rate Limiting**: API rate limiting is enabled
- [ ] **Authentication**: OAuth providers are configured for production
- [ ] **Email**: Email service is configured for production

### Post-Deployment

- [ ] **SSL Certificate**: HTTPS is working
- [ ] **Database Connection**: App can connect to database
- [ ] **Authentication**: Login/signup works
- [ ] **Email**: Notifications are sending
- [ ] **Mobile App**: Can connect to production API
- [ ] **Performance**: App loads quickly
- [ ] **Monitoring**: Error tracking is working

## 📊 Monitoring & Analytics

### Error Tracking

1. **Sentry Setup**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configure Sentry**
   ```javascript
   // next.config.js
   const { withSentryConfig } = require('@sentry/nextjs');

   module.exports = withSentryConfig({
     // your existing config
   }, {
     silent: true,
   });
   ```

### Performance Monitoring

1. **Vercel Analytics** (if using Vercel)
2. **Google Analytics**
3. **Custom Analytics** in your app

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 💰 Cost Estimation

### Monthly Costs (Approximate)

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** | Pro | $20/month |
| **Supabase** | Pro | $25/month |
| **Resend** | Starter | $20/month |
| **Domain** | Custom | $12/year |
| **Total** | | **~$65/month** |

### Free Tier Options

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **Vercel** | ✅ | 100GB bandwidth |
| **Railway** | ❌ | $5/month minimum |
| **Render** | ✅ | 750 hours/month |
| **Supabase** | ✅ | 500MB database |
| **Resend** | ✅ | 3,000 emails/month |

## 🚀 Quick Start Commands

### 1. Prepare for Production

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Test production build
npm start
```

### 2. Database Migration

```bash
# Push schema to production
npx prisma db push --accept-data-loss

# Or run migrations
npx prisma migrate deploy
```

### 3. Deploy

```bash
# Vercel
vercel --prod

# Railway
railway up

# Render
# Use Render dashboard
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database is running
   - Check firewall settings

2. **Authentication Not Working**
   - Verify NEXTAUTH_SECRET
   - Check OAuth provider settings
   - Ensure NEXTAUTH_URL is correct

3. **Mobile App Can't Connect**
   - Check CORS settings
   - Verify API URL in mobile app
   - Test API endpoints directly

4. **Build Failures**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check environment variables

### Debug Commands

```bash
# Check database connection
npx prisma db pull

# Test API endpoints
curl https://your-api.com/api/health

# Check build locally
npm run build && npm start

# Monitor logs
vercel logs
# or
railway logs
```

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Expo Deployment**: [docs.expo.dev/distribution/introduction](https://docs.expo.dev/distribution/introduction)

---

**Ready to deploy?** Choose your preferred platform and follow the step-by-step guide above! 