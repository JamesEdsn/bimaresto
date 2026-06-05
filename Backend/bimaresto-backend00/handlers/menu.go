package handlers

import (
	"log"
	"bimaresto-backend/services"
	"bimaresto-backend/utils"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type MenuHandler struct {
	service services.MenuService
}

func NewMenuHandler(service services.MenuService) *MenuHandler {
	return &MenuHandler{service}
}

func (h *MenuHandler) GetMenus(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	categoryID := c.Query("category_id", "")

	menus, totalPages, total, err := h.service.GetMenus(page, limit, search, categoryID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data menu")
	}

	return utils.PaginationResponse(c, "Berhasil mengambil daftar menu", menus, page, limit, total, totalPages)
}

func (h *MenuHandler) CreateMenu(c *fiber.Ctx) error {
	var body struct {
		CategoryID  int     `json:"category_id"`
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		IsAvailable bool    `json:"is_available"`
		Image       string  `json:"image"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	menu, err := h.service.CreateMenu(body.CategoryID, body.Name, body.Description, body.Price, body.IsAvailable, body.Image)
	if err != nil {
		// Menangkap error validasi dari service
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Menu berhasil dibuat", menu)
}

func (h *MenuHandler) GetMenuByID(c *fiber.Ctx) error {
	id := c.Params("id")
	menu, err := h.service.GetMenuByID(id)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "Menu tidak ditemukan")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil detail menu", menu)
}

func (h *MenuHandler) GetCategories(c *fiber.Ctx) error {
	categories, err := h.service.GetCategories()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data kategori")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil daftar kategori", categories)
}

func (h *MenuHandler) CreateCategory(c *fiber.Ctx) error {
	var body struct {
		Name string `json:"name"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	category, err := h.service.CreateCategory(body.Name)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Kategori berhasil dibuat", category)
}

func (h *MenuHandler) UpdateCategory(c *fiber.Ctx) error {
	var body struct {
		Name string `json:"name"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	category, err := h.service.UpdateCategory(c.Params("id"), body.Name)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Kategori berhasil diperbarui", category)
}

func (h *MenuHandler) DeleteCategory(c *fiber.Ctx) error {
	if err := h.service.DeleteCategory(c.Params("id")); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Kategori berhasil dihapus", nil)
}

func (h *MenuHandler) UpdateMenu(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		CategoryID  int     `json:"category_id"`
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		IsAvailable bool    `json:"is_available"`
		Image       string  `json:"image"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	log.Printf("API: UpdateMenu id=%s by request", id)

	menu, err := h.service.UpdateMenu(id, body.CategoryID, body.Name, body.Description, body.Price, body.IsAvailable, body.Image)
	if err != nil {
		if err.Error() == "menu tidak ditemukan" {
			return utils.ErrorResponse(c, fiber.StatusNotFound, err.Error())
		}
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Menu berhasil diperbarui", menu)
}

func (h *MenuHandler) DeleteMenu(c *fiber.Ctx) error {
	id := c.Params("id")
	force := c.Query("force", "false") == "true"
	log.Printf("API: DeleteMenu id=%s force=%v", id, force)
	if err := h.service.DeleteMenu(id, force); err != nil {
		// return bad request for validation/constraint errors
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Menu berhasil dihapus", nil)
}
