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
	promoRepo := repositories.NewPromoRepository(config.DB)
	splitBillRepo := repositories.NewSplitBillRepository(config.DB)

	// 2. Inisialisasi Services
	authService := services.NewAuthService(authRepo)
	menuService := services.NewMenuService(menuRepo)
	orderService := services.NewOrderService(orderRepo)
	paymentService := services.NewPaymentService(paymentRepo)
	kitchenService := services.NewKitchenService(kitchenRepo)
	tableService := services.NewTableService(tableRepo)
	reportService := services.NewReportService(reportRepo)
	promoService := services.NewPromoService(promoRepo)
	splitBillService := services.NewSplitBillService(splitBillRepo)

	// 3. Inisialisasi Handlers
	authHandler := handlers.NewAuthHandler(authService)
	menuHandler := handlers.NewMenuHandler(menuService)
	orderHandler := handlers.NewOrderHandler(orderService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	kitchenHandler := handlers.NewKitchenHandler(kitchenService)
	tableHandler := handlers.NewTableHandler(tableService)
	reportHandler := handlers.NewReportHandler(reportService)
	promoHandler := handlers.NewPromoHandler(promoService)
	splitBillHandler := handlers.NewSplitBillHandler(splitBillService)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Welcome to BimaResto API v2",
			"status":  "Server is running gracefully 🚀",
		})
	})

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
	api.Get("/orders", middleware.RequireAuth(), orderHandler.GetOrders)
	api.Get("/payments", middleware.RequireAuth(), paymentHandler.GetPayments)
	api.Get("/splitbills", middleware.RequireAuth(), splitBillHandler.GetSplitBills)
	api.Delete("/payments/:id", middleware.RequireRoles(1, 4), paymentHandler.DeletePayment)
	api.Get("/promos", middleware.RequireAuth(), promoHandler.GetPromos)
	api.Get("/roles", middleware.RequireRoles(1, 4), authHandler.GetRoles)
	api.Get("/staff", middleware.RequireRoles(1, 4), authHandler.GetStaff)

	// Kasir + Manager + Admin (Role: 1, 2, 4)
	api.Post("/orders", middleware.RequireRoles(1, 2, 4), orderHandler.CreateOrder)
	api.Patch("/orders/:id/status", middleware.RequireRoles(1, 2, 4), orderHandler.UpdateStatus)
	api.Post("/orders/:id/merge", middleware.RequireAuth(), orderHandler.MergeOrders)
	api.Post("/orders/:id/split-table", middleware.RequireAuth(), orderHandler.SplitTable)
	api.Put("/orders/:id/move-table", middleware.RequireAuth(), orderHandler.MoveTable)
	api.Delete("/orders/:id", middleware.RequireAuth(), orderHandler.CancelOrder)
	api.Delete("/orders/:id/items/:item_id", middleware.RequireAuth(), orderHandler.CancelOrderItem)
	api.Post("/orders/:id/items", middleware.RequireAuth(), orderHandler.AddItems)
	api.Get("/orders/:id/bill", middleware.RequireRoles(1, 2, 4), paymentHandler.GenerateBill)
	api.Post("/payments", middleware.RequireRoles(1, 2, 4), paymentHandler.ProcessPayment)
	api.Post("/payments/items", middleware.RequireRoles(1, 2, 4), paymentHandler.ProcessItemPayment)
	api.Delete("/splitbills/:id", middleware.RequireRoles(1, 4), splitBillHandler.DeleteSplitBill)
	api.Post("/tables", middleware.RequireRoles(1, 4), tableHandler.CreateTable)
	api.Put("/tables/:id", middleware.RequireRoles(1, 4), tableHandler.UpdateTable)
	api.Patch("/tables/:id/status", middleware.RequireRoles(1, 2, 4), tableHandler.UpdateTableStatus)
	api.Delete("/tables/:id", middleware.RequireRoles(1, 4), tableHandler.DeleteTable)

	// Kitchen + Admin (Role: 1, 3)
	api.Get("/kitchen/orders", middleware.RequireRoles(1, 3), kitchenHandler.GetKitchenOrders)
	api.Patch("/kitchen/items/:id/status", middleware.RequireRoles(1, 3), kitchenHandler.UpdateItemStatus)

	// Manager + Admin (Role: 1, 4)
	api.Post("/menus", middleware.RequireRoles(1, 4), menuHandler.CreateMenu)
	api.Put("/menus/:id", middleware.RequireRoles(1, 4), menuHandler.UpdateMenu)
	api.Delete("/menus/:id", middleware.RequireRoles(1, 4), menuHandler.DeleteMenu)
	api.Post("/categories", middleware.RequireRoles(1, 4), menuHandler.CreateCategory)
	api.Put("/categories/:id", middleware.RequireRoles(1, 4), menuHandler.UpdateCategory)
	api.Delete("/categories/:id", middleware.RequireRoles(1, 4), menuHandler.DeleteCategory)
	api.Post("/staff", middleware.RequireRoles(1, 4), authHandler.CreateStaff)
	api.Put("/staff/:id", middleware.RequireRoles(1, 4), authHandler.UpdateStaff)
	api.Delete("/staff/:id", middleware.RequireRoles(1, 4), authHandler.DeleteStaff)
	api.Post("/promos", middleware.RequireRoles(1, 4), promoHandler.CreatePromo)
	api.Put("/promos/:id", middleware.RequireRoles(1, 4), promoHandler.UpdatePromo)
	api.Delete("/promos/:id", middleware.RequireRoles(1, 4), promoHandler.DeletePromo)
	api.Get("/reports/daily", middleware.RequireRoles(1, 4), reportHandler.GetDailyReport)
	api.Post("/sync", middleware.RequireRoles(1, 4), orderHandler.SyncOfflineData)
}
