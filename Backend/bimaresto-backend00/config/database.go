package config

import (
	"bimaresto-backend/models"
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=require TimeZone=Asia/Jakarta",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		
	)

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Gagal koneksi ke database: ", err)
	}

	log.Println("Database terhubung")
	DB = db

	migrate()
	seed()
}

func migrate() {
	err := DB.AutoMigrate(
		&models.Role{},
		&models.Staff{},
		&models.RefreshToken{},
		&models.Category{},
		&models.Menu{},
		&models.Table{},
		&models.Order{},
		&models.OrderItem{},
		&models.Payment{},
		&models.SplitBill{},
		&models.Promo{},
	)
	if err != nil {
		log.Fatal("Gagal migrasi: ", err)
	}
	log.Println("Migrasi selesai")
}

func seed() {
	roles := []models.Role{
		{ID: 1, Name: "admin"},
		{ID: 2, Name: "kasir"},
		{ID: 3, Name: "kitchen"},
		{ID: 4, Name: "manager"},
	}
	for _, r := range roles {
		DB.FirstOrCreate(&r, models.Role{ID: r.ID})
	}

	// Hash password for test staff
	adminHash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	kasirHash, _ := bcrypt.GenerateFromPassword([]byte("kasir123"), bcrypt.DefaultCost)

	// Seed staff with properly hashed passwords
	staff := []models.Staff{
		{
			ID:           1,
			FullName:     "John Admin",
			Username:     "admin",
			Email:        "admin@bimaresto.com",
			Phone:        "+62 812-3456-7890",
			PasswordHash: string(adminHash),
			RoleID:       1,
			IsActive:     true,
		},
		{
			ID:           2,
			FullName:     "Mike Cashier",
			Username:     "mikec",
			Email:        "mike.cashier@bimaresto.com",
			Phone:        "+62 814-5678-9012",
			PasswordHash: string(kasirHash),
			RoleID:       2,
			IsActive:     true,
		},
	}
	for _, s := range staff {
		var existing models.Staff
		if err := DB.First(&existing, s.ID).Error; err == nil {
			// Update important fields (ensure password hash uses bcrypt from Go)
			existing.FullName = s.FullName
			existing.Username = s.Username
			existing.Email = s.Email
			existing.Phone = s.Phone
			existing.PasswordHash = s.PasswordHash
			existing.RoleID = s.RoleID
			existing.IsActive = s.IsActive
			_ = DB.Save(&existing)
		} else {
			DB.Create(&s)
		}
	}

	log.Println("Seeding selesai")
}
