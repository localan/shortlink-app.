# URL Shortener dengan Vite React + Cloudflare D1

URL Shortener modern menggunakan **Vite + React** untuk frontend dan **Cloudflare Workers + D1** untuk backend database.

## 🚀 Fitur

**User Features:**
- ✅ **Custom Short URLs** - Tulis short URL sendiri atau auto-generate
- ✅ Shorten URL dengan custom title & description
- ✅ Copy to clipboard
- ✅ Search & filter links
- ✅ Click tracking
- ✅ Responsive design dengan Tailwind CSS

**Admin Features:**
- ✅ **Secure Admin Login** (Password: `Arema123`)
- ✅ **Admin Dashboard** dengan analytics
- ✅ **CRUD Operations** - Create, Read, Update, Delete links
- ✅ **Edit Short URLs** - Ubah short URL yang sudah ada
- ✅ **Analytics Dashboard** - Total links, clicks, statistics
- ✅ **Inline Editing** - Edit links langsung di table
- ✅ **Recent & Top Links** - Monitor performa

**Technical:**
- ✅ Database SQLite gratis dengan Cloudflare D1
- ✅ Deploy ke Vercel (frontend) + Cloudflare Workers (backend)
- ✅ Session management dengan localStorage

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
VITE_ADMIN_PASSWORD=YourSecurePassword123

# Worker (wrangler.toml sudah dikonfigurasi)
ADMIN_PASSWORD=YourSecurePassword123
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Security Note:** 
- Password disimpan di environment variables untuk keamanan
- Gunakan password yang kuat untuk production
- Jangan commit file `.env` ke repository

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
# VITE_API_BASE_URL = https://shortlink-worker.blog-bangundwir.workers.dev
```

**Live Demo:**
- 🌐 **Frontend**: https://link.dwx.my.id
- 🔗 **API**: https://shortlink-worker.blog-bangundwir.workers.dev

## 🔧 Konfigurasi

### Update API Base URL

1. Setelah deploy worker, copy URL worker Anda
2. Update `VITE_API_BASE_URL` di Vercel environment variables
3. Update `ALLOWED_ORIGINS` di `wrangler.toml` dengan domain Anda

**Current CORS Configuration:**
```toml
[env.production.vars]
ALLOWED_ORIGINS = "https://link.dwx.my.id,https://shortlink-app.vercel.app"

[env.development.vars]
ALLOWED_ORIGINS = "http://localhost:3000,https://link.dwx.my.id"
```

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

**Public Endpoints:**
- `GET /api/links` - Get all links
- `POST /api/shorten` - Create short link (random atau custom)
- `GET /api/stats/{short}` - Get link stats
- `GET /{short}` - Redirect to original URL

**API Examples:**
```bash
# Random short URL
curl -X POST /api/shorten \
  -d '{"url":"https://example.com","title":"Example"}'
# Response: {"short":"abc123","isCustom":false}

# Custom short URL
curl -X POST /api/shorten \
  -d '{"url":"https://example.com","customShort":"my-link"}'
# Response: {"short":"my-link","isCustom":true}
```

**Admin Endpoints:**
- `PUT /api/links/{id}` - Update link by ID (termasuk short URL)
- `DELETE /api/links/{id}` - Delete link by ID
- `GET /api/analytics` - Get dashboard analytics

**Edit Short URL Example:**
```bash
# Edit semua field termasuk short URL
curl -X PUT /api/links/1 \
  -d '{"url":"https://example.com","title":"New Title","short":"new-short-url"}'
# Response: {"message":"Link updated successfully"}

# Error jika short URL sudah ada
curl -X PUT /api/links/1 \
  -d '{"url":"https://example.com","short":"existing-url"}'
# Response: {"error":"This short URL is already taken"}
```

**Admin Login:**
- Password: Configurable via `VITE_ADMIN_PASSWORD` (default: `Arema123`)
- Server-side validation dengan fallback client-side
- Session stored in localStorage
- Endpoint: `POST /api/admin/login`

## 🎯 Usage

**User View:**
1. Masukkan URL yang ingin di-shorten
2. Tambahkan title & description (opsional)
3. **Pilih mode Short URL:**
   - **Auto Generate**: Random short URL (e.g., abc123)
   - **Custom**: Tulis short URL sendiri (e.g., my-custom-link)
4. Klik "Shorten URL"
5. Copy short link dengan tombol "Copy"
6. Share short link Anda!

**Admin Dashboard:**
1. Klik tab "Admin Dashboard"
2. Login dengan password (default: `admin123`, bisa diubah di `.env`)
3. Lihat analytics dan statistics
4. **Edit links** dengan klik icon ✏️:
   - Edit URL, title, description
   - **Edit Short URL** - Ubah short code yang sudah ada
   - Validasi real-time untuk format dan duplicate
5. Hapus links dengan klik icon 🗑️
6. Logout dengan tombol "Logout"

**Mengubah Password Admin:**
1. Edit file `.env`: `VITE_ADMIN_PASSWORD=PasswordBaru123`
2. Update `wrangler.toml`: `ADMIN_PASSWORD = "PasswordBaru123"`
3. Deploy ulang worker: `cd worker && pnpm run deploy`
4. Restart frontend development server

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
