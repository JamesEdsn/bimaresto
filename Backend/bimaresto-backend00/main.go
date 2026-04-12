package main

import (
	"bimaresto-backend/config"
	"bimaresto-backend/routes"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("File .env tidak ditemukan, pakai environment variable sistem")
	}

	// Koneksi dan migrasi database
	config.ConnectDatabase()

	// Setup Fiber
	app := fiber.New(fiber.Config{
		AppName: "BimaResto API",
	})

	app.Use(logger.New())
	app.Use(cors.New())

	routes.SetupRoutes(app)

	// Start server
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Server jalan di http://localhost:%s", port)
	log.Fatal(app.Listen(":" + port))
}
