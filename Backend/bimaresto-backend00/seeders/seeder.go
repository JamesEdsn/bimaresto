package seeders

import (
	"bimaresto-backend/config"
	"bimaresto-backend/models"
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// RunSeeders mengisi data awal yang diperlukan agar aplikasi langsung bisa digunakan.
// Setiap seeder hanya berjalan jika tabel yang bersangkutan masih kosong.
func RunSeeders() {
	seedRoles()
	seedStaff()
	seedTables()
	seedCategories()
	seedMenus()
	seedOrders()
}

// seedRoles mengisi tabel roles dengan data default.
func seedRoles() {
	var count int64
	config.DB.Model(&models.Role{}).Count(&count)
	if count > 0 {
		return
	}

	roles := []models.Role{
		{ID: 1, Name: "admin"},
		{ID: 2, Name: "kasir"},
		{ID: 3, Name: "kitchen"},
		{ID: 4, Name: "manager"},
	}
	config.DB.Create(&roles)
	log.Println("✅ Data Roles berhasil disuntikkan!")
}

// seedStaff membuat akun admin default.
func seedStaff() {
	var count int64
	config.DB.Model(&models.Staff{}).Count(&count)
	if count > 0 {
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("❌ Gagal generate password hash: %v", err)
		return
	}

	admin := models.Staff{
		ID:           1,
		RoleID:       1,
		FullName:     "John Admin",
		PasswordHash: string(hash),
		IsActive:     true,
	}
	config.DB.Create(&admin)
	log.Println("✅ Akun 'John Admin' berhasil disuntikkan!")
}

// seedTables mengisi tabel tables dengan data meja default.
func seedTables() {
	var count int64
	config.DB.Model(&models.Table{}).Count(&count)
	if count > 0 {
		return
	}

	tables := []models.Table{
		{ID: 1, TableNumber: "1", Status: "available", Capacity: 4},
		{ID: 2, TableNumber: "2", Status: "available", Capacity: 2},
		{ID: 3, TableNumber: "3", Status: "available", Capacity: 6},
	}
	config.DB.Create(&tables)
	log.Println("✅ Data Tables berhasil disuntikkan!")
}

// seedCategories mengisi tabel categories dengan kategori menu default.
func seedCategories() {
	var count int64
	config.DB.Model(&models.Category{}).Count(&count)
	if count > 0 {
		return
	}

	categories := []models.Category{
		{ID: 1, Name: "Main Course", CreatedAt: time.Now()},
		{ID: 2, Name: "Beverages", CreatedAt: time.Now()},
		{ID: 3, Name: "Snacks", CreatedAt: time.Now()},
	}
	config.DB.Create(&categories)
	log.Println("✅ Data Categories berhasil disuntikkan!")
}

// seedMenus mengisi tabel menus dengan menu contoh.
func seedMenus() {
	var count int64
	config.DB.Model(&models.Menu{}).Count(&count)
	if count > 0 {
		return
	}

	menus := []models.Menu{
		{ID: 1, CategoriesID: 1, Name: "Nasi Goreng Bima", Description: "Nasi goreng signature restoran", Price: 28000, IsAvailable: true, Image: ""},
		{ID: 2, CategoriesID: 1, Name: "Chicken Katsu Rice", Description: "Chicken katsu dengan saus spesial", Price: 32000, IsAvailable: true, Image: ""},
		{ID: 3, CategoriesID: 2, Name: "Es Teh Manis", Description: "Teh manis dingin segar", Price: 8000, IsAvailable: true, Image: ""},
		{ID: 4, CategoriesID: 3, Name: "French Fries", Description: "Kentang goreng renyah", Price: 15000, IsAvailable: true, Image: ""},
	}
	config.DB.Create(&menus)
	log.Println("✅ Data Menus berhasil disuntikkan!")
}

// seedOrders mengisi data order contoh, termasuk order bulan berjalan agar
// filter default di dashboard tidak kosong.
func seedOrders() {
	var orderCount int64
	config.DB.Model(&models.Order{}).Count(&orderCount)
	if orderCount == 0 {
		seedInitialOrders()
	}
	seedCurrentMonthOrder()
}

// seedInitialOrders membuat dua order contoh (satu completed, satu cooking).
func seedInitialOrders() {
	now := time.Now()

	// Order pertama: sudah selesai
	completedOrder := models.Order{
		TablesID:    1,
		StaffID:     1,
		OrderSource: "dine_in",
		Status:      "completed",
		Subtotal:    60000,
		Tax:         6000,
		ServiceFee:  3000,
		Total:       69000,
		TotalPaid:   69000,
		ClientRefID: "seed-order-001",
		CreatedAt:   now.Add(-2 * time.Hour),
	}
	config.DB.Create(&completedOrder)

	completedItems := []models.OrderItem{
		{OrderID: completedOrder.ID, MenuID: 1, Quantity: 1, UnitPrice: 28000, Subtotal: 28000, Notes: "", Status: "served"},
		{OrderID: completedOrder.ID, MenuID: 3, Quantity: 2, UnitPrice: 8000, Subtotal: 16000, Notes: "Less sugar", Status: "served"},
		{OrderID: completedOrder.ID, MenuID: 4, Quantity: 1, UnitPrice: 15000, Subtotal: 15000, Notes: "", Status: "served"},
	}
	config.DB.Create(&completedItems)

	paidAt := completedOrder.CreatedAt.Add(30 * time.Minute)
	config.DB.Create(&models.Payment{
		OrderID:       completedOrder.ID,
		TablesID:      1,
		StaffID:       1,
		Total:         69000,
		AmountPaid:    69000,
		Change:        0,
		PaymentMethod: "cash",
		PaymentStatus: "paid",
		PaidAt:        &paidAt,
	})

	config.DB.Create(&models.SplitBill{
		OrderID:   completedOrder.ID,
		Amount:    34500,
		CreatedAt: now.Add(-90 * time.Minute),
	})

	// Order kedua: masih diproses
	pendingOrder := models.Order{
		TablesID:    2,
		StaffID:     1,
		OrderSource: "dine_in",
		Status:      "cooking",
		Subtotal:    32000,
		Tax:         3200,
		ServiceFee:  1600,
		Total:       36800,
		TotalPaid:   0,
		ClientRefID: "seed-order-002",
		CreatedAt:   now.Add(-20 * time.Minute),
	}
	config.DB.Create(&pendingOrder)

	config.DB.Create(&[]models.OrderItem{
		{OrderID: pendingOrder.ID, MenuID: 2, Quantity: 1, UnitPrice: 32000, Subtotal: 32000, Notes: "No onion", Status: "cooking"},
	})

	log.Println("✅ Data Orders, Payments, dan Split Bills berhasil disuntikkan!")
}

// seedCurrentMonthOrder memastikan ada minimal 1 order completed di bulan berjalan
// agar filter default di dashboard tidak kosong.
func seedCurrentMonthOrder() {
	var count int64
	currentMonthStart := time.Date(time.Now().Year(), time.Now().Month(), 1, 0, 0, 0, 0, time.Local)
	config.DB.Model(&models.Order{}).
		Where("created_at >= ? AND status = ?", currentMonthStart, "completed").
		Count(&count)

	if count > 0 {
		return
	}

	var sampleMenus []models.Menu
	config.DB.Order("id ASC").Limit(2).Find(&sampleMenus)
	if len(sampleMenus) == 0 {
		log.Println("⚠️  Seed order bulan berjalan dilewati karena belum ada menu")
		return
	}

	now := time.Now()
	sampleOrder := models.Order{
		TablesID:    3,
		StaffID:     1,
		OrderSource: "dine_in",
		Status:      "completed",
		Subtotal:    36000,
		Tax:         3600,
		ServiceFee:  1800,
		Total:       41400,
		TotalPaid:   41400,
		ClientRefID: fmt.Sprintf("seed-%d", now.UnixNano()),
		CreatedAt:   now,
	}
	config.DB.Create(&sampleOrder)

	sampleItems := []models.OrderItem{{
		OrderID:   sampleOrder.ID,
		MenuID:    sampleMenus[0].ID,
		Quantity:  1,
		UnitPrice: sampleMenus[0].Price,
		Subtotal:  sampleMenus[0].Price,
		Notes:     "",
		Status:    "pending",
	}}
	if len(sampleMenus) > 1 {
		sampleItems = append(sampleItems, models.OrderItem{
			OrderID:   sampleOrder.ID,
			MenuID:    sampleMenus[1].ID,
			Quantity:  1,
			UnitPrice: sampleMenus[1].Price,
			Subtotal:  sampleMenus[1].Price,
			Notes:     "Less sugar",
			Status:    "pending",
		})
	}
	config.DB.Create(&sampleItems)

	paidAt := now.Add(20 * time.Minute)
	config.DB.Create(&models.Payment{
		OrderID:       sampleOrder.ID,
		TablesID:      sampleOrder.TablesID,
		StaffID:       sampleOrder.StaffID,
		Total:         sampleOrder.Total,
		AmountPaid:    sampleOrder.Total,
		Change:        0,
		PaymentMethod: "cash",
		PaymentStatus: "paid",
		PaidAt:        &paidAt,
	})

	config.DB.Create(&models.SplitBill{
		OrderID:   sampleOrder.ID,
		Amount:    sampleOrder.Total / 2,
		CreatedAt: now,
	})

	log.Println("✅ Data order bulan berjalan berhasil disuntikkan!")
}
