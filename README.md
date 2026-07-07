# Nama Project

Deskripsi singkat project di sini.

**Stack:**
- Frontend: Vue 3 + TypeScript (PWA) — Vite
- Backend: Supabase (Postgres, Auth, Storage) — dijalankan lokal via Docker

---

## Prasyarat

Pastikan sudah terinstall di komputer kamu:

- [Node.js](https://nodejs.org/) (versi 18 ke atas)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (harus jalan sebelum menjalankan Supabase lokal)
- npm (sudah include saat install Node.js)

Cek versi:
```bash
node -v
npm -v
docker -v
```

---

## Struktur Folder

```
project-root/
├── frontend/          # Vue + TypeScript + PWA
│   ├── src/
│   ├── .env
│   └── ...
└── supabase/          # Config & migration Supabase
    ├── config.toml
    └── migrations/
```

---

## 1. Setup Backend (Supabase Lokal)

### 1.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 1.2 Inisialisasi Supabase

Jalankan di root project:

```bash
supabase init
```

### 1.3 Jalankan Supabase secara lokal

Pastikan Docker Desktop sudah menyala, lalu:

```bash
supabase start
```

Setelah selesai, terminal akan menampilkan output seperti berikut:

```
API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
anon key: eyJhbGci...
service_role key: eyJhbGci...
```

> **Catatan:** Simpan `API URL` dan `anon key` di atas, akan dipakai di konfigurasi frontend pada langkah berikutnya.

Kalau lupa lagi nanti, jalankan:
```bash
supabase status
```

### 1.4 Buka Supabase Studio (opsional, tampilan dashboard)

Buka browser ke:
```
http://127.0.0.1:54323
```

### 1.5 Membuat migration (skema tabel)

```bash
supabase migration new create_initial_tables
```

File kosong akan dibuat di `supabase/migrations/`. Isi dengan SQL `CREATE TABLE`, lalu jalankan:

```bash
supabase db reset
```

### Command Supabase yang Sering Dipakai

| Command | Fungsi |
|---|---|
| `supabase start` | Menyalakan semua service (Postgres, Auth, Storage, Studio) |
| `supabase stop` | Mematikan semua container |
| `supabase status` | Menampilkan URL & key |
| `supabase db reset` | Reset database dan jalankan ulang semua migration |
| `supabase migration new <nama>` | Membuat file migration baru |

---

## 2. Setup Frontend (Vue + TypeScript + PWA)

### 2.1 Membuat project

```bash
npm create vite@latest frontend -- --template vue-ts
cd frontend
npm install
```

### 2.2 Install dependency PWA & Supabase client

```bash
npm install -D vite-plugin-pwa
npm install @supabase/supabase-js
```

### 2.3 Konfigurasi PWA

Edit `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Nama Aplikasi',
        short_name: 'App',
        description: 'Deskripsi aplikasi',
        theme_color: '#0B266E',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
```

> Taruh file icon `pwa-192x192.png` dan `pwa-512x512.png` di folder `public/`.

### 2.4 Buat file koneksi Supabase

```bash
mkdir -p src/lib
```

Buat file `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2.5 Buat file environment

Buat file `.env` di dalam folder `frontend/`:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=isi-dengan-anon-key-dari-supabase-status
```

> Jangan commit file `.env` ke Git. Pastikan sudah ada di `.gitignore`.

### 2.6 Jalankan development server

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173` (default Vite).

---

## Menjalankan Project (Ringkasan Harian)

Setiap kali mau develop, urutan yang dijalankan:

```bash
# 1. Nyalakan backend Supabase
supabase start

# 2. Masuk ke folder frontend, jalankan dev server
cd frontend
npm run dev
```

Saat selesai:

```bash
supabase stop
```

---

## Troubleshooting

- **Docker error saat `supabase start`** → pastikan Docker Desktop sudah menyala.
- **Port bentrok (54321/54322/54323)** → cek aplikasi lain yang mungkin memakai port tersebut, atau ubah port di `supabase/config.toml`.
- **Env variable tidak terbaca di frontend** → pastikan nama variabel diawali `VITE_` dan restart `npm run dev` setelah mengubah `.env`.

---

## Lisensi

Tambahkan informasi lisensi di sini.
