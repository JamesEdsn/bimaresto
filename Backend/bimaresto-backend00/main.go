package main

import (
	"bimaresto-backend/config"
	"bimaresto-backend/models"
	"bimaresto-backend/routes"
	"fmt"
	"log"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("File .env tidak ditemukan, menggunakan environment variable sistem")
	}

	// 2. Koneksi database
	config.ConnectDatabase()

	// 3. Jalankan Seeder agar data dasar otomatis tersedia
	SeedData()

	// 4. Setup Fiber
	app := fiber.New(fiber.Config{
		AppName: "BimaResto API",
	})

	// 5. Middleware (Logger & CORS)
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Mengizinkan semua akses dari frontend
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE",
	}))

	// 6. Setup Routes
	routes.SetupRoutes(app)

	// 7. Start server
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "3001"
	}

	log.Printf("Server berhasil jalan di http://localhost:%s", port)
	log.Fatal(app.Listen(":" + port))
}

// === FUNGSI SEEDER UNTUK MENGISI DATA AWAL OTOMATIS ===
func SeedData() {
	// 1. Isi tabel Roles
	var roleCount int64
	config.DB.Model(&models.Role{}).Count(&roleCount)
	if roleCount == 0 {
		roles := []models.Role{
			{ID: 1, Name: "admin"},
			{ID: 2, Name: "kasir"},
			{ID: 3, Name: "kitchen"},
			{ID: 4, Name: "manager"},
		}
		config.DB.Create(&roles)
		log.Println("✅ Data Roles berhasil disuntikkan!")
	}

	// 2. Buat akun Admin
	var staffCount int64
	config.DB.Model(&models.Staff{}).Count(&staffCount)
	if staffCount == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err == nil {
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
	}

	// 3. Isi tabel Tables
	var tableCount int64
	config.DB.Model(&models.Table{}).Count(&tableCount)
	if tableCount == 0 {
		tables := []models.Table{
			{ID: 1, TableNumber: "1", Status: "available", Capacity: 4},
			{ID: 2, TableNumber: "2", Status: "available", Capacity: 2},
			{ID: 3, TableNumber: "3", Status: "available", Capacity: 6},
		}
		config.DB.Create(&tables)
		log.Println("✅ Data Tables berhasil disuntikkan!")
	}

	// 4. Isi tabel Categories
	var categoryCount int64
	config.DB.Model(&models.Category{}).Count(&categoryCount)
	if categoryCount == 0 {
		categories := []models.Category{
			{ID: 1, Name: "Main Course", CreatedAt: time.Now()},
			{ID: 2, Name: "Beverages", CreatedAt: time.Now()},
			{ID: 3, Name: "Snacks", CreatedAt: time.Now()},
		}
		config.DB.Create(&categories)
		log.Println("✅ Data Categories berhasil disuntikkan!")
	}

	// 5. Isi tabel Menus
	var menuCount int64
	config.DB.Model(&models.Menu{}).Count(&menuCount)
	if menuCount == 0 {
		menus := []models.Menu{
			{ID: 1, CategoriesID: 1, Name: "Nasi Goreng Bima", Description: "Nasi goreng signature restoran", Price: 28000, IsAvailable: true, Image: "",},
			{ID: 2, CategoriesID: 1, Name: "Chicken Katsu Rice", Description: "Chicken katsu dengan saus spesial", Price: 32000, IsAvailable: true, Image: "",},
			{ID: 3, CategoriesID: 2, Name: "Es Teh Manis", Description: "Teh manis dingin segar", Price: 8000, IsAvailable: true, Image: "",},
			{ID: 4, CategoriesID: 3, Name: "French Fries", Description: "Kentang goreng renyah", Price: 15000, IsAvailable: true, Image: "",},
		}
		config.DB.Create(&menus)
		log.Println("✅ Data Menus berhasil disuntikkan!")
	}

	// 6. Isi tabel Orders + Order Items + Payments + Split Bills
	var orderCount int64
	config.DB.Model(&models.Order{}).Count(&orderCount)
	if orderCount == 0 {
		now := time.Now()

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
		payment := models.Payment{
			OrderID:       completedOrder.ID,
			TablesID:      1,
			StaffID:       1,
			Total:         69000,
			AmountPaid:    69000,
			Change:        0,
			PaymentMethod: "cash",
			PaymentStatus: "paid",
			PaidAt:        &paidAt,
		}
		config.DB.Create(&payment)

		splitBill := models.SplitBill{
			OrderID:   completedOrder.ID,
			Amount:    34500,
			CreatedAt: now.Add(-90 * time.Minute),
		}
		config.DB.Create(&splitBill)

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

		pendingItems := []models.OrderItem{
			{OrderID: pendingOrder.ID, MenuID: 2, Quantity: 1, UnitPrice: 32000, Subtotal: 32000, Notes: "No onion", Status: "cooking"},
		}
		config.DB.Create(&pendingItems)

		log.Println("✅ Data Orders, Payments, dan Split Bills berhasil disuntikkan!")
	}

	// Pastikan ada minimal 1 order di bulan berjalan supaya filter default di dashboard tidak kosong.
	var recentCompletedOrderCount int64
	currentMonthStart := time.Date(time.Now().Year(), time.Now().Month(), 1, 0, 0, 0, 0, time.Local)
	config.DB.Model(&models.Order{}).
		Where("created_at >= ? AND status = ?", currentMonthStart, "completed").
		Count(&recentCompletedOrderCount)
	if recentCompletedOrderCount == 0 {
		now := time.Now()
		var sampleMenus []models.Menu
		config.DB.Order("id ASC").Limit(2).Find(&sampleMenus)
		if len(sampleMenus) == 0 {
			log.Println("⚠️  Seed order bulan berjalan dilewati karena belum ada menu")
		} else {
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
	}
}
