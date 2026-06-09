package main

import (
	"bimaresto-backend/config"
	"bimaresto-backend/routes"
	"bimaresto-backend/seeders"
	"log"
	"os"

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
	seeders.RunSeeders()

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

