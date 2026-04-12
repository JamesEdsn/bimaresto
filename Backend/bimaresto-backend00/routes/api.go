package routes

import (
	"bimaresto-backend/config"
	"bimaresto-backend/handlers"
	"bimaresto-backend/middleware"
	"bimaresto-backend/repositories"
	"bimaresto-backend/services"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// 1. Inisialisasi Repositories
	authRepo := repositories.NewAuthRepository(config.DB)
	menuRepo := repositories.NewMenuRepository(config.DB)
	orderRepo := repositories.NewOrderRepository(config.DB)
	paymentRepo := repositories.NewPaymentRepository(config.DB)
	kitchenRepo := repositories.NewKitchenRepository(config.DB)
	tableRepo := repositories.NewTableRepository(config.DB)
	reportRepo := repositories.NewReportRepository(config.DB)

	// 2. Inisialisasi Services
	authService := services.NewAuthService(authRepo)
	menuService := services.NewMenuService(menuRepo)
	orderService := services.NewOrderService(orderRepo)
	paymentService := services.NewPaymentService(paymentRepo)
	kitchenService := services.NewKitchenService(kitchenRepo)
	tableService := services.NewTableService(tableRepo)
	reportService := services.NewReportService(reportRepo)

	// 3. Inisialisasi Handlers
	authHandler := handlers.NewAuthHandler(authService)
	menuHandler := handlers.NewMenuHandler(menuService)
	orderHandler := handlers.NewOrderHandler(orderService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	kitchenHandler := handlers.NewKitchenHandler(kitchenService)
	tableHandler := handlers.NewTableHandler(tableService)
	reportHandler := handlers.NewReportHandler(reportService)

	// 4. Mendaftarkan Routes
	api := app.Group("/api")

	// Public
	api.Post("/login", authHandler.Login)
	api.Post("/refresh", authHandler.RefreshToken)

	// Admin (Role: 1)
	api.Post("/register", middleware.RequireRoles(1), authHandler.RegisterStaff)
	api.Post("/logout", middleware.RequireAuth(), authHandler.Logout)

	// Authenticated
	api.Get("/menus", middleware.RequireAuth(), menuHandler.GetMenus)
	api.Get("/menus/:id", middleware.RequireAuth(), menuHandler.GetMenuByID)
	api.Get("/categories", middleware.RequireAuth(), menuHandler.GetCategories)
	api.Get("/tables", middleware.RequireAuth(), tableHandler.GetTables)

	// Kasir + Manager + Admin (Role: 1, 2, 4)
	api.Post("/orders", middleware.RequireRoles(1, 2, 4), orderHandler.CreateOrder)
	api.Get("/orders/:id/bill", middleware.RequireRoles(1, 2, 4), paymentHandler.GenerateBill)
	api.Post("/payments", middleware.RequireRoles(1, 2, 4), paymentHandler.ProcessPayment)
	api.Patch("/tables/:id/status", middleware.RequireRoles(1, 2, 4), tableHandler.UpdateTableStatus)

	// Kitchen + Admin (Role: 1, 3)
	api.Get("/kitchen/orders", middleware.RequireRoles(1, 3), kitchenHandler.GetKitchenOrders)
	api.Patch("/kitchen/items/:id/status", middleware.RequireRoles(1, 3), kitchenHandler.UpdateItemStatus)

	// Manager + Admin (Role: 1, 4)
	api.Post("/menus", middleware.RequireRoles(1, 4), menuHandler.CreateMenu)
	api.Put("/menus/:id", middleware.RequireRoles(1, 4), menuHandler.UpdateMenu)
	api.Delete("/menus/:id", middleware.RequireRoles(1, 4), menuHandler.DeleteMenu)
	api.Get("/reports/daily", middleware.RequireRoles(1, 4), reportHandler.GetDailyReport)
	api.Post("/sync", middleware.RequireRoles(1, 4), orderHandler.SyncOfflineData)
}
