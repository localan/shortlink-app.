# URL Shortener dengan Vite React + Cloudflare D1

URL Shortener modern menggunakan **Vite + React** untuk frontend dan **Cloudflare Workers + D1** untuk backend database.

## 🚀 Fitur

- ✅ Shorten URL dengan custom title & description
- ✅ Copy to clipboard
- ✅ Search & filter links
- ✅ Click tracking
- ✅ Responsive design dengan Tailwind CSS
- ✅ Database SQLite gratis dengan Cloudflare D1
- ✅ Deploy ke Vercel (frontend) + Cloudflare Workers (backend)

## 🛠️ Tech Stack

**Frontend:**
- Vite + React
- Tailwind CSS
- Axios untuk API calls
- React Hot Toast untuk notifications
- Lucide React untuk icons

**Backend:**
- Cloudflare Workers
- Cloudflare D1 (SQLite database)
- CORS enabled

## 📋 Setup Instructions

### 1. Clone & Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install worker dependencies
cd worker
npm install
```

### 2. Setup Cloudflare D1 Database

```bash
cd worker

# Login ke Cloudflare
npx wrangler login

# Buat D1 database
npx wrangler d1 create shortlink-db

# Copy database ID ke wrangler.toml
# Ganti "your-database-id-here" dengan ID yang muncul

# Run migrations
npx wrangler d1 migrations apply shortlink-db --local
npx wrangler d1 migrations apply shortlink-db
```

### 3. Environment Variables

```bash
# Frontend (.env)
VITE_API_BASE_URL=https://your-worker.your-subdomain.workers.dev

# Worker (wrangler.toml sudah dikonfigurasi)
```

### 4. Development

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Worker
cd worker
npm run dev
```

Frontend: http://localhost:3000
Worker: http://localhost:8787

### 5. Deployment

**Deploy Cloudflare Worker:**
```bash
cd worker
npm run deploy
```

**Deploy Frontend ke Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable di Vercel dashboard:
# VITE_API_BASE_URL = https://your-worker.your-subdomain.workers.dev
```

## 🔧 Konfigurasi

### Update API Base URL

1. Setelah deploy worker, copy URL worker Anda
2. Update `VITE_API_BASE_URL` di Vercel environment variables
3. Update `ALLOWED_ORIGINS` di `wrangler.toml` dengan domain Vercel Anda

### Database Schema

```sql
CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  clicks INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📡 API Endpoints

- `GET /api/links` - Get all links
- `POST /api/shorten` - Create short link
- `GET /api/stats/{short}` - Get link stats
- `GET /{short}` - Redirect to original URL

## 🎯 Usage

1. Masukkan URL yang ingin di-shorten
2. Tambahkan title & description (opsional)
3. Klik "Shorten URL"
4. Copy short link dengan tombol "Copy"
5. Share short link Anda!

## 💰 Biaya

- **Cloudflare D1**: 5GB storage gratis + 25 juta read/hari
- **Cloudflare Workers**: 100,000 requests/hari gratis
- **Vercel**: Hosting frontend gratis
- **Total: GRATIS** untuk usage normal!

## 🔍 Troubleshooting

**Error CORS:**
- Pastikan `ALLOWED_ORIGINS` di wrangler.toml sudah benar
- Check domain frontend sudah sesuai

**Database error:**
- Pastikan migrations sudah di-run
- Check database ID di wrangler.toml

**Build error:**
- Pastikan semua dependencies ter-install
- Check Node.js version (recommend 18+)

## 📝 License

MIT License - feel free to use untuk project pribadi atau komersial!

---

**Happy URL Shortening! 🎉**
# shortlink-app.
