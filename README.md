<p align="center">
  <img src="frontend/public/favicon.svg" width="80" />
  <h1 align="center">Uyuhan Jaya</h1>
  <p align="center">Manajemen Proyek Konstruksi untuk Kontraktor Indonesia</p>
  <p align="center">
    <strong>🏗️ WhatsApp-first · AI-powered · Open Source</strong>
  </p>
</p>

<p align="center">
  <a href="#fitur">Fitur</a> •
  <a href="#demo">Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#cara-pakai">Cara Pakai</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#arsitektur">Arsitektur</a>
</p>

---

## 📋 Fitur

### 👷 Manajemen Proyek
- Buat & kelola proyek konstruksi
- Dashboard visual dengan Recharts (pie chart anggaran, bar chart absensi, pie chart material)

### 📸 Absensi Tukang
- Check-in/out dengan foto selfie dari kamera HP
- QR Code per proyek — tukang scan QR untuk check-in
- Riwayat absensi lengkap

### 📦 Material
- Catat pemakaian material (nama, kategori, jumlah, harga)
- Total biaya otomatis
- Kategori material

### 📊 Progres Proyek
- Upload foto progres dari kamera HP
- Timeline foto + persentase progres
- Progress bar visual

### 🤖 AI (DeepSeek)
- **Generate RAB** — deskripsi proyek → AI bikin RAB otomatis
- **Export Excel** — download RAB dalam format .xlsx profesional
- **Analisis Progres** — evaluasi progres + rekomendasi
- **Prediksi Cash Flow** — peringatan defisit 30/60/90 hari

### 📱 WhatsApp Bot
- Notifikasi otomatis: absen, progres → WA
- Bot command: `absen`, `progres`, `material`, `status`
- Mandor di lapangan cukup chat WA, gak perlu buka web

### 👥 Role-Based Access
| Role | Akses |
|------|-------|
| 👑 Owner | Full access — semua proyek, semua fitur |
| 🔧 Kontraktor | Kelola proyek sendiri, RAB, AI, laporan |
| 👷 Mandor | Absensi, material, progres saja |

---

## 🚀 Demo

### Akun Demo
| Email | Password | Role |
|---|---|---|
| `admin@uyuhan.com` | `uyuhan123` | 👑 Owner |
| `demo@uyuhan.com` | `demo123` | 🔧 Kontraktor |
| `mandor@uyuhan.com` | `mandor123` | 👷 Mandor |

### Data Demo
Setelah login, langsung ada:
- 1 proyek aktif: "Rumah Pak RT — Cimahi" (budget Rp 350jt)
- 5 tukang dengan riwayat absensi
- 6 item material dalam 3 kategori
- 3 progres foto (progress 40%)
- RAB siap di-generate dengan AI

---

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| **Backend** | Python 3.12 · FastAPI · SQLAlchemy async · Alembic |
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Recharts |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **AI** | DeepSeek API |
| **WhatsApp** | Baileys (Node.js) |
| **Auth** | JWT (access + refresh token) |
| **Deployment** | Docker · Railway |

---

## 📦 Cara Pakai

### Development (Local)

```bash
# 1. Clone repo
git clone https://github.com/fariz/uyuhan-jaya.git
cd uyuhan-jaya

# 2. Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. Frontend
cd frontend
npm install && npm run dev

# 4. WhatsApp service (optional, untuk bot)
cd whatsapp-service
npm install && npm start
```

Buka `http://localhost:5173` — login dengan akun demo di atas.

### Production (Docker)

```bash
# Build & run dengan PostgreSQL
docker compose up --build -d
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init project
railway init

# Add PostgreSQL
railway add

# Deploy
railway up
```

Set environment variables di Railway dashboard:
| Variable | Value |
|---|---|
| `SECRET_KEY` | `random-256bit-key` |
| `ENV` | `production` |
| `DEEPSEEK_API_KEY` | `sk-your-key` |

---

## 🏗 Arsitektur

```
┌─────────────────────────────────────────────────┐
│                  DOCKER CONTAINER                │
│                                                  │
│   ┌──────────┐     ┌──────────────────┐         │
│   │ FastAPI   │     │ WhatsApp Service │         │
│   │ (port $PORT)│     │ Node.js + Baileys│        │
│   │ serves SPA │     │ (port 3001)     │         │
│   │ + REST API │     └────────┬─────────┘         │
│   └─────┬──────┘              │                   │
│         │                     │                   │
│   ┌─────▼─────────────────────▼──────┐            │
│   │        Supervisor (proses)       │            │
│   └──────────────────────────────────┘            │
│                                                  │
│   Volumes: data/ uploads/ whatsapp-service/auth/ │
└─────────────────────────────────────────────────┘
```

---

## 🗺 Roadmap

### ✅ Phase 1 — MVP (Selesai)
- [x] Web app: manajemen proyek, absensi, material, progres
- [x] Dashboard charts (Recharts)
- [x] AI RAB Generator + export Excel
- [x] QR Code absensi
- [x] Role-based access (Owner/Kontraktor/Mandor)
- [x] Upload foto dari kamera HP

### ✅ Phase 2 — WhatsApp (Selesai)
- [x] WhatsApp service (Baileys)
- [x] Notifikasi absen & progres ke WA
- [x] Bot command: absen, progres, material, status

### 🔜 Phase 3 — Scale
- [ ] Multi-tenant (setiap user punya data sendiri)
- [ ] Freemium tiers (1 proyek gratis)
- [ ] PWA / offline mode
- [ ] Export PDF laporan
- [ ] Marketplace material (bandingin harga supplier)
- [ ] Invoice & pembayaran

---

## 📄 Lisensi

MIT License — lihat [LICENSE](LICENSE) untuk detail.

---

<p align="center">
  Dibuat dengan ❤️ oleh <a href="https://github.com/fariz">Fariz</a> untuk kontraktor Indonesia.
  <br />
  <em>"Uyuhan..." — Paman</em>
</p>
