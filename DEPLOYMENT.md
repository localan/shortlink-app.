# 🚀 Deployment Guide untuk Domain Custom

## 📋 Prerequisites

1. **Domain**: `link.dwx.my.id` sudah dikonfigurasi di Vercel
2. **Cloudflare Account**: Untuk D1 database dan Workers
3. **Vercel Account**: Untuk frontend hosting

## 🔧 Environment Variables

### Frontend (Vercel Dashboard)
```bash
VITE_API_BASE_URL=https://shortlink-worker.blog-bangundwir.workers.dev
VITE_ADMIN_PASSWORD=Arema123
```

### Worker (wrangler.toml)
```toml
[env.production.vars]
ALLOWED_ORIGINS = "https://link.dwx.my.id,https://shortlink-app.vercel.app,https://shortlink-app-bangundwir.vercel.app"
ADMIN_PASSWORD = "Arema123"
```

## 🚀 Deployment Steps

### Option 1: Automatic Deployment
```bash
# Run deployment script
./deploy.sh
```

### Option 2: Manual Deployment

**1. Deploy Worker:**
```bash
cd worker
pnpm run deploy
cd ..
```

**2. Deploy Frontend:**
```bash
# Build
npm run build

# Deploy to Vercel
npx vercel --prod
```

## 🌐 Domain Configuration

### Vercel Settings
1. **Project Settings** > **Domains**
2. **Add Domain**: `link.dwx.my.id`
3. **Configure DNS** (sudah dilakukan)
4. **SSL Certificate**: Auto-generated

### DNS Configuration (Sudah dikonfigurasi)
```
Type: CNAME
Name: link
Value: cname.vercel-dns.com
```

## 🔗 URLs

- **Production**: https://link.dwx.my.id
- **Worker API**: https://shortlink-worker.blog-bangundwir.workers.dev
- **Admin Login**: https://link.dwx.my.id (tab "Admin Dashboard")

## 🧪 Testing

### 1. Test Frontend
```bash
curl https://link.dwx.my.id
```

### 2. Test API
```bash
# Test worker API
curl https://shortlink-worker.blog-bangundwir.workers.dev/api/links

# Test admin login
curl -X POST https://shortlink-worker.blog-bangundwir.workers.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"Arema123"}'
```

### 3. Test Custom Short URL
```bash
# Create custom short URL
curl -X POST https://shortlink-worker.blog-bangundwir.workers.dev/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","customShort":"test-link"}'

# Test redirect
curl -I https://shortlink-worker.blog-bangundwir.workers.dev/test-link
```

## 🔧 Troubleshooting

### CORS Issues
- Pastikan domain `link.dwx.my.id` ada di `ALLOWED_ORIGINS`
- Redeploy worker setelah update CORS

### Environment Variables
- Check environment variables di Vercel Dashboard
- Pastikan `VITE_API_BASE_URL` pointing ke worker yang benar

### Database Issues
- Check D1 database connection di Cloudflare Dashboard
- Pastikan migrations sudah dijalankan

## 📊 Monitoring

### Cloudflare Analytics
- **Workers**: https://dash.cloudflare.com/workers
- **D1 Database**: https://dash.cloudflare.com/d1

### Vercel Analytics
- **Deployment**: https://vercel.com/dashboard
- **Performance**: Built-in analytics

## 🔄 Updates

### Update Frontend
```bash
# Make changes to src/
npm run build
npx vercel --prod
```

### Update Worker
```bash
# Make changes to worker/src/
cd worker
pnpm run deploy
```

### Update Environment Variables
1. **Vercel**: Dashboard > Settings > Environment Variables
2. **Worker**: Update `wrangler.toml` and redeploy

## 🎯 Features Live

✅ **Custom Short URLs** - `link.dwx.my.id/my-custom-link`
✅ **Admin Dashboard** - Password: `Arema123`
✅ **Analytics** - Real-time click tracking
✅ **CRUD Operations** - Full management
✅ **SSL Certificate** - Auto-generated
✅ **Global CDN** - Vercel Edge Network
✅ **Database** - Cloudflare D1 (gratis)

## 🎉 Success!

Aplikasi URL Shortener sudah live di **https://link.dwx.my.id** dengan semua fitur lengkap!
