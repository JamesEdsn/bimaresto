# BimaResto Backend

REST API manajemen restoran kampus. Dibangun dengan **Fiber v2 + PostgreSQL + GORM**.

## Struktur Project

```
bimaresto-backend/
├── main.go                  ← entry point, semua routing di sini
├── config/
│   └── database.go          ← koneksi PostgreSQL + auto migrate
├── models/
│   └── models.go            ← semua struct/tabel database
├── handlers/
│   ├── auth.go              ← login, register, refresh token, logout
│   ├── menu.go              ← CRUD menu + kategori
│   ├── table.go             ← lihat meja, update status
│   ├── order.go             ← buat order, sync offline
│   ├── kitchen.go           ← tampilan kitchen, update status item
│   ├── payment.go           ← generate bill, proses bayar
│   └── report.go            ← laporan harian
├── middleware/
│   └── auth.go              ← JWT: generate, validasi, middleware role
└── .env
```

## Cara Jalankan

```bash
# Install dependencies
go mod tidy

# Jalankan server
go run main.go
```

## Role & Akses

| Role ID | Nama    | Akses                          |
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
| POST   | /api/payments                 | Kasir+        |
| PATCH  | /api/tables/:id/status        | Kasir+        |
| GET    | /api/kitchen/orders           | Kitchen+      |
| PATCH  | /api/kitchen/items/:id/status | Kitchen+      |
| POST   | /api/menus                    | Manager+      |
| PUT    | /api/menus/:id                | Manager+      |
| DELETE | /api/menus/:id                | Manager+      |
| GET    | /api/reports/daily            | Manager+      |
| POST   | /api/sync                     | Manager+      |

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
