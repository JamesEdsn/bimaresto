package config

import (
	"bimaresto-backend/models"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Jakarta",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
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
}
