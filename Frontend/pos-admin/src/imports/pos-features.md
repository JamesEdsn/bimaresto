Fitur:

Input username / nama

Input password

Role-based access (admin, kasir, waiter, dll)

👥 2. Staff Management (Admin Only)

Tabel:

staff

roles

Fitur:

Tambah staff

Edit staff

Hapus staff

Assign role

Hash password

🗂 3. Category Management

Tabel:

categories

Fitur:

Tambah kategori

Edit kategori

Hapus kategori

List kategori

🍽 4. Menu Management

Tabel:

menus

categories

Fitur:

Tambah menu

Upload gambar

Set harga

Set available / tidak

Filter berdasarkan kategori

🪑 5. Table Management

Tabel:

tables

Fitur:

Tambah meja

Edit nomor meja

Ubah status (available / occupied)

Visual layout meja (opsional tapi bagus)

🧾 6. Order Page (Core POS)

Tabel:

orders

order_items

menus

tables

staff

Fitur:

Pilih meja

Pilih menu

Tambah quantity

Auto hitung subtotal

Edit / hapus item

Hitung total

Simpan order

Status order (pending, cooking, served, completed)

💳 7. Payment Page

Tabel:

payments

Fitur:

Pilih order

Tampilkan total

Pilih metode pembayaran

Update payment_status

Simpan waktu paid_at

Print receipt (opsional)

📊 8. Dashboard

Gabungan:

orders

payments

tables

Fitur:

Total sales hari ini

Total order

Meja aktif

Staff aktif

✅ 2️⃣ KOMPONEN YANG HARUS ADA
🔹 Navbar / Sidebar

Dashboard

Orders

Tables

Menu

Categories

Staff (admin only)

Logout

🔹 Reusable Components

Modal form

Data table

Search bar

Status badge

Confirmation dialog

Pagination

✅ 3️⃣ FITUR YANG HARUS ADA (WAJIB SESUAI DATABASE)

Karena database kamu sudah relational dan cukup lengkap, ini fitur minimum:

🔑 Role Based Access Control

Karena ada roles → wajib ada:

Admin

Cashier

Waiter

Contoh:

Waiter → hanya buat order

Cashier → proses payment

Admin → CRUD semua

🧾 Order System (Relasi Penting)

Relasi:

tables → orders → order_items → menus

Maka fitur harus:

1 meja bisa punya banyak order

1 order punya banyak order_items

Subtotal otomatis dari quantity × unit_price

Total diambil dari sum subtotal

💳 Payment System

Relasi:

orders → payments
tables → payments
staff → payments

Maka:

1 order = 1 payment

Staff yang proses payment harus tercatat

Payment method harus selectable

🪑 Status Table Otomatis

Kalau:

Ada order aktif → status meja = occupied

Payment selesai → status meja = available

Ini penting supaya sesuai logic real POS.

✅ 4️⃣ FLOW APLIKASI YANG BENAR
1️⃣ Login

↓

2️⃣ Pilih Meja

↓

3️⃣ Buat Order

↓

4️⃣ Tambah Item

↓

5️⃣ Submit Order

↓

6️⃣ Proses Payment

↓

7️⃣ Meja Kembali Available