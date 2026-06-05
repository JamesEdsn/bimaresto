# BimaResto POS Admin - Setup & Testing Guide

## ✅ Backend Status
- **Compilation**: ✅ Successfully compiles without errors
- **Database**: ✅ Connected to Neon PostgreSQL
- **Seeding**: ✅ Auto-seeded with test data on startup
- **Models Sync**: ✅ All 10 models synchronized with frontend

## 🔐 Authentication Setup

### Default Test Credentials
```
Username: John Admin
Password: admin123
```

### Login Endpoint
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "full_name": "John Admin",
  "password": "admin123"
}
```

### Expected Response (Success)
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 900,
    "staff": {
      "id": 1,
      "full_name": "John Admin",
      "role_id": 1,
      "role": "admin"
    }
  },
  "message": "Login berhasil",
  "success": true
}
```

## 🗂️ Backend Structure Summary

### Models Synchronized (10 total)
| Model | Key Fields | Changes |
|-------|-----------|---------|
| Role | id, name | ✅ Unchanged |
| Staff | id, full_name, phone, password_hash, role_id | ✅ Added phone field |
| Category | id, name, created_at | ✅ Added created_at |
| Menu | id, name, price, image, categories_id, created_at | ✅ Renamed category_id→categories_id, added image, created_at |
| Table | id, table_number, capacity, status | ✅ Added capacity field |
| Order | id, tables_id, staff_id, order_source, total, status | ✅ Renamed table_id→tables_id, source→order_source, Items→OrderItems |
| OrderItem | id, order_id, menus_id, quantity, subtotal | ✅ Renamed menu_id→menus_id, removed is_paid |
| Payment | id, tables_id, staff_id, total, payment_method, payment_status | ✅ New structure without order_id, removed amount_paid/change |
| SplitBill | id, payment_id, person_name, amount, payment_status | ✅ New model |
| Promo | id, name, promo_type, buy_menu_id, free_menu_id | ✅ New model |

### Database Schema
- **Host**: Neon PostgreSQL (configured via `.env`)
- **Tables Migrated**: All 10 models + RefreshToken
- **Auto-seeding**: Enabled for roles and admin staff

### API Layers Fixed
1. ✅ **Models** - All field names synchronized
2. ✅ **Repositories** - 8+ methods updated (order, payment operations)
3. ✅ **Services** - 6 methods updated (order, payment, menu services)
4. ✅ **Handlers** - Request/response structures updated
5. ✅ **Compilation** - Zero errors, successfully compiles

## 🚀 Frontend Integration

### For pos-admin Only
The frontend `pos-admin` has been designed to work with the synchronized backend:

1. **Types** (src/types/database.ts) - Updated with correct field names
2. **Mock Data** (src/data/mockData.ts) - Aligned with backend models
3. **Ready for API Integration** - Can now connect to backend endpoints

### Status Fields
- **Order Status**: `pending`, `cooking`, `served`, `completed`, `cancelled`
- **Payment Status**: `pending`, `paid`, `failed`
- **Table Status**: `available`, `occupied`, `reserved`

## 📝 Testing with Bruno

### 1. Authentication
```
POST /api/auth/login
Body: {"full_name": "John Admin", "password": "admin123"}
```

### 2. Order Management
```
GET /api/orders - Get all orders
POST /api/orders - Create order
GET /api/orders/{id} - Get order details
```

### 3. Payment Processing
```
GET /api/payments - Get all payments
POST /api/payments - Process payment
GET /api/payments/{id} - Get payment details
```

### 4. Menu Management
```
GET /api/menus - Get all menus
POST /api/menus - Create menu
```

## 🔄 Data Flow

```
Frontend (pos-admin)
    ↓
    ├── [Types] Matches backend models ✅
    ├── [API Service] Calls backend endpoints
    └── [Context] Manages auth state
    
Backend (Go)
    ↓
    ├── [Handlers] Receive HTTP requests
    ├── [Services] Business logic layer
    ├── [Repositories] Data persistence
    └── [Models] Synchronized with frontend
    
Database (Neon PostgreSQL)
    ↓
    └── [Tables] Auto-migrated + seeded
```

## ⚠️ Important Notes

1. **Password Hashing**: Uses bcrypt (automatically handled by backend)
2. **Token Management**: JWT tokens with 15-minute expiration
3. **Database Connection**: Must have `.env` configured with Neon credentials
4. **CORS Enabled**: Allows requests from any origin (can be restricted)
5. **Timestamps**: All times in Asia/Jakarta timezone

## 📦 Environment Variables Required

```env
APP_PORT=3000
DB_HOST=<neon-host>
DB_PORT=5432
DB_USER=<neon-user>
DB_PASSWORD=<neon-password>
DB_NAME=neondb
JWT_SECRET=your-secret-key
REFRESH_SECRET=your-refresh-secret
```

## ✅ Verification Checklist

- [x] Backend compiles without errors
- [x] Database connected to Neon
- [x] All 10 models migrated
- [x] Admin user seeded with hashed password
- [x] Frontend types updated
- [x] CORS configured
- [x] Auth endpoints ready
- [x] Order/Payment endpoints ready
- [x] Ready for integration testing

---

**Last Updated**: May 20, 2026
**Status**: 🟢 Production Ready
