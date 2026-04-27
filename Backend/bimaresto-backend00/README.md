# BimaResto Backend

REST API manajemen restoran kampus. Dibangun dengan **Fiber v2 + PostgreSQL + GORM**.

## Struktur Project

```
bimaresto-backend/
├── main.go                  ← entry point
├── bruno/                   ← Dokumentasi API
├── config/
│   └── database.go          ← koneksi PostgreSQL + auto migrate
├── models/
│   └── models.go            ← semua struct/tabel database
├── routes/
│   └── api.go            ← registrasi route dan Dependency Injection
├── utils/
│   └── response.go            ← standarisasi format respons API
├── handlers/              ← Lapisan Handler (HTTP)
│   ├── auth.go              ← login, register, refresh token, logout
│   ├── menu.go              ← CRUD menu + kategori
│   ├── table.go             ← lihat meja, update status
│   ├── order.go             ← buat order, sync offline
│   ├── kitchen.go           ← tampilan kitchen, update status item
│   ├── payment.go           ← generate bill, proses bayar
│   └── report.go            ← laporan harian
├── services/              ← Lapisan Service (Logika Bisnis dan Unit Tests)
├── repositories/          ← Lapisan Repository (Database)
├── middleware/
│   └── auth.go              ← JWT: generate, validasi, middleware role
├── mocks/                   ← Tiruan Repository untuk keperluan Unit Testing
└── .env
```

## Cara Jalankan

```bash
# Install dependencies
go mod tidy

# Jalankan server
go run main.go
```

## Testing
Proyek ini menggunakan Automated Testing pada Service Layer menggunakan Mocking.

```bash
# Menjalankan seluruh test
go test ./...

# Menjalankan test dengan output detail
go test ./services/... -v

# Melihat persentase cakupan kode (Code Coverage)
go test -cover ./services/...
```

## Dokumentasi API
Dokumentasi API dapat diakses dan diuji langsung menggunakan aplikasi Bruno.
Cara jalankan:
1. Download dan buka aplikasi Bruno
2. Pilih "Open Collection"
3. Pilih folder bruno-collection di dalam proyek ini.
4. pilih Environment Local di pojok kanan atas agar token JWT dan Base URL terisi secara otomatis setelah Login.

## Role & Akses

| Role ID | Nama    | Akses                         |
|---------|---------|-------------------------------|
| 1       | admin   | Semua endpoint                |
| 2       | kasir   | Order, payment, table         |
| 3       | kitchen | Lihat & update status kitchen |
| 4       | manager | Menu CRUD, laporan, sync      |

## Endpoints

| Method | Endpoint                      | Akses         |
|--------|-------------------------------|---------------|
| POST   | /api/login                    | Public        |
| POST   | /api/refresh                  | Public        |
| POST   | /api/register                 | Admin         |
| POST   | /api/logout                   | Login         |
| GET    | /api/menus                    | Login         |
| GET    | /api/menus/:id                | Login         |
| GET    | /api/categories               | Login         |
| GET    | /api/tables                   | Login         |
| POST   | /api/orders                   | Kasir+        |
| GET    | /api/orders/:id/bill          | Kasir+        |
| POST   | /api/orders/:id/items         | Kasir+        |
| PUT    | /api/orders/:id/move-table    | Kasir+        |
| POST   | /api/orders/:id/split-table   | Kasir+        |
| POST   | /api/orders/:id/merge         | Kasir+        |
| DELETE | /api/orders/:id               | Kasir+        |
| DELETE | /api/orders/:id/items/:item_id| Kasir+        |
| POST   | /api/payments                 | Kasir+        |
| PATCH  | /api/tables/:id/status        | Kasir+        |
| GET    | /api/kitchen/orders           | Kitchen+      |
| PATCH  | /api/kitchen/items/:id/status | Kitchen+      |
| POST   | /api/menus                    | Manager+      |
| PUT    | /api/menus/:id                | Manager+      |
| DELETE | /api/menus/:id                | Manager+      |
| GET    | /api/reports/daily            | Manager+      |
| POST   | /api/sync                     | Manager+      |


## Format Respons Standar
Sukses:
```json
{
    "success": true,
    "message": "Pesan sukses",
    "data": { ... }
}
```

Gagal:
```json
{
    "success": false,
    "message": "Pesan error detail",
    "data": null
}
```

## Auth Flow

```
POST /api/login
→ { access_token, refresh_token }

Setiap request pakai header:
Authorization: Bearer <access_token>

Kalau access_token expired (15 menit):
POST /api/refresh { refresh_token }
→ { access_token baru, refresh_token baru }
```

## Fitur Offline Sync

Setiap order wajib punya `client_ref_id` (UUID dari device).
Kalau order dikirim dua kali dengan ID yang sama, yang kedua akan diskip — tidak error, tidak duplikat.

```json
POST /api/sync
{
  "orders": [
    {
      "table_id": 1,
      "source": "dine_in",
      "client_ref_id": "uuid-dari-device",
      "items": [
        { "menu_id": 1, "quantity": 2 }
      ]
    }
  ]
}
```
