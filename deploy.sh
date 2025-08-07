#!/bin/bash

echo "🚀 Deploying URL Shortener to Production..."
echo ""

# Deploy Worker
echo "📦 Deploying Cloudflare Worker..."
cd worker
pnpm run deploy
cd ..
echo "✅ Worker deployed!"
echo ""

# Build Frontend
echo "🔨 Building Frontend..."
npm run build
echo "✅ Frontend built!"
echo ""

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod
echo "✅ Frontend deployed!"
echo ""

echo "🎉 Deployment completed!"
echo ""
echo "🔗 Live URL: https://link.dwx.my.id"
echo "🔧 Worker URL: https://shortlink-worker.blog-bangundwir.workers.dev"
echo ""
echo "📋 Next steps:"
echo "1. Update environment variables di Vercel Dashboard jika diperlukan"
echo "2. Test aplikasi di https://link.dwx.my.id"
echo "3. Test admin login dengan password: Arema123"
echo ""
