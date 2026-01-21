# Backend Jollaly API

Sebuah RESTful API sederhana untuk autentikasi pengguna dan manajemen catatan (notes) berbasis Node.js, Express, dan Prisma (PostgreSQL).

- Bahasa/Platform: Node.js + Express
- ORM: Prisma (PostgreSQL)
- Auth: JWT (JSON Web Token) + httpOnly cookie
- Lainnya: bcrypt, CORS, cookie-parser, dotenv

Base URL default (dev): `http://localhost:3000`
Prefix API: `/api`

## Arsitektur Singkat

- `src/server.js` – inisialisasi server dan routing
- `src/routes/*` – deklarasi endpoint
- `src/controllers/*` – logika bisnis setiap endpoint
- `src/middlewares/verifyToken.js` – middleware proteksi JWT
- `prisma/schema.prisma` – skema database (User, Note)

## Prasyarat

- Node.js 18+ (disarankan)
- PostgreSQL

## Setup & Menjalankan

1. Instal dependensi:
   - `npm install`
2. Siapkan file `.env` di root proyek dengan nilai minimal:
   ```env
   NODE_ENV=localhost
   JWT_SECRET="your_jwt_secret"
   PORT=3000
   BASE_URL=http://localhost:3000
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"
   ```
3. Jalankan migrasi Prisma dan generate client (sesuaikan DB Anda):
   - `npx prisma migrate dev --name init`
4. Jalankan server development:
   - `npm run dev`

Server akan berjalan pada `http://localhost:3000`.

## Skema Database (Ringkas)

- User
  - id (UUID), name, email (unik), password (hash)
- Note
  - id (UUID), title, content, userId (relasi ke User)
  - isFavorite (boolean, default: false), isArchived (boolean, default: false)

## Format Respons

Semua respons menggunakan struktur standar:

- Sukses:
  ```json
  { "success": true, "message": "...", "data": { ... } }
  ```
- Error:
  ```json
  { "success": false, "message": "...", "data": null }
  ```

## Autentikasi

- Login menghasilkan JWT dengan payload `{ id: <userId> }`, masa berlaku 30 hari.
- Token juga disetel sebagai httpOnly cookie bernama `token`.
- Proteksi endpoint notes menggunakan header: `Authorization: Bearer <token>`.
  - Catatan: Middleware saat ini membaca token dari header Authorization, bukan dari cookie. Pastikan klien mengirim header tersebut saat mengakses endpoint terproteksi.

## Daftar Endpoint

### 1) Auth

Prefix: `/api/auth`

1. POST `/register` – Registrasi pengguna baru

   - Body JSON:
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "password": "secret123"
     }
     ```
   - 200 OK (contoh):
     ```json
     {
       "success": true,
       "message": "Registration successful!",
       "data": {
         "id": "<uuid>",
         "name": "John Doe",
         "email": "john@example.com"
       }
     }
     ```
   - Error:
     - 400 Email already in use

2. POST `/login` – Login pengguna

   - Body JSON:
     ```json
     { "email": "john@example.com", "password": "secret123" }
     ```
   - 200 OK (mengatur cookie `token` dan mengembalikan token di body):
     ```json
     {
       "success": true,
       "message": "Login successful!",
       "data": {
         "userId": "<uuid>",
         "email": "john@example.com",
         "token": "<jwt>"
       }
     }
     ```
   - Error:
     - 404 Email not found
     - 401 Wrong password

3. POST `/logout` – Logout pengguna
   - Menghapus cookie `token` (tidak memerlukan header Authorization)
   - 200 OK:
     ```json
     { "success": true, "message": "Logout successful!", "data": null }
     ```

### 2) Notes (Terproteksi JWT)

Prefix: `/api/notes`

- Wajib header: `Authorization: Bearer <token>`

1. GET `/` – Ambil semua note milik user

   - Dukungan filter opsional via query params:
     - `isFavorite=true|false`
     - `isArchived=true|false`
   - Contoh: `GET /api/notes?isFavorite=true&isArchived=false`
   - 200 OK (contoh):
     ```json
     {
       "success": true,
       "message": "Get all notes successful!",
       "data": [
         {
           "id": "<uuid>",
           "title": "Judul",
           "content": "Isi",
           "userId": "<uuid>",
           "isFavorite": false,
           "isArchived": false,
           "createdAt": "...",
           "updatedAt": "..."
         }
       ]
     }
     ```

2. GET `/:id` – Ambil note by ID (hanya milik user)

   - 200 OK:
     ```json
     {
       "success": true,
       "message": "Get note by ID successful!",
       "data": {
         "id": "<uuid>",
         "title": "...",
         "content": "...",
         "userId": "<uuid>",
         "isFavorite": false,
         "isArchived": false
       }
     }
     ```
   - Error: 404 Note is not found

3. POST `/` – Buat note baru

   - Body JSON (disarankan minimal `title` atau `content`; keduanya tidak boleh sama-sama kosong):
     ```json
     {
       "title": "Judul",
       "content": "Isi catatan",
       "isFavorite": false,
       "isArchived": false
     }
     ```
   - Validasi:
     - Menolak jika `title` dan `content` keduanya kosong/tidak ada (401 Data cannot be empty!)
   - Catatan:
     - `isFavorite` dan `isArchived` opsional; jika tidak dikirim akan default `false`.
   - 200 OK:
     ```json
     {
       "success": true,
       "message": "Note created!",
       "data": {
         "id": "<uuid>",
         "title": "Judul",
         "content": "Isi",
         "userId": "<uuid>",
         "isFavorite": false,
         "isArchived": false
       }
     }
     ```

4. PUT `/:id` – Update note (hanya milik user)

   - Body JSON (minimal salah satu field):
     ```json
     {
       "title": "Judul baru",
       "content": "Isi baru",
       "isFavorite": true,
       "isArchived": false
     }
     ```
   - Validasi:
     - Menolak jika semua field (`title`, `content`, `isFavorite`, `isArchived`) tidak ada (401)
     - 404 bila note tidak ditemukan/ bukan milik user
   - 200 OK:
     ```json
     { "success": true, "message": "note updated!", "data": { ... } }
     ```

5. DELETE `/:id` – Hapus note (hanya milik user)
   - 404 bila tidak ditemukan/ bukan milik user
   - 200 OK:
     ```json
     { "success": true, "message": "Note deleted!", "data": { ... } }
     ```

## Contoh Header Autentikasi

```
Authorization: Bearer <jwt>
```

## CORS & Cookie

- CORS saat ini terbuka (`cors()` default). Sesuaikan untuk produksi.
- Cookie `token` disetel `httpOnly`, `sameSite=Strict`, `secure` mengikuti NODE_ENV/hostname, masa berlaku 30 hari.

## Catatan Produksi

- Gunakan nilai `JWT_SECRET` yang kuat.
- Atur `CORS` dan `secure` cookie sesuai domain/HTTPS.
- Terapkan rate limiting, helmet, dan logging sesuai kebutuhan.

## Lisensi

Bebas digunakan untuk keperluan pembelajaran/prototyping. Sesuaikan lisensi apabila diperlukan.
